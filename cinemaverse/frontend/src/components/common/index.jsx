// // ─── MovieCard ───────────────────────────────────────────────────────────────
// import { useState } from 'react';
// import { Link } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { Bookmark, BookmarkCheck, Star, Play } from 'lucide-react';
// import { addToWatchlist, removeFromWatchlist } from '../../store/slices/watchlistSlice';
// import { openTrailer } from '../../store/slices/uiSlice';
// import { posterUrl } from '../../services/api';

// export function MovieCard({ movie, mediaType = 'movie' }) {
//   const dispatch = useDispatch();
//   const { user } = useSelector((s) => s.auth);
//   const { items } = useSelector((s) => s.watchlist);
//   const [imgError, setImgError] = useState(false);

//   const inWatchlist = items.some((i) => i.movieId === movie.id);
//   const title = movie.title || movie.name;
//   const year  = (movie.release_date || movie.first_air_date || '').slice(0, 4);
//   const type  = movie.media_type || mediaType;
//   const detailPath = `/${type === 'tv' ? 'tv' : 'movie'}/${movie.id}`;

//   const handleWatchlist = (e) => {
//     e.preventDefault();
//     if (!user) return;
//     if (inWatchlist) {
//       dispatch(removeFromWatchlist(movie.id));
//     } else {
//       dispatch(addToWatchlist({
//         movieId: movie.id,
//         movieTitle: title,
//         poster: movie.poster_path,
//         releaseYear: year,
//         mediaType: type,
//       }));
//     }
//   };

//   const handleTrailer = (e) => {
//     e.preventDefault();
//     if (movie.trailerKey) dispatch(openTrailer(movie.trailerKey));
//   };

//   return (
//     <Link to={detailPath} className="group block">
//       <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-brand-card">
//         {!imgError && movie.poster_path ? (
//           <img
//             src={posterUrl(movie.poster_path)}
//             alt={title}
//             loading="lazy"
//             onError={() => setImgError(true)}
//             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//           />
//         ) : (
//           <div className="w-full h-full flex items-center justify-center bg-brand-card text-brand-muted">
//             <span className="text-xs text-center px-2">{title}</span>
//           </div>
//         )}

//         {/* Hover overlay */}
//         <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
//           {movie.trailerKey && (
//             <button onClick={handleTrailer} className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center backdrop-blur-sm transition">
//               <Play className="w-4 h-4 text-white fill-white ml-0.5" />
//             </button>
//           )}
//         </div>

//         {/* Watchlist button */}
//         {user && (
//           <button
//             onClick={handleWatchlist}
//             className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center
//               transition-all duration-200 opacity-0 group-hover:opacity-100
//               ${inWatchlist ? 'bg-brand-red text-white' : 'bg-black/50 text-white hover:bg-brand-red backdrop-blur-sm'}`}
//           >
//             {inWatchlist ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
//           </button>
//         )}

//         {/* Rating badge */}
//         {movie.vote_average > 0 && (
//           <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded px-1.5 py-0.5">
//             <Star className="w-3 h-3 text-brand-gold fill-brand-gold" />
//             <span className="text-xs text-white font-medium">{movie.vote_average.toFixed(1)}</span>
//           </div>
//         )}

//         {/* Media type badge */}
//         {type === 'tv' && (
//           <div className="absolute top-2 left-2 badge bg-blue-500/80 text-white text-[10px]">TV</div>
//         )}
//       </div>

//       <div className="mt-2 px-0.5">
//         <h3 className="text-sm font-medium text-white truncate group-hover:text-brand-red transition-colors">{title}</h3>
//         {year && <p className="text-xs text-brand-muted">{year}</p>}
//       </div>
//     </Link>
//   );
// }

// // ─── MovieGrid ───────────────────────────────────────────────────────────────
// export function MovieGrid({ movies = [], loading = false, cols = 'default' }) {
//   const gridClass = cols === 'compact'
//     ? 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3'
//     : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4';

//   if (loading) return (
//     <div className={gridClass}>
//       {Array.from({ length: 12 }).map((_, i) => (
//         <div key={i}>
//           <div className="skeleton aspect-[2/3] rounded-lg" />
//           <div className="skeleton h-3 mt-2 rounded w-3/4" />
//           <div className="skeleton h-2 mt-1 rounded w-1/2" />
//         </div>
//       ))}
//     </div>
//   );

