package com.sca.savingsapp.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component
public class JwtTokenProvider {

    private final SecretKey signingKey;
    private final long jwtExpirationMs;

    public JwtTokenProvider(@Value("${security.jwt.secret}") String secret,
                            @Value("${security.jwt.expiration-ms}") long jwtExpirationMs) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.jwtExpirationMs = jwtExpirationMs;
    }

    // Generates a new JWT token for an authenticated user
    public String generateToken(Authentication authentication) {
        String subject;
        if (authentication.getPrincipal() instanceof org.springframework.security.core.userdetails.UserDetails) {
            subject = ((org.springframework.security.core.userdetails.UserDetails) authentication.getPrincipal()).getUsername();
        } else {
            subject = authentication.getName();
        }
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs); // Set token expiration

        return Jwts.builder()
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(signingKey, SignatureAlgorithm.HS256) // Sign with HS256 algorithm
                .compact();
    }

    // Extracts the username (subject) from a given JWT token
    public String getUsernameFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }

    // Validates the JWT token's signature and expiration
    public boolean validateToken(String token) {
        Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token);
        return true;
    }
}
