// ─── Admin Users ──────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import {
  Search, Shield, ShieldOff, Crown, UserX, ChevronLeft, ChevronRight as ChevRight,
} from 'lucide-react';
import api from '../../services/api';
import { useTitle } from '../../hooks/useDebounce';
import toast from 'react-hot-toast';

export function AdminUsers() {
  useTitle('Manage Users');
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);
  const LIMIT = 15;

  const fetchUsers = async (pg = 1, q = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pg, limit: LIMIT });
      if (q) params.set('search', q);
      const res = await api.get(`/admin/users?${params}`);
      setUsers(res.data.data || []);
      setTotal(res.data.pagination?.total || 0);
    } catch (_) {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(page, search); }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers(1, search);
  };

  const toggleActive = async (user) => {
    try {
      await api.put(`/admin/users/${user._id}`, { isActive: !user.isActive });
      setUsers((p) => p.map((u) => u._id === user._id ? { ...u, isActive: !u.isActive } : u));
      toast.success(user.isActive ? 'User deactivated' : 'User activated');
    } catch (_) { toast.error('Action failed'); }
  };

  const toggleAdmin = async (user) => {
    if (!confirm(`Make ${user.name} an ${user.role === 'admin' ? 'regular user' : 'admin'}?`)) return;
    const role = user.role === 'admin' ? 'user' : 'admin';
    try {
      await api.put(`/admin/users/${user._id}`, { role });
      setUsers((p) => p.map((u) => u._id === user._id ? { ...u, role } : u));
      toast.success('Role updated');
    } catch (_) {}
  };

  const deleteUser = async (user) => {
    if (!confirm(`Permanently delete ${user.name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${user._id}`);
      setUsers((p) => p.filter((u) => u._id !== user._id));
      toast.success('User deleted');
    } catch (_) {}
  };

  const pages = Math.ceil(total / LIMIT);

  return (
    <main className="pt-20 min-h-screen page-container pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-sm text-brand-muted">{total.toLocaleString()} total users</p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..." className="input pl-9 py-2 text-sm w-56" />
          </div>
          <button type="submit" className="btn-secondary py-2 px-4 text-sm">Search</button>
        </form>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-border">
                {['User','Email','Role','Plan','Status','Joined','Actions'].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-brand-muted uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-brand-border">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="py-3 px-4"><div className="skeleton h-4 rounded w-full" /></td>
                      ))}
                    </tr>
                  ))
                : users.map((user) => (
                    <tr key={user._id} className="border-b border-brand-border hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {user.avatar
                            ? <img src={user.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                            : <div className="w-7 h-7 rounded-full bg-brand-red flex items-center justify-center text-xs font-bold">{user.name[0]}</div>
                          }
                          <span className="text-sm text-white font-medium">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-brand-muted">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className={`badge ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-brand-card border-brand-border text-brand-muted'} border text-xs`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`badge border text-xs ${user.subscriptionPlan === 'premium' ? 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30' : 'bg-brand-card border-brand-border text-brand-muted'}`}>
                          {user.subscriptionPlan}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`badge border text-xs ${user.isActive ? 'bg-green-400/20 text-green-400 border-green-400/30' : 'bg-red-400/20 text-red-400 border-red-400/30'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-brand-muted">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => toggleAdmin(user)} title={user.role === 'admin' ? 'Remove admin' : 'Make admin'}
                            className="p-1.5 rounded hover:bg-white/10 text-brand-muted hover:text-white transition-colors">
                            {user.role === 'admin' ? <ShieldOff className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                          </button>
                          <button onClick={() => toggleActive(user)} title={user.isActive ? 'Deactivate' : 'Activate'}
                            className="p-1.5 rounded hover:bg-white/10 text-brand-muted hover:text-yellow-400 transition-colors">
                            <Crown className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => deleteUser(user)} title="Delete user"
                            className="p-1.5 rounded hover:bg-red-500/10 text-brand-muted hover:text-red-400 transition-colors">
                            <UserX className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-brand-border">
            <p className="text-xs text-brand-muted">Page {page} of {pages}</p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 text-brand-muted hover:text-white transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 text-brand-muted hover:text-white transition-colors">
                <ChevRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// ─── Admin Reviews ────────────────────────────────────────────────────────────
import { Eye, EyeOff, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';

export function AdminReviews() {
  useTitle('Manage Reviews');
  const [reviews,  setReviews]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('all');
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);

  useEffect(() => { fetchReviews(); }, [filter, page]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (filter !== 'all') params.set('approved', filter === 'approved' ? 'true' : 'false');
      const res = await api.get(`/admin/reviews?${params}`);
      setReviews(res.data.data || []);
      setTotal(res.data.pagination?.total || 0);
    } catch (_) {}
    finally { setLoading(false); }
  };

  const moderate = async (id, isApproved) => {
    try {
      await api.put(`/admin/reviews/${id}/moderate`, { isApproved });
      setReviews((p) => p.map((r) => r._id === id ? { ...r, isApproved } : r));
      toast.success(isApproved ? 'Review approved' : 'Review hidden');
    } catch (_) {}
  };

  const deleteReview = async (id) => {
    if (!confirm('Delete this review permanently?')) return;
    try {
      await api.delete(`/admin/reviews/${id}`);
      setReviews((p) => p.filter((r) => r._id !== id));
      toast.success('Review deleted');
    } catch (_) {}
  };

  return (
    <main className="pt-20 min-h-screen page-container pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Review Moderation</h1>
          <p className="text-sm text-brand-muted">{total} reviews</p>
        </div>
        <div className="flex gap-1 bg-brand-card rounded-lg p-1 border border-brand-border">
          {['all','approved','pending'].map((f) => (
            <button key={f} onClick={() => { setFilter(f); setPage(1); }}
              className={`px-3 py-1.5 rounded text-sm capitalize font-medium transition-colors
                ${filter === f ? 'bg-brand-red text-white' : 'text-brand-muted hover:text-white'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-lg" />)
          : reviews.map((review) => (
              <div key={review._id} className={`card p-4 ${!review.isApproved ? 'border-yellow-500/30' : ''}`}>
                <div className="flex gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-semibold text-white">
                        {review.userId?.name || 'Unknown'}
                      </span>
                      <span className="text-xs text-brand-muted">on</span>
                      <span className="text-sm text-brand-red">{review.movieTitle}</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <span key={i} className="text-brand-gold text-xs">★</span>
                        ))}
                      </div>
                      {review.containsSpoilers && (
                        <span className="badge bg-yellow-500/20 text-yellow-400 text-[10px]">
                          <AlertTriangle className="w-2.5 h-2.5" /> Spoilers
                        </span>
                      )}
                      {!review.isApproved && (
                        <span className="badge bg-red-500/20 text-red-400 text-[10px]">Hidden</span>
                      )}
                    </div>
                    <p className="text-sm text-brand-muted line-clamp-2">{review.comment}</p>
                    <p className="text-xs text-brand-border mt-1">{new Date(review.createdAt).toLocaleString()}</p>
                  </div>

                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button onClick={() => moderate(review._id, !review.isApproved)}
                      title={review.isApproved ? 'Hide review' : 'Approve review'}
                      className={`p-1.5 rounded transition-colors ${review.isApproved
                        ? 'hover:bg-yellow-500/10 text-brand-muted hover:text-yellow-400'
                        : 'hover:bg-green-500/10 text-brand-muted hover:text-green-400'}`}>
                      {review.isApproved ? <EyeOff className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    </button>
                    <button onClick={() => deleteReview(review._id)}
                      className="p-1.5 rounded hover:bg-red-500/10 text-brand-muted hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
        }
        {!loading && reviews.length === 0 && (
          <p className="text-center text-brand-muted py-10">No reviews found.</p>
        )}
      </div>
    </main>
  );
}

export default AdminUsers;
