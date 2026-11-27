import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Star, Bookmark, TrendingUp, Crown,
  UserCheck, Film, BarChart2, ChevronRight,
} from 'lucide-react';
import api from '../../services/api';
import { useTitle } from '../../hooks/useDebounce';

export default function AdminDashboard() {
  useTitle('Admin Dashboard');
  const [analytics, setAnalytics] = useState(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/admin/analytics');
        console.log('Analytics response:', response.data); // Debug log
        setAnalytics(response.data.data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        setAnalytics({
          overview: {
            totalUsers: 0,
            premiumUsers: 0,
            activeUsers: 0,
            newUsersThisMonth: 0,
            totalReviews: 0,
            totalWatchlist: 0,
          },
          monthlySignups: [],
          topRatedByUsers: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return (
    <div className="pt-20 page-container py-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-lg" />)}
      </div>
    </div>
  );

  const ov = analytics?.overview || {};

  const statCards = [
    { label: 'Total Users',     value: ov.totalUsers,       icon: Users,     color: 'text-blue-400',   bg: 'bg-blue-400/10'   },
    { label: 'Premium Users',   value: ov.premiumUsers,     icon: Crown,     color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { label: 'Active (7d)',     value: ov.activeUsers,      icon: UserCheck, color: 'text-green-400',  bg: 'bg-green-400/10'  },
    { label: 'New This Month',  value: ov.newUsersThisMonth,icon: TrendingUp,color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: 'Total Reviews',   value: ov.totalReviews,     icon: Star,      color: 'text-brand-gold', bg: 'bg-brand-gold/10' },
    { label: 'Watchlist Items', value: ov.totalWatchlist,   icon: Bookmark,  color: 'text-brand-red',  bg: 'bg-brand-red/10'  },
  ];

  // ✅ FIX: Ensure topRatedByUsers is always an array
  const topRatedMovies = analytics?.topRatedByUsers || [];

  return (
    <main className="pt-20 min-h-screen pb-16">
      <div className="page-container">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-sm text-brand-muted">Platform overview</p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {statCards.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="card p-4">
              <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-4.5 h-4.5 ${color}`} />
              </div>
              <p className="text-2xl font-bold text-white">{(value || 0).toLocaleString()}</p>
              <p className="text-xs text-brand-muted mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly signups chart */}
          <div className="card p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-brand-red" /> Monthly Signups
            </h3>
            {analytics?.monthlySignups && analytics.monthlySignups.length > 0 ? (
              <div className="space-y-2">
                {analytics.monthlySignups.map((m) => {
                  const maxCount = Math.max(...analytics.monthlySignups.map(x => x.count), 1);
                  const pct = (m.count / maxCount) * 100;
                  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  return (
                    <div key={`${m._id?.year}-${m._id?.month}`} className="flex items-center gap-3">
                      <span className="text-xs text-brand-muted w-10 shrink-0">
                        {monthNames[(m._id?.month || 0) - 1] || 'Unknown'}
                      </span>
                      <div className="flex-1 h-5 bg-brand-border rounded-sm overflow-hidden">
                        <div className="h-full bg-brand-red rounded-sm transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-white w-8 text-right">{m.count}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-brand-muted text-sm text-center py-4">No signup data yet</p>
            )}
          </div>

          {/* Top rated by users */}
          <div className="card p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-brand-gold" /> Top Rated by Community
            </h3>
            <div className="space-y-2">
              {topRatedMovies.length > 0 ? (
                topRatedMovies.slice(0, 8).map((m, i) => (
                  <div key={m._id} className="flex items-center gap-3">
                    <span className="text-xs text-brand-muted w-5 text-right">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{m.title || `Movie ID: ${m._id}`}</p>
                      <p className="text-xs text-brand-muted">{m.count} {m.count === 1 ? 'review' : 'reviews'}</p>
                    </div>
                    <span className="text-brand-gold text-sm font-medium">★ {m.avgRating?.toFixed(1) || '0.0'}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Star className="w-12 h-12 text-brand-border mx-auto mb-3" />
                  <p className="text-brand-muted text-sm">No reviews yet</p>
                  <p className="text-xs text-brand-muted mt-1">Reviews will appear here once users rate movies</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          {[
            { to: '/admin/users',    label: 'Manage Users',   icon: Users,    desc: 'View and moderate user accounts' },
            { to: '/admin/reviews',  label: 'Manage Reviews', icon: Star,     desc: 'Approve or hide user reviews'    },
            { to: '/admin/analytics',label: 'Analytics',      icon: BarChart2,desc: 'Detailed platform analytics'     },
          ].map(({ to, label, icon: Icon, desc }) => (
            <Link key={to} to={to}
              className="card p-5 flex items-center gap-4 hover:border-white/20 transition-colors group">
              <div className="w-10 h-10 rounded-lg bg-brand-red/10 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-brand-red" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm">{label}</p>
                <p className="text-xs text-brand-muted">{desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-brand-muted group-hover:text-white transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}