import React, { useState, useRef, useEffect } from 'react';
import { 
  Briefcase, 
  FileCheck2, 
  UserPen, 
  Kanban, 
  Sparkles, 
  Sun, 
  Moon, 
  Bookmark,
  LogIn,
  UserPlus,
  LogOut,
  User,
  ChevronDown
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  theme, 
  toggleTheme, 
  savedCount = 0,
  atsScore = null,
  applicationCount = 0,
  currentUser = null,
  onOpenAuth = () => {},
  onLogout = () => {},
  onOpenProfile = () => {}
}) {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <>
      <header className="site-header">
        <div className="app-container site-header-inner">
          {/* Brand Logo */}
          <div 
            onClick={() => setActiveTab('jobs')}
            className="nav-brand"
            title="CareerPilot Home"
          >
            <div className="nav-brand-icon">
              <Briefcase size={19} strokeWidth={2.4} />
            </div>
            <div>
              <div className="nav-brand-title">
                <span>CareerPilot</span>
                <span className="nav-pro-badge">PRO</span>
              </div>
              <div className="nav-brand-subtitle">
                Multi-Platform Career Engine & ATS Doctor
              </div>
            </div>
          </div>

          {/* Unified 5-Tab Navigation Bar (Desktop & Normal View) */}
          <nav className="desktop-nav-tabs" aria-label="Main Navigation">
            <button
              type="button"
              onClick={() => setActiveTab('jobs')}
              className={`desktop-nav-tab ${activeTab === 'jobs' ? 'active' : ''}`}
              title="Browse verified job openings"
            >
              <Briefcase size={15} />
              <span>Find Jobs</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ats')}
              className={`desktop-nav-tab ${activeTab === 'ats' ? 'active' : ''}`}
              title="ATS Resume Doctor & Match Diagnostics"
            >
              <FileCheck2 size={15} />
              <span>ATS Doctor</span>
              {atsScore !== null && (
                <span className={`badge ${atsScore >= 80 ? 'badge-emerald' : 'badge-amber'}`} style={{ padding: '1px 6px', fontSize: '0.68rem', fontWeight: 700 }}>
                  {atsScore}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`desktop-nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
              title="Build or edit candidate profile"
            >
              <UserPen size={15} />
              <span>Profile Builder</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tracker')}
              className={`desktop-nav-tab ${activeTab === 'tracker' ? 'active' : ''}`}
              title="Track application statuses"
            >
              <Kanban size={15} />
              <span>Tracker</span>
              {applicationCount > 0 && (
                <span className="badge badge-emerald" style={{ padding: '1px 6px', fontSize: '0.68rem', fontWeight: 700 }}>
                  {applicationCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('saved')}
              className={`desktop-nav-tab ${activeTab === 'saved' ? 'active' : ''}`}
              title="Saved job bookmarks"
            >
              <Bookmark size={15} color={activeTab === 'saved' || savedCount > 0 ? 'var(--accent-amber)' : 'inherit'} />
              <span>Saved</span>
              {savedCount > 0 && (
                <span className="badge badge-amber" style={{ padding: '1px 6px', fontSize: '0.68rem', fontWeight: 700 }}>
                  {savedCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right Utility Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Theme Switcher Toggle */}
            <button 
              type="button"
              onClick={toggleTheme}
              className="nav-theme-toggle"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Vertical Divider */}
            <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-subtle)', margin: '0 2px' }} />

            {/* Authentication State Controls */}
            {!currentUser ? (
              <div className="nav-auth-buttons" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => onOpenAuth('login')}
                  className="btn btn-secondary btn-sm nav-btn-login"
                  style={{ gap: '6px', borderRadius: 'var(--radius-full)', padding: '7px 14px' }}
                >
                  <LogIn size={15} />
                  <span>Sign In</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenAuth('signup')}
                  className="btn btn-primary btn-sm nav-btn-signup"
                  style={{ gap: '6px', borderRadius: 'var(--radius-full)', padding: '7px 16px', fontWeight: 700 }}
                >
                  <UserPlus size={15} />
                  <span>Sign Up Free</span>
                </button>
              </div>
            ) : (
              <div style={{ position: 'relative' }} ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={`nav-user-btn ${userDropdownOpen ? 'open' : ''}`}
                  title="User Profile Menu"
                  aria-expanded={userDropdownOpen}
                >
                  {/* User Avatar Circle */}
                  <div className="nav-user-avatar">
                    {currentUser.fullName ? currentUser.fullName.charAt(0) : 'U'}
                  </div>

                  <div className="nav-user-name" style={{ textAlign: 'left', lineHeight: 1.15 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {currentUser.fullName || 'User'}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--accent-emerald)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className="pulse-dot" style={{ width: '5px', height: '5px' }}></span>
                      <span>Pro Active</span>
                    </div>
                  </div>

                  <ChevronDown 
                    size={14} 
                    style={{ 
                      color: 'var(--text-muted)', 
                      transition: 'transform 0.2s ease',
                      transform: userDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                    }} 
                  />
                </button>

                {/* User Dropdown Menu */}
                {userDropdownOpen && (
                  <div 
                    className="card nav-user-dropdown"
                    role="menu"
                  >
                    {/* User Info Header */}
                    <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <div className="nav-user-avatar" style={{ width: '28px', height: '28px', fontSize: '0.75rem' }}>
                          {currentUser.fullName ? currentUser.fullName.charAt(0) : 'U'}
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {currentUser.fullName}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {currentUser.email}
                          </div>
                        </div>
                      </div>
                      {currentUser.targetRole && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <span className="badge badge-emerald" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                            {currentUser.targetRole}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Menu Items */}
                    <button
                      type="button"
                      onClick={() => { onOpenProfile(); setUserDropdownOpen(false); }}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '9px',
                        background: 'none',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.82rem',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background-color 0.15s ease, color 0.15s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                    >
                      <UserPen size={15} color="var(--accent-emerald)" />
                      <span>My Candidate Profile</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setActiveTab('ats'); setUserDropdownOpen(false); }}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        background: 'none',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.82rem',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background-color 0.15s ease, color 0.15s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                        <FileCheck2 size={15} color="var(--accent-emerald)" />
                        <span>ATS Resume Doctor</span>
                      </div>
                      {atsScore !== null && (
                        <span className={`badge ${atsScore >= 80 ? 'badge-emerald' : 'badge-amber'}`} style={{ padding: '0 6px', fontSize: '0.66rem' }}>
                          {atsScore}
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => { setActiveTab('tracker'); setUserDropdownOpen(false); }}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        background: 'none',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.82rem',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background-color 0.15s ease, color 0.15s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                        <Kanban size={15} color="var(--accent-emerald)" />
                        <span>Tracked Applications</span>
                      </div>
                      {applicationCount > 0 && (
                        <span className="badge badge-emerald" style={{ padding: '0 6px', fontSize: '0.66rem' }}>
                          {applicationCount}
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => { setActiveTab('saved'); setUserDropdownOpen(false); }}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        background: 'none',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.82rem',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background-color 0.15s ease, color 0.15s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                        <Bookmark size={15} color="var(--accent-amber)" />
                        <span>Saved Bookmarks</span>
                      </div>
                      {savedCount > 0 && (
                        <span className="badge badge-amber" style={{ padding: '0 6px', fontSize: '0.66rem' }}>
                          {savedCount}
                        </span>
                      )}
                    </button>

                    <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '6px 0' }} />

                    {/* Sign Out Button */}
                    <button
                      type="button"
                      onClick={() => { onLogout(); setUserDropdownOpen(false); }}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '9px',
                        background: 'none',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.82rem',
                        color: 'var(--accent-rose)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-rose-soft)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <LogOut size={15} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Sleek Mobile Bottom Navigation Bar (Phones & Tablets) */}
      <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
        <button
          type="button"
          onClick={() => setActiveTab('jobs')}
          className={`mobile-nav-item ${activeTab === 'jobs' ? 'active' : ''}`}
          aria-label="Find Jobs"
        >
          <Briefcase size={19} />
          <span>Jobs</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ats')}
          className={`mobile-nav-item ${activeTab === 'ats' ? 'active' : ''}`}
          aria-label="ATS Resume Doctor"
        >
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            <FileCheck2 size={19} />
            {atsScore !== null && (
              <span className="mobile-nav-badge">{atsScore}</span>
            )}
          </div>
          <span>ATS</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`mobile-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
          aria-label="Profile Builder"
        >
          <UserPen size={19} />
          <span>Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tracker')}
          className={`mobile-nav-item ${activeTab === 'tracker' ? 'active' : ''}`}
          aria-label="Application Tracker"
        >
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            <Kanban size={19} />
            {applicationCount > 0 && (
              <span className="mobile-nav-badge">{applicationCount}</span>
            )}
          </div>
          <span>Tracker</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('saved')}
          className={`mobile-nav-item ${activeTab === 'saved' ? 'active' : ''}`}
          aria-label="Saved Bookmarks"
        >
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            <Bookmark size={19} />
            {savedCount > 0 && (
              <span className="mobile-nav-badge">{savedCount}</span>
            )}
          </div>
          <span>Saved</span>
        </button>
      </nav>
    </>
  );
}
