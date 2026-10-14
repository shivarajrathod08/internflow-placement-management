# InternFlow — API Contract Matrix

This document provides the authoritative end-to-end mapping between the React TypeScript frontend service layers and the Spring Boot 3 REST controllers.

## 1. Authentication & Identity (`/api/auth`)

| Frontend Method | Backend Endpoint | HTTP | Controller Method | Roles / Permissions | Request Payload | Response Schema |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `authApi.login` | `/api/auth/login` | POST | `AuthController.login` | Public (`permitAll()`) | `LoginRequest` (`email`, `password`) | `AuthResponse` (`token`, `type`, `userId`, `email`, `fullName`, `role`) |
| `authApi.register` | `/api/auth/register` | POST | `AuthController.register` | Public (`permitAll()`) | `RegisterRequest` (`email`, `password`, `fullName`, `role`, `phone`) | `AuthResponse` |
| `authApi.getCurrentUser` | `/api/auth/me` | GET | `AuthController.getCurrentUser` | `isAuthenticated()` | None | `UserDTO` (`id`, `email`, `fullName`, `role`, `isActive`) |

---

## 2. Student Profiles & Academic Data (`/api/students`)

| Frontend Method | Backend Endpoint | HTTP | Controller Method | Roles / Permissions | Request Payload | Response Schema |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `studentsApi.getProfile` | `/api/students/profile` | GET | `StudentController.getMyProfile` | `hasRole('STUDENT')` | None | `ApiResponse<StudentProfileDTO>` |
| `studentsApi.updateProfile` | `/api/students/profile` | PUT | `StudentController.updateMyProfile` | `hasRole('STUDENT')` | `UpdateStudentProfileRequest` (`cgpa`, `department`, `skills`, `bio`) | `ApiResponse<StudentProfileDTO>` |
| `studentsApi.getAll` | `/api/students` | GET | `StudentController.getAllStudents` | `hasAnyRole('TPO', 'FACULTY_COORDINATOR', 'ADMIN')` | Query params: `page`, `size` | `ApiResponse<PageResponse<StudentProfileDTO>>` |
| `studentsApi.getById` | `/api/students/{id}` | GET | `StudentController.getStudentById` | `TPO`, `ADMIN`, or Recruiter with applied candidate | Path param: `id` (UUID) | `ApiResponse<StudentProfileDTO>` |
| `studentsApi.getCandidateMatch` | `/api/students/{id}/match/{internshipId}` | GET | `StudentController.getCandidateMatch` | `TPO`, `ADMIN`, or Recruiter owner of internship | Path params: `id`, `internshipId` | `ApiResponse<CandidateMatchDTO>` |

---

## 3. Company & Recruiter Management (`/api/company` & `/api/companies`)

| Frontend Method | Backend Endpoint | HTTP | Controller Method | Roles / Permissions | Request Payload | Response Schema |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `companyApi.getProfile` | `/api/company/profile` | GET | `CompanyController.getMyProfile` | `hasRole('COMPANY_RECRUITER')` | None | `ApiResponse<CompanyProfileDTO>` |
| `companyApi.updateProfile` | `/api/company/profile` | PUT | `CompanyController.updateMyProfile` | `hasRole('COMPANY_RECRUITER')` | `UpdateCompanyProfileRequest` (`companyName`, `industry`, `website`) | `ApiResponse<CompanyProfileDTO>` |
| `adminApi.getPendingCompanies` | `/api/companies/pending` | GET | `CompanyController.getPendingCompanies` | `hasAnyRole('TPO', 'ADMIN')` | None | `ApiResponse<List<CompanyProfileDTO>>` |
| `adminApi.approveCompany` | `/api/companies/{id}/status` | PATCH | `CompanyController.updateCompanyStatus` | `hasAnyRole('TPO', 'ADMIN')` | `UpdateCompanyStatusRequest` (`status`, `rejectionReason`) | `ApiResponse<CompanyProfileDTO>` |

---

## 4. Internships & Opportunity Catalog (`/api/internships`)

