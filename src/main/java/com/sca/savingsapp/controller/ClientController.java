package com.sca.savingsapp.controller;

import com.sca.savingsapp.dto.ClientAccountRequest;
import com.sca.savingsapp.dto.ClientAccountResponse;
import com.sca.savingsapp.dto.ClientResponse;
import com.sca.savingsapp.service.ClientService;
import com.sca.savingsapp.security.UserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
public class ClientController {

    private final ClientService clientService;

    public ClientController(ClientService clientService) {
        this.clientService = clientService;
    }

    @PostMapping
    public ResponseEntity<ClientAccountResponse> createClientAccount(
            @RequestBody ClientAccountRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        Integer agentId = principal != null ? principal.getProfileIdAsInteger() : null;
        ClientAccountResponse response = clientService.createClientAccount(request, agentId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ClientResponse>> getAllClients() {
        return ResponseEntity.ok(clientService.getAllClients());
    }
}
