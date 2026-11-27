import { useEffect, useState } from 'react';
import api from '../../services/api';
import { MovieGrid } from '../../components/common/index.jsx';
import { useTitle } from '../../hooks/useDebounce';

const TV_TABS = [
  { key: 'popular',   label: 'Popular'   },
  { key: 'top_rated', label: 'Top Rated' },
  { key: 'trending',  label: 'Trending'  },
];

export default function TVShows() {
  useTitle('TV Shows');
  const [tab,     setTab]     = useState('popular');
  const [shows,   setShows]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(0);

  const fetchShows = async (pg, reset = false) => {
    setLoading(true);
    try {
      const endpoint = tab === 'trending' ? '/tv/trending' : `/tv/${tab.replace('_', '-')}?page=${pg}`;
      const res = await api.get(endpoint);
      const results = res.data.data?.results || [];
      setTotal(res.data.data?.total_results || results.length);
      setShows(reset ? results : (p) => [...p, ...results]);
      setPage(pg + 1);
    } catch (_) {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchShows(1, true); }, [tab]);

  return (
    <main className="pt-20 min-h-screen page-container pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-white">TV Shows</h1>
        <div className="flex gap-1 bg-brand-card rounded-lg p-1 border border-brand-border">
          {TV_TABS.map(({ key, label }) => (
            <button
              key={key} onClick={() => setTab(key)}
              className={`px-4 py-1.5 rounded text-sm font-medium transition-colors
                ${tab === key ? 'bg-brand-red text-white' : 'text-brand-muted hover:text-white'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <MovieGrid movies={shows} loading={loading && page === 2} />

      {shows.length > 0 && shows.length < total && (
        <div className="text-center mt-10">
          <button onClick={() => fetchShows(page)} disabled={loading} className="btn-secondary px-8 py-3">
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </main>
  );
}
