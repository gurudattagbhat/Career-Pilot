import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  DollarSign, 
  CheckCircle2, 
  Sliders, 
  Layers, 
  Tag, 
  Plus, 
  RefreshCw, 
  Building2, 
  ArrowRight,
  Check,
  RotateCcw,
  Globe
} from 'lucide-react';
import { ALL_PLATFORMS } from './HeroProfileUploader';

const POPULAR_INDIAN_CITIES = [
  'Bengaluru',
  'Remote India',
  'Hyderabad',
  'Pune',
  'Gurugram',
  'Noida',
  'Mumbai',
  'Chennai',
  'Delhi-NCR'
];

export default function ResumeCustomizationModal({
  isOpen,
  onClose,
  profile,
  atsScore,
  onApplyAndScrape,
  initialFilters = {}
}) {
  if (!isOpen || !profile) return null;

  // Extract initial values from profile
  const rawRole = profile.targetRole || profile.headline || profile.personalInfo?.headline || 'Senior Full Stack Engineer';
  const rawLocation = profile.location || profile.personalInfo?.location || 'Bengaluru';
  let defaultCity = 'Bengaluru';
  for (const c of POPULAR_INDIAN_CITIES) {
    if (rawLocation.toLowerCase().includes(c.toLowerCase())) {
      defaultCity = c;
      break;
    }
  }

  const extractedEducation = (profile.education && profile.education.length > 0)
    ? profile.education[0]
    : null;

  const initialSkillsList = [
    ...(profile.skills?.technical || []),
    ...(profile.skills?.frameworks || []),
    ...(profile.skills?.databases || []),
    ...(profile.skills?.cloudAndDevops || [])
  ];
  // Deduplicate initial skills
  const uniqueSkills = Array.from(new Set(initialSkillsList)).slice(0, 20);

  const headStr = (profile.headline || profile.targetRole || profile.personalInfo?.headline || '').toLowerCase();
  const eduStr = ((profile.education || []).map(e => `${e.degree} ${e.institution}`).join(' ')).toLowerCase();
  const isStudentOrFresher = `${headStr} ${eduStr}`.includes('student') || `${headStr} ${eduStr}`.includes('fresher') || `${headStr} ${eduStr}`.includes('intern') || `${headStr} ${eduStr}`.includes('graduate') || `${headStr} ${eduStr}`.includes('mca') || `${headStr} ${eduStr}`.includes('b.tech');
  const defaultExp = initialFilters.experienceLevel && initialFilters.experienceLevel !== 'All' 
    ? initialFilters.experienceLevel 
    : (isStudentOrFresher ? 'Fresher' : 'All');

  const [searchMode, setSearchMode] = useState('all_skills');
  const [targetRole, setTargetRole] = useState(rawRole);
  const [selectedCity, setSelectedCity] = useState(defaultCity);
  const [customCity, setCustomCity] = useState('');
  const [workMode, setWorkMode] = useState('All'); // All, Remote Only, Hybrid, In-Office
  const [experienceLevel, setExperienceLevel] = useState(defaultExp);
  const [customExpInput, setCustomExpInput] = useState('');
  const [minLpa, setMinLpa] = useState(initialFilters.minLpa || 0);
  const [selectedPlatforms, setSelectedPlatforms] = useState(ALL_PLATFORMS.map(p => p.id));
  
  // Skills list state
  const [skillsList, setSkillsList] = useState(uniqueSkills);
  // Selected skills state (for custom_skills mode)
  const [selectedSkills, setSelectedSkills] = useState(uniqueSkills);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [scraping, setScraping] = useState(false);

  // Toggle individual skill selection
  const handleToggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSelectAllSkills = () => {
    setSelectedSkills([...skillsList]);
  };

  const handleClearAllSkills = () => {
    setSelectedSkills([]);
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    const clean = newSkillInput.trim();
    if (clean) {
      if (!skillsList.includes(clean)) {
        setSkillsList([...skillsList, clean]);
      }
      if (!selectedSkills.includes(clean)) {
        setSelectedSkills([...selectedSkills, clean]);
      }
      setNewSkillInput('');
    }
  };

  const handleRemoveSkillCompletely = (skillToRemove) => {
    setSkillsList(skillsList.filter(s => s !== skillToRemove));
    setSelectedSkills(selectedSkills.filter(s => s !== skillToRemove));
  };

  const handleScrapeSubmit = async () => {
    setScraping(true);
    const effectiveLocation = customCity.trim() || selectedCity;
    
    // Determine effective skills to search
    let effectiveSkills = [];
    if (searchMode === 'all_skills') {
      effectiveSkills = skillsList;
    } else if (searchMode === 'custom_skills') {
      effectiveSkills = selectedSkills.length > 0 ? selectedSkills : skillsList;
    } else {
      // role mode: still pass skills for match scoring
      effectiveSkills = selectedSkills.length > 0 ? selectedSkills : skillsList;
    }

    const effectiveExp = customExpInput.trim() || experienceLevel;

    try {
      await onApplyAndScrape({
        searchMode,
        targetRole,
        location: effectiveLocation,
        workMode,
        remoteOnly: workMode === 'Remote Only',
        experienceLevel: effectiveExp,
        minLpa,
        skills: effectiveSkills,
        platforms: selectedPlatforms
      });
      onClose();
    } catch (err) {
      console.error('Scrape trigger error:', err);
    } finally {
      setScraping(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-dialog modal-emerald"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '750px'
        }}
      >
        {/* Fixed Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: 'var(--accent-emerald-soft)',
              color: 'var(--accent-emerald)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Sparkles size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                Customize Your Live Job Search
              </h2>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Target specific skills, role headlines, locations & experience level.
              </p>
            </div>
          </div>

          {/* Clean Close Button */}
          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-md)',
              lineHeight: 0,
              color: 'var(--text-muted)'
            }}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body (Cleanly clipped inside dialog, sleek scrollbars) */}
        <div className="modal-body">

        {/* Extracted Intelligence Pill */}
        <div style={{
          marginTop: '14px',
          marginBottom: '18px',
          padding: '12px 16px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>Candidate Extracted:</span>
            <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>
              {profile.name || profile.personalInfo?.name || 'Applicant'}
            </strong>
            {extractedEducation && (
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginLeft: '8px' }}>
                • {extractedEducation.degree} ({extractedEducation.institution || 'Grad'})
              </span>
            )}
          </div>
          {atsScore && (
            <span className="badge badge-emerald" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
              ATS Diagnostic: {atsScore}/100
            </span>
          )}
        </div>

        {/* 1. THREE-WAY SEARCH STRATEGY SELECTOR */}
        <div style={{
          marginBottom: '20px',
          padding: '16px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--border-medium)'
        }}>
          <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '10px' }}>
            🎯 Select Job Search Strategy:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
            {/* Strategy 1: All Resume Skills */}
            <button
              type="button"
              onClick={() => { setSearchMode('all_skills'); setSelectedSkills([...skillsList]); }}
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: searchMode === 'all_skills' ? 'var(--accent-emerald)' : 'var(--bg-card)',
                color: searchMode === 'all_skills' ? '#ffffff' : 'var(--text-primary)',
                border: searchMode === 'all_skills' ? '1px solid var(--accent-emerald)' : '1px solid var(--border-subtle)',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.88rem', marginBottom: '2px' }}>
                <span>🛠️ All Resume Skills</span>
                {searchMode === 'all_skills' && <Check size={15} />}
              </div>
              <div style={{ fontSize: '0.74rem', opacity: searchMode === 'all_skills' ? 0.9 : 0.7 }}>
                Scrape & match across all {skillsList.length} extracted tech skills
              </div>
            </button>

            {/* Strategy 2: Custom Selected Skills */}
            <button
              type="button"
              onClick={() => setSearchMode('custom_skills')}
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: searchMode === 'custom_skills' ? 'var(--accent-emerald)' : 'var(--bg-card)',
                color: searchMode === 'custom_skills' ? '#ffffff' : 'var(--text-primary)',
                border: searchMode === 'custom_skills' ? '1px solid var(--accent-emerald)' : '1px solid var(--border-subtle)',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.88rem', marginBottom: '2px' }}>
                <span>✏️ Custom Skill Selection</span>
                {searchMode === 'custom_skills' && <Check size={15} />}
              </div>
              <div style={{ fontSize: '0.74rem', opacity: searchMode === 'custom_skills' ? 0.9 : 0.7 }}>
                Pick, toggle or add specific skills to search ({selectedSkills.length} selected)
              </div>
            </button>

            {/* Strategy 3: Target Role */}
            <button
              type="button"
              onClick={() => setSearchMode('role')}
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: searchMode === 'role' ? 'var(--accent-emerald)' : 'var(--bg-card)',
                color: searchMode === 'role' ? '#ffffff' : 'var(--text-primary)',
                border: searchMode === 'role' ? '1px solid var(--accent-emerald)' : '1px solid var(--border-subtle)',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.88rem', marginBottom: '2px' }}>
                <span>🎯 Target Job Role</span>
                {searchMode === 'role' && <Check size={15} />}
              </div>
              <div style={{ fontSize: '0.74rem', opacity: searchMode === 'role' ? 0.9 : 0.7 }}>
                Search for a specific job title (e.g. {targetRole.slice(0, 18)}...)
              </div>
            </button>
          </div>
        </div>

        {/* 2. SKILLS CUSTOMIZATION PANEL (FOR ALL_SKILLS OR CUSTOM_SKILLS) */}
        <div style={{
          marginBottom: '20px',
          padding: '16px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Tag size={15} color="var(--accent-emerald)" />
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {searchMode === 'all_skills' ? `All Resume Skills (${skillsList.length} Included)` : searchMode === 'custom_skills' ? `Selected Skills for Search (${selectedSkills.length} of ${skillsList.length})` : `Candidate Skills (for ATS Match Scoring)`}
              </span>
            </div>

            {searchMode === 'custom_skills' && (
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={handleSelectAllSkills}
                  style={{
                    padding: '3px 8px',
                    fontSize: '0.72rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={handleClearAllSkills}
                  style={{
                    padding: '3px 8px',
                    fontSize: '0.72rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  Clear All
                </button>
              </div>
            )}
          </div>

          {/* Interactive Skills Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '130px', overflowY: 'auto', marginBottom: '10px' }}>
            {skillsList.map((skill, idx) => {
              const isSelected = searchMode === 'all_skills' ? true : selectedSkills.includes(skill);
              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (searchMode === 'custom_skills') {
                      handleToggleSkill(skill);
                    }
                  }}
                  style={{
                    fontSize: '0.78rem',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: isSelected ? 'var(--accent-emerald-soft)' : 'var(--bg-card)',
                    color: isSelected ? 'var(--accent-emerald)' : 'var(--text-muted)',
                    border: isSelected ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-subtle)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    cursor: searchMode === 'custom_skills' ? 'pointer' : 'default',
                    transition: 'all 0.15s ease'
                  }}
                  title={searchMode === 'custom_skills' ? (isSelected ? 'Click to deselect from search' : 'Click to select for search') : 'Extracted skill'}
                >
                  {searchMode === 'custom_skills' && (
                    <span style={{
                      width: '13px',
                      height: '13px',
                      borderRadius: '3px',
                      backgroundColor: isSelected ? 'var(--accent-emerald)' : 'transparent',
                      border: isSelected ? 'none' : '1px solid var(--border-medium)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontSize: '9px'
                    }}>
                      {isSelected ? '✓' : ''}
                    </span>
                  )}
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveSkillCompletely(skill);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Remove skill completely"
                  >
                    <X size={11} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Add Custom Skill Form */}
          <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: '6px' }}>
            <input
              type="text"
              value={newSkillInput}
              onChange={(e) => setNewSkillInput(e.target.value)}
              placeholder="+ Add custom skill (e.g. Next.js, Kubernetes, Kafka, AWS)..."
              style={{
                padding: '7px 12px',
                fontSize: '0.82rem',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                outline: 'none',
                flex: 1
              }}
            />
            <button
              type="submit"
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.8rem', padding: '7px 14px' }}
            >
              <Plus size={14} />
              <span>Add</span>
            </button>
          </form>
        </div>

        {/* 3. TARGET ROLE (PROMINENT IN ROLE MODE OR EDITABLE AS CONTEXT) */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
            🎯 Target Job Role {searchMode === 'role' ? '(Active Primary Search Query)' : '(Used for ATS Matching & Title Matching)'}:
          </label>
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g. Senior Full Stack Engineer, React Developer, SDE-2"
            style={{
              width: '100%',
              padding: '10px 14px',
              fontSize: '0.9rem',
              backgroundColor: 'var(--bg-input)',
              border: searchMode === 'role' ? '1px solid var(--accent-emerald)' : '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              outline: 'none'
            }}
          />
        </div>

        {/* 4. LOCATION & CITY SELECTION */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
            📍 Preferred Job Location / Tech Hub:
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
            {POPULAR_INDIAN_CITIES.map(city => {
              const isSelected = selectedCity.toLowerCase() === city.toLowerCase() && !customCity;
              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => {
                    setSelectedCity(city);
                    setCustomCity('');
                  }}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    backgroundColor: isSelected ? 'var(--accent-emerald)' : 'var(--bg-elevated)',
                    color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                    border: isSelected ? '1px solid var(--accent-emerald)' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {city}
                </button>
              );
            })}
          </div>
          <input
            type="text"
            value={customCity}
            onChange={(e) => setCustomCity(e.target.value)}
            placeholder="Or enter any custom city (e.g. Chandigarh, Ahmedabad, Kochi)..."
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: '0.85rem',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              outline: 'none'
            }}
          />
        </div>

        {/* 5. WORK MODE */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
            🏢 Work Mode:
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'All', label: '🌐 All Modes (Remote + Hybrid + On-site)' },
              { id: 'Remote Only', label: '🏠 Remote India Only' },
              { id: 'Hybrid', label: '🏢 Hybrid / In-Office' }
            ].map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => setWorkMode(m.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  backgroundColor: workMode === m.id ? 'var(--accent-emerald)' : 'var(--bg-elevated)',
                  color: workMode === m.id ? '#ffffff' : 'var(--text-secondary)',
                  border: workMode === m.id ? '1px solid var(--accent-emerald)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* 6. EXPERIENCE LEVEL SELECTOR & CUSTOM ENTRY */}
        <div style={{
          padding: '16px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Briefcase size={14} color="var(--accent-emerald)" />
              <span>Target Experience Level to Scrape:</span>
            </label>
            <span style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--accent-emerald-soft)',
              color: 'var(--accent-emerald)',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              Selected: {customExpInput.trim() ? customExpInput : (experienceLevel || 'Fresher (0-1 yrs)')}
            </span>
          </div>

          {/* Quick Experience Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
            {[
              { id: 'Fresher', label: '🎓 Fresher / Graduate (0-1 yrs)' },
              { id: 'Junior', label: '💼 Junior / SDE-1 (1-3 yrs)' },
              { id: 'Mid-Level', label: '🚀 Mid-Level / SDE-2 (3-5 yrs)' },
              { id: 'Senior', label: '👑 Senior (5-8 yrs)' },
              { id: 'Lead', label: '🏆 Lead / Architect (8+ yrs)' },
              { id: 'All', label: '🌐 All Experience Levels' }
            ].map(item => {
              const isSelected = !customExpInput && (
                experienceLevel.toLowerCase() === item.id.toLowerCase() ||
                (item.id === 'Fresher' && experienceLevel.toLowerCase().includes('fresh'))
              );
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setExperienceLevel(item.id);
                    setCustomExpInput('');
                  }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    backgroundColor: isSelected ? 'var(--accent-emerald)' : 'var(--bg-card)',
                    color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                    border: isSelected ? '1px solid var(--accent-emerald)' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {isSelected && <Check size={12} />}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Custom Experience Level Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="text"
              value={customExpInput}
              onChange={(e) => setCustomExpInput(e.target.value)}
              placeholder="Or enter custom experience (e.g. 0-2 yrs, 6 months internship, Fresher / SDE-1)..."
              style={{
                padding: '7px 12px',
                fontSize: '0.82rem',
                backgroundColor: 'var(--bg-card)',
                border: customExpInput ? '1px solid var(--accent-emerald)' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                outline: 'none',
                flex: 1
              }}
            />
            {customExpInput && (
              <button
                type="button"
                onClick={() => setCustomExpInput('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  textDecoration: 'underline'
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* 7. MIN LPA SALARY FILTER */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              💰 Minimum Target Annual CTC:
            </label>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
              {minLpa > 0 ? `₹${minLpa}+ LPA` : 'Any CTC'}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="60"
            step="5"
            value={minLpa}
            onChange={(e) => setMinLpa(Number(e.target.value))}
            style={{
              width: '100%',
              accentColor: 'var(--accent-emerald)',
              cursor: 'pointer'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            <span>Any</span>
            <span>₹15 LPA</span>
            <span>₹30 LPA</span>
            <span>₹45 LPA</span>
            <span>₹60+ LPA</span>
          </div>
        </div>

        {/* 8. TARGET PLATFORMS SELECTOR */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Globe size={14} color="var(--accent-emerald)" />
              <span>Target Platforms to Scrape ({selectedPlatforms.length} / {ALL_PLATFORMS.length}):</span>
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setSelectedPlatforms(ALL_PLATFORMS.map(p => p.id))}
                style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
              >
                Select All
              </button>
              <span style={{ color: 'var(--border-subtle)' }}>|</span>
              <button
                type="button"
                onClick={() => setSelectedPlatforms(['LinkedIn India', 'Internshala', 'Instahyre'])}
                style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Top 3
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {ALL_PLATFORMS.map(p => {
              const isSelected = selectedPlatforms.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setSelectedPlatforms(prev => {
                      if (prev.includes(p.id)) {
                        if (prev.length === 1) return prev;
                        return prev.filter(x => x !== p.id);
                      } else {
                        return [...prev, p.id];
                      }
                    });
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    backgroundColor: isSelected ? p.bg : 'var(--bg-elevated)',
                    color: isSelected ? p.color : 'var(--text-muted)',
                    border: isSelected ? `1.5px solid ${p.color}` : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{p.icon}</span>
                  <span>{p.label}</span>
                  <span>{isSelected ? '✓' : '+'}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Search Strategy Preview Banner */}
        <div style={{
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--accent-emerald-soft)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.82rem',
          color: 'var(--text-secondary)'
        }}>
          <span className="pulse-dot"></span>
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>Active Scrape Plan: </strong>
            {searchMode === 'all_skills' ? (
              <span>Searching across <strong>all {skillsList.length} resume skills</strong> ({skillsList.slice(0, 4).join(', ')}...)</span>
            ) : searchMode === 'custom_skills' ? (
              <span>Searching across <strong>{selectedSkills.length} selected skills</strong> ({selectedSkills.slice(0, 4).join(', ')}...)</span>
            ) : (
              <span>Searching for target role <strong>"{targetRole}"</strong></span>
            )}
            <span> for <strong>{customExpInput.trim() || experienceLevel}</strong> in <strong>{customCity.trim() || selectedCity}</strong>.</span>
            <div style={{ marginTop: '2px', fontSize: '0.76rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
              100% verified direct job links tailored to your experience level from Instahyre & LinkedIn India.
            </div>
          </div>
        </div>

        </div>

        {/* Fixed Modal Footer - Always Visible Actions */}
        <div className="modal-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="pulse-dot"></span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              100% verified direct links for <strong>{customExpInput.trim() || experienceLevel}</strong>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ padding: '10px 18px', fontSize: '0.86rem' }}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleScrapeSubmit}
              disabled={scraping}
              className="btn btn-primary"
              style={{
                padding: '10px 22px',
                fontSize: '0.9rem',
                fontWeight: 700,
                gap: '8px'
              }}
            >
              {scraping ? (
                <>
                  <RefreshCw size={16} className="spin-animation" />
                  <span>Scraping Live Web...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>
                    {searchMode === 'all_skills' ? 'Scrape on All Skills' : searchMode === 'custom_skills' ? `Scrape on ${selectedSkills.length} Skills` : `Scrape for "${targetRole.slice(0, 16)}"`}
                  </span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
