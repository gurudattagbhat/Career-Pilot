import React, { useState, useEffect } from 'react';
import { 
  X, 
  Building2, 
  MapPin, 
  DollarSign, 
  ExternalLink, 
  Sparkles, 
  FileText, 
  HelpCircle, 
  Bookmark, 
  CheckCircle2, 
  AlertCircle,
  PlusCircle,
  Clock
} from 'lucide-react';

export default function JobDetailModal({
  job,
  onClose,
  isSaved,
  onToggleSave,
  onGenerateCoverLetter,
  onOpenInterviewPrep,
  onTrackJob,
  profile,
  groqKey
}) {
  const [matchData, setMatchData] = useState(null);
  const [loadingMatch, setLoadingMatch] = useState(false);

  useEffect(() => {
    if (!job || !profile) return;

    const fetchMatch = async () => {
      setLoadingMatch(true);
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (groqKey) headers['x-groq-api-key'] = groqKey;

        const res = await fetch('/api/ai/match', {
          method: 'POST',
          headers,
          body: JSON.stringify({ job, profile })
        });
        const data = await res.json();
        if (data.match) {
          setMatchData(data.match);
        }
      } catch (err) {
        console.warn('Match analysis failed:', err);
      } finally {
        setLoadingMatch(false);
      }
    };

    fetchMatch();
  }, [job, profile, groqKey]);

  if (!job) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '860px' }}
      >
        {/* Fixed Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
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
              fontSize: '1.25rem',
              color: 'var(--accent-emerald)',
              flexShrink: 0,
              overflow: 'hidden'
            }}>
              {job.companyLogo ? (
                <img src={job.companyLogo} alt={job.company} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <span>{job.company?.charAt(0) || 'J'}</span>
              )}
            </div>
            <div style={{ minWidth: 0 }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, lineHeight: 1.25, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {job.title}
              </h2>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{job.company}</span>
                <span>•</span>
                <span>{job.location}</span>
                {job.experienceLevel && (
                  <>
                    <span>•</span>
                    <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>{job.experienceLevel}</span>
                  </>
                )}
              </div>
            </div>
          </div>

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

        {/* Scrollable Body */}
        <div className="modal-body">
          {/* Key Job Info Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '18px',
            paddingBottom: '14px',
            borderBottom: '1px solid var(--border-subtle)',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span className="badge badge-emerald">{job.source}</span>
              <span className="badge badge-neutral">{job.workMode || (job.isRemote ? 'Remote India' : 'Hybrid')}</span>
              {job.experienceLevel && <span className="badge badge-neutral">{job.experienceLevel}</span>}
              <span className="badge badge-neutral">{job.jobType || 'Full-time Permanent'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-emerald)', fontWeight: 700, fontSize: '1.05rem' }}>
              <span>₹</span>
              <span>{job.salaryFormatted || (job.maxLpa ? `₹${job.minLpa} – ₹${job.maxLpa} LPA` : 'Competitive CTC')}</span>
            </div>
          </div>

        {/* Action Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          padding: '16px',
          backgroundColor: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '24px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => onGenerateCoverLetter(job)}
              className="btn btn-secondary btn-sm"
            >
              <FileText size={15} color="var(--accent-emerald)" />
              <span>Tailored Cover Letter</span>
            </button>
            <button
              onClick={() => onOpenInterviewPrep(job)}
              className="btn btn-secondary btn-sm"
            >
              <HelpCircle size={15} color="var(--accent-amber)" />
              <span>Interview Questions</span>
            </button>
            <button
              onClick={() => onTrackJob(job)}
              className="btn btn-secondary btn-sm"
            >
              <PlusCircle size={15} />
              <span>Track Application</span>
            </button>
          </div>

          <a
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ gap: '8px', padding: '10px 22px' }}
          >
            <span>Direct Apply on {job.source || 'Portal'}</span>
            <ExternalLink size={16} />
          </a>
        </div>

        {/* AI Match & Gap Analysis Card */}
        {profile && (
          <div className="card" style={{
            padding: '20px',
            marginBottom: '24px',
            border: '1px solid var(--border-medium)',
            backgroundColor: 'var(--bg-card)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '1rem' }}>
                <Sparkles size={17} color="var(--accent-amber)" />
                <span>AI Profile Fit & Skill Gap Analysis</span>
              </div>
              {matchData && (
                <span className={`badge ${matchData.matchScore >= 80 ? 'badge-emerald' : 'badge-amber'}`} style={{ fontSize: '0.85rem' }}>
                  {matchData.matchScore}% Fit ({matchData.verdict})
                </span>
              )}
            </div>

            {loadingMatch ? (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Comparing your resume skills against {job.company}'s requirements...
              </div>
            ) : matchData ? (
              <div>
                {/* Matched & Missing Skills */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '14px' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-emerald)', marginBottom: '6px' }}>
                      ✓ Your Matching Skills:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {(matchData.matchedSkills || []).map((s, idx) => (
                        <span key={idx} className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-amber)', marginBottom: '6px' }}>
                      ⚠ Missing / Recommended to Highlight:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {(matchData.missingSkills || []).map((s, idx) => (
                        <span key={idx} className="badge badge-amber" style={{ fontSize: '0.75rem' }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {matchData.preparationAdvice && (
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-elevated)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
                    💡 <strong>Strategy:</strong> {matchData.preparationAdvice}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Skill evaluation ready.
              </div>
            )}
          </div>
        )}

        {/* Job Tags */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '8px' }}>Technologies & Tags:</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {(job.tags || []).map((tag, idx) => (
              <span key={idx} className="badge badge-neutral" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Job Description */}
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>Role Description & Requirements</h4>
          <div style={{
            fontSize: '0.92rem',
            lineHeight: 1.7,
            color: 'var(--text-secondary)',
            whiteSpace: 'pre-line'
          }}>
            {job.description}
          </div>
        </div>
        </div>

        {/* Fixed Footer */}
        <div className="modal-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => onToggleSave(job)}
              className="btn btn-secondary btn-sm"
              style={{ gap: '6px' }}
            >
              <Bookmark size={15} color={isSaved ? 'var(--accent-amber)' : 'inherit'} fill={isSaved ? 'var(--accent-amber)' : 'none'} />
              <span>{isSaved ? 'Bookmarked' : 'Save Job'}</span>
            </button>
            <button
              onClick={() => onTrackJob(job)}
              className="btn btn-secondary btn-sm"
              style={{ gap: '6px' }}
            >
              <PlusCircle size={15} />
              <span>Track Application</span>
            </button>
          </div>

          <a
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ gap: '8px', padding: '10px 22px' }}
          >
            <span>Direct Apply on {job.source || 'Portal'}</span>
            <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}