//   return (
//     <div className={gridClass}>
//       {movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
//     </div>
//   );
// }

// // ─── TrailerModal ─────────────────────────────────────────────────────────────
// import ReactPlayer from 'react-player/youtube';
// import { X as XIcon } from 'lucide-react';

// export function TrailerModal() {
//   const dispatch = useDispatch();
//   const { trailerOpen, trailerKey } = useSelector((s) => s.ui);

//   if (!trailerOpen) return null;

//   return (
//     <div
//       className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in"
//       onClick={() => dispatch(closeTrailer())}
//     >
//       <div
//         className="relative w-full max-w-4xl mx-4 aspect-video rounded-xl overflow-hidden shadow-2xl"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <button
//           onClick={() => dispatch(closeTrailer())}
//           className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/70 flex items-center justify-center hover:bg-black transition-colors"
//         >
//           <XIcon className="w-4 h-4 text-white" />
//         </button>
//         <ReactPlayer
//           url={`https://www.youtube.com/watch?v=${trailerKey}`}
//           width="100%" height="100%"
//           playing controls
//           config={{ youtube: { playerVars: { modestbranding: 1 } } }}
//         />
//       </div>
//     </div>
//   );
// }

// // ─── PageLoader ───────────────────────────────────────────────────────────────
// export function PageLoader() {
//   return (
//     <div className="fixed inset-0 flex items-center justify-center bg-brand-dark z-50">
//       <div className="flex flex-col items-center gap-4">
//         <Film className="w-12 h-12 text-brand-red animate-pulse" />
//         <div className="flex gap-1">
//           {[0,1,2].map(i => (
//             <div key={i} className="w-2 h-2 rounded-full bg-brand-red animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── StarRating ───────────────────────────────────────────────────────────────
// export function StarRating({ value = 0, onChange, max = 5, size = 'md', readonly = false }) {
//   const [hovered, setHovered] = useState(null);
//   const sizes = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-7 h-7' };

//   return (
//     <div className="flex items-center gap-0.5">
//       {Array.from({ length: max }, (_, i) => i + 1).map((star) => {
//         const filled = (hovered ?? value) >= star;
//         return (
//           <button
//             key={star}
//             type="button"
//             disabled={readonly}
//             onClick={() => !readonly && onChange?.(star)}
//             onMouseEnter={() => !readonly && setHovered(star)}
//             onMouseLeave={() => !readonly && setHovered(null)}
//             className={`transition-transform ${!readonly && 'hover:scale-110 cursor-pointer'}`}
//           >
//             <Star className={`${sizes[size]} transition-colors ${filled ? 'text-brand-gold fill-brand-gold' : 'text-brand-border'}`} />
//           </button>
//         );
//       })}
//     </div>
//   );
// }

// // Re-exports for convenience
// import { Film } from 'lucide-react';
// import { closeTrailer } from '../../store/slices/uiSlice';
// export default MovieCard;

// ─── MovieCard ───────────────────────────────────────────────────────────────
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Bookmark, BookmarkCheck, Star, Play, Film } from 'lucide-react';
import { addToWatchlist, removeFromWatchlist } from '../../store/slices/watchlistSlice';
import { openTrailer, closeTrailer } from '../../store/slices/uiSlice';
import { posterUrl } from '../../services/api';

