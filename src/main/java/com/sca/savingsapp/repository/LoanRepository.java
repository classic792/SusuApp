package com.sca.savingsapp.repository;

import com.sca.savingsapp.entity.Loan;
import com.sca.savingsapp.entity.LoanStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface LoanRepository extends JpaRepository<Loan, Integer> {

    // Returns all loans belonging to a specific client
    List<Loan> findByClientId(Integer clientId);

    // Returns all loans tied to a specific account
    List<Loan> findByAccountId(Integer accountId);

    // Returns all loans with the given status (e.g., ACTIVE, PAID, DEFAULTED)
    List<Loan> findByStatus(LoanStatus status);

    // Returns all loans with a given status submitted by a specific agent
    List<Loan> findByStatusAndAgentId(LoanStatus status, Integer agentId);

    // Directly updates the balance_remaining for a loan without reloading the full entity
    @Modifying
    @Query("UPDATE Loan l SET l.balanceRemaining = :balance WHERE l.id = :loanId")
    void updateBalanceRemaining(@Param("loanId") Integer loanId, @Param("balance") BigDecimal balance);

    long countByAgentId(Integer agentId);
    List<Loan> findByAgentId(Integer agentId);
    long countByClientId(Integer clientId);
}
