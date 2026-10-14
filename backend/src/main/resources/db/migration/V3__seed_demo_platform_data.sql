-- ==========================================================
-- INTERNFLOW V3: DEMO SEED DATA
-- Default password for all seed accounts: Password@123
-- ==========================================================

-- 1. Users (BCrypt encoded for 'Password@123')
INSERT INTO users (id, email, password_hash, role, is_active, created_at, updated_at) VALUES
(1, 'admin@internflow.edu', '$2a$10$wK1kKx.eS90I84p7X6e2qO9i5lq4x0pU.f9O1oYJ1S8b3F1H5l6nK', 'ADMIN', TRUE, NOW(), NOW()),
(2, 'recruiter@google.com', '$2a$10$wK1kKx.eS90I84p7X6e2qO9i5lq4x0pU.f9O1oYJ1S8b3F1H5l6nK', 'COMPANY', TRUE, NOW(), NOW()),
(3, 'recruiter@startup.io', '$2a$10$wK1kKx.eS90I84p7X6e2qO9i5lq4x0pU.f9O1oYJ1S8b3F1H5l6nK', 'COMPANY', TRUE, NOW(), NOW()),
(4, 'recruiter@microsoft.com', '$2a$10$wK1kKx.eS90I84p7X6e2qO9i5lq4x0pU.f9O1oYJ1S8b3F1H5l6nK', 'COMPANY', TRUE, NOW(), NOW()),
(5, 'student@college.edu', '$2a$10$wK1kKx.eS90I84p7X6e2qO9i5lq4x0pU.f9O1oYJ1S8b3F1H5l6nK', 'STUDENT', TRUE, NOW(), NOW()),
(6, 'emily.watson@mit.edu', '$2a$10$wK1kKx.eS90I84p7X6e2qO9i5lq4x0pU.f9O1oYJ1S8b3F1H5l6nK', 'STUDENT', TRUE, NOW(), NOW()),
(7, 'david.kim@berkeley.edu', '$2a$10$wK1kKx.eS90I84p7X6e2qO9i5lq4x0pU.f9O1oYJ1S8b3F1H5l6nK', 'STUDENT', TRUE, NOW(), NOW()),
(8, 'tpo@internflow.edu', '$2a$10$wK1kKx.eS90I84p7X6e2qO9i5lq4x0pU.f9O1oYJ1S8b3F1H5l6nK', 'TPO', TRUE, NOW(), NOW()),
(9, 'faculty@internflow.edu', '$2a$10$wK1kKx.eS90I84p7X6e2qO9i5lq4x0pU.f9O1oYJ1S8b3F1H5l6nK', 'FACULTY_COORDINATOR', TRUE, NOW(), NOW());

-- 2. Companies
INSERT INTO companies (id, user_id, company_name, website, description, industry, location, logo_url, verification_status, rejection_reason, verified_by_admin_id, verified_at, created_at, updated_at) VALUES
(1, 2, 'Google LLC', 'https://about.google', 'Global technology leader in search, cloud, AI, and operating systems.', 'Technology / Cloud', 'Mountain View, CA', 'https://www.google.com/favicon.ico', 'APPROVED', NULL, 1, NOW(), NOW(), NOW()),
(2, 3, 'NextGen AI Labs', 'https://nextgen-ai.io', 'Early-stage cutting edge frontier AI startup specializing in agentic workflows.', 'Artificial Intelligence', 'San Francisco, CA', NULL, 'PENDING', NULL, NULL, NULL, NOW(), NOW()),
(3, 4, 'Microsoft Corporation', 'https://microsoft.com', 'Empowering every person and organization on the planet to achieve more.', 'Enterprise Software / Cloud', 'Redmond, WA', 'https://www.microsoft.com/favicon.ico', 'APPROVED', NULL, 1, NOW(), NOW(), NOW());

-- 3. Students
INSERT INTO students (id, user_id, first_name, last_name, phone, college, degree, branch, graduation_year, cgpa, bio, resume_url, profile_pic_url, created_at, updated_at) VALUES
(1, 5, 'Alex', 'Rivera', '+1 (555) 234-5678', 'Stanford University', 'B.S.', 'Computer Science', 2026, 8.85, 'Aspiring distributed systems and backend engineer passionate about high-throughput APIs and cloud architecture.', '/uploads/resumes/alex_rivera_resume.pdf', NULL, NOW(), NOW()),
(2, 6, 'Emily', 'Watson', '+1 (555) 876-5432', 'Massachusetts Institute of Technology', 'B.Tech', 'Information Technology', 2026, 9.20, 'Machine learning researcher and deep learning practitioner specializing in NLP and LLM alignment.', '/uploads/resumes/emily_watson_resume.pdf', NULL, NOW(), NOW()),
(3, 7, 'David', 'Kim', '+1 (555) 345-6789', 'UC Berkeley', 'B.S.', 'Electrical Engineering & CS', 2026, 7.90, 'Full-stack builder interested in modern web frameworks and developer tooling.', NULL, NULL, NOW(), NOW());

