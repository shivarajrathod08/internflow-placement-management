import React from 'react';
import { Check, XCircle } from 'lucide-react';
import { ApplicationStatus } from '../../types';

interface StepperProps {
  currentStatus: ApplicationStatus;
}

interface Step {
  id: string;
  label: string;
  description: string;
  activeStatuses: ApplicationStatus[];
}

const STEPS: Step[] = [
  {
    id: 'applied',
    label: 'Applied',
    description: 'Submitted',
    activeStatuses: ['APPLIED'],
  },
  {
    id: 'screening',
    label: 'Screening',
    description: 'Under Review',
    activeStatuses: ['UNDER_REVIEW', 'SHORTLISTED'],
  },
  {
    id: 'interview',
    label: 'Interview',
    description: 'Rounds scheduled',
    activeStatuses: ['INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED'],
  },
  {
    id: 'decision',
    label: 'Offer / Selection',
    description: 'Offer extended',
    activeStatuses: ['SELECTED'],
  },
  {
    id: 'execution',
    label: 'Internship',
    description: 'Active & Joining',
    activeStatuses: ['JOINED', 'IN_PROGRESS', 'COMPLETION_SUBMITTED', 'VERIFICATION_PENDING'],
  },
  {
    id: 'completed',
    label: 'Completed',
    description: 'Verified by Admin',
    activeStatuses: ['COMPLETED'],
  },
];

export const ApplicationStepper: React.FC<StepperProps> = ({ currentStatus }) => {
  if (currentStatus === 'REJECTED' || currentStatus === 'WITHDRAWN') {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
        <XCircle className="w-4 h-4 text-rose-600" />
        <span>Application {currentStatus === 'WITHDRAWN' ? 'Withdrawn' : 'Not Selected'}</span>
      </div>
    );
  }

  // Determine current step index
  let currentIndex = 0;
  for (let i = 0; i < STEPS.length; i++) {
    if (STEPS[i].activeStatuses.includes(currentStatus)) {
      currentIndex = i;
      break;
    }
  }

  return (
    <div className="w-full py-2">
      <div className="flex items-center justify-between relative">
        {/* Background connector line */}
        <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-0.5 bg-slate-200 dark:bg-slate-700 -z-0" />

        {STEPS.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center group">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                  isDone
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-50'
                    : isCurrent
                    ? 'bg-brand-600 text-white ring-4 ring-brand-100 animate-pulse'
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                }`}
              >
                {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
              </div>
              <span
                className={`text-[11px] font-semibold mt-1.5 transition-colors hidden sm:block ${
                  isCurrent ? 'text-brand-600 font-bold' : isDone ? 'text-slate-800' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
