package com.sca.savingsapp.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "profile")
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "other_name")
    private String otherName;

    @Enumerated(EnumType.STRING)
    @Column(name = "profile_type")
   private ProfileType profileType; // Identifies user role: client, agent, or admin

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt; // Metadata: when the profile was created

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt; // Metadata: last recorded update time

    // @OneToMany(mappedBy = "profile")
    // private List<PhoneNumber> phoneNumbers;

    // Constructors
    public Profile() {
    }

    public Profile(String firstName, String lastName, String otherName, ProfileType profileType) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.otherName = otherName;
        this.profileType = profileType;
    }

    // Getters and Setters

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getOtherName() {
        return otherName;
    }

    public void setOtherName(String otherName) {
        this.otherName = otherName;
    }

    public ProfileType getProfileType() {
        return profileType;
    }

    public void setProfileType(ProfileType profileType) {
        this.profileType = profileType;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    // @OneToMany(mappedBy = "profile")
    // private List<PhoneNumber> phoneNumbers;

    // public void setPhoneNumbers(List<PhoneNumber> phoneNumbers) {
    //     this.phoneNumbers = phoneNumbers;
    // }
}