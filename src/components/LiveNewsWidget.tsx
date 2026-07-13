import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Newspaper,
  RefreshCw,
  ExternalLink,
  Clock,
  Loader2,
  AlertTriangle,
  Flame,
  Waves,
  Wind,
  Thermometer,
  Mountain,
  Filter,
} from 'lucide-react';

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  category: Category;
  image?: string;
}

type Category = 'flood' | 'cyclone' | 'earthquake' | 'wildfire' | 'heatwave' | 'landslide' | 'general';

const CATEGORY_CONFIG: Record<Category, { label: string; icon: typeof Newspaper; color: string; keywords: string[] }> = {
  flood: { label: 'Flood', icon: Waves, color: '#06b6d4', keywords: ['flood', 'flooding', 'inundation', 'deluge', 'waterlogging'] },
  cyclone: { label: 'Cyclone', icon: Wind, color: '#8b5cf6', keywords: ['cyclone', 'hurricane', 'typhoon', 'storm', 'tropical'] },
  earthquake: { label: 'Earthquake', icon: Mountain, color: '#f59e0b', keywords: ['earthquake', 'tremor', 'seismic', 'richter', 'magnitude'] },
  wildfire: { label: 'Wildfire', icon: Flame, color: '#f97316', keywords: ['wildfire', 'forest fire', 'bushfire', 'blaze', 'inferno'] },
  heatwave: { label: 'Heatwave', icon: Thermometer, color: '#ef4444', keywords: ['heatwave', 'heat wave', 'scorching', 'temperature record', 'extreme heat'] },
  landslide: { label: 'Landslide', icon: Mountain, color: '#ec4899', keywords: ['landslide', 'mudslide', 'avalanche', 'rockslide', 'debris flow'] },
  general: { label: 'General', icon: AlertTriangle, color: '#94a3b8', keywords: ['disaster', 'emergency', 'catastrophe', 'calamity', 'ndrf', 'relief'] },
};

