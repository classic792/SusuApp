package com.sca.savingsapp.service;

import com.sca.savingsapp.dto.LoanRequest;
import com.sca.savingsapp.dto.LoanResponse;
import com.sca.savingsapp.entity.Loan;
import com.sca.savingsapp.entity.LoanStatus;
import com.sca.savingsapp.exception.BadRequestException;
import com.sca.savingsapp.exception.ResourceNotFoundException;
import com.sca.savingsapp.repository.AccountRepository;
import com.sca.savingsapp.repository.ClientRepository;
import com.sca.savingsapp.repository.LoanRepository;
import com.sca.savingsapp.repository.ProfileRepository;
import com.sca.savingsapp.entity.Profile;
import com.sca.savingsapp.repository.PhoneNumberRepository;
import com.sca.savingsapp.entity.PhoneNumber;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class LoanService {

    private final LoanRepository loanRepository;
    private final AccountRepository accountRepository;
    private final ClientRepository clientRepository;
    private final ProfileRepository profileRepository;
    private final SmsService smsService;
    private final PhoneNumberRepository phoneNumberRepository;
    private final FaceVerificationService faceVerificationService;

    public LoanService(LoanRepository loanRepository,
                       AccountRepository accountRepository,
                       ClientRepository clientRepository,
                       ProfileRepository profileRepository,
                       SmsService smsService,
                       PhoneNumberRepository phoneNumberRepository,
                       FaceVerificationService faceVerificationService) {
        this.loanRepository = loanRepository;
        this.accountRepository = accountRepository;
        this.clientRepository = clientRepository;
        this.profileRepository = profileRepository;
        this.smsService = smsService;
        this.phoneNumberRepository = phoneNumberRepository;
        this.faceVerificationService = faceVerificationService;
    }

    /**
     * Creates a new loan for a client.
     * Calculates total amount and sets initial balance_remaining.
     */
    @Transactional
    public LoanResponse createLoan(LoanRequest request, Integer agentId) {
        // 1. Validate client exists
        clientRepository.findById(request.getClientId())
                .orElseThrow(() -> new ResourceNotFoundException("Client not found"));

        accountRepository.findById(request.getAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        // 3. Face Verification Logic
        com.sca.savingsapp.entity.Client client = clientRepository.findById(request.getClientId()).orElse(null);
        faceVerificationService.validateFace(request.getFaceSignature(), client);

        // 4. Calculate total amount: principal + (principal × interestRate / 100)
        BigDecimal interest = request.getPrincipalAmount()
                .multiply(request.getInterestRate())
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal totalAmount = request.getPrincipalAmount().add(interest);

        // 4. Calculate installment amount: totalAmount / duration
        BigDecimal installmentAmount = totalAmount
                .divide(BigDecimal.valueOf(request.getDuration()), 2, RoundingMode.HALF_UP);

        // 5. Build and save the loan
        Loan loan = new Loan();
        
        // Fetch account number for reference
        String accountNumber = accountRepository.findById(request.getAccountId())
                .map(a -> a.getAccountNumber())
                .orElse("UNKNOWN");
        
        // Count existing loans for this client
        long loanCount = loanRepository.countByClientId(request.getClientId());
        String loanRef = String.format("LN-%s-%d", accountNumber, loanCount + 1);
        
        loan.setLoanReference(loanRef);
        loan.setClientId(request.getClientId());
        loan.setAccountId(request.getAccountId());
        loan.setAgentId(agentId);
        loan.setPrincipalAmount(request.getPrincipalAmount());
        loan.setInterestRate(request.getInterestRate());
        loan.setTotalAmount(totalAmount);
        loan.setBalanceRemaining(totalAmount); // Initially balance_remaining = total_amount
        loan.setInstallmentAmount(installmentAmount);
        loan.setDuration(request.getDuration());
        loan.setDisbursementDate(request.getDisbursementDate() != null
                ? request.getDisbursementDate() : LocalDateTime.now());
        loan.setDueDate(request.getDueDate());
        loan.setStatus(LoanStatus.pending);

        Loan savedLoan = loanRepository.save(loan);
        
        // Notify client
        sendSmsConfirmation(savedLoan);

        return toResponse(savedLoan);
    }

    private void sendSmsConfirmation(Loan loan) {
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

                String message = String.format("CollectorPro Alert: Your loan application of GH₵ %s is received and is PENDING approval. Ref: %s",
                        loan.getPrincipalAmount(),
                        loan.getLoanReference());
                smsService.sendSms(to, message);
            }
        } catch (Exception e) {
            System.err.println("Failed to send Loan Application SMS: " + e.getMessage());
        }
    }

    /**
     * Retrieves a single loan by its ID.
     */
    public LoanResponse getLoanById(Integer loanId) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found"));
        return toResponse(loan);
    }

    /**
     * Returns all loans belonging to a client.
     */
    public List<LoanResponse> getLoansByClient(Integer clientId) {
        return loanRepository.findByClientId(clientId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Returns all currently active loans.
     */
    public List<LoanResponse> getActiveLoans() {
        return loanRepository.findByStatus(LoanStatus.active).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Returns all pending or declined loans submitted by a specific agent.
     */
    public List<LoanResponse> getPendingLoansByAgent(Integer agentId) {
        return loanRepository.findByAgentId(agentId).stream()
                .filter(l -> l.getStatus() == LoanStatus.pending || l.getStatus() == LoanStatus.declined)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Returns all active loans managed by a specific agent.
     */
    public List<LoanResponse> getActiveLoansByAgent(Integer agentId) {
        return loanRepository.findByStatusAndAgentId(LoanStatus.active, agentId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // Maps a Loan entity to a LoanResponse DTO
    private LoanResponse toResponse(Loan loan) {
        LoanResponse response = new LoanResponse();
        response.setId(loan.getId());
        response.setLoanReference(loan.getLoanReference());
        response.setClientId(loan.getClientId());
        response.setAccountId(loan.getAccountId());
        response.setAgentId(loan.getAgentId());
        response.setPrincipalAmount(loan.getPrincipalAmount());
        response.setInterestRate(loan.getInterestRate());
        response.setTotalAmount(loan.getTotalAmount());
        response.setBalanceRemaining(loan.getBalanceRemaining());
        response.setInstallmentAmount(loan.getInstallmentAmount());
        response.setDuration(loan.getDuration());
        response.setDisbursementDate(loan.getDisbursementDate());
        response.setDueDate(loan.getDueDate());
        response.setStatus(loan.getStatus());
        response.setCreatedAt(loan.getCreatedAt());

        // Fetch Names
        profileRepository.findById(loan.getClientId()).ifPresent(p -> {
            response.setClientName(p.getFirstName() + " " + p.getLastName());
        });

        accountRepository.findById(loan.getAccountId()).ifPresent(a -> {
            response.setAccountNumber(a.getAccountNumber());
        });

        return response;
    }
}
