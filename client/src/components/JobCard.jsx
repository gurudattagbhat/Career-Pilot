import React from 'react';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  ExternalLink, 
  Bookmark, 
  Sparkles, 
  FileText, 
  HelpCircle, 
  Calendar,
  Layers,
  CheckCircle2
} from 'lucide-react';

export default function JobCard({
  job,
  isSaved,
  onToggleSave,
  onSelectJob,
  onGenerateCoverLetter,
  onOpenInterviewPrep,
  onTrackApplied
}) {
  const matchScore = job.calculatedMatchScore || null;

  const handleApplyClick = (e) => {
    e.stopPropagation();
    window.open(job.applyUrl, '_blank', 'noopener,noreferrer');
    if (onTrackApplied) {
      onTrackApplied(job);
    }
  };

  const getSourceBadge = (src = '') => {
    if (src.includes('LinkedIn')) {
      return { label: 'LinkedIn India', bg: 'rgba(14, 118, 168, 0.15)', color: '#0a66c2', border: 'rgba(10, 102, 194, 0.3)' };
    }
    if (src.includes('Instahyre')) {
      return { label: 'Instahyre Direct', bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: 'rgba(16, 185, 129, 0.3)' };
    }
    if (src.includes('Internshala')) {
      return { label: 'Internshala', bg: 'rgba(0, 143, 203, 0.15)', color: '#008fcb', border: 'rgba(0, 143, 203, 0.35)' };
    }
    if (src.includes('Cutshort')) {
      return { label: 'Cutshort', bg: 'rgba(236, 72, 153, 0.15)', color: '#ec4899', border: 'rgba(236, 72, 153, 0.35)' };
    }
    if (src.includes('Indeed')) {
      return { label: 'Indeed India', bg: 'rgba(37, 87, 167, 0.15)', color: '#2557a7', border: 'rgba(37, 87, 167, 0.35)' };
    }
    if (src.includes('Foundit') || src.includes('Monster')) {
      return { label: 'Foundit India', bg: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', border: 'rgba(139, 92, 246, 0.35)' };
    }
    if (src.includes('Wellfound') || src.includes('AngelList')) {
      return { label: 'Wellfound', bg: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e', border: 'rgba(244, 63, 94, 0.35)' };
    }
    if (src.includes('Naukri')) {
      return { label: 'Naukri', bg: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' };
    }
    if (src.includes('Careers') || src.includes('Direct') || src.includes('iBegin')) {
      return { label: src, bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)' };
    }
    return { label: src || 'Direct', bg: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: 'var(--border-subtle)' };
  };

  const badgeStyle = getSourceBadge(job.source);

  return (
    <div 
      className="card"
      onClick={() => onSelectJob(job)}
      style={{
        cursor: 'pointer',
        padding: '22px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-card)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-medium)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div>
        {/* Top Meta Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Indian Platform Source Badge */}
            <span 
              className="badge" 
              style={{ 
                backgroundColor: badgeStyle.bg, 
                color: badgeStyle.color, 
                border: `1px solid ${badgeStyle.border}` 
              }}
            >
              <Layers size={11} />
              <span>{badgeStyle.label}</span>
            </span>

            {/* Real-time scraped indicator */}
            {job.isLiveScraped && (
              <span className="badge badge-emerald" style={{ fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span className="pulse-dot" style={{ width: '6px', height: '6px' }}></span>
                <span>REAL-TIME LIVE</span>
              </span>
            )}

            {/* Work Mode / Remote Pill */}
            <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
              {job.workMode || (job.isRemote ? 'Remote India' : 'Hybrid')}
            </span>

            {/* Experience Years */}
            {job.experienceYears && (
              <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
                {job.experienceYears}
              </span>
            )}
          </div>

          {/* Bookmark & AI Match */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {matchScore && (
              <span 
                className={`badge ${matchScore >= 80 ? 'badge-emerald' : 'badge-amber'}`}
                style={{ padding: '3px 8px', fontSize: '0.75rem', fontWeight: 700 }}
                title="AI Candidate Profile Match"
              >
                <Sparkles size={11} />
                <span>{matchScore}% Match</span>
              </span>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(job);
              }}
              style={{
                color: isSaved ? 'var(--accent-amber)' : 'var(--text-muted)',
                padding: '6px',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.15s ease'
              }}
              title={isSaved ? 'Remove from saved' : 'Save job'}
            >
              <Bookmark size={18} fill={isSaved ? 'var(--accent-amber)' : 'none'} />
            </button>
          </div>
        </div>

        {/* Company & Title */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '12px' }}>
          {/* Company Avatar / Logo */}
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1.1rem',
            color: 'var(--accent-emerald)',
            flexShrink: 0,
            overflow: 'hidden'
          }}>
            {job.companyLogo ? (
              <img 
                src={job.companyLogo} 
                alt={job.company} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            ) : (
              job.company.substring(0, 2).toUpperCase()
            )}
          </div>

          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Building2 size={14} />
              <span>{job.company}</span>
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.3, marginTop: '2px', color: 'var(--text-primary)' }}>
              {job.title}
            </h3>
          </div>
        </div>

        {/* Location & CTC / Salary */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', fontSize: '0.82rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={14} />
            <span>{job.location || 'India'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--accent-emerald)', fontWeight: 700 }}>
            <span style={{ fontSize: '0.9rem' }}>₹</span>
            <span>{job.salaryFormatted || (job.maxLpa ? `₹${job.minLpa} – ₹${job.maxLpa} LPA` : 'Competitive CTC')}</span>
          </div>
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
          {(job.tags || []).slice(0, 5).map((tag, idx) => (
            <span
              key={idx}
              style={{
                fontSize: '0.74rem',
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-elevated)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Action Buttons Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '14px',
        borderTop: '1px solid var(--border-subtle)',
        gap: '8px',
        flexWrap: 'wrap'
      }}>
        {/* AI Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onGenerateCoverLetter(job);
            }}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.78rem', gap: '4px' }}
            title="Generate custom AI cover letter for this job"
          >
            <FileText size={13} color="var(--accent-emerald)" />
            <span>Cover Letter</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenInterviewPrep(job);
            }}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.78rem', gap: '4px' }}
            title="Get role-specific interview questions & answers"
          >
            <HelpCircle size={13} color="var(--accent-amber)" />
            <span>Prep Copilot</span>
          </button>
        </div>

        {/* Direct Apply Anchor Button */}
        <a
          href={job.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            e.stopPropagation();
            if (onTrackApplied) onTrackApplied(job);
          }}
          className="btn btn-primary btn-sm"
          style={{ gap: '6px', fontSize: '0.82rem', textDecoration: 'none' }}
          title={`Directly opens official job application on ${job.source || 'portal'}`}
        >
          <span>Apply on {job.source || 'Portal'}</span>
          <ExternalLink size={13} />
        </a>
      </div>
    </div>
  );
}
