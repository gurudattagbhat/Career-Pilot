import React from 'react';
import { Search, MapPin, Briefcase, Sparkles, Filter, RefreshCw, ShieldCheck } from 'lucide-react';
import HeroProfileUploader from './HeroProfileUploader';

export default function HeroSection({
  searchQuery,
  setSearchQuery,
  locationQuery,
  setLocationQuery,
  onSearch,
  onQuickTag,
  activeTag,
  totalJobs = 0,
  onRefreshJobs,
  refreshing = false,
  profile = null,
  atsScore = null,
  groqKey = '',
  onParsed = null,
  onManualSaved = null,
  onOpenCustomization = null,
  onScrapeForResume = null,
  currentUser = null,
  onOpenAuth = null
}) {
  const popularTags = ['Bengaluru', 'Remote India', 'Hyderabad', 'Pune', 'MERN Stack', 'React', 'Node.js', '₹25+ LPA'];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <section style={{
      padding: '40px 0 24px 0',
      position: 'relative'
    }}>
      <div style={{ maxWidth: '880px', margin: '0 auto', textAlign: 'center', marginBottom: '32px' }}>
        {/* Live Aggregation Pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          backgroundColor: 'var(--accent-emerald-soft)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: 'var(--radius-full)',
          marginBottom: '16px'
        }}>
          <span className="pulse-dot"></span>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-emerald)', letterSpacing: '0.02em' }}>
            🇮🇳 INDIA TECH CAREER AGGREGATOR • NAUKRI • LINKEDIN INDIA • INSTAHYRE
          </span>
        </div>

        {/* Main Headline */}
        <h1 style={{
          fontSize: 'clamp(2.1rem, 4.5vw, 3.4rem)',
          fontWeight: 800,
          lineHeight: 1.15,
          marginBottom: '14px',
          letterSpacing: '-0.03em'
        }}>
          Find Top Tech Jobs in India. <br />
          <span style={{
            background: 'linear-gradient(135deg, var(--accent-emerald) 0%, #34d399 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Beat ATS Screens & Maximize Your CTC.
          </span>
        </h1>

        <p style={{
          fontSize: 'clamp(0.95rem, 1.8vw, 1.15rem)',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          maxWidth: '680px',
          margin: '0 auto'
        }}>
          Explore verified openings at top tech companies and global enterprises with direct application links to live career portals.
        </p>

        {/* Secure OTP Authentication Highlight for Visitors */}
        {!currentUser && onOpenAuth && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            marginTop: '16px',
            padding: '7px 18px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <ShieldCheck size={16} color="var(--accent-emerald)" />
            <span>Secure 2FA OTP Authentication • Sync ATS Diagnostics & Applications</span>
            <button
              type="button"
              onClick={() => onOpenAuth('signup')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-emerald)',
                fontWeight: 700,
                cursor: 'pointer',
                padding: '0 4px',
                textDecoration: 'underline'
              }}
            >
              Sign Up Free
            </button>
          </div>
        )}
      </div>

      {/* Hero Resume Uploader & Manual Entry Hub */}
      <HeroProfileUploader
        profile={profile}
        atsScore={atsScore}
        groqKey={groqKey}
        onParsed={onParsed}
        onManualSaved={onManualSaved}
        onOpenCustomization={onOpenCustomization}
        onScrapeForResume={onScrapeForResume}
      />

      {/* Search Bar Card */}
      <div className="card" style={{
        maxWidth: '960px',
        margin: '0 auto',
        padding: '12px',
        borderRadius: 'var(--radius-xl)',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-medium)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <form onSubmit={handleSubmit} style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr auto',
          gap: '10px',
          alignItems: 'center'
        }}>
          {/* Keyword Search */}
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Requirement / Role (e.g. SDE-2, MERN Stack, React, Python)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 14px 14px 44px',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                fontSize: '0.95rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Location Search */}
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <MapPin size={18} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="City (e.g. Bengaluru, Hyderabad, Pune, Gurugram)..."
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 14px 14px 44px',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                fontSize: '0.95rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Action Search Button */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '14px 22px', borderRadius: 'var(--radius-lg)', whiteSpace: 'nowrap', gap: '8px' }}
            >
              <Sparkles size={17} />
              <span>Scrape Live Jobs</span>
            </button>
            <button
              type="button"
              onClick={onRefreshJobs}
              disabled={refreshing}
              className="btn btn-secondary"
              title="Force live re-scrape from LinkedIn India & Indian portals"
              style={{ padding: '14px 16px', borderRadius: 'var(--radius-lg)' }}
            >
              <RefreshCw size={17} className={refreshing ? 'spin-animation' : ''} />
            </button>
          </div>
        </form>

        {/* Resume Match Shortcut if profile is present */}
        {profile && (profile.targetRole || profile.headline) && (() => {
          const headStr = (profile.headline || profile.targetRole || '').toLowerCase();
          const eduStr = ((profile.education || []).map(e => `${e.degree} ${e.institution}`).join(' ')).toLowerCase();
          const isStudentOrFresher = `${headStr} ${eduStr}`.includes('student') || `${headStr} ${eduStr}`.includes('fresher') || `${headStr} ${eduStr}`.includes('intern') || `${headStr} ${eduStr}`.includes('graduate') || `${headStr} ${eduStr}`.includes('mca') || `${headStr} ${eduStr}`.includes('b.tech');
          const profileExp = isStudentOrFresher ? 'Fresher' : '';

          return (
            <div style={{
              marginTop: '10px',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-emerald-soft)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              flexWrap: 'wrap'
            }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                🎯 Extracted Profile: <strong>{profile.targetRole || profile.headline}</strong>
                {profileExp && <span style={{ marginLeft: '6px', color: 'var(--accent-emerald)', fontWeight: 600 }}>({profileExp})</span>}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => onScrapeForResume && onScrapeForResume(profile.targetRole || profile.headline, 'all_skills', null, profileExp)}
                  style={{
                    padding: '4px 12px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--accent-emerald)',
                    color: '#ffffff',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                  title="Search and scrape live jobs across all skills extracted from resume"
                >
                  <Sparkles size={13} />
                  <span>Search on All Resume Skills</span>
                </button>
                <button
                  type="button"
                  onClick={() => onScrapeForResume && onScrapeForResume(profile.targetRole || profile.headline, 'role', null, profileExp)}
                  style={{
                    padding: '4px 12px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--bg-elevated)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                  title="Search and scrape live jobs specifically for this role title"
                >
                  <span>Search by Role</span>
                </button>
              </div>
            </div>
          );
        })()}

        {/* Quick Tag Filters */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginTop: '12px',
          padding: '4px 6px',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Hubs & Skills:</span>
          {popularTags.map(tag => {
            const isSelected = activeTag.toLowerCase() === tag.toLowerCase();
            return (
              <button
                key={tag}
                type="button"
                onClick={() => onQuickTag(tag)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  backgroundColor: isSelected ? 'var(--accent-emerald)' : 'var(--bg-elevated)',
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                  border: isSelected ? '1px solid var(--accent-emerald)' : '1px solid var(--border-subtle)',
                  transition: 'all 0.15s ease'
                }}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats Counter */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '32px',
        marginTop: '24px',
        fontSize: '0.85rem',
        color: 'var(--text-muted)',
        flexWrap: 'wrap'
      }}>
        <div>
          <strong style={{ color: 'var(--text-primary)' }}>{totalJobs}</strong> Live Openings
        </div>
        <div>•</div>
        <div>
          <strong style={{ color: 'var(--text-primary)' }}>Naukri, LinkedIn & Instahyre</strong>
        </div>
        <div>•</div>
        <div>
          <strong style={{ color: 'var(--accent-emerald)' }}>INR (₹) Lakhs Per Annum (LPA)</strong>
        </div>
      </div>
    </section>
  );
}