export function MovieCard({ movie, mediaType = 'movie' }) {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { items = [] } = useSelector((s) => s.watchlist) || {}; // ✅ FIX: Added fallback
  const [imgError, setImgError] = useState(false);

  // ✅ FIX: Safe navigation with optional chaining
  const inWatchlist = items?.some?.((i) => i.movieId === movie.id) || false;
  const title = movie.title || movie.name;
  const year  = (movie.release_date || movie.first_air_date || '').slice(0, 4);
  const type  = movie.media_type || mediaType;
  const detailPath = `/${type === 'tv' ? 'tv' : 'movie'}/${movie.id}`;

  const handleWatchlist = (e) => {
    e.preventDefault();
    if (!user) return;
    if (inWatchlist) {
      dispatch(removeFromWatchlist(movie.id));
    } else {
      dispatch(addToWatchlist({
        movieId: movie.id,
        movieTitle: title,
        poster: movie.poster_path,
        releaseYear: year,
        mediaType: type,
      }));
    }
  };

  const handleTrailer = (e) => {
    e.preventDefault();
    if (movie.trailerKey) dispatch(openTrailer(movie.trailerKey));
  };

  return (
    <Link to={detailPath} className="group block">
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-brand-card">
        {!imgError && movie.poster_path ? (
          <img
            src={posterUrl(movie.poster_path)}
            alt={title}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-brand-card text-brand-muted">
            <span className="text-xs text-center px-2">{title}</span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
          {movie.trailerKey && (
            <button onClick={handleTrailer} className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center backdrop-blur-sm transition">
              <Play className="w-4 h-4 text-white fill-white ml-0.5" />
            </button>
          )}
        </div>

        {/* Watchlist button */}
        {user && (
          <button
            onClick={handleWatchlist}
            className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center
              transition-all duration-200 opacity-0 group-hover:opacity-100
              ${inWatchlist ? 'bg-brand-red text-white' : 'bg-black/50 text-white hover:bg-brand-red backdrop-blur-sm'}`}
          >
            {inWatchlist ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </button>
        )}

        {/* Rating badge */}
        {movie.vote_average > 0 && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded px-1.5 py-0.5">
            <Star className="w-3 h-3 text-brand-gold fill-brand-gold" />
            <span className="text-xs text-white font-medium">{movie.vote_average.toFixed(1)}</span>
          </div>
        )}

        {/* Media type badge */}
        {type === 'tv' && (
          <div className="absolute top-2 left-2 badge bg-blue-500/80 text-white text-[10px]">TV</div>
        )}
      </div>

      <div className="mt-2 px-0.5">
        <h3 className="text-sm font-medium text-white truncate group-hover:text-brand-red transition-colors">{title}</h3>
        {year && <p className="text-xs text-brand-muted">{year}</p>}
      </div>
    </Link>
  );
}

// ─── MovieGrid ───────────────────────────────────────────────────────────────
export function MovieGrid({ movies = [], loading = false, cols = 'default' }) {
  const gridClass = cols === 'compact'
    ? 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3'
    : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4';

  if (loading) return (
    <div className={gridClass}>
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i}>
          <div className="skeleton aspect-[2/3] rounded-lg" />
          <div className="skeleton h-3 mt-2 rounded w-3/4" />
          <div className="skeleton h-2 mt-1 rounded w-1/2" />
        </div>
      ))}
    </div>
  );

  return (
    <div className={gridClass}>
      {movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
    </div>
  );
}

// ─── TrailerModal ─────────────────────────────────────────────────────────────
import ReactPlayer from 'react-player/youtube';
import { X as XIcon } from 'lucide-react';

export function TrailerModal() {
  const dispatch = useDispatch();
  const { trailerOpen, trailerKey } = useSelector((s) => s.ui);

  if (!trailerOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in"
      onClick={() => dispatch(closeTrailer())}
    >
      <div
        className="relative w-full max-w-4xl mx-4 aspect-video rounded-xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => dispatch(closeTrailer())}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/70 flex items-center justify-center hover:bg-black transition-colors"
        >
          <XIcon className="w-4 h-4 text-white" />
        </button>
        <ReactPlayer
          url={`https://www.youtube.com/watch?v=${trailerKey}`}
          width="100%" height="100%"
          playing controls
          config={{ youtube: { playerVars: { modestbranding: 1 } } }}
        />
      </div>
    </div>
  );
}

// ─── PageLoader ───────────────────────────────────────────────────────────────
export function PageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-brand-dark z-50">
      <div className="flex flex-col items-center gap-4">
        <Film className="w-12 h-12 text-brand-red animate-pulse" />
        <div className="flex gap-1">
          {[0,1,2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full bg-brand-red animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── StarRating ───────────────────────────────────────────────────────────────
export function StarRating({ value = 0, onChange, max = 5, size = 'md', readonly = false }) {
  const [hovered, setHovered] = useState(null);
  const sizes = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-7 h-7' };

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => {
        const filled = (hovered ?? value) >= star;
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange?.(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(null)}
            className={`transition-transform ${!readonly && 'hover:scale-110 cursor-pointer'}`}
          >
            <Star className={`${sizes[size]} transition-colors ${filled ? 'text-brand-gold fill-brand-gold' : 'text-brand-border'}`} />
          </button>
        );
      })}
    </div>
  );
}

// Default export
export default MovieCard;
