import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, ChevronDown, ChevronUp, Sparkles, Trophy } from 'lucide-react';

const COMMON_ACTION_VERBS = [
  'led', 'managed', 'developed', 'built', 'designed', 'optimized', 
  'spearheaded', 'created', 'automated', 'coded', 'analyzed', 
  'coordinated', 'established', 'implemented', 'compiled', 
  'formulated', 'customized', 'launched', 'programmed', 'initiated',
  'collaborated', 'upgraded', 'solved', 'increased', 'reduced'
];

export default function AtsChecker({ data }) {
  const [isOpen, setIsOpen] = useState(false);

  const {
    personalInfo = {},
    summary = '',
    experience = [],
    education = [],
    skills = [],
    projects = [],
  } = data || {};

  // 1. Calculate Score & Checks
  let score = 0;
  const criticalIssues = [];
  const warnings = [];
  const strengths = [];

  // --- Contact Info (Max 30) ---
  if (personalInfo.email && personalInfo.email.trim()) {
    score += 10;
    strengths.push('Email address provided.');
  } else {
    criticalIssues.push('Email address is missing.');
  }

  if (personalInfo.phone && personalInfo.phone.trim()) {
    score += 10;
    strengths.push('Phone number provided.');
  } else {
    criticalIssues.push('Phone number is missing.');
  }

  if (personalInfo.location && personalInfo.location.trim()) {
    score += 5;
    strengths.push('Location details included.');
  } else {
    warnings.push('Add your location (City, State) to satisfy geographic ATS filters.');
  }

  const socialLinks = [];
  if (personalInfo.website && personalInfo.website.trim()) socialLinks.push('Website');
  if (personalInfo.linkedin && personalInfo.linkedin.trim()) socialLinks.push('LinkedIn');
  if (personalInfo.github && personalInfo.github.trim()) socialLinks.push('GitHub');

  if (socialLinks.length > 0) {
    score += 5;
    strengths.push(`Online presence details listed (${socialLinks.join(', ')}).`);
  } else {
    warnings.push('Add a website, LinkedIn, or GitHub link to showcase your work and profiles.');
  }

  // --- Section Coverage (Max 50) ---
  if (summary && summary.trim().length > 0) {
    score += 10;
    const len = summary.trim().length;
    if (len < 50) {
      warnings.push('Summary is too short (under 50 characters). Expand on your key strengths.');
    } else if (len > 300) {
      warnings.push('Summary is too long (over 300 characters). Keep it concise and punchy.');
    } else {
      strengths.push('Professional summary length is optimal.');
    }
  } else {
    warnings.push('Write a short professional summary to introduce your value proposition.');
  }

  if (education && education.length > 0) {
    score += 15;
    strengths.push('Education background listed.');
  } else {
    warnings.push('Add your academic history to complete your credentials.');
  }

  if (experience && experience.length > 0) {
    score += 15;
    strengths.push('Work experience listed.');
  } else {
    criticalIssues.push('Work experience is missing. ATS algorithms heavily prioritize job history.');
  }

  if (skills && skills.length > 0) {
    score += 10;
    if (skills.length < 5) {
      warnings.push('Add more skills (ideally 5+) to trigger key ATS skill matches.');
    } else {
      strengths.push(`Rich skill profile populated (${skills.length} skills listed).`);
    }
  } else {
    criticalIssues.push('No skills added. Key phrase matches depend entirely on listing relevant skills.');
  }

  // --- Action Verbs (Max 20) ---
  // Combine experience and project descriptions to search for action verbs
  let combinedText = '';
  experience.forEach(exp => { combinedText += ` ${exp.description || ''}`; });
  projects.forEach(proj => { combinedText += ` ${proj.description || ''}`; });
  combinedText = combinedText.toLowerCase();

  const foundVerbs = COMMON_ACTION_VERBS.filter(verb => combinedText.includes(verb));
  const verbPoints = Math.min(foundVerbs.length * 5, 20);
  score += verbPoints;

  if (verbPoints === 20) {
    strengths.push('Strong usage of results-oriented action verbs.');
  } else if (foundVerbs.length > 0) {
    warnings.push(`Use more action verbs. Found: ${foundVerbs.join(', ')}. (Aim for 4+ unique verbs)`);
  } else if (experience.length > 0) {
    warnings.push('No impact verbs detected in descriptions (e.g., Developed, Optimized, Led). Add action verbs.');
  }

  // Determine score color and label
  let statusColor = 'text-red-500';
  let bgColor = 'bg-red-500/10';
  let borderColor = 'border-red-900/40';
  let ratingLabel = 'Weak ATS Match';

  if (score >= 80) {
    statusColor = 'text-emerald-400';
    bgColor = 'bg-emerald-500/5';
    borderColor = 'border-emerald-900/30';
    ratingLabel = 'Excellent ATS Compliance';
  } else if (score >= 50) {
    statusColor = 'text-amber-400';
    bgColor = 'bg-amber-500/5';
    borderColor = 'border-amber-900/30';
    ratingLabel = 'Moderate ATS Match';
  }

  return (
    <div className={`border ${borderColor} ${bgColor} rounded-lg overflow-hidden transition-all duration-300`}>
      {/* HEADER BAR */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 focus:outline-none text-left cursor-pointer"
      >
        <div className="flex items-center gap-3">
          {/* Circular Score Visualizer */}
          <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                className="stroke-gray-800"
                strokeWidth="3.5"
                fill="transparent"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                className={`${score >= 80 ? 'stroke-emerald-500' : score >= 50 ? 'stroke-amber-500' : 'stroke-red-500'} transition-all duration-500`}
                strokeWidth="3.5"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 20}`}
                strokeDashoffset={`${2 * Math.PI * 20 * (1 - score / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-xs font-bold text-white">{score}</span>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
              ATS Score & Analysis
              {score >= 80 && <Trophy size={14} className="text-yellow-400" />}
            </h4>
            <p className={`text-xs font-semibold ${statusColor}`}>{ratingLabel}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 hidden sm:inline">
            {isOpen ? 'Hide Checklist' : 'Review Suggestions'}
          </span>
          {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </button>

      {/* DETAILED SUGGESTIONS */}
      {isOpen && (
        <div className="border-t border-gray-800/60 p-4 space-y-4 bg-black/40 text-xs">
          {/* Critical Items */}
          {criticalIssues.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest block">Critical Fixes Needed</span>
              <div className="space-y-1.5">
                {criticalIssues.map((issue, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-red-400">
                    <AlertOctagon size={13} className="mt-0.5 flex-shrink-0" />
                    <span className="leading-relaxed">{issue}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-gray-800/40">
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block">Recommendations</span>
              <div className="space-y-1.5">
                {warnings.map((warn, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-amber-300">
                    <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" />
                    <span className="leading-relaxed">{warn}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strengths */}
          {strengths.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-gray-800/40">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">Compliant Formatting ({strengths.length})</span>
              <div className="space-y-1">
                {strengths.map((str, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-emerald-500/80">
                    <CheckCircle2 size={13} className="flex-shrink-0" />
                    <span className="leading-relaxed">{str}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {criticalIssues.length === 0 && warnings.length === 0 && (
            <div className="text-center py-2 text-emerald-400 font-semibold flex items-center justify-center gap-1.5">
              <Sparkles size={14} className="text-yellow-400 animate-pulse" />
              <span>Perfect score! Your resume matches 100% of standard ATS formatting parameters.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
