import React from 'react';
import { Filter, DollarSign, Globe, Briefcase, Award, Layers, RotateCcw, ArrowUpDown, MapPin } from 'lucide-react';

export default function JobFilterSidebar({
  filters,
  onFilterChange,
  onResetFilters,
  totalResults = 0
}) {
  return (
    <aside style={{
      width: '100%',
      maxWidth: '300px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div className="card" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '1rem' }}>
            <Filter size={18} color="var(--accent-emerald)" />
            <span>Indian Job Filters</span>
          </div>
          <button
            onClick={onResetFilters}
            className="btn btn-secondary btn-sm"
            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
            title="Reset all filters"
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
        </div>

        {/* Sort By Option */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
            <ArrowUpDown size={14} />
            <span>Sort Results</span>
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange('sortBy', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              color: 'var(--text-primary)',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="date_newest">Newest Posted</option>
            <option value="salary_high_to_low">Highest CTC / LPA (₹₹₹ - ₹)</option>
            <option value="salary_low_to_high">Lowest CTC / LPA (₹ - ₹₹₹)</option>
            <option value="match_score">Highest Candidate / ATS Match</option>
            <option value="company_asc">Company (A to Z)</option>
            <option value="title_asc">Job Title (A to Z)</option>
          </select>
        </div>

        {/* Indian Tech City Filter */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
            <MapPin size={14} color="var(--accent-emerald)" />
            <span>Tech Hub City</span>
          </label>
          <select
            value={filters.city || ''}
            onChange={(e) => onFilterChange('city', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              color: 'var(--text-primary)',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">All Indian Tech Hubs</option>
            <option value="Bengaluru">Bengaluru, Karnataka (Silicon Valley of India)</option>
            <option value="Hyderabad">Hyderabad, Telangana (Cyberabad / HITEC City)</option>
            <option value="Pune">Pune, Maharashtra</option>
            <option value="Gurgaon">Gurugram / Noida (Delhi NCR)</option>
            <option value="Mumbai">Mumbai, Maharashtra</option>
            <option value="Remote India">Remote (Work From Anywhere in India)</option>
          </select>
        </div>

        {/* Remote India Only Toggle */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 12px',
          backgroundColor: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '18px',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
            <Globe size={16} color="var(--accent-emerald)" />
            <span>Remote India Only</span>
          </div>
          <input
            type="checkbox"
            checked={filters.remoteOnly}
            onChange={(e) => onFilterChange('remoteOnly', e.target.checked)}
            style={{
              width: '18px',
              height: '18px',
              cursor: 'pointer',
              accentColor: 'var(--accent-emerald)'
            }}
          />
        </div>

        {/* Indian Job Platforms Source Filter */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
            <Layers size={14} />
            <span>Platform Source</span>
          </label>
          <select
            value={filters.source}
            onChange={(e) => onFilterChange('source', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              color: 'var(--text-primary)',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">All Platforms (8 Sources)</option>
            <option value="LinkedIn India">LinkedIn India</option>
            <option value="Indeed India">Indeed India</option>
            <option value="Internshala">Internshala (Freshers & Interns)</option>
            <option value="Cutshort">Cutshort (Tech & Startups)</option>
            <option value="Foundit India">Foundit India (formerly Monster)</option>
            <option value="Instahyre">Instahyre (Curated AI Matching)</option>
            <option value="Wellfound">Wellfound (AngelList Startups)</option>
            <option value="Naukri">Naukri.com</option>
          </select>
        </div>

        {/* Minimum Annual Salary in LPA (Lakhs Per Annum) */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              <span style={{ fontWeight: 800, color: 'var(--accent-emerald)' }}>₹</span>
              <span>Min CTC (in Lakhs/Yr)</span>
            </label>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
              {filters.minLpa > 0 ? `₹${filters.minLpa}+ LPA` : 'Any CTC'}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="60"
            step="3"
            value={filters.minLpa || 0}
            onChange={(e) => onFilterChange('minLpa', Number(e.target.value))}
            style={{
              width: '100%',
              accentColor: 'var(--accent-emerald)',
              cursor: 'pointer'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            <span>₹0 LPA</span>
            <span>₹30 LPA</span>
            <span>₹60+ LPA</span>
          </div>
        </div>

        {/* Experience Level / Indian Engineering Cadres */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
            <Award size={14} />
            <span>Experience Level</span>
          </label>
          <select
            value={filters.experienceLevel}
            onChange={(e) => onFilterChange('experienceLevel', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              color: 'var(--text-primary)',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">All Experience Levels</option>
            <option value="Fresher">🎓 Fresher / Graduate (0 - 1 Yrs)</option>
            <option value="Junior">💼 Junior / SDE-1 (1 - 3 Yrs)</option>
            <option value="Mid-Level">🚀 Mid-Level / SDE-2 (3 - 5 Yrs)</option>
            <option value="Senior">👑 Senior / SDE-3 (5 - 8 Yrs)</option>
            <option value="Lead">🏆 Lead / Architect (8+ Yrs)</option>
          </select>
        </div>

        {/* Employment Type */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
            <Briefcase size={14} />
            <span>Employment Type</span>
          </label>
          <select
            value={filters.jobType}
            onChange={(e) => onFilterChange('jobType', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              color: 'var(--text-primary)',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">All Employment Types</option>
            <option value="Full-time">Full-time Permanent</option>
            <option value="Contract">Contract / C2H</option>
            <option value="Internship">Internship (6 Months / PPO)</option>
          </select>
        </div>
      </div>
    </aside>
  );
}
