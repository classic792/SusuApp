package com.sca.savingsapp.controller;

import com.sca.savingsapp.dto.LoginRequest;
import com.sca.savingsapp.dto.LoginResponse;
import com.sca.savingsapp.dto.UserResponse;
import com.sca.savingsapp.security.UserPrincipal;
import com.sca.savingsapp.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final com.sca.savingsapp.service.AdminService adminService;

    public AuthController(AuthService authService, com.sca.savingsapp.service.AdminService adminService) {
        this.authService = authService;
        this.adminService = adminService;
    }

    // Endpoint for user login; authenticates credentials and returns JWT
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    // Returns the current authenticated user's profile information
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        String role = principal.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        java.math.BigDecimal limit = null;
        java.math.BigDecimal collected = null;
        String status = "ACTIVE";
        if ("agent".equalsIgnoreCase(role)) {
            Integer profileId = principal.getProfileIdAsInteger();
            limit = adminService.getConsolidatedDailyLimit(profileId);
            collected = adminService.getDailyCollected(profileId);
            status = adminService.getAgentStatus(profileId);
        }
        UserResponse response = new UserResponse(
                principal.getId(),
                principal.getEmail(),
                principal.getFirstName(),
                principal.getLastName(),
                role,
                limit,
                collected,
                status
        );
        return ResponseEntity.ok(response);
    }
}
