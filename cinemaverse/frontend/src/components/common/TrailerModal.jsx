import { useSelector, useDispatch } from 'react-redux';
import { closeTrailer } from '../../store/slices/movieSlice';

export default function TrailerModal() {
  const dispatch = useDispatch();
  const { trailerOpen, trailerKey } = useSelector((state) => state.ui);

  if (!trailerOpen || !trailerKey) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={() => dispatch(closeTrailer())}
    >
      <div className="relative w-full max-w-4xl mx-4">
        <button
          onClick={() => dispatch(closeTrailer())}
          className="absolute -top-12 right-0 text-white hover:text-red-600 transition"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="relative pb-[56.25%]">
          <iframe
            className="absolute top-0 left-0 w-full h-full rounded-lg"
            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
            title="Trailer"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}