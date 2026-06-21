import React, { useState } from 'react';
import { 
  User, BookOpen, Briefcase, Code, FolderGit, 
  Award, FileText, ChevronDown, ChevronUp, Plus, Trash2,
  Sparkles, Loader, AlertCircle, Check, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AtsChecker from './AtsChecker';

function AIAssistant({ type, text, onApply }) {
  const { API_URL, getAuthHeaders } = useAuth();
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [error, setError] = useState('');
  const [showToolbar, setShowToolbar] = useState(false);

  const handleSuggest = async (promptType) => {
    if (!text || !text.trim()) {
      setError('Please enter some text first so the AI has something to rewrite.');
      setTimeout(() => setError(''), 4000);
      return;
    }

    setLoading(true);
    setError('');
    setSuggestion('');
    try {
      const res = await fetch(`${API_URL}/ai/suggest`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ type, text, promptType }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to get AI suggestions.');
      }

      setSuggestion(data.suggestion);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error contacting AI service.');
    } finally {
      setLoading(false);
    }
  };

  const getOptions = () => {
    switch (type) {
      case 'summary':
        return [
          { label: '✨ Improve Tone', promptType: 'improve' },
          { label: '✨ Make Professional', promptType: 'professional' },
          { label: '✨ Shorten', promptType: 'shorten' }
        ];
      case 'experience':
        return [
          { label: '✨ Suggest Bullets', promptType: 'bullets' },
          { label: '✨ Improve Tone', promptType: 'improve' },
          { label: '✨ Make Professional', promptType: 'professional' }
        ];
      case 'project':
        return [
          { label: '✨ Improve Description', promptType: 'improve' },
          { label: '✨ Highlight Tech', promptType: 'tech' }
        ];
      default:
        return [{ label: '✨ Improve Text', promptType: 'improve' }];
    }
  };

  return (
    <div className="mt-2 text-xs">
      {!showToolbar ? (
        <button
          type="button"
          onClick={() => setShowToolbar(true)}
          className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors py-1 px-2 bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-md font-semibold cursor-pointer"
        >
          <Sparkles size={12} className="text-purple-400" />
          <span>AI Assist</span>
        </button>
      ) : (
        <div className="bg-[#161616] border border-gray-800 rounded-md p-2.5 space-y-2">
          <div className="flex items-center justify-between border-b border-gray-800 pb-1.5 mb-1.5">
            <span className="font-bold text-gray-400 flex items-center gap-1">
              <Sparkles size={12} className="text-purple-400" /> AI Suggestions
            </span>
            <button
              type="button"
              onClick={() => {
                setShowToolbar(false);
                setSuggestion('');
                setError('');
              }}
              className="text-gray-500 hover:text-white transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          {/* Action options */}
          <div className="flex flex-wrap gap-1.5">
            {getOptions().map((opt) => (
              <button
                key={opt.promptType}
                type="button"
                disabled={loading}
                onClick={() => handleSuggest(opt.promptType)}
                className="py-1 px-2.5 bg-gray-800 hover:bg-gray-750 text-white rounded transition-colors font-medium border border-gray-700 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Loading status */}
          {loading && (
            <div className="flex items-center gap-2 text-gray-400 py-1.5">
              <Loader size={12} className="animate-spin text-purple-400" />
              <span>Generating AI suggestion...</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-1.5 text-red-400 bg-red-950/20 border border-red-900/40 p-2 rounded leading-relaxed">
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Suggestion Display */}
          {suggestion && (
            <div className="space-y-2 border border-gray-800 bg-[#121212] p-2 rounded">
              <p className="text-gray-300 whitespace-pre-line leading-relaxed font-sans">{suggestion}</p>
              <div className="flex items-center gap-2 pt-1 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => {
                    onApply(suggestion);
                    setSuggestion('');
                    setShowToolbar(false);
                  }}
                  className="flex items-center gap-1 py-1 px-2.5 bg-white text-black font-bold rounded hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  <Check size={12} />
                  <span>Apply Suggestion</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSuggestion('')}
                  className="py-1 px-2.5 text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  Discard
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


function ATSKeywordSuggester({ data, onAddSkill }) {
  const { API_URL, getAuthHeaders } = useAuth();
  const [loading, setLoading] = useState(false);
  const [keywords, setKeywords] = useState([]);
  const [error, setError] = useState('');
  const [shown, setShown] = useState(false);

  const handleFetch = async () => {
    setLoading(true);
    setError('');
    setKeywords([]);
    setShown(true);

    // Build context strings from resume data
    const headline = data.personalInfo?.headline || '';
    const skills = data.skills || [];
    const experienceText = (data.experience || [])
      .map(e => [e.role, e.company, e.description].filter(Boolean).join(' '))
      .join(' | ');
    const projectText = (data.projects || [])
      .map(p => [p.name, p.techStack, p.description].filter(Boolean).join(' '))
      .join(' | ');

    try {
      const res = await fetch(`${API_URL}/ai/ats-keywords`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ headline, skills, experienceText, projectText }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to get keyword suggestions.');
      setKeywords(json.keywords || []);
    } catch (err) {
      setError(err.message || 'Error contacting AI service.');
    } finally {
      setLoading(false);
    }
  };

  const currentSkills = (data.skills || []).map(s => s.toLowerCase());

  return (
    <div className="mt-3 text-xs">
      {!shown ? (
        <button
          type="button"
          onClick={handleFetch}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors py-1.5 px-3 bg-gray-900 border border-purple-900/50 hover:border-purple-700 rounded-md font-semibold cursor-pointer"
        >
          <Sparkles size={12} className="text-purple-400" />
          <span>✨ Suggest ATS Keywords</span>
        </button>
      ) : (
        <div className="bg-[#0f0a1a] border border-purple-900/40 rounded-md p-3 space-y-2.5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="font-bold text-purple-300 flex items-center gap-1.5">
              <Sparkles size={12} className="text-purple-400" />
              ATS Keyword Suggestions
            </span>
            <button
              type="button"
              onClick={() => { setShown(false); setKeywords([]); setError(''); }}
              className="text-gray-500 hover:text-white transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center gap-2 text-gray-400 py-1">
              <Loader size={12} className="animate-spin text-purple-400" />
              <span>Analyzing your resume for ATS keywords...</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-1.5 text-red-400 bg-red-950/20 border border-red-900/40 p-2 rounded leading-relaxed">
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Keyword chips */}
          {keywords.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Click to add to your skills:</p>
              <div className="flex flex-wrap gap-1.5">
                {keywords.map((kw, idx) => {
                  const alreadyAdded = currentSkills.includes(kw.toLowerCase());
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={alreadyAdded}
                      onClick={() => !alreadyAdded && onAddSkill(kw)}
                      title={alreadyAdded ? 'Already in your skills' : `Add "${kw}" to skills`}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md border text-[11px] font-medium transition-all ${
                        alreadyAdded
                          ? 'bg-gray-900 border-gray-800 text-gray-600 cursor-default'
                          : 'bg-purple-950/50 border-purple-800/60 text-purple-200 hover:bg-purple-900/60 hover:border-purple-600 cursor-pointer'
                      }`}
                    >
                      {alreadyAdded ? <Check size={10} className="text-gray-600" /> : <Plus size={10} />}
                      {kw}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={handleFetch}
                disabled={loading}
                className="text-[10px] text-purple-500 hover:text-purple-300 underline transition-colors cursor-pointer disabled:opacity-50"
              >
                ↻ Regenerate suggestions
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


export default function ResumeForm({ data, onChange }) {
  const [activeSection, setActiveSection] = useState('personalInfo');

  const toggleSection = (sectionName) => {
    setActiveSection(activeSection === sectionName ? null : sectionName);
  };

  // Helper to update deeply nested fields
  const updateField = (section, field, value) => {
    const updated = {
      ...data,
      [section]: {
        ...data[section],
        [field]: value
      }
    };
    onChange(updated);
  };

  // Helper to update list-based items (experience, education, projects, certifications)
  const updateListItem = (section, index, field, value) => {
    const list = [...(data[section] || [])];
    list[index] = {
      ...list[index],
      [field]: value
    };
    onChange({
      ...data,
      [section]: list
    });
  };

  // Add item to list
  const addListItem = (section, template) => {
    const list = [...(data[section] || [])];
    list.push({ ...template, id: crypto.randomUUID() });
    onChange({
      ...data,
      [section]: list
    });
  };

  // Remove item from list
  const removeListItem = (section, index) => {
    const list = [...(data[section] || [])];
    list.splice(index, 1);
    onChange({
      ...data,
      [section]: list
    });
  };

  // Manage Skills
  const [skillInput, setSkillInput] = useState('');
  const handleAddSkill = (e) => {
    e.preventDefault();
    const cleanSkill = skillInput.trim();
    if (cleanSkill && !data.skills.includes(cleanSkill)) {
      onChange({
        ...data,
        skills: [...data.skills, cleanSkill]
      });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    onChange({
      ...data,
      skills: data.skills.filter(s => s !== skillToRemove)
    });
  };

  // Templates for list items
  const expTemplate = { company: '', role: '', startDate: '', endDate: '', description: '' };
  const eduTemplate = { school: '', degree: '', fieldOfStudy: '', startYear: '', endYear: '', gpa: '', location: '' };
  const projectTemplate = { name: '', techStack: '', description: '' };
  const certTemplate = { name: '', issuer: '', date: '' };

  const sectionHeader = (id, label, Icon) => {
    const isOpen = activeSection === id;
    return (
      <button
        onClick={() => toggleSection(id)}
        className={`w-full flex items-center justify-between p-4 bg-[#1a1a1a] hover:bg-[#222222] transition-colors border-b border-gray-800 text-left ${isOpen ? 'text-white' : 'text-gray-400'}`}
      >
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-md ${isOpen ? 'bg-white text-black' : 'bg-gray-800 text-gray-400'}`}>
            <Icon size={16} />
          </div>
          <span className="font-bold text-sm tracking-wide">{label}</span>
        </div>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
    );
  };

  return (
    <div className="space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto pr-1">
      {/* ATS CHECKER */}
      <AtsChecker data={data} />

      {/* 1. PERSONAL INFO */}
      <div className="border border-gray-800 rounded-lg overflow-hidden bg-[#121212]">
        {sectionHeader('personalInfo', 'Personal Information', User)}
        {activeSection === 'personalInfo' && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Full Name</label>
                <input
                  type="text"
                  value={data.personalInfo?.fullName || ''}
                  onChange={(e) => updateField('personalInfo', 'fullName', e.target.value)}
                  className="w-full bg-[#161616] border border-gray-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-600"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Headline</label>
                <input
                  type="text"
                  value={data.personalInfo?.headline || ''}
                  onChange={(e) => updateField('personalInfo', 'headline', e.target.value)}
                  className="w-full bg-[#161616] border border-gray-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-600"
                  placeholder="Software Engineer"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  value={data.personalInfo?.email || ''}
                  onChange={(e) => updateField('personalInfo', 'email', e.target.value)}
                  className="w-full bg-[#161616] border border-gray-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-600"
                  placeholder="johndoe@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Phone</label>
                <input
                  type="text"
                  value={data.personalInfo?.phone || ''}
                  onChange={(e) => updateField('personalInfo', 'phone', e.target.value)}
                  className="w-full bg-[#161616] border border-gray-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-600"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Location</label>
                <input
                  type="text"
                  value={data.personalInfo?.location || ''}
                  onChange={(e) => updateField('personalInfo', 'location', e.target.value)}
                  className="w-full bg-[#161616] border border-gray-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-600"
                  placeholder="New York, NY"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Website</label>
                <input
                  type="text"
                  value={data.personalInfo?.website || ''}
                  onChange={(e) => updateField('personalInfo', 'website', e.target.value)}
                  className="w-full bg-[#161616] border border-gray-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-600"
                  placeholder="https://johndoe.dev"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">LinkedIn URL</label>
                <input
                  type="text"
                  value={data.personalInfo?.linkedin || ''}
                  onChange={(e) => updateField('personalInfo', 'linkedin', e.target.value)}
                  className="w-full bg-[#161616] border border-gray-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-600"
                  placeholder="https://linkedin.com/in/johndoe"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">GitHub URL</label>
                <input
                  type="text"
                  value={data.personalInfo?.github || ''}
                  onChange={(e) => updateField('personalInfo', 'github', e.target.value)}
                  className="w-full bg-[#161616] border border-gray-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-600"
                  placeholder="https://github.com/johndoe"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. SUMMARY */}
      <div className="border border-gray-800 rounded-lg overflow-hidden bg-[#121212]">
        {sectionHeader('summary', 'Professional Summary', FileText)}
        {activeSection === 'summary' && (
          <div className="p-4">
            <label className="block text-xs font-semibold text-gray-400 mb-1">Summary / Profile Statement</label>
            <textarea
              rows={4}
              value={data.summary || ''}
              onChange={(e) => onChange({ ...data, summary: e.target.value })}
              className="w-full bg-[#161616] border border-gray-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-600 resize-y"
              placeholder="Describe your professional journey, key achievements, and skills..."
            />
            <AIAssistant
              type="summary"
              text={data.summary || ''}
              onApply={(val) => onChange({ ...data, summary: val })}
            />
          </div>
        )}
      </div>

      {/* 3. EXPERIENCE */}
      <div className="border border-gray-800 rounded-lg overflow-hidden bg-[#121212]">
        {sectionHeader('experience', 'Work Experience', Briefcase)}
        {activeSection === 'experience' && (
          <div className="p-4 space-y-4">
            {(data.experience || []).map((exp, idx) => (
              <div key={exp.id || idx} className="p-3 border border-gray-800 bg-[#161616] rounded-md space-y-3 relative group">
                <button
                  type="button"
                  onClick={() => removeListItem('experience', idx)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-red-400 transition-colors"
                  title="Remove Job"
                >
                  <Trash2 size={16} />
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Company</label>
                    <input
                      type="text"
                      value={exp.company || ''}
                      onChange={(e) => updateListItem('experience', idx, 'company', e.target.value)}
                      className="w-full bg-[#121212] border border-gray-800 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-gray-600"
                      placeholder="Tech Corp"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Role / Job Title</label>
                    <input
                      type="text"
                      value={exp.role || ''}
                      onChange={(e) => updateListItem('experience', idx, 'role', e.target.value)}
                      className="w-full bg-[#121212] border border-gray-800 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-gray-600"
                      placeholder="Senior Developer"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Start Date</label>
                    <input
                      type="text"
                      value={exp.startDate || ''}
                      onChange={(e) => updateListItem('experience', idx, 'startDate', e.target.value)}
                      className="w-full bg-[#121212] border border-gray-800 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-gray-600"
                      placeholder="Jan 2023"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">End Date</label>
                    <input
                      type="text"
                      value={exp.endDate || ''}
                      onChange={(e) => updateListItem('experience', idx, 'endDate', e.target.value)}
                      className="w-full bg-[#121212] border border-gray-800 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-gray-600"
                      placeholder="Present"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={exp.description || ''}
                    onChange={(e) => updateListItem('experience', idx, 'description', e.target.value)}
                    className="w-full bg-[#121212] border border-gray-800 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-gray-600 resize-y"
                    placeholder="Bullet points describing details of duties and accomplishments..."
                  />
                  <AIAssistant
                    type="experience"
                    text={exp.description || ''}
                    onApply={(val) => updateListItem('experience', idx, 'description', val)}
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addListItem('experience', expTemplate)}
              className="w-full py-2 flex items-center justify-center gap-1.5 bg-[#161616] hover:bg-[#1f1f1f] text-xs text-white font-medium border border-gray-800 rounded-md transition-colors"
            >
              <Plus size={14} /> Add Experience
            </button>
          </div>
        )}
      </div>

      {/* 4. PROJECTS */}
      <div className="border border-gray-800 rounded-lg overflow-hidden bg-[#121212]">
        {sectionHeader('projects', 'Key Projects', FolderGit)}
        {activeSection === 'projects' && (
          <div className="p-4 space-y-4">
            {(data.projects || []).map((proj, idx) => (
              <div key={proj.id || idx} className="p-3 border border-gray-800 bg-[#161616] rounded-md space-y-3 relative group">
                <button
                  type="button"
                  onClick={() => removeListItem('projects', idx)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-red-400 transition-colors"
                  title="Remove Project"
                >
                  <Trash2 size={16} />
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Project Name</label>
                    <input
                      type="text"
                      value={proj.name || ''}
                      onChange={(e) => updateListItem('projects', idx, 'name', e.target.value)}
                      className="w-full bg-[#121212] border border-gray-800 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-gray-600"
                      placeholder="ResumeForge"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Tech Stack</label>
                    <input
                      type="text"
                      value={proj.techStack || ''}
                      onChange={(e) => updateListItem('projects', idx, 'techStack', e.target.value)}
                      className="w-full bg-[#121212] border border-gray-800 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-gray-600"
                      placeholder="React, Express, SQLite"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={proj.description || ''}
                    onChange={(e) => updateListItem('projects', idx, 'description', e.target.value)}
                    className="w-full bg-[#121212] border border-gray-800 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-gray-600 resize-y"
                    placeholder="Brief description of project outcomes, features, and your work..."
                  />
                  <AIAssistant
                    type="project"
                    text={proj.description || ''}
                    onApply={(val) => updateListItem('projects', idx, 'description', val)}
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addListItem('projects', projectTemplate)}
              className="w-full py-2 flex items-center justify-center gap-1.5 bg-[#161616] hover:bg-[#1f1f1f] text-xs text-white font-medium border border-gray-800 rounded-md transition-colors"
            >
              <Plus size={14} /> Add Project
            </button>
          </div>
        )}
      </div>

      {/* 5. SKILLS */}
      <div className="border border-gray-800 rounded-lg overflow-hidden bg-[#121212]">
        {sectionHeader('skills', 'Skills', Code)}
        {activeSection === 'skills' && (
          <div className="p-4 space-y-3">
            <form onSubmit={handleAddSkill} className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                className="flex-1 bg-[#161616] border border-gray-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-600"
                placeholder="e.g. JavaScript, React, ATS"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-white text-black font-semibold text-sm rounded-md hover:bg-gray-200 transition-colors"
              >
                Add
              </button>
            </form>
            <div className="flex flex-wrap gap-2 pt-2">
              {(data.skills || []).map((skill, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 bg-[#161616] text-white border border-gray-800 rounded-md"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-gray-500 hover:text-red-400 ml-1 focus:outline-none font-bold text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
              {(!data.skills || data.skills.length === 0) && (
                <p className="text-xs text-gray-500 italic">No skills added yet.</p>
              )}
            </div>
            {/* AI-powered ATS Keyword Suggester */}
            <ATSKeywordSuggester
              data={data}
              onAddSkill={(kw) => {
                const cleanKw = kw.trim();
                if (cleanKw && !(data.skills || []).includes(cleanKw)) {
                  onChange({ ...data, skills: [...(data.skills || []), cleanKw] });
                }
              }}
            />
          </div>
        )}
      </div>

      {/* 6. EDUCATION */}
      <div className="border border-gray-800 rounded-lg overflow-hidden bg-[#121212]">
        {sectionHeader('education', 'Education', BookOpen)}
        {activeSection === 'education' && (
          <div className="p-4 space-y-4">
            {(data.education || []).map((edu, idx) => (
              <div key={edu.id || idx} className="p-3 border border-gray-800 bg-[#161616] rounded-md space-y-3 relative group">
                <button
                  type="button"
                  onClick={() => removeListItem('education', idx)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-red-400 transition-colors"
                  title="Remove School"
                >
                  <Trash2 size={16} />
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">School / University</label>
                    <input
                      type="text"
                      value={edu.school || ''}
                      onChange={(e) => updateListItem('education', idx, 'school', e.target.value)}
                      className="w-full bg-[#121212] border border-gray-800 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-gray-600"
                      placeholder="Stanford University"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Degree</label>
                    <input
                      type="text"
                      value={edu.degree || ''}
                      onChange={(e) => updateListItem('education', idx, 'degree', e.target.value)}
                      className="w-full bg-[#121212] border border-gray-800 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-gray-600"
                      placeholder="Bachelor of Science"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Field of Study</label>
                    <input
                      type="text"
                      value={edu.fieldOfStudy || ''}
                      onChange={(e) => updateListItem('education', idx, 'fieldOfStudy', e.target.value)}
                      className="w-full bg-[#121212] border border-gray-800 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-gray-600"
                      placeholder="Computer Science"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Start Year</label>
                    <input
                      type="text"
                      value={edu.startYear || ''}
                      onChange={(e) => updateListItem('education', idx, 'startYear', e.target.value)}
                      className="w-full bg-[#121212] border border-gray-800 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-gray-600"
                      placeholder="2018"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">End Year</label>
                    <input
                      type="text"
                      value={edu.endYear || ''}
                      onChange={(e) => updateListItem('education', idx, 'endYear', e.target.value)}
                      className="w-full bg-[#121212] border border-gray-800 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-gray-600"
                      placeholder="2022"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">GPA / CGPA</label>
                    <input
                      type="text"
                      value={edu.gpa || ''}
                      onChange={(e) => updateListItem('education', idx, 'gpa', e.target.value)}
                      className="w-full bg-[#121212] border border-gray-800 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-gray-600"
                      placeholder="e.g. 8.5 / 10"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Location</label>
                    <input
                      type="text"
                      value={edu.location || ''}
                      onChange={(e) => updateListItem('education', idx, 'location', e.target.value)}
                      className="w-full bg-[#121212] border border-gray-800 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-gray-600"
                      placeholder="Hyderabad"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addListItem('education', eduTemplate)}
              className="w-full py-2 flex items-center justify-center gap-1.5 bg-[#161616] hover:bg-[#1f1f1f] text-xs text-white font-medium border border-gray-800 rounded-md transition-colors"
            >
              <Plus size={14} /> Add Education
            </button>
          </div>
        )}
      </div>

      {/* 7. CERTIFICATIONS */}
      <div className="border border-gray-800 rounded-lg overflow-hidden bg-[#121212]">
        {sectionHeader('certifications', 'Certifications', Award)}
        {activeSection === 'certifications' && (
          <div className="p-4 space-y-4">
            {(data.certifications || []).map((cert, idx) => (
              <div key={cert.id || idx} className="p-3 border border-gray-800 bg-[#161616] rounded-md space-y-3 relative group">
                <button
                  type="button"
                  onClick={() => removeListItem('certifications', idx)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-red-400 transition-colors"
                  title="Remove Certification"
                >
                  <Trash2 size={16} />
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pr-6">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Cert Name</label>
                    <input
                      type="text"
                      value={cert.name || ''}
                      onChange={(e) => updateListItem('certifications', idx, 'name', e.target.value)}
                      className="w-full bg-[#121212] border border-gray-800 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-gray-600"
                      placeholder="AWS Practitioner"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Issuer</label>
                    <input
                      type="text"
                      value={cert.issuer || ''}
                      onChange={(e) => updateListItem('certifications', idx, 'issuer', e.target.value)}
                      className="w-full bg-[#121212] border border-gray-800 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-gray-600"
                      placeholder="Amazon"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Date</label>
                    <input
                      type="text"
                      value={cert.date || ''}
                      onChange={(e) => updateListItem('certifications', idx, 'date', e.target.value)}
                      className="w-full bg-[#121212] border border-gray-800 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-gray-600"
                      placeholder="2024"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addListItem('certifications', certTemplate)}
              className="w-full py-2 flex items-center justify-center gap-1.5 bg-[#161616] hover:bg-[#1f1f1f] text-xs text-white font-medium border border-gray-800 rounded-md transition-colors"
            >
              <Plus size={14} /> Add Certification
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
