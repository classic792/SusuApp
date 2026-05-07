package com.sca.savingsapp.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;

@Entity
@Table(name = "client")
// Represents a client entity in the system
public class Client {

    @Id
    @Column(name = "id", nullable = false)
    private Integer id; // Unique identifier for the client

    @Column(name = "ghana_card_number", nullable = false, unique = true, length = 20)
    private String ghanaCardNumber;

    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender", nullable = false)
    private Gender gender;

    @Column(name = "face_embedding", columnDefinition = "LONGTEXT")
    private String faceEmbedding;

    public Client() {
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getGhanaCardNumber() {
        return ghanaCardNumber;
    }

    public void setGhanaCardNumber(String ghanaCardNumber) {
        this.ghanaCardNumber = ghanaCardNumber;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public Gender getGender() {
        return gender;
    }

    public void setGender(Gender gender) {
        this.gender = gender;
    }

    public String getFaceEmbedding() {
        return faceEmbedding;
    }

    public void setFaceEmbedding(String faceEmbedding) {
        this.faceEmbedding = faceEmbedding;
    }
}
