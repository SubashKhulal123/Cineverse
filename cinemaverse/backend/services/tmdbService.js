const axios = require('axios');
const logger = require('../middleware/logger');

const tmdb = axios.create({
  baseURL: process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3',
  params: { api_key: process.env.TMDB_API_KEY },
  timeout: 10000,
});

// ─── Movies ──────────────────────────────────────────────────────────────────

const getTrending = (timeWindow = 'week') =>
  tmdb.get(`/trending/movie/${timeWindow}`).then((r) => r.data);

const getPopular = (page = 1) =>
  tmdb.get('/movie/popular', { params: { page } }).then((r) => r.data);

const getTopRated = (page = 1) =>
  tmdb.get('/movie/top_rated', { params: { page } }).then((r) => r.data);

const getUpcoming = (page = 1) =>
  tmdb.get('/movie/upcoming', { params: { page } }).then((r) => r.data);

const getNowPlaying = (page = 1) =>
  tmdb.get('/movie/now_playing', { params: { page } }).then((r) => r.data);

const getMovieDetails = (id) =>
  tmdb.get(`/movie/${id}`, {
    params: { append_to_response: 'credits,videos,similar,keywords,release_dates' },
  }).then((r) => r.data);

const getSimilarMovies = (id, page = 1) =>
  tmdb.get(`/movie/${id}/similar`, { params: { page } }).then((r) => r.data);

const searchMovies = (query, page = 1) =>
  tmdb.get('/search/multi', { params: { query, page, include_adult: false } }).then((r) => r.data);

const getByGenre = (genreId, page = 1, sortBy = 'popularity.desc') =>
  tmdb
    .get('/discover/movie', { params: { with_genres: genreId, page, sort_by: sortBy } })
    .then((r) => r.data);

const getGenreList = () =>
  tmdb.get('/genre/movie/list').then((r) => r.data);

// Advanced discover with multiple filters
const discoverMovies = (filters = {}) => {
  const {
    page = 1,
    genres,
    year,
    minRating,
    maxRating,
    sortBy = 'popularity.desc',
    withCast,
    withCrew,
    language,
  } = filters;

  return tmdb
    .get('/discover/movie', {
      params: {
        page,
        with_genres: genres,
        primary_release_year: year,
        'vote_average.gte': minRating,
        'vote_average.lte': maxRating,
        sort_by: sortBy,
        with_cast: withCast,
        with_crew: withCrew,
        with_original_language: language,
      },
    })
    .then((r) => r.data);
};

// ─── TV Shows ─────────────────────────────────────────────────────────────────

const getTVPopular = (page = 1) =>
  tmdb.get('/tv/popular', { params: { page } }).then((r) => r.data);

const getTVTopRated = (page = 1) =>
  tmdb.get('/tv/top_rated', { params: { page } }).then((r) => r.data);

const getTVTrending = (timeWindow = 'week') =>
  tmdb.get(`/trending/tv/${timeWindow}`).then((r) => r.data);

const getTVDetails = (id) =>
  tmdb.get(`/tv/${id}`, {
    params: { append_to_response: 'credits,videos,similar' },
  }).then((r) => r.data);

// ─── Person ───────────────────────────────────────────────────────────────────

const getPersonDetails = (id) =>
  tmdb.get(`/person/${id}`, {
    params: { append_to_response: 'movie_credits,tv_credits' },
  }).then((r) => r.data);

// ─── Mood Discovery ───────────────────────────────────────────────────────────

const MOOD_MAP = {
  happy:        { genres: '35,10751', sort_by: 'popularity.desc' },
  tense:        { genres: '53,27', sort_by: 'vote_average.desc' },
  romantic:     { genres: '10749', sort_by: 'popularity.desc' },
  adventurous:  { genres: '12,28', sort_by: 'popularity.desc' },
  thoughtful:   { genres: '18,36', sort_by: 'vote_average.desc' },
  funny:        { genres: '35', sort_by: 'popularity.desc' },
  scary:        { genres: '27,53', sort_by: 'vote_average.desc' },
  inspired:     { genres: '99,18', sort_by: 'vote_average.desc' },
};

const getByMood = (mood, page = 1) => {
  const mapping = MOOD_MAP[mood] || MOOD_MAP.happy;
  return tmdb
    .get('/discover/movie', {
      params: { with_genres: mapping.genres, sort_by: mapping.sort_by, page },
    })
    .then((r) => r.data);
};

// ─── Trailer helper ───────────────────────────────────────────────────────────

const getTrailerKey = (videosData) => {
  const videos = videosData?.results || [];
  const trailer =
    videos.find((v) => v.type === 'Trailer' && v.site === 'YouTube') ||
    videos.find((v) => v.site === 'YouTube');
  return trailer?.key || null;
};

module.exports = {
  getTrending, getPopular, getTopRated, getUpcoming, getNowPlaying,
  getMovieDetails, getSimilarMovies, searchMovies, getByGenre, getGenreList,
  discoverMovies, getTVPopular, getTVTopRated, getTVTrending, getTVDetails,
  getPersonDetails, getByMood, getTrailerKey,
};
