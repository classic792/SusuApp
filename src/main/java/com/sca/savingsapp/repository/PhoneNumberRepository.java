package com.sca.savingsapp.repository;

import com.sca.savingsapp.entity.PhoneNumber;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PhoneNumberRepository extends JpaRepository<PhoneNumber, Integer> {
    // Retrieves all phone numbers associated with a specific profile ID
    List<PhoneNumber> findByProfileId(Integer profileId);
}
