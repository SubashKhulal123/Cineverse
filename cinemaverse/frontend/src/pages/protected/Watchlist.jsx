// import { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { Bookmark, BookmarkCheck, Star, Trash2, Eye, EyeOff, Heart } from 'lucide-react';
// import { fetchWatchlist, removeFromWatchlist, toggleFavorite } from '../../store/slices/watchlistSlice';
// import { posterUrl } from '../../services/api';
// import { useTitle } from '../../hooks/useDebounce';
// import api from '../../services/api';
// import toast from 'react-hot-toast';

// const FILTERS = ['all', 'unwatched', 'watched', 'favorites'];

// export default function Watchlist() {
//   useTitle('My Watchlist');
//   const dispatch = useDispatch();
//   const { items, loading } = useSelector((s) => s.watchlist);
//   const [filter, setFilter] = useState('all');

//   useEffect(() => { dispatch(fetchWatchlist()); }, [dispatch]);

//   const filtered = items.filter((item) => {
//     if (filter === 'watched')   return item.watched;
//     if (filter === 'unwatched') return !item.watched;
//     if (filter === 'favorites') return item.isFavorite;
//     return true;
//   });

//   const handleMarkWatched = async (movieId, watched) => {
//     try {
//       await api.put(`/watchlist/${movieId}/watched`, { watched: !watched });
//       dispatch(fetchWatchlist());
//       toast.success(!watched ? 'Marked as watched' : 'Marked as unwatched');
//     } catch (_) {}
//   };

//   return (
//     <main className="pt-20 min-h-screen page-container pb-16">
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
//         <div>
//           <h1 className="text-2xl font-bold text-white">My Watchlist</h1>
//           <p className="text-sm text-brand-muted">{items.length} titles</p>
//         </div>
//         <div className="flex gap-1 bg-brand-card rounded-lg p-1 border border-brand-border">
//           {FILTERS.map((f) => (
//             <button key={f} onClick={() => setFilter(f)}
//               className={`px-3 py-1.5 rounded text-sm capitalize font-medium transition-colors
//                 ${filter === f ? 'bg-brand-red text-white' : 'text-brand-muted hover:text-white'}`}>
//               {f}
//             </button>
//           ))}
//         </div>
//       </div>

//       {loading && (
//         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
//           {Array.from({ length: 10 }).map((_, i) => (
//             <div key={i}><div className="skeleton aspect-[2/3] rounded-lg" /></div>
//           ))}
//         </div>
//       )}

//       {!loading && filtered.length === 0 && (
//         <div className="text-center py-20">
//           <Bookmark className="w-16 h-16 text-brand-border mx-auto mb-4" />
//           <p className="text-brand-muted text-lg">
//             {filter === 'all' ? 'Your watchlist is empty' : `No ${filter} titles`}
//           </p>
//           {filter === 'all' && (
//             <Link to="/movies" className="btn-primary inline-flex mt-4">Browse Movies</Link>
//           )}
//         </div>
//       )}

//       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
//         {filtered.map((item) => (
//           <div key={item._id} className="group relative">
//             <Link to={`/${item.mediaType === 'tv' ? 'tv' : 'movie'}/${item.movieId}`}>
//               <div className="aspect-[2/3] rounded-lg overflow-hidden bg-brand-card relative">
//                 {item.poster
//                   ? <img src={posterUrl(item.poster)} alt={item.movieTitle}
//                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
//                   : <div className="w-full h-full flex items-center justify-center text-brand-muted text-xs text-center p-2">
//                       {item.movieTitle}
//                     </div>
//                 }

//                 {/* Watched overlay */}
//                 {item.watched && (
//                   <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
//                     <Eye className="w-8 h-8 text-white/80" />
//                   </div>
//                 )}

//                 {/* Action buttons */}
//                 <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
//                   <button
//                     onClick={(e) => { e.preventDefault(); dispatch(toggleFavorite(item.movieId)); }}
//                     className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors
//                       ${item.isFavorite ? 'bg-brand-red' : 'bg-black/60 hover:bg-brand-red'}`}
//                     title="Favorite"
//                   >
//                     <Heart className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-white text-white' : 'text-white'}`} />
//                   </button>
//                   <button
//                     onClick={(e) => { e.preventDefault(); handleMarkWatched(item.movieId, item.watched); }}
//                     className="w-7 h-7 rounded-full bg-black/60 hover:bg-green-600 flex items-center justify-center transition-colors"
//                     title={item.watched ? 'Mark unwatched' : 'Mark watched'}
//                   >
//                     {item.watched ? <EyeOff className="w-3.5 h-3.5 text-white" /> : <Eye className="w-3.5 h-3.5 text-white" />}
//                   </button>
//                   <button
//                     onClick={(e) => { e.preventDefault(); dispatch(removeFromWatchlist(item.movieId)); }}
//                     className="w-7 h-7 rounded-full bg-black/60 hover:bg-red-600 flex items-center justify-center transition-colors"
//                     title="Remove"
//                   >
//                     <Trash2 className="w-3.5 h-3.5 text-white" />
//                   </button>
//                 </div>
//               </div>
//             </Link>

