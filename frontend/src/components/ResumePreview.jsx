import React from 'react';
import ClassicTemplate from './Templates/ClassicTemplate';
import ModernTemplate from './Templates/ModernTemplate';
import MinimalTemplate from './Templates/MinimalTemplate';
import AcademicTemplate from './Templates/AcademicTemplate';

export default function ResumePreview({ template = 'classic', data }) {
  // Render the selected template
  switch (template) {
    case 'classic':
      return <ClassicTemplate data={data} />;
    case 'modern':
      return <ModernTemplate data={data} />;
    case 'minimal':
      return <MinimalTemplate data={data} />;
    case 'academic':
      return <AcademicTemplate data={data} />;
    default:
      return <ClassicTemplate data={data} />;
  }
}
