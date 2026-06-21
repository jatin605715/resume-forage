import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Save, Download, Check, Loader, AlertTriangle } from 'lucide-react';
import ResumeForm from '../components/ResumeForm';
import ResumePreview from '../components/ResumePreview';

export default function Builder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAuthHeaders, API_URL } = useAuth();

  // Resume State
  const [title, setTitle] = useState('');
  const [template, setTemplate] = useState('classic');
  const [resumeData, setResumeData] = useState(null);

  // Status States
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('idle'); // idle | saving | success | error
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch resume details on mount
  useEffect(() => {
    const fetchResumeDetails = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const res = await fetch(`${API_URL}/resumes/${id}`, {
          headers: getAuthHeaders()
        });

        if (!res.ok) {
          throw new Error('Failed to load resume details. It may have been deleted.');
        }

        const data = await res.json();
        setTitle(data.title);
        setTemplate(data.template);
        setResumeData(data.data || {
          personalInfo: { fullName: '', headline: '', email: '', phone: '', location: '', website: '', linkedin: '', github: '' },
          summary: '',
          experience: [],
          education: [],
          skills: [],
          projects: [],
          certifications: []
        });
      } catch (err) {
        console.error(err);
        setErrorMsg(err.message || 'An error occurred loading the resume builder.');
      } finally {
        setLoading(false);
      }
    };

    fetchResumeDetails();
  }, [id]);

  // Save resume handler
  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please enter a resume title.');
      return;
    }

    setSaveStatus('saving');
    try {
      const res = await fetch(`${API_URL}/resumes/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title,
          template,
          data: resumeData
        })
      });

      if (!res.ok) {
        throw new Error('Failed to save resume.');
      }

      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 5000);
    }
  };

  // Trigger print/PDF generation
  const handleDownloadPDF = () => {
    // Save first to ensure the printed PDF matches current changes
    handleSave();
    // Open the browser print dialog
    setTimeout(() => {
      window.print();
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-3">
        <Loader size={36} className="animate-spin text-gray-400" />
        <span className="text-sm text-gray-500 font-medium">Loading resume editor...</span>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="bg-red-950 text-red-500 p-4 rounded-full border border-red-900/40">
          <AlertTriangle size={32} />
        </div>
        <h3 className="text-xl font-bold">Error Loading Editor</h3>
        <p className="text-sm text-gray-500 max-w-sm">{errorMsg}</p>
        <button
          onClick={() => navigate('/')}
          className="mt-2 px-4 py-2 bg-white text-black font-bold rounded-md hover:bg-gray-200 text-xs transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* 1. TOP BAR */}
      <header className="no-print bg-[#121212] border-b border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Back button */}
          <button
            onClick={() => navigate('/')}
            className="p-2 text-gray-400 hover:text-white bg-[#1a1a1a] hover:bg-[#222222] border border-gray-800 hover:border-gray-700 rounded-md transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft size={16} />
          </button>

          {/* Title Editor */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-transparent border-b border-transparent hover:border-gray-800 focus:border-gray-600 px-1.5 py-1 text-sm font-bold text-white focus:outline-none flex-1 max-w-[240px] sm:max-w-xs transition-colors truncate"
            placeholder="My Resume"
            title="Rename Resume"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Template Selector */}
          <select
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            className="bg-[#1a1a1a] border border-gray-800 text-xs font-semibold text-white px-2 py-1.5 rounded-md focus:outline-none focus:border-gray-600 transition-colors"
          >
            <option value="classic">Classic Style</option>
            <option value="modern">Modern Style</option>
            <option value="minimal">Minimal Style</option>
            <option value="academic">Academic Style</option>
          </select>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all border ${
              saveStatus === 'success'
                ? 'bg-green-950/20 text-green-400 border-green-900/40'
                : saveStatus === 'error'
                ? 'bg-red-950/20 text-red-400 border-red-900/40'
                : 'bg-[#1a1a1a] text-white hover:bg-gray-800 border-gray-800 hover:border-gray-700'
            }`}
          >
            {saveStatus === 'saving' ? (
              <>
                <Loader size={14} className="animate-spin text-gray-400" />
                <span className="hidden sm:inline">Saving</span>
              </>
            ) : saveStatus === 'success' ? (
              <>
                <Check size={14} />
                <span className="hidden sm:inline">Saved</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span className="hidden sm:inline">Save</span>
              </>
            )}
          </button>

          {/* Download PDF button */}
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-gray-200 text-black font-bold rounded-md transition-colors text-xs shadow-sm"
          >
            <Download size={14} />
            <span>PDF</span>
          </button>
        </div>
      </header>

      {/* 2. SPLIT LAYOUT */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Form Editor */}
        <div className="no-print w-full md:w-[450px] lg:w-[500px] flex-shrink-0 border-r border-gray-800 bg-[#0a0a0a] p-4 overflow-y-auto">
          {resumeData && (
            <ResumeForm
              data={resumeData}
              onChange={(updated) => setResumeData(updated)}
            />
          )}
        </div>

        {/* Right Side: Live A4 Preview */}
        <div className="flex-1 bg-[#121212] overflow-y-auto p-4 md:p-8 flex justify-center items-start print:p-0 print:bg-white print:overflow-visible">
          {resumeData && (
            <div className="shadow-2xl border border-gray-800 print:shadow-none print:border-none print-area max-w-full">
              <ResumePreview template={template} data={resumeData} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