| Frontend Method | Backend Endpoint | HTTP | Controller Method | Roles / Permissions | Request Payload | Response Schema |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `internshipsApi.getAllPublished` | `/api/internships` | GET | `InternshipController.getPublishedInternships` | Public / `isAuthenticated()` | Query params: `search`, `location`, `workMode`, `page`, `size` | `ApiResponse<PageResponse<InternshipDTO>>` |
| `internshipsApi.getById` | `/api/internships/{id}` | GET | `InternshipController.getInternshipById` | `isAuthenticated()` | Path param: `id` | `ApiResponse<InternshipDTO>` (Only published roles to students) |
| `companyApi.getCompanyInternships`| `/api/internships/company` | GET | `InternshipController.getMyCompanyInternships` | `hasRole('COMPANY_RECRUITER')` | Query params: `page`, `size` | `ApiResponse<PageResponse<InternshipDTO>>` |
| `companyApi.postInternship` | `/api/internships/company` | POST | `InternshipController.createInternship` | `hasRole('COMPANY_RECRUITER')` | `CreateInternshipRequest` | `ApiResponse<InternshipDTO>` |
| `adminApi.getPendingInternships` | `/api/internships/pending` | GET | `InternshipController.getPendingInternships` | `hasAnyRole('TPO', 'ADMIN')` | None | `ApiResponse<List<InternshipDTO>>` |
| `adminApi.approveInternship` | `/api/internships/{id}/approve` | PATCH | `InternshipController.approveInternship` | `hasAnyRole('TPO', 'ADMIN')` | Path param: `id` | `ApiResponse<InternshipDTO>` |

---

## 5. Applications & Selection Pipeline (`/api/applications`)

| Frontend Method | Backend Endpoint | HTTP | Controller Method | Roles / Permissions | Request Payload | Response Schema |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `applicationsApi.apply` | `/api/applications` | POST | `ApplicationController.submitApplication` | `hasRole('STUDENT')` | `SubmitApplicationRequest` (`internshipId`, `coverLetter`, `resumeId`) | `ApiResponse<ApplicationDTO>` |
| `applicationsApi.getMyApplications`| `/api/applications/student/me` | GET | `ApplicationController.getMyApplications` | `hasRole('STUDENT')` | Query params: `page`, `size` | `ApiResponse<PageResponse<ApplicationDTO>>` |
| `applicationsApi.getByCompany` | `/api/applications/company` | GET | `ApplicationController.getCompanyApplications` | `hasRole('COMPANY_RECRUITER')` | Query params: `internshipId`, `status`, `page`, `size` | `ApiResponse<PageResponse<ApplicationDTO>>` |
| `applicationsApi.updateStatus` | `/api/applications/{id}/status`| PATCH | `ApplicationController.updateApplicationStatus` | `COMPANY_RECRUITER`, `TPO`, `ADMIN` | `UpdateApplicationStatusRequest` (`status`, `notes`) | `ApiResponse<ApplicationDTO>` |

---

## 6. Interview Scheduling & Feedback (`/api/interviews`)

| Frontend Method | Backend Endpoint | HTTP | Controller Method | Roles / Permissions | Request Payload | Response Schema |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `interviewsApi.schedule` | `/api/interviews` | POST | `InterviewController.scheduleInterview` | `COMPANY_RECRUITER`, `TPO`, `ADMIN` | `ScheduleInterviewRequest` (`applicationId`, `scheduledAt`, `meetingLink`, `round`) | `ApiResponse<InterviewDTO>` |
| `interviewsApi.getMyInterviews` | `/api/interviews/student/me` | GET | `InterviewController.getMyInterviews` | `hasRole('STUDENT')` | None | `ApiResponse<List<InterviewDTO>>` |
| `interviewsApi.getCompanyInterviews`| `/api/interviews/company` | GET | `InterviewController.getCompanyInterviews` | `hasRole('COMPANY_RECRUITER')` | Query params: `page`, `size` | `ApiResponse<PageResponse<InterviewDTO>>` |
| `interviewsApi.reschedule` | `/api/interviews/{id}/reschedule` | PATCH | `InterviewController.rescheduleInterview` | `COMPANY_RECRUITER`, `TPO`, `ADMIN` | `RescheduleInterviewRequest` (`newScheduledAt`, `meetingLink`) | `ApiResponse<InterviewDTO>` |
| `interviewsApi.submitFeedback` | `/api/interviews/{id}/feedback` | POST | `InterviewController.submitFeedback` | `COMPANY_RECRUITER`, `TPO`, `ADMIN` | `InterviewFeedbackRequest` (`feedback`, `rating`, `outcome`, `status`) | `ApiResponse<InterviewDTO>` |

