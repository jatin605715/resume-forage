import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, Download, FileText, Calendar, Loader } from 'lucide-react';
import Navbar from '../components/Navbar';
import ResumePreview from '../components/ResumePreview';

export default function Dashboard() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [printingResume, setPrintingResume] = useState(null); // Selected resume data for printing
  const { getAuthHeaders, API_URL } = useAuth();
  const navigate = useNavigate();

  // Fetch resumes on mount
  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_URL}/resumes`, {
        headers: getAuthHeaders()
      });

      if (!res.ok) {
        throw new Error('Failed to load resumes.');
      }

      const data = await res.json();
      setResumes(data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load your resumes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/resumes/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!res.ok) {
        throw new Error('Failed to delete resume.');
      }

      setResumes(resumes.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete the resume. Please try again.');
    }
  };

  // Direct download/print from dashboard
  const handleDownload = async (id) => {
    try {
      const res = await fetch(`${API_URL}/resumes/${id}`, {
        headers: getAuthHeaders()
      });

      if (!res.ok) {
        throw new Error('Failed to fetch resume details.');
      }

      const resumeData = await res.json();
      setPrintingResume(resumeData);
      
      // Allow DOM to render print container before triggering print
      setTimeout(() => {
        window.print();
        setPrintingResume(null);
      }, 300);

    } catch (err) {
      console.error(err);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hidden Print Container for A4 PDF download */}
      {printingResume && (
        <div className="absolute top-0 left-0 w-full z-[-9999] hidden print:block">
          <ResumePreview template={printingResume.template} data={printingResume.data} />
        </div>
      )}

      {/* Main Dashboard UI */}
      <div className="no-print">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">My Resumes</h1>
              <p className="text-sm text-gray-500 mt-1">Manage and edit your ATS-friendly resumes</p>
            </div>
            
            <button
              onClick={() => navigate('/templates')}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white text-black hover:bg-gray-200 transition-colors rounded-md font-bold text-sm shadow-sm"
            >
              <Plus size={16} />
              New Resume
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-950/50 border border-red-900/60 text-red-200 text-xs rounded-md mb-6">
              {errorMsg}
            </div>
          )}

          {/* Resumes Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader size={36} className="animate-spin text-gray-400" />
              <span className="text-sm text-gray-500 font-medium">Loading resumes...</span>
            </div>
          ) : resumes.length === 0 ? (
            <div className="flex flex-col items-center justify-center border border-dashed border-gray-800 rounded-xl p-12 text-center max-w-lg mx-auto mt-6 bg-[#070707]">
              <div className="bg-gray-900 text-gray-400 p-4 rounded-full border border-gray-800 mb-4">
                <FileText size={32} />
              </div>
              <h3 className="text-lg font-bold">No resumes yet</h3>
              <p className="text-sm text-gray-500 mt-2 max-w-sm">
                Create your first professional resume by picking one of our pre-designed templates.
              </p>
              <button
                onClick={() => navigate('/templates')}
                className="mt-6 px-4 py-2 bg-white text-black font-bold rounded-md hover:bg-gray-200 transition-all text-xs"
              >
                Create First Resume
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {resumes.map((resume) => (
                <div 
                  key={resume.id}
                  className="flex flex-col justify-between bg-[#0f0f0f] border border-gray-800 rounded-xl hover:border-gray-700 transition-all group overflow-hidden"
                >
                  {/* Miniature Resume Icon/Design Section */}
                  <div className="h-32 bg-[#141414] border-b border-gray-800 flex items-center justify-center relative">
                    <FileText size={40} className="text-gray-600 transition-transform group-hover:scale-110" />
                    <span className="absolute top-2.5 right-2.5 text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded border border-gray-800 bg-[#0f0f0f] text-gray-400 font-mono">
                      {resume.template}
                    </span>
                  </div>

                  {/* Body details */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="mb-4">
                      <h4 className="text-base font-bold text-white group-hover:text-gray-300 transition-colors line-clamp-1">
                        {resume.title}
                      </h4>
                      <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-1.5 font-medium">
                        <Calendar size={12} />
                        <span>Updated {formatDate(resume.updatedAt)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-3 gap-2 border-t border-gray-900 pt-4">
                      <button
                        onClick={() => navigate(`/builder/${resume.id}`)}
                        className="flex items-center justify-center gap-1 py-1.5 rounded bg-[#161616] hover:bg-gray-800 text-xs font-semibold text-white border border-gray-800 transition-colors"
                        title="Edit Resume"
                      >
                        <Edit2 size={13} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDownload(resume.id)}
                        className="flex items-center justify-center gap-1 py-1.5 rounded bg-[#161616] hover:bg-gray-800 text-xs font-semibold text-white border border-gray-800 transition-colors"
                        title="Download PDF"
                      >
                        <Download size={13} />
                        PDF
                      </button>
                      <button
                        onClick={() => handleDelete(resume.id, resume.title)}
                        className="flex items-center justify-center gap-1 py-1.5 rounded bg-transparent hover:bg-red-950/25 hover:border-red-900/40 text-xs font-semibold text-gray-500 hover:text-red-400 border border-transparent transition-colors"
                        title="Delete Resume"
                      >
                        <Trash2 size={13} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
