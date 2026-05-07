package com.sca.savingsapp.service;

import com.sca.savingsapp.dto.AccountResponse;
import com.sca.savingsapp.entity.Account;
import com.sca.savingsapp.entity.AccountType;
import com.sca.savingsapp.repository.AccountRepository;
import com.sca.savingsapp.repository.ProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final ProfileRepository profileRepository;
    private final com.sca.savingsapp.repository.ClientRepository clientRepository;
    private final com.sca.savingsapp.repository.PhoneNumberRepository phoneNumberRepository;

    public AccountService(AccountRepository accountRepository, 
                          ProfileRepository profileRepository,
                          com.sca.savingsapp.repository.ClientRepository clientRepository,
                          com.sca.savingsapp.repository.PhoneNumberRepository phoneNumberRepository) {
        this.accountRepository = accountRepository;
        this.profileRepository = profileRepository;
        this.clientRepository = clientRepository;
        this.phoneNumberRepository = phoneNumberRepository;
        System.out.println("AccountService initialized");
    }

    /**
     * Creates a new account with a generated account number.
     * The account number format is: [Type][Year][Sequence] (e.g., S20240001)
     */
    @Transactional
    public Account createAccount(Account account) {
        // Generate the account number before saving
        String accountNumber = generateAccountNumber(account.getAccountType());
        account.setAccountNumber(accountNumber);
        
        // Set opened date if not provided
        if (account.getOpenedDate() == null) {
            account.setOpenedDate(LocalDate.now());
        }
        
        return accountRepository.save(account);
    }

    /**
     * Generates a unique account number based on account type and current sequence.
     * Uses @Transactional to ensure the sequence increment is atomic and thread-safe.
     */
    @Transactional
    public String generateAccountNumber(AccountType type) {
        // 1. Get the last account of this type
        Optional<Account> lastAccount = accountRepository.findFirstByAccountTypeOrderByAccountNumberDesc(type);
        
        int nextValue = 1;
        if (lastAccount.isPresent()) {
            String lastNum = lastAccount.get().getAccountNumber();
            // Extract the sequence part (last 4 digits)
            try {
                String seqPart = lastNum.substring(lastNum.length() - 4);
                nextValue = Integer.parseInt(seqPart) + 1;
            } catch (Exception e) {
                // If parsing fails, fall back to counting (though this shouldn't happen with current format)
                nextValue = (int) accountRepository.count() + 1;
            }
        }

        // 2. Extract year and format number
        int year = LocalDate.now().getYear();
        
        // Format: [Type][Year][4-digit padded sequence]
        // Example: S20240001, D20240001
        return String.format("%s%d%04d", type.name(), year, nextValue);
    }

    // Retrieves all accounts from the database and maps them to AccountResponse
    public List<AccountResponse> getAllAccounts() {
        return accountRepository.findAll().stream()
                .map(this::toResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    private AccountResponse toResponse(Account account) {
        AccountResponse response = new AccountResponse();
        response.setId(account.getId());
        response.setAccountNumber(account.getAccountNumber());
        response.setClientId(account.getClientId());
        response.setBalance(account.getBalance());
        response.setAccountType(account.getAccountType());
        response.setOpenedDate(account.getOpenedDate());
        response.setStatus(account.getStatus());

        // Fetch client name from Profile
        profileRepository.findById(account.getClientId()).ifPresent(profile -> {
            response.setClientName(profile.getFirstName() + " " + profile.getLastName());
            response.setOtherName(profile.getOtherName());
        });

        // Fetch additional client details
        clientRepository.findById(account.getClientId()).ifPresent(client -> {
            response.setGender(client.getGender() != null ? client.getGender().name() : null);
            response.setDateOfBirth(client.getDateOfBirth());
            response.setGhanaCardNumber(client.getGhanaCardNumber());
        });

        // Fetch phone number
        phoneNumberRepository.findByProfileId(account.getClientId()).stream()
                .findFirst()
                .ifPresent(phone -> response.setPhoneNumber(phone.getPhoneNumber()));

        return response;
    }

    // Finds an account by its unique identifier
    public Optional<Account> getAccountById(Integer id) {
        return accountRepository.findById(id);
    }

    // Removes an account from the database by its ID
    public void deleteAccount(Integer id) {
        accountRepository.deleteById(id);
    }
}
