import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Film, Tv } from 'lucide-react';
import api from '../../services/api';
import { MovieGrid } from '../../components/common/index.jsx';
import { useTitle, useDebounce } from '../../hooks/useDebounce';

export default function Search() {
  useTitle('Search');
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';

  const [input,   setInput]   = useState(q);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [filter,  setFilter]  = useState('all');

  const debounced = useDebounce(input, 400);

  useEffect(() => {
    if (debounced.trim()) {
      setSearchParams({ q: debounced.trim() });
    }
  }, [debounced]);

  useEffect(() => {
    if (!q) { setResults([]); return; }
    doSearch(1, true);
  }, [q, filter]);

  const doSearch = async (pg, reset = false) => {
    setLoading(true);
    try {
      const res = await api.get(`/movies/search?q=${encodeURIComponent(q)}&page=${pg}`);
      let data = res.data.data.results || [];

      if (filter === 'movie') data = data.filter(r => r.media_type === 'movie');
      if (filter === 'tv')    data = data.filter(r => r.media_type === 'tv');

      setTotal(res.data.data.total_results || 0);
      setResults(reset ? data : (prev) => [...prev, ...data]);
      setPage(pg + 1);
    } catch (_) {}
    finally { setLoading(false); }
  };

  return (
    <main className="pt-20 min-h-screen page-container pb-16">
      {/* Search bar */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-muted" />
          <input
            autoFocus
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search for movies, TV shows, actors..."
            className="input pl-12 pr-4 py-4 text-base rounded-xl"
          />
        </div>
      </div>

      {q && (
        <>
          {/* Filter tabs */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex gap-1 bg-brand-card rounded-lg p-1 border border-brand-border">
              {[
                { key: 'all',   label: 'All',      icon: null },
                { key: 'movie', label: 'Movies',   icon: Film },
                { key: 'tv',    label: 'TV Shows', icon: Tv },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded text-sm font-medium transition-colors
                    ${filter === key ? 'bg-brand-red text-white' : 'text-brand-muted hover:text-white'}`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />} {label}
                </button>
              ))}
            </div>
            {total > 0 && (
              <p className="text-sm text-brand-muted">
                {total.toLocaleString()} results for "<span className="text-white">{q}</span>"
              </p>
            )}
          </div>

          {!loading && results.length === 0 && (
            <div className="text-center py-20">
              <SearchIcon className="w-16 h-16 text-brand-border mx-auto mb-4" />
              <p className="text-brand-muted text-lg">No results found for "<span className="text-white">{q}</span>"</p>
              <p className="text-brand-muted text-sm mt-2">Try different keywords or check the spelling</p>
            </div>
          )}

          <MovieGrid movies={results} loading={loading && page === 2} />

          {results.length > 0 && results.length < total && (
            <div className="text-center mt-10">
              <button onClick={() => doSearch(page)} disabled={loading} className="btn-secondary px-8 py-3">
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}

      {!q && (
        <div className="text-center py-20">
          <SearchIcon className="w-20 h-20 text-brand-border mx-auto mb-4" />
          <p className="text-brand-muted text-lg">Start typing to search</p>
        </div>
      )}
    </main>
  );
}
