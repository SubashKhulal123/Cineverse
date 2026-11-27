import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Film, Search, Bell, User, Menu, X, ChevronDown,
  Bookmark, BookOpen, List, Settings, LogOut, Crown, LayoutDashboard,
} from 'lucide-react';
import { logout } from '../../store/slices/authSlice';
import { searchMovies } from '../../store/slices/movieSlice';
import { useDebounce } from '../../hooks/useDebounce';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate  = useNavigate();
  const { user }  = useSelector((s) => s.auth);

  const [scrolled,       setScrolled]       = useState(false);
  const [mobileOpen,     setMobileOpen]     = useState(false);
  const [searchOpen,     setSearchOpen]     = useState(false);
  const [searchQuery,    setSearchQuery]    = useState('');
  const [userMenuOpen,   setUserMenuOpen]   = useState(false);
  const [suggestions,    setSuggestions]    = useState([]);

  const searchRef  = useRef(null);
  const userRef    = useRef(null);
  const debouncedQ = useDebounce(searchQuery, 350);

  // Transparent → solid on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Live search suggestions
  useEffect(() => {
    if (debouncedQ.length < 2) { setSuggestions([]); return; }
    dispatch(searchMovies({ q: debouncedQ, page: 1 }))
      .unwrap()
      .then((data) => setSuggestions((data.results || []).slice(0, 6)))
      .catch(() => setSuggestions([]));
  }, [debouncedQ, dispatch]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false); setSuggestions([]);
      }
      if (userRef.current && !userRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchOpen(false); setSuggestions([]); setSearchQuery('');
  };

  const navLinks = [
    { to: '/',       label: 'Home'     },
    { to: '/movies', label: 'Movies'   },
    { to: '/tv',     label: 'TV Shows' },
  ];

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300
      ${scrolled ? 'bg-brand-darker/95 backdrop-blur-md shadow-lg' : 'bg-gradient-to-b from-black/80 to-transparent'}`}
    >
      <div className="page-container">
        <nav className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <Film className="w-7 h-7 text-brand-red" />
            <span className="font-display text-2xl tracking-wider text-white">CINEMAVERSE</span>
          </Link>

          {/* Desktop nav links */}
          <ul className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded text-sm font-medium transition-colors duration-150
                     ${isActive ? 'text-white bg-white/10' : 'text-brand-light hover:text-white hover:bg-white/5'}`
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Right controls */}
          <div className="flex items-center gap-2">

            {/* Search */}
            <div ref={searchRef} className="relative">
              <button
                onClick={() => setSearchOpen((p) => !p)}
                className="p-2 rounded text-brand-light hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {searchOpen && (
                <div className="absolute right-0 top-10 w-80 bg-brand-card border border-brand-border rounded-lg shadow-2xl animate-slide-down">
                  <form onSubmit={handleSearch} className="flex items-center gap-2 p-3 border-b border-brand-border">
                    <Search className="w-4 h-4 text-brand-muted shrink-0" />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Search movies, shows..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 bg-transparent text-sm text-white placeholder-brand-muted outline-none"
                    />
                    {searchQuery && (
                      <button type="button" onClick={() => setSearchQuery('')}>
                        <X className="w-4 h-4 text-brand-muted hover:text-white" />
                      </button>
                    )}
                  </form>

                  {suggestions.length > 0 && (
                    <ul className="py-1 max-h-72 overflow-y-auto">
                      {suggestions.map((item) => (
                        <li key={item.id}>
                          <button
                            onClick={() => {
                              navigate(`/${item.media_type === 'tv' ? 'tv' : 'movie'}/${item.id}`);
                              setSearchOpen(false); setSearchQuery('');
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 text-left transition-colors"
                          >
                            {item.poster_path
                              ? <img src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} alt="" className="w-8 h-12 object-cover rounded" />
                              : <div className="w-8 h-12 bg-brand-border rounded flex items-center justify-center"><Film className="w-4 h-4 text-brand-muted" /></div>
                            }
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">{item.title || item.name}</p>
                              <p className="text-xs text-brand-muted">
                                {item.media_type === 'tv' ? 'TV Show' : 'Movie'} ·{' '}
                                {(item.release_date || item.first_air_date || '').slice(0, 4)}
                              </p>
                            </div>
                          </button>
                        </li>
                      ))}
                      <li className="border-t border-brand-border">
                        <button
                          onClick={handleSearch}
                          className="w-full py-2 text-center text-xs text-brand-red hover:text-red-400 transition-colors"
                        >
                          See all results for "{searchQuery}"
                        </button>
                      </li>
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Authenticated controls */}
            {user ? (
              <>
                <Link to="/watchlist" className="hidden sm:flex p-2 rounded text-brand-light hover:text-white hover:bg-white/10 transition-colors" title="Watchlist">
                  <Bookmark className="w-5 h-5" />
                </Link>

                {/* User menu */}
                <div ref={userRef} className="relative">
                  <button
                    onClick={() => setUserMenuOpen((p) => !p)}
                    className="flex items-center gap-2 pl-1 pr-2 py-1 rounded hover:bg-white/10 transition-colors"
                  >
                    {user.avatar
                      ? <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                      : <div className="w-7 h-7 rounded-full bg-brand-red flex items-center justify-center text-xs font-bold">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                    }
                    <ChevronDown className={`w-3 h-3 text-brand-muted transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-10 w-52 bg-brand-card border border-brand-border rounded-lg shadow-2xl animate-slide-down overflow-hidden">
                      <div className="px-4 py-3 border-b border-brand-border">
                        <p className="font-semibold text-sm text-white truncate">{user.name}</p>
                        <p className="text-xs text-brand-muted truncate">{user.email}</p>
                        {user.subscriptionPlan === 'premium' && (
                          <span className="badge bg-yellow-500/20 text-yellow-400 mt-1"><Crown className="w-3 h-3" /> Premium</span>
                        )}
                      </div>
                      <nav className="py-1">
                        {[
                          { to: '/profile',      icon: User,          label: 'My Profile'   },
                          { to: '/watchlist',    icon: Bookmark,      label: 'Watchlist'    },
                          { to: '/diary',        icon: BookOpen,      label: 'Diary'        },
                          { to: '/lists',        icon: List,          label: 'My Lists'     },
                          { to: '/subscription', icon: Crown,         label: 'Subscription' },
                          ...(user.role === 'admin' ? [{ to: '/admin', icon: LayoutDashboard, label: 'Admin Panel' }] : []),
                        ].map(({ to, icon: Icon, label }) => (
                          <Link
                            key={to} to={to}
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-brand-light hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <Icon className="w-4 h-4" /> {label}
                          </Link>
                        ))}
                        <hr className="border-brand-border my-1" />
                        <button
                          onClick={() => { dispatch(logout()); setUserMenuOpen(false); navigate('/'); }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> Sign out
                        </button>
                      </nav>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="text-sm text-brand-light hover:text-white transition-colors px-3 py-1.5">Sign in</Link>
                <Link to="/register" className="btn-primary text-sm py-1.5 px-4">Get Started</Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen((p) => !p)}
              className="md:hidden p-2 rounded text-brand-light hover:text-white hover:bg-white/10 transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-brand-border bg-brand-darker/98 animate-slide-down">
            <nav className="px-4 py-3 space-y-1">
              {navLinks.map(({ to, label }) => (
                <NavLink
                  key={to} to={to} end={to === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded text-sm font-medium transition-colors
                     ${isActive ? 'bg-white/10 text-white' : 'text-brand-light hover:text-white hover:bg-white/5'}`
                  }
                >
                  {label}
                </NavLink>
              ))}
              {!user && (
                <div className="pt-2 flex flex-col gap-2 border-t border-brand-border">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary text-sm text-center">Sign in</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary text-sm text-center">Get Started</Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
