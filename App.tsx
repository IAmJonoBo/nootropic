import React, { useEffect, useState } from 'react'
import './App.css'

interface Capability {
  id: string;
  name: string;
  description?: string;
  health?: string;
}

interface Plugin {
  name: string;
  type?: string;
  entry?: string;
  meta?: Record<string, unknown>;
}

interface PluginFeedback {
  rating: number;
  review: string;
  submittedAt: string;
}

const API_BASE = '';

function UsageHintsPanel() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: '1px solid #ccc', borderRadius: 8, margin: '16px 0', background: '#f9f9f9', padding: 16 }}>
      <button onClick={() => setOpen((o: unknown) => !o)} style={{ fontWeight: 'bold', fontSize: 16, background: 'none', border: 'none', cursor: 'pointer' }}>
        {open ? '▼' : '▶'} LLM/AI Usage Hints & Prompt Examples
      </button>
      {open && (
        <div style={{ marginTop: 12 }}>
          <ul>
            <li>This dashboard is registry-driven and outputs structured, machine-readable data for LLM/AI workflows.</li>
            <li>All capabilities and plugins are discoverable via the /capabilities and /plugins endpoints.</li>
            <li>Health/status, onboarding checklist, and context will be surfaced for agentic workflows.</li>
          </ul>
          <b>Prompt Examples:</b>
          <ul>
            <li>"List all capabilities with health status and description."</li>
            <li>"Show plugins with the most recent feedback or rating."</li>
            <li>"What onboarding steps are required for a new contributor?"</li>
            <li>"Summarize technical debt hotspots from the dashboard."</li>
          </ul>
          <div style={{ marginTop: 8 }}>
            See <a href="https://github.com/jonathanbotha/nootropic#capabilitiesplugins-web-ui-react" target="_blank" rel="noopener noreferrer">README</a> and <a href="https://github.com/jonathanbotha/nootropic/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer">CONTRIBUTING.md</a> for more LLM/AI usage hints and extension tips.
          </div>
        </div>
      )}
    </div>
  );
}

