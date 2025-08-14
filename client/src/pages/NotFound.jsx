import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#090d16] to-[#0f172a] flex flex-col justify-center items-center px-4 text-center">
      <h1 className="text-white text-5xl font-bold mb-4">404</h1>
      <p className="text-gray-300 text-xl mb-8">Page Not Found</p>
      <Link 
        to="/" 
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
      >
        Go to Login
      </Link>
    </div>
  );
}