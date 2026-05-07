package com.sca.savingsapp.repository;

import com.sca.savingsapp.entity.Profile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfileRepository extends JpaRepository<Profile, Integer> {
}