-- 4. Student Skills
-- Alex (Java, Spring Boot, MySQL, React, Docker)
INSERT INTO student_skills (student_id, skill_id, proficiency_level, years_experience) VALUES
(1, 1, 'ADVANCED', 3.0),      -- Java
(1, 2, 'ADVANCED', 2.0),      -- Spring Boot
(1, 22, 'INTERMEDIATE', 2.0), -- MySQL
(1, 15, 'INTERMEDIATE', 1.5), -- React
(1, 28, 'BEGINNER', 1.0);     -- Docker

-- Emily (Python, FastAPI, Machine Learning, PyTorch, PostgreSQL)
INSERT INTO student_skills (student_id, skill_id, proficiency_level, years_experience) VALUES
(2, 3, 'ADVANCED', 3.5),      -- Python
(2, 5, 'ADVANCED', 2.0),      -- FastAPI
(2, 36, 'ADVANCED', 2.5),     -- Machine Learning
(2, 39, 'INTERMEDIATE', 2.0), -- PyTorch
(2, 23, 'INTERMEDIATE', 2.0); -- PostgreSQL

-- David (JavaScript, TypeScript, React, Node.js)
INSERT INTO student_skills (student_id, skill_id, proficiency_level, years_experience) VALUES
(3, 13, 'ADVANCED', 2.5),     -- JavaScript
(3, 14, 'INTERMEDIATE', 2.0), -- TypeScript
(3, 15, 'ADVANCED', 2.0),     -- React
(3, 6, 'INTERMEDIATE', 1.5);  -- Node.js

-- 5. Student Projects
INSERT INTO student_projects (student_id, title, description, tech_stack, github_url, live_url) VALUES
(1, 'Distributed Key-Value Store', 'Raft-consensus based replicated key-value storage engine built in Java.', 'Java, gRPC, RocksDB, Docker', 'https://github.com/alexrivera/raft-kv', 'https://raft-kv-demo.internal'),
(1, 'Campus Event Booking System', 'Full stack microservices booking platform with real-time seat reservation.', 'Spring Boot, MySQL, Redis, React', 'https://github.com/alexrivera/campus-events', NULL),
(2, 'Multi-Modal Vision Transformer', 'Fine-tuned vision-language model for medical image captioning.', 'Python, PyTorch, HuggingFace, FastAPI', 'https://github.com/emilywatson/med-vit', 'https://med-vit.demo.org'),
(3, 'Developer Code Snippet Manager', 'Cloud synchronized code snippet workspace with syntax highlighting.', 'React, TypeScript, Tailwind, Node.js', 'https://github.com/davidkim/snippets', 'https://snippets.app');

-- 6. Student Experiences
INSERT INTO student_experiences (student_id, organization_name, role, start_date, end_date, is_current, description) VALUES
(1, 'TechCorp Solutions', 'Backend Engineering Intern', '2025-05-01', '2025-08-15', FALSE, 'Designed and implemented high-throughput REST APIs handling 5,000+ RPS. Optimized MySQL query bottlenecks and added Redis caching layer.');

-- 7. Student Certifications
INSERT INTO student_certifications (student_id, name, issuing_org, issue_date, credential_url) VALUES
(1, 'AWS Certified Solutions Architect - Associate', 'Amazon Web Services', '2025-11-10', 'https://aws.amazon.com/verification/12345'),
(2, 'TensorFlow Developer Certificate', 'Google DeepMind / TensorFlow', '2025-09-20', 'https://certificate.google/tf-12345');

