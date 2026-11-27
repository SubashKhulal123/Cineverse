import { Link } from 'react-router-dom';
import { Film, Github, Twitter, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brand-darker border-t border-brand-border mt-20">
      <div className="page-container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Film className="w-6 h-6 text-brand-red" />
              <span className="font-display text-xl tracking-wider">CINEMAVERSE</span>
            </Link>
            <p className="text-brand-muted text-sm leading-relaxed">
              Discover, track, and share your movie journey. The ultimate platform for film lovers.
            </p>
          </div>

          {[
            {
              heading: 'Discover',
              links: [
                { to: '/movies', label: 'Movies' },
                { to: '/tv', label: 'TV Shows' },
                { to: '/movies?mood=happy', label: 'Mood Picks' },
                { to: '/search', label: 'Search' },
              ],
            },
            {
              heading: 'Account',
              links: [
                { to: '/watchlist',    label: 'Watchlist' },
                { to: '/diary',        label: 'Diary' },
                { to: '/lists',        label: 'My Lists' },
                { to: '/subscription', label: 'Premium' },
              ],
            },
            {
              heading: 'Company',
              links: [
                { to: '/', label: 'About' },
                { to: '/', label: 'Privacy Policy' },
                { to: '/', label: 'Terms of Service' },
                { to: '/', label: 'Contact' },
              ],
            },
          ].map(({ heading, links }) => (
            <div key={heading}>
              <h4 className="text-white font-semibold mb-3 text-sm">{heading}</h4>
              <ul className="space-y-2">
                {links.map(({ to, label }) => (
                  <li key={label}>
                    <Link to={to} className="text-brand-muted hover:text-white text-sm transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-brand-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-brand-muted text-sm">
            © {new Date().getFullYear()} CinemaVerse. Movie data from{' '}
            <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" className="text-brand-red hover:underline">TMDb</a>.
          </p>
          <div className="flex items-center gap-4">
            {[
              { icon: Github, name: 'github', href: '#' },
              { icon: Twitter, name: 'twitter', href: '#' },
              { icon: Instagram, name: 'instagram', href: '#' },
            ].map(({ icon: Icon, name, href }) => (
              <a 
                key={name}  // ← Use unique 'name' as key instead of href
                href={href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-brand-muted hover:text-white transition-colors"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}