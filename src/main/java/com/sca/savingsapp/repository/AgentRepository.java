package com.sca.savingsapp.repository;

import com.sca.savingsapp.entity.Agent;
// import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AgentRepository extends JpaRepository<Agent, Integer> {
}