---

## 7. Placement Offers (`/api/offers`)

| Frontend Method | Backend Endpoint | HTTP | Controller Method | Roles / Permissions | Request Payload | Response Schema |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `offersApi.createOffer` | `/api/offers` | POST | `OfferController.createOffer` | `hasRole('COMPANY_RECRUITER')` | `CreateOfferRequest` (`applicationId`, `stipend`, `ctc`, `joiningDate`, `validUntil`) | `ApiResponse<OfferDTO>` |
| `offersApi.getMyOffers` | `/api/offers/student/me` | GET | `OfferController.getMyOffers` | `hasRole('STUDENT')` | None | `ApiResponse<List<OfferDTO>>` |
| `offersApi.getAllOffers` | `/api/offers` & `/api/offers/all` | GET | `OfferController.getAllOffers` | `hasAnyRole('TPO', 'FACULTY_COORDINATOR', 'ADMIN')` | Query params: `page`, `size` | `ApiResponse<PageResponse<OfferDTO>>` |
| `offersApi.getCompanyOffers` | `/api/offers/company/{companyId}` | GET | `OfferController.getOffersByCompany` | Recruiter of Company, `TPO`, `ADMIN` | Path param: `companyId` | `ApiResponse<List<OfferDTO>>` |
| `offersApi.updateStatus` | `/api/offers/{id}/status` | PATCH | `OfferController.updateOfferStatus` | `isAuthenticated()` (Role checked) | `UpdateOfferStatusRequest` (`status`, `responseNotes`) | `ApiResponse<OfferDTO>` |

---

## 8. Placement Drives (`/api/placement-drives`)

| Frontend Method | Backend Endpoint | HTTP | Controller Method | Roles / Permissions | Request Payload | Response Schema |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `placementDrivesApi.getAll` | `/api/placement-drives` | GET | `PlacementDriveController.getAllPlacementDrives` | `isAuthenticated()` | Query params: `page`, `size` | `ApiResponse<PageResponse<PlacementDriveDTO>>` |
| `placementDrivesApi.getById` | `/api/placement-drives/{id}` | GET | `PlacementDriveController.getPlacementDriveById` | `isAuthenticated()` | Path param: `id` | `ApiResponse<PlacementDriveDTO>` |
| `placementDrivesApi.create` | `/api/placement-drives` | POST | `PlacementDriveController.createPlacementDrive` | `hasAnyRole('TPO', 'ADMIN')` | `CreatePlacementDriveRequest` (`name`/`driveName`, `startDate`, `endDate`, `batchYear`, `maxBacklogs`) | `ApiResponse<PlacementDriveDTO>` |
| `placementDrivesApi.updateStatus` | `/api/placement-drives/{id}/status` | PATCH / PUT | `PlacementDriveController.updateStatus` | `hasAnyRole('TPO', 'ADMIN')` | Body or Param: `status` | `ApiResponse<PlacementDriveDTO>` |

---

## 9. Documents & Verification (`/api/documents`)

| Frontend Method | Backend Endpoint | HTTP | Controller Method | Roles / Permissions | Request Payload | Response Schema |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `documentsApi.upload` | `/api/documents/upload` | POST | `DocumentController.uploadDocument` | `hasRole('STUDENT')` | `multipart/form-data`: `file`, `documentType`, optional `applicationId` | `ApiResponse<DocumentDTO>` |
| `documentsApi.getMyDocs` | `/api/documents/student/me` | GET | `DocumentController.getMyDocuments` | `hasRole('STUDENT')` | None | `ApiResponse<List<DocumentDTO>>` |
| `documentsApi.download` | `/api/documents/{id}/download` | GET | `DocumentController.downloadDocument` | `isAuthenticated()` (Ownership & applicant verified) | Path param: `id` | Binary Octet Stream / Inline PDF |
| `adminApi.getPendingDocs` | `/api/documents/pending` | GET | `DocumentController.getPendingDocuments` | `hasAnyRole('TPO', 'ADMIN')` | None | `ApiResponse<List<DocumentDTO>>` |
| `adminApi.verifyDoc` | `/api/documents/{id}/verify` | PATCH | `DocumentController.verifyDocument` | `hasAnyRole('TPO', 'ADMIN')` | `VerifyDocumentRequest` (`status`, `remarks`) | `ApiResponse<DocumentDTO>` |
