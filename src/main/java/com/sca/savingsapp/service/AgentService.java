package com.sca.savingsapp.service;

import com.sca.savingsapp.dto.LocationRequest;
import com.sca.savingsapp.entity.Agent;
import com.sca.savingsapp.entity.AgentLocation;
import com.sca.savingsapp.entity.Profile;
import com.sca.savingsapp.repository.AgentLocationRepository;
import com.sca.savingsapp.repository.AgentRepository;
import com.sca.savingsapp.repository.ProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AgentService {

    private final AgentRepository agentRepository;
    private final AgentLocationRepository agentLocationRepository;
    private final ProfileRepository profileRepository;

    public AgentService(AgentRepository agentRepository, 
                        AgentLocationRepository agentLocationRepository, 
                        ProfileRepository profileRepository) {
        this.agentRepository = agentRepository;
        this.agentLocationRepository = agentLocationRepository;
        this.profileRepository = profileRepository;
    }

    @Transactional
    public void updateLocation(Integer agentId, LocationRequest request) {
        // Update current location in Agent table
        Agent agent = agentRepository.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent not found"));
        
        agent.setLastKnownLatitude(request.getLatitude());
        agent.setLastKnownLongitude(request.getLongitude());
        agentRepository.save(agent);

        // Store history in AgentLocation table
        Profile profile = profileRepository.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        
        AgentLocation history = new AgentLocation();
        history.setAgent(profile);
        history.setLatitude(request.getLatitude());
        history.setLongitude(request.getLongitude());
        agentLocationRepository.save(history);
    }
}
