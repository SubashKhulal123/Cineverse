// import { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import {
//   Play, Bookmark, BookmarkCheck, Star, Clock, Calendar,
//   ChevronLeft, ThumbsUp, AlertTriangle,
// } from 'lucide-react';
// import { fetchMovieDetails } from '../../store/slices/movieSlice';
// import { addToWatchlist, removeFromWatchlist } from '../../store/slices/watchlistSlice';
// import { openTrailer } from '../../store/slices/uiSlice';
// import { MovieGrid, StarRating } from '../../components/common/index.jsx';
// import { backdropUrl, posterUrl, profileUrl } from '../../services/api';
// import { useTitle } from '../../hooks/useDebounce';
// import api from '../../services/api';
// import toast from 'react-hot-toast';

// export default function MovieDetail({ mediaType }) {
//   const { id } = useParams();
//   const dispatch   = useDispatch();
//   const navigate   = useNavigate();
//   const { details, detailsLoading } = useSelector((s) => s.movies);
//   const { items: watchlistItems }   = useSelector((s) => s.watchlist);
//   const { user }   = useSelector((s) => s.auth);

//   const [reviews, setReviews]       = useState([]);
//   const [myRating, setMyRating]     = useState(0);
//   const [myComment, setMyComment]   = useState('');
//   const [submitting, setSubmitting] = useState(false);
//   const [spoilers, setSpoilers]     = useState(false);
//   const [activeTab, setActiveTab]   = useState('overview');

//   useTitle(details?.title || details?.name);

//   useEffect(() => {
//     dispatch(fetchMovieDetails(id));
//     fetchReviews();
//     window.scrollTo(0, 0);
//   }, [id, dispatch]);

//   const fetchReviews = async () => {
//     try {
//       const res = await api.get(`/reviews/movie/${id}`);
//       setReviews(res.data.data || []);
//     } catch (_) {}
//   };

//   const inWatchlist = watchlistItems.some((i) => i.movieId === Number(id));
//   const movie = details;

//   const handleWatchlist = () => {
//     if (!user) { navigate('/login'); return; }
//     if (inWatchlist) {
//       dispatch(removeFromWatchlist(Number(id)));
//     } else {
//       dispatch(addToWatchlist({
//         movieId: movie.id,
//         movieTitle: movie.title || movie.name,
//         poster: movie.poster_path,
//         releaseYear: (movie.release_date || movie.first_air_date || '').slice(0, 4),
//         mediaType: mediaType || 'movie',
//       }));
//     }
//   };

//   const handleReviewSubmit = async (e) => {
//     e.preventDefault();
//     if (!user) { navigate('/login'); return; }
//     if (!myRating) { toast.error('Please select a rating'); return; }
//     if (myComment.length < 10) { toast.error('Review must be at least 10 characters'); return; }

//     setSubmitting(true);
//     try {
//       await api.post('/reviews', {
//         movieId: movie.id,
//         movieTitle: movie.title || movie.name,
//         moviePoster: movie.poster_path,
//         mediaType: mediaType || 'movie',
//         rating: myRating,
//         comment: myComment,
//         containsSpoilers: spoilers,
//       });
//       toast.success('Review posted!');
//       setMyRating(0); setMyComment(''); setSpoilers(false);
//       fetchReviews();
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to post review');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (detailsLoading) return (
//     <div className="pt-16">
//       <div className="skeleton h-[50vh] w-full" />
//       <div className="page-container py-8 space-y-4">
//         <div className="skeleton h-10 w-64 rounded" />
//         <div className="skeleton h-4 w-full rounded" />
//         <div className="skeleton h-4 w-3/4 rounded" />
//       </div>
//     </div>
//   );

//   if (!movie) return null;

//   const title       = movie.title || movie.name;
//   const year        = (movie.release_date || movie.first_air_date || '').slice(0, 4);
//   const runtime     = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : null;
//   const genres      = movie.genres || [];
//   const cast        = movie.credits?.cast?.slice(0, 12) || [];
//   const similar     = movie.similar?.results?.slice(0, 12) || [];
//   const director    = movie.credits?.crew?.find((c) => c.job === 'Director');

