package com.sca.savingsapp.service;

import com.sca.savingsapp.dto.TransactionRequest;
import com.sca.savingsapp.dto.TransactionSyncRequest;
import com.sca.savingsapp.dto.TransactionResponse;
import com.sca.savingsapp.entity.Account;
import com.sca.savingsapp.entity.Agent;
import com.sca.savingsapp.entity.PhoneNumber;
import com.sca.savingsapp.entity.Transaction;
import com.sca.savingsapp.entity.TransactionEntryType;
import com.sca.savingsapp.entity.Profile;
import com.sca.savingsapp.repository.AccountRepository;
import com.sca.savingsapp.repository.AgentRepository;
import com.sca.savingsapp.repository.PhoneNumberRepository;
import com.sca.savingsapp.repository.ProfileRepository;
import com.sca.savingsapp.repository.TransactionRepository;
import com.sca.savingsapp.exception.BadRequestException;
import com.sca.savingsapp.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final AgentRepository agentRepository;
    private final PhoneNumberRepository phoneNumberRepository;
    private final ProfileRepository profileRepository;
    private final SmsService smsService;
    private final com.sca.savingsapp.repository.AgentFreezeLogRepository agentFreezeLogRepository;
    private final com.sca.savingsapp.repository.RepaymentRepository repaymentRepository;
    private final com.sca.savingsapp.repository.AgentLimitRepository agentLimitRepository;
    private final com.sca.savingsapp.repository.SystemSettingRepository systemSettingRepository;
    private final com.sca.savingsapp.repository.ClientRepository clientRepository;
    private final FaceVerificationService faceVerificationService;

    public TransactionService(TransactionRepository transactionRepository,
                              AccountRepository accountRepository,
                              AgentRepository agentRepository,
                              PhoneNumberRepository phoneNumberRepository,
                              ProfileRepository profileRepository,
                              SmsService smsService,
                              com.sca.savingsapp.repository.AgentFreezeLogRepository agentFreezeLogRepository,
                              com.sca.savingsapp.repository.RepaymentRepository repaymentRepository,
                              com.sca.savingsapp.repository.AgentLimitRepository agentLimitRepository,
                              com.sca.savingsapp.repository.SystemSettingRepository systemSettingRepository,
                              com.sca.savingsapp.repository.ClientRepository clientRepository,
                              FaceVerificationService faceVerificationService) {
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
        this.agentRepository = agentRepository;
        this.phoneNumberRepository = phoneNumberRepository;
        this.profileRepository = profileRepository;
        this.smsService = smsService;
        this.agentFreezeLogRepository = agentFreezeLogRepository;
        this.repaymentRepository = repaymentRepository;
        this.agentLimitRepository = agentLimitRepository;
        this.systemSettingRepository = systemSettingRepository;
        this.clientRepository = clientRepository;
        this.faceVerificationService = faceVerificationService;
    }

    /**
     * Processes a single transaction with idempotency and security checks.
     */
    @Transactional
    public Transaction processTransaction(TransactionRequest request, Integer agentId) {
        // 1. Idempotency check: check if already processed
        if (transactionRepository.existsByIdempotencyKey(request.getIdempotencyKey())) {
            throw new BadRequestException("Transaction with this reference already exists");
        }

        // 2. Security check: check if agent is frozen
        Agent agent = agentRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found"));
        agentFreezeLogRepository.findFirstByAgentIdOrderByTimestampDesc(agentId).ifPresent(log -> {
            if (log.getStatus() == com.sca.savingsapp.entity.FreezeStatus.FROZEN) {
                throw new BadRequestException("Agent is frozen: " + log.getReason());
            }
        });

        // 3. Validation: amount > 0
        if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Transaction amount must be greater than zero");
        }

        // 4. Determine actual entry type (swap frontend labels to database standards)
        // The frontend incorrectly sends 'debit' for deposits and 'credit' for withdrawals.
        // We swap them here so they align with proper accounting and the database.
        TransactionEntryType actualType = request.getEntryType() == TransactionEntryType.debit 
                ? TransactionEntryType.credit // Convert frontend Deposit to actual Credit
                : TransactionEntryType.debit; // Convert frontend Withdrawal to actual Debit

        // 5. Limit check: ensure transaction doesn't exceed daily limit
        if (actualType == TransactionEntryType.credit) {
            BigDecimal currentCollected = getDailyCollected(agentId);
            BigDecimal limit = getConsolidatedDailyLimit(agentId);
            BigDecimal remaining = limit.subtract(currentCollected);

            if (request.getAmount().compareTo(remaining) > 0) {
                throw new BadRequestException(
                    String.format("Transaction exceeds your daily limit. You can only collect up to GH %s more today.", remaining.setScale(2, java.math.RoundingMode.HALF_UP))
                );
            }
        }

        // 6. Update Account balance
        Account account = accountRepository.findById(request.getAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        // 6. Face Verification Logic
        com.sca.savingsapp.entity.Client client = clientRepository.findById(account.getClientId()).orElse(null);
        faceVerificationService.validateFace(request.getFaceSignature(), client);

        // 7. Update Account balance
        String txStatus = "COMPLETED";
        if (actualType == TransactionEntryType.credit) {
            account.setBalance(account.getBalance().add(request.getAmount()));
            accountRepository.save(account);
        } else if (actualType == TransactionEntryType.debit) {
            // Check balance but don't deduct yet. Set to pending approval.
            if (account.getBalance().compareTo(request.getAmount()) < 0) {
                throw new BadRequestException("Insufficient balance for withdrawal");
            }
            txStatus = "PENDING";
        }

        // 8. Save the transaction
        Transaction transaction = new Transaction();
        transaction.setAccountId(request.getAccountId());
        transaction.setAgentId(agentId);
        transaction.setAmount(request.getAmount());
        transaction.setEntryType(actualType);
        transaction.setIdempotencyKey(request.getIdempotencyKey());
        transaction.setFaceSignature(request.getFaceSignature());
        transaction.setTransactionDate(request.getTransactionDate() != null ? 
                request.getTransactionDate() : LocalDateTime.now());
        transaction.setIsOfflineProcessed(request.getTransactionDate() != null);
        transaction.setStatus(txStatus);
        
        if (request.getFaceSignature() != null && !request.getFaceSignature().isEmpty()) {
            transaction.setVerificationMethod(com.sca.savingsapp.entity.VerificationMethod.api);
            transaction.setVerificationStatus(com.sca.savingsapp.entity.VerificationStatus.verified);
        }
        
        Transaction savedTransaction = transactionRepository.save(transaction);

        // 6. Check Daily Limit and Freeze if necessary
        if (actualType == TransactionEntryType.credit) {
            checkAndTriggerDailyLimitFreeze(agentId);
        }

        // 7. Send SMS confirmation to client
        sendSmsConfirmation(account, savedTransaction);

        return savedTransaction;
    }

    private void checkAndTriggerDailyLimitFreeze(Integer agentId) {
        BigDecimal dailyCollected = getDailyCollected(agentId);
        BigDecimal limit = getConsolidatedDailyLimit(agentId);

        if (dailyCollected.compareTo(limit) >= 0) {
            Profile agentProfile = profileRepository.findById(agentId).orElse(null);
            Profile systemAdmin = profileRepository.findById(1).orElse(null); // System user

            if (agentProfile != null) {
                com.sca.savingsapp.entity.AgentFreezeLog log = new com.sca.savingsapp.entity.AgentFreezeLog();
                log.setAgent(agentProfile);
                log.setFrozenBy(systemAdmin);
                log.setReason("Daily transaction limit of GH₵" + limit + " reached. System Auto-Freeze.");
                log.setStatus(com.sca.savingsapp.entity.FreezeStatus.FROZEN);
                agentFreezeLogRepository.save(log);
            }
        }
    }

    private BigDecimal getDailyCollected(Integer agentId) {
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime lastUnfrozenAt = agentFreezeLogRepository.findFirstByAgentIdAndStatusOrderByTimestampDesc(agentId, com.sca.savingsapp.entity.FreezeStatus.UNFROZEN)
                .map(com.sca.savingsapp.entity.AgentFreezeLog::getTimestamp)
                .orElse(startOfDay);
        LocalDateTime since = lastUnfrozenAt.isAfter(startOfDay) ? lastUnfrozenAt : startOfDay;
        BigDecimal collected = transactionRepository.sumCollectionsByAgentSince(agentId, TransactionEntryType.credit, since);
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

    /**
     * Processes multiple transactions synced from offline.
     */
    @Transactional
    public List<Transaction> syncTransactions(TransactionSyncRequest request, Integer agentId) {
        List<Transaction> processed = new ArrayList<>();
        for (TransactionRequest tr : request.getTransactions()) {
            try {
                // We skip already processed ones instead of failing the whole batch
                if (!transactionRepository.existsByIdempotencyKey(tr.getIdempotencyKey())) {
                    processed.add(processTransaction(tr, agentId));
                }
            } catch (Exception e) {
                // Log error for specific transaction and continue with others
                System.err.println("Failed to process sync transaction " + tr.getIdempotencyKey() + ": " + e.getMessage());
            }
        }
        return processed;
    }

    /**
     * Retrieves the enriched transaction history for a specific agent.
     */
    public List<TransactionResponse> getAgentTransactionHistory(Integer agentId) {
        return transactionRepository.findByAgentIdOrderByTransactionDateDesc(agentId).stream()
                .map(this::toResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * Retrieves the enriched transaction history for a specific account.
     */
    public List<TransactionResponse> getAccountTransactionHistory(Integer accountId) {
        return transactionRepository.findByAccountIdOrderByTransactionDateDesc(accountId).stream()
                .map(this::toResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    public TransactionResponse toResponse(Transaction transaction) {
        TransactionResponse response = new TransactionResponse();
        response.setId(transaction.getId());
        response.setTransactionDate(transaction.getTransactionDate());
        response.setAccountId(transaction.getAccountId());
        response.setAgentId(transaction.getAgentId());
        response.setAmount(transaction.getAmount());
        response.setEntryType(transaction.getEntryType());
        response.setIdempotencyKey(transaction.getIdempotencyKey());
        response.setStatus(transaction.getStatus());

        if (transaction.getId() == null) return response;

        // Fetch Agent Name
        if (transaction.getAgentId() != null) {
            profileRepository.findById(transaction.getAgentId()).ifPresent(profile -> {
                response.setAgentName(profile.getFirstName() + " " + profile.getLastName());
            });
        }

        // Fetch Account details
        if (transaction.getAccountId() != null) {
            accountRepository.findById(transaction.getAccountId()).ifPresent(account -> {
                response.setAccountNumber(account.getAccountNumber());
            
            // Set Type and Description based on entry type
            // credit = Deposit/Repayment (Green +)
            // debit = Withdrawal (Red -)
            if (transaction.getEntryType() != null && transaction.getEntryType() == TransactionEntryType.credit) {
                // Determine if it's a loan repayment by checking if it's linked to a loan repayment record
                if (repaymentRepository != null && repaymentRepository.existsByTransactionId(transaction.getId())) {
                    response.setType("Repayment");
                    response.setDescription("Loan Repayment");
                } else {
                    response.setType("Susu Collection"); // Matches "Susu(Collections)" tab precisely
                    response.setDescription("Cash Deposit");
                }
            } else {
                // If it's a debit and idempotency key starts with LOAN_APPROVE_, it's a Loan Grant
                if (transaction.getIdempotencyKey() != null && transaction.getIdempotencyKey().startsWith("LOAN_APPROVE_")) {
                    response.setType("Loan Grant");
                    response.setDescription("Loan Disbursement");
                } else {
                    response.setType("Withdrawal"); // Matches "Withdrawal" tab
                    response.setDescription("Cash Withdrawal");
                }
            }

            // Fetch Client Name from Profile
            profileRepository.findById(account.getClientId()).ifPresent(profile -> {
                response.setClientName(profile.getFirstName() + " " + profile.getLastName());
            });
            });
        }

        return response;
    }

    private void sendSmsConfirmation(Account account, Transaction transaction) {
        try {
            // Find client's phone number
            List<PhoneNumber> numbers = phoneNumberRepository.findByProfileId(account.getClientId());
            if (!numbers.isEmpty()) {
                String rawNumber = numbers.get(0).getPhoneNumber();
                
                // Format number: if it starts with '0', prepend +233 and remove the leading 0
                String to = rawNumber;
                if (rawNumber.startsWith("0")) {
                    to = "+233" + rawNumber.substring(1);
                } else if (!rawNumber.startsWith("+")) {
                    to = "+233" + rawNumber;
                }

                String action = transaction.getEntryType() == TransactionEntryType.credit ? "Deposit" : "Withdrawal";
                String message = String.format("CollectorPro Alert: %s of GHS %s successful for account %s. New Balance: GHS %s. Ref: %s",
                        action,
                        transaction.getAmount(),
                        account.getAccountNumber(),
                        account.getBalance(),
                        transaction.getIdempotencyKey());
                smsService.sendSms(to, message);
            }
        } catch (Exception e) {
            // Don't fail the transaction if SMS fails, just log it
            System.err.println("Failed to send SMS confirmation: " + e.getMessage());
        }
    }

    public List<TransactionResponse> getPendingWithdrawals() {
        return transactionRepository.findAll().stream()
                .filter(t -> "PENDING".equals(t.getStatus()) && t.getEntryType() == TransactionEntryType.debit)
                .map(this::toResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    @Transactional
    public void approveWithdrawal(Integer transactionId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        if (!"PENDING".equals(transaction.getStatus())) {
            throw new BadRequestException("Transaction is not pending");
        }

        Account account = accountRepository.findById(transaction.getAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        if (account.getBalance().compareTo(transaction.getAmount()) < 0) {
            throw new BadRequestException("Insufficient balance for withdrawal");
        }

        account.setBalance(account.getBalance().subtract(transaction.getAmount()));
        accountRepository.save(account);

        transaction.setStatus("COMPLETED");
        transactionRepository.save(transaction);

        sendSmsConfirmation(account, transaction);
    }

    @Transactional
    public void rejectWithdrawal(Integer transactionId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        if (!"PENDING".equals(transaction.getStatus())) {
            throw new BadRequestException("Transaction is not pending");
        }

        transaction.setStatus("REJECTED");
        transactionRepository.save(transaction);
    }
}
