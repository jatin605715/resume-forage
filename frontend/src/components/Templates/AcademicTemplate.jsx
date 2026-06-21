import React from 'react';
import DescriptionRenderer from '../DescriptionRenderer';

/**
 * AcademicTemplate — mirrors the LaTeX/Computer-Modern style resume in the PDF:
 *  • Centered header: name (large bold), headline, phone — location, blue link
 *  • Single-column body
 *  • Section titles: bold left, full-width <hr> beneath
 *  • Section order: Profile → Education → Technical Skills → Projects → Experience → Certifications
 */
export default function AcademicTemplate({ data }) {
  const {
    personalInfo = {},
    summary = '',
    experience = [],
    education = [],
    skills = [],
    projects = [],
    certifications = [],
  } = data;

  const hasSummary       = !!summary;
  const hasEducation     = education.length > 0;
  const hasSkills        = skills.length > 0;
  const hasProjects      = projects.length > 0;
  const hasExperience    = experience.length > 0;
  const hasCertifications = certifications.length > 0;

  /* ---------- helpers ---------- */
  const SectionHeading = ({ title }) => (
    <div style={{ marginBottom: '6px', marginTop: '14px' }}>
      <h2 style={{
        fontFamily: "'Computer Modern', 'Latin Modern', 'Times New Roman', serif",
        fontSize: '13pt',
        fontWeight: 'bold',
        margin: '0 0 2px 0',
        letterSpacing: '0.01em',
        color: '#111',
      }}>
        {title}
      </h2>
      <hr style={{ border: 'none', borderTop: '1px solid #333', margin: 0 }} />
    </div>
  );

  return (
    <div
      className="print-area"
      style={{
        width: '210mm',
        minHeight: '297mm',
        backgroundColor: '#fff',
        color: '#111',
        padding: '18mm 20mm 16mm 20mm',
        fontFamily: "'Computer Modern', 'Latin Modern', 'Times New Roman', Georgia, serif",
        fontSize: '10.5pt',
        lineHeight: '1.45',
        boxSizing: 'border-box',
      }}
    >
      {/* ── HEADER ── */}
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        {personalInfo.fullName && (
          <h1 style={{
            fontSize: '22pt',
            fontWeight: 'bold',
            margin: '0 0 3px 0',
            letterSpacing: '0.04em',
            fontFamily: 'inherit',
          }}>
            {personalInfo.fullName}
          </h1>
        )}
        {personalInfo.headline && (
          <p style={{ fontSize: '10.5pt', margin: '0 0 4px 0', color: '#333' }}>
            {personalInfo.headline}
          </p>
        )}
        {/* Contact row */}
        {(() => {
          const links = [];
          if (personalInfo.phone) links.push(<span key="phone">{personalInfo.phone}</span>);
          if (personalInfo.location) links.push(<span key="loc">{personalInfo.location}</span>);
          if (personalInfo.email) {
            links.push(
              <a key="email" href={`mailto:${personalInfo.email}`} style={{ color: '#1a5dad', textDecoration: 'none' }}>
                {personalInfo.email}
              </a>
            );
          }
          if (personalInfo.website) {
            links.push(
              <a key="web" href={personalInfo.website.startsWith('http') ? personalInfo.website : `https://${personalInfo.website}`} target="_blank" rel="noopener noreferrer" style={{ color: '#1a5dad', textDecoration: 'none' }}>
                {personalInfo.website.replace(/^https?:\/\/(www\.)?/, '')}
              </a>
            );
          }
          if (personalInfo.linkedin) {
            links.push(
              <a key="li" href={personalInfo.linkedin.startsWith('http') ? personalInfo.linkedin : `https://${personalInfo.linkedin}`} target="_blank" rel="noopener noreferrer" style={{ color: '#1a5dad', textDecoration: 'none' }}>
                linkedin.com/in/{personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, '').replace(/^(linkedin\.com\/in\/|linkedin\.com\/)/, '')}
              </a>
            );
          }
          if (personalInfo.github) {
            links.push(
              <a key="gh" href={personalInfo.github.startsWith('http') ? personalInfo.github : `https://${personalInfo.github}`} target="_blank" rel="noopener noreferrer" style={{ color: '#1a5dad', textDecoration: 'none' }}>
                github.com/{personalInfo.github.replace(/^https?:\/\/(www\.)?/, '').replace(/^(github\.com\/)/, '')}
              </a>
            );
          }

          return links.length > 0 ? (
            <p style={{ fontSize: '9.5pt', margin: '0', color: '#222', lineHeight: '1.5' }}>
              {links.reduce((prev, curr, idx) => [
                prev, 
                <span key={`sep-${idx}`} style={{ color: '#555', margin: '0 6px' }}>{" \u2014 "}</span>, 
                curr
              ])}
            </p>
          ) : null;
        })()}
      </div>

      {/* ── PROFILE / SUMMARY ── */}
      {hasSummary && (
        <section>
          <SectionHeading title="Profile" />
          <p style={{ margin: '4px 0 0 0', textAlign: 'justify', fontSize: '10.5pt', color: '#222' }}>
            {summary}
          </p>
        </section>
      )}

      {/* ── EDUCATION ── */}
      {hasEducation && (
        <section>
          <SectionHeading title="Education" />
          <div style={{ marginTop: '4px' }}>
            {education.map((edu, idx) => (
              <div key={edu.id || idx} style={{ marginBottom: '7px' }}>
                {/* Row 1: Institution bold + dates right-aligned */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <strong style={{ fontSize: '10.5pt' }}>
                    {[edu.school, edu.location].filter(Boolean).join(', ')}
                  </strong>
                  <span style={{ fontSize: '10pt', color: '#444', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                    {[edu.startYear, edu.endYear].filter(Boolean).join(' \u2013 ')}
                  </span>
                </div>
                {/* Row 2: Degree + field */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '10pt', color: '#222' }}>
                    {[edu.degree, edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''].filter(Boolean).join(' ')}
                  </span>
                </div>
                {/* GPA / extra notes */}
                {edu.gpa && (
                  <div style={{ fontSize: '10pt', color: '#333' }}>CGPA: {edu.gpa}</div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── TECHNICAL SKILLS ── */}
      {hasSkills && (
        <section>
          <SectionHeading title="Technical Skills" />
          <div style={{ marginTop: '4px' }}>
            {/* Group skills by category if written as "Category: skill1, skill2" */}
            {skills.map((skill, idx) => {
              const colonIdx = skill.indexOf(':');
              if (colonIdx > 0) {
                const cat = skill.slice(0, colonIdx).trim();
                const vals = skill.slice(colonIdx + 1).trim();
                return (
                  <div key={idx} style={{ marginBottom: '2px', fontSize: '10.5pt' }}>
                    <strong>{cat}:</strong>
                    <span style={{ color: '#222' }}> {vals}</span>
                  </div>
                );
              }
              return (
                <span key={idx} style={{ marginRight: '8px', fontSize: '10.5pt' }}>{skill}</span>
              );
            })}
          </div>
        </section>
      )}

      {/* ── PROJECTS ── */}
      {hasProjects && (
        <section>
          <SectionHeading title="Projects" />
          <div style={{ marginTop: '4px' }}>
            {projects.map((proj, idx) => (
              <div key={proj.id || idx} style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <strong style={{ fontSize: '10.5pt' }}>{proj.name}</strong>
                  {proj.techStack && (
                    <span style={{ fontSize: '9.5pt', color: '#555', marginLeft: '8px', fontStyle: 'italic' }}>
                      {proj.techStack}
                    </span>
                  )}
                </div>
                {proj.description && (
                  <DescriptionRenderer
                    text={proj.description}
                    className=""
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── EXPERIENCE ── */}
      {hasExperience && (
        <section>
          <SectionHeading title="Experience" />
          <div style={{ marginTop: '4px' }}>
            {experience.map((exp, idx) => (
              <div key={exp.id || idx} style={{ marginBottom: '9px' }}>
                {/* Row: Role at Company + dates */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <strong style={{ fontSize: '10.5pt' }}>
                    {exp.role}
                    {exp.company && <span style={{ fontWeight: 'normal', color: '#333' }}> — {exp.company}</span>}
                  </strong>
                  <span style={{ fontSize: '10pt', color: '#444', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                    {[exp.startDate, exp.endDate].filter(Boolean).join(' \u2013 ')}
                  </span>
                </div>
                {exp.description && (
                  <DescriptionRenderer
                    text={exp.description}
                    className=""
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── CERTIFICATIONS ── */}
      {hasCertifications && (
        <section>
          <SectionHeading title="Certifications" />
          <div style={{ marginTop: '4px' }}>
            {certifications.map((cert, idx) => (
              <div key={cert.id || idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span style={{ fontSize: '10.5pt' }}>
                  <strong>{cert.name}</strong>
                  {cert.issuer && <span style={{ color: '#444' }}> — {cert.issuer}</span>}
                </span>
                {cert.date && <span style={{ fontSize: '10pt', color: '#555', whiteSpace: 'nowrap', marginLeft: '8px' }}>{cert.date}</span>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
