import { FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="shadow-sm py-4 px-6 flex justify-between items-center">
      <h1 className="text-xl font-bold text-white">Brandgea Lab</h1>
      
      {user && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {/* {user.picture ? (
              <img 
                src={user.picture} 
                alt={user.name} 
                className="w-10 h-10 rounded-full border-2 border-gray-300 object-cover" 
              />
            ) : (
              <div className="bg-gray-700 border-2 border-dashed rounded-full w-10 h-10 flex items-center justify-center">
                <span className="text-white text-lg font-bold">
                  {user.name.charAt(0)}
                </span>
              </div>
            )} */}
        
              <div className="text-sm text-white font-medium">{user.name}</div>
 
          </div>
          <button 
            onClick={logout}
            className="text-gray-300 hover:text-white transition-colors flex items-center gap-1"
            title="Logout"
          >
            <FiLogOut className="w-5 h-5" />
            <span className="text-sm hidden md:inline">Logout</span>
          </button>
        </div>
      )}
    </header>
  );
}