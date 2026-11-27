// ─── Diary Page ───────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Plus, Trash2, Edit2, X, Save, Calendar } from 'lucide-react';
import api, { posterUrl } from '../../services/api';
import { useTitle } from '../../hooks/useDebounce';
import { StarRating } from '../../components/common/index.jsx';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';

export function Diary() {
  useTitle('My Diary');
  const [entries,  setEntries]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [editing,  setEditing]  = useState(null);

  useEffect(() => { fetchDiary(); }, []);

  const fetchDiary = async () => {
    setLoading(true);
    try {
      const res = await api.get('/diary');
      setEntries(res.data.data || []);
    } catch (_) {}
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this diary entry?')) return;
    try {
      await api.delete(`/diary/${id}`);
      setEntries((p) => p.filter((e) => e._id !== id));
      toast.success('Entry deleted');
    } catch (_) {}
  };

  const handleUpdate = async (id, data) => {
    try {
      await api.put(`/diary/${id}`, data);
      setEditing(null);
      fetchDiary();
      toast.success('Entry updated');
    } catch (_) {}
  };

  return (
    <main className="pt-20 min-h-screen page-container pb-16">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">My Diary</h1>
          <p className="text-sm text-brand-muted">{entries.length} viewings logged</p>
        </div>
      </div>

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-20 rounded-lg" />
          ))}
        </div>
      )}

      {!loading && entries.length === 0 && (
        <div className="text-center py-20">
          <BookOpen className="w-16 h-16 text-brand-border mx-auto mb-4" />
          <p className="text-brand-muted text-lg">Your diary is empty</p>
          <p className="text-brand-muted text-sm mt-1">Log your viewings from any movie page</p>
          <Link to="/movies" className="btn-primary inline-flex mt-4">Browse Movies</Link>
        </div>
      )}

      <div className="space-y-3 max-w-2xl">
        {entries.map((entry) => (
          <div key={entry._id} className="card p-4">
            {editing === entry._id
              ? <DiaryEditForm entry={entry} onSave={(data) => handleUpdate(entry._id, data)} onCancel={() => setEditing(null)} />
              : (
                <div className="flex gap-3">
                  {entry.poster
                    ? <img src={posterUrl(entry.poster, 'w92')} alt="" className="w-12 h-16 rounded object-cover shrink-0" />
                    : <div className="w-12 h-16 bg-brand-border rounded shrink-0" />
                  }
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <Link to={`/movie/${entry.movieId}`} className="font-semibold text-white hover:text-brand-red transition-colors truncate">
                        {entry.movieTitle}
                      </Link>
                      <div className="flex gap-1.5 shrink-0">
                        <button onClick={() => setEditing(entry._id)} className="text-brand-muted hover:text-white p-1 transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(entry._id)} className="text-brand-muted hover:text-red-400 p-1 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      {entry.rating && <StarRating value={entry.rating} readonly size="sm" />}
                      <span className="text-xs text-brand-muted flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {entry.watchedOn ? format(parseISO(entry.watchedOn), 'MMM d, yyyy') : ''}
                      </span>
                      {entry.rewatch && <span className="badge bg-blue-500/20 text-blue-400 text-[10px]">Rewatch</span>}
                    </div>
                    {entry.notes && <p className="text-sm text-brand-muted mt-2 line-clamp-2">{entry.notes}</p>}
                  </div>
                </div>
              )
            }
          </div>
        ))}
      </div>
    </main>
  );
}

function DiaryEditForm({ entry, onSave, onCancel }) {
  const [form, setForm] = useState({
    rating: entry.rating || 0,
    notes: entry.notes || '',
    rewatch: entry.rewatch || false,
    watchedOn: entry.watchedOn ? entry.watchedOn.slice(0, 10) : '',
  });
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <StarRating value={form.rating} onChange={(v) => setForm(p => ({ ...p, rating: v }))} size="md" />
        <input type="date" value={form.watchedOn} onChange={(e) => setForm(p => ({ ...p, watchedOn: e.target.value }))} className="input py-1 text-sm w-auto" />
        <label className="flex items-center gap-1.5 text-sm text-brand-muted cursor-pointer">
          <input type="checkbox" checked={form.rewatch} onChange={(e) => setForm(p => ({ ...p, rewatch: e.target.checked }))} className="accent-brand-red" />
          Rewatch
        </label>
      </div>
      <textarea value={form.notes} onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} placeholder="Notes..." className="input resize-none text-sm" />
      <div className="flex gap-2">
        <button onClick={() => onSave(form)} className="btn-primary py-1.5 px-3 text-sm flex items-center gap-1"><Save className="w-3.5 h-3.5" /> Save</button>
        <button onClick={onCancel} className="btn-ghost text-sm flex items-center gap-1"><X className="w-3.5 h-3.5" /> Cancel</button>
      </div>
    </div>
  );
}

// ─── MyLists Page ─────────────────────────────────────────────────────────────
import { Globe, Lock, Plus as PlusIcon, Trash2 as Trash2Icon, Heart } from 'lucide-react';

export function MyLists() {
  useTitle('My Lists');
  const [lists,   setLists]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ title: '', description: '', isPublic: true });
  const [saving,  setSaving]  = useState(false);

  useEffect(() => { fetchLists(); }, []);

  const fetchLists = async () => {
    setLoading(true);
    try {
      const res = await api.get('/lists/my');
      setLists(res.data.data || []);
    } catch (_) {}
    finally { setLoading(false); }
  };

  const createList = async (e) => {
    e.preventDefault();
    if (!newForm.title.trim()) return;
    setSaving(true);
    try {
      await api.post('/lists', newForm);
      toast.success('List created!');
      setShowNew(false);
      setNewForm({ title: '', description: '', isPublic: true });
      fetchLists();
    } catch (_) { toast.error('Failed to create list'); }
    finally { setSaving(false); }
  };

  const deleteList = async (id) => {
    if (!confirm('Delete this list?')) return;
    try {
      await api.delete(`/lists/${id}`);
      setLists(p => p.filter(l => l._id !== id));
      toast.success('List deleted');
    } catch (_) {}
  };

  return (
    <main className="pt-20 min-h-screen page-container pb-16">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">My Lists</h1>
        <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-1.5 py-2 px-4 text-sm">
          <PlusIcon className="w-4 h-4" /> New List
        </button>
      </div>

      {showNew && (
        <div className="card p-5 mb-6 max-w-lg animate-slide-down">
          <h3 className="font-semibold text-white mb-4">Create New List</h3>
          <form onSubmit={createList} className="space-y-3">
            <input value={newForm.title} onChange={(e) => setNewForm(p => ({ ...p, title: e.target.value }))}
              placeholder="List title" className="input" required />
            <textarea value={newForm.description} onChange={(e) => setNewForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Description (optional)" rows={2} className="input resize-none text-sm" />
            <label className="flex items-center gap-2 text-sm text-brand-muted cursor-pointer">
              <input type="checkbox" checked={newForm.isPublic} onChange={(e) => setNewForm(p => ({ ...p, isPublic: e.target.checked }))} className="accent-brand-red" />
              Make this list public
            </label>
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="btn-primary py-2 px-4 text-sm">
                {saving ? 'Creating...' : 'Create'}
              </button>
              <button type="button" onClick={() => setShowNew(false)} className="btn-secondary py-2 px-4 text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading && <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-lg" />)}</div>}

      {!loading && lists.length === 0 && (
        <div className="text-center py-20">
          <List className="w-16 h-16 text-brand-border mx-auto mb-4" />
          <p className="text-brand-muted text-lg">No lists yet</p>
          <p className="text-brand-muted text-sm mt-1">Create curated movie collections to share with friends</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {lists.map((list) => (
          <div key={list._id} className="card p-5 hover:border-white/20 transition-colors">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">{list.title}</h3>
                {list.description && <p className="text-xs text-brand-muted mt-0.5 line-clamp-2">{list.description}</p>}
              </div>
              <button onClick={() => deleteList(list._id)} className="text-brand-muted hover:text-red-400 p-1 transition-colors shrink-0">
                <Trash2Icon className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-brand-border">
              <span className="text-xs text-brand-muted">{list.movies?.length || 0} movies</span>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-xs text-brand-muted">
                  <Heart className="w-3 h-3" /> {list.likes?.length || 0}
                </span>
                {list.isPublic
                  ? <Globe className="w-3.5 h-3.5 text-green-500" title="Public" />
                  : <Lock className="w-3.5 h-3.5 text-brand-muted" title="Private" />
                }
              </div>
            </div>
            {/* Preview thumbnails */}
            {list.movies?.length > 0 && (
              <div className="flex gap-1 mt-3">
                {list.movies.slice(0, 5).map((m) => (
                  <div key={m.movieId} className="w-8 h-11 rounded overflow-hidden bg-brand-border">
                    {m.poster && <img src={posterUrl(m.poster, 'w92')} alt="" className="w-full h-full object-cover" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}

import { List } from 'lucide-react';

// ─── Subscription Page ────────────────────────────────────────────────────────
import { Crown, Check, Zap, Shield, Sparkles } from 'lucide-react';
import { useSelector } from 'react-redux';

export function Subscription() {
  useTitle('Subscription');
  const { user } = useSelector((s) => s.auth);
  const [subInfo, setSubInfo] = useState(null);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    api.get('/subscriptions').then((r) => setSubInfo(r.data.data)).catch(() => {});
  }, []);

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      await api.post('/subscriptions/upgrade', { paymentId: 'demo_' + Date.now() });
      toast.success('Welcome to Premium! 🎉');
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upgrade failed');
    } finally { setUpgrading(false); }
  };

  const isPremium = user?.subscriptionPlan === 'premium';

  return (
    <main className="pt-20 min-h-screen page-container pb-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <Crown className="w-12 h-12 text-brand-gold mx-auto mb-3" />
          <h1 className="text-3xl font-bold text-white">Choose Your Plan</h1>
          <p className="text-brand-muted mt-2">Unlock the full CinemaVerse experience</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free */}
          <div className={`card p-6 ${!isPremium ? 'border-brand-red' : ''}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">Free</h2>
                <p className="text-brand-muted text-sm">Get started</p>
              </div>
              <span className="text-3xl font-bold text-white">$0</span>
            </div>
            <ul className="space-y-2.5 mb-6">
              {['Browse movies & TV shows','Search & filter content','Create watchlist (up to 50)','Write reviews','Basic recommendations'].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-brand-muted">
                  <Check className="w-4 h-4 text-green-500 shrink-0" /> {f}
                </li>
              ))}
            </ul>
            {!isPremium && (
              <div className="bg-brand-red/10 border border-brand-red/30 text-brand-red text-sm rounded p-2 text-center">
                Current Plan
              </div>
            )}
          </div>

          {/* Premium */}
          <div className="card p-6 border-brand-gold relative overflow-hidden">
            <div className="absolute top-3 right-3">
              <span className="badge bg-brand-gold/20 text-brand-gold border border-brand-gold/30 text-xs">
                <Sparkles className="w-3 h-3" /> Most Popular
              </span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">Premium</h2>
                <p className="text-brand-muted text-sm">Full experience</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-white">$9</span>
                <span className="text-brand-muted text-sm">/mo</span>
              </div>
            </div>
            <ul className="space-y-2.5 mb-6">
              {[
                'Everything in Free',
                'Unlimited watchlist',
                'AI-powered recommendations',
                'Ad-free experience',
                'Watch diary & journal',
                'Early access to features',
                'Priority support',
                'Advanced analytics',
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-white">
                  <Check className="w-4 h-4 text-brand-gold shrink-0" /> {f}
                </li>
              ))}
            </ul>
            {isPremium ? (
              <div className="bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-sm rounded p-2 text-center">
                ✓ Active — expires {subInfo?.expiryDate ? new Date(subInfo.expiryDate).toLocaleDateString() : '—'}
              </div>
            ) : (
              <button onClick={handleUpgrade} disabled={upgrading}
                className="w-full py-3 rounded bg-brand-gold text-black font-bold hover:bg-yellow-400 transition-colors disabled:opacity-50">
                {upgrading ? 'Processing...' : 'Upgrade to Premium'}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-brand-muted mt-6">
          This is a demo — no real payment is processed. Cancel anytime from your profile settings.
        </p>
      </div>
    </main>
  );
}

export default Diary;
