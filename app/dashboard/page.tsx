"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/app/store/authStore";

const pageStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .dash-header {
    margin-bottom: 2rem;
    animation: fadeIn 0.4s ease both;
  }

  .dash-title {
    font-family: var(--font-display, 'DM Serif Display', serif);
    font-size: 2rem;
    margin: 0 0 0.5rem 0;
    color: var(--dash-text);
  }

  .dash-subtitle {
    font-size: 14px;
    color: var(--dash-text-muted);
    margin: 0;
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .metric-card {
    background: var(--dash-surface);
    border: 1px solid var(--dash-border);
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 0 4px 20px rgba(0,0,0,0.03);
    display: flex;
    flex-direction: column;
    animation: fadeIn 0.5s ease both;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .metric-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0,0,0,0.06);
  }

  .metric-card:nth-child(1) { animation-delay: 0.05s; }
  .metric-card:nth-child(2) { animation-delay: 0.1s; }
  .metric-card:nth-child(3) { animation-delay: 0.15s; }
  .metric-card:nth-child(4) { animation-delay: 0.2s; }

  .metric-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .metric-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--dash-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .metric-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: var(--dash-accent-light);
    color: var(--dash-accent);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .metric-icon svg { width: 18px; height: 18px; }

  .metric-value {
    font-size: 2rem;
    font-weight: 600;
    color: var(--dash-text);
    margin: 0 0 0.5rem 0;
    line-height: 1;
  }

  .metric-trend {
    font-size: 12px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .trend-up { color: var(--dash-accent); }
  .trend-down { color: #C0392B; }

  .bento-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 1.5rem;
  }
  @media (max-width: 1024px) { .bento-grid { grid-template-columns: 1fr; } }

  .bento-card {
    background: var(--dash-surface);
    border: 1px solid var(--dash-border);
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 0 4px 20px rgba(0,0,0,0.03);
    animation: fadeIn 0.6s ease both;
    animation-delay: 0.25s;
  }

  .card-title {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 1.5rem 0;
    color: var(--dash-text);
  }

  /* Pipeline Bar */
  .pipeline-wrap { width: 100%; }
  .pipeline-bar {
    display: flex;
    height: 24px;
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 1rem;
  }
  .pipe-seg {
    height: 100%;
    transition: width 1s cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  .pipe-lead { background: #3498DB; width: 30%; }
  .pipe-qual { background: #F39C12; width: 25%; }
  .pipe-prop { background: #9B59B6; width: 20%; }
  .pipe-won  { background: var(--dash-accent); width: 25%; }

  .pipe-legend {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
    font-size: 12px;
  }
  .legend-item {
    display: flex; align-items: center; gap: 6px; color: var(--dash-text-muted);
  }
  .dot { width: 8px; height: 8px; border-radius: 50%; }

  /* Activity Feed */
  .feed-list {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }
  .feed-item {
    display: flex;
    gap: 12px;
    position: relative;
  }
  .feed-item:not(:last-child)::after {
    content: ''; position: absolute;
    left: 17px; top: 36px; bottom: -12px;
    width: 2px; background: var(--dash-border);
  }
  .feed-icon {
    width: 36px; height: 36px;
    border-radius: 50%;
    background: var(--dash-surface-hover);
    border: 1px solid var(--dash-border);
    display: flex; align-items: center; justify-content: center;
    color: var(--dash-text-muted);
    z-index: 2;
  }
  .feed-content { flex: 1; padding-top: 4px; }
  .feed-header {
    display: flex; justify-content: space-between; margin-bottom: 2px;
  }
  .feed-subject { font-size: 13px; font-weight: 600; color: var(--dash-text); }
  .feed-time { font-size: 11px; color: var(--dash-text-muted); }
  .feed-desc { font-size: 12px; color: var(--dash-text-muted); line-height: 1.4; }
`;

export default function DashboardOverview() {
  const { user } = useAuthStore();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.company_id) return;
    
    fetch(`/api/dashboard?companyId=${user.company_id}`)
      .then(res => res.json())
      .then(json => {
        if (json.metrics) setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error("Dashboard DB fetch error:", err);
        setLoading(false);
      });
  }, [user]);

  // Fallbacks while loading or if data fails
  const MOCK_METRICS = data?.metrics || {
    contacts: 0,
    activeOps: 0,
    pipelineVal: 0,
    openTickets: 0
  };

  const ACTIVITIES = data?.activities || [];
  
  const STAGES = data?.pipelineBreakdown || {
    leadPercent: 30,
    qualPercent: 25,
    propPercent: 20,
    wonPercent: 25
  };

  if (loading) {
    return <div style={{ padding: '2rem', color: 'var(--dash-text-muted)' }}>Loading live database metrics...</div>;
  }

  return (
    <>
      <style>{pageStyles}</style>
      
      <header className="dash-header">
        <h1 className="dash-title">Good afternoon, {user?.employee_id || "User"}</h1>
        <p className="dash-subtitle">Here&apos;s what&apos;s happening in your workspace today.</p>
      </header>

      <section className="metrics-grid">
        {/* Pipeline Value */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Pipeline Value</span>
            <div className="metric-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
          </div>
          <h2 className="metric-value">${(MOCK_METRICS.pipelineVal / 1000).toFixed(0)}k</h2>
          <div className="metric-trend trend-up">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
            Live from Database
          </div>
        </div>

        {/* Active Opps */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Active Deals</span>
            <div className="metric-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            </div>
          </div>
          <h2 className="metric-value">{MOCK_METRICS.activeOps}</h2>
          <div className="metric-trend trend-up">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
            Live from Database
          </div>
        </div>

        {/* Total Contacts */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Total Contacts</span>
            <div className="metric-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
          </div>
          <h2 className="metric-value">{MOCK_METRICS.contacts}</h2>
          <div className="metric-trend trend-up">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
            Live from Database
          </div>
        </div>

        {/* Tickets */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Open Tickets</span>
            <div className="metric-icon" style={{ color: '#C0392B', background: '#FDEDEC' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
            </div>
          </div>
          <h2 className="metric-value">{MOCK_METRICS.openTickets}</h2>
          <div className="metric-trend trend-down">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline><polyline points="16 17 22 17 22 11"></polyline></svg>
            Live from Database
          </div>
        </div>
      </section>

      <section className="bento-grid">
        {/* Pipeline Chart */}
        <div className="bento-card">
          <h3 className="card-title">Opportunity Pipeline by Stage</h3>
          <div className="pipeline-wrap">
            <div className="pipeline-bar">
              <div className="pipe-seg pipe-lead" style={{ width: `${STAGES.leadPercent}%` }} title={`Leads: ${STAGES.leadPercent}%`}></div>
              <div className="pipe-seg pipe-qual" style={{ width: `${STAGES.qualPercent}%` }} title={`Qualified: ${STAGES.qualPercent}%`}></div>
              <div className="pipe-seg pipe-prop" style={{ width: `${STAGES.propPercent}%` }} title={`Proposal: ${STAGES.propPercent}%`}></div>
              <div className="pipe-seg pipe-won"  style={{ width: `${STAGES.wonPercent}%` }} title={`Closed Won: ${STAGES.wonPercent}%`}></div>
            </div>
            <div className="pipe-legend">
              <div className="legend-item"><div className="dot" style={{background: '#3498DB'}}></div> Lead ({STAGES.leadPercent}%)</div>
              <div className="legend-item"><div className="dot" style={{background: '#F39C12'}}></div> Qualified ({STAGES.qualPercent}%)</div>
              <div className="legend-item"><div className="dot" style={{background: '#9B59B6'}}></div> Proposal ({STAGES.propPercent}%)</div>
              <div className="legend-item"><div className="dot" style={{background: 'var(--dash-accent)'}}></div> Closed Won ({STAGES.wonPercent}%)</div>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--dash-text-muted)', margin: '1.5rem 0 0 0', lineHeight: 1.5 }}>
            You have {MOCK_METRICS.activeOps} active deals in motion across your funnel tracking against Live Records.
          </p>
        </div>

        {/* Activity Feed */}
        <div className="bento-card">
          <h3 className="card-title">Recent Activity</h3>
          <div className="feed-list">
            {ACTIVITIES.map((act: any) => (
              <div className="feed-item" key={act.id}>
                <div className="feed-icon" style={{ color: act.color, borderColor: `${act.color}40`, background: `${act.color}10` }}>
                  {act.type === 'call' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>}
                  {act.type === 'email' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>}
                  {act.type === 'stage_change' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                  {act.type === 'ticket' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>}
                  {act.type === 'note' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>}
                </div>
                <div className="feed-content">
                  <div className="feed-header">
                    <span className="feed-subject">{act.subject}</span>
                    <span className="feed-time">{act.time}</span>
                  </div>
                  <div className="feed-desc">{act.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
