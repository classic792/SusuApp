package com.sca.savingsapp.service;

import com.sca.savingsapp.dto.RepaymentRequest;
import com.sca.savingsapp.dto.RepaymentResponse;
import com.sca.savingsapp.entity.Loan;
import com.sca.savingsapp.entity.LoanStatus;
import com.sca.savingsapp.entity.Repayment;
import com.sca.savingsapp.entity.Transaction;
import com.sca.savingsapp.entity.TransactionEntryType;
import com.sca.savingsapp.exception.BadRequestException;
import com.sca.savingsapp.exception.ResourceNotFoundException;
import com.sca.savingsapp.repository.LoanRepository;
import com.sca.savingsapp.repository.RepaymentRepository;
import com.sca.savingsapp.repository.TransactionRepository;
import com.sca.savingsapp.repository.AccountRepository;
import com.sca.savingsapp.repository.ClientRepository;
import com.sca.savingsapp.repository.PhoneNumberRepository;
import com.sca.savingsapp.entity.PhoneNumber;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RepaymentService {

    private final RepaymentRepository repaymentRepository;
    private final LoanRepository loanRepository;
    private final TransactionRepository transactionRepository;
    private final SmsService smsService;
    private final PhoneNumberRepository phoneNumberRepository;
    private final AccountRepository accountRepository;
    private final FaceVerificationService faceVerificationService;
    private final ClientRepository clientRepository;
    private final com.sca.savingsapp.repository.AgentLimitRepository agentLimitRepository;
    private final com.sca.savingsapp.repository.SystemSettingRepository systemSettingRepository;
    private final com.sca.savingsapp.repository.AgentFreezeLogRepository agentFreezeLogRepository;

    public RepaymentService(RepaymentRepository repaymentRepository,
                            LoanRepository loanRepository,
                            TransactionRepository transactionRepository,
                            SmsService smsService,
                            PhoneNumberRepository phoneNumberRepository,
                            AccountRepository accountRepository,
                            FaceVerificationService faceVerificationService,
                            ClientRepository clientRepository,
                            com.sca.savingsapp.repository.AgentLimitRepository agentLimitRepository,
                            com.sca.savingsapp.repository.SystemSettingRepository systemSettingRepository,
                            com.sca.savingsapp.repository.AgentFreezeLogRepository agentFreezeLogRepository) {
        this.repaymentRepository = repaymentRepository;
        this.loanRepository = loanRepository;
        this.transactionRepository = transactionRepository;
        this.smsService = smsService;
        this.phoneNumberRepository = phoneNumberRepository;
        this.accountRepository = accountRepository;
        this.faceVerificationService = faceVerificationService;
        this.clientRepository = clientRepository;
        this.agentLimitRepository = agentLimitRepository;
        this.systemSettingRepository = systemSettingRepository;
        this.agentFreezeLogRepository = agentFreezeLogRepository;
    }

    /**
     * Processes a loan repayment.
     * Validates the loan, creates a Transaction record, saves a Repayment, and updates the loan balance.
     */
    @Transactional
    public RepaymentResponse createRepayment(RepaymentRequest request, Integer agentId) {
        // 1. Verify loan exists
        Loan loan = loanRepository.findById(request.getLoanId())
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found"));

        // 2. Verify loan is ACTIVE
        if (loan.getStatus() != LoanStatus.active) {
            throw new BadRequestException("Repayment can only be made on an ACTIVE loan. Current status: " + loan.getStatus());
        }

        // 3. Validate amount > 0 (also enforced by @Positive on DTO)
        if (request.getAmountPaid().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Repayment amount must be greater than zero");
        }

        // 4. Validate amount does not exceed remaining balance
        if (request.getAmountPaid().compareTo(loan.getBalanceRemaining()) > 0) {
            throw new BadRequestException(
                    "Repayment amount (" + request.getAmountPaid() + ") exceeds remaining balance (" + loan.getBalanceRemaining() + ")");
        }

        // 5. Validate idempotency key is unique
        if (transactionRepository.existsByIdempotencyKey(request.getIdempotencyKey())) {
            throw new BadRequestException("A repayment with this reference already exists");
        }

        // 6. Limit check: ensure transaction doesn't exceed daily limit
        BigDecimal currentCollected = getDailyCollected(agentId);
        BigDecimal limit = getConsolidatedDailyLimit(agentId);
        BigDecimal remaining = limit.subtract(currentCollected);

        if (request.getAmountPaid().compareTo(remaining) > 0) {
            throw new BadRequestException(
                String.format("Repayment exceeds your daily limit. You can only collect up to GH₵%s more today.", remaining.setScale(2, java.math.RoundingMode.HALF_UP))
            );
        }

        // 7. Face Verification Logic
        com.sca.savingsapp.entity.Client client = clientRepository.findById(loan.getClientId()).orElse(null);
        faceVerificationService.validateFace(request.getFaceSignature(), client);

        // 8. Create a CREDIT transaction to track the money movement
        Transaction transaction = new Transaction();
        transaction.setAccountId(loan.getAccountId()); // Money collected against the loan's account
        transaction.setAgentId(agentId);               // Agent collecting the repayment
        transaction.setAmount(request.getAmountPaid());
        transaction.setEntryType(TransactionEntryType.credit); // credit shows as Green + on frontend
        transaction.setIdempotencyKey(request.getIdempotencyKey());
        transaction.setFaceSignature(request.getFaceSignature());
        
        // Fix for midnight issue: if the date provided is today, use current LocalDateTime.now()
        // to ensure the time is recorded accurately.
        LocalDateTime actualRepaymentTime = request.getRepaymentDate();
        if (actualRepaymentTime != null) {
            // If it's midnight, it's likely just a date selection
            if (actualRepaymentTime.getHour() == 0 && actualRepaymentTime.getMinute() == 0) {
                actualRepaymentTime = LocalDateTime.now();
            }
        } else {
            actualRepaymentTime = LocalDateTime.now();
        }
        
        transaction.setTransactionDate(actualRepaymentTime);
        transaction.setIsOfflineProcessed(false);
        
        if (request.getFaceSignature() != null && !request.getFaceSignature().isEmpty()) {
            transaction.setVerificationMethod(com.sca.savingsapp.entity.VerificationMethod.api);
            transaction.setVerificationStatus(com.sca.savingsapp.entity.VerificationStatus.verified);
        }

        Transaction savedTransaction = transactionRepository.save(transaction);

        // 7. Save the repayment record linked to the transaction
        Repayment repayment = new Repayment();
        repayment.setLoanId(loan.getId());
        repayment.setTransactionId(savedTransaction.getId());
        repayment.setAgentId(agentId);
        repayment.setAmountPaid(request.getAmountPaid());
        repayment.setRepaymentDate(actualRepaymentTime);

        Repayment savedRepayment = repaymentRepository.save(repayment);

        // 8. Deduct amount from loan's balance_remaining
        BigDecimal newBalance = loan.getBalanceRemaining().subtract(request.getAmountPaid());
        loan.setBalanceRemaining(newBalance);

        // 9. If fully paid, mark loan as PAID
        if (newBalance.compareTo(BigDecimal.ZERO) == 0) {
            loan.setStatus(LoanStatus.paid);
        }

        loanRepository.save(loan);

        // Notify client
        sendSmsConfirmation(loan, savedTransaction);

        RepaymentResponse response = toResponse(savedRepayment);
        response.setBalanceRemaining(loan.getBalanceRemaining());
        return response;
    }

    private void sendSmsConfirmation(Loan loan, Transaction transaction) {
        try {
            List<PhoneNumber> numbers = phoneNumberRepository.findByProfileId(loan.getClientId());
            if (!numbers.isEmpty()) {
                String rawNumber = numbers.get(0).getPhoneNumber();
                String to = rawNumber;
                if (rawNumber.startsWith("0")) {
                    to = "+233" + rawNumber.substring(1);
                } else if (!rawNumber.startsWith("+")) {
                    to = "+233" + rawNumber;
                }

                String message = String.format("CollectorPro Alert: Loan Repayment of GH₵%s successful for Loan Ref: %s. Remaining Balance: GH₵%s. Ref: %s",
                        transaction.getAmount(),
                        loan.getLoanReference(),
                        loan.getBalanceRemaining(),
                        transaction.getIdempotencyKey());
                smsService.sendSms(to, message);
            }
        } catch (Exception e) {
            System.err.println("Failed to send Repayment SMS: " + e.getMessage());
        }
    }

    /**
     * Returns all repayments made against a specific loan.
     */
    public List<RepaymentResponse> getRepaymentsByLoan(Integer loanId) {
        // Verify loan exists before querying repayments
        loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found"));
        return repaymentRepository.findByLoanId(loanId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Returns the total amount repaid for a loan so far.
     */
    public BigDecimal getTotalRepaid(Integer loanId) {
        // Verify loan exists before querying
        loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found"));
        return repaymentRepository.sumAmountPaidByLoanId(loanId);
    }

    private BigDecimal getDailyCollected(Integer agentId) {
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime lastUnfrozenAt = agentFreezeLogRepository.findFirstByAgentIdAndStatusOrderByTimestampDesc(agentId, com.sca.savingsapp.entity.FreezeStatus.UNFROZEN)
                .map(com.sca.savingsapp.entity.AgentFreezeLog::getTimestamp)
                .orElse(startOfDay);
        LocalDateTime since = lastUnfrozenAt.isAfter(startOfDay) ? lastUnfrozenAt : startOfDay;
        BigDecimal collected = transactionRepository.sumCollectionsByAgentSince(agentId, com.sca.savingsapp.entity.TransactionEntryType.credit, since);
        return collected != null ? collected : BigDecimal.ZERO;
    }

    private BigDecimal getConsolidatedDailyLimit(Integer agentId) {
        return agentLimitRepository.findByAgentId(agentId)
                .map(l -> l.getDailyLimit())
                .orElseGet(() -> {
                    return systemSettingRepository.findBySettingKey("GLOBAL_DAILY_LIMIT")
                            .map(s -> new BigDecimal(s.getSettingValue()))
                            .orElse(new BigDecimal("5000.00"));
                });
    }

    // Maps a Repayment entity to a RepaymentResponse DTO
    private RepaymentResponse toResponse(Repayment repayment) {
        RepaymentResponse response = new RepaymentResponse();
        response.setId(repayment.getId());
        response.setLoanId(repayment.getLoanId());
        response.setTransactionId(repayment.getTransactionId());
        response.setAgentId(repayment.getAgentId());
        response.setAmountPaid(repayment.getAmountPaid());
        response.setRepaymentDate(repayment.getRepaymentDate());
        response.setCreatedAt(repayment.getCreatedAt());
        return response;
    }
}
