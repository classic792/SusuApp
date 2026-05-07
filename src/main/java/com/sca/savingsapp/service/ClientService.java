package com.sca.savingsapp.service;

import com.sca.savingsapp.dto.ClientAccountRequest;
import com.sca.savingsapp.dto.ClientAccountResponse;
import com.sca.savingsapp.entity.Account;
import com.sca.savingsapp.entity.Client;
import com.sca.savingsapp.entity.PhoneNumber;
import com.sca.savingsapp.entity.Profile;
import com.sca.savingsapp.entity.ProfileType;
import com.sca.savingsapp.entity.Transaction;
import com.sca.savingsapp.entity.TransactionEntryType;
import com.sca.savingsapp.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.sca.savingsapp.dto.ClientResponse;
import com.sca.savingsapp.repository.AccountRepository;
import com.sca.savingsapp.repository.ProfileRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ClientService {

    private final ProfileRepository profileRepository;
    private final ClientRepository clientRepository;
    private final PhoneNumberRepository phoneNumberRepository;
    private final AccountService accountService;
    private final AccountRepository accountRepository;
    private final FaceVerificationService faceVerificationService;
    private final TransactionRepository transactionRepository;

    public ClientService(ProfileRepository profileRepository, ClientRepository clientRepository,
            PhoneNumberRepository phoneNumberRepository, AccountService accountService,
            AccountRepository accountRepository, FaceVerificationService faceVerificationService,
            TransactionRepository transactionRepository) {
        this.profileRepository = profileRepository;
        this.clientRepository = clientRepository;
        this.phoneNumberRepository = phoneNumberRepository;
        this.accountService = accountService;
        this.accountRepository = accountRepository;
        this.faceVerificationService = faceVerificationService;
        this.transactionRepository = transactionRepository;
    }

    @Transactional
    public ClientAccountResponse createClientAccount(ClientAccountRequest request, Integer agentId) {
        // Create and save the Profile first (to generate the ID)
        Profile profile = new Profile();
        profile.setFirstName(request.getFirstName());
        profile.setLastName(request.getLastName());
        profile.setOtherName(request.getOtherName());
        profile.setProfileType(ProfileType.client); // Automatically set to client

        Profile savedProfile = profileRepository.save(profile);

        // Create and save the Client entity, using the generated Profile ID
        Client client = new Client();
        client.setId(savedProfile.getId());
        client.setGhanaCardNumber(request.getGhanaCardNumber());
        client.setDateOfBirth(request.getDateOfBirth());
        client.setGender(request.getGender());

        if (request.getClientImage() != null && !request.getClientImage().isEmpty()) {
            client.setFaceEmbedding(request.getClientImage());
        }

        Client savedClient = clientRepository.save(client);

        // Save phone numbers if provided
        if (request.getPhoneNumbers() != null && !request.getPhoneNumbers().isEmpty()) {
            for (String number : request.getPhoneNumbers()) {
                PhoneNumber phoneNumber = new PhoneNumber();
                phoneNumber.setProfileId(savedProfile.getId());
                phoneNumber.setPhoneNumber(number);
                phoneNumberRepository.save(phoneNumber);
            }
        }

        // Create Account based on provided accountType and balance
        Account account = new Account();
        account.setClientId(savedClient.getId());
        account.setAccountType(request.getAccountType());
        account.setBalance(request.getBalance() != null ? request.getBalance() : BigDecimal.ZERO);

        Account savedAccount = accountService.createAccount(account);

        // Record transaction if there is an opening balance
        if (request.getBalance() != null && request.getBalance().compareTo(BigDecimal.ZERO) > 0) {
            Transaction transaction = new Transaction();
            transaction.setAccountId(savedAccount.getId());
            transaction.setAgentId(agentId);
            transaction.setAmount(request.getBalance());
            transaction.setEntryType(TransactionEntryType.credit); // Deposit
            transaction.setTransactionDate(LocalDateTime.now());
            transaction.setIdempotencyKey(
                    "OPENING_BAL_" + savedClient.getId() + "_" + UUID.randomUUID().toString().substring(0, 8));
            transactionRepository.save(transaction);
        }

        // Build and return the response DTO
        return new ClientAccountResponse(
                savedClient.getId(),
                savedProfile.getFirstName(),
                savedProfile.getLastName(),
                savedClient.getGhanaCardNumber(),
                "Client account created successfully",
                savedAccount.getAccountNumber(),
                savedAccount.getBalance());
    }

    public List<ClientResponse> getAllClients() {
        return clientRepository.findAll().stream().map(client -> {
            Profile profile = profileRepository.findById(client.getId()).orElse(null);

            // Find the primary account number
            String primaryAcct = accountRepository.findAll().stream()
                    .filter(a -> a.getClientId().equals(client.getId()))
                    .map(a -> a.getAccountNumber())
                    .findFirst()
                    .orElse("N/A");

            return new ClientResponse(
                    client.getId(),
                    profile != null ? profile.getFirstName() : "Unknown",
                    profile != null ? profile.getLastName() : "Unknown",
                    profile != null ? profile.getOtherName() : null,
                    client.getGhanaCardNumber(),
                    primaryAcct);
        }).collect(Collectors.toList());
    }
}
