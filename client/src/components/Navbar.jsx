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
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backdropFilter: 'blur(12px)',
      backgroundColor: theme === 'dark' ? 'rgba(14, 17, 20, 0.88)' : 'rgba(247, 248, 250, 0.92)',
      borderBottom: '1px solid var(--border-subtle)',
      transition: 'all 0.2s ease'
    }}>
      <div className="app-container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '70px',
        gap: '16px'
      }}>
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('jobs')}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            backgroundColor: 'var(--accent-emerald)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 14px var(--accent-emerald-glow)'
          }}>
            <Briefcase size={20} strokeWidth={2.4} />
          </div>
          <div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '1.25rem',
              letterSpacing: '-0.03em'
            }}>
              CareerPilot <span style={{ color: 'var(--accent-emerald)', fontSize: '0.9rem', fontWeight: 600 }}>PRO</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '-3px' }}>
              Multi-Source Job Engine & ATS Doctor
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          backgroundColor: 'var(--bg-elevated)',
          padding: '4px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            onClick={() => setActiveTab('jobs')}
            className="btn btn-sm"
            style={{
              backgroundColor: activeTab === 'jobs' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'jobs' ? 'var(--accent-emerald)' : 'var(--text-secondary)',
              border: activeTab === 'jobs' ? '1px solid var(--border-subtle)' : '1px solid transparent',
              boxShadow: activeTab === 'jobs' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            <Briefcase size={15} />
            <span>Find Jobs</span>
          </button>

          <button
            onClick={() => setActiveTab('ats')}
            className="btn btn-sm"
            style={{
              backgroundColor: activeTab === 'ats' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'ats' ? 'var(--accent-emerald)' : 'var(--text-secondary)',
              border: activeTab === 'ats' ? '1px solid var(--border-subtle)' : '1px solid transparent',
              boxShadow: activeTab === 'ats' ? 'var(--shadow-sm)' : 'none',
              position: 'relative'
            }}
          >
            <FileCheck2 size={15} />
            <span>ATS Doctor</span>
            {atsScore !== null && (
              <span className={`badge ${atsScore >= 80 ? 'badge-emerald' : 'badge-amber'}`} style={{ padding: '1px 6px', fontSize: '0.68rem' }}>
                {atsScore}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className="btn btn-sm"
            style={{
              backgroundColor: activeTab === 'profile' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'profile' ? 'var(--accent-emerald)' : 'var(--text-secondary)',
              border: activeTab === 'profile' ? '1px solid var(--border-subtle)' : '1px solid transparent',
              boxShadow: activeTab === 'profile' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            <UserPen size={15} />
            <span>Profile Builder</span>
          </button>

          <button
            onClick={() => setActiveTab('tracker')}
            className="btn btn-sm"
            style={{
              backgroundColor: activeTab === 'tracker' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'tracker' ? 'var(--accent-emerald)' : 'var(--text-secondary)',
              border: activeTab === 'tracker' ? '1px solid var(--border-subtle)' : '1px solid transparent',
              boxShadow: activeTab === 'tracker' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            <Kanban size={15} />
            <span>Tracker</span>
            {applicationCount > 0 && (
              <span className="badge badge-emerald" style={{ padding: '1px 6px', fontSize: '0.68rem' }}>
                {applicationCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Saved bookmarks count button */}
          <button 
            onClick={() => setActiveTab('saved')}
            className="btn btn-secondary btn-sm" 
            title="Saved Jobs"
            style={{
              position: 'relative',
              borderColor: activeTab === 'saved' ? 'var(--accent-amber)' : 'var(--border-subtle)'
            }}
          >
            <Bookmark size={15} color={savedCount > 0 ? 'var(--accent-amber)' : 'inherit'} />
            <span style={{ fontSize: '0.8rem' }}>Saved</span>
            {savedCount > 0 && (
              <span className="badge badge-amber" style={{ padding: '0 5px', fontSize: '0.65rem' }}>
                {savedCount}
              </span>
            )}
          </button>

          {/* Theme Switcher */}
          <button 
            onClick={toggleTheme}
            className="btn btn-secondary btn-sm"
            style={{ padding: '8px', borderRadius: 'var(--radius-md)' }}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Vertical divider */}
          <div style={{ width: '1px', height: '22px', backgroundColor: 'var(--border-subtle)', margin: '0 4px' }} />

          {/* Authentication State Controls */}
          {!currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => onOpenAuth('login')}
                className="btn btn-secondary btn-sm"
                style={{ gap: '6px' }}
              >
                <LogIn size={15} />
                <span>Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenAuth('signup')}
                className="btn btn-primary btn-sm"
                style={{ gap: '6px', padding: '8px 14px' }}
              >
                <UserPlus size={15} />
                <span>Sign Up</span>
              </button>
            </div>
          ) : (
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="btn btn-secondary btn-sm"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 10px 4px 5px',
                  borderRadius: 'var(--radius-full)',
                  borderColor: userDropdownOpen ? 'var(--accent-emerald)' : 'var(--border-subtle)'
                }}
              >
                {/* User Avatar Circle */}
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-emerald)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  textTransform: 'uppercase'
                }}>
                  {currentUser.fullName ? currentUser.fullName.charAt(0) : 'U'}
                </div>

                <div style={{ textAlign: 'left', lineHeight: 1.1 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {currentUser.fullName || 'User'}
                  </div>
                </div>

                <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div 
                  className="card animate-fade-in"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '240px',
                    padding: '8px',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.4)',
                    border: '1px solid var(--border-medium)',
                    backgroundColor: 'var(--bg-card)',
                    zIndex: 60
                  }}
                >
                  {/* User Info Header */}
                  <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '6px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                      {currentUser.fullName}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {currentUser.email}
                    </div>
                    {currentUser.targetRole && (
                      <span className="badge badge-emerald" style={{ marginTop: '6px', fontSize: '0.68rem', padding: '2px 8px' }}>
                        {currentUser.targetRole}
                      </span>
                    )}
                  </div>

                  {/* Menu Items */}
                  <button
                    onClick={() => { onOpenProfile(); setUserDropdownOpen(false); }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'none',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.82rem',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <UserPen size={15} color="var(--accent-emerald)" />
                    <span>My Candidate Profile</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('ats'); setUserDropdownOpen(false); }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'none',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.82rem',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <FileCheck2 size={15} color="var(--accent-emerald)" />
                    <span>ATS Resume Doctor</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('tracker'); setUserDropdownOpen(false); }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'none',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.82rem',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Kanban size={15} color="var(--accent-emerald)" />
                    <span>Tracked Applications</span>
                  </button>

                  <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '6px 0' }} />

                  {/* Sign Out Button */}
                  <button
                    onClick={() => { onLogout(); setUserDropdownOpen(false); }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'none',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.82rem',
                      color: 'var(--accent-rose)',
                      cursor: 'pointer',
                      textAlign: 'left'
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
  );
}
