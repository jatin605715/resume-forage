import React from 'react';
import DescriptionRenderer from '../DescriptionRenderer';

export default function MinimalTemplate({ data }) {
  const { personalInfo = {}, summary = '', experience = [], education = [], skills = [], projects = [], certifications = [] } = data;

  const hasSkills = skills && skills.length > 0;
  const hasExperience = experience && experience.length > 0;
  const hasEducation = education && education.length > 0;
  const hasProjects = projects && projects.length > 0;
  const hasCertifications = certifications && certifications.length > 0;

  return (
    <div className="print-area w-full max-w-[210mm] min-h-[297mm] bg-white text-black p-8 font-mono leading-relaxed text-xs">
      {/* Inline Minimal Header */}
      <div className="border-b border-gray-200 pb-4 mb-4">
        <div className="flex justify-between items-baseline flex-wrap gap-2">
          {personalInfo.fullName && (
            <h1 className="text-xl font-bold tracking-tight text-black uppercase">{personalInfo.fullName}</h1>
          )}
          {personalInfo.headline && (
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">{personalInfo.headline}</span>
          )}
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[10px] text-gray-600 font-sans">
          {(() => {
            const links = [];
            if (personalInfo.email) links.push(<span key="email">{personalInfo.email}</span>);
            if (personalInfo.phone) links.push(<span key="phone">{personalInfo.phone}</span>);
            if (personalInfo.location) links.push(<span key="loc">{personalInfo.location}</span>);
            if (personalInfo.website) {
              links.push(
                <a key="web" href={personalInfo.website.startsWith('http') ? personalInfo.website : `https://${personalInfo.website}`} target="_blank" rel="noopener noreferrer" className="underline">
                  {personalInfo.website.replace(/^https?:\/\/(www\.)?/, '')}
                </a>
              );
            }
            if (personalInfo.linkedin) {
              links.push(
                <a key="li" href={personalInfo.linkedin.startsWith('http') ? personalInfo.linkedin : `https://${personalInfo.linkedin}`} target="_blank" rel="noopener noreferrer" className="underline">
                  linkedin.com/in/{personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, '').replace(/^(linkedin\.com\/in\/|linkedin\.com\/)/, '')}
                </a>
              );
            }
            if (personalInfo.github) {
              links.push(
                <a key="gh" href={personalInfo.github.startsWith('http') ? personalInfo.github : `https://${personalInfo.github}`} target="_blank" rel="noopener noreferrer" className="underline">
                  github.com/{personalInfo.github.replace(/^https?:\/\/(www\.)?/, '').replace(/^(github\.com\/)/, '')}
                </a>
              );
            }
            return links.length > 0
              ? links.reduce((prev, curr, idx) => [prev, <span key={`sep-${idx}`}>|</span>, curr])
              : null;
          })()}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="resume-section mb-4">
          <p className="text-gray-700 text-justify leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Experience */}
      {hasExperience && (
        <div className="resume-section mb-4">
          <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-100 pb-0.5">
            [ EXPERIENCE ]
          </h2>
          <div className="space-y-3">
            {experience.map((exp, idx) => (
              <div key={exp.id || idx}>
                <div className="flex justify-between items-baseline font-bold">
                  <span>
                    {exp.role} {exp.company ? `@ ${exp.company}` : ''}
                  </span>
                  <span className="text-[10px] font-normal text-gray-500">
                    {exp.startDate} - {exp.endDate}
                  </span>
                </div>
                {exp.description && (
                  <DescriptionRenderer text={exp.description} className="mt-1 text-[11px] text-gray-600" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {hasProjects && (
        <div className="resume-section mb-4">
          <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-100 pb-0.5">
            [ PROJECTS ]
          </h2>
          <div className="space-y-3">
            {projects.map((proj, idx) => (
              <div key={proj.id || idx}>
                <div className="flex justify-between items-baseline font-bold">
                  <span>
                    {proj.name} {proj.techStack ? <span className="font-normal text-gray-500 font-sans text-[10px]">({proj.techStack})</span> : ''}
                  </span>
                </div>
                {proj.description && (
                  <DescriptionRenderer text={proj.description} className="mt-1 text-[11px] text-gray-600" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {hasSkills && (
        <div className="resume-section mb-4">
          <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-100 pb-0.5">
            [ TECHNICAL SKILLS ]
          </h2>
          <p className="text-[11px] text-gray-600 leading-relaxed">
            {skills.join(' / ')}
          </p>
        </div>
      )}

      {/* Education */}
      {hasEducation && (
        <div className="resume-section mb-4">
          <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-100 pb-0.5">
            [ EDUCATION ]
          </h2>
          <div className="space-y-2">
            {education.map((edu, idx) => (
              <div key={edu.id || idx} className="flex justify-between items-baseline">
                <div>
                  <span className="font-bold">{edu.degree}</span>
                  {edu.fieldOfStudy && ` in ${edu.fieldOfStudy}`}
                  {edu.school && `, ${edu.school}`}
                </div>
                <span className="text-[10px] text-gray-500">
                  {edu.startYear} - {edu.endYear}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {hasCertifications && (
        <div className="resume-section mb-4">
          <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-100 pb-0.5">
            [ CERTIFICATIONS ]
          </h2>
          <div className="grid grid-cols-1 gap-1 text-[11px] text-gray-600">
            {certifications.map((cert, idx) => (
              <div key={cert.id || idx}>
                • <span className="font-bold text-gray-800">{cert.name}</span>
                {cert.issuer && ` (${cert.issuer})`}
                {cert.date && ` - ${cert.date}`}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
