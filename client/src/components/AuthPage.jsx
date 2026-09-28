import React from 'react';
import AuthModal from './AuthModal';

export default function AuthPage({ initialMode = 'login', onAuthSuccess, onBackToJobs }) {
  return (
    <div style={{
      minHeight: 'calc(100vh - 70px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 16px',
      position: 'relative'
    }}>
      {/* Embedded Auth Card */}
      <AuthModal
        isOpen={true}
        onClose={onBackToJobs}
        initialMode={initialMode}
        onAuthSuccess={onAuthSuccess}
      />
    </div>
  );
}
