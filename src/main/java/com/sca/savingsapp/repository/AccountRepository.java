package com.sca.savingsapp.repository;

import com.sca.savingsapp.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;

import com.sca.savingsapp.entity.AccountType;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Integer> {
    Optional<Account> findFirstByAccountTypeOrderByAccountNumberDesc(AccountType accountType);
}