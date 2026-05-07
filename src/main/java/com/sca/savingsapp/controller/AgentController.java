package com.sca.savingsapp.controller;

import com.sca.savingsapp.dto.LocationRequest;
import com.sca.savingsapp.security.UserPrincipal;
import com.sca.savingsapp.service.AgentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/agent")
public class AgentController {

    private final AgentService agentService;

    public AgentController(AgentService agentService) {
        this.agentService = agentService;
    }

    @PostMapping("/location")
    public ResponseEntity<Void> updateLocation(
            @RequestBody LocationRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        agentService.updateLocation(principal.getProfileIdAsInteger(), request);
        return ResponseEntity.ok().build();
    }
}
