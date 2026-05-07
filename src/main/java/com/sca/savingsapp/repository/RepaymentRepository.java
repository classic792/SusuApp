package com.sca.savingsapp.repository;

import com.sca.savingsapp.entity.Repayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface RepaymentRepository extends JpaRepository<Repayment, Integer> {

    // Returns all repayment records for a given loan
    List<Repayment> findByLoanId(Integer loanId);

    // Checks if a transaction is a repayment
    boolean existsByTransactionId(Integer transactionId);

    // Sums all amounts paid for a loan to compute total repaid so far
    @Query("SELECT COALESCE(SUM(r.amountPaid), 0) FROM Repayment r WHERE r.loanId = :loanId")
    BigDecimal sumAmountPaidByLoanId(@Param("loanId") Integer loanId);

    long countByAgentId(Integer agentId);
}
