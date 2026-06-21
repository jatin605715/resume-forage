import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layout, Columns, AlignLeft, Check, GraduationCap } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function TemplatesPage() {
  const { getAuthHeaders, API_URL } = useAuth();
  const navigate = useNavigate();
  const [loadingTemplate, setLoadingTemplate] = useState(null);

  const templatesList = [
    {
      id: 'classic',
      name: 'Classic Template',
      description: 'Clean, traditional, and academic. Perfect for corporate, finance, and legal industries.',
      icon: AlignLeft,
      features: ['Serif typography', 'Centered headers', 'Traditional divider lines', 'ATS-optimized spacing']
    },
    {
      id: 'modern',
      name: 'Modern Template',
      description: 'Asymmetric, striking, and modern. Best for technology, startup, and marketing roles.',
      icon: Columns,
      features: ['Sans-serif font structure', 'Two-column sidebar section', 'Highlighted headers', 'Highly scannable']
    },
    {
      id: 'minimal',
      name: 'Minimal Template',
      description: 'Sleek, lightweight, and compact. Perfect for single-page profiles and developers.',
      icon: Layout,
      features: ['Monospace typography', 'Inline header arrangement', 'Clean bracket styling', 'Compact layout']
    },
    {
      id: 'academic',
      name: 'Academic Template',
      description: 'LaTeX-inspired, formal single-column layout. Ideal for academic, research, and data science roles.',
      icon: GraduationCap,
      features: ['Serif / LaTeX-style typography', 'Centered header with contact row', 'Ruled section headings', 'Profile → Education → Skills → Projects → Experience']
    }
  ];

  const handleUseTemplate = async (templateId) => {
    setLoadingTemplate(templateId);
    try {
      const initialData = {
        personalInfo: { fullName: '', headline: '', email: '', phone: '', location: '', website: '' },
        summary: '',
        experience: [],
        education: [],
        skills: [],
        projects: [],
        certifications: []
      };

      const res = await fetch(`${API_URL}/resumes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: `Untitled Resume - ${templateId.charAt(0).toUpperCase() + templateId.slice(1)}`,
          template: templateId,
          data: initialData
        })
      });

      if (!res.ok) {
        throw new Error('Failed to create new resume.');
      }

      const newResume = await res.json();
      navigate(`/builder/${newResume.id}`);
    } catch (err) {
      console.error('Error creating template resume:', err);
      alert('Error creating resume. Please try again.');
    } finally {
      setLoadingTemplate(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-3xl font-extrabold tracking-tight">Choose a Resume Template</h1>
          <p className="text-gray-400 mt-2">
            Select a design to start building. All templates are specifically formatted to be ATS-friendly and keep your text searchable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {templatesList.map((tpl) => {
            const Icon = tpl.icon;
            const isProcessing = loadingTemplate === tpl.id;
            return (
              <div 
                key={tpl.id}
                className="flex flex-col justify-between p-6 bg-[#0f0f0f] border border-gray-800 rounded-xl hover:border-gray-700 transition-all hover:scale-[1.01]"
              >
                <div>
                  {/* Icon Representation */}
                  <div className="mb-4 w-12 h-12 bg-white text-black rounded-lg flex items-center justify-center font-bold">
                    <Icon size={24} />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2">{tpl.name}</h3>
                  <p className="text-sm text-gray-500 mb-6 leading-relaxed">{tpl.description}</p>
                  
                  {/* Features list */}
                  <ul className="space-y-2 mb-8">
                    {tpl.features.map((feat, index) => (
                      <li key={index} className="flex items-center gap-2 text-xs text-gray-300">
                        <Check size={14} className="text-gray-400" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleUseTemplate(tpl.id)}
                  disabled={loadingTemplate !== null}
                  className="w-full py-2.5 bg-white hover:bg-gray-200 disabled:bg-gray-400 text-black font-bold text-sm rounded-md transition-colors flex items-center justify-center"
                >
                  {isProcessing ? 'Creating...' : 'Use Template'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
