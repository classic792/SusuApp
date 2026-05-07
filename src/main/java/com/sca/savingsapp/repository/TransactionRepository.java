package com.sca.savingsapp.repository;

import com.sca.savingsapp.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Integer> {
    // Checks if a transaction with the given idempotency key already exists in the database
    boolean existsByIdempotencyKey(String idempotencyKey);

    // Retrieve transaction history for a specific agent
    List<Transaction> findByAgentIdOrderByTransactionDateDesc(Integer agentId);

    // Count transactions by agent and entry type
    long countByAgentIdAndEntryType(Integer agentId, com.sca.savingsapp.entity.TransactionEntryType entryType);
    
    // Retrieve transaction history for a specific account
    List<Transaction> findByAccountIdOrderByTransactionDateDesc(Integer accountId);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.agentId = :agentId AND t.entryType = :type AND t.transactionDate >= :since")
    java.math.BigDecimal sumCollectionsByAgentSince(@org.springframework.data.repository.query.Param("agentId") Integer agentId, @org.springframework.data.repository.query.Param("type") com.sca.savingsapp.entity.TransactionEntryType type, @org.springframework.data.repository.query.Param("since") java.time.LocalDateTime since);
}
