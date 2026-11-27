import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Star, Bookmark, TrendingUp, Crown,
  UserCheck, Film, BarChart2, ChevronRight,
  Calendar, Eye, ThumbsUp, MessageCircle,
} from 'lucide-react';
import api from '../../services/api';
import { useTitle } from '../../hooks/useDebounce';

export default function AdminAnalytics() {
  useTitle('Analytics');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month'); // week, month, year

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/admin/analytics');
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

  if (loading) {
    return (
      <div className="pt-20 page-container py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-32 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const ov = analytics?.overview || {};

  const statCards = [
    { label: 'Total Users', value: ov.totalUsers, icon: Users, change: '+12%', color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Premium Users', value: ov.premiumUsers, icon: Crown, change: '+5%', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { label: 'Active Users (7d)', value: ov.activeUsers, icon: UserCheck, change: '+8%', color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: 'New This Month', value: ov.newUsersThisMonth, icon: TrendingUp, change: '+15%', color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: 'Total Reviews', value: ov.totalReviews, icon: Star, change: '+23%', color: 'text-brand-gold', bg: 'bg-brand-gold/10' },
    { label: 'Watchlist Items', value: ov.totalWatchlist, icon: Bookmark, change: '+18%', color: 'text-brand-red', bg: 'bg-brand-red/10' },
    { label: 'Avg Reviews/User', value: (ov.totalReviews / ov.totalUsers || 0).toFixed(1), icon: MessageCircle, change: '+7%', color: 'text-pink-400', bg: 'bg-pink-400/10' },
    { label: 'Engagement Rate', value: `${((ov.activeUsers / ov.totalUsers) * 100 || 0).toFixed(1)}%`, icon: Eye, change: '+4%', color: 'text-orange-400', bg: 'bg-orange-400/10' },
  ];

  return (
    <main className="pt-20 min-h-screen pb-16">
      <div className="page-container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
            <p className="text-sm text-brand-muted">Detailed platform metrics and insights</p>
          </div>
          
          {/* Date range selector */}
          <div className="flex gap-2 bg-brand-card rounded-lg p-1 border border-brand-border">
            {[
              { value: 'week', label: 'Week' },
              { value: 'month', label: 'Month' },
              { value: 'year', label: 'Year' },
            ].map((range) => (
              <button
                key={range.value}
                onClick={() => setDateRange(range.value)}
                className={`px-4 py-1.5 rounded text-sm font-medium transition-colors
                  ${dateRange === range.value 
                    ? 'bg-brand-red text-white' 
                    : 'text-brand-muted hover:text-white'}`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stat cards grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map(({ label, value, icon: Icon, change, color, bg }) => (
            <div key={label} className="card p-4 hover:scale-105 transition-transform duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
                  {change}
                </span>
              </div>
              <p className="text-2xl font-bold text-white">{value?.toLocaleString() || '0'}</p>
              <p className="text-xs text-brand-muted mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Charts section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* User growth chart */}
          <div className="card p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-red" /> User Growth
            </h3>
            {analytics?.monthlySignups && analytics.monthlySignups.length > 0 ? (
              <div className="space-y-3">
                {analytics.monthlySignups.slice(0, 6).map((m, idx) => {
                  const maxCount = Math.max(...analytics.monthlySignups.map(x => x.count), 1);
                  const pct = (m.count / maxCount) * 100;
                  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  return (
                    <div key={idx}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-brand-muted">{monthNames[(m._id?.month || 1) - 1]} {m._id?.year}</span>
                        <span className="text-white font-medium">{m.count} users</span>
                      </div>
                      <div className="w-full h-8 bg-brand-border rounded-lg overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-brand-red to-red-600 rounded-lg transition-all duration-500 flex items-center justify-end pr-3"
                          style={{ width: `${pct}%` }}
                        >
                          {pct > 30 && <span className="text-xs text-white font-medium">{Math.round(pct)}%</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-brand-muted text-center py-8">No data available</p>
            )}
          </div>

          {/* Top rated movies */}
          <div className="card p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-brand-gold" /> Top Rated Movies
            </h3>
            <div className="space-y-3">
              {(analytics?.topRatedByUsers || []).slice(0, 6).map((movie, i) => (
                <div key={movie._id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-red/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-brand-red">{i + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium truncate">{movie.title || `Movie ${movie._id}`}</p>
                    <p className="text-xs text-brand-muted">{movie.count} reviews</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-brand-gold fill-brand-gold" />
                    <span className="text-sm font-semibold text-white">{movie.avgRating?.toFixed(1) || '0.0'}</span>
                  </div>
                </div>
              ))}
              {(!analytics?.topRatedByUsers || analytics.topRatedByUsers.length === 0) && (
                <p className="text-brand-muted text-center py-8">No reviews yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Additional metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User activity */}
          <div className="card p-5">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-400" /> User Activity
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-brand-muted">Active Users</span>
                <span className="text-lg font-bold text-white">{ov.activeUsers || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-brand-muted">Premium Conversion</span>
                <span className="text-lg font-bold text-white">
                  {((ov.premiumUsers / ov.totalUsers) * 100 || 0).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-brand-muted">Avg Reviews/User</span>
                <span className="text-lg font-bold text-white">
                  {((ov.totalReviews / ov.totalUsers) || 0).toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Content metrics */}
          <div className="card p-5">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Film className="w-4 h-4 text-purple-400" /> Content Metrics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-brand-muted">Total Reviews</span>
                <span className="text-lg font-bold text-white">{ov.totalReviews || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-brand-muted">Watchlist Items</span>
                <span className="text-lg font-bold text-white">{ov.totalWatchlist || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-brand-muted">Avg Watchlist/User</span>
                <span className="text-lg font-bold text-white">
                  {((ov.totalWatchlist / ov.totalUsers) || 0).toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Growth metrics */}
          <div className="card p-5">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-400" /> Growth Metrics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-brand-muted">Monthly Growth</span>
                <span className="text-lg font-bold text-green-400">
                  +{((ov.newUsersThisMonth / ov.totalUsers) * 100 || 0).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-brand-muted">Review Growth</span>
                <span className="text-lg font-bold text-green-400">+23%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-brand-muted">Engagement Score</span>
                <span className="text-lg font-bold text-brand-red">A-</span>
              </div>
            </div>
          </div>
        </div>

        {/* Back to dashboard link */}
        <div className="mt-6">
          <Link 
            to="/admin" 
            className="inline-flex items-center gap-2 text-brand-muted hover:text-white transition-colors text-sm"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}

// Import Activity icon if not available
import { Activity } from 'lucide-react';