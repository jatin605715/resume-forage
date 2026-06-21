import React from 'react';
import DescriptionRenderer from '../DescriptionRenderer';

export default function ModernTemplate({ data }) {
  const { personalInfo = {}, summary = '', experience = [], education = [], skills = [], projects = [], certifications = [] } = data;

  const hasSkills = skills && skills.length > 0;
  const hasExperience = experience && experience.length > 0;
  const hasEducation = education && education.length > 0;
  const hasProjects = projects && projects.length > 0;
  const hasCertifications = certifications && certifications.length > 0;

  return (
    <div className="print-area w-full max-w-[210mm] min-h-[297mm] bg-white text-black p-10 font-sans leading-relaxed text-sm">
      {/* Header Grid: Two columns (Info left, Details right) */}
      <div className="border-b-2 border-black pb-5 mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          {personalInfo.fullName && (
            <h1 className="text-3xl font-extrabold tracking-tight text-black uppercase mb-1">{personalInfo.fullName}</h1>
          )}
          {personalInfo.headline && (
            <p className="text-sm font-semibold tracking-wider uppercase text-gray-600">{personalInfo.headline}</p>
          )}
        </div>
        <div className="text-xs text-gray-800 text-left md:text-right space-y-1">
          {personalInfo.email && <div>{personalInfo.email}</div>}
          {personalInfo.phone && <div>{personalInfo.phone}</div>}
          {personalInfo.location && <div>{personalInfo.location}</div>}
          {personalInfo.website && (
            <div>
              <a href={personalInfo.website.startsWith('http') ? personalInfo.website : `https://${personalInfo.website}`} target="_blank" rel="noopener noreferrer" className="font-medium underline hover:text-black">
                {personalInfo.website.replace(/^https?:\/\/(www\.)?/, '')}
              </a>
            </div>
          )}
          {personalInfo.linkedin && (
            <div>
              <a href={personalInfo.linkedin.startsWith('http') ? personalInfo.linkedin : `https://${personalInfo.linkedin}`} target="_blank" rel="noopener noreferrer" className="font-medium underline hover:text-black">
                linkedin.com/in/{personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, '').replace(/^(linkedin\.com\/in\/|linkedin\.com\/)/, '')}
              </a>
            </div>
          )}
          {personalInfo.github && (
            <div>
              <a href={personalInfo.github.startsWith('http') ? personalInfo.github : `https://${personalInfo.github}`} target="_blank" rel="noopener noreferrer" className="font-medium underline hover:text-black">
                github.com/{personalInfo.github.replace(/^https?:\/\/(www\.)?/, '').replace(/^(github\.com\/)/, '')}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column (1/3 for Summary, Skills, Certs) */}
        <div className="space-y-6 md:col-span-1">
          {/* Summary */}
          {summary && (
            <div className="resume-section">
              <h2 className="text-xs font-black uppercase tracking-wider text-black border-l-4 border-black pl-2 mb-3">
                Profile
              </h2>
              <p className="text-xs text-gray-700 text-justify leading-relaxed">{summary}</p>
            </div>
          )}

          {/* Skills */}
          {hasSkills && (
            <div className="resume-section">
              <h2 className="text-xs font-black uppercase tracking-wider text-black border-l-4 border-black pl-2 mb-3">
                Skills
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-800 border border-gray-200 rounded-sm font-mono"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {hasCertifications && (
            <div className="resume-section">
              <h2 className="text-xs font-black uppercase tracking-wider text-black border-l-4 border-black pl-2 mb-3">
                Certifications
              </h2>
              <div className="space-y-2 text-xs text-gray-700">
                {certifications.map((cert, idx) => (
                  <div key={cert.id || idx} className="leading-tight">
                    <div className="font-bold text-gray-900">{cert.name}</div>
                    <div className="text-[10px] text-gray-500">
                      {cert.issuer} {cert.date ? `| ${cert.date}` : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (2/3 for Experience, Projects, Education) */}
        <div className="space-y-6 md:col-span-2">
          {/* Experience */}
          {hasExperience && (
            <div className="resume-section">
              <h2 className="text-xs font-black uppercase tracking-wider text-black border-l-4 border-black pl-2 mb-3">
                Experience
              </h2>
              <div className="space-y-4">
                {experience.map((exp, idx) => (
                  <div key={exp.id || idx}>
                    <div className="flex justify-between items-baseline font-bold text-sm">
                      <span className="text-gray-950 font-bold">{exp.role}</span>
                      <span className="text-xs font-medium text-gray-500 font-mono">
                        {exp.startDate} – {exp.endDate}
                      </span>
                    </div>
                    {exp.company && (
                      <div className="text-xs font-semibold text-gray-600 mb-1">{exp.company}</div>
                    )}
                    {exp.description && (
                      <DescriptionRenderer text={exp.description} className="text-xs text-gray-700" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {hasProjects && (
            <div className="resume-section">
              <h2 className="text-xs font-black uppercase tracking-wider text-black border-l-4 border-black pl-2 mb-3">
                Projects
              </h2>
              <div className="space-y-4">
                {projects.map((proj, idx) => (
                  <div key={proj.id || idx}>
                    <div className="flex justify-between items-baseline font-bold text-sm">
                      <span className="text-gray-950 font-bold">{proj.name}</span>
                    </div>
                    {proj.techStack && (
                      <div className="text-[10px] font-mono text-gray-500 mb-1">{proj.techStack}</div>
                    )}
                    {proj.description && (
                      <DescriptionRenderer text={proj.description} className="text-xs text-gray-700" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {hasEducation && (
            <div className="resume-section">
              <h2 className="text-xs font-black uppercase tracking-wider text-black border-l-4 border-black pl-2 mb-3">
                Education
              </h2>
              <div className="space-y-3">
                {education.map((edu, idx) => (
                  <div key={edu.id || idx}>
                    <div className="flex justify-between items-baseline font-bold text-sm">
                      <span className="text-gray-950 font-bold">
                        {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}
                      </span>
                      <span className="text-xs font-medium text-gray-500 font-mono">
                        {edu.startYear} – {edu.endYear}
                      </span>
                    </div>
                    {edu.school && <div className="text-xs text-gray-600">{edu.school}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
