import React from 'react';

export default class ErrorBoundary extends React.Component {
  state = { error: null, info: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    console.error('Dashboard error:', error, info);
  }

  handleReset = () => {
    try { localStorage.removeItem('utm-looker-v2'); } catch {}
    this.setState({ error: null, info: null });
    window.location.reload();
  };

  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, fontFamily: "'DM Sans', sans-serif" }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 40, maxWidth: 480, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #fee2e2' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 8 }}>Dashboard crashed</h2>
            <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 24 }}>
              This usually happens when saved data becomes incompatible after an update.
              Resetting will clear saved state and reload with defaults.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={this.handleReset}
                style={{ padding: '8px 20px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              >
                Reset & Reload
              </button>
              <button
                onClick={() => this.setState({ error: null })}
                style={{ padding: '8px 20px', background: '#f9fafb', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
