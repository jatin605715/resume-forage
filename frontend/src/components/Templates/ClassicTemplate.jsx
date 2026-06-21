import React from 'react';
import DescriptionRenderer from '../DescriptionRenderer';

export default function ClassicTemplate({ data }) {
  const { personalInfo = {}, summary = '', experience = [], education = [], skills = [], projects = [], certifications = [] } = data;

  const hasSkills = skills && skills.length > 0;
  const hasExperience = experience && experience.length > 0;
  const hasEducation = education && education.length > 0;
  const hasProjects = projects && projects.length > 0;
  const hasCertifications = certifications && certifications.length > 0;

  return (
    <div className="print-area w-full max-w-[210mm] min-h-[297mm] bg-white text-black p-8 font-serif leading-relaxed text-sm">
      {/* Personal Info Header */}
      <div className="text-center mb-6">
        {personalInfo.fullName && (
          <h1 className="text-3xl font-bold tracking-wide uppercase text-black mb-1">{personalInfo.fullName}</h1>
        )}
        {personalInfo.headline && (
          <p className="text-sm italic text-gray-700 mb-2 font-sans">{personalInfo.headline}</p>
        )}
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-gray-800 font-sans">
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
              ? links.reduce((prev, curr, idx) => [prev, <span key={`sep-${idx}`} className="text-gray-405">•</span>, curr])
              : null;
          })()}
        </div>
      </div>

      {/* Summary Section */}
      {summary && (
        <div className="resume-section mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-1 mb-2 font-sans">
            Professional Summary
          </h2>
          <p className="text-gray-800 text-justify leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Experience Section */}
      {hasExperience && (
        <div className="resume-section mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-1 mb-2 font-sans">
            Professional Experience
          </h2>
          <div className="space-y-4">
            {experience.map((exp, idx) => (
              <div key={exp.id || idx} className="text-gray-900">
                <div className="flex justify-between font-bold text-sm">
                  <span>
                    {exp.role} {exp.company ? `| ${exp.company}` : ''}
                  </span>
                  <span className="text-xs font-normal font-sans text-gray-700">
                    {exp.startDate} {exp.endDate ? `– ${exp.endDate}` : ''}
                  </span>
                </div>
                {exp.description && (
                  <DescriptionRenderer text={exp.description} className="mt-1 text-xs text-gray-800" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects Section */}
      {hasProjects && (
        <div className="resume-section mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-1 mb-2 font-sans">
            Key Projects
          </h2>
          <div className="space-y-3">
            {projects.map((proj, idx) => (
              <div key={proj.id || idx} className="text-gray-900">
                <div className="flex justify-between font-bold text-sm">
                  <span>
                    {proj.name} {proj.techStack ? <span className="font-normal font-sans text-xs text-gray-600">({proj.techStack})</span> : ''}
                  </span>
                </div>
                {proj.description && (
                  <DescriptionRenderer text={proj.description} className="mt-1 text-xs text-gray-800" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education Section */}
      {hasEducation && (
        <div className="resume-section mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-1 mb-2 font-sans">
            Education
          </h2>
          <div className="space-y-3">
            {education.map((edu, idx) => (
              <div key={edu.id || idx} className="text-gray-900">
                <div className="flex justify-between font-bold text-sm">
                  <span>
                    {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}
                    {edu.school ? `, ${edu.school}` : ''}
                  </span>
                  <span className="text-xs font-normal font-sans text-gray-700">
                    {edu.startYear} {edu.endYear ? `– ${edu.endYear}` : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills Section */}
      {hasSkills && (
        <div className="resume-section mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-1 mb-2 font-sans">
            Technical Skills
          </h2>
          <p className="text-xs text-gray-800 leading-relaxed">
            <span className="font-bold">Skills:</span> {skills.join(', ')}
          </p>
        </div>
      )}

      {/* Certifications Section */}
      {hasCertifications && (
        <div className="resume-section mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-1 mb-2 font-sans">
            Certifications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {certifications.map((cert, idx) => (
              <div key={cert.id || idx} className="text-gray-800">
                <span className="font-bold">{cert.name}</span>
                {cert.issuer && ` - ${cert.issuer}`}
                {cert.date && ` (${cert.date})`}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
