import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Camera, BookOpen, List, Star, Bookmark,
  UserCheck, UserPlus, Edit2, Save, X,
} from 'lucide-react';
import { updateProfile } from '../../store/slices/authSlice';
import api, { posterUrl } from '../../services/api';
import { useTitle } from '../../hooks/useDebounce';
import toast from 'react-hot-toast';
import { StarRating } from '../../components/common/index.jsx';
import { Link } from 'react-router-dom';

const ALL_GENRES = [
  'Action','Adventure','Animation','Comedy','Crime','Documentary',
  'Drama','Family','Fantasy','History','Horror','Music','Romance',
  'Science Fiction','Thriller','War','Western',
];

export default function Profile() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((s) => s.auth);

  const isOwnProfile = !id || id === currentUser?._id;

  const [profile,   setProfile]   = useState(null);
  const [reviews,   setReviews]   = useState([]);
  const [stats,     setStats]     = useState({});
  const [tab,       setTab]       = useState('reviews');
  const [editing,   setEditing]   = useState(false);
  const [following, setFollowing] = useState(false);
  const [loading,   setLoading]   = useState(true);

  const [editForm, setEditForm] = useState({ name: '', bio: '', favoriteGenres: [] });

  useTitle(isOwnProfile ? 'My Profile' : profile?.name);

  useEffect(() => {
    const userId = id || currentUser?._id;
    if (!userId) return;
    fetchProfile(userId);
    fetchReviews(userId);
  }, [id, currentUser]);

  const fetchProfile = async (userId) => {
    setLoading(true);
    try {
      const res = await api.get(`/users/${userId}/profile`);
      setProfile(res.data.data);
      setStats(res.data.data.stats || {});
      setFollowing(res.data.data.followers?.includes(currentUser?._id));
      setEditForm({
        name: res.data.data.name,
        bio: res.data.data.bio || '',
        favoriteGenres: res.data.data.favoriteGenres || [],
      });
    } catch (_) {}
    finally { setLoading(false); }
  };

  const fetchReviews = async (userId) => {
    try {
      const res = await api.get(`/reviews/user/${userId}`);
      setReviews(res.data.data || []);
    } catch (_) {}
  };

  const handleSaveProfile = async () => {
    await dispatch(updateProfile(editForm));
    setEditing(false);
    fetchProfile(currentUser._id);
  };

  const handleFollow = async () => {
    try {
      if (following) {
        await api.delete(`/users/${profile._id}/follow`);
        setFollowing(false);
        toast.success('Unfollowed');
      } else {
        await api.post(`/users/${profile._id}/follow`);
        setFollowing(true);
        toast.success(`Following ${profile.name}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  const toggleGenre = (g) => {
    setEditForm((p) => ({
      ...p,
      favoriteGenres: p.favoriteGenres.includes(g)
        ? p.favoriteGenres.filter((x) => x !== g)
        : [...p.favoriteGenres, g],
    }));
  };

  if (loading) return (
    <div className="pt-20 page-container py-8">
      <div className="flex gap-6 items-start">
        <div className="skeleton w-24 h-24 rounded-full" />
        <div className="flex-1 space-y-3">
          <div className="skeleton h-7 w-48 rounded" />
          <div className="skeleton h-4 w-72 rounded" />
        </div>
      </div>
    </div>
  );

  if (!profile) return null;

  const avatarInitial = profile.name?.charAt(0).toUpperCase();

  return (
    <main className="pt-20 min-h-screen pb-16">
      {/* Cover / header */}
      <div className="bg-gradient-to-r from-brand-darker to-brand-card border-b border-brand-border">
        <div className="page-container py-8">
          <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
            {/* Avatar */}
            <div className="relative">
              {profile.avatar
                ? <img src={profile.avatar} alt={profile.name}
                    className="w-24 h-24 rounded-full object-cover border-2 border-brand-border" />
                : <div className="w-24 h-24 rounded-full bg-brand-red flex items-center justify-center text-3xl font-bold border-2 border-brand-border">
                    {avatarInitial}
                  </div>
              }
            </div>

            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="space-y-3 max-w-lg">
                  <input
                    value={editForm.name}
                    onChange={(e) => setEditForm(p => ({ ...p, name: e.target.value }))}
                    className="input text-lg font-bold py-2"
                    placeholder="Your name"
                  />
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm(p => ({ ...p, bio: e.target.value }))}
                    rows={2}
                    className="input resize-none text-sm"
                    placeholder="Tell us about yourself..."
                  />
                  <div>
                    <p className="text-xs text-brand-muted mb-2">Favorite Genres</p>
                    <div className="flex flex-wrap gap-1.5">
                      {ALL_GENRES.map((g) => (
                        <button key={g} type="button" onClick={() => toggleGenre(g)}
                          className={`badge border text-xs transition-colors ${editForm.favoriteGenres.includes(g)
                            ? 'bg-brand-red/20 border-brand-red text-brand-red'
                            : 'border-brand-border text-brand-muted hover:border-white/30'}`}>
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleSaveProfile} className="btn-primary flex items-center gap-1.5 py-2 px-4 text-sm">
                      <Save className="w-3.5 h-3.5" /> Save
                    </button>
                    <button onClick={() => setEditing(false)} className="btn-secondary flex items-center gap-1.5 py-2 px-4 text-sm">
                      <X className="w-3.5 h-3.5" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
                  {profile.bio && <p className="text-brand-muted text-sm mt-1">{profile.bio}</p>}
                  {profile.favoriteGenres?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {profile.favoriteGenres.map((g) => (
                        <span key={g} className="badge bg-brand-card border border-brand-border text-brand-muted text-[10px]">{g}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-6 mt-3 text-sm text-brand-muted">
                    <span><strong className="text-white">{profile.followers?.length || 0}</strong> Followers</span>
                    <span><strong className="text-white">{profile.following?.length || 0}</strong> Following</span>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-2 shrink-0">
              {isOwnProfile && !editing && (
                <button onClick={() => setEditing(true)} className="btn-secondary flex items-center gap-1.5 py-2 px-4 text-sm">
                  <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                </button>
              )}
              {!isOwnProfile && currentUser && (
                <button onClick={handleFollow}
                  className={`flex items-center gap-1.5 py-2 px-4 text-sm rounded font-semibold transition-colors
                    ${following ? 'bg-white/10 hover:bg-red-500/20 text-white hover:text-red-400 border border-white/20'
                      : 'btn-primary'}`}>
                  {following ? <><UserCheck className="w-3.5 h-3.5" /> Following</> : <><UserPlus className="w-3.5 h-3.5" /> Follow</>}
                </button>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mt-6 max-w-sm">
            {[
              { icon: Star,     label: 'Reviews',    value: stats.reviewCount   || 0 },
              { icon: Bookmark, label: 'Watchlist',  value: stats.watchlistCount || 0 },
              { icon: BookOpen, label: 'Diary',      value: stats.diaryCount    || 0 },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="text-center">
                <Icon className="w-4 h-4 text-brand-muted mx-auto mb-1" />
                <p className="text-xl font-bold text-white">{value}</p>
                <p className="text-xs text-brand-muted">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-brand-border">
        <div className="page-container">
          {['reviews', 'lists'].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-3.5 text-sm font-medium capitalize border-b-2 transition-colors mr-1
                ${tab === t ? 'border-brand-red text-white' : 'border-transparent text-brand-muted hover:text-white'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="page-container py-8">
        {tab === 'reviews' && (
          <div className="space-y-4 max-w-2xl animate-fade-in">
            {reviews.length === 0
              ? <p className="text-brand-muted text-center py-10">No reviews yet.</p>
              : reviews.map((r) => (
                  <div key={r._id} className="card p-4">
                    <div className="flex items-start gap-3">
                      {r.poster
                        ? <img src={posterUrl(r.moviePoster, 'w92')} alt="" className="w-12 h-16 rounded object-cover shrink-0" />
                        : <div className="w-12 h-16 bg-brand-border rounded shrink-0" />
                      }
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <Link to={`/movie/${r.movieId}`} className="font-semibold text-white hover:text-brand-red transition-colors truncate">
                            {r.movieTitle}
                          </Link>
                          <StarRating value={r.rating} readonly size="sm" />
                        </div>
                        <p className="text-sm text-brand-muted mt-1 line-clamp-2">{r.comment}</p>
                        <p className="text-xs text-brand-border mt-2">{new Date(r.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))
            }
          </div>
        )}

        {tab === 'lists' && (
          <div className="text-center py-10 text-brand-muted">
            <List className="w-12 h-12 mx-auto mb-3 text-brand-border" />
            <p>No public lists yet.</p>
            {isOwnProfile && (
              <Link to="/lists" className="btn-primary inline-flex mt-4 text-sm">Create a List</Link>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
