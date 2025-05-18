import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import './App.css';
const API_BASE = '';
function UsageHintsPanel() {
    const [open, setOpen] = useState(false);
    return (_jsxs("div", { style: { border: '1px solid #ccc', borderRadius: 8, margin: '16px 0', background: '#f9f9f9', padding: 16 }, children: [_jsxs("button", { onClick: () => setOpen((o) => !o), style: { fontWeight: 'bold', fontSize: 16, background: 'none', border: 'none', cursor: 'pointer' }, children: [open ? '▼' : '▶', " LLM/AI Usage Hints & Prompt Examples"] }), open && (_jsxs("div", { style: { marginTop: 12 }, children: [_jsxs("ul", { children: [_jsx("li", { children: "This dashboard is registry-driven and outputs structured, machine-readable data for LLM/AI workflows." }), _jsx("li", { children: "All capabilities and plugins are discoverable via the /capabilities and /plugins endpoints." }), _jsx("li", { children: "Health/status, onboarding checklist, and context will be surfaced for agentic workflows." })] }), _jsx("b", { children: "Prompt Examples:" }), _jsxs("ul", { children: [_jsx("li", { children: "\"List all capabilities with health status and description.\"" }), _jsx("li", { children: "\"Show plugins with the most recent feedback or rating.\"" }), _jsx("li", { children: "\"What onboarding steps are required for a new contributor?\"" }), _jsx("li", { children: "\"Summarize technical debt hotspots from the dashboard.\"" })] }), _jsxs("div", { style: { marginTop: 8 }, children: ["See ", _jsx("a", { href: "https://github.com/jonathanbotha/nootropic#capabilitiesplugins-web-ui-react", target: "_blank", rel: "noopener noreferrer", children: "README" }), " and ", _jsx("a", { href: "https://github.com/jonathanbotha/nootropic/blob/main/CONTRIBUTING.md", target: "_blank", rel: "noopener noreferrer", children: "CONTRIBUTING.md" }), " for more LLM/AI usage hints and extension tips."] })] }))] }));
}
function FeedbackSection({ pluginName }) {
    const [open, setOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [feedbacks, setFeedbacks] = useState([]);
    const [aggregate, setAggregate] = useState(null);
    const [error, setError] = useState(null);
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
    async function handleSubmit(e) {
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
            if (!res.ok)
                throw new Error('Failed to submit feedback');
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
        }
        catch {
            setError('Failed to submit feedback.');
        }
        finally {
            setLoading(false);
        }
    }
    return (_jsxs("div", { style: { marginTop: 8 }, children: [_jsxs("div", { style: { fontWeight: 500, fontSize: 14, marginBottom: 2 }, children: ["Feedback for ", _jsx("span", { style: { color: '#005' }, children: pluginName })] }), _jsx("button", { onClick: () => setOpen((o) => !o), style: { fontSize: 14, padding: '2px 8px', borderRadius: 4, border: '1px solid #888', background: '#f5f5f5', cursor: 'pointer' }, children: open ? 'Hide Feedback' : 'Leave Feedback' }), open && (_jsxs("div", { style: { marginTop: 8 }, children: [aggregate && (_jsxs("div", { style: { marginBottom: 8, fontSize: 13, color: '#555' }, children: [_jsx("b", { children: "Average Rating:" }), " ", aggregate.averageRating.toFixed(2), " / 5 \u00A0|\u00A0 ", _jsx("b", { children: "Reviews:" }), " ", aggregate.reviewCount] })), _jsxs("form", { onSubmit: handleSubmit, style: { background: '#f9f9f9', padding: 12, borderRadius: 8, border: '1px solid #eee' }, children: [_jsxs("div", { children: [_jsx("label", { children: "Rating: " }), [1, 2, 3, 4, 5].map((star) => (_jsx("span", { style: { cursor: 'pointer', color: rating >= star ? '#f5b301' : '#ccc', fontSize: 20 }, onClick: (e) => { e.preventDefault(); setRating(star); }, title: `${star} star${star > 1 ? 's' : ''}`, children: "\u2605" }, star)))] }), _jsxs("div", { style: { marginTop: 8 }, children: [_jsx("label", { children: "Review: " }), _jsx("input", { type: "text", value: review, onChange: (e) => setReview(e.target.value), style: { width: 220, padding: 4, borderRadius: 4, border: '1px solid #ccc' }, maxLength: 120, placeholder: "Short review..." })] }), _jsx("button", { type: "submit", style: { marginTop: 8, padding: '2px 12px', borderRadius: 4, border: '1px solid #888', background: '#e0ffe0', cursor: 'pointer' }, disabled: loading, children: "Submit" }), error && _jsx("div", { style: { color: 'red', marginTop: 4 }, children: error }), success && _jsx("div", { style: { color: 'green', marginTop: 4 }, children: "Feedback submitted!" }), _jsx("div", { style: { fontSize: 12, color: '#888', marginTop: 8 }, children: "LLM/AI hint: You can submit plugin feedback, ratings, and reviews via the API or UI. See pluginFeedback API for automation." })] }), loading && _jsx("div", { style: { color: '#888', marginTop: 4 }, children: "Loading..." }), feedbacks.length > 0 && (_jsxs("div", { style: { marginTop: 8 }, children: [_jsx("b", { children: "Recent Feedback:" }), _jsx("ul", { style: { paddingLeft: 18 }, children: feedbacks.map((fb, i) => (_jsxs("li", { style: { marginBottom: 4 }, children: [_jsx("span", { style: { color: '#f5b301' }, children: '★'.repeat(fb.rating) }), ' ', _jsx("span", { children: fb.review || '' }), ' ', _jsxs("span", { style: { color: '#888', fontSize: 11 }, children: ["(", new Date(fb.submittedAt || '').toLocaleString(), ")"] })] }, i))) })] }))] }))] }));
}
function hasHealth(meta) {
    return typeof meta === 'object' && meta !== null && 'health' in meta && typeof meta.health === 'string';
}
function HealthStatusPanel({ capabilities, plugins }) {
    const healthyCaps = capabilities.filter(c => c.health === 'healthy').length;
    const unhealthyCaps = capabilities.filter(c => c.health && c.health !== 'healthy').length;
    const healthyPlugs = plugins.filter(p => hasHealth(p.meta) && p.meta.health === 'healthy').length;
    const unhealthyPlugs = plugins.filter(p => hasHealth(p.meta) && p.meta.health !== 'healthy').length;
    return (_jsxs("div", { style: { border: '1px solid #cce5cc', borderRadius: 8, margin: '16px 0', background: '#f6fff6', padding: 16 }, children: [_jsx("b", { children: "Health/Status Dashboard" }), _jsxs("div", { style: { marginTop: 8 }, children: [_jsxs("span", { style: { color: 'green', fontWeight: 500 }, children: ["\u25CF ", healthyCaps] }), " healthy capabilities,", _jsxs("span", { style: { color: 'red', fontWeight: 500, marginLeft: 12 }, children: ["\u25CF ", unhealthyCaps] }), " unhealthy capabilities"] }), _jsxs("div", { children: [_jsxs("span", { style: { color: 'green', fontWeight: 500 }, children: ["\u25CF ", healthyPlugs] }), " healthy plugins,", _jsxs("span", { style: { color: 'red', fontWeight: 500, marginLeft: 12 }, children: ["\u25CF ", unhealthyPlugs] }), " unhealthy plugins"] }), _jsx("div", { style: { fontSize: 12, color: '#888', marginTop: 8 }, children: "LLM/AI hint: Health/status is surfaced for all capabilities/plugins. Use this for prioritization, triage, and automation." })] }));
}
function OnboardingChecklistPanel() {
    const [open, setOpen] = useState(false);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
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
    return (_jsxs("div", { style: { border: '1px solid #cce', borderRadius: 8, margin: '16px 0', background: '#f8faff', padding: 16 }, children: [_jsxs("button", { onClick: () => setOpen((o) => !o), style: { fontWeight: 'bold', fontSize: 16, background: 'none', border: 'none', cursor: 'pointer' }, children: [open ? '▼' : '▶', " Onboarding Checklist"] }), open && (_jsxs("div", { style: { marginTop: 12 }, children: [loading ? 'Loading...' : error ? _jsx("span", { style: { color: 'red' }, children: error }) : _jsx("pre", { style: { whiteSpace: 'pre-wrap', fontFamily: 'inherit' }, children: content }), _jsx("div", { style: { fontSize: 12, color: '#888', marginTop: 8 }, children: "LLM/AI hint: The onboarding checklist is auto-generated and kept in sync with docs and registry. Use for onboarding, automation, and troubleshooting." })] }))] }));
}
function RecentMessagesPanel() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
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
    return (_jsxs("div", { style: { border: '1px solid #cce', borderRadius: 8, margin: '16px 0', background: '#f8faff', padding: 16 }, children: [_jsxs("button", { onClick: () => setOpen((o) => !o), style: { fontWeight: 'bold', fontSize: 16, background: 'none', border: 'none', cursor: 'pointer' }, children: [open ? '▼' : '▶', " Recent Agent Messages/Context"] }), open && (_jsxs("div", { style: { marginTop: 12 }, children: [loading ? 'Loading...' : error ? _jsx("span", { style: { color: 'red' }, children: error }) : (_jsx("ul", { style: { paddingLeft: 18 }, children: messages.map((m, i) => (_jsxs("li", { children: [_jsx("span", { style: { color: '#888', fontSize: 12 }, children: new Date(m.timestamp).toLocaleString() }), ' ', _jsxs("b", { children: [m.type, ":"] }), " ", m.message] }, i))) })), _jsx("div", { style: { fontSize: 12, color: '#888', marginTop: 8 }, children: "LLM/AI hint: Recent agent messages/context are surfaced for LLM/agent workflows. Use for context window, debugging, and automation." })] }))] }));
}
function AdvancedSearchPanel({ query, setQuery }) {
    return (_jsxs("div", { style: { margin: '16px 0', display: 'flex', alignItems: 'center', gap: 8 }, children: [_jsx("input", { type: "text", value: query, onChange: (e) => setQuery(e.target.value), placeholder: "Search capabilities or plugins...", style: { padding: 6, borderRadius: 6, border: '1px solid #bbb', width: 320 } }), query && (_jsx("button", { onClick: () => setQuery(''), style: { padding: '2px 10px', borderRadius: 4, border: '1px solid #888', background: '#f5f5f5', cursor: 'pointer' }, children: "Clear" })), _jsx("span", { style: { fontSize: 12, color: '#888', marginLeft: 8 }, children: "LLM/AI hint: Search is fuzzy and case-insensitive. Use for filtering, triage, and automation." })] }));
}
function App() {
    const [capabilities, setCapabilities] = useState([]);
    const [plugins, setPlugins] = useState([]);
    const [pluginAggregates, setPluginAggregates] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('name');
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
                const aggEntries = await Promise.all((Array.isArray(plugs) ? plugs : plugs.plugins || []).map(async (plg) => {
                    const agg = await fetch(`/plugin-feedback/${plg.name}/aggregate`).then(r => r.ok ? r.json() : null);
                    return [plg.name, agg && typeof agg.averageRating === 'number' ? agg : { averageRating: 0, reviewCount: 0 }];
                }));
                setPluginAggregates(Object.fromEntries(aggEntries));
            }
            catch {
                setError('Failed to fetch data from API. Is the contextRealtimeServer running?');
            }
            finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);
    function fuzzyMatch(text, query) {
        return text.toLowerCase().includes(query.toLowerCase());
    }
    const filteredCapabilities = searchQuery
        ? capabilities.filter((c) => fuzzyMatch(c.name, searchQuery) ||
            (c.description && fuzzyMatch(c.description, searchQuery)))
        : capabilities;
    let filteredPlugins = searchQuery
        ? plugins.filter((p) => fuzzyMatch(p.name, searchQuery) ||
            (p.type && fuzzyMatch(p.type, searchQuery)) ||
            (typeof p.meta?.description === 'string' && fuzzyMatch(p.meta.description, searchQuery)))
        : plugins;
    // Sort plugins by selected criteria
    filteredPlugins = [...filteredPlugins].sort((a, b) => {
        if (sortBy === 'name')
            return a.name.localeCompare(b.name);
        if (sortBy === 'rating')
            return (pluginAggregates[b.name]?.averageRating || 0) - (pluginAggregates[a.name]?.averageRating || 0);
        if (sortBy === 'reviews')
            return (pluginAggregates[b.name]?.reviewCount || 0) - (pluginAggregates[a.name]?.reviewCount || 0);
        return 0;
    });
    return (_jsxs("div", { style: { maxWidth: 900, margin: '0 auto', padding: 24 }, children: [_jsx(UsageHintsPanel, {}), _jsx(HealthStatusPanel, { capabilities: capabilities, plugins: plugins }), _jsx(AdvancedSearchPanel, { query: searchQuery, setQuery: setSearchQuery }), _jsxs("div", { style: { margin: '16px 0', display: 'flex', alignItems: 'center', gap: 12 }, children: [_jsx("label", { htmlFor: "plugin-sort", style: { fontWeight: 500 }, children: "Sort plugins by:" }), _jsxs("select", { id: "plugin-sort", value: sortBy, onChange: e => setSortBy(e.target.value), style: { padding: 4, borderRadius: 4, border: '1px solid #bbb' }, children: [_jsx("option", { value: "name", children: "Name (A-Z)" }), _jsx("option", { value: "rating", children: "Average Rating" }), _jsx("option", { value: "reviews", children: "Review Count" })] }), _jsx("span", { style: { fontSize: 12, color: '#888' }, children: "LLM/AI hint: Sort and filter plugins for discovery, triage, and automation." })] }), _jsx(OnboardingChecklistPanel, {}), _jsx(RecentMessagesPanel, {}), _jsx("h1", { children: "nootropic Capabilities & Plugins Dashboard" }), _jsx("p", { children: "Discover, search, and view all capabilities and plugins. Health/status, onboarding, and feedback are surfaced for agentic workflows." }), error && _jsx("div", { style: { color: 'red', marginBottom: 12 }, children: error }), loading ? (_jsx("div", { children: "Loading..." })) : (_jsxs(_Fragment, { children: [_jsx("h2", { children: "Capabilities" }), _jsx("ul", { children: filteredCapabilities.map((cap) => _jsxs("li", { style: { marginBottom: 8 }, children: [_jsx("span", { style: { color: cap.health === 'healthy' ? 'green' : cap.health ? 'red' : '#888', fontWeight: 700, marginRight: 6 }, children: "\u25CF" }), _jsx("b", { children: cap.name }), cap['description'] && _jsxs("span", { style: { color: '#888' }, children: ["(", String(cap['description']), ")"] }), cap['health'] && _jsx("span", { style: { color: cap['health'] === 'healthy' ? 'green' : 'red', marginLeft: 8 }, children: String(cap['health']) }), !cap['health'] && _jsx("span", { style: { color: '#888', marginLeft: 8 }, children: "unknown" })] }, cap.id)) }), _jsx("h2", { children: "Plugins" }), _jsx("ul", { children: filteredPlugins.map((plg) => {
                            const health = typeof plg.meta?.health === 'string' ? plg.meta.health : undefined;
                            const agg = pluginAggregates[plg.name];
                            return (_jsxs("li", { style: { marginBottom: 12 }, children: [_jsx("span", { style: { color: health === 'healthy' ? 'green' : health ? 'red' : '#888', fontWeight: 700, marginRight: 6 }, children: "\u25CF" }), _jsx("b", { children: plg.name }), " ", plg.type && _jsxs("span", { style: { color: '#888' }, children: ["(", plg.type, ")"] }), typeof plg.meta?.description === 'string' && (_jsx("span", { style: { color: '#888', marginLeft: 8 }, children: plg.meta && String(plg.meta['description']) })), agg && (_jsxs("span", { style: { color: '#f5b301', marginLeft: 8 }, children: ["\u2605 ", agg.averageRating.toFixed(2), " (", agg.reviewCount, " reviews)"] })), health && _jsx("span", { style: { color: health === 'healthy' ? 'green' : 'red', marginLeft: 8 }, children: plg.meta && String(plg.meta['health']) }), !health && _jsx("span", { style: { color: '#888', marginLeft: 8 }, children: "unknown" }), _jsx(FeedbackSection, { pluginName: plg.name })] }, plg.name));
                        }) })] }))] }));
}
export default App;
