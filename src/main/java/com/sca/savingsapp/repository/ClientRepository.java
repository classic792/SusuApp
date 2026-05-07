package com.sca.savingsapp.repository;

import com.sca.savingsapp.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClientRepository extends JpaRepository<Client, Integer> {
    // Standard JpaRepository for Client entity operations
}
