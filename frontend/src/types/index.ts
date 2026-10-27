export type Role = 'STUDENT' | 'COMPANY' | 'RECRUITER' | 'TPO' | 'FACULTY_COORDINATOR' | 'ADMIN';

export type CompanyVerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export type InternshipStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';

export type WorkMode = 'REMOTE' | 'ON_SITE' | 'HYBRID';

export type ApplicationStatus =
  | 'APPLIED'
  | 'UNDER_REVIEW'
  | 'SHORTLISTED'
  | 'INTERVIEW_SCHEDULED'
  | 'INTERVIEW_COMPLETED'
  | 'SELECTED'
  | 'REJECTED'
  | 'JOINED'
  | 'IN_PROGRESS'
  | 'COMPLETION_SUBMITTED'
  | 'VERIFICATION_PENDING'
  | 'COMPLETED'
  | 'WITHDRAWN';

export type InterviewStatus = 'SCHEDULED' | 'RESCHEDULED' | 'COMPLETED' | 'CANCELLED';
export type InterviewMode = 'ONLINE' | 'IN_PERSON' | 'PHONE';

export type DocumentType =
  | 'RESUME'
  | 'OFFER_LETTER'
  | 'JOINING_REPORT'
  | 'COMPLETION_CERTIFICATE'
  | 'EVALUATION_REPORT';

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ACTION_REQUIRED';