//   return (
//     <main className="pt-16 min-h-screen">
//       {/* ── BACKDROP / HERO ─────────────────────────────────────── */}
//       <div className="relative h-[55vh] min-h-[380px]">
//         <img
//           src={backdropUrl(movie.backdrop_path)}
//           alt=""
//           className="w-full h-full object-cover"
//         />
//         <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/80 to-brand-dark/20" />
//         <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/40 to-transparent" />

//         <button
//           onClick={() => navigate(-1)}
//           className="absolute top-6 left-6 flex items-center gap-2 text-white/70 hover:text-white transition-colors"
//         >
//           <ChevronLeft className="w-5 h-5" /> Back
//         </button>

//         {/* Main info overlay */}
//         <div className="absolute bottom-0 left-0 right-0 page-container pb-8">
//           <div className="flex gap-6 items-end">
//             {/* Poster */}
//             <img
//               src={posterUrl(movie.poster_path, 'w342')}
//               alt={title}
//               className="hidden md:block w-36 rounded-lg shadow-2xl border border-brand-border shrink-0"
//             />

//             <div className="flex-1 min-w-0">
//               {/* Genres */}
//               <div className="flex flex-wrap gap-2 mb-2">
//                 {genres.map((g) => (
//                   <span key={g.id} className="badge bg-white/10 text-brand-light text-[10px] border border-white/10">{g.name}</span>
//                 ))}
//               </div>

//               <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 leading-tight">{title}</h1>

//               <div className="flex flex-wrap items-center gap-4 text-sm text-brand-muted mb-4">
//                 {year && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{year}</span>}
//                 {runtime && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{runtime}</span>}
//                 {movie.vote_average > 0 && (
//                   <span className="flex items-center gap-1 text-brand-gold font-medium">
//                     <Star className="w-3.5 h-3.5 fill-brand-gold" />{movie.vote_average.toFixed(1)} TMDb
//                   </span>
//                 )}
//                 {movie.communityRating && (
//                   <span className="flex items-center gap-1 text-brand-red font-medium">
//                     <Star className="w-3.5 h-3.5 fill-brand-red" />{movie.communityRating} Community
//                   </span>
//                 )}
//                 {director && <span className="text-brand-light">Dir. <span className="text-white">{director.name}</span></span>}
//               </div>

//               <div className="flex flex-wrap gap-3">
//                 {movie.trailerKey && (
//                   <button onClick={() => dispatch(openTrailer(movie.trailerKey))} className="btn-primary flex items-center gap-2">
//                     <Play className="w-4 h-4 fill-white" /> Watch Trailer
//                   </button>
//                 )}
//                 <button onClick={handleWatchlist} className={`btn-secondary flex items-center gap-2 ${inWatchlist ? 'text-brand-red' : ''}`}>
//                   {inWatchlist ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
//                   {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ── TABS ────────────────────────────────────────────────────── */}
//       <div className="border-b border-brand-border sticky top-16 bg-brand-dark/95 backdrop-blur-md z-10">
//         <div className="page-container">
//           <div className="flex gap-0 overflow-x-auto hide-scrollbar">
//             {['overview', 'cast', 'reviews', 'similar'].map((tab) => (
//               <button
//                 key={tab}
//                 onClick={() => setActiveTab(tab)}
//                 className={`px-5 py-3.5 text-sm font-medium capitalize whitespace-nowrap border-b-2 transition-colors
//                   ${activeTab === tab
//                     ? 'border-brand-red text-white'
//                     : 'border-transparent text-brand-muted hover:text-white'}`}
//               >
//                 {tab} {tab === 'reviews' && reviews.length > 0 && `(${reviews.length})`}
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* ── TAB CONTENT ─────────────────────────────────────────────── */}
//       <div className="page-container py-8">
//         {activeTab === 'overview' && (
//           <div className="max-w-3xl space-y-6 animate-fade-in">
//             <p className="text-brand-light leading-relaxed text-base">{movie.overview}</p>

//             {movie.credits?.crew?.filter((c) => ['Director','Writer','Screenplay'].includes(c.job)).slice(0,6).map((p) => (
//               <div key={p.id + p.job} className="flex items-center gap-3 text-sm">
//                 <span className="text-brand-muted w-24 shrink-0">{p.job}</span>
//                 <span className="text-white font-medium">{p.name}</span>
//               </div>
//             ))}