//             <div className="mt-2">
//               <p className="text-sm font-medium text-white truncate">{item.movieTitle}</p>
//               <div className="flex items-center justify-between">
//                 <p className="text-xs text-brand-muted">{item.releaseYear}</p>
//                 {item.isFavorite && <Heart className="w-3 h-3 text-brand-red fill-brand-red" />}
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </main>
//   );
// }

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Bookmark, BookmarkCheck, Star, Trash2, Eye, EyeOff, Heart } from 'lucide-react';
import { fetchWatchlist, removeFromWatchlist, toggleFavorite } from '../../store/slices/watchlistSlice';
import { posterUrl } from '../../services/api';
import { useTitle } from '../../hooks/useDebounce';
import api from '../../services/api';
import toast from 'react-hot-toast';

const FILTERS = ['all', 'unwatched', 'watched', 'favorites'];

export default function Watchlist() {
  useTitle('My Watchlist');
  const dispatch = useDispatch();
  const { items = [], loading } = useSelector((s) => s.watchlist) || {}; // ✅ FIX: Added fallback
  const [filter, setFilter] = useState('all');

  useEffect(() => { dispatch(fetchWatchlist()); }, [dispatch]);

  // ✅ FIX: Safe filtering with optional chaining
  const filtered = (items || []).filter((item) => {
    if (filter === 'watched')   return item.watched;
    if (filter === 'unwatched') return !item.watched;
    if (filter === 'favorites') return item.isFavorite;
    return true;
  });

  const handleMarkWatched = async (movieId, watched) => {
    try {
      await api.put(`/watchlist/${movieId}/watched`, { watched: !watched });
      dispatch(fetchWatchlist());
      toast.success(!watched ? 'Marked as watched' : 'Marked as unwatched');
    } catch (_) {}
  };

  return (
    <main className="pt-20 min-h-screen page-container pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">My Watchlist</h1>
          <p className="text-sm text-brand-muted">{items?.length || 0} titles</p> {/* ✅ FIX: Safe access */}
        </div>
        <div className="flex gap-1 bg-brand-card rounded-lg p-1 border border-brand-border">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded text-sm capitalize font-medium transition-colors
                ${filter === f ? 'bg-brand-red text-white' : 'text-brand-muted hover:text-white'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i}><div className="skeleton aspect-[2/3] rounded-lg" /></div>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-20">
          <Bookmark className="w-16 h-16 text-brand-border mx-auto mb-4" />
          <p className="text-brand-muted text-lg">
            {filter === 'all' ? 'Your watchlist is empty' : `No ${filter} titles`}
          </p>
          {filter === 'all' && (
            <Link to="/movies" className="btn-primary inline-flex mt-4">Browse Movies</Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filtered.map((item) => (
          <div key={item._id} className="group relative">
            <Link to={`/${item.mediaType === 'tv' ? 'tv' : 'movie'}/${item.movieId}`}>
              <div className="aspect-[2/3] rounded-lg overflow-hidden bg-brand-card relative">
                {item.poster
                  ? <img src={posterUrl(item.poster)} alt={item.movieTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  : <div className="w-full h-full flex items-center justify-center text-brand-muted text-xs text-center p-2">
                      {item.movieTitle}
                    </div>
                }

                {/* Watched overlay */}
                {item.watched && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Eye className="w-8 h-8 text-white/80" />
                  </div>
                )}

                {/* Action buttons */}
                <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.preventDefault(); dispatch(toggleFavorite(item.movieId)); }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors
                      ${item.isFavorite ? 'bg-brand-red' : 'bg-black/60 hover:bg-brand-red'}`}
                    title="Favorite"
                  >
                    <Heart className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-white text-white' : 'text-white'}`} />
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); handleMarkWatched(item.movieId, item.watched); }}
                    className="w-7 h-7 rounded-full bg-black/60 hover:bg-green-600 flex items-center justify-center transition-colors"
                    title={item.watched ? 'Mark unwatched' : 'Mark watched'}
                  >
                    {item.watched ? <EyeOff className="w-3.5 h-3.5 text-white" /> : <Eye className="w-3.5 h-3.5 text-white" />}
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); dispatch(removeFromWatchlist(item.movieId)); }}
                    className="w-7 h-7 rounded-full bg-black/60 hover:bg-red-600 flex items-center justify-center transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              </div>
            </Link>

            <div className="mt-2">
              <p className="text-sm font-medium text-white truncate">{item.movieTitle}</p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-brand-muted">{item.releaseYear}</p>
                {item.isFavorite && <Heart className="w-3 h-3 text-brand-red fill-brand-red" />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