export interface User {
  id: number;
  email: string;
  role: Role;
  name?: string;
  profileId?: number;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: number;
  email: string;
  role: Role;
  profileId?: number;
  name?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface StudentSkill {
  id: number;
  skillId: number;
  skillName: string;
  category: string;
  proficiencyLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  yearsExperience: number;
}

export interface StudentProject {
  id?: number;
  title: string;
  description: string;
  techStack?: string;
  githubUrl?: string;
  liveUrl?: string;
}

export interface StudentExperience {
  id?: number;
  organizationName: string;
  role: string;
  startDate?: string;
  endDate?: string;
  current: boolean;
  description?: string;
}

export interface StudentCertification {
  id?: number;
  name: string;
  issuingOrg: string;
  issueDate?: string;
  credentialUrl?: string;
}

export type ProjectDTO = StudentProject;
export type ExperienceDTO = StudentExperience;
export type CertificationDTO = StudentCertification;

export interface StudentProfile {
  id: number;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  rollNumber?: string;
  phone?: string;
  college?: string;
  degree?: string;
  branch?: string;
  graduationYear?: number;
  cgpa?: number;
  activeBacklogs?: number;
  totalBacklogs?: number;
  isVerified?: boolean;
  bio?: string;
  resumeUrl?: string;
  profilePicUrl?: string;
  profileCompletionPercentage: number;
  skills: StudentSkill[];
  projects: StudentProject[];
  experiences: StudentExperience[];
  certifications: StudentCertification[];
}

export interface CompanyProfile {
  id: number;
  userId: number;
  email: string;
  companyName: string;
  website?: string;
  description?: string;
  industry?: string;
  location?: string;
  logoUrl?: string;
  verificationStatus: CompanyVerificationStatus;
  rejectionReason?: string;
  verifiedAt?: string;
  createdAt: string;
}

export interface Internship {
  id: number;
  companyId: number;
  companyName: string;
  companyLogo?: string;
  companyIndustry?: string;
  title: string;
  description: string;
  location?: string;
  workMode: WorkMode;
  durationMonths: number;
  stipendPerMonth: number;
  minCgpa: number;
  allowedBranches?: string;
  graduationYear?: number;
  maxBacklogs?: number;
  applicationDeadline: string;
  openings: number;
  status: InternshipStatus;
  rejectionReason?: string;
  approvedAt?: string;
  createdAt: string;
  requiredSkills: string[];
  preferredSkills: string[];
  applicantCount?: number;
}

export interface ApplicationHistory {
  id: number;
  fromStatus?: ApplicationStatus;
  toStatus: ApplicationStatus;
  changedByEmail: string;
  notes?: string;
  createdAt: string;
}

export interface Application {
  id: number;
  internshipId: number;
  internshipTitle: string;
  internshipLocation?: string;
  companyId: number;
  companyName: string;
  companyLogo?: string;
  studentId: number;
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  studentCollege?: string;
  studentBranch?: string;
  studentCgpa?: number;
  studentResumeUrl?: string;
  currentStatus: ApplicationStatus;
  coverNote?: string;
  matchScoreAtApplication?: number;
  appliedAt: string;
  updatedAt: string;
  history: ApplicationHistory[];
}

export interface Interview {
  id: number;
  applicationId: number;
  internshipId: number;
  internshipTitle: string;
  companyName: string;
  companyLogo?: string;
  studentId: number;
  studentName: string;
  studentEmail: string;
  scheduledAt: string;
  meetingLink?: string;
  mode: InterviewMode;
  status: InterviewStatus;
  feedback?: string;
  rating?: number;
  createdAt: string;
}

export interface Document {
  id: number;
  studentId: number;
  studentName: string;
  applicationId?: number;
  internshipTitle?: string;
  documentType: DocumentType;
  fileName: string;
  downloadUrl: string;
  fileSize: number;
  mimeType: string;
  verificationStatus: VerificationStatus;
  rejectionReason?: string;
  uploadedAt: string;
  verifiedAt?: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  linkUrl?: string;
  createdAt: string;
}

export interface MatchResult {
  matchScore: number;
  eligible: boolean;
  eligibilityNotes: string[];
  matchedRequiredSkills: string[];
  missingRequiredSkills: string[];
  matchedPreferredSkills: string[];
  missingPreferredSkills: string[];
  requiredSkillsScore: number;
  preferredSkillsScore: number;
  experienceScore: number;
  academicScore: number;
  completenessScore: number;
  explanation: string;
}

export interface SkillGap {
  internshipTitle: string;
  companyName: string;
  matchScore: number;
  eligible: boolean;
  missingRequiredSkills: string[];
  missingPreferredSkills: string[];
  recommendations: string[];
}

export interface SkillItem {
  id: number;
  canonicalName: string;
  category: string;
  description?: string;
  aliases: string[];
}

export interface AuditLogItem {
  id: number;
  userId?: number;
  userEmail: string;
  role: string;
  action: string;
  entityName: string;
  entityId?: number;
  previousState?: string;
  newState?: string;
  ipAddress?: string;
  details?: string;
  createdAt: string;
}

export interface AdminAnalytics {
  totalStudents: number;
  totalCompanies: number;
  verifiedCompanies: number;
  pendingCompanies: number;
  totalInternships: number;
  publishedInternships: number;
  pendingInternships: number;
  totalApplications: number;
  shortlistedCount: number;
  selectedCount: number;
  completedCount: number;
  shortlistRate: number;
  selectionRate: number;
  completionRate: number;
  applicationsByStatus: Record<string, number>;
  topDemandedSkills: Record<string, number>;
  internshipsByWorkMode: Record<string, number>;
}

export interface CompanyAnalytics {
  totalPostings: number;
  publishedPostings: number;
  pendingPostings: number;
  totalApplicants: number;
  shortlistedApplicants: number;
  interviewedApplicants: number;
  selectedApplicants: number;
  shortlistConversionRate: number;
  hireConversionRate: number;
  applicationsByStatus: Record<string, number>;
}

export interface StudentAnalytics {
  totalApplications: number;
  underReviewCount: number;
  shortlistedCount: number;
  interviewScheduledCount: number;
  selectedCount: number;
  completedCount: number;
  profileCompletionPercentage: number;
  statusCounts: Record<string, number>;
}

export type PlacementDriveStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export interface PlacementDrive {
  id: number;
  name: string;
  academicYear: string;
  batchYear: number;
  startDate: string;
  endDate?: string;
  status: PlacementDriveStatus;
  description?: string;
  eligibleBranches?: string;
  minCgpa?: number;
  maxBacklogs?: number;
  internshipCount?: number;
  offersCount?: number;
  createdAt: string;
}

export interface CreatePlacementDriveRequest {
  name: string;
  academicYear: string;
  batchYear: number;
  startDate: string;
  endDate?: string;
  description?: string;
  eligibleBranches?: string;
  minCgpa?: number;
  maxBacklogs?: number;
}

export type OfferStatus = 'OFFERED' | 'ACCEPTED' | 'REJECTED' | 'DECLINED' | 'JOINED' | 'REVOKED';

export interface Offer {
  id: number;
  applicationId: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  studentRollNumber?: string;
  studentBranch?: string;
  companyId: number;
  companyName: string;
  internshipId: number;
  internshipTitle: string;
  placementDriveId?: number;
  placementDriveName?: string;
  stipendOrSalary?: number;
  designation?: string;
  location?: string;
  offerLetterUrl?: string;
  joiningDate?: string;
  status: OfferStatus;
  studentRemarks?: string;
  offeredAt: string;
  respondedAt?: string;
  joinedAt?: string;
}

export interface CreateOfferRequest {
  applicationId: number;
  placementDriveId?: number;
  stipendOrSalary?: number;
  designation?: string;
  location?: string;
  offerLetterUrl?: string;
  joiningDate?: string;
}

export type EligibilityStatus = 'ELIGIBLE' | 'INELIGIBLE' | 'CONDITIONAL';

export interface EligibilityEvaluationResult {
  status: EligibilityStatus;
  eligible: boolean;
  reasons: string[];
  missingRequirements: string[];
  branchMatched: boolean;
  cgpaSatisfied: boolean;
  backlogsSatisfied: boolean;
  graduationYearMatched: boolean;
}

