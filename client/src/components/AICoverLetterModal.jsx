import React, { useState, useEffect } from 'react';
import { X, FileText, Sparkles, Copy, Check, Download, RefreshCw } from 'lucide-react';

export default function AICoverLetterModal({
  isOpen,
  onClose,
  job,
  profile,
  groqKey
}) {
  const [tone, setTone] = useState('enthusiastic and professional');
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState('');

  const generateLetter = async () => {
    if (!job || !profile) return;
    setLoading(true);
    setCopied(false);
    setNotice('');

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (groqKey) headers['x-groq-api-key'] = groqKey;

      const res = await fetch('/api/ai/cover-letter', {
        method: 'POST',
        headers,
        body: JSON.stringify({ job, profile, tone })
      });
      const data = await res.json();
      setCoverLetter(data.coverLetter || '');
      if (data.notice) setNotice(data.notice);
    } catch (err) {
      alert('Error generating cover letter: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && job) {
      generateLetter();
    }
  }, [isOpen, job]);

  if (!isOpen || !job) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([coverLetter], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Cover_Letter_${job.company.replace(/\s+/g, '_')}_${job.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '780px' }}
      >
        {/* Fixed Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: 'var(--accent-emerald-soft)',
              color: 'var(--accent-emerald)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <FileText size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>AI Tailored Cover Letter</h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                Tailored for <strong>{job.title}</strong> at <strong>{job.company}</strong>
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

        {/* Tone Selector & Regeneate Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '16px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Tone:</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              style={{
                padding: '6px 10px',
                fontSize: '0.82rem',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)'
              }}
            >
              <option value="enthusiastic and professional">Enthusiastic & Impactful</option>
              <option value="executive and concise">Executive & Strategic</option>
              <option value="technical and metric-driven">Technical & Metric-Focused</option>
            </select>
          </div>

          <button
            onClick={generateLetter}
            disabled={loading}
            className="btn btn-secondary btn-sm"
            style={{ gap: '6px' }}
          >
            <RefreshCw size={13} className={loading ? 'spin-animation' : ''} />
            <span>Regenerate Cover Letter</span>
          </button>
        </div>

        {/* Optional Notice */}
        {notice && (
          <div style={{
            fontSize: '0.8rem',
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--accent-amber-soft)',
            color: 'var(--accent-amber)',
            marginBottom: '12px'
          }}>
            {notice}
          </div>
        )}

        {/* Text Area */}
        <div style={{ marginBottom: '20px' }}>
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
              <Sparkles size={28} color="var(--accent-emerald)" className="spin-animation" />
              <span>Connecting your past achievements to {job.company}'s requirements...</span>
            </div>
          ) : (
            <textarea
              rows={14}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                fontSize: '0.92rem',
                lineHeight: 1.6,
                color: 'var(--text-primary)',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
          )}
        </div>

        </div>

        {/* Fixed Footer */}
        <div className="modal-footer">
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '8px 16px', fontSize: '0.86rem' }}
          >
            Cancel
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleCopy}
              disabled={loading || !coverLetter}
              className="btn btn-secondary"
            >
              {copied ? <Check size={16} color="var(--accent-emerald)" /> : <Copy size={16} />}
              <span>{copied ? 'Copied!' : 'Copy Letter'}</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={loading || !coverLetter}
              className="btn btn-primary"
            >
              <Download size={16} />
              <span>Download .txt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
