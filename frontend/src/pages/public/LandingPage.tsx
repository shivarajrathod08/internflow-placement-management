import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  Building2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  GitBranch,
  Layers,
  FileCheck2,
  Search,
  CheckSquare,
  Send,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace('#', '');
      const element = document.getElementById(targetId);
      if (element) {
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
        return () => clearTimeout(timer);
      }
    }
  }, [location.hash, location.pathname]);

  const getDashboardRoute = () => {
    if (!user) return '/login';
    if (user.role === 'STUDENT') return '/student/dashboard';
    if (user.role === 'COMPANY' || user.role === 'RECRUITER') return '/company/dashboard';
    return '/admin/dashboard';
  };

  const getProfileRoute = () => {
    if (!user) return '/login';
    if (user.role === 'STUDENT') return '/student/profile';
    if (user.role === 'COMPANY' || user.role === 'RECRUITER') return '/company/profile';
    return '/admin/profile';
  };

  return (
    <div className="space-y-16 sm:space-y-20 py-8 sm:py-12">
      {/* Hero Section: Two-Column Campus Ledger Layout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Editorial Headline & Copy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#786E5E]">
                A Placement Platform for Indian Campuses
              </span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[56px] text-[#192844] leading-[1.08] tracking-tight font-normal">
              Every internship, from first match to final certificate.
            </h1>

            <p className="text-base sm:text-lg text-[#475569] leading-relaxed max-w-xl">
              InternFlow brings students, recruiters, and placement cells together in one clear workflow—from opportunity discovery and applications to interviews, offers, and joining.
            </p>

            {/* State-aware Actions */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              {user ? (
                <>
                  <Link
                    to={getDashboardRoute()}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-[#FFFCF7] bg-[#192844] hover:bg-[#24375d] transition-all shadow-xs active:scale-95"
                  >
                    <span>Open My Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to={getProfileRoute()}
                    className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm text-[#192844] bg-[#FFFCF7] hover:bg-[#F0EADF] border border-[#E5DED2] transition-colors shadow-xs"
                  >
                    <span>View Profile</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register/student"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-[#FFFCF7] bg-[#192844] hover:bg-[#24375d] transition-all shadow-xs active:scale-95"
                  >
                    <span>I'm a student</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/register/company"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-[#192844] bg-[#FFFCF7] hover:bg-[#F0EADF] border border-[#E5DED2] transition-colors shadow-xs"
                  >
                    <span>I'm hiring</span>
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#475569] hover:text-[#192844] transition-colors ml-1"
                  >
                    <span>Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </>
              )}
            </div>

            {/* Trust Marker */}
            <p className="text-xs text-[#786E5E] font-medium pt-2 border-t border-[#E5DED2]/80 max-w-lg">
              Used by 40+ partner institutions in the 2026–27 academic cycle.
            </p>
          </div>

          {/* Right Column: Campus Photograph */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl border border-[#E5DED2] bg-[#FFFCF7] p-2.5 shadow-sm">
              <div className="relative overflow-hidden rounded-xl aspect-[4/3] bg-[#F0EADF]">
                <img
                  src="/images/campus-students.jpg"
                  alt="University students walking together on campus"
                  className="w-full h-full object-cover"
                  loading="eager"
                  onError={(e) => {
                    // Fallback to secondary image if needed
                    const target = e.currentTarget;
                    if (!target.src.includes('campus-hero.jpg')) {
                      target.src = '/images/campus-hero.jpg';
                    }
                  }}
                />
              </div>
              <div className="pt-3 pb-1 px-2 flex items-center justify-between text-[11px] text-[#786E5E]">
                <span className="font-semibold text-[#192844]">Institutional Record System</span>
                <span>Active 2026 Placement Cycle</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stakeholder Cards Section */}
      <section id="stakeholders" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="mb-10 text-left">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#786E5E] block">
            Unified Multi-Sided Network
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#192844] font-normal mt-1">
            Purpose-built for all three placement partners.
          </h2>
          <p className="text-sm text-[#475569] mt-2 max-w-2xl">
            A single, auditable operating system uniting students, corporate recruiting teams, and institutional coordinators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Students */}
          <div
            id="students"
            className="scroll-mt-24 bg-[#FFFCF7] rounded-2xl p-7 border border-[#E5DED2] shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#F0EADF] text-[#192844] flex items-center justify-center border border-[#E5DED2]">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#192844]">For Students</h3>
                <p className="text-xs text-[#475569] mt-1 leading-relaxed">
                  Discover verified internships, review 5-factor eligibility matches, track live application stages, and accept offers.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-[#475569] pt-3 border-t border-[#E5DED2]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
                  <span>Explainable match scoring across skills, CGPA, and backlogs</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
                  <span>Transparent pipeline tracking from review to Day 1 joining</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
                  <span>Secure verified repository for resumes and completion certificates</span>
                </li>
              </ul>
            </div>

            <div className="pt-2">
              <Link
                to={user?.role === 'STUDENT' ? '/student/dashboard' : '/register/student'}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#192844] hover:text-[#4F46E5] transition-colors"
              >
                <span>{user?.role === 'STUDENT' ? 'Open Student Dashboard' : 'Register as Student'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: Employers */}
          <div
            id="employers"
            className="scroll-mt-24 bg-[#FFFCF7] rounded-2xl p-7 border border-[#E5DED2] shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#F0EADF] text-[#192844] flex items-center justify-center border border-[#E5DED2]">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#192844]">For Employers</h3>
                <p className="text-xs text-[#475569] mt-1 leading-relaxed">
                  Post structured opportunities, filter applicants with canonical skills, conduct technical rounds, and extend offers.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-[#475569] pt-3 border-t border-[#E5DED2]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
                  <span>Normalized skill taxonomy preventing resume buzzword distortion</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
                  <span>Stage-gated pipeline tracking with structured interview scorecards</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
                  <span>Formal candidate offer issuance with official letter distribution</span>
                </li>
              </ul>
            </div>

            <div className="pt-2">
              <Link
                to={user?.role === 'COMPANY' || user?.role === 'RECRUITER' ? '/company/dashboard' : '/register/company'}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#192844] hover:text-[#4F46E5] transition-colors"
              >
                <span>{user?.role === 'COMPANY' || user?.role === 'RECRUITER' ? 'Open Recruiter Dashboard' : 'Register as Employer'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 3: Placement Cells */}
          <div
            id="placement-cells"
            className="scroll-mt-24 bg-[#FFFCF7] rounded-2xl p-7 border border-[#E5DED2] shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#F0EADF] text-[#192844] flex items-center justify-center border border-[#E5DED2]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#192844]">For Placement Cells</h3>
                <p className="text-xs text-[#475569] mt-1 leading-relaxed">
                  Institutional governance over campus hiring. Verify company credentials, approve postings, and audit placement records.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-[#475569] pt-3 border-t border-[#E5DED2]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
                  <span>Employer KYC verification and job opportunity approval queues</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
                  <span>Placement drive scheduling with automated branch eligibility limits</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
                  <span>Immutable audit logging and live relational analytics export</span>
                </li>
              </ul>
            </div>

            <div className="pt-2">
              <Link
                to={user ? getDashboardRoute() : '/login'}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#192844] hover:text-[#4F46E5] transition-colors"
              >
                <span>{user ? 'Open Administration' : 'Sign In to Placement Portal'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Clear 4-Step Workflow Section (Campus Ledger Design Reference) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-left">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#786E5E] block">
            The Placement Lifecycle
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#192844] font-normal mt-1">
            One continuous record, from application to completion.
          </h2>
          <p className="text-sm text-[#475569] mt-2 max-w-2xl">
            Every transition is structured and verifiable. Students and employers follow an end-to-end recorded progression.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="bg-[#FFFCF7] border border-[#E5DED2] rounded-2xl p-6 space-y-3 shadow-xs">
            <div className="text-[11px] font-extrabold text-[#786E5E] uppercase tracking-wider">
              01 · Discover
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#F0EADF] text-[#192844] flex items-center justify-center">
              <Search className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-base text-[#192844]">Discover Opportunities</h4>
            <p className="text-xs text-[#475569] leading-relaxed">
              Browse verified internships and placement drives filtered strictly by your department, batch, and graduation year.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-[#FFFCF7] border border-[#E5DED2] rounded-2xl p-6 space-y-3 shadow-xs">
            <div className="text-[11px] font-extrabold text-[#786E5E] uppercase tracking-wider">
              02 · Check Eligibility
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#F0EADF] text-[#192844] flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-base text-[#192844]">Check Eligibility</h4>
            <p className="text-xs text-[#475569] leading-relaxed">
              Instant evaluation against minimum CGPA cutoffs, active backlogs, and academic department criteria before applying.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-[#FFFCF7] border border-[#E5DED2] rounded-2xl p-6 space-y-3 shadow-xs">
            <div className="text-[11px] font-extrabold text-[#786E5E] uppercase tracking-wider">
              03 · Apply & Track
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#F0EADF] text-[#192844] flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-base text-[#192844]">Apply & Track Progress</h4>
            <p className="text-xs text-[#475569] leading-relaxed">
              Submit applications using verified student credentials and monitor review status across each stage in real time.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-[#FFFCF7] border border-[#E5DED2] rounded-2xl p-6 space-y-3 shadow-xs">
            <div className="text-[11px] font-extrabold text-[#786E5E] uppercase tracking-wider">
              04 · Offers & Joining
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#F0EADF] text-[#192844] flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-base text-[#192844]">Interviews & Offers</h4>
            <p className="text-xs text-[#475569] leading-relaxed">
              Participate in scheduled interview rounds, receive formal compensation packages, and confirm Day 1 joining commitment.
            </p>
          </div>
        </div>
      </section>

      {/* Platform Capabilities: Warm Beige Cohesive Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#F0EADF] rounded-3xl p-8 sm:p-12 border border-[#E5DED2] space-y-10">
          <div className="text-left space-y-2 max-w-2xl">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#786E5E] block">
              Architectural Guarantees
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#192844] font-normal">
              Engineered with institutional integrity.
            </h2>
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
              Built on Spring Boot 3.3, JPA Hibernate, and relational PostgreSQL persistence with zero simulated records.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#FFFCF7] p-6 rounded-2xl border border-[#E5DED2] space-y-3 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-[#F0EADF] text-[#192844] flex items-center justify-center">
                <GitBranch className="w-4 h-4 text-[#4F46E5]" />
              </div>
              <h4 className="font-bold text-sm text-[#192844]">Strict State Machine</h4>
              <p className="text-xs text-[#475569] leading-relaxed">
                Application lifecycle transitions are validated in code to eliminate illegal state skips or skipped interview steps.
              </p>
            </div>

            <div className="bg-[#FFFCF7] p-6 rounded-2xl border border-[#E5DED2] space-y-3 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-[#F0EADF] text-[#192844] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#7C3AED]" />
              </div>
              <h4 className="font-bold text-sm text-[#192844]">Deterministic Match Engine</h4>
              <p className="text-xs text-[#475569] leading-relaxed">
                Evaluates student skill taxonomy, CGPA, and department requirements with transparent skill-gap explanations.
              </p>
            </div>

            <div className="bg-[#FFFCF7] p-6 rounded-2xl border border-[#E5DED2] space-y-3 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-[#F0EADF] text-[#192844] flex items-center justify-center">
                <FileCheck2 className="w-4 h-4 text-[#15803D]" />
              </div>
              <h4 className="font-bold text-sm text-[#192844]">Verified Document Storage</h4>
              <p className="text-xs text-[#475569] leading-relaxed">
                Authenticates student academic records and completion certificates with role-restricted access controls.
              </p>
            </div>

            <div className="bg-[#FFFCF7] p-6 rounded-2xl border border-[#E5DED2] space-y-3 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-[#F0EADF] text-[#192844] flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-[#B45309]" />
              </div>
              <h4 className="font-bold text-sm text-[#192844]">Live Relational Analytics</h4>
              <p className="text-xs text-[#475569] leading-relaxed">
                Calculated directly from active relational database records with full audit trail logging for all transitions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-[#FFFCF7] border border-[#E5DED2] rounded-3xl p-8 sm:p-12 text-center shadow-xs space-y-4">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#786E5E] block">
            Academic Year 2026–2027
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#192844] font-normal">
            Ready to modernize your campus placement cycle?
          </h2>
          <p className="text-xs sm:text-sm text-[#475569] max-w-lg mx-auto leading-relaxed">
            InternFlow connects students, recruiters, and placement administration on one coherent, verified ledger.
          </p>

          <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
            {user ? (
              <Link
                to={getDashboardRoute()}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-sm text-[#FFFCF7] bg-[#192844] hover:bg-[#24375d] transition-all shadow-xs active:scale-95"
              >
                <span>Access My Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-[#FFFCF7] bg-[#192844] hover:bg-[#24375d] transition-all shadow-xs active:scale-95"
                >
                  <span>Sign In to Platform</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/register/student"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-[#192844] bg-[#FFFCF7] hover:bg-[#F0EADF] border border-[#E5DED2] transition-colors shadow-xs"
                >
                  <span>Register as Student</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
