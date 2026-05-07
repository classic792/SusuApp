package com.sca.savingsapp.controller;

import com.sca.savingsapp.entity.Account;
import com.sca.savingsapp.dto.AccountResponse;
import com.sca.savingsapp.service.AccountService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        System.out.println("AccountController initialized");
        this.accountService = accountService;
    }

    // Endpoint to create a new account
    @PostMapping
    public Account createAccount(@RequestBody Account account) {
        return accountService.createAccount(account);
    }

    // Endpoint to retrieve all accounts
    @GetMapping
    public List<AccountResponse> getAllAccounts() {
        return accountService.getAllAccounts();
    }

    // Endpoint to retrieve a specific account by its ID
    @GetMapping("/{id}")
    public Account getAccountById(@PathVariable Integer id) {
        return accountService.getAccountById(id)
                .orElseThrow(() -> new RuntimeException("Account not found"));
    }

    // Endpoint to delete an account by its ID
    @DeleteMapping("/{id}")
    public void deleteAccount(@PathVariable Integer id) {
        accountService.deleteAccount(id);
    }
}