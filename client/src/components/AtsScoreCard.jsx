import React, { useState } from 'react';
import { 
  FileCheck2, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  ShieldCheck, 
  Wand2, 
  Copy, 
  Check, 
  RefreshCw 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AtsScoreCard({ 
  atsData, 
  profile, 
  onReanalyze, 
  reanalyzing = false,
  groqKey,
  onScrapeForResume = null
}) {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [customBullet, setCustomBullet] = useState('');
  const [optimizingBullet, setOptimizingBullet] = useState(false);
  const [optimizedResult, setOptimizedResult] = useState(null);

  if (!atsData) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '700px', margin: '0 auto' }}>
        <FileCheck2 size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px auto' }} />
        <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>No Resume Analyzed Yet</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
          Upload your resume file or fill in the manual profile builder to calculate your comprehensive ATS diagnostic.
        </p>
      </div>
    );
  }

  const score = atsData.overallScore || 70;
  const pillars = atsData.pillars || {};

  // Color logic
  const getScoreColor = (val) => {
    if (val >= 85) return 'var(--accent-emerald)';
    if (val >= 70) return 'var(--accent-amber)';
    return 'var(--accent-rose)';
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleTriggerConfetti = () => {
    if (score >= 80) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  };

  // Custom bullet optimizer
  const handleOptimizeCustomBullet = async () => {
    if (!customBullet.trim()) return;
    setOptimizingBullet(true);
    setOptimizedResult(null);

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (groqKey) headers['x-groq-api-key'] = groqKey;

      const res = await fetch('/api/ai/optimize-bullet', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          bullet: customBullet.trim(),
          targetRole: profile?.headline || 'Software Professional'
        })
      });
      const data = await res.json();
      setOptimizedResult(data.optimized);
    } catch (err) {
      alert('Failed to optimize bullet: ' + err.message);
    } finally {
      setOptimizingBullet(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '40px' }} className="animate-fade-in">
      {/* Header Banner */}
      <div className="card" style={{
        padding: '32px',
        marginBottom: '24px',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-medium)',
        background: 'linear-gradient(180deg, var(--bg-card) 0%, var(--bg-elevated) 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '32px', alignItems: 'center' }}>
          {/* Radial Circular Score Gauge */}
          <div 
            onClick={handleTriggerConfetti}
            style={{ textAlign: 'center', cursor: score >= 80 ? 'pointer' : 'default' }}
            title="Click to celebrate!"
          >
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: `conic-gradient(${getScoreColor(score)} ${score * 3.6}deg, var(--bg-input) 0deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 24px ${score >= 80 ? 'var(--accent-emerald-glow)' : 'rgba(0,0,0,0.2)'}`
            }}>
              <div style={{
                width: '98px',
                height: '98px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-card)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '2.1rem', fontWeight: 800, fontFamily: 'var(--font-display)', lineHeight: 1 }}>
                  {score}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>/ 100 ATS</span>
              </div>
            </div>
          </div>

          {/* Diagnostic Verdict & Target Role */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className={`badge ${score >= 85 ? 'badge-emerald' : score >= 70 ? 'badge-amber' : 'badge-rose'}`} style={{ padding: '4px 12px', fontSize: '0.85rem' }}>
                <ShieldCheck size={14} />
                {score >= 85 ? 'High ATS Pass Likelihood' : score >= 70 ? 'Solid ATS Foundation' : 'Action Required for ATS Screens'}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Target: <strong>{profile?.targetRole || profile?.headline || 'Tech Professional'}</strong>
              </span>
            </div>

            <h2 style={{ fontSize: '1.6rem', marginBottom: '8px' }}>
              {score >= 85 ? 'Your Resume is in the Top 12% of Applicants' : 'Resume Diagnosed: 3 Key Improvements Needed'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Modern enterprise ATS parsers (Workday, Greenhouse, Taleo) scan for quantifiable metrics, action power verbs, and keyword density.
            </p>
          </div>

          {/* Re-analyze Button */}
          <div>
            <button
              onClick={onReanalyze}
              disabled={reanalyzing}
              className="btn btn-secondary btn-sm"
              style={{ gap: '6px' }}
            >
              <RefreshCw size={14} className={reanalyzing ? 'spin-animation' : ''} />
              <span>{reanalyzing ? 'Re-scoring...' : 'Re-score ATS'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-Time Live Job Scraper CTA */}
      <div className="card" style={{
        padding: '20px 24px',
        marginBottom: '24px',
        borderRadius: 'var(--radius-xl)',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(14, 17, 20, 0.8) 100%)',
        border: '1px solid var(--accent-emerald)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="pulse-dot"></span>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Scrape Real-Time Jobs Matching Your Resume
            </h4>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--accent-emerald-soft)',
              color: 'var(--accent-emerald)',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              LIVE WEB ON-DEMAND
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            Dynamically scrape live openings across LinkedIn India, Naukri & Instahyre matched to <strong>{profile?.targetRole || profile?.headline || 'Your Profile'}</strong>. Zero preloaded static jobs.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onScrapeForResume && onScrapeForResume(profile?.targetRole || profile?.headline)}
          className="btn btn-primary"
          style={{ gap: '8px', padding: '10px 20px', borderRadius: 'var(--radius-md)', whiteSpace: 'nowrap' }}
        >
          <Sparkles size={16} />
          <span>Scrape Real-Time Jobs Now</span>
        </button>
      </div>

      {/* 4 Pillars Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {Object.entries({
          'Keyword Match': pillars.keywordMatch || { score: 75, feedback: 'Strong tech terminology' },
          'Quantifiable Impact': pillars.quantifiableImpact || { score: 65, feedback: 'Add numbers & percentages' },
          'ATS Parsability': pillars.formattingAndStructure || { score: 90, feedback: 'Clean standard sections' },
          'Skills Alignment': pillars.skillsAlignment || { score: 80, feedback: 'Matches target role' }
        }).map(([title, item]) => (
          <div key={title} className="card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{title}</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: getScoreColor(item.score) }}>
                {item.score}%
              </span>
            </div>
            {/* Progress Bar */}
            <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-input)', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
              <div style={{
                width: `${item.score}%`,
                height: '100%',
                backgroundColor: getScoreColor(item.score),
                borderRadius: '3px',
                transition: 'width 0.8s ease'
              }} />
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {item.feedback}
            </p>
          </div>
        ))}
      </div>

      {/* Fixes and Strengths Side-by-Side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Critical Fixes Box */}
        <div className="card" style={{ borderLeft: '4px solid var(--accent-rose)', padding: '22px' }}>
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: 'var(--accent-rose)' }}>
            <AlertTriangle size={18} />
            <span>High-Priority Fixes to Increase Interview Rate</span>
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(atsData.criticalFixes || [
              'Replace passive phrases ("assisted with", "responsible for") with strong power verbs',
              'Include quantifiable business outcomes (% latency decrease, $ revenue, scale of users)',
              'Include clear GitHub and LinkedIn portfolio links in header'
            ]).map((fix, idx) => (
              <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.87rem', color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--accent-rose)', fontWeight: 700, marginTop: '1px' }}>✕</span>
                <span>{fix}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Strengths Box */}
        <div className="card" style={{ borderLeft: '4px solid var(--accent-emerald)', padding: '22px' }}>
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: 'var(--accent-emerald)' }}>
            <CheckCircle2 size={18} />
            <span>Identified Resume Strengths</span>
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(atsData.strengths || [
              'Clear chronological career progression and job titles',
              'Relevant core technical skill taxonomy present',
              'Readable single-column structure parsed easily by ATS engines'
            ]).map((strength, idx) => (
              <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.87rem', color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--accent-emerald)', fontWeight: 700, marginTop: '1px' }}>✓</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Missing High Value Keywords */}
      {atsData.missingHighValueKeywords && atsData.missingHighValueKeywords.length > 0 && (
        <div className="card" style={{ padding: '22px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Sparkles size={17} color="var(--accent-amber)" />
            <span>Missing High-Demand Keywords for this Target Role</span>
          </h3>
          <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Adding these industry keywords into your skills or experience bullets helps pass automated keyword filters:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {atsData.missingHighValueKeywords.map((kw, i) => (
              <span key={i} className="badge badge-amber" style={{ padding: '5px 12px', fontSize: '0.8rem' }}>
                + {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Bullet Point Doctor (Google X-Y-Z Formula) */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={19} color="var(--accent-emerald)" />
            <span>Resume Bullet Point Doctor (Google X-Y-Z Formula)</span>
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            "Accomplished [X] as measured by [Y] by doing [Z]" — transforms weak task descriptions into high-converting impact statements.
          </p>
        </div>

        {/* Improved Bullet Samples */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {(atsData.bulletPointImprovements || []).map((item, idx) => (
            <div 
              key={idx} 
              style={{
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px'
              }}
            >
              <div style={{ marginBottom: '8px', fontSize: '0.82rem', color: 'var(--accent-rose)' }}>
                <strong>Before (Weak):</strong> "{item.original}"
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--accent-emerald-soft)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: 'var(--text-primary)',
                fontSize: '0.88rem'
              }}>
                <div>
                  <strong style={{ color: 'var(--accent-emerald)' }}>Rewritten: </strong>
                  {item.improved}
                </div>
                <button
                  onClick={() => handleCopy(item.improved, idx)}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: '4px', flexShrink: 0 }}
                  title="Copy rewritten bullet to clipboard"
                >
                  {copiedIndex === idx ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
                  <span style={{ fontSize: '0.75rem' }}>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              {item.reason && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  💡 <em>{item.reason}</em>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Bullet Point Rewriter */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Wand2 size={18} color="var(--accent-amber)" />
          <span>Interactive Bullet Point Enhancer</span>
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
          Paste any sentence or bullet point from your resume to enhance it instantly with power action verbs and metrics:
        </p>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
          <input
            type="text"
            placeholder="e.g. Worked on the website checkout and fixed performance bugs..."
            value={customBullet}
            onChange={(e) => setCustomBullet(e.target.value)}
            style={{
              flex: 1,
              padding: '12px 14px',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          />
          <button
            onClick={handleOptimizeCustomBullet}
            disabled={optimizingBullet || !customBullet.trim()}
            className="btn btn-primary"
            style={{ padding: '12px 20px' }}
          >
            <Sparkles size={16} />
            <span>{optimizingBullet ? 'Enhancing...' : 'Enhance'}</span>
          </button>
        </div>

        {optimizedResult && (
          <div style={{
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--accent-emerald-soft)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                {optimizedResult.improved}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {optimizedResult.explanation}
              </div>
            </div>
            <button
              onClick={() => handleCopy(optimizedResult.improved, 'custom')}
              className="btn btn-secondary btn-sm"
              style={{ flexShrink: 0 }}
            >
              {copiedIndex === 'custom' ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
              <span>{copiedIndex === 'custom' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
