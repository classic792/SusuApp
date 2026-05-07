package com.sca.savingsapp.security;

import com.sca.savingsapp.entity.AuthUser;
import java.util.Collection;
import java.util.Collections;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

public class UserPrincipal implements UserDetails {

    private final AuthUser authUser;
    private final boolean frozen;

    public UserPrincipal(AuthUser authUser, boolean isFrozen) {
        this.authUser = authUser;
        this.frozen = isFrozen;
    }

    public Integer getId() {
        return authUser.getId();
    }

    public String getEmail() {
        return authUser.getEmail();
    }

    public String getFirstName() {
        return authUser.getProfile() != null ? authUser.getProfile().getFirstName() : null;
    }

    public String getLastName() {
        return authUser.getProfile() != null ? authUser.getProfile().getLastName() : null;
    }

    public Object getProfileId() {
        return authUser.getProfile() != null ? authUser.getProfile().getId() : null;
    }

    public Integer getProfileIdAsInteger() {
        return authUser.getProfile() != null ? authUser.getProfile().getId() : null;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (authUser.getProfile() != null && authUser.getProfile().getProfileType() != null) {
            String roleName = "ROLE_" + authUser.getProfile().getProfileType().name().toUpperCase();
            return Collections.singletonList(new SimpleGrantedAuthority(roleName));
        }
        return Collections.emptyList();
    }

    @Override
    public String getPassword() {
        return authUser.getPassword();
    }

    @Override
    public String getUsername() {
        return authUser.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        // A frozen agent account is considered "locked" in Spring Security
        return !frozen;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
