import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleLoginButton from '../components/Auth/GoogleLogin';

export default function Login() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#090d16] to-[#0f172a] flex flex-col justify-center items-center px-4 text-center relative overflow-hidden">
      {/* Background dots for starry feel */}
      <div className="absolute inset-0 bg-[radial-gradient(#475569_1px,transparent_1px)] bg-[size:30px_30px] opacity-20 z-0 pointer-events-none" />


      {/* Foreground Content */}
      <div className="z-10">

        
        {/* Top badge */}
        <div className="mb-2">
          <span className="text-xs uppercase tracking-widest text-gray-400 px-3 py-1 border border-blue-300 hover: rounded-full shadow-[0_0_25px_6px_rgba(76,49,251,0.3)]">
            Powered by AI
          </span>
        </div>


        <h1 className='text-white text-3xl md:text-5xl font-semibold leading-tight mb-6'>Brandgea</h1>

        {/* Headline */}
        <h1 className="text-white text-xl md:text-3xl font-semibold leading-tight">
          Estimate your apparel pricing<br />
          <span className="italic font-light text-gray-300">before you produce.</span>
        </h1>

        {/* Subtext */}
        <p className="text-gray-400 mt-4 max-w-xl mx-auto">
          Instant price estimates for your custom apparel designs. 
          Save time, budget smarter, and bring your ideas to life with confidence.
        </p>

        {/* Google SSO Button */}
        <div className="mt-8 flex justify-center">
          <GoogleLoginButton />
        </div>

        {/* Legal Note */}
        <p className="text-xs text-gray-500 mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>

      {/* Bottom glow simulating a soft horizon */}
      <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-[#0f172a] to-transparent blur-2xl opacity-60" />
    </div>
  );
}
