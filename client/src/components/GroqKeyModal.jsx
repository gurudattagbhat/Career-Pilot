import React, { useState } from 'react';
import { Key, Sparkles, CheckCircle2, AlertCircle, X, ExternalLink, Zap } from 'lucide-react';

export default function GroqKeyModal({ isOpen, onClose, currentKey, onSaveKey }) {
  const [keyInput, setKeyInput] = useState(currentKey || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!isOpen) return null;

  const handleTestKey = async () => {
    if (!keyInput.trim()) {
      setTestResult({ valid: false, error: 'Please enter a key before testing' });
      return;
    }
    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/ai/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: keyInput.trim() })
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err) {
      setTestResult({ valid: false, error: 'Network error communicating with server' });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    onSaveKey(keyInput.trim());
    onClose();
  };

  const handleClear = () => {
    setKeyInput('');
    onSaveKey('');
    setTestResult(null);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div className="card" style={{
        maxWidth: '560px',
        width: '100%',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-xl)',
        padding: '28px',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            color: 'var(--text-muted)',
            padding: '6px',
            borderRadius: 'var(--radius-sm)'
          }}
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            backgroundColor: 'var(--accent-emerald-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-emerald)'
          }}>
            <Sparkles size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '2px' }}>Groq AI Engine Configuration</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Powers LLaMA-3.3 70B resume analysis, ATS scoring, and interview prep.
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div style={{
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          marginBottom: '20px',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontWeight: 600 }}>
            <Zap size={15} color="var(--accent-amber)" />
            <span>Lightning-Fast & Ultra-Precise</span>
          </div>
          <p>
            Your Groq API key stays safe in your browser session or backend environment. Don't have one? Get a free key in 30 seconds:
          </p>
          <a 
            href="https://console.groq.com/keys" 
            target="_blank" 
            rel="noreferrer"
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '4px', 
              color: 'var(--accent-emerald)', 
              fontWeight: 600,
              marginTop: '4px'
            }}
          >
            Open Groq Cloud Console <ExternalLink size={13} />
          </a>
        </div>

        {/* Key Input */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-primary)' }}>
            Groq API Key (starts with <code>gsk_...</code>)
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="password"
              placeholder="gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              value={keyInput}
              onChange={(e) => {
                setKeyInput(e.target.value);
                setTestResult(null);
              }}
              style={{
                width: '100%',
                padding: '12px 14px',
                paddingLeft: '38px',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                outline: 'none',
                color: 'var(--text-primary)'
              }}
            />
            <Key size={17} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
          </div>
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '18px',
            backgroundColor: testResult.valid ? 'var(--accent-emerald-soft)' : 'var(--accent-rose-soft)',
            border: `1px solid ${testResult.valid ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
            color: testResult.valid ? 'var(--accent-emerald)' : 'var(--accent-rose)'
          }}>
            {testResult.valid ? (
              <>
                <CheckCircle2 size={16} />
                <span>Valid Groq key! Connected with access to LLaMA-3.3 models.</span>
              </>
            ) : (
              <>
                <AlertCircle size={16} />
                <span>{testResult.error || 'Invalid API key or network error'}</span>
              </>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
          <div>
            {currentKey && (
              <button 
                onClick={handleClear}
                className="btn btn-secondary btn-sm"
                style={{ color: 'var(--accent-rose)' }}
              >
                Remove Key
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleTestKey}
              disabled={testing || !keyInput}
              className="btn btn-secondary"
            >
              {testing ? 'Testing...' : 'Test Connection'}
            </button>
            <button
              onClick={handleSave}
              className="btn btn-primary"
            >
              Save Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
