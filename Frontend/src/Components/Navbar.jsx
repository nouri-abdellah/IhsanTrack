import q from '../assets/Icons/q.png'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinkClasses = ({ isActive }) => 
    `transition-colors duration-500 text-lg hover:text-[#10B77F] ${
      isActive ? "text-[#10B77F] " : "text-white"
    }`;

  const getProfileRoute = () => {
    if (user?.role === 'association') return '/dashboard/association/profile';
    return '/dashboard/user/profile';
  };

  const getInitial = () => {
    const source = user?.full_name || user?.email || 'U';
    return source.trim().charAt(0).toUpperCase();
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/user_sign_in');
  };

  return (
    <div className='fixed top-0 left-0 right-0 z-50 flex h-18 bg-[#102720] border-b border-gray-800 font-arabic' dir='rtl'>
      <div className='flex mr-6 mt-4 gap-1'>
       <img className='w-10 h-10' src={q} alt="" /><h1 className='text-white mr-2 text-3xl'>طريق</h1><h1 className='text-[#10B77F] text-3xl'>الاحسان</h1>
      </div>
      <div>
        <nav className='flex mr-60 mt-5 gap-13'>
         <NavLink className={navLinkClasses} to='/'>الرئيسية</NavLink>
         <NavLink className={navLinkClasses} to='/associations'>الجمعيات</NavLink>
         <NavLink className={navLinkClasses} to='/campaigns'>الحملات</NavLink>
         <NavLink className={navLinkClasses} to='/events'>الفعاليات</NavLink>
         <NavLink className={navLinkClasses} to='/about_us'>من نحن</NavLink>
        </nav>
      </div>
      <div className='flex mr-50 mt-4 gap-4 items-center'>
       <NavLink className="text-white transition-transform duration-300 bg-[#10B77F] hover:scale-103 h-10 w-27 pr-6 pt-1 rounded-lg text-lg" to='/donate'>تبرع الان</NavLink>

       {isAuthenticated ? (
         <div className="relative">
           <button
             type="button"
             onClick={() => setMenuOpen((value) => !value)}
             className="flex items-center justify-center w-10 h-10 rounded-full bg-linear-to-br from-[#10B77F] to-[#0b6b4b] text-white font-bold text-lg shadow-md shadow-black/20 border border-white/10 overflow-hidden"
             aria-label="قائمة الحساب"
             title="قائمة الحساب"
           >
             {user?.avatar_url ? (
               <img src={user.avatar_url} alt="الملف الشخصي" className="w-full h-full object-cover" />
             ) : (
               getInitial()
             )}
           </button>

           {menuOpen ? (
             <div className="absolute left-0 top-12 w-44 bg-gray-900 border border-gray-700 rounded-xl shadow-xl py-1 text-right z-50">
               <button
                 type="button"
                 className="w-full text-right px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                 onClick={() => {
                   setMenuOpen(false);
                   navigate(getProfileRoute());
                 }}
               >
                 الملف الشخصي
               </button>
               <button
                 type="button"
                 className="w-full text-right px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-gray-800 transition-colors"
                 onClick={handleLogout}
               >
                 تسجيل الخروج
               </button>
             </div>
           ) : null}
         </div>
       ) : (
         <NavLink className="text-white transition-colors duration-500 hover:text-[#10B77F] mt-1 mr-2 text-lg" to='/user_sign_in'>تسجيل الدخول</NavLink>
       )}
      </div>
    </div>
  )
}

export default Navbar