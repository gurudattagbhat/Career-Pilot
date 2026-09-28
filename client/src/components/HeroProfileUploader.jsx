import React, { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, 
  FileText, 
  UserPen, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Wand2, 
  GraduationCap, 
  Briefcase, 
  Sliders, 
  MapPin, 
  Plus, 
  X,
  Tag,
  Check,
  Globe
} from 'lucide-react';
import { apiFetch } from '../services/api';

export const ALL_PLATFORMS = [
  { id: 'LinkedIn India', label: 'LinkedIn India', icon: '💼', color: '#0a66c2', bg: 'rgba(10, 102, 194, 0.15)' },
  { id: 'Indeed India', label: 'Indeed India', icon: '🔍', color: '#2557a7', bg: 'rgba(37, 87, 167, 0.15)' },
  { id: 'Internshala', label: 'Internshala', icon: '🎓', color: '#008fcb', bg: 'rgba(0, 143, 203, 0.15)' },
  { id: 'Cutshort', label: 'Cutshort', icon: '🚀', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)' },
  { id: 'Instahyre', label: 'Instahyre', icon: '⚡', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
  { id: 'Foundit India', label: 'Foundit India', icon: '🏢', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' },
  { id: 'Wellfound', label: 'Wellfound', icon: '🦄', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.15)' },
  { id: 'Naukri', label: 'Naukri.com', icon: '📑', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' }
];

const SAMPLE_RESUME_TEXT = `
AARAV SHARMA
aarav.sharma.dev@gmail.com | +91 98765 43210 | Bengaluru, Karnataka, India
LinkedIn: linkedin.com/in/aaravsharma-dev | GitHub: github.com/aarav-sharma
Current CTC: ₹28 LPA | Notice Period: 30 Days (Serving)

PROFESSIONAL SUMMARY
Senior Full-Stack Engineer with 5+ years of experience architecting high-scale consumer internet and fintech systems in India. Expert in MERN stack (MongoDB, Express, React, Node.js), distributed microservices, and event-driven architectures. Proven track record handling 40,000+ RPS during peak IPL flash sales with sub-60ms p99 latency.

CORE SKILLS
- Languages: TypeScript, JavaScript (ES6+), Python, Go, Java, SQL
- Frontend: React.js, Next.js, Redux Toolkit, TailwindCSS, WebSockets, Mobile Web Performance
- Backend: Node.js, Express, Microservices, RESTful APIs, GraphQL, Kafka, gRPC
- Databases & Cloud: MongoDB, PostgreSQL, Redis, AWS (ECS, S3, RDS), Docker, Kubernetes, CI/CD
- System Design: Low-Level Design (LLD), High-Level Design (HLD), Distributed Caching, Concurrency

PROFESSIONAL EXPERIENCE

Senior Software Engineer (SDE-2) | Swiggy | Bengaluru, India | 2022 - Present
- Architected and scaled real-time live order tracking and surge pricing engine using React, Node.js, and Redis, reducing p99 latency by 44% across 14 million daily active Indian consumers.
- Built automated event streaming pipeline using Apache Kafka and MongoDB sharded clusters, processing 85,000 events/second with 99.99% uptime.
- Spearheaded optimization of AWS ECS container infrastructure, saving ₹42 Lakhs annually in cloud computing costs.
- Mentored 5 junior SDE-1 engineers on Low-Level Design (LLD), Clean Architecture, and unit test automation.

Software Development Engineer | Razorpay | Bengaluru, India | 2019 - 2022
- Developed high-conversion Merchant Checkout flow in React and Express, improving mobile checkout completion rate by 31% across UPI, Net Banking, and Cards.
- Implemented robust RBI-compliant tokenization and bank webhook event verification handling ₹150+ Crore daily transaction volume.
- Reduced PostgreSQL query bottlenecks and optimized database connection pooling, slashing p95 latency from 680ms to 78ms.

EDUCATION
B.Tech in Computer Science & Engineering | National Institute of Technology (NIT), Trichy | 2015 - 2019
CGPA: 8.8 / 10.0
`;

const POPULAR_MANUAL_SKILLS = [
  'React', 'Node.js', 'TypeScript', 'JavaScript', 'Python', 'Java',
  'MongoDB', 'PostgreSQL', 'AWS', 'Docker', 'Next.js', 'Express', 'Kafka'
];

export default function HeroProfileUploader({
  profile,
  atsScore,
  groqKey,
  onParsed,
  onManualSaved,
  onOpenCustomization,
  onScrapeForResume
}) {
  const [activeMode, setActiveMode] = useState('upload'); // 'upload' or 'manual'
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState('');
  const [targetRole, setTargetRole] = useState(profile?.targetRole || profile?.headline || 'Senior Full Stack Engineer');
  const [isEditingExisting, setIsEditingExisting] = useState(false);

  // Search mode state for candidate card: 'all_skills' | 'custom_skills' | 'role'
  const [heroSearchMode, setHeroSearchMode] = useState('all_skills');
  const [cardSkillsList, setCardSkillsList] = useState([]);
  const [cardSelectedSkills, setCardSelectedSkills] = useState([]);
  const [quickSkillInput, setQuickSkillInput] = useState('');
  const [heroExperienceLevel, setHeroExperienceLevel] = useState('Fresher');
  const [customExpInput, setCustomExpInput] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState(ALL_PLATFORMS.map(p => p.id));

  useEffect(() => {
    if (profile) {
      const skillsArray = [
        ...(profile.skills?.technical || []),
        ...(profile.skills?.frameworks || []),
        ...(profile.skills?.databases || []),
        ...(profile.skills?.cloudAndDevops || [])
      ];
      const unique = Array.from(new Set(skillsArray)).slice(0, 25);
      setCardSkillsList(unique);
      setCardSelectedSkills(unique);

      // Auto-detect experience level based on profile headline, role or education
      const head = (profile.headline || profile.targetRole || profile.personalInfo?.headline || '').toLowerCase();
      const eduStr = ((profile.education || []).map(e => `${e.degree} ${e.institution}`).join(' ')).toLowerCase();
      const combined = `${head} ${eduStr}`;

      if (combined.includes('student') || combined.includes('intern') || combined.includes('fresher') || combined.includes('entry') || combined.includes('graduate') || combined.includes('mca') || combined.includes('b.tech') || combined.includes('bca')) {
        setHeroExperienceLevel('Fresher');
      } else if (combined.includes('senior') || combined.includes('sr')) {
        setHeroExperienceLevel('Senior');
      } else if (combined.includes('lead') || combined.includes('architect') || combined.includes('staff')) {
        setHeroExperienceLevel('Lead');
      } else if (combined.includes('mid') || combined.includes('sde-2') || combined.includes('sde 2')) {
        setHeroExperienceLevel('Mid-Level');
      } else {
        setHeroExperienceLevel('Fresher');
      }
    }
  }, [profile]);

  const handleToggleCardSkill = (skill) => {
    if (cardSelectedSkills.includes(skill)) {
      setCardSelectedSkills(cardSelectedSkills.filter(s => s !== skill));
    } else {
      setCardSelectedSkills([...cardSelectedSkills, skill]);
    }
  };

  const handleQuickAddSkillToCard = (e) => {
    e.preventDefault();
    const clean = quickSkillInput.trim();
    if (clean) {
      if (!cardSkillsList.includes(clean)) {
        setCardSkillsList([...cardSkillsList, clean]);
      }
      if (!cardSelectedSkills.includes(clean)) {
        setCardSelectedSkills([...cardSelectedSkills, clean]);
      }
      setQuickSkillInput('');
    }
  };

  const fileInputRef = useRef(null);

  // Manual Entry Form State
  const [manualName, setManualName] = useState('');
  const [manualRole, setManualRole] = useState('Full Stack Engineer');
  const [manualCity, setManualCity] = useState('Bengaluru');
  const [manualDegree, setManualDegree] = useState('B.Tech in Computer Science');
  const [manualCollege, setManualCollege] = useState('NIT / Accredited Institute');
  const [manualGradYear, setManualGradYear] = useState('2022');
  const [manualCompany, setManualCompany] = useState('');
  const [manualSkills, setManualSkills] = useState(['React', 'Node.js', 'JavaScript', 'MongoDB']);
  const [newSkillText, setNewSkillText] = useState('');
  const [savingManual, setSavingManual] = useState(false);

  // Handle resume file upload
  const handleFileUpload = async (file) => {
    if (!file) return;
    setFileName(file.name);
    setError(null);
    setUploading(true);

    const formData = new FormData();
    formData.append('resume', file, file.name || 'resume.pdf');
    formData.append('targetRole', targetRole || 'Software Professional');

    try {
      const headers = {};
      if (groqKey) {
        headers['x-groq-api-key'] = groqKey;
      }

      const res = await apiFetch('/api/resume/upload', {
        method: 'POST',
        headers,
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload and parse resume');
      }

      setIsEditingExisting(false);
      onParsed(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  // Handle sample resume testing
  const handleSampleResume = async () => {
    setFileName('Sample_Senior_FullStack_Resume.pdf');
    setError(null);
    setUploading(true);

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (groqKey) {
        headers['x-groq-api-key'] = groqKey;
      }

      const res = await apiFetch('/api/resume/parse-text', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          text: SAMPLE_RESUME_TEXT,
          targetRole: targetRole || 'Senior Full Stack Engineer'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to parse sample resume');
      }

      setIsEditingExisting(false);
      onParsed(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  // Add / remove skills in manual entry
  const handleAddManualSkill = (e) => {
    e.preventDefault();
    if (newSkillText.trim() && !manualSkills.includes(newSkillText.trim())) {
      setManualSkills([...manualSkills, newSkillText.trim()]);
      setNewSkillText('');
    }
  };

  const handleTogglePopularSkill = (skill) => {
    if (manualSkills.includes(skill)) {
      setManualSkills(manualSkills.filter(s => s !== skill));
    } else {
      setManualSkills([...manualSkills, skill]);
    }
  };

  // Handle saving manual entry
  const handleSaveManual = async (e) => {
    e.preventDefault();
    if (!manualName.trim() || !manualRole.trim()) {
      setError('Please provide at least your full name and target job title');
      return;
    }

    setSavingManual(true);
    setError(null);

    const profileData = {
      name: manualName.trim(),
      headline: manualRole.trim(),
      targetRole: manualRole.trim(),
      location: manualCity ? `${manualCity}, India` : 'India',
      summary: `${manualRole} with expertise in ${manualSkills.slice(0, 5).join(', ')}. Graduate from ${manualCollege}.`,
      skills: {
        technical: manualSkills,
        frameworks: manualSkills.filter(s => ['React', 'Next.js', 'Node.js', 'Express'].includes(s)),
        databases: manualSkills.filter(s => ['MongoDB', 'PostgreSQL', 'MySQL', 'Redis'].includes(s)),
        cloudAndDevops: manualSkills.filter(s => ['AWS', 'Docker', 'Kubernetes'].includes(s)),
        softSkills: ['Team Collaboration', 'Problem Solving']
      },
      education: [
        {
          degree: manualDegree.trim(),
          institution: manualCollege.trim(),
          year: manualGradYear.trim()
        }
      ],
      experience: manualCompany.trim() ? [
        {
          company: manualCompany.trim(),
          role: manualRole.trim(),
          location: manualCity || 'India',
          duration: 'Recent',
          bullets: [`Working as ${manualRole} utilizing ${manualSkills.slice(0, 3).join(', ')}.`]
        }
      ] : []
    };

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (groqKey) {
        headers['x-groq-api-key'] = groqKey;
      }

      const res = await apiFetch('/api/resume/manual-profile', {
        method: 'POST',
        headers,
        body: JSON.stringify(profileData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save manual profile');
      }

      setIsEditingExisting(false);
      onManualSaved(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingManual(false);
    }
  };

  // If a profile is already loaded and user is not in "replace/edit" mode
  if (profile && !isEditingExisting) {
    const candidateName = profile.name || profile.personalInfo?.name || 'Applicant';
    const roleHeadline = profile.targetRole || profile.headline || profile.personalInfo?.headline || 'Tech Professional';
    const locationStr = profile.location || profile.personalInfo?.location || 'India';
    const educationItem = (profile.education && profile.education.length > 0) ? profile.education[0] : null;

    const handleTogglePlatform = (platformId) => {
      setSelectedPlatforms(prev => {
        if (prev.includes(platformId)) {
          if (prev.length === 1) return prev; // Keep at least one platform selected
          return prev.filter(p => p !== platformId);
        } else {
          return [...prev, platformId];
        }
      });
    };

    const handleExecuteScrape = () => {
      let skillsToPass = [];
      if (heroSearchMode === 'all_skills') {
        skillsToPass = cardSkillsList;
      } else if (heroSearchMode === 'custom_skills') {
        skillsToPass = cardSelectedSkills.length > 0 ? cardSelectedSkills : cardSkillsList;
      } else {
        skillsToPass = cardSelectedSkills.length > 0 ? cardSelectedSkills : cardSkillsList;
      }
      const effectiveExp = customExpInput.trim() || heroExperienceLevel || 'Fresher';
      const effectivePlatforms = selectedPlatforms.length > 0 ? selectedPlatforms : ALL_PLATFORMS.map(p => p.id);
      if (onScrapeForResume) {
        onScrapeForResume(roleHeadline, heroSearchMode, skillsToPass, effectiveExp, effectivePlatforms);
      }
    };

    return (
      <div className="card" style={{
        maxWidth: '960px',
        margin: '0 auto 28px auto',
        padding: '24px',
        borderRadius: 'var(--radius-xl)',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid rgba(16, 185, 129, 0.4)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
        position: 'relative'
      }}>
        {/* Top Candidate Row */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
          marginBottom: '16px',
          paddingBottom: '14px',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="pulse-dot"></span>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-emerald)', letterSpacing: '0.04em' }}>
                ACTIVE PROFILE LOADED & SCANNED
              </span>
              {atsScore && (
                <span className="badge badge-emerald" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                  ATS: {atsScore}/100
                </span>
              )}
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 4px 0' }}>
              {candidateName}
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{roleHeadline}</span>
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={13} color="var(--accent-emerald)" />
                {locationStr}
              </span>
              {educationItem && (
                <>
                  <span>•</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <GraduationCap size={13} color="var(--accent-emerald)" />
                    {educationItem.degree} {educationItem.institution ? `(${educationItem.institution})` : ''}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Quick links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={onOpenCustomization}
              className="btn btn-secondary btn-sm"
              style={{ gap: '6px', fontSize: '0.8rem' }}
            >
              <Sliders size={14} color="var(--accent-emerald)" />
              <span>Full Customization Modal</span>
            </button>
            <button
              type="button"
              onClick={() => setIsEditingExisting(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '0.78rem',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Re-upload / Edit
            </button>
          </div>
        </div>

        {/* SEARCH STRATEGY CONTROLS */}
        <div style={{
          backgroundColor: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          border: '1px solid var(--border-subtle)',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} color="var(--accent-emerald)" />
              <span>Job Search Strategy:</span>
            </span>

            {/* 3 Mode Switcher Pills */}
            <div style={{
              display: 'inline-flex',
              padding: '3px',
              backgroundColor: 'var(--bg-input)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              <button
                type="button"
                onClick={() => {
                  setHeroSearchMode('all_skills');
                  setCardSelectedSkills([...cardSkillsList]);
                }}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  backgroundColor: heroSearchMode === 'all_skills' ? 'var(--accent-emerald)' : 'transparent',
                  color: heroSearchMode === 'all_skills' ? '#ffffff' : 'var(--text-secondary)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                🛠️ All Resume Skills ({cardSkillsList.length})
              </button>

              <button
                type="button"
                onClick={() => setHeroSearchMode('custom_skills')}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  backgroundColor: heroSearchMode === 'custom_skills' ? 'var(--accent-emerald)' : 'transparent',
                  color: heroSearchMode === 'custom_skills' ? '#ffffff' : 'var(--text-secondary)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                ✏️ Selected Skills ({cardSelectedSkills.length})
              </button>

              <button
                type="button"
                onClick={() => setHeroSearchMode('role')}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  backgroundColor: heroSearchMode === 'role' ? 'var(--accent-emerald)' : 'transparent',
                  color: heroSearchMode === 'role' ? '#ffffff' : 'var(--text-secondary)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                🎯 By Target Role
              </button>
            </div>
          </div>

          {/* Interactive Skills Chip Box */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                {heroSearchMode === 'all_skills' 
                  ? `All ${cardSkillsList.length} skills are active for live search:` 
                  : heroSearchMode === 'custom_skills' 
                  ? `Click tags below to toggle them for your search (${cardSelectedSkills.length} selected):` 
                  : `Resume skills (used for match scoring):`}
              </span>

              {heroSearchMode === 'custom_skills' && (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setCardSelectedSkills([...cardSkillsList])}
                    style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Select All
                  </button>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>|</span>
                  <button
                    type="button"
                    onClick={() => setCardSelectedSkills([])}
                    style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>

            {/* Clickable Skill Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '110px', overflowY: 'auto', marginBottom: '8px' }}>
              {cardSkillsList.map((sk, idx) => {
                const isSelected = heroSearchMode === 'all_skills' ? true : cardSelectedSkills.includes(sk);
                return (
                  <span
                    key={idx}
                    onClick={() => {
                      if (heroSearchMode !== 'custom_skills') {
                        setHeroSearchMode('custom_skills');
                      }
                      handleToggleCardSkill(sk);
                    }}
                    style={{
                      fontSize: '0.76rem',
                      padding: '3px 9px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: isSelected ? 'var(--accent-emerald-soft)' : 'var(--bg-input)',
                      color: isSelected ? 'var(--accent-emerald)' : 'var(--text-muted)',
                      border: isSelected ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.15s ease'
                    }}
                    title={isSelected ? 'Click to deselect' : 'Click to select for search'}
                  >
                    {heroSearchMode === 'custom_skills' && (
                      <span style={{ fontSize: '10px', fontWeight: 800 }}>
                        {isSelected ? '✓' : '+'}
                      </span>
                    )}
                    <span>{sk}</span>
                  </span>
                );
              })}
            </div>

            {/* Inline Quick Add Skill Input */}
            <form onSubmit={handleQuickAddSkillToCard} style={{ display: 'flex', gap: '6px', maxWidth: '380px' }}>
              <input
                type="text"
                value={quickSkillInput}
                onChange={(e) => setQuickSkillInput(e.target.value)}
                placeholder="+ Add another skill to search..."
                style={{
                  padding: '6px 10px',
                  fontSize: '16px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  outline: 'none',
                  flex: 1
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '5px 10px',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer'
                }}
              >
                + Add
              </button>
            </form>
          </div>
        </div>

        {/* EXPERIENCE LEVEL SELECTOR & CUSTOM ENTRY */}
        <div style={{
          backgroundColor: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          border: '1px solid var(--border-subtle)',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Briefcase size={14} color="var(--accent-emerald)" />
              <span>Target Experience Level to Scrape:</span>
            </span>
            <span style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--accent-emerald-soft)',
              color: 'var(--accent-emerald)',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              Active: {customExpInput.trim() ? customExpInput : (heroExperienceLevel || 'Fresher (0-1 yrs)')}
            </span>
          </div>

          {/* Quick Experience Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
            {[
              { id: 'Fresher', label: '🎓 Fresher / Graduate (0-1 yrs)', desc: 'MCA, B.Tech students & new grads' },
              { id: 'Junior', label: '💼 Junior / SDE-1 (1-3 yrs)', desc: 'Early career engineers' },
              { id: 'Mid-Level', label: '🚀 Mid-Level / SDE-2 (3-5 yrs)', desc: 'Experienced developers' },
              { id: 'Senior', label: '👑 Senior (5-8 yrs)', desc: 'Senior engineers' },
              { id: 'Lead', label: '🏆 Lead / Architect (8+ yrs)', desc: 'Tech leads & managers' },
              { id: 'All', label: '🌐 All Experience Levels', desc: 'Search all roles' }
            ].map(item => {
              const isSelected = !customExpInput && (
                heroExperienceLevel.toLowerCase() === item.id.toLowerCase() ||
                (item.id === 'Fresher' && heroExperienceLevel.toLowerCase().includes('fresh'))
              );
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setHeroExperienceLevel(item.id);
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
                  title={item.desc}
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
                padding: '8px 12px',
                fontSize: '16px',
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
                Clear Custom
              </button>
            )}
          </div>
        </div>

        {/* TARGET JOB PLATFORMS SELECTOR */}
        <div style={{
          backgroundColor: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          border: '1px solid var(--border-subtle)',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Globe size={14} color="var(--accent-emerald)" />
              <span>Target Job Platforms to Scrape:</span>
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: selectedPlatforms.length === ALL_PLATFORMS.length ? 'var(--accent-emerald-soft)' : 'rgba(59, 130, 246, 0.15)',
                color: selectedPlatforms.length === ALL_PLATFORMS.length ? 'var(--accent-emerald)' : '#3b82f6',
                border: '1px solid currentColor'
              }}>
                {selectedPlatforms.length === ALL_PLATFORMS.length ? 'All 8 Platforms Active' : `${selectedPlatforms.length} / ${ALL_PLATFORMS.length} Selected`}
              </span>
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
                title="Reset to top tech platforms"
              >
                Reset Top 3
              </button>
            </div>
          </div>

          {/* Interactive Clickable Platform Toggle Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
            {ALL_PLATFORMS.map(p => {
              const isSelected = selectedPlatforms.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleTogglePlatform(p.id)}
                  style={{
                    padding: '6px 13px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    backgroundColor: isSelected ? p.bg : 'var(--bg-card)',
                    color: isSelected ? p.color : 'var(--text-muted)',
                    border: isSelected ? `1.5px solid ${p.color}` : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? `0 2px 8px ${p.bg}` : 'none'
                  }}
                  title={isSelected ? `Click to exclude ${p.label} from scrape` : `Click to include ${p.label} in scrape`}
                >
                  <span style={{ fontSize: '13px' }}>{p.icon}</span>
                  <span>{p.label}</span>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    backgroundColor: isSelected ? p.color : 'transparent',
                    color: '#ffffff',
                    fontSize: '9px',
                    marginLeft: '2px'
                  }}>
                    {isSelected ? '✓' : '+'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* BOTTOM ACTION BUTTONS */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            ⚡ Scrapes live verified openings from <strong>{selectedPlatforms.length === ALL_PLATFORMS.length ? 'all 8 platforms' : selectedPlatforms.join(', ')}</strong>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleExecuteScrape}
              className="btn btn-primary"
              style={{
                gap: '8px',
                padding: '12px 22px',
                fontSize: '0.9rem',
                fontWeight: 700,
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
              }}
            >
              <Sparkles size={16} />
              <span>
                {`Scrape ${(customExpInput || heroExperienceLevel)} Jobs`}
                {heroSearchMode === 'all_skills' ? ` on All ${cardSkillsList.length} Skills` : heroSearchMode === 'custom_skills' ? ` on ${cardSelectedSkills.length} Selected Skills` : ` for "${roleHeadline}"`}
                {selectedPlatforms.length < ALL_PLATFORMS.length 
                  ? ` • ${selectedPlatforms.length} Platform${selectedPlatforms.length === 1 ? '' : 's'}` 
                  : ' • All 8 Platforms'}
              </span>
            </button>

            <button
              type="button"
              onClick={onOpenCustomization}
              className="btn btn-secondary"
              style={{
                gap: '6px',
                padding: '12px 16px',
                fontSize: '0.86rem'
              }}
            >
              <Sliders size={15} color="var(--accent-emerald)" />
              <span>Filter by City & LPA</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Not loaded or in edit/replace mode: Show dual-mode uploader
  return (
    <div className="card" style={{
      maxWidth: '960px',
      margin: '0 auto 28px auto',
      padding: '24px',
      borderRadius: 'var(--radius-xl)',
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border-medium)',
      boxShadow: 'var(--shadow-lg)'
    }}>
      {/* Top Header & Mode Toggle Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '20px',
        paddingBottom: '14px',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="var(--accent-emerald)" />
            <span>AI Resume Scanner & Real-Time Job Matcher</span>
          </h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: '3px 0 0 0' }}>
            Extracts skills, education & experience to scrape live openings across LinkedIn, Indeed, Internshala, Cutshort, Foundit, Instahyre & Wellfound.
          </p>
        </div>

        {/* Mode Selector Buttons */}
        <div style={{
          display: 'inline-flex',
          padding: '4px',
          backgroundColor: 'var(--bg-input)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            type="button"
            onClick={() => { setActiveMode('upload'); setError(null); }}
            style={{
              padding: '7px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.82rem',
              fontWeight: 600,
              backgroundColor: activeMode === 'upload' ? 'var(--accent-emerald)' : 'transparent',
              color: activeMode === 'upload' ? '#ffffff' : 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <UploadCloud size={15} />
            <span>Upload Resume</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveMode('manual'); setError(null); }}
            style={{
              padding: '7px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.82rem',
              fontWeight: 600,
              backgroundColor: activeMode === 'manual' ? 'var(--accent-emerald)' : 'transparent',
              color: activeMode === 'manual' ? '#ffffff' : 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <UserPen size={15} />
            <span>Manual Entry</span>
          </button>
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 14px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--accent-rose-soft)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          color: 'var(--accent-rose)',
          fontSize: '0.85rem',
          marginBottom: '16px'
        }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* MODE 1: RESUME UPLOADER */}
      {activeMode === 'upload' && (
        <div>
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
            style={{
              position: 'relative',
              overflow: 'hidden',
              border: `2px dashed ${isDragging ? 'var(--accent-emerald)' : 'var(--border-medium)'}`,
              backgroundColor: isDragging ? 'var(--accent-emerald-soft)' : 'var(--bg-elevated)',
              borderRadius: 'var(--radius-lg)',
              padding: '36px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: '16px'
            }}
          >
            {/* Directly clickable native file input overlay for guaranteed iOS/Android mobile support */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer',
                zIndex: 10
              }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const selected = e.target.files[0];
                  e.target.value = '';
                  handleFileUpload(selected);
                }
              }}
            />

            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              backgroundColor: 'var(--accent-emerald-soft)',
              color: 'var(--accent-emerald)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto'
            }}>
              {uploading ? (
                <RefreshCw size={26} className="spin-animation" />
              ) : (
                <UploadCloud size={28} />
              )}
            </div>

            <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '4px' }}>
              {uploading ? 'Extracting Skills & Education with AI...' : 'Click to Upload Resume or Drag & Drop'}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Supports PDF, Word (.docx) or Text (Max 10MB) • Automatically prompts location & filter customization
            </div>

            {fileName && !uploading && (
              <div style={{
                marginTop: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.82rem',
                color: 'var(--accent-emerald)'
              }}>
                <CheckCircle2 size={14} />
                <span>{fileName}</span>
              </div>
            )}
          </div>

          {/* Quick Action: Test with Sample Resume */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            paddingTop: '6px'
          }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Don't have your resume file on this device?
            </span>
            <button
              type="button"
              onClick={handleSampleResume}
              disabled={uploading}
              className="btn btn-secondary btn-sm"
              style={{ gap: '6px', fontSize: '0.8rem' }}
            >
              <Wand2 size={14} color="var(--accent-amber)" />
              <span>Load Sample Senior Full-Stack Resume</span>
            </button>
          </div>
        </div>
      )}

      {/* MODE 2: MANUAL ENTRY FORM */}
      {activeMode === 'manual' && (
        <form onSubmit={handleSaveManual}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '14px' }}>
            {/* Full Name */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '5px' }}>
                Full Name *
              </label>
              <input
                type="text"
                required
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="e.g. Aarav Sharma"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  fontSize: '0.88rem',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  outline: 'none'
                }}
              />
            </div>

            {/* Target Role */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '5px' }}>
                Target Job Title / Headline *
              </label>
              <input
                type="text"
                required
                value={manualRole}
                onChange={(e) => setManualRole(e.target.value)}
                placeholder="e.g. Senior Full Stack Engineer, SDE-2"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  fontSize: '0.88rem',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  outline: 'none'
                }}
              />
            </div>

            {/* City */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '5px' }}>
                Preferred City / Location
              </label>
              <input
                type="text"
                value={manualCity}
                onChange={(e) => setManualCity(e.target.value)}
                placeholder="e.g. Bengaluru, Hyderabad, Remote India"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  fontSize: '0.88rem',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Education Row */}
          <div style={{
            padding: '14px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '14px'
          }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <GraduationCap size={15} />
              <span>Education Details</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 90px', gap: '10px' }}>
              <input
                type="text"
                value={manualDegree}
                onChange={(e) => setManualDegree(e.target.value)}
                placeholder="Degree (e.g. B.Tech Computer Science, BCA)"
                style={{
                  padding: '8px 12px',
                  fontSize: '0.85rem',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  outline: 'none'
                }}
              />

              <input
                type="text"
                value={manualCollege}
                onChange={(e) => setManualCollege(e.target.value)}
                placeholder="College / Institute (e.g. NIT Trichy, IIT)"
                style={{
                  padding: '8px 12px',
                  fontSize: '0.85rem',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  outline: 'none'
                }}
              />

              <input
                type="text"
                value={manualGradYear}
                onChange={(e) => setManualGradYear(e.target.value)}
                placeholder="Year (2022)"
                style={{
                  padding: '8px 10px',
                  fontSize: '0.85rem',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Skills Row */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
              Technical Skills & Tech Stack ({manualSkills.length} selected):
            </label>

            {/* Selected Skills Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
              {manualSkills.map((sk, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '0.78rem',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--accent-emerald-soft)',
                    color: 'var(--accent-emerald)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleTogglePopularSkill(sk)}
                  title="Click to remove"
                >
                  <span>{sk}</span>
                  <X size={12} />
                </span>
              ))}
            </div>

            {/* Quick Click Common Tech Skills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginRight: '4px' }}>Quick Add:</span>
              {POPULAR_MANUAL_SKILLS.filter(s => !manualSkills.includes(s)).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleTogglePopularSkill(s)}
                  style={{
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--bg-elevated)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer'
                  }}
                >
                  +{s}
                </button>
              ))}
            </div>

            {/* Custom Skill Input */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={newSkillText}
                onChange={(e) => setNewSkillText(e.target.value)}
                placeholder="Type any other skill and click Add..."
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  fontSize: '0.85rem',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={handleAddManualSkill}
                className="btn btn-secondary btn-sm"
              >
                <Plus size={14} />
                <span>Add Skill</span>
              </button>
            </div>
          </div>

          {/* Form Action */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
            {profile && (
              <button
                type="button"
                onClick={() => setIsEditingExisting(false)}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={savingManual}
              className="btn btn-primary"
              style={{ gap: '8px', padding: '10px 20px', fontWeight: 700 }}
            >
              {savingManual ? (
                <>
                  <RefreshCw size={15} className="spin-animation" />
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  <span>Save Profile & Customize Match Filters</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