-- 8. Internships
INSERT INTO internships (id, company_id, title, description, location, work_mode, duration_months, stipend_per_month, min_cgpa, allowed_branches, graduation_year, application_deadline, openings, status, rejection_reason, approved_by_admin_id, approved_at, created_at, updated_at) VALUES
(1, 1, 'Software Engineering Intern - Cloud Platforms', 'Join Google Cloud engineering team to architect, build, and deploy resilient backend microservices for global scale enterprise infrastructure.', 'Sunnyvale, CA', 'HYBRID', 6, 8500.00, 7.50, 'Computer Science, Information Technology, Electrical Engineering', 2026, '2026-12-31 23:59:59', 5, 'PUBLISHED', NULL, 1, NOW(), NOW(), NOW()),
(2, 1, 'Frontend Engineering Intern - Design Systems', 'Help build and maintain Google web design system components, optimizing render performance and accessibility across millions of user sessions.', 'Mountain View, CA', 'ON_SITE', 3, 7800.00, 7.00, 'Computer Science, Information Technology', 2026, '2026-11-30 23:59:59', 3, 'PUBLISHED', NULL, 1, NOW(), NOW(), NOW()),
(3, 3, 'AI / Machine Learning Research Intern', 'Work closely with Microsoft Research to explore LLM evaluation, agentic planning, and efficient inference optimization on Azure AI.', 'Redmond, WA', 'HYBRID', 6, 9200.00, 8.00, 'Computer Science, Artificial Intelligence, Data Science', 2026, '2026-12-15 23:59:59', 2, 'PUBLISHED', NULL, 1, NOW(), NOW(), NOW()),
(4, 2, 'Autonomous Agents Engineer Intern', 'Build generative AI and LLM agent toolchains for enterprise workflow automation.', 'San Francisco, CA', 'REMOTE', 6, 6000.00, 7.00, 'All Branches', 2026, '2026-10-31 23:59:59', 2, 'PENDING_APPROVAL', NULL, NULL, NULL, NOW(), NOW());

-- 9. Internship Skills
-- Google Cloud Backend: Required (Java, Spring Boot, MySQL), Preferred (Docker, Kubernetes)
INSERT INTO internship_skills (internship_id, skill_id, is_required) VALUES
(1, 1, TRUE),   -- Java
(1, 2, TRUE),   -- Spring Boot
(1, 22, TRUE),  -- MySQL
(1, 28, FALSE), -- Docker
(1, 29, FALSE); -- Kubernetes

-- Google Frontend: Required (JavaScript, TypeScript, React), Preferred (Tailwind CSS)
INSERT INTO internship_skills (internship_id, skill_id, is_required) VALUES
(2, 13, TRUE),  -- JavaScript
(2, 14, TRUE),  -- TypeScript
(2, 15, TRUE),  -- React
(2, 19, FALSE); -- Tailwind CSS

-- Microsoft AI: Required (Python, Machine Learning), Preferred (PyTorch, FastAPI, Docker)
INSERT INTO internship_skills (internship_id, skill_id, is_required) VALUES
(3, 3, TRUE),   -- Python
(3, 36, TRUE),  -- Machine Learning
(3, 39, FALSE), -- PyTorch
(3, 5, FALSE),  -- FastAPI
(3, 28, FALSE); -- Docker

-- 10. Applications
INSERT INTO applications (id, internship_id, student_id, current_status, cover_note, match_score_at_application, applied_at, updated_at) VALUES
(1, 1, 1, 'SHORTLISTED', 'I have built distributed systems in Java and optimized Spring Boot APIs with MySQL.', 92, NOW(), NOW()),
(2, 3, 1, 'INTERVIEW_SCHEDULED', 'Passionate about systems and scaling machine learning inference pipelines.', 74, NOW(), NOW()),
(3, 3, 2, 'SELECTED', 'Extensive research experience in PyTorch, transformers, and FastAPI deployment.', 96, NOW(), NOW()),
(4, 1, 3, 'APPLIED', 'Eager to learn enterprise cloud systems and expand backend experience.', 65, NOW(), NOW());

-- 11. Application Status History
INSERT INTO application_status_history (application_id, from_status, to_status, changed_by_user_id, notes, created_at) VALUES
(1, 'APPLIED', 'UNDER_REVIEW', 2, 'Profile reviewed by engineering hiring manager.', NOW()),
(1, 'UNDER_REVIEW', 'SHORTLISTED', 2, 'Excellent hands-on projects and relevant coursework.', NOW()),
(2, 'APPLIED', 'UNDER_REVIEW', 4, 'Screening candidate.', NOW()),
(2, 'UNDER_REVIEW', 'SHORTLISTED', 4, 'Strong analytical profile.', NOW()),
(2, 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 4, 'Scheduled technical round.', NOW()),
(3, 'APPLIED', 'UNDER_REVIEW', 4, 'Reviewing research papers.', NOW()),
(3, 'UNDER_REVIEW', 'SHORTLISTED', 4, 'Top tier candidate.', NOW()),
(3, 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 4, 'Technical interview scheduled.', NOW()),
(3, 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 4, 'Scored 5/5 in technical interview.', NOW()),
(3, 'INTERVIEW_COMPLETED', 'SELECTED', 4, 'Official internship offer letter extended.', NOW()),
(4, NULL, 'APPLIED', 7, 'Submitted initial application.', NOW());

