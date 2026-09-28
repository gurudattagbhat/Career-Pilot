import React, { useState, useEffect } from 'react';
import { X, HelpCircle, Sparkles, CheckCircle2, ChevronDown, ChevronUp, MessageSquare, Lightbulb, RefreshCw } from 'lucide-react';

export default function AIInterviewPrepModal({
  isOpen,
  onClose,
  job,
  profile,
  groqKey
}) {
  const [prepData, setPrepData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(0);

  const fetchPrep = async () => {
    if (!job || !profile) return;
    setLoading(true);

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (groqKey) headers['x-groq-api-key'] = groqKey;

      const res = await fetch('/api/ai/interview-prep', {
        method: 'POST',
        headers,
        body: JSON.stringify({ job, profile })
      });
      const data = await res.json();
      setPrepData(data.prep);
    } catch (err) {
      alert('Error generating interview prep: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && job) {
      fetchPrep();
    }
  }, [isOpen, job]);

  if (!isOpen || !job) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '840px' }}
      >
        {/* Fixed Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: 'var(--accent-amber-soft)',
              color: 'var(--accent-amber)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <HelpCircle size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>AI Interview Copilot</h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                Tailored preparation for <strong>{job.title}</strong> at <strong>{job.company}</strong>
              </p>
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

        {loading ? (
          <div style={{
            height: '320px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-lg)',
            color: 'var(--text-muted)',
            gap: '12px'
          }}>
            <Sparkles size={28} color="var(--accent-amber)" className="spin-animation" />
            <span>Analyzing hiring rubric & generating realistic STAR-method questions...</span>
          </div>
        ) : prepData ? (
          <div>
            {/* Role Summary Strategy */}
            {prepData.roleSummary && (
              <div style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--accent-emerald-soft)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: 'var(--text-primary)',
                fontSize: '0.88rem',
                marginBottom: '20px'
              }}>
                🎯 <strong>Key Interview Focus:</strong> {prepData.roleSummary}
              </div>
            )}

            {/* Questions List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              {(prepData.questions || []).map((q, idx) => {
                const isExpanded = expandedIndex === idx;
                return (
                  <div
                    key={idx}
                    style={{
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: 'var(--bg-elevated)',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                      style={{
                        padding: '16px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        userSelect: 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span className="badge badge-amber" style={{ fontSize: '0.72rem' }}>
                          {q.category || 'Interview'}
                        </span>
                        <span style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                          {q.question}
                        </span>
                      </div>
                      {isExpanded ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                    </div>

                    {isExpanded && (
                      <div style={{
                        padding: '0 20px 20px 20px',
                        borderTop: '1px solid var(--border-subtle)',
                        paddingTop: '16px'
                      }}>
                        {/* What they're testing for */}
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Lightbulb size={14} color="var(--accent-amber)" />
                          <span><strong>Interviewer Objective:</strong> {q.interviewerGoal}</span>
                        </div>

                        {/* STAR Response Breakdown */}
                        {q.recommendedStarAnswer && (
                          <div style={{
                            backgroundColor: 'var(--bg-card)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-md)',
                            padding: '14px',
                            marginBottom: '12px'
                          }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-emerald)', marginBottom: '8px' }}>
                              ⭐ Recommended STAR Framework Response:
                            </div>
                            <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--text-secondary)' }}>
                              <div><strong>Situation:</strong> {q.recommendedStarAnswer.situation}</div>
                              <div><strong>Task:</strong> {q.recommendedStarAnswer.task}</div>
                              <div><strong>Action:</strong> {q.recommendedStarAnswer.action}</div>
                              <div><strong>Result:</strong> {q.recommendedStarAnswer.result}</div>
                            </div>
                          </div>
                        )}

                        {/* Pro Tip */}
                        {q.proTip && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--accent-amber)', fontStyle: 'italic' }}>
                            💡 Pro Tip: {q.proTip}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Smart Questions to Ask the Interviewer */}
            {prepData.smartQuestionsToAskInterviewer && (
              <div className="card" style={{ padding: '18px', backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <MessageSquare size={16} color="var(--accent-emerald)" />
                  <span>High-Impact Questions to Ask at the End of the Interview</span>
                </h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {prepData.smartQuestionsToAskInterviewer.map((sq, i) => (
                    <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>•</span>
                      <span>"{sq}"</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : null}
        </div>

        {/* Fixed Footer */}
        <div className="modal-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              {prepData?.questions?.length ? `${prepData.questions.length} Custom STAR Questions Prepared` : 'AI Interview Readiness'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '8px 18px', fontSize: '0.86rem' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
