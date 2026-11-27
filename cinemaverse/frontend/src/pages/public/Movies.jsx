import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import api from '../../services/api';
import { MovieGrid } from '../../components/common/index.jsx';
import { useTitle } from '../../hooks/useDebounce';

const SORT_OPTIONS = [
  { value: 'popularity.desc',     label: 'Most Popular'   },
  { value: 'vote_average.desc',   label: 'Highest Rated'  },
  { value: 'release_date.desc',   label: 'Newest First'   },
  { value: 'release_date.asc',    label: 'Oldest First'   },
  { value: 'revenue.desc',        label: 'Box Office'     },
];

const GENRES = [
  { id: 28, name: 'Action' }, { id: 12, name: 'Adventure' }, { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' }, { id: 80, name: 'Crime' },     { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },  { id: 10751, name: 'Family' }, { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },{ id: 27, name: 'Horror' },    { id: 10749, name: 'Romance' },
  { id: 878, name: 'Sci-Fi' },{ id: 53, name: 'Thriller' },  { id: 37, name: 'Western' },
];

const MOODS = ['happy','tense','romantic','adventurous','thoughtful','funny','scary','inspired'];

export default function Movies() {
  useTitle('Movies');
  const [searchParams, setSearchParams] = useSearchParams();

  const [movies,  setMovies]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const sortBy  = searchParams.get('sort')  || 'popularity.desc';
  const genreId = searchParams.get('genre') || '';
  const mood    = searchParams.get('mood')  || '';
  const year    = searchParams.get('year')  || '';

  const fetchMovies = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      let res;
      const currentPage = reset ? 1 : page;

      if (mood) {
        res = await api.get(`/movies/mood/${mood}?page=${currentPage}`);
      } else if (genreId) {
        res = await api.get(`/movies/genre/${genreId}?page=${currentPage}&sort_by=${sortBy}`);
      } else {
        const params = new URLSearchParams({ page: currentPage, sortBy: sortBy });
        if (year) params.set('year', year);
        res = await api.get(`/movies/discover?${params}`);
      }

      const results = res.data.data.results || [];
      setTotal(res.data.data.total_results || 0);

      if (reset) {
        setMovies(results);
        setPage(2);
      } else {
        setMovies((prev) => [...prev, ...results]);
        setPage((p) => p + 1);
      }
    } catch (_) {}
    finally { setLoading(false); }
  }, [sortBy, genreId, mood, year, page]);

  useEffect(() => {
    setPage(1);
    fetchMovies(true);
  }, [sortBy, genreId, mood, year]);

  const setParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) { params.set(key, value); } else { params.delete(key); }
    // Reset other filters when changing some
    if (key === 'mood') { params.delete('genre'); params.delete('sort'); }
    setSearchParams(params);
  };

  return (
    <main className="pt-20 min-h-screen page-container pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {mood ? `${mood.charAt(0).toUpperCase() + mood.slice(1)} Movies`
              : genreId ? (GENRES.find(g => g.id === Number(genreId))?.name + ' Movies')
              : 'Browse Movies'}
          </h1>
          {total > 0 && <p className="text-sm text-brand-muted">{total.toLocaleString()} movies</p>}
        </div>

        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="flex items-center gap-2 btn-secondary py-2 px-4 text-sm self-start sm:self-auto"
        >
          <SlidersHorizontal className="w-4 h-4" /> Filters
          <ChevronDown className={`w-3 h-3 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Filters panel */}
      {filtersOpen && (
        <div className="card p-5 mb-6 animate-slide-down space-y-5">
          {/* Sort */}
          <div>
            <p className="text-xs text-brand-muted uppercase tracking-wider mb-2">Sort By</p>
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setParam('sort', opt.value)}
                  className={`badge border transition-colors ${sortBy === opt.value
                    ? 'bg-brand-red/20 border-brand-red text-brand-red'
                    : 'bg-brand-card border-brand-border text-brand-light hover:border-white/30'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Genres */}
          <div>
            <p className="text-xs text-brand-muted uppercase tracking-wider mb-2">Genre</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setParam('genre', '')}
                className={`badge border transition-colors ${!genreId ? 'bg-brand-red/20 border-brand-red text-brand-red' : 'bg-brand-card border-brand-border text-brand-light hover:border-white/30'}`}
              >All</button>
              {GENRES.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setParam('genre', genreId === String(g.id) ? '' : String(g.id))}
                  className={`badge border transition-colors ${genreId === String(g.id)
                    ? 'bg-brand-red/20 border-brand-red text-brand-red'
                    : 'bg-brand-card border-brand-border text-brand-light hover:border-white/30'}`}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>

          {/* Moods */}
          <div>
            <p className="text-xs text-brand-muted uppercase tracking-wider mb-2">Mood</p>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((m) => (
                <button
                  key={m}
                  onClick={() => setParam('mood', mood === m ? '' : m)}
                  className={`badge border capitalize transition-colors ${mood === m
                    ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                    : 'bg-brand-card border-brand-border text-brand-light hover:border-white/30'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <MovieGrid movies={movies} loading={loading && page === 2} />

      {/* Load more */}
      {movies.length > 0 && movies.length < total && (
        <div className="text-center mt-10">
          <button
            onClick={() => fetchMovies(false)}
            disabled={loading}
            className="btn-secondary px-8 py-3"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </main>
  );
}
