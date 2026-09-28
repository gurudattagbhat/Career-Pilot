import React, { useState, useEffect } from 'react';
import { UserPen, Plus, Trash2, CheckCircle2, Sparkles, Briefcase, GraduationCap, Code2, Globe } from 'lucide-react';
import { apiFetch } from '../services/api';

export default function ManualProfileBuilder({ 
  existingProfile, 
  onProfileSaved, 
  groqKey,
  onScrapeForResume = null
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    headline: '',
    summary: '',
    linkedin: '',
    github: '',
    portfolio: '',
    targetRole: '',
    skillsTechnical: '',
    skillsFrameworks: '',
    skillsDatabases: '',
    skillsCloud: '',
    experience: [
      {
        company: '',
        role: '',
        location: '',
        duration: '',
        bullets: ['']
      }
    ],
    education: [
      {
        degree: '',
        institution: '',
        year: ''
      }
    ]
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync with existing profile if present
  useEffect(() => {
    if (existingProfile) {
      setFormData({
        name: existingProfile.name || existingProfile.personalInfo?.name || '',
        email: existingProfile.email || existingProfile.personalInfo?.email || '',
        phone: existingProfile.phone || existingProfile.personalInfo?.phone || '',
        location: existingProfile.location || existingProfile.personalInfo?.location || '',
        headline: existingProfile.headline || existingProfile.personalInfo?.headline || '',
        summary: existingProfile.summary || existingProfile.personalInfo?.summary || '',
        linkedin: existingProfile.linkedin || existingProfile.personalInfo?.linkedin || '',
        github: existingProfile.github || existingProfile.personalInfo?.github || '',
        portfolio: existingProfile.portfolio || existingProfile.personalInfo?.portfolio || '',
        targetRole: existingProfile.targetRole || existingProfile.headline || '',
        skillsTechnical: (existingProfile.skills?.technical || []).join(', '),
        skillsFrameworks: (existingProfile.skills?.frameworks || []).join(', '),
        skillsDatabases: (existingProfile.skills?.databases || []).join(', '),
        skillsCloud: (existingProfile.skills?.cloudAndDevops || []).join(', '),
        experience: existingProfile.experience && existingProfile.experience.length > 0 
          ? existingProfile.experience 
          : [{ company: '', role: '', location: '', duration: '', bullets: [''] }],
        education: existingProfile.education && existingProfile.education.length > 0 
          ? existingProfile.education 
          : [{ degree: '', institution: '', year: '' }]
      });
    }
  }, [existingProfile]);

  const handleExpChange = (index, field, value) => {
    const updated = [...formData.experience];
    updated[index][field] = value;
    setFormData({ ...formData, experience: updated });
  };

  const handleBulletChange = (expIdx, bulletIdx, value) => {
    const updated = [...formData.experience];
    updated[expIdx].bullets[bulletIdx] = value;
    setFormData({ ...formData, experience: updated });
  };

  const addBullet = (expIdx) => {
    const updated = [...formData.experience];
    updated[expIdx].bullets.push('');
    setFormData({ ...formData, experience: updated });
  };

  const removeBullet = (expIdx, bulletIdx) => {
    const updated = [...formData.experience];
    updated[expIdx].bullets.splice(bulletIdx, 1);
    setFormData({ ...formData, experience: updated });
  };

  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [
        ...formData.experience,
        { company: '', role: '', location: '', duration: '', bullets: [''] }
      ]
    });
  };

  const removeExperience = (index) => {
    const updated = [...formData.experience];
    updated.splice(index, 1);
    setFormData({ ...formData, experience: updated });
  };

  const handleEduChange = (index, field, value) => {
    const updated = [...formData.education];
    updated[index][field] = value;
    setFormData({ ...formData, education: updated });
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [...formData.education, { degree: '', institution: '', year: '' }]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    // Format skills back into array categories
    const profilePayload = {
      personalInfo: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        headline: formData.headline,
        summary: formData.summary,
        linkedin: formData.linkedin,
        github: formData.github,
        portfolio: formData.portfolio
      },
      name: formData.name,
      headline: formData.headline,
      email: formData.email,
      phone: formData.phone,
      location: formData.location,
      summary: formData.summary,
      targetRole: formData.targetRole || formData.headline,
      skills: {
        technical: formData.skillsTechnical.split(',').map(s => s.trim()).filter(Boolean),
        frameworks: formData.skillsFrameworks.split(',').map(s => s.trim()).filter(Boolean),
        databases: formData.skillsDatabases.split(',').map(s => s.trim()).filter(Boolean),
        cloudAndDevops: formData.skillsCloud.split(',').map(s => s.trim()).filter(Boolean)
      },
      experience: formData.experience.filter(e => e.company || e.role),
      education: formData.education.filter(ed => ed.degree || ed.institution)
    };

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (groqKey) {
        headers['x-groq-api-key'] = groqKey;
      }

      const res = await apiFetch('/api/resume/manual-profile', {
        method: 'POST',
        headers,
        body: JSON.stringify(profilePayload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save profile');
      }

      setSaveSuccess(true);
      onProfileSaved(data);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      alert(`Error saving profile: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', paddingBottom: '40px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <UserPen size={28} color="var(--accent-emerald)" />
          <span>Manual Career Profile Builder</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Prefer not to upload a resume file? Enter your experience, skills, and goals directly. We will evaluate your ATS score and unlock tailored job matching.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Section 1: Personal Info */}
        <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Globe size={18} color="var(--accent-emerald)" />
            <span>Personal & Contact Information</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Jordan Miller"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Professional Headline *</label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Full Stack Engineer (React / Node)"
                value={formData.headline}
                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Email Address *</label>
              <input
                type="email"
                required
                placeholder="aarav.sharma@gmail.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Mobile Phone (+91)</label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Current City in India</label>
              <input
                type="text"
                placeholder="e.g. Bengaluru, Hyderabad, or Pune"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Target Role / Designation</label>
              <input
                type="text"
                placeholder="e.g. SDE-2 / Senior MERN Developer"
                value={formData.targetRole}
                onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Current CTC (₹ LPA)</label>
              <input
                type="text"
                placeholder="e.g. 18 LPA"
                value={formData.currentCtc || ''}
                onChange={(e) => setFormData({ ...formData, currentCtc: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Expected CTC (₹ LPA)</label>
              <input
                type="text"
                placeholder="e.g. 30 LPA"
                value={formData.expectedCtc || ''}
                onChange={(e) => setFormData({ ...formData, expectedCtc: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Notice Period</label>
              <select
                value={formData.noticePeriod || '30 Days'}
                onChange={(e) => setFormData({ ...formData, noticePeriod: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
              >
                <option value="Immediate Joiner">Immediate Joiner (0 Days)</option>
                <option value="15 Days">15 Days</option>
                <option value="30 Days">30 Days (Serving / Standard)</option>
                <option value="60 Days">60 Days</option>
                <option value="90 Days">90 Days</option>
              </select>
            </div>
          </div>

          {/* Social Profiles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>LinkedIn URL</label>
              <input
                type="url"
                placeholder="https://linkedin.com/in/username"
                value={formData.linkedin}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>GitHub URL</label>
              <input
                type="url"
                placeholder="https://github.com/username"
                value={formData.github}
                onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Portfolio / Website</label>
              <input
                type="url"
                placeholder="https://yourportfolio.dev"
                value={formData.portfolio}
                onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          {/* Executive Summary */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Professional Summary / Bio</label>
            <textarea
              rows={3}
              placeholder="3-4 sentences outlining your engineering scope, key accomplishments, and core tech focus..."
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', resize: 'vertical' }}
            />
          </div>
        </div>

        {/* Section 2: Skills Breakdown */}
        <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Code2 size={18} color="var(--accent-emerald)" />
            <span>Skills & Tech Stack (Comma Separated)</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Languages & Core Tools</label>
              <input
                type="text"
                placeholder="JavaScript, TypeScript, Python, Go, SQL"
                value={formData.skillsTechnical}
                onChange={(e) => setFormData({ ...formData, skillsTechnical: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Frameworks & Libraries</label>
              <input
                type="text"
                placeholder="React, Next.js, Node.js, Express, TailwindCSS"
                value={formData.skillsFrameworks}
                onChange={(e) => setFormData({ ...formData, skillsFrameworks: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Databases & Caching</label>
              <input
                type="text"
                placeholder="PostgreSQL, MongoDB, Redis, Elasticsearch"
                value={formData.skillsDatabases}
                onChange={(e) => setFormData({ ...formData, skillsDatabases: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Cloud & DevOps</label>
              <input
                type="text"
                placeholder="AWS, Docker, Kubernetes, CI/CD, Terraform"
                value={formData.skillsCloud}
                onChange={(e) => setFormData({ ...formData, skillsCloud: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Work Experience */}
        <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Briefcase size={18} color="var(--accent-emerald)" />
              <span>Work Experience</span>
            </h3>
            <button
              type="button"
              onClick={addExperience}
              className="btn btn-secondary btn-sm"
              style={{ gap: '4px' }}
            >
              <Plus size={15} /> Add Role
            </button>
          </div>

          {formData.experience.map((exp, expIdx) => (
            <div 
              key={expIdx} 
              style={{
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '18px',
                marginBottom: '16px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--accent-emerald)' }}>
                  Position #{expIdx + 1}
                </span>
                {formData.experience.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeExperience(expIdx)}
                    style={{ color: 'var(--accent-rose)', padding: '4px' }}
                    title="Remove position"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Company</label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Tech"
                    value={exp.company}
                    onChange={(e) => handleExpChange(expIdx, 'company', e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Job Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Lead Software Engineer"
                    value={exp.role}
                    onChange={(e) => handleExpChange(expIdx, 'role', e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. Jan 2021 – Present"
                    value={exp.duration}
                    onChange={(e) => handleExpChange(expIdx, 'duration', e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              {/* Accomplishment Bullets */}
              <div style={{ marginTop: '10px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Accomplishments (Use metrics: e.g. "Increased checkout throughput by 40%...")
                </label>
                {(exp.bullets || ['']).map((bullet, bIdx) => (
                  <div key={bIdx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="text"
                      placeholder="• Spearheaded development of..."
                      value={bullet}
                      onChange={(e) => handleBulletChange(expIdx, bIdx, e.target.value)}
                      style={{ flex: 1, padding: '8px 10px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}
                    />
                    {exp.bullets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBullet(expIdx, bIdx)}
                        style={{ color: 'var(--text-muted)', padding: '6px' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addBullet(expIdx)}
                  style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}
                >
                  <Plus size={13} /> Add another accomplishment bullet
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Section 4: Education */}
        <div className="card" style={{ marginBottom: '28px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GraduationCap size={18} color="var(--accent-emerald)" />
              <span>Education</span>
            </h3>
            <button
              type="button"
              onClick={addEducation}
              className="btn btn-secondary btn-sm"
              style={{ gap: '4px' }}
            >
              <Plus size={15} /> Add Degree
            </button>
          </div>

          {formData.education.map((edu, eduIdx) => (
            <div key={eduIdx} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Degree & Major</label>
                <input
                  type="text"
                  placeholder="e.g. B.S. in Computer Science"
                  value={edu.degree}
                  onChange={(e) => handleEduChange(eduIdx, 'degree', e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Institution</label>
                <input
                  type="text"
                  placeholder="e.g. University of California"
                  value={edu.institution}
                  onChange={(e) => handleEduChange(eduIdx, 'institution', e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Graduation Year</label>
                <input
                  type="text"
                  placeholder="e.g. 2020"
                  value={edu.year}
                  onChange={(e) => handleEduChange(eduIdx, 'year', e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Submit Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '14px' }}>
          {saveSuccess && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-emerald)', fontSize: '0.9rem', fontWeight: 600 }}>
              <CheckCircle2 size={18} />
              <span>Profile Saved & ATS Diagnostics Updated!</span>
            </div>
          )}
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary btn-lg"
          >
            <Sparkles size={18} />
            <span>{saving ? 'Analyzing & Saving...' : 'Save Profile & Calculate ATS Score'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
