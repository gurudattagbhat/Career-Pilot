import React, { useState } from 'react';
import { 
  Kanban, 
  ExternalLink, 
  Trash2, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Award, 
  Plus, 
  Building2, 
  Edit3 
} from 'lucide-react';

export default function ApplicationTracker({
  applications = [],
  onUpdateStatus,
  onDeleteApplication,
  onAddApplication
}) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newJob, setNewJob] = useState({
    jobTitle: '',
    company: '',
    location: '',
    salary: '',
    applyUrl: '',
    status: 'applied',
    notes: ''
  });

  const statuses = [
    { key: 'all', label: 'All Jobs' },
    { key: 'applied', label: 'Applied' },
    { key: 'interviewing', label: 'Interviewing' },
    { key: 'offered', label: 'Offer Received' },
    { key: 'rejected', label: 'Archived' }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'offered':
        return <span className="badge badge-emerald">🎉 Offer Received</span>;
      case 'interviewing':
        return <span className="badge badge-amber">⚡ Interviewing</span>;
      case 'applied':
        return <span className="badge badge-neutral">📤 Applied</span>;
      case 'rejected':
        return <span className="badge badge-rose">Archived</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  const filteredApps = filterStatus === 'all' 
    ? applications 
    : applications.filter(a => a.status === filterStatus);

  const stats = {
    total: applications.length,
    interviewing: applications.filter(a => a.status === 'interviewing').length,
    offered: applications.filter(a => a.status === 'offered').length
  };

  const handleCreateCustom = (e) => {
    e.preventDefault();
    if (!newJob.jobTitle || !newJob.company) return;
    onAddApplication(newJob);
    setNewJob({ jobTitle: '', company: '', location: '', salary: '', applyUrl: '', status: 'applied', notes: '' });
    setShowAddModal(false);
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', paddingBottom: '40px' }} className="animate-fade-in">
      {/* Tracker Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Kanban size={26} color="var(--accent-emerald)" />
            <span>Job Application Tracker</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Monitor and organize every position you've applied to with direct links and status progression.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
          style={{ gap: '6px' }}
        >
          <Plus size={16} />
          <span>Add Custom Application</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-emerald)' }}>
            <Clock size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{stats.total}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Total Tracked</div>
          </div>
        </div>

        <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--accent-amber-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-amber)' }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-amber)' }}>{stats.interviewing}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>In Interview Stage</div>
          </div>
        </div>

        <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--accent-emerald-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-emerald)' }}>
            <Award size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>{stats.offered}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Offers Extended</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {statuses.map(st => (
          <button
            key={st.key}
            onClick={() => setFilterStatus(st.key)}
            className="btn btn-sm"
            style={{
              backgroundColor: filterStatus === st.key ? 'var(--accent-emerald)' : 'var(--bg-card)',
              color: filterStatus === st.key ? '#fff' : 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)'
            }}
          >
            {st.label}
          </button>
        ))}
      </div>

      {/* Application Cards List */}
      {filteredApps.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <Kanban size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px auto' }} />
          <h4 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>No Applications in this Category</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Click "Direct Apply" or "Track Application" on any job card to automatically add it here!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredApps.map(app => (
            <div 
              key={app.id}
              className="card"
              style={{
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '280px' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--bg-elevated)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-emerald)',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <Building2 size={20} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{app.jobTitle}</h4>
                    {getStatusBadge(app.status)}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <strong>{app.company}</strong>
                    {app.location && <span>• {app.location}</span>}
                    {app.salary && <span>• {app.salary}</span>}
                  </div>
                </div>
              </div>

              {/* Status Selector & Date */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={13} />
                  <span>Applied {new Date(app.appliedDate).toLocaleDateString()}</span>
                </div>

                <select
                  value={app.status}
                  onChange={(e) => onUpdateStatus(app.id, { status: e.target.value })}
                  style={{
                    padding: '8px 12px',
                    fontSize: '0.82rem',
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="applied">Applied</option>
                  <option value="interviewing">Interviewing</option>
                  <option value="offered">Offer Received</option>
                  <option value="rejected">Archived</option>
                </select>

                {app.applyUrl && (
                  <a
                    href={app.applyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ gap: '4px' }}
                    title="View job post"
                  >
                    <span>View Link</span>
                    <ExternalLink size={12} />
                  </a>
                )}

                <button
                  onClick={() => onDeleteApplication(app.id)}
                  style={{ color: 'var(--text-muted)', padding: '6px' }}
                  title="Remove from tracker"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Custom Application Modal */}
      {showAddModal && (
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
          zIndex: 120,
          padding: '20px'
        }}>
          <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '24px', borderRadius: 'var(--radius-xl)' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Add Tracked Application</h3>
            <form onSubmit={handleCreateCustom} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Job Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Frontend Engineer"
                  value={newJob.jobTitle}
                  onChange={(e) => setNewJob({ ...newJob, jobTitle: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Google or YC Startup"
                  value={newJob.company}
                  onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Job Direct Link</label>
                <input
                  type="url"
                  placeholder="https://company.com/jobs/..."
                  value={newJob.applyUrl}
                  onChange={(e) => setNewJob({ ...newJob, applyUrl: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Location</label>
                  <input
                    type="text"
                    placeholder="Remote / City"
                    value={newJob.location}
                    onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Status</label>
                  <select
                    value={newJob.status}
                    onChange={(e) => setNewJob({ ...newJob, status: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                  >
                    <option value="applied">Applied</option>
                    <option value="interviewing">Interviewing</option>
                    <option value="offered">Offer Received</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save to Tracker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
