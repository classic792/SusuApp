package com.sca.savingsapp.repository;

import com.sca.savingsapp.entity.AgentFreezeLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AgentFreezeLogRepository extends JpaRepository<AgentFreezeLog, Integer> {
    List<AgentFreezeLog> findByAgentIdOrderByTimestampDesc(Integer agentId);
    Optional<AgentFreezeLog> findFirstByAgentIdOrderByTimestampDesc(Integer agentId);
    Optional<AgentFreezeLog> findFirstByAgentIdAndStatusOrderByTimestampDesc(Integer agentId, com.sca.savingsapp.entity.FreezeStatus status);
}
