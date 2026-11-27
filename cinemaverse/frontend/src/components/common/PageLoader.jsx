export default function PageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-brand-dark">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
        <p className="mt-4 text-gray-400">Loading...</p>
      </div>
    </div>
  );
}