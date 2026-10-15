package com.internflow.security;

import com.internflow.exception.UnauthorizedException;
import com.internflow.modules.user.Role;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {}

    public static CustomUserDetails getCurrentUserDetails() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || !(authentication.getPrincipal() instanceof CustomUserDetails)) {
            throw new UnauthorizedException("User is not authenticated");
        }
        return (CustomUserDetails) authentication.getPrincipal();
    }

    public static Long getCurrentUserId() {
        return getCurrentUserDetails().getId();
    }

    public static String getCurrentUserEmail() {
        return getCurrentUserDetails().getEmail();
    }

    public static Role getCurrentUserRole() {
        return getCurrentUserDetails().getRole();
    }

    public static boolean isAdmin() {
        return getCurrentUserRole() == Role.ADMIN;
    }

    public static boolean isCompany() {
        Role role = getCurrentUserRole();
        return role == Role.COMPANY || role == Role.RECRUITER;
    }

    public static boolean isStaff() {
        Role role = getCurrentUserRole();
        return role == Role.ADMIN || role == Role.TPO || role == Role.FACULTY_COORDINATOR;
    }

    public static boolean isStudent() {
        return getCurrentUserRole() == Role.STUDENT;
    }
}
