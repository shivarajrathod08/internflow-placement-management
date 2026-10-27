import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Role } from './types';

// Layouts
import { DashboardLayout } from './layouts/DashboardLayout';
import { PublicLayout } from './layouts/PublicLayout';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { NotFound } from './pages/public/NotFound';
import { Login } from './pages/auth/Login';
import { RegisterStudent } from './pages/auth/RegisterStudent';
import { RegisterCompany } from './pages/auth/RegisterCompany';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentProfile } from './pages/student/StudentProfile';
import { InternshipDiscovery } from './pages/student/InternshipDiscovery';
import { InternshipDetail } from './pages/student/InternshipDetail';
import { MyApplications } from './pages/student/MyApplications';
import { StudentInterviews } from './pages/student/StudentInterviews';
import { StudentDocuments } from './pages/student/StudentDocuments';

// Company Pages
import { CompanyDashboard } from './pages/company/CompanyDashboard';
import { CompanyProfile } from './pages/company/CompanyProfile';
import { PostInternship } from './pages/company/PostInternship';
import { ApplicantsPipeline } from './pages/company/ApplicantsPipeline';
import { CompanyInterviews } from './pages/company/CompanyInterviews';

// Admin / Placement Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProfile } from './pages/admin/AdminProfile';
import { CompanyApprovals } from './pages/admin/CompanyApprovals';
import { InternshipApprovals } from './pages/admin/InternshipApprovals';
import { DocumentVerifications } from './pages/admin/DocumentVerifications';
import { SkillManager } from './pages/admin/SkillManager';
import { AuditLogs } from './pages/admin/AuditLogs';
import { PlacementDrivesPage } from './pages/drives/PlacementDrivesPage';
import { OffersPage } from './pages/offers/OffersPage';
import { StudentVerificationPage } from './pages/admin/StudentVerificationPage';

// Helper component to redirect /profile based on role
const ProfileRedirect: React.FC = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'STUDENT') return <Navigate to="/student/profile" replace />;
  if (user.role === 'COMPANY' || user.role === 'RECRUITER') return <Navigate to="/company/profile" replace />;
  return <Navigate to="/admin/profile" replace />;
};

// Protected Route Component
interface ProtectedRouteProps {
  allowedRoles: Role[];
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to the user's role-appropriate home
    if (['ADMIN', 'TPO', 'FACULTY_COORDINATOR'].includes(user.role)) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (['COMPANY', 'RECRUITER'].includes(user.role)) {
      return <Navigate to="/company/dashboard" replace />;
    }
    return <Navigate to="/student/dashboard" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Layout Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register/student" element={<RegisterStudent />} />
              <Route path="/register/company" element={<RegisterCompany />} />
              <Route path="/404" element={<NotFound />} />
            </Route>

            {/* Authenticated Dashboard Layout Routes */}
            <Route element={<DashboardLayout />}>
              {/* Student Routes */}
              <Route
                path="/student/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/profile"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <StudentProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/internships"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <InternshipDiscovery />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/internships/:id"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <InternshipDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/applications"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <MyApplications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/offers"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <OffersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/interviews"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <StudentInterviews />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/documents"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <StudentDocuments />
                  </ProtectedRoute>
                }
              />

              {/* Company Recruiter Routes */}
              <Route
                path="/company/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['COMPANY', 'RECRUITER']}>
                    <CompanyDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/company/profile"
                element={
                  <ProtectedRoute allowedRoles={['COMPANY', 'RECRUITER']}>
                    <CompanyProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/company/post-internship"
                element={
                  <ProtectedRoute allowedRoles={['COMPANY', 'RECRUITER']}>
                    <PostInternship />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/company/applicants"
                element={
                  <ProtectedRoute allowedRoles={['COMPANY', 'RECRUITER']}>
                    <ApplicantsPipeline />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/company/offers"
                element={
                  <ProtectedRoute allowedRoles={['COMPANY', 'RECRUITER']}>
                    <OffersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/company/interviews"
                element={
                  <ProtectedRoute allowedRoles={['COMPANY', 'RECRUITER']}>
                    <CompanyInterviews />
                  </ProtectedRoute>
                }
              />

              {/* College Placement Admin & TPO Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'TPO', 'FACULTY_COORDINATOR']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/drives"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'TPO', 'FACULTY_COORDINATOR']}>
                    <PlacementDrivesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/offers"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'TPO', 'FACULTY_COORDINATOR']}>
                    <OffersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/students"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'TPO', 'FACULTY_COORDINATOR']}>
                    <StudentVerificationPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/companies"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'TPO', 'FACULTY_COORDINATOR']}>
                    <CompanyApprovals />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/internships"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'TPO', 'FACULTY_COORDINATOR']}>
                    <InternshipApprovals />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/documents"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'TPO', 'FACULTY_COORDINATOR']}>
                    <DocumentVerifications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/skills"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'TPO', 'FACULTY_COORDINATOR']}>
                    <SkillManager />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/audit-logs"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'TPO', 'FACULTY_COORDINATOR']}>
                    <AuditLogs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/profile"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'TPO', 'FACULTY_COORDINATOR']}>
                    <AdminProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT', 'COMPANY', 'RECRUITER', 'ADMIN', 'TPO', 'FACULTY_COORDINATOR']}>
                    <ProfileRedirect />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Role dashboard base redirects */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/company" element={<Navigate to="/company/dashboard" replace />} />
            <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />

            {/* Catch all - 404 for unknown routes */}
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
};
export default App;
