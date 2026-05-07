package com.sca.savingsapp.service;

import com.sca.savingsapp.dto.*;
import com.sca.savingsapp.entity.*;
import com.sca.savingsapp.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final AgentLocationRepository agentLocationRepository;
    private final AgentLimitRepository agentLimitRepository;
    private final TransferConfirmationRepository transferConfirmationRepository;
    private final AgentFreezeLogRepository agentFreezeLogRepository;
    private final ProfileRepository profileRepository;
    private final AgentRepository agentRepository;
    private final ClientRepository clientRepository;
    private final LoanRepository loanRepository;
    private final TransactionRepository transactionRepository;
    private final AuthUserRepository authUserRepository;
    private final AccountRepository accountRepository;
    private final RepaymentRepository repaymentRepository;
    private final TransactionService transactionService;
    private final SystemSettingRepository systemSettingRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public AdminService(
            AgentLocationRepository agentLocationRepository,
            AgentLimitRepository agentLimitRepository,
            TransferConfirmationRepository transferConfirmationRepository,
            AgentFreezeLogRepository agentFreezeLogRepository,
            ProfileRepository profileRepository,
            AgentRepository agentRepository,
            ClientRepository clientRepository,
            LoanRepository loanRepository,
            TransactionRepository transactionRepository,
            AuthUserRepository authUserRepository,
            AccountRepository accountRepository,
            RepaymentRepository repaymentRepository,
            TransactionService transactionService,
            SystemSettingRepository systemSettingRepository,
            org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        this.agentLocationRepository = agentLocationRepository;
        this.agentLimitRepository = agentLimitRepository;
        this.transferConfirmationRepository = transferConfirmationRepository;
        this.agentFreezeLogRepository = agentFreezeLogRepository;
        this.profileRepository = profileRepository;
        this.agentRepository = agentRepository;
        this.clientRepository = clientRepository;
        this.loanRepository = loanRepository;
        this.transactionRepository = transactionRepository;
        this.authUserRepository = authUserRepository;
        this.accountRepository = accountRepository;
        this.repaymentRepository = repaymentRepository;
        this.transactionService = transactionService;
        this.systemSettingRepository = systemSettingRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<AgentLocationResponse> getAgentLocations() {
        return agentRepository.findAll().stream()
                .map(agent -> {
                    Profile profile = profileRepository.findById(agent.getId()).orElse(null);
                    String name = profile != null ? profile.getFirstName() + " " + profile.getLastName() : "Unknown Agent";
                    
                    AgentLimit limit = agentLimitRepository.findByAgentId(agent.getId()).orElse(null);
                    BigDecimal daily = limit != null ? limit.getDailyLimit() : getGlobalDailyLimit();
                    BigDecimal perTrans = limit != null ? limit.getPerTransactionLimit() : daily;

                    return new AgentLocationResponse(
                        agent.getId(), 
                        name, 
                        agent.getLastKnownLatitude(), 
                        agent.getLastKnownLongitude(), 
                        LocalDateTime.now(),
                        daily,
                        perTrans
                    );
                }).collect(Collectors.toList());
    }

    @Transactional
    public AgentLimit setAgentLimits(Integer agentId, AgentLimitRequest request, Integer adminId) {
        Profile agentProfile = profileRepository.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent profile not found"));
        Profile adminProfile = profileRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin profile not found"));

        AgentLimit limit = agentLimitRepository.findByAgentId(agentId).orElse(new AgentLimit());
        limit.setAgent(agentProfile);
        limit.setDailyLimit(request.getDailyLimit());
        limit.setPerTransactionLimit(request.getPerTransactionLimit());
        limit.setUpdatedBy(adminProfile);

        return agentLimitRepository.save(limit);
    }

    @Transactional
    public TransferConfirmation confirmTransfer(Integer transferId, Integer adminId) {
        TransferConfirmation transfer = transferConfirmationRepository.findById(transferId)
                .orElseThrow(() -> new RuntimeException("Transfer confirmation not found"));

        Profile adminProfile = profileRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin profile not found"));

        transfer.setStatus(TransferConfirmationStatus.CONFIRMED);
        transfer.setConfirmedBy(adminProfile);
        transfer.setConfirmedAt(LocalDateTime.now());
        transferConfirmationRepository.save(transfer);

        AgentFreezeLog unfreezeLog = new AgentFreezeLog();
        unfreezeLog.setAgent(transfer.getAgent());
        unfreezeLog.setFrozenBy(adminProfile); // the admin unfreezing
        unfreezeLog.setReason("Amount transferred to company account confirmed. Reference: " + transfer.getReferenceCode());
        unfreezeLog.setStatus(FreezeStatus.UNFROZEN);
        agentFreezeLogRepository.save(unfreezeLog);

        return transfer;
    }

    public CorporateAnalysisResponse getCorporateAnalysis() {
        CorporateAnalysisResponse response = new CorporateAnalysisResponse();
        response.setTotalAgents(agentRepository.count());
        response.setTotalClients(clientRepository.count());

        List<Loan> allLoans = loanRepository.findAll();
        long activeCount = allLoans.stream().filter(l -> l.getStatus() == LoanStatus.active).count();
        BigDecimal totalBalanceRemaining = allLoans.stream()
                .filter(l -> l.getStatus() == LoanStatus.active || l.getStatus() == LoanStatus.defaulted)
                .map(Loan::getBalanceRemaining)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalAgentBalance = agentRepository.findAll().stream()
                .map(Agent::getBalance)
                .filter(b -> b != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalClientBalance = accountRepository.findAll().stream()
                .map(Account::getBalance)
                .filter(b -> b != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        response.setTotalLoansActive(activeCount);
        response.setTotalLoanBalanceRemaining(totalBalanceRemaining);
        response.setTotalAgentFloatBalance(totalAgentBalance);
        response.setTotalClientBalance(totalClientBalance);

        return response;
    }

    @Transactional
    public Agent addAgent(AgentRegistrationRequest request) {
        Profile profile = new Profile(request.getFirstName(), request.getLastName(), request.getOtherName(), ProfileType.agent);
        profile = profileRepository.save(profile);

        Agent agent = new Agent();
        agent.setId(profile.getId());
        agent.setBalance(BigDecimal.ZERO);
        agent = agentRepository.save(agent);

        AuthUser authUser = new AuthUser();
        authUser.setEmail(request.getEmail());
        authUser.setPassword(passwordEncoder.encode(request.getPassword())); // Hash the password
        authUser.setProfile(profile);
        authUserRepository.save(authUser);

        return agent;
    }

    public List<TransactionResponse> getAllTransactionsOverview() {
        return transactionRepository.findAll().stream()
                .map(transactionService::toResponse)
                .collect(Collectors.toList());
    }

    public List<com.sca.savingsapp.dto.FrozenAgentResponse> getFrozenAgents() {
        return agentRepository.findAll().stream()
                .filter(agent -> {
                    return agentFreezeLogRepository.findFirstByAgentIdOrderByTimestampDesc(agent.getId())
                            .map(log -> log.getStatus() == FreezeStatus.FROZEN)
                            .orElse(false);
                })
                .map(agent -> {
                    Profile profile = profileRepository.findById(agent.getId()).orElse(null);
                    String name = profile != null ? profile.getFirstName() + " " + profile.getLastName() : "Unknown Agent";
                    AgentFreezeLog lastLog = agentFreezeLogRepository.findFirstByAgentIdOrderByTimestampDesc(agent.getId()).get();
                    return new com.sca.savingsapp.dto.FrozenAgentResponse(
                        agent.getId(), 
                        name, 
                        lastLog.getReason(),
                        lastLog.getTimestamp()
                    );
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void unfreezeAgent(Integer agentId, Integer adminId) {
        Profile agentProfile = profileRepository.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent profile not found"));
        Profile adminProfile = profileRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin profile not found"));

        AgentFreezeLog log = new AgentFreezeLog();
        log.setAgent(agentProfile);
        log.setFrozenBy(adminProfile);
        log.setReason("Administrative Unfreeze (Quick Action)");
        log.setStatus(FreezeStatus.UNFROZEN);
        agentFreezeLogRepository.save(log);
    }

    public List<LoanResponse> getPendingLoans() {
        return loanRepository.findByStatus(LoanStatus.pending).stream()
                .map(loan -> {
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
                    
                    profileRepository.findById(loan.getClientId()).ifPresent(p -> {
                        response.setClientName(p.getFirstName() + " " + p.getLastName());
                    });
                    
                    // Simple credit score mock algorithm for now
                    response.setCreditScore(700); 
                    response.setEligibility("High");
                    
                    return response;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void approveLoan(Integer loanId) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new RuntimeException("Loan not found"));
        loan.setStatus(LoanStatus.active);
        loanRepository.save(loan);

        // Create a transaction record for the loan disbursement
        Transaction transaction = new Transaction();
        transaction.setAccountId(loan.getAccountId());
        transaction.setAgentId(loan.getAgentId());
        transaction.setAmount(loan.getPrincipalAmount());
        transaction.setEntryType(TransactionEntryType.debit); // Disbursement is a debit against agent float
        transaction.setIdempotencyKey("LOAN_APPROVE_" + loan.getId());
        transaction.setTransactionDate(LocalDateTime.now());
        transactionRepository.save(transaction);
    }

    @Transactional
    public void declineLoan(Integer loanId) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new RuntimeException("Loan not found"));
        loan.setStatus(LoanStatus.declined);
        loanRepository.save(loan);
    }

    public java.util.Map<String, Object> getDeepAnalytics() {
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        
        long clientCount = clientRepository.count();
        stats.put("totalClients", clientCount);
        
        List<Transaction> transactions = transactionRepository.findAll();
        List<Loan> loans = loanRepository.findAll();
        
        BigDecimal totalCollections = transactions.stream()
                .filter(t -> t.getEntryType() == TransactionEntryType.credit)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.put("totalCollections", totalCollections);

        // Community aggregation (Mocked communities based on ID ranges for now)
        java.util.List<java.util.Map<String, Object>> communities = new java.util.ArrayList<>();
        communities.add(java.util.Map.of("name", "Anaji", "accounts", clientCount / 3));
        communities.add(java.util.Map.of("name", "Apowa", "accounts", clientCount / 3));
        communities.add(java.util.Map.of("name", "Kwesimintsim", "accounts", clientCount - (clientCount / 3) * 2));
        stats.put("communityData", communities);
        
        // Compute Monthly Data
        java.util.Map<String, BigDecimal> collectionsByMonth = new java.util.HashMap<>();
        java.util.Map<String, BigDecimal> loansByMonth = new java.util.HashMap<>();
        String[] monthNames = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
        for (String m : monthNames) {
            collectionsByMonth.put(m, BigDecimal.ZERO);
            loansByMonth.put(m, BigDecimal.ZERO);
        }
        int currentYear = LocalDateTime.now().getYear();
        for (Transaction t : transactions) {
            if (t.getTransactionDate() != null && t.getTransactionDate().getYear() == currentYear) {
                if (t.getEntryType() == TransactionEntryType.credit) {
                    String month = monthNames[t.getTransactionDate().getMonthValue() - 1];
                    collectionsByMonth.put(month, collectionsByMonth.get(month).add(t.getAmount()));
                }
            }
        }
        for (Loan l : loans) {
            if (l.getDisbursementDate() != null && l.getDisbursementDate().getYear() == currentYear) {
                String month = monthNames[l.getDisbursementDate().getMonthValue() - 1];
                loansByMonth.put(month, loansByMonth.get(month).add(l.getPrincipalAmount()));
            }
        }
        java.util.List<java.util.Map<String, Object>> monthlyData = new java.util.ArrayList<>();
        for (String m : monthNames) {
            java.util.Map<String, Object> monthData = new java.util.HashMap<>();
            monthData.put("name", m);
            monthData.put("collections", collectionsByMonth.get(m));
            monthData.put("loans", loansByMonth.get(m));
            monthlyData.add(monthData);
        }
        stats.put("monthlyData", monthlyData);

        // Compute Agent Performance Data
        java.util.Map<Integer, BigDecimal> agentCollections = new java.util.HashMap<>();
        java.util.Map<Integer, Integer> agentTxCounts = new java.util.HashMap<>();
        for (Transaction t : transactions) {
            if (t.getEntryType() == TransactionEntryType.credit && t.getAgentId() != null) {
                agentCollections.put(t.getAgentId(), agentCollections.getOrDefault(t.getAgentId(), BigDecimal.ZERO).add(t.getAmount()));
                agentTxCounts.put(t.getAgentId(), agentTxCounts.getOrDefault(t.getAgentId(), 0) + 1);
            }
        }
        java.util.List<java.util.Map<String, Object>> agentPerformanceData = new java.util.ArrayList<>();
        for (java.util.Map.Entry<Integer, BigDecimal> entry : agentCollections.entrySet()) {
            Integer aId = entry.getKey();
            String agentName = profileRepository.findById(aId)
                    .map(p -> p.getFirstName() + " " + p.getLastName())
                    .orElse("Agent " + aId);
            java.util.Map<String, Object> perf = new java.util.HashMap<>();
            perf.put("name", agentName);
            perf.put("amount", entry.getValue());
            perf.put("transactions", agentTxCounts.get(aId));
            agentPerformanceData.add(perf);
        }
        agentPerformanceData.sort((a, b) -> ((BigDecimal)b.get("amount")).compareTo((BigDecimal)a.get("amount")));
        if (agentPerformanceData.size() > 5) {
            agentPerformanceData = agentPerformanceData.subList(0, 5);
        }
        stats.put("agentPerformanceData", agentPerformanceData);

        // Compute Credit Score Data (Mock distribution based on real client count)
        java.util.List<java.util.Map<String, Object>> creditScoreData = new java.util.ArrayList<>();
        long total = clientCount > 0 ? clientCount : 100;
        creditScoreData.add(java.util.Map.of("name", "Excellent", "value", Math.max(1, (int)(total * 0.35))));
        creditScoreData.add(java.util.Map.of("name", "Good", "value", Math.max(1, (int)(total * 0.45))));
        creditScoreData.add(java.util.Map.of("name", "Fair", "value", Math.max(1, (int)(total * 0.15))));
        creditScoreData.add(java.util.Map.of("name", "Poor", "value", Math.max(1, (int)(total * 0.05))));
        stats.put("creditScoreData", creditScoreData);
        
        // Compute Peak Hour and Busiest Day
        java.util.Map<Integer, Integer> hourCounts = new java.util.HashMap<>();
        java.util.Map<java.time.DayOfWeek, Integer> dayCounts = new java.util.HashMap<>();
        for (Transaction t : transactions) {
            if (t.getTransactionDate() != null && t.getEntryType() == TransactionEntryType.credit) {
                int hour = t.getTransactionDate().getHour();
                hourCounts.put(hour, hourCounts.getOrDefault(hour, 0) + 1);
                java.time.DayOfWeek day = t.getTransactionDate().getDayOfWeek();
                dayCounts.put(day, dayCounts.getOrDefault(day, 0) + 1);
            }
        }
        String peakHourStr = "10:00 AM - 12:00 PM";
        if (!hourCounts.isEmpty()) {
            int peakHour = java.util.Collections.max(hourCounts.entrySet(), java.util.Map.Entry.comparingByValue()).getKey();
            int nextHour = (peakHour + 2) % 24;
            String amPm1 = peakHour >= 12 ? "PM" : "AM";
            String amPm2 = nextHour >= 12 ? "PM" : "AM";
            int displayHour1 = peakHour > 12 ? peakHour - 12 : (peakHour == 0 ? 12 : peakHour);
            int displayHour2 = nextHour > 12 ? nextHour - 12 : (nextHour == 0 ? 12 : nextHour);
            peakHourStr = String.format("%d:00 %s - %d:00 %s", displayHour1, amPm1, displayHour2, amPm2);
        }
        String busiestDayStr = "Friday";
        if (!dayCounts.isEmpty()) {
            java.time.DayOfWeek busiestDay = java.util.Collections.max(dayCounts.entrySet(), java.util.Map.Entry.comparingByValue()).getKey();
            busiestDayStr = busiestDay.getDisplayName(java.time.format.TextStyle.FULL, java.util.Locale.ENGLISH);
        }
        stats.put("peakHour", peakHourStr);
        stats.put("busiestDay", busiestDayStr);

        return stats;
    }

    public BigDecimal getGlobalDailyLimit() {
        return systemSettingRepository.findBySettingKey("GLOBAL_DAILY_LIMIT")
                .map(s -> new BigDecimal(s.getSettingValue()))
                .orElse(new BigDecimal("5000.00"));
    }

    @Transactional
    public void setGlobalDailyLimit(BigDecimal limit) {
        SystemSetting setting = systemSettingRepository.findBySettingKey("GLOBAL_DAILY_LIMIT")
                .orElse(new SystemSetting("GLOBAL_DAILY_LIMIT", limit.toString()));
        setting.setSettingValue(limit.toString());
        systemSettingRepository.save(setting);
    }

    public BigDecimal getConsolidatedDailyLimit(Integer agentId) {
        // Specific Limit ?? Global Limit ?? 5000
        return agentLimitRepository.findByAgentId(agentId)
                .map(AgentLimit::getDailyLimit)
                .orElseGet(this::getGlobalDailyLimit);
    }

    public String getAgentStatus(Integer agentId) {
        return agentFreezeLogRepository.findFirstByAgentIdOrderByTimestampDesc(agentId)
                .map(log -> log.getStatus() == FreezeStatus.FROZEN ? "FROZEN" : "ACTIVE")
                .orElse("ACTIVE");
    }

    public List<AgentStatsResponse> getAgentStats() {
        return agentRepository.findAll().stream()
                .map(agent -> {
                    Profile profile = profileRepository.findById(agent.getId()).orElse(null);
                    String name = profile != null ? profile.getFirstName() + " " + profile.getLastName() : "Unknown Agent";
                    LocalDateTime regDate = profile != null ? profile.getCreatedAt() : null;

                    long loans = loanRepository.countByAgentId(agent.getId());
                    long repayments = repaymentRepository.countByAgentId(agent.getId());
                    long susu = transactionRepository.countByAgentIdAndEntryType(agent.getId(), TransactionEntryType.credit);
                    
                    String status = getAgentStatus(agent.getId());

                    return new AgentStatsResponse(
                        agent.getId(),
                        name,
                        regDate,
                        loans,
                        susu,
                        repayments,
                        status
                    );
                }).collect(Collectors.toList());
    }

    @Transactional
    public void checkAndTriggerDailyLimitFreeze(Integer agentId) {
        BigDecimal dailyCollected = getDailyCollected(agentId);
        BigDecimal limit = getConsolidatedDailyLimit(agentId);

        if (dailyCollected.compareTo(limit) >= 0) {
            // Trigger freeze
            Profile agentProfile = profileRepository.findById(agentId).orElse(null);
            Profile systemAdmin = profileRepository.findById(1).orElse(null); // Fallback to ID 1 or first admin

            if (agentProfile != null) {
                AgentFreezeLog log = new AgentFreezeLog();
                log.setAgent(agentProfile);
                log.setFrozenBy(systemAdmin);
                log.setReason("Daily transaction limit of GHS " + limit + " reached. System Auto-Freeze.");
                log.setStatus(FreezeStatus.FROZEN);
                agentFreezeLogRepository.save(log);
            }
        }
    }

    public BigDecimal getDailyCollected(Integer agentId) {
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        
        // Find the last UNFROZEN log for this agent
        LocalDateTime lastUnfrozenAt = agentFreezeLogRepository.findFirstByAgentIdAndStatusOrderByTimestampDesc(agentId, com.sca.savingsapp.entity.FreezeStatus.UNFROZEN)
                .map(com.sca.savingsapp.entity.AgentFreezeLog::getTimestamp)
                .orElse(startOfDay);
                
        LocalDateTime since = lastUnfrozenAt.isAfter(startOfDay) ? lastUnfrozenAt : startOfDay;
        
        System.out.println("DEBUG: Calculating dailyCollected for agent " + agentId + " since " + since);
        BigDecimal collected = transactionRepository.sumCollectionsByAgentSince(agentId, TransactionEntryType.credit, since);
        System.out.println("DEBUG: Result for agent " + agentId + ": " + collected);
        
        return collected != null ? collected : BigDecimal.ZERO;
    }

}
