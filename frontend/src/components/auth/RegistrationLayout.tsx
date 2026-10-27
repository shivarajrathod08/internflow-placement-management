import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface RegistrationBenefit {
  icon: LucideIcon;
  title: string;
}

export interface RegistrationLayoutProps {
  eyebrow: string;
  title: React.ReactNode;
  description: string;
  benefits: RegistrationBenefit[];
  imageSrc: string;
  imageAlt: string;
  fallbackImageSrc?: string;
  children: React.ReactNode;
}

export const RegistrationLayout: React.FC<RegistrationLayoutProps> = ({
  eyebrow,
  title,
  description,
  benefits,
  imageSrc,
  imageAlt,
  fallbackImageSrc,
  children,
}) => {
  return (
    <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-14 animate-in fade-in duration-200">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-start">
        {/* Left Column: Brand Eyebrow, Large Serif Headline, Benefits, and Featured Asset */}
        <div className="lg:col-span-5 flex flex-col space-y-6 lg:space-y-8">
          {/* Eyebrow & Headline Block */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#786E5E]">
                {eyebrow}
              </span>
              <span className="h-px w-10 bg-[#D8CEBC]" />
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[54px] font-normal text-[#192844] leading-[1.08] tracking-tight">
              {title}
            </h1>

            <p className="text-sm sm:text-base text-[#475569] leading-relaxed max-w-md pt-1">
              {description}
            </p>
          </div>

          {/* Three Concise Benefits */}
          <div className="space-y-3.5 pt-1">
            {benefits.map((b, idx) => {
              const Icon = b.icon;
              return (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl border border-[#D8CEBC] bg-[#FFFCF7] flex items-center justify-center text-[#192844] shrink-0 shadow-2xs">
                    <Icon className="w-5 h-5 text-[#192844]" strokeWidth={1.75} />
                  </div>
                  <span className="text-sm sm:text-base font-semibold text-[#192844]">
                    {b.title}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Large Supporting Image */}
          <div className="relative rounded-3xl overflow-hidden border border-[#E5DED2]/80 bg-[#E5DCCB] shadow-xs mt-2">
            <img
              src={imageSrc}
              alt={imageAlt}
              onError={(e) => {
                if (fallbackImageSrc && e.currentTarget.src !== fallbackImageSrc) {
                  e.currentTarget.src = fallbackImageSrc;
                }
              }}
              className="w-full h-56 sm:h-64 lg:h-72 object-cover object-center"
            />
          </div>
        </div>

        {/* Right Column: Registration Form Card */}
        <div className="lg:col-span-7">
          {children}
        </div>
      </div>
    </div>
  );
};
