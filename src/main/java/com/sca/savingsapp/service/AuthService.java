package com.sca.savingsapp.service;

import com.sca.savingsapp.dto.LoginRequest;
import com.sca.savingsapp.dto.LoginResponse;
import com.sca.savingsapp.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final com.sca.savingsapp.repository.AuthUserRepository authUserRepository;

    public AuthService(AuthenticationManager authenticationManager, 
                       JwtTokenProvider jwtTokenProvider,
                       com.sca.savingsapp.repository.AuthUserRepository authUserRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.authUserRepository = authUserRepository;
    }

    // Authenticates user credentials and returns a JWT token
    public LoginResponse login(LoginRequest request) {
        // 1. Check if user exists first to give specific "Invalid email" feedback
        if (!authUserRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new org.springframework.security.authentication.BadCredentialsException("Invalid email address. Please check and try again.");
        }

        Authentication authentication;
        try {
            // 2. Perform standard Spring Security authentication
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            throw new org.springframework.security.authentication.BadCredentialsException("Invalid password. Please check and try again.");
        } catch (org.springframework.security.authentication.LockedException e) {
            throw new org.springframework.security.authentication.LockedException("Access Denied: Your account is currently frozen. Please contact your administrator.");
        }
        // Generate a new JWT token for the authenticated user
        String token = jwtTokenProvider.generateToken(authentication);
        
        String role = "";
        if (!authentication.getAuthorities().isEmpty()) {
            role = authentication.getAuthorities().iterator().next().getAuthority();
            if (role.startsWith("ROLE_")) {
                role = role.substring(5);
            }
        }

        Integer id = null;
        if (authentication.getPrincipal() instanceof com.sca.savingsapp.security.UserPrincipal) {
            id = ((com.sca.savingsapp.security.UserPrincipal) authentication.getPrincipal()).getId();
        }

        return new LoginResponse(token, "Bearer", role, id);
    }
}