//             {movie.keywords?.keywords?.length > 0 && (
//               <div className="flex flex-wrap gap-2 pt-2">
//                 {movie.keywords.keywords.slice(0,12).map((k) => (
//                   <span key={k.id} className="badge bg-brand-card border border-brand-border text-brand-muted text-xs">{k.name}</span>
//                 ))}
//               </div>
//             )}
//           </div>
//         )}

//         {activeTab === 'cast' && (
//           <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 animate-fade-in">
//             {cast.map((person) => (
//               <div key={person.id} className="text-center">
//                 <div className="aspect-[2/3] rounded-lg overflow-hidden bg-brand-card mb-2">
//                   {person.profile_path
//                     ? <img src={profileUrl(person.profile_path)} alt={person.name} className="w-full h-full object-cover" />
//                     : <div className="w-full h-full flex items-center justify-center text-brand-muted text-xs">{person.name[0]}</div>
//                   }
//                 </div>
//                 <p className="text-xs font-medium text-white truncate">{person.name}</p>
//                 <p className="text-[10px] text-brand-muted truncate">{person.character}</p>
//               </div>
//             ))}
//           </div>
//         )}

//         {activeTab === 'reviews' && (
//           <div className="max-w-2xl space-y-6 animate-fade-in">
//             {/* Write a review */}
//             {user && (
//               <div className="card p-5">
//                 <h3 className="font-semibold text-white mb-4">Write a Review</h3>
//                 <form onSubmit={handleReviewSubmit} className="space-y-4">
//                   <div>
//                     <label className="text-sm text-brand-muted mb-2 block">Your Rating</label>
//                     <StarRating value={myRating} onChange={setMyRating} size="lg" />
//                   </div>
//                   <textarea
//                     value={myComment}
//                     onChange={(e) => setMyComment(e.target.value)}
//                     placeholder="Share your thoughts about this film..."
//                     rows={4}
//                     className="input resize-none"
//                   />
//                   <div className="flex items-center justify-between">
//                     <label className="flex items-center gap-2 text-sm text-brand-muted cursor-pointer">
//                       <input type="checkbox" checked={spoilers} onChange={(e) => setSpoilers(e.target.checked)}
//                         className="accent-brand-red" />
//                       Contains spoilers
//                     </label>
//                     <button type="submit" disabled={submitting} className="btn-primary py-2 px-5 text-sm">
//                       {submitting ? 'Posting...' : 'Post Review'}
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             )}

//             {/* Reviews list */}
//             {reviews.length === 0
//               ? <p className="text-brand-muted text-center py-8">No reviews yet. Be the first!</p>
//               : reviews.map((r) => (
//                   <ReviewCard key={r._id} review={r} currentUser={user} onDeleted={fetchReviews} />
//                 ))
//             }
//           </div>
//         )}

//         {activeTab === 'similar' && (
//           <div className="animate-fade-in">
//             <MovieGrid movies={similar} loading={!similar.length} />
//           </div>
//         )}
//       </div>
//     </main>
//   );
// }

// function ReviewCard({ review, currentUser, onDeleted }) {
//   const [showSpoiler, setShowSpoiler] = useState(false);
//   const [liked, setLiked] = useState(review.likes?.includes(currentUser?._id));
//   const [likeCount, setLikeCount] = useState(review.likeCount || 0);

//   const handleLike = async () => {
//     if (!currentUser) return;
//     try {
//       const res = await api.post(`/reviews/${review._id}/like`);
//       setLiked(res.data.liked);
//       setLikeCount(res.data.likeCount);
//     } catch (_) {}
//   };

//   const handleDelete = async () => {
//     if (!confirm('Delete this review?')) return;
//     try {
//       await api.delete(`/reviews/${review._id}`);
//       toast.success('Review deleted');
//       onDeleted();
//     } catch (_) {}
//   };

//   return (
//     <div className="card p-5">
//       <div className="flex items-start justify-between mb-3">
//         <div className="flex items-center gap-3">
//           {review.userId?.avatar
//             ? <img src={review.userId.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
//             : <div className="w-9 h-9 rounded-full bg-brand-red flex items-center justify-center text-sm font-bold">
//                 {review.userId?.name?.charAt(0)}
//               </div>
//           }
//           <div>
//             <p className="text-sm font-semibold text-white">{review.userId?.name}</p>
//             <p className="text-xs text-brand-muted">{new Date(review.createdAt).toLocaleDateString()}</p>
//           </div>
//         </div>
//         <StarRating value={review.rating} readonly size="sm" />
//       </div>