-- 12. Interviews
INSERT INTO interviews (id, application_id, scheduled_at, meeting_link, mode, status, feedback, rating, created_at, updated_at) VALUES
(1, 2, '2026-09-15 14:00:00', 'https://meet.microsoft.com/xyz-123-abc', 'ONLINE', 'SCHEDULED', NULL, NULL, NOW(), NOW()),
(2, 3, '2026-08-20 10:00:00', 'https://meet.microsoft.com/def-456-ghi', 'ONLINE', 'COMPLETED', 'Candidate showed deep understanding of attention mechanisms and demonstrated crisp coding in PyTorch.', 5, NOW(), NOW());

-- 13. Documents
INSERT INTO documents (id, student_id, application_id, document_type, file_name, file_path, file_size, mime_type, verification_status, rejection_reason, verified_by_admin_id, uploaded_at, verified_at) VALUES
(1, 1, NULL, 'RESUME', 'Alex_Rivera_Resume.pdf', '/uploads/resumes/alex_rivera_resume.pdf', 245760, 'application/pdf', 'VERIFIED', NULL, 1, NOW(), NOW()),
(2, 2, 3, 'OFFER_LETTER', 'Microsoft_Offer_Emily_Watson.pdf', '/uploads/offers/msft_offer_emily.pdf', 312500, 'application/pdf', 'VERIFIED', NULL, 1, NOW(), NOW());

-- 14. Notifications
INSERT INTO notifications (id, user_id, title, message, type, is_read, link_url, created_at) VALUES
(1, 5, 'Application Shortlisted! 🎉', 'Your application for Software Engineering Intern - Cloud Platforms at Google LLC has been shortlisted.', 'SUCCESS', FALSE, '/student/applications', NOW()),
(2, 5, 'Interview Scheduled 📅', 'Microsoft has scheduled a technical interview for AI / Machine Learning Research Intern on Sept 15, 2026.', 'INFO', FALSE, '/student/interviews', NOW()),
(3, 6, 'Congratulations! You are Selected! 🚀', 'Microsoft Corporation has selected you for the AI / Machine Learning Research Intern position.', 'SUCCESS', FALSE, '/student/applications', NOW()),
(4, 1, 'Company Verification Pending', 'NextGen AI Labs has submitted a verification request.', 'ACTION_REQUIRED', FALSE, '/admin/companies', NOW()),
(5, 1, 'Internship Posting Approval Pending', 'Autonomous Agents Engineer Intern from NextGen AI Labs is awaiting admin approval.', 'ACTION_REQUIRED', FALSE, '/admin/internships', NOW());

-- 15. Audit Logs
INSERT INTO audit_logs (id, user_id, user_email, role, action, entity_name, entity_id, previous_state, new_state, ip_address, details, created_at) VALUES
(1, 1, 'admin@internflow.edu', 'ADMIN', 'ADMIN_APPROVED_COMPANY', 'Company', 1, 'PENDING', 'APPROVED', '127.0.0.1', 'Google LLC verified by campus administrator.', NOW()),
(2, 1, 'admin@internflow.edu', 'ADMIN', 'ADMIN_APPROVED_INTERNSHIP', 'Internship', 1, 'PENDING_APPROVAL', 'APPROVED', '127.0.0.1', 'Approved posting for Software Engineering Intern.', NOW()),
(3, 2, 'recruiter@google.com', 'COMPANY', 'COMPANY_SHORTLISTED_STUDENT', 'Application', 1, 'UNDER_REVIEW', 'SHORTLISTED', '127.0.0.1', 'Candidate Alex Rivera shortlisted by hiring team.', NOW()),
(4, 4, 'recruiter@microsoft.com', 'COMPANY', 'COMPANY_SELECTED_STUDENT', 'Application', 3, 'INTERVIEW_COMPLETED', 'SELECTED', '127.0.0.1', 'Candidate Emily Watson selected for AI research position.', NOW()),
(5, 1, 'admin@internflow.edu', 'ADMIN', 'ADMIN_VERIFIED_DOCUMENT', 'Document', 1, 'PENDING', 'VERIFIED', '127.0.0.1', 'Alex Rivera resume verified by admin.', NOW());
