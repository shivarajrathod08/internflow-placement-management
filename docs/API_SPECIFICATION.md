# InternFlow — REST API Specification (`/api/v1`)

All endpoints are prefixed with `/api/v1`. Authentication is handled via Bearer JWT tokens in the `Authorization` header.

## 1. Authentication & Identity
- `POST /api/v1/auth/login`
  - Body: `{ email, password }`
  - Response: `{ token, type: "Bearer", user: { id, email, role, profileCompleted } }`
- `POST /api/v1/auth/register/student`
  - Body: `{ email, password, firstName, lastName, rollNumber, college, degree, branch, graduationYear, cgpa }`
  - Response: `{ token, user }`
- `POST /api/v1/auth/register/company`
  - Body: `{ email, password, companyName, industry, location, website }`
  - Response: `{ token, user }`
- `GET /api/v1/auth/me`
  - Headers: `Authorization: Bearer <token>`
  - Response: Current user details and role permissions.

## 2. Student Management
- `GET /api/v1/students/profile`
  - Returns current authenticated student's full profile, skills, projects, backlogs.
- `PUT /api/v1/students/profile`
  - Update profile details (first name, phone, bio, backlogs, cgpa).
- `POST /api/v1/students/skills`
  - Attach skill from canonical dictionary with proficiency level.
- `DELETE /api/v1/students/skills/{id}`
  - Remove skill from student profile.
- `POST /api/v1/students/verify/{id}` (TPO / Faculty Coordinator / Admin)
  - Verify student credentials.

## 3. Companies & Opportunities
- `GET /api/v1/companies` (Public / Paginated)
- `GET /api/v1/companies/profile` (Current recruiter's company)
- `PUT /api/v1/companies/profile`
- `GET /api/v1/internships` (Query params: `page`, `size`, `search`, `workMode`, `branch`, `minCgpa`, `status`)
- `GET /api/v1/internships/{id}`
- `POST /api/v1/internships` (Recruiter / TPO)
- `PUT /api/v1/internships/{id}/status` (Approve/Reject by TPO/Admin)

## 4. Deterministic Eligibility Engine
- `GET /api/v1/internships/{id}/eligibility`
  - Evaluates authenticated student against the opportunity's criteria.
  - Response:
  ```json
  {
    "internshipId": 12,
    "studentId": 5,
    "eligible": false,
    "status": "INELIGIBLE",
    "reasons": [
      "Minimum CGPA required is 8.00, your CGPA is 7.45",
      "Allowed branches are [Computer Science, Information Technology]; your branch is Mechanical"
    ],
    "criteria": {
      "minCgpa": 8.00,
      "maxBacklogs": 0,
      "allowedBranches": ["Computer Science", "Information Technology"],
      "graduationYear": 2026
    }
  }
  ```

## 5. Applications Pipeline
- `POST /api/v1/applications`
  - Body: `{ internshipId, coverNote }`
  - Enforces server-side eligibility evaluation and deadline checks.
- `GET /api/v1/applications/my` (Student's applications)
- `GET /api/v1/applications/internship/{id}` (Recruiter / TPO view)
- `PUT /api/v1/applications/{id}/status`
  - Body: `{ newStatus, notes }`
  - Validates legal state transitions via `ApplicationStateMachine`.

## 6. Placement Drives
- `GET /api/v1/placement-drives` (List all drives with status and date filters)
- `POST /api/v1/placement-drives` (TPO / Admin)
- `GET /api/v1/placement-drives/{id}`
- `PUT /api/v1/placement-drives/{id}`
- `GET /api/v1/placement-drives/{id}/eligible-candidates` (TPO / Recruiter)

## 7. Interviews
- `POST /api/v1/interviews/schedule` (Recruiter / TPO)
  - Body: `{ applicationId, scheduledAt, mode, meetingLink, roundName }`
- `GET /api/v1/interviews/my` (Student interviews)
- `GET /api/v1/interviews/application/{applicationId}`
- `PUT /api/v1/interviews/{id}/feedback`
  - Body: `{ status, feedback, rating }`

## 8. Offers & Joining
- `GET /api/v1/offers` (Filtered by role: Student gets own, Recruiter gets company's, TPO gets all)
- `POST /api/v1/offers` (Recruiter / TPO)
  - Body: `{ applicationId, designation, ctcOrStipend, offerLetterUrl, joiningDate }`
- `PUT /api/v1/offers/{id}/status`
  - Body: `{ status: "ACCEPTED" | "DECLINED", notes }`

## 9. Documents & Resumes
- `POST /api/v1/documents/upload` (Multipart file: PDF, max 10MB)
- `GET /api/v1/documents/download/{id}` (Secure authenticated streaming)
- `GET /api/v1/documents/my`

## 10. Notifications & Analytics
- `GET /api/v1/notifications` (Unread count, recent notifications)
- `PUT /api/v1/notifications/{id}/read`
- `PUT /api/v1/notifications/read-all`
- `GET /api/v1/analytics/student`
- `GET /api/v1/analytics/company`
- `GET /api/v1/analytics/admin`
- `GET /api/v1/analytics/export/placements.csv` (TPO / Admin CSV download)
