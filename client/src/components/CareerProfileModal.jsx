import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Briefcase, 
  Mail, 
  Phone, 
  MapPin, 
  IndianRupee, 
  Calendar, 
  CheckCircle2, 
  Sparkles, 
  Save, 
  Plus, 
  Trash2,
  FileCheck2,
  BookmarkCheck,
  Kanban,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';

export default function CareerProfileModal({
  isOpen,
  onClose,
  currentUser,
  onProfileUpdated,
  savedCount = 0,
  applicationCount = 0,
  atsScore = null
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'edit'

  // Form edit states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [headline, setHeadline] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Mid-Level');
  const [currentCtcLpa, setCurrentCtcLpa] = useState('');
  const [expectedCtcLpa, setExpectedCtcLpa] = useState('');
  const [noticePeriodDays, setNoticePeriodDays] = useState(30);
  const [location, setLocation] = useState('Bengaluru, India');
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sync state whenever currentUser changes or modal opens
  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName || '');
      setPhone(currentUser.phone || '');
      setTargetRole(currentUser.targetRole || 'Full Stack Engineer');
      setHeadline(currentUser.headline || '');
      setExperienceLevel(currentUser.experienceLevel || 'Mid-Level');
      setCurrentCtcLpa(currentUser.currentCtcLpa !== undefined ? currentUser.currentCtcLpa : '');
      setExpectedCtcLpa(currentUser.expectedCtcLpa !== undefined ? currentUser.expectedCtcLpa : '');
      setNoticePeriodDays(currentUser.noticePeriodDays || 30);
      setLocation(currentUser.location || 'Bengaluru, India');
      setSkills(Array.isArray(currentUser.skills) ? currentUser.skills : []);
    }
  }, [currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

  const handleAddSkill = (e) => {
    e.preventDefault();
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills(prev => [...prev, trimmed]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(prev => prev.filter(s => s !== skillToRemove));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSaveSuccess(false);

    try {
      const updates = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        targetRole: targetRole.trim(),
        headline: headline.trim(),
        experienceLevel,
        currentCtcLpa: currentCtcLpa ? Number(currentCtcLpa) : 0,
        expectedCtcLpa: expectedCtcLpa ? Number(expectedCtcLpa) : 0,
        noticePeriodDays: Number(noticePeriodDays),
        location: location.trim(),
        skills
      };

      const data = await api.updateProfile(updates);
      if (!data.success) throw new Error(data.error || 'Failed to update profile');

      setSaveSuccess(true);
      if (onProfileUpdated) onProfileUpdated(data.user);
      setTimeout(() => {
        setSaveSuccess(false);
        setActiveTab('overview');
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.78)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '16px'
    }}>
      <div 
        className="card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-medium)',
          backgroundColor: 'var(--bg-card)',
          padding: '0',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '24px 28px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, transparent 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-emerald)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '1.4rem',
              fontWeight: 800,
              boxShadow: '0 4px 18px var(--accent-emerald-glow)',
              textTransform: 'uppercase'
            }}>
              {currentUser.fullName ? currentUser.fullName.charAt(0) : 'U'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                  {currentUser.fullName}
                </h3>
                <span className="badge badge-emerald" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', padding: '2px 8px' }}>
                  <ShieldCheck size={12} /> Verified
                </span>
              </div>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {currentUser.email} • {currentUser.phone || 'Phone not set'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: '50%', width: '36px', height: '36px', padding: 0 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Toggle */}
        <div style={{
          display: 'flex',
          gap: '8px',
          padding: '12px 28px',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-elevated)'
        }}>
          <button
            onClick={() => setActiveTab('overview')}
            className="btn btn-sm"
            style={{
              backgroundColor: activeTab === 'overview' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'overview' ? 'var(--accent-emerald)' : 'var(--text-secondary)',
              border: activeTab === 'overview' ? '1px solid var(--border-subtle)' : 'none'
            }}
          >
            <User size={15} />
            <span>Profile Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('edit')}
            className="btn btn-sm"
            style={{
              backgroundColor: activeTab === 'edit' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'edit' ? 'var(--accent-emerald)' : 'var(--text-secondary)',
              border: activeTab === 'edit' ? '1px solid var(--border-subtle)' : 'none'
            }}
          >
            <Sparkles size={15} />
            <span>Edit Career Preferences</span>
          </button>
        </div>

        {/* Feedback alerts */}
        {saveSuccess && (
          <div style={{
            margin: '16px 28px 0 28px',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--accent-emerald-soft)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: 'var(--accent-emerald)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.86rem'
          }}>
            <CheckCircle2 size={18} />
            <span>Profile updated and synchronized to MongoDB Atlas!</span>
          </div>
        )}

        {errorMsg && (
          <div style={{
            margin: '16px 28px 0 28px',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: 'var(--accent-rose)',
            fontSize: '0.86rem'
          }}>
            {errorMsg}
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div style={{ padding: '24px 28px' }}>
            {/* Quick Metrics Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '12px',
              marginBottom: '24px'
            }}>
              <div style={{
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Target Role
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {currentUser.targetRole || 'Not specified'}
                </div>
              </div>

              <div style={{
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Experience
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {currentUser.experienceLevel || 'Mid-Level'}
                </div>
              </div>

              <div style={{
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Expected CTC
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--accent-emerald)', marginTop: '4px' }}>
                  {currentUser.expectedCtcLpa ? `₹ ${currentUser.expectedCtcLpa} LPA` : 'Open'}
                </div>
              </div>

              <div style={{
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Notice Period
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {currentUser.noticePeriodDays ? `${currentUser.noticePeriodDays} Days` : '30 Days'}
                </div>
              </div>
            </div>

            {/* Platform Engagement Counts */}
            <div style={{
              display: 'flex',
              gap: '12px',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(16, 185, 129, 0.05)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              marginBottom: '24px'
            }}>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                  {atsScore !== null ? `${atsScore}/100` : (currentUser.atsAnalyses?.[0]?.score ? `${currentUser.atsAnalyses[0].score}/100` : 'Not run')}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  ATS Health Score
                </div>
              </div>
              <div style={{ width: '1px', backgroundColor: 'var(--border-subtle)' }} />
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                  {applicationCount || currentUser.applications?.length || 0}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Tracked Apps
                </div>
              </div>
              <div style={{ width: '1px', backgroundColor: 'var(--border-subtle)' }} />
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-amber)' }}>
                  {savedCount || currentUser.savedJobs?.length || 0}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Saved Bookmarks
                </div>
              </div>
            </div>

            {/* Skills Badges */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                Target Skills & Tech Stack ({skills.length}):
              </div>
              {skills.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {skills.map((skill, i) => (
                    <span key={i} className="badge badge-emerald" style={{ fontSize: '0.78rem', padding: '4px 10px' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  No skills tagged yet. Upload your resume or add your tech stack in the edit tab!
                </p>
              )}
            </div>

            {/* Stored Resume Profile Status */}
            <div style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                  MongoDB Atlas Resume Profile
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                  {currentUser.resumeProfile 
                    ? `Active: ${currentUser.resumeProfile.fileName || 'Parsed Resume Profile'}` 
                    : 'No resume uploaded yet. Your job matches are using role heuristics.'}
                </div>
              </div>
              <button
                onClick={() => { onClose(); setActiveTab('edit'); }}
                className="btn btn-primary btn-sm"
              >
                Edit Preferences
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: EDIT */}
        {activeTab === 'edit' && (
          <form onSubmit={handleSave} style={{ padding: '24px 28px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label className="label">Full Name</label>
                <div className="input-group">
                  <User size={16} />
                  <input
                    type="text"
                    className="input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Phone (+91)</label>
                <div className="input-group">
                  <Phone size={16} />
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. 9481411897"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label className="label">Target Role / Designation</label>
              <div className="input-group">
                <Briefcase size={16} />
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Senior Full Stack Engineer, DevOps Lead"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label className="label">Experience Level</label>
                <select
                  className="input"
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  style={{ width: '100%', cursor: 'pointer' }}
                >
                  <option value="Entry-Level">Entry-Level (0 - 2 yrs)</option>
                  <option value="Mid-Level">Mid-Level (3 - 5 yrs)</option>
                  <option value="Senior">Senior (6 - 9 yrs)</option>
                  <option value="Lead / Architect">Lead / Architect (10+ yrs)</option>
                </select>
              </div>

              <div>
                <label className="label">Location / City</label>
                <div className="input-group">
                  <MapPin size={16} />
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Bengaluru, Hyderabad, Remote"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '16px' }}>
              <div>
                <label className="label">Current CTC (₹ LPA)</label>
                <div className="input-group">
                  <IndianRupee size={15} />
                  <input
                    type="number"
                    step="0.5"
                    className="input"
                    placeholder="e.g. 12"
                    value={currentCtcLpa}
                    onChange={(e) => setCurrentCtcLpa(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="label">Expected CTC (₹ LPA)</label>
                <div className="input-group">
                  <IndianRupee size={15} />
                  <input
                    type="number"
                    step="0.5"
                    className="input"
                    placeholder="e.g. 24"
                    value={expectedCtcLpa}
                    onChange={(e) => setExpectedCtcLpa(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="label">Notice Period (Days)</label>
                <select
                  className="input"
                  value={noticePeriodDays}
                  onChange={(e) => setNoticePeriodDays(Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer' }}
                >
                  <option value={0}>Immediate (0 Days)</option>
                  <option value={15}>15 Days</option>
                  <option value={30}>30 Days</option>
                  <option value={60}>60 Days</option>
                  <option value={90}>90 Days</option>
                </select>
              </div>
            </div>

            {/* Skills Management */}
            <div style={{ marginBottom: '24px' }}>
              <label className="label">Technical Skills (Press Enter to add)</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. React, Node.js, TypeScript, AWS, Docker"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill(e);
                    }
                  }}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="btn btn-secondary btn-sm"
                >
                  <Plus size={16} /> Add
                </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {skills.map((s, idx) => (
                  <span
                    key={idx}
                    className="badge badge-emerald"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 10px',
                      fontSize: '0.78rem'
                    }}
                  >
                    {s}
                    <X
                      size={13}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleRemoveSkill(s)}
                    />
                  </span>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary"
                style={{ gap: '8px', minWidth: '160px' }}
              >
                <Save size={16} />
                <span>{saving ? 'Saving to Atlas...' : 'Save & Sync Profile'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