function detectCategory(text: string): Category {
  const lower = text.toLowerCase();
  for (const [cat, cfg] of Object.entries(CATEGORY_CONFIG) as [Category, typeof CATEGORY_CONFIG[Category]][]) {
    if (cat === 'general') continue;
    if (cfg.keywords.some((k) => lower.includes(k))) return cat;
  }
  return 'general';
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// RSS feeds converted to JSON via rss2json.com (free, no key)
const FEEDS = [
  'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Ffeeds.feedburner.com%2Fndtv%2FTopStories&count=20',
  'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.thehindu.com%2Fnews%2Fnational%2Ffeeder%2Fdefault.rss&count=20',
  'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.downtoearth.org.in%2Ffulltext%2Frss%2Fclimate-change&count=15',
];

const DISASTER_KEYWORDS = [
  'flood', 'cyclone', 'hurricane', 'typhoon', 'earthquake', 'tremor', 'seismic',
  'wildfire', 'forest fire', 'heatwave', 'heat wave', 'landslide', 'mudslide',
  'storm', 'disaster', 'emergency', 'tsunami', 'drought', 'ndrf', 'relief',
  'evacuate', 'evacuation', 'rainfall', 'rain', 'temperature', 'weather alert',
];

async function fetchFeed(url: string): Promise<NewsArticle[]> {
  const res = await fetch(url, { signal: AbortSignal.timeout(7000) });
  if (!res.ok) return [];
  const json = await res.json();
  if (!json.items) return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return json.items.map((item: any): NewsArticle => {
    const text = `${item.title ?? ''} ${item.description ?? ''}`;
    return {
      id: item.guid ?? item.link ?? Math.random().toString(),
      title: item.title ?? 'Untitled',
      description: item.description?.replace(/<[^>]+>/g, '').slice(0, 160) ?? '',
      url: item.link ?? '#',
      source: json.feed?.title ?? 'News',
      publishedAt: item.pubDate ?? new Date().toISOString(),
      category: detectCategory(text),
      image: item.enclosure?.link ?? item.thumbnail ?? undefined,
    };
  });
}

async function fetchAllNews(): Promise<NewsArticle[]> {
  const results = await Promise.allSettled(FEEDS.map(fetchFeed));
  const all: NewsArticle[] = [];
  for (const r of results) {
    if (r.status === 'fulfilled') all.push(...r.value);
  }
  // Filter to disaster-related only
  const filtered = all.filter((a) =>
    DISASTER_KEYWORDS.some((k) => `${a.title} ${a.description}`.toLowerCase().includes(k))
  );
  // Deduplicate by title similarity
  const seen = new Set<string>();
  return filtered.filter((a) => {
    const key = a.title.slice(0, 40).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

const ALL_CATEGORIES: Category[] = ['flood', 'cyclone', 'earthquake', 'wildfire', 'heatwave', 'landslide', 'general'];

export function LiveNewsWidget() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<Category | 'all'>('all');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await fetchAllNews();
      setArticles(data);
      setLastUpdated(new Date());
      if (data.length === 0) setError(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5 * 60 * 1000); // refresh every 5 min
    return () => clearInterval(interval);
  }, [load]);

  const displayed = filter === 'all' ? articles : articles.filter((a) => a.category === filter);
  const counts = ALL_CATEGORIES.reduce<Record<string, number>>((acc, cat) => {
    acc[cat] = articles.filter((a) => a.category === cat).length;
    return acc;
  }, {});

  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-accent-400" />
            <h3 className="font-display font-semibold text-white text-sm">Live Disaster News</h3>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/25">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              <span className="text-[10px] text-red-300 font-medium">LIVE</span>
            </span>
          </div>
          {lastUpdated && (
            <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Updated {timeAgo(lastUpdated.toISOString())}
            </p>
          )}
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-border-subtle flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Category filter chips */}
      <div className="flex items-center gap-2 px-5 pb-3 overflow-x-auto no-scrollbar">
        <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        <button
          onClick={() => setFilter('all')}
          className={`shrink-0 px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
            filter === 'all'
              ? 'bg-accent-500/20 text-accent-300 border-accent-500/40'
              : 'bg-white/5 text-slate-400 border-border-subtle hover:bg-white/10'
          }`}
        >
          All ({articles.length})
        </button>
        {ALL_CATEGORIES.filter((c) => counts[c] > 0).map((cat) => {
          const cfg = CATEGORY_CONFIG[cat];
          const active = filter === cat;
          return (
            <button
              key={cat}
              onClick={() => setFilter(active ? 'all' : cat)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                active ? 'text-white border-transparent' : 'bg-white/5 text-slate-400 border-border-subtle hover:bg-white/10'
              }`}
              style={active ? { backgroundColor: `${cfg.color}22`, borderColor: `${cfg.color}55`, color: cfg.color } : {}}
            >
              <cfg.icon className="w-3 h-3" />
              {cfg.label} ({counts[cat]})
            </button>
          );
        })}
      </div>

      {/* Articles */}
      <div className="border-t border-border-subtle max-h-[520px] overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-accent-400" />
            <span className="ml-2 text-sm text-slate-400">Fetching latest news…</span>
          </div>
        )}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
            <AlertTriangle className="w-8 h-8 text-amber-400 mb-2" />
            <p className="text-sm text-slate-300 font-medium">Couldn't load news</p>
            <p className="text-xs text-slate-500 mt-1">External news feeds may be temporarily unavailable</p>
            <button onClick={load} className="btn-outline mt-4 text-xs">Retry</button>
          </div>
        )}
        <AnimatePresence>
          {!loading && !error && displayed.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-10 text-center text-sm text-slate-400"
            >
              No news articles for this filter right now.
            </motion.div>
          )}
          {!loading && displayed.map((a, i) => {
            const cfg = CATEGORY_CONFIG[a.category];
            return (
              <motion.a
                key={a.id}
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i, 10) * 0.03 }}
                className="flex items-start gap-3 px-5 py-3.5 hover:bg-white/5 transition-colors border-b border-border-subtle last:border-b-0 group"
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: `${cfg.color}18`, border: `1px solid ${cfg.color}33` }}
                >
                  <cfg.icon className="w-4 h-4" style={{ color: cfg.color }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-white leading-snug group-hover:text-accent-300 transition-colors line-clamp-2">
                      {a.title}
                    </p>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 shrink-0 mt-0.5 transition-colors" />
                  </div>
                  {a.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{a.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] font-medium" style={{ color: cfg.color }}>{cfg.label}</span>
                    <span className="text-[10px] text-slate-600">·</span>
                    <span className="text-[10px] text-slate-500">{a.source}</span>
                    <span className="text-[10px] text-slate-600">·</span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" /> {timeAgo(a.publishedAt)}
                    </span>
                  </div>
                </div>
              </motion.a>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
