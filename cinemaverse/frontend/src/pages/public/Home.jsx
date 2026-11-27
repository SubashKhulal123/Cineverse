import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Info, ChevronRight, Smile, Zap, Heart, Globe, Ghost, Lightbulb } from 'lucide-react';
import { fetchTrending, fetchPopular, fetchTopRated, fetchUpcoming } from '../../store/slices/movieSlice';
import { openTrailer } from '../../store/slices/uiSlice';
import { MovieGrid } from '../../components/common/index.jsx';
import { backdropUrl, posterUrl } from '../../services/api';
import { useTitle } from '../../hooks/useDebounce';

const MOODS = [
  { key: 'happy',       label: 'Feel Good',    icon: Smile,      color: 'from-yellow-500/20' },
  { key: 'tense',       label: 'Thrilling',    icon: Zap,        color: 'from-red-500/20'    },
  { key: 'romantic',    label: 'Romantic',     icon: Heart,      color: 'from-pink-500/20'   },
  { key: 'adventurous', label: 'Adventure',    icon: Globe,      color: 'from-blue-500/20'   },
  { key: 'scary',       label: 'Horror',       icon: Ghost,      color: 'from-purple-500/20' },
  { key: 'inspired',    label: 'Inspirational',icon: Lightbulb,  color: 'from-green-500/20'  },
];

export default function Home() {
  useTitle('');
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { trending, popular, topRated, upcoming } = useSelector((s) => s.movies);
  const [heroIdx, setHeroIdx] = useState(0);
  const [heroLoaded, setHeroLoaded] = useState(false);

  useEffect(() => {
    dispatch(fetchTrending());
    dispatch(fetchPopular());
    dispatch(fetchTopRated());
    dispatch(fetchUpcoming());
  }, [dispatch]);

  // Auto-rotate hero
  useEffect(() => {
    if (!trending.length) return;
    const t = setInterval(() => setHeroIdx((i) => (i + 1) % Math.min(trending.length, 5)), 7000);
    return () => clearInterval(t);
  }, [trending]);

  const hero = trending[heroIdx];

  return (
    <main>
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative h-[85vh] min-h-[520px] overflow-hidden">
        {hero && (
          <>
            <div className="absolute inset-0">
              <img
                key={hero.id}
                src={backdropUrl(hero.backdrop_path)}
                alt=""
                onLoad={() => setHeroLoaded(true)}
                className={`w-full h-full object-cover transition-opacity duration-700 ${heroLoaded ? 'opacity-100' : 'opacity-0'}`}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/70 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent" />
            </div>

            <div className="relative h-full flex items-center page-container">
              <div className="max-w-xl animate-slide-up">
                <div className="flex items-center gap-2 mb-3">
                  <span className="badge bg-brand-red/20 text-brand-red border border-brand-red/30">
                    {hero.media_type === 'tv' ? 'TV Show' : 'Movie'}
                  </span>
                  {hero.vote_average > 0 && (
                    <span className="text-brand-gold text-sm font-medium">★ {hero.vote_average.toFixed(1)}</span>
                  )}
                </div>

                <h1 className="font-display text-5xl md:text-7xl text-white leading-none mb-4 tracking-wide">
                  {hero.title || hero.name}
                </h1>

                <p className="text-brand-light text-base md:text-lg leading-relaxed mb-6 line-clamp-3">
                  {hero.overview}
                </p>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => hero.trailerKey && dispatch(openTrailer(hero.trailerKey))}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-white" /> Watch Trailer
                  </button>
                  <Link
                    to={`/${hero.media_type === 'tv' ? 'tv' : 'movie'}/${hero.id}`}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Info className="w-4 h-4" /> More Info
                  </Link>
                </div>
              </div>
            </div>

            {/* Hero dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {trending.slice(0, 5).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setHeroIdx(i)}
                  className={`h-1 rounded-full transition-all duration-300 ${i === heroIdx ? 'w-8 bg-brand-red' : 'w-2 bg-white/30'}`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      <div className="page-container space-y-16 pb-16">
        {/* ── MOOD DISCOVERY ─────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title mb-0">What's Your Mood?</h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {MOODS.map(({ key, label, icon: Icon, color }) => (
              <button
                key={key}
                onClick={() => navigate(`/movies?mood=${key}`)}
                className={`group p-4 rounded-xl bg-gradient-to-br ${color} to-brand-card border border-brand-border
                           hover:border-white/20 transition-all duration-200 hover:scale-105 flex flex-col items-center gap-2`}
              >
                <Icon className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                <span className="text-xs text-brand-light font-medium">{label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ── TRENDING ───────────────────────────────────────────────── */}
        <Section title="Trending This Week" link="/movies?sort=trending">
          <MovieGrid movies={trending.slice(0, 12)} loading={!trending.length} />
        </Section>

        {/* ── POPULAR ────────────────────────────────────────────────── */}
        <Section title="Popular Movies" link="/movies">
          <MovieGrid movies={popular.slice(0, 12)} loading={!popular.length} />
        </Section>

        {/* ── TOP RATED ──────────────────────────────────────────────── */}
        <Section title="Top Rated" link="/movies?sort=top_rated">
          <MovieGrid movies={topRated.slice(0, 12)} loading={!topRated.length} />
        </Section>

        {/* ── UPCOMING ───────────────────────────────────────────────── */}
        <Section title="Coming Soon" link="/movies?sort=upcoming">
          <MovieGrid movies={upcoming.slice(0, 6)} loading={!upcoming.length} />
        </Section>

        {/* ── PREMIUM CTA ────────────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-red/20 via-purple-900/20 to-blue-900/20 border border-brand-border p-8 md:p-12 text-center">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5" />
          <div className="relative">
            <span className="badge bg-brand-gold/20 text-brand-gold border border-brand-gold/30 mb-4 inline-flex">✦ Premium</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Unlock the Full Experience</h2>
            <p className="text-brand-light max-w-lg mx-auto mb-6">
              Ad-free browsing, AI-powered recommendations, early access to new features, and your personalized cinema diary.
            </p>
            <Link to="/subscription" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-3">
              Upgrade to Premium
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function Section({ title, link, children }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title mb-0">{title}</h2>
        <Link to={link} className="flex items-center gap-1 text-sm text-brand-red hover:text-red-400 transition-colors font-medium">
          See all <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      {children}
    </section>
  );
}
