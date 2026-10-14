import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  GraduationCap,
  Building2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  GitBranch,
  Layers,
  FileCheck2,
  Clock,
  Compass,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),white)] opacity-70" />
        <div className="max-w-5xl mx-auto text-center space-y-6 px-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Enterprise Internship & Placement Operating System
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight leading-tight">
            Connect Students, Recruiters & Placement Cells in{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700">
              One Unified Flow.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-gray-600">
            From smart talent matching to strict application state machines, technical interview scheduling, document KYC, and audit trails — InternFlow powers modern university campus placements.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all hover:scale-105"
            >
              Sign In to Platform
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/register/student"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-semibold text-sm text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 shadow-sm transition-all"
            >
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              Student Registration
            </Link>
            <Link
              to="/register/company"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-semibold text-sm text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 shadow-sm transition-all"
            >
              <Building2 className="w-4 h-4 text-indigo-600" />
              Employer Registration
            </Link>
          </div>
        </div>
      </section>

      {/* 3 Stakeholders Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-xs uppercase font-bold tracking-widest text-indigo-600">Unified Multi-Sided Network</h2>
          <h3 className="text-3xl font-extrabold text-gray-900 mt-2">Purpose-Built for All 3 Stakeholders</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Students */}
          <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm hover:shadow-xl transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-gray-900">For Students</h4>
            <p className="text-sm text-gray-600">
              Discover verified on-campus and virtual internships. View your transparent 5-factor match score and skill gaps before applying.
            </p>
            <ul className="space-y-2 text-xs text-gray-600 pt-2 border-t border-gray-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                Explainable Match Breakdown (0-100%)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                Real-Time Application Lifecycle Tracker
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                Secure Document Submission & Status
              </li>
            </ul>
          </div>

          {/* Card 2: Recruiters */}
          <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm hover:shadow-xl transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Building2 className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-gray-900">For Employers</h4>
            <p className="text-sm text-gray-600">
              Post structured internships with canonical skill taxonomy. Review verified student profiles and conduct technical rounds seamlessly.
            </p>
            <ul className="space-y-2 text-xs text-gray-600 pt-2 border-t border-gray-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                Canonical Skill-Normalized Filtering
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                Integrated Interview Scheduling & Scorecards
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                Automated Notifications to Shortlisted Talent
              </li>
            </ul>
          </div>

          {/* Card 3: College Admin */}
          <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm hover:shadow-xl transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-gray-900">For Placement Cells</h4>
            <p className="text-sm text-gray-600">
              Full administrative governance. Verify company KYC, review internship postings, authenticate certificates, and inspect security audit logs.
            </p>
            <ul className="space-y-2 text-xs text-gray-600 pt-2 border-t border-gray-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Live Relational SQL Analytics (No Mock Data)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                KYC Verification & Role Approval Queues
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Immutable Audit Trail & Security Compliance
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Platform Architecture Highlights */}
      <section className="bg-slate-900 text-white py-20 rounded-3xl mx-4 sm:mx-6 lg:mx-8 px-6 sm:px-12">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-xs uppercase font-bold tracking-widest text-indigo-400">Enterprise Engineering</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold">Robust Architectural Guarantees</h3>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Engineered with industrial rigor: Spring Boot 3.3, JPA Hibernate, React 18, and zero-compromise database normalization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-3">
              <GitBranch className="w-6 h-6 text-indigo-400" />
              <h4 className="font-bold text-base">Strict State Machine</h4>
              <p className="text-xs text-slate-300">
                12-stage application lifecycle prevents illegal state skips or fraudulent advancement.
              </p>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-3">
              <Sparkles className="w-6 h-6 text-purple-400" />
              <h4 className="font-bold text-base">Explainable Matching</h4>
              <p className="text-xs text-slate-300">
                Deterministic 5-factor scoring algorithm with clear skill gap remediation advice.
              </p>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-3">
              <FileCheck2 className="w-6 h-6 text-emerald-400" />
              <h4 className="font-bold text-base">Secure Document KYC</h4>
              <p className="text-xs text-slate-300">
                MIME & file size validation with restricted, authenticated download endpoints.
              </p>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-3">
              <TrendingUp className="w-6 h-6 text-amber-400" />
              <h4 className="font-bold text-base">Live DB Analytics</h4>
              <p className="text-xs text-slate-300">
                Aggregated in real-time from active relational database records with zero mocked metrics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center max-w-3xl mx-auto px-4 space-y-6">
        <h2 className="text-3xl font-extrabold text-gray-900">Ready to modernize your placement ecosystem?</h2>
        <p className="text-gray-600 text-sm">
          Experience seamless internships with pre-configured demo credentials for all roles.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all hover:scale-105"
        >
          Launch InternFlow
          <ArrowRight className="w-5 h-5" />
        </Link>
      </section>
    </div>
  );
};
export default LandingPage;
