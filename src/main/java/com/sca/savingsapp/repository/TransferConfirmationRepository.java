package com.sca.savingsapp.repository;

import com.sca.savingsapp.entity.TransferConfirmation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransferConfirmationRepository extends JpaRepository<TransferConfirmation, Integer> {
    List<TransferConfirmation> findByAgentId(Integer agentId);
}