function FeedbackSection({ pluginName }: { pluginName: string }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [feedbacks, setFeedbacks] = useState<PluginFeedback[]>([]);
  const [aggregate, setAggregate] = useState<{ averageRating: number; reviewCount: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      setError(null);
      Promise.all([
        fetch(`/plugin-feedback/${pluginName}`).then(r => r.ok ? r.json() : []),
        fetch(`/plugin-feedback/${pluginName}/aggregate`).then(r => r.ok ? r.json() : null)
      ])
        .then(([fb, agg]) => {
          setFeedbacks(Array.isArray(fb) ? fb : []);
          setAggregate(agg && typeof agg.averageRating === 'number' ? agg : null);
        })
        .catch(() => setError('Could not load feedback.'))
        .finally(() => setLoading(false));
    }
  }, [open, pluginName]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setError('Please select a rating (1-5 stars).');
      return;
    }
    if (!review.trim()) {
      setError('Please enter a short review.');
      return;
    }
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      const res = await fetch(`/plugin-feedback/${pluginName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment: review })
      });
      if (!res.ok) throw new Error('Failed to submit feedback');
      setSuccess(true);
      setRating(0);
      setReview('');
      // Refresh feedbacks and aggregate
      const [fb, agg] = await Promise.all([
        fetch(`/plugin-feedback/${pluginName}`).then(r => r.ok ? r.json() : []),
        fetch(`/plugin-feedback/${pluginName}/aggregate`).then(r => r.ok ? r.json() : null)
      ]);
      setFeedbacks(Array.isArray(fb) ? fb : []);
      setAggregate(agg && typeof agg.averageRating === 'number' ? agg : null);
      setTimeout(() => setSuccess(false), 2000);
    } catch {
      setError('Failed to submit feedback.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 2 }}>Feedback for <span style={{ color: '#005' }}>{pluginName}</span></div>
      <button onClick={() => setOpen((o: unknown) => !o)} style={{ fontSize: 14, padding: '2px 8px', borderRadius: 4, border: '1px solid #888', background: '#f5f5f5', cursor: 'pointer' }}>
        {open ? 'Hide Feedback' : 'Leave Feedback'}
      </button>
      {open && (
        <div style={{ marginTop: 8 }}>
          {aggregate && (
            <div style={{ marginBottom: 8, fontSize: 13, color: '#555' }}>
              <b>Average Rating:</b> {aggregate.averageRating.toFixed(2)} / 5 &nbsp;|&nbsp; <b>Reviews:</b> {aggregate.reviewCount}
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ background: '#f9f9f9', padding: 12, borderRadius: 8, border: '1px solid #eee' }}>
            <div>
              <label>Rating: </label>
              {[1,2,3,4,5].map((star) => (
                <span key={star} style={{ cursor: 'pointer', color: rating >= star ? '#f5b301' : '#ccc', fontSize: 20 }} onClick={(e: React.MouseEvent) => { e.preventDefault(); setRating(star); }} title={`${star} star${star > 1 ? 's' : ''}`}>★</span>
              ))}
            </div>
            <div style={{ marginTop: 8 }}>
              <label>Review: </label>
              <input type="text" value={review} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReview(e.target.value)} style={{ width: 220, padding: 4, borderRadius: 4, border: '1px solid #ccc' }} maxLength={120} placeholder="Short review..." />
            </div>
            <button type="submit" style={{ marginTop: 8, padding: '2px 12px', borderRadius: 4, border: '1px solid #888', background: '#e0ffe0', cursor: 'pointer' }} disabled={loading}>Submit</button>
            {error && <div style={{ color: 'red', marginTop: 4 }}>{error}</div>}
            {success && <div style={{ color: 'green', marginTop: 4 }}>Feedback submitted!</div>}
            <div style={{ fontSize: 12, color: '#888', marginTop: 8 }}>
              LLM/AI hint: You can submit plugin feedback, ratings, and reviews via the API or UI. See pluginFeedback API for automation.
            </div>
          </form>
          {loading && <div style={{ color: '#888', marginTop: 4 }}>Loading...</div>}
          {feedbacks.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <b>Recent Feedback:</b>
              <ul style={{ paddingLeft: 18 }}>
                {feedbacks.map((fb: PluginFeedback, i: number) => (
                  <li key={i} style={{ marginBottom: 4 }}>
                    <span style={{ color: '#f5b301' }}>{'★'.repeat(fb.rating)}</span>{' '}
                    <span>{fb.review || ''}</span>{' '}
                    <span style={{ color: '#888', fontSize: 11 }}>({new Date(fb.submittedAt || '').toLocaleString()})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function hasHealth(meta: unknown): meta is { health: string } {
  return typeof meta === 'object' && meta !== null && 'health' in meta && typeof (meta as { health: unknown }).health === 'string';
}

function HealthStatusPanel({ capabilities, plugins }: { capabilities: Capability[]; plugins: Plugin[] }) {
  const healthyCaps = capabilities.filter(c => c.health === 'healthy').length;
  const unhealthyCaps = capabilities.filter(c => c.health && c.health !== 'healthy').length;
  const healthyPlugs = plugins.filter(p => hasHealth(p.meta) && p.meta.health === 'healthy').length;
  const unhealthyPlugs = plugins.filter(p => hasHealth(p.meta) && p.meta.health !== 'healthy').length;
  return (
    <div style={{ border: '1px solid #cce5cc', borderRadius: 8, margin: '16px 0', background: '#f6fff6', padding: 16 }}>
      <b>Health/Status Dashboard</b>
      <div style={{ marginTop: 8 }}>
        <span style={{ color: 'green', fontWeight: 500 }}>● {healthyCaps}</span> healthy capabilities,
        <span style={{ color: 'red', fontWeight: 500, marginLeft: 12 }}>● {unhealthyCaps}</span> unhealthy capabilities
      </div>
      <div>
        <span style={{ color: 'green', fontWeight: 500 }}>● {healthyPlugs}</span> healthy plugins,
        <span style={{ color: 'red', fontWeight: 500, marginLeft: 12 }}>● {unhealthyPlugs}</span> unhealthy plugins
      </div>
      <div style={{ fontSize: 12, color: '#888', marginTop: 8 }}>
        LLM/AI hint: Health/status is surfaced for all capabilities/plugins. Use this for prioritization, triage, and automation.
      </div>
    </div>
  );
}

function OnboardingChecklistPanel() {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (open && !content && !loading) {
      setLoading(true);
      fetch('/.nootropic-cache/onboarding-checklist.md')
        .then(r => r.ok ? r.text() : Promise.reject('Not found'))
        .then(setContent)
        .catch(() => setError('Could not load onboarding checklist.'))
        .finally(() => setLoading(false));
    }
  }, [open, content, loading]);
  return (
    <div style={{ border: '1px solid #cce', borderRadius: 8, margin: '16px 0', background: '#f8faff', padding: 16 }}>
      <button onClick={() => setOpen((o: unknown) => !o)} style={{ fontWeight: 'bold', fontSize: 16, background: 'none', border: 'none', cursor: 'pointer' }}>
        {open ? '▼' : '▶'} Onboarding Checklist
      </button>
      {open && (
        <div style={{ marginTop: 12 }}>
          {loading ? 'Loading...' : error ? <span style={{ color: 'red' }}>{error}</span> : <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{content}</pre>}
          <div style={{ fontSize: 12, color: '#888', marginTop: 8 }}>
            LLM/AI hint: The onboarding checklist is auto-generated and kept in sync with docs and registry. Use for onboarding, automation, and troubleshooting.
          </div>
        </div>
      )}
    </div>
  );
}

interface RecentMessage { timestamp: string; type: string; message: string; }
function RecentMessagesPanel() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<RecentMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (open && messages.length === 0 && !loading) {
      setLoading(true);
      fetch('/.nootropic-cache/recent-messages.json')
        .then(r => r.ok ? r.json() : Promise.reject('Not found'))
        .then(setMessages)
        .catch(() => setError('Could not load recent messages.'))
        .finally(() => setLoading(false));
    }
  }, [open, messages.length, loading]);
  return (
    <div style={{ border: '1px solid #cce', borderRadius: 8, margin: '16px 0', background: '#f8faff', padding: 16 }}>
      <button onClick={() => setOpen((o: unknown) => !o)} style={{ fontWeight: 'bold', fontSize: 16, background: 'none', border: 'none', cursor: 'pointer' }}>
        {open ? '▼' : '▶'} Recent Agent Messages/Context
      </button>
      {open && (
        <div style={{ marginTop: 12 }}>
          {loading ? 'Loading...' : error ? <span style={{ color: 'red' }}>{error}</span> : (
            <ul style={{ paddingLeft: 18 }}>
              {messages.map((m: RecentMessage, i: number) => (
                <li key={i}>
                  <span style={{ color: '#888', fontSize: 12 }}>{new Date(m.timestamp).toLocaleString()}</span>{' '}
                  <b>{m.type}:</b> {m.message}
                </li>
              ))}
            </ul>
          )}
          <div style={{ fontSize: 12, color: '#888', marginTop: 8 }}>
            LLM/AI hint: Recent agent messages/context are surfaced for LLM/agent workflows. Use for context window, debugging, and automation.
          </div>
        </div>
      )}
    </div>
  );
}

function AdvancedSearchPanel({ query, setQuery }: { query: string; setQuery: (q: string) => void }) {
  return (
    <div style={{ margin: '16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
      <input
        type="text"
        value={query}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
        placeholder="Search capabilities or plugins..."
        style={{ padding: 6, borderRadius: 6, border: '1px solid #bbb', width: 320 }}
      />
      {query && (
        <button onClick={() => setQuery('')} style={{ padding: '2px 10px', borderRadius: 4, border: '1px solid #888', background: '#f5f5f5', cursor: 'pointer' }}>Clear</button>
      )}
      <span style={{ fontSize: 12, color: '#888', marginLeft: 8 }}>
        LLM/AI hint: Search is fuzzy and case-insensitive. Use for filtering, triage, and automation.
      </span>
    </div>
  );
}

function App() {
  const [capabilities, setCapabilities] = useState<Capability[]>([]);
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [pluginAggregates, setPluginAggregates] = useState<Record<string, { averageRating: number; reviewCount: number }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'reviews'>('name');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const capRes = await fetch(`${API_BASE}/capabilities`);
        const caps = await capRes.json();
        setCapabilities(Array.isArray(caps) ? caps : caps.capabilities || []);
        const pluginRes = await fetch(`${API_BASE}/plugins`);
        const plugs = await pluginRes.json();
        setPlugins(Array.isArray(plugs) ? plugs : plugs.plugins || []);
        // Fetch aggregates for all plugins
        const aggEntries = await Promise.all((Array.isArray(plugs) ? plugs : plugs.plugins || []).map(async (plg: Plugin) => {
          const agg = await fetch(`/plugin-feedback/${plg.name}/aggregate`).then(r => r.ok ? r.json() : null);
          return [plg.name, agg && typeof agg.averageRating === 'number' ? agg : { averageRating: 0, reviewCount: 0 }];
        }));
        setPluginAggregates(Object.fromEntries(aggEntries));
      } catch {
        setError('Failed to fetch data from API. Is the contextRealtimeServer running?');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  function fuzzyMatch(text: string, query: string) {
    return text.toLowerCase().includes(query.toLowerCase());
  }

  const filteredCapabilities = searchQuery
    ? capabilities.filter((c: Capability) => fuzzyMatch(c.name, searchQuery) ||
  (c.description && fuzzyMatch(c.description, searchQuery))
      )
    : capabilities;
  let filteredPlugins = searchQuery
    ? plugins.filter((p: Plugin) => fuzzyMatch(p.name, searchQuery) ||
  (p.type && fuzzyMatch(p.type, searchQuery)) ||
  (typeof p.meta?.description === 'string' && fuzzyMatch(p.meta.description, searchQuery))
      )
    : plugins;

  // Sort plugins by selected criteria
  filteredPlugins = [...filteredPlugins].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'rating') return (pluginAggregates[b.name]?.averageRating || 0) - (pluginAggregates[a.name]?.averageRating || 0);
    if (sortBy === 'reviews') return (pluginAggregates[b.name]?.reviewCount || 0) - (pluginAggregates[a.name]?.reviewCount || 0);
    return 0;
  });

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <UsageHintsPanel />
      <HealthStatusPanel capabilities={capabilities} plugins={plugins} />
      <AdvancedSearchPanel query={searchQuery} setQuery={setSearchQuery} />
      <div style={{ margin: '16px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <label htmlFor="plugin-sort" style={{ fontWeight: 500 }}>Sort plugins by:</label>
        <select id="plugin-sort" value={sortBy} onChange={e => setSortBy(e.target.value as 'name' | 'rating' | 'reviews')} style={{ padding: 4, borderRadius: 4, border: '1px solid #bbb' }}>
          <option value="name">Name (A-Z)</option>
          <option value="rating">Average Rating</option>
          <option value="reviews">Review Count</option>
        </select>
        <span style={{ fontSize: 12, color: '#888' }}>
          LLM/AI hint: Sort and filter plugins for discovery, triage, and automation.
        </span>
      </div>
      <OnboardingChecklistPanel />
      <RecentMessagesPanel />
      <h1>nootropic Capabilities & Plugins Dashboard</h1>
      <p>
        Discover, search, and view all capabilities and plugins. Health/status, onboarding, and feedback are surfaced for agentic workflows.
      </p>
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <h2>Capabilities</h2>
          <ul>
            {filteredCapabilities.map((cap: Capability) => <li key={cap.id} style={{ marginBottom: 8 }}>
              <span style={{ color: cap.health === 'healthy' ? 'green' : cap.health ? 'red' : '#888', fontWeight: 700, marginRight: 6 }}>
                ●
              </span>
              <b>{cap.name}</b> 
              {((cap as unknown) as Record<string, string | undefined>)['description'] && <span style={{ color: '#888' }}>({String(((cap as unknown) as Record<string, string | undefined>)['description'])})</span>}
              {((cap as unknown) as Record<string, string | undefined>)['health'] && <span style={{ color: ((cap as unknown) as Record<string, string | undefined>)['health'] === 'healthy' ? 'green' : 'red', marginLeft: 8 }}>{String(((cap as unknown) as Record<string, string | undefined>)['health'])}</span>}
              {!((cap as unknown) as Record<string, string | undefined>)['health'] && <span style={{ color: '#888', marginLeft: 8 }}>unknown</span>}
            </li>)}
          </ul>
          <h2>Plugins</h2>
          <ul>
            {filteredPlugins.map((plg: Plugin) => {
              const health = typeof plg.meta?.health === 'string' ? plg.meta.health : undefined;
              const agg = pluginAggregates[plg.name];
              return (
                <li key={plg.name} style={{ marginBottom: 12 }}>
                  <span style={{ color: health === 'healthy' ? 'green' : health ? 'red' : '#888', fontWeight: 700, marginRight: 6 }}>
                    ●
                  </span>
                  <b>{plg.name}</b> {plg.type && <span style={{ color: '#888' }}>({plg.type})</span>}
                  {typeof plg.meta?.description === 'string' && (
                    <span style={{ color: '#888', marginLeft: 8 }}>{plg.meta && String(((plg.meta as unknown) as Record<string, string | undefined>)['description'])}</span>
                  )}
                  {agg && (
                    <span style={{ color: '#f5b301', marginLeft: 8 }}>
                      ★ {agg.averageRating.toFixed(2)} ({agg.reviewCount} reviews)
                    </span>
                  )}
                  {health && <span style={{ color: health === 'healthy' ? 'green' : 'red', marginLeft: 8 }}>{plg.meta && String(((plg.meta as unknown) as Record<string, string | undefined>)['health'])}</span>}
                  {!health && <span style={{ color: '#888', marginLeft: 8 }}>unknown</span>}
                  <FeedbackSection pluginName={plg.name} />
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

export default App
