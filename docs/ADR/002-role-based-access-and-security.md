# ADR 002: Role-Based Access Control and Security Architecture

## Status
Accepted

## Context
The platform coordinates five distinct user personas: `STUDENT`, `TPO`, `RECRUITER`, `FACULTY_COORDINATOR`, and `ADMIN`. Each persona has distinct permissions, and security must be enforced on the server, not solely in the user interface.

## Decision
1. **Stateless JWT Authentication**: Authenticated requests carry an HMAC-SHA256 signed JWT with user ID, email, and granted roles.
2. **Spring Security Method Authorization**: Critical service methods and controller endpoints are protected using `@PreAuthorize("hasRole('TPO') or hasRole('ADMIN')")`.
3. **Object-Level Authorization**:
   - Students can only view, mutate, or upload resumes for their own profile.
   - Recruiters can only access and update applications, interviews, and offers for opportunities posted by their company.
   - TPO and Admins have institutional oversight to verify profiles and coordinate drives.
4. **Credential Security**: Passwords are protected with BCrypt (strength 10). Failed logins return standard HTTP 401 Unauthorized without account enumeration.

## Consequences
- Clean separation of privileges across academic and corporate actors.
- Strong defense-in-depth against IDOR (Insecure Direct Object Reference) vulnerabilities.