//       {review.containsSpoilers && !showSpoiler
//         ? <div className="flex items-center gap-2 text-sm text-yellow-400 bg-yellow-400/10 rounded p-3 cursor-pointer" onClick={() => setShowSpoiler(true)}>
//             <AlertTriangle className="w-4 h-4 shrink-0" /> Contains spoilers — click to reveal
//           </div>
//         : <p className="text-brand-light text-sm leading-relaxed">{review.comment}</p>
//       }

//       <div className="flex items-center justify-between mt-4 pt-3 border-t border-brand-border">
//         <button onClick={handleLike} className={`flex items-center gap-1.5 text-xs transition-colors ${liked ? 'text-brand-red' : 'text-brand-muted hover:text-white'}`}>
//           <ThumbsUp className="w-3.5 h-3.5" /> {likeCount}
//         </button>
//         {currentUser?._id === review.userId?._id && (
//           <button onClick={handleDelete} className="text-xs text-brand-muted hover:text-red-400 transition-colors">Delete</button>
//         )}
//       </div>
//     </div>
//   );
// }

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Play, Bookmark, BookmarkCheck, Star, Clock, Calendar,
  ChevronLeft, ThumbsUp, AlertTriangle,
} from 'lucide-react';
import { fetchMovieDetails } from '../../store/slices/movieSlice';
import { addToWatchlist, removeFromWatchlist } from '../../store/slices/watchlistSlice';
import { openTrailer } from '../../store/slices/uiSlice';
import { MovieGrid, StarRating } from '../../components/common/index.jsx';
import { backdropUrl, posterUrl, profileUrl } from '../../services/api';
import { useTitle } from '../../hooks/useDebounce';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function MovieDetail({ mediaType }) {
  const { id } = useParams();
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { details, detailsLoading } = useSelector((s) => s.movies);
  const { items: watchlistItems = [] } = useSelector((s) => s.watchlist) || {}; // ✅ FIX: Added fallback
  const { user }   = useSelector((s) => s.auth);

  const [reviews, setReviews]       = useState([]);
  const [myRating, setMyRating]     = useState(0);
  const [myComment, setMyComment]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [spoilers, setSpoilers]     = useState(false);
  const [activeTab, setActiveTab]   = useState('overview');

  useTitle(details?.title || details?.name);

  useEffect(() => {
    dispatch(fetchMovieDetails(id));
    fetchReviews();
    window.scrollTo(0, 0);
  }, [id, dispatch]);

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/reviews/movie/${id}`);
      setReviews(res.data.data || []);
    } catch (_) {}
  };

  // ✅ FIX: Safe navigation with optional chaining
  const inWatchlist = watchlistItems?.some?.((i) => i.movieId === Number(id)) || false;
  const movie = details;

  const handleWatchlist = () => {
    if (!user) { navigate('/login'); return; }
    if (inWatchlist) {
      dispatch(removeFromWatchlist(Number(id)));
    } else {
      dispatch(addToWatchlist({
        movieId: movie.id,
        movieTitle: movie.title || movie.name,
        poster: movie.poster_path,
        releaseYear: (movie.release_date || movie.first_air_date || '').slice(0, 4),
        mediaType: mediaType || 'movie',
      }));
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (!myRating) { toast.error('Please select a rating'); return; }
    if (myComment.length < 10) { toast.error('Review must be at least 10 characters'); return; }

    setSubmitting(true);
    try {
      await api.post('/reviews', {
        movieId: movie.id,
        movieTitle: movie.title || movie.name,
        moviePoster: movie.poster_path,
        mediaType: mediaType || 'movie',
        rating: myRating,
        comment: myComment,
        containsSpoilers: spoilers,
      });
      toast.success('Review posted!');
      setMyRating(0); setMyComment(''); setSpoilers(false);
      fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post review');
    } finally {
      setSubmitting(false);
    }
  };

  if (detailsLoading) return (
    <div className="pt-16">
      <div className="skeleton h-[50vh] w-full" />
      <div className="page-container py-8 space-y-4">
        <div className="skeleton h-10 w-64 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
      </div>
    </div>
  );

  if (!movie) return null;

  const title       = movie.title || movie.name;
  const year        = (movie.release_date || movie.first_air_date || '').slice(0, 4);
  const runtime     = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : null;
  const genres      = movie.genres || [];
  const cast        = movie.credits?.cast?.slice(0, 12) || [];
  const similar     = movie.similar?.results?.slice(0, 12) || [];
  const director    = movie.credits?.crew?.find((c) => c.job === 'Director');

  return (
    <main className="pt-16 min-h-screen">
      {/* ── BACKDROP / HERO ─────────────────────────────────────── */}
      <div className="relative h-[55vh] min-h-[380px]">
        <img
          src={backdropUrl(movie.backdrop_path)}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/80 to-brand-dark/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/40 to-transparent" />

        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" /> Back
        </button>

        {/* Main info overlay */}
        <div className="absolute bottom-0 left-0 right-0 page-container pb-8">
          <div className="flex gap-6 items-end">
            {/* Poster */}
            <img
              src={posterUrl(movie.poster_path, 'w342')}
              alt={title}
              className="hidden md:block w-36 rounded-lg shadow-2xl border border-brand-border shrink-0"
            />

            <div className="flex-1 min-w-0">
              {/* Genres */}
              <div className="flex flex-wrap gap-2 mb-2">
                {genres.map((g) => (
                  <span key={g.id} className="badge bg-white/10 text-brand-light text-[10px] border border-white/10">{g.name}</span>
                ))}
              </div>

              <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 leading-tight">{title}</h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-brand-muted mb-4">
                {year && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{year}</span>}
                {runtime && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{runtime}</span>}
                {movie.vote_average > 0 && (
                  <span className="flex items-center gap-1 text-brand-gold font-medium">
                    <Star className="w-3.5 h-3.5 fill-brand-gold" />{movie.vote_average.toFixed(1)} TMDb
                  </span>
                )}
                {movie.communityRating && (
                  <span className="flex items-center gap-1 text-brand-red font-medium">
                    <Star className="w-3.5 h-3.5 fill-brand-red" />{movie.communityRating} Community
                  </span>
                )}
                {director && <span className="text-brand-light">Dir. <span className="text-white">{director.name}</span></span>}
              </div>

              <div className="flex flex-wrap gap-3">
                {movie.trailerKey && (
                  <button onClick={() => dispatch(openTrailer(movie.trailerKey))} className="btn-primary flex items-center gap-2">
                    <Play className="w-4 h-4 fill-white" /> Watch Trailer
                  </button>
                )}
                <button onClick={handleWatchlist} className={`btn-secondary flex items-center gap-2 ${inWatchlist ? 'text-brand-red' : ''}`}>
                  {inWatchlist ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TABS ────────────────────────────────────────────────────── */}
      <div className="border-b border-brand-border sticky top-16 bg-brand-dark/95 backdrop-blur-md z-10">
        <div className="page-container">
          <div className="flex gap-0 overflow-x-auto hide-scrollbar">
            {['overview', 'cast', 'reviews', 'similar'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3.5 text-sm font-medium capitalize whitespace-nowrap border-b-2 transition-colors
                  ${activeTab === tab
                    ? 'border-brand-red text-white'
                    : 'border-transparent text-brand-muted hover:text-white'}`}
              >
                {tab} {tab === 'reviews' && reviews.length > 0 && `(${reviews.length})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── TAB CONTENT ─────────────────────────────────────────────── */}
      <div className="page-container py-8">
        {activeTab === 'overview' && (
          <div className="max-w-3xl space-y-6 animate-fade-in">
            <p className="text-brand-light leading-relaxed text-base">{movie.overview}</p>

            {movie.credits?.crew?.filter((c) => ['Director','Writer','Screenplay'].includes(c.job)).slice(0,6).map((p) => (
              <div key={p.id + p.job} className="flex items-center gap-3 text-sm">
                <span className="text-brand-muted w-24 shrink-0">{p.job}</span>
                <span className="text-white font-medium">{p.name}</span>
              </div>
            ))}

            {movie.keywords?.keywords?.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {movie.keywords.keywords.slice(0,12).map((k) => (
                  <span key={k.id} className="badge bg-brand-card border border-brand-border text-brand-muted text-xs">{k.name}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'cast' && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 animate-fade-in">
            {cast.map((person) => (
              <div key={person.id} className="text-center">
                <div className="aspect-[2/3] rounded-lg overflow-hidden bg-brand-card mb-2">
                  {person.profile_path
                    ? <img src={profileUrl(person.profile_path)} alt={person.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-brand-muted text-xs">{person.name[0]}</div>
                  }
                </div>
                <p className="text-xs font-medium text-white truncate">{person.name}</p>
                <p className="text-[10px] text-brand-muted truncate">{person.character}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="max-w-2xl space-y-6 animate-fade-in">
            {/* Write a review */}
            {user && (
              <div className="card p-5">
                <h3 className="font-semibold text-white mb-4">Write a Review</h3>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm text-brand-muted mb-2 block">Your Rating</label>
                    <StarRating value={myRating} onChange={setMyRating} size="lg" />
                  </div>
                  <textarea
                    value={myComment}
                    onChange={(e) => setMyComment(e.target.value)}
                    placeholder="Share your thoughts about this film..."
                    rows={4}
                    className="input resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-brand-muted cursor-pointer">
                      <input type="checkbox" checked={spoilers} onChange={(e) => setSpoilers(e.target.checked)}
                        className="accent-brand-red" />
                      Contains spoilers
                    </label>
                    <button type="submit" disabled={submitting} className="btn-primary py-2 px-5 text-sm">
                      {submitting ? 'Posting...' : 'Post Review'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Reviews list */}
            {reviews.length === 0
              ? <p className="text-brand-muted text-center py-8">No reviews yet. Be the first!</p>
              : reviews.map((r) => (
                  <ReviewCard key={r._id} review={r} currentUser={user} onDeleted={fetchReviews} />
                ))
            }
          </div>
        )}

        {activeTab === 'similar' && (
          <div className="animate-fade-in">
            <MovieGrid movies={similar} loading={!similar.length} />
          </div>
        )}
      </div>
    </main>
  );
}

function ReviewCard({ review, currentUser, onDeleted }) {
  const [showSpoiler, setShowSpoiler] = useState(false);
  const [liked, setLiked] = useState(review.likes?.includes(currentUser?._id));
  const [likeCount, setLikeCount] = useState(review.likeCount || 0);

  const handleLike = async () => {
    if (!currentUser) return;
    try {
      const res = await api.post(`/reviews/${review._id}/like`);
      setLiked(res.data.liked);
      setLikeCount(res.data.likeCount);
    } catch (_) {}
  };

  const handleDelete = async () => {
    if (!confirm('Delete this review?')) return;
    try {
      await api.delete(`/reviews/${review._id}`);
      toast.success('Review deleted');
      onDeleted();
    } catch (_) {}
  };

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {review.userId?.avatar
            ? <img src={review.userId.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
            : <div className="w-9 h-9 rounded-full bg-brand-red flex items-center justify-center text-sm font-bold">
                {review.userId?.name?.charAt(0)}
              </div>
          }
          <div>
            <p className="text-sm font-semibold text-white">{review.userId?.name}</p>
            <p className="text-xs text-brand-muted">{new Date(review.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <StarRating value={review.rating} readonly size="sm" />
      </div>

      {review.containsSpoilers && !showSpoiler
        ? <div className="flex items-center gap-2 text-sm text-yellow-400 bg-yellow-400/10 rounded p-3 cursor-pointer" onClick={() => setShowSpoiler(true)}>
            <AlertTriangle className="w-4 h-4 shrink-0" /> Contains spoilers — click to reveal
          </div>
        : <p className="text-brand-light text-sm leading-relaxed">{review.comment}</p>
      }

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-brand-border">
        <button onClick={handleLike} className={`flex items-center gap-1.5 text-xs transition-colors ${liked ? 'text-brand-red' : 'text-brand-muted hover:text-white'}`}>
          <ThumbsUp className="w-3.5 h-3.5" /> {likeCount}
        </button>
        {currentUser?._id === review.userId?._id && (
          <button onClick={handleDelete} className="text-xs text-brand-muted hover:text-red-400 transition-colors">Delete</button>
        )}
      </div>
    </div>
  );
}
