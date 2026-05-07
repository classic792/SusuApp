package com.sca.savingsapp.repository;

import com.sca.savingsapp.entity.AgentLimit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AgentLimitRepository extends JpaRepository<AgentLimit, Integer> {
    Optional<AgentLimit> findByAgentId(Integer agentId);
}
