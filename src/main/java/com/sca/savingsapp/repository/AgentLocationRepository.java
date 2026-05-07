package com.sca.savingsapp.repository;

import com.sca.savingsapp.entity.AgentLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AgentLocationRepository extends JpaRepository<AgentLocation, Integer> {
    List<AgentLocation> findByAgentId(Integer agentId);
}
