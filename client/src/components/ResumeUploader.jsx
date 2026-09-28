import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Sparkles, ArrowRight, RefreshCw, Wand2 } from 'lucide-react';
import { apiFetch } from '../services/api';

const SAMPLE_RESUME_TEXT = `
AARAV SHARMA
aarav.sharma.dev@gmail.com | +91 98765 43210 | Bengaluru, Karnataka, India
LinkedIn: linkedin.com/in/aaravsharma-dev | GitHub: github.com/aarav-sharma
Current CTC: ₹28 LPA | Notice Period: 30 Days (Serving)

PROFESSIONAL SUMMARY
Senior Full-Stack Engineer with 5+ years of experience architecting high-scale consumer internet and fintech systems in India. Expert in MERN stack (MongoDB, Express, React, Node.js), distributed microservices, and event-driven architectures. Proven track record handling 40,000+ RPS during peak IPL flash sales with sub-60ms p99 latency.

CORE SKILLS
- Languages: TypeScript, JavaScript (ES6+), Python, Go, Java, SQL
- Frontend: React.js, Next.js, Redux Toolkit, TailwindCSS, WebSockets, Mobile Web Performance
- Backend: Node.js, Express, Microservices, RESTful APIs, GraphQL, Kafka, gRPC
- Databases & Cloud: MongoDB, PostgreSQL, Redis, AWS (ECS, S3, RDS), Docker, Kubernetes, CI/CD
- System Design: Low-Level Design (LLD), High-Level Design (HLD), Distributed Caching, Concurrency

PROFESSIONAL EXPERIENCE

Senior Software Engineer (SDE-2) | Swiggy | Bengaluru, India | 2022 - Present
- Architected and scaled real-time live order tracking and surge pricing engine using React, Node.js, and Redis, reducing p99 latency by 44% across 14 million daily active Indian consumers.
- Built automated event streaming pipeline using Apache Kafka and MongoDB sharded clusters, processing 85,000 events/second with 99.99% uptime.
- Spearheaded optimization of AWS ECS container infrastructure, saving ₹42 Lakhs annually in cloud computing costs.
- Mentored 5 junior SDE-1 engineers on Low-Level Design (LLD), Clean Architecture, and unit test automation.

Software Development Engineer | Razorpay | Bengaluru, India | 2019 - 2022
- Developed high-conversion Merchant Checkout flow in React and Express, improving mobile checkout completion rate by 31% across UPI, Net Banking, and Cards.
- Implemented robust RBI-compliant tokenization and bank webhook event verification handling ₹150+ Crore daily transaction volume.
- Reduced PostgreSQL query bottlenecks and optimized database connection pooling, slashing p95 latency from 680ms to 78ms.

EDUCATION
B.Tech in Computer Science & Engineering | National Institute of Technology (NIT), Trichy | 2015 - 2019
CGPA: 8.8 / 10.0
`;

export default function ResumeUploader({ 
  onParsed, 
  targetRole, 
  setTargetRole, 
  groqKey,
  onScrapeForResume = null
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = async (file) => {
    if (!file) return;
    setFileName(file.name);
    setError(null);
    setUploading(true);

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('targetRole', targetRole || 'Software Professional');

    try {
      const headers = {};
      if (groqKey) {
        headers['x-groq-api-key'] = groqKey;
      }

      const res = await apiFetch('/api/resume/upload', {
        method: 'POST',
        headers,
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload and parse resume');
      }

      onParsed(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSampleResume = async () => {
    setFileName('Sample_Senior_FullStack_Resume.pdf');
    setError(null);
    setUploading(true);

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (groqKey) {
        headers['x-groq-api-key'] = groqKey;
      }

      const res = await apiFetch('/api/resume/parse-text', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          text: SAMPLE_RESUME_TEXT,
          targetRole: targetRole || 'Senior Full Stack Engineer'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to parse sample resume');
      }

      onParsed(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card" style={{
      padding: '28px',
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--border-medium)',
      backgroundColor: 'var(--bg-card)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} color="var(--accent-emerald)" />
            <span>Upload Resume for Instant ATS Diagnostic</span>
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Extracts skills, work experience, projects, and calculates exact ATS match score.
          </p>
        </div>

        {/* Target Role input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Target Role:</label>
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g. Senior Full Stack Engineer"
            style={{
              padding: '8px 12px',
              fontSize: '0.85rem',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              outline: 'none',
              width: '210px'
            }}
          />
        </div>
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0]);
          }
        }}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${isDragging ? 'var(--accent-emerald)' : 'var(--border-medium)'}`,
          backgroundColor: isDragging ? 'var(--accent-emerald-soft)' : 'var(--bg-elevated)',
          borderRadius: 'var(--radius-lg)',
          padding: '40px 20px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          marginBottom: '16px'
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt"
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileChange(e.target.files[0]);
            }
          }}
        />

        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          backgroundColor: 'var(--accent-emerald-soft)',
          color: 'var(--accent-emerald)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 14px auto'
        }}>
          {uploading ? (
            <RefreshCw size={26} className="spin-animation" />
          ) : (
            <UploadCloud size={28} />
          )}
        </div>

        <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '4px' }}>
          {uploading ? 'Extracting & Scanning Resume with AI...' : 'Click to upload or drag & drop resume'}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Supports PDF, Word (.docx), or Text files (Max 10MB)
        </div>

        {fileName && !uploading && (
          <div style={{
            marginTop: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.82rem',
            color: 'var(--accent-emerald)'
          }}>
            <CheckCircle2 size={14} />
            <span>{fileName}</span>
          </div>
        )}
      </div>

      {/* Error Notice */}
      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 14px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--accent-rose-soft)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          color: 'var(--accent-rose)',
          fontSize: '0.85rem',
          marginBottom: '16px'
        }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Alternative Actions: Sample Loader & Manual Builder Note */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        paddingTop: '8px',
        borderTop: '1px solid var(--border-subtle)'
      }}>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          Don't have a resume handy? Test right away with a pre-filled profile:
        </div>

        <button
          type="button"
          onClick={handleSampleResume}
          disabled={uploading}
          className="btn btn-secondary btn-sm"
          style={{ gap: '6px' }}
        >
          <Wand2 size={14} color="var(--accent-amber)" />
          <span>Load Sample Senior Profile</span>
        </button>
      </div>
    </div>
  );
}
