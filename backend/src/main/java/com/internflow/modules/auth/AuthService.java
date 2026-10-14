package com.internflow.modules.auth;

import com.internflow.exception.BadRequestException;
import com.internflow.exception.ResourceNotFoundException;
import com.internflow.modules.audit.AuditService;
import com.internflow.modules.company.Company;
import com.internflow.modules.company.CompanyRepository;
import com.internflow.modules.company.CompanyVerificationStatus;
import com.internflow.modules.notification.NotificationService;
import com.internflow.modules.notification.NotificationType;
import com.internflow.modules.student.Student;
import com.internflow.modules.student.StudentRepository;
import com.internflow.modules.user.Role;
import com.internflow.modules.user.User;
import com.internflow.modules.user.UserRepository;
import com.internflow.security.CustomUserDetails;
import com.internflow.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final AuditService auditService;
    private final NotificationService notificationService;

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().trim(), request.getPassword())
        );

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String jwt = tokenProvider.generateToken(authentication);

        Long profileId = null;
        String name = userDetails.getUsername();

        if (userDetails.getRole() == Role.STUDENT) {
            Student s = studentRepository.findByUserId(userDetails.getId()).orElse(null);
            if (s != null) {
                profileId = s.getId();
                name = s.getFirstName() + " " + s.getLastName();
            }
        } else if (userDetails.getRole() == Role.COMPANY) {
            Company c = companyRepository.findByUserId(userDetails.getId()).orElse(null);
            if (c != null) {
                profileId = c.getId();
                name = c.getCompanyName();
            }
        } else {
            name = "Campus Administrator";
        }

        auditService.log("USER_LOGIN", "User", userDetails.getId(), null, null, "Successful login for " + userDetails.getUsername());

        return AuthResponse.builder()
                .token(jwt)
                .userId(userDetails.getId())
                .email(userDetails.getUsername())
                .role(userDetails.getRole())
                .profileId(profileId)
                .name(name)
                .build();
    }

    @Transactional
    public AuthResponse registerStudent(RegisterStudentRequest request) {
        if (userRepository.existsByEmail(request.getEmail().trim())) {
            throw new BadRequestException("An account with this email already exists: " + request.getEmail());
        }

        User user = User.builder()
                .email(request.getEmail().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.STUDENT)
                .active(true)
                .build();

        User savedUser = userRepository.save(user);

        Student student = Student.builder()
                .user(savedUser)
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .phone(request.getPhone())
                .college(request.getCollege())
                .degree(request.getDegree())
                .branch(request.getBranch())
                .graduationYear(request.getGraduationYear())
                .cgpa(request.getCgpa())
                .build();

        Student savedStudent = studentRepository.save(student);

        CustomUserDetails userDetails = new CustomUserDetails(savedUser);
        String jwt = tokenProvider.generateTokenFromUserDetails(userDetails);

        auditService.log("REGISTER_STUDENT", "Student", savedStudent.getId(), null, "ACTIVE",
                "New student registered: " + savedUser.getEmail());

        notificationService.createNotification(
                savedUser.getId(),
                "Welcome to InternFlow! 🚀",
                "Complete your profile and add your technical skills to discover high-match internship opportunities.",
                NotificationType.INFO,
                "/student/profile"
        );

        return AuthResponse.builder()
                .token(jwt)
                .userId(savedUser.getId())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .profileId(savedStudent.getId())
                .name(savedStudent.getFirstName() + " " + savedStudent.getLastName())
                .build();
    }

    @Transactional
    public AuthResponse registerCompany(RegisterCompanyRequest request) {
        if (userRepository.existsByEmail(request.getEmail().trim())) {
            throw new BadRequestException("An account with this email already exists: " + request.getEmail());
        }

        User user = User.builder()
                .email(request.getEmail().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.COMPANY)
                .active(true)
                .build();

        User savedUser = userRepository.save(user);

        Company company = Company.builder()
                .user(savedUser)
                .companyName(request.getCompanyName().trim())
                .website(request.getWebsite())
                .description(request.getDescription())
                .industry(request.getIndustry())
                .location(request.getLocation())
                .verificationStatus(CompanyVerificationStatus.PENDING)
                .build();

        Company savedCompany = companyRepository.save(company);

        CustomUserDetails userDetails = new CustomUserDetails(savedUser);
        String jwt = tokenProvider.generateTokenFromUserDetails(userDetails);

        auditService.log("REGISTER_COMPANY", "Company", savedCompany.getId(), null, "PENDING",
                "New company registered awaiting KYC verification: " + savedCompany.getCompanyName());

        // Notify admins
        userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.ADMIN)
                .forEach(admin -> notificationService.createNotification(
                        admin.getId(),
                        "New Company Verification Request 🏢",
                        "Company '" + savedCompany.getCompanyName() + "' has registered and submitted profile for verification.",
                        NotificationType.ACTION_REQUIRED,
                        "/admin/companies"
                ));

        return AuthResponse.builder()
                .token(jwt)
                .userId(savedUser.getId())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .profileId(savedCompany.getId())
                .name(savedCompany.getCompanyName())
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Long profileId = null;
        String name = user.getEmail();

        if (user.getRole() == Role.STUDENT) {
            Student s = studentRepository.findByUserId(userId).orElse(null);
            if (s != null) {
                profileId = s.getId();
                name = s.getFirstName() + " " + s.getLastName();
            }
        } else if (user.getRole() == Role.COMPANY) {
            Company c = companyRepository.findByUserId(userId).orElse(null);
            if (c != null) {
                profileId = c.getId();
                name = c.getCompanyName();
            }
        } else {
            name = "Campus Administrator";
        }

        return AuthResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .profileId(profileId)
                .name(name)
                .build();
    }
}
