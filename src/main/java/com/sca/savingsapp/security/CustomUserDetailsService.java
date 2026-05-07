package com.sca.savingsapp.security;

import com.sca.savingsapp.entity.AuthUser;
import com.sca.savingsapp.entity.FreezeStatus;
import com.sca.savingsapp.entity.ProfileType;
import com.sca.savingsapp.repository.AuthUserRepository;
import com.sca.savingsapp.repository.AgentFreezeLogRepository;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final AuthUserRepository authUserRepository;
    private final AgentFreezeLogRepository agentFreezeLogRepository;

    public CustomUserDetailsService(AuthUserRepository authUserRepository, AgentFreezeLogRepository agentFreezeLogRepository) {
        this.authUserRepository = authUserRepository;
        this.agentFreezeLogRepository = agentFreezeLogRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {      
        // Loads user details from the database by email for Spring Security
        AuthUser authUser = authUserRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        boolean isFrozen = false;
        if (authUser.getProfile() != null && authUser.getProfile().getProfileType() == ProfileType.agent) {
            isFrozen = agentFreezeLogRepository.findFirstByAgentIdOrderByTimestampDesc(authUser.getProfile().getId())
                    .map(log -> log.getStatus() == FreezeStatus.FROZEN)
                    .orElse(false);
        }

        return new UserPrincipal(authUser, isFrozen);
    }
}
