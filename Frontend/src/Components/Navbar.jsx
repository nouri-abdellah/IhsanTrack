import q from '../assets/Icons/q.png'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useRef, useEffect } from 'react'

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinkClasses = ({ isActive }) => 
    `transition-colors duration-300 text-sm font-bold hover:text-[#10b981] ${
      isActive ? "text-[#10b981]" : "text-[#d7e1dc]"
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
    <div className='fixed top-0 left-0 right-0 z-50 h-20 bg-[#0b1411]/95 backdrop-blur-md border-b border-[#1f3029] font-arabic shadow-sm' dir='rtl'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between'>
        
        {/* الشعار */}
        <Link to='/' className='flex items-center gap-3 shrink-0'>
          <img className='w-10 h-10 object-contain' src={q} alt="شعار المنصة" />
          <div className='flex text-2xl font-black'>
            <span className='text-white'>طريق</span>
            <span className='text-[#10b981]'>الإحسان</span>
          </div>
        </Link>

        {/* الروابط (تظهر في الشاشات الكبيرة) */}
        <nav className='hidden md:flex items-center gap-8'>
          <NavLink className={navLinkClasses} to='/'>الرئيسية</NavLink>
          <NavLink className={navLinkClasses} to='/associations'>الجمعيات</NavLink>
          <NavLink className={navLinkClasses} to='/campaigns'>الحملات</NavLink>
          <NavLink className={navLinkClasses} to='/events'>الفعاليات</NavLink>
          <NavLink className={navLinkClasses} to='/about_us'>من نحن</NavLink>
        </nav>

        {/* الإجراءات (زر التبرع وتسجيل الدخول/الحساب) */}
        <div className='flex items-center gap-4 shrink-0'>
          <NavLink 
            className="hidden sm:flex items-center justify-center bg-[#0f7a59] hover:bg-[#10b981] text-white transition-all duration-300 rounded-xl px-5 py-2.5 font-bold text-sm border border-[#1f6f57] hover:border-[#10b981] shadow-lg shadow-emerald-900/20" 
            to='/campaigns'
          >
            تبرع الآن
          </NavLink>

          {isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#10b981] to-[#0f7a59] text-white font-bold text-lg shadow-md shadow-black/20 border border-[#2d463d] overflow-hidden hover:scale-105 transition-transform"
                aria-label="قائمة الحساب"
              >
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="الملف الشخصي" className="w-full h-full object-cover" />
                ) : (
                  getInitial()
                )}
              </button>

              {menuOpen ? (
                <div className="absolute left-0 top-14 w-48 bg-[#111a17] border border-[#243a32] rounded-xl shadow-2xl shadow-black/50 py-2 text-right z-50">
                  <div className="px-4 py-2 border-b border-[#1f3029] mb-1">
                    <p className="text-white text-sm font-bold truncate">{user?.full_name || 'مستخدم'}</p>
                    <p className="text-[#8ca197] text-xs truncate">{user?.email}</p>
                  </div>
                  <button
                    type="button"
                    className="w-full text-right px-4 py-2.5 text-sm text-[#d7e1dc] hover:text-[#10b981] hover:bg-[#1a2922] transition-colors"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate(getProfileRoute());
                    }}
                  >
                    لوحة التحكم
                  </button>
                  <button
                    type="button"
                    className="w-full text-right px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors"
                    onClick={handleLogout}
                  >
                    تسجيل الخروج
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <NavLink 
              className="text-[#d7e1dc] transition-colors duration-300 hover:text-[#10b981] text-sm font-bold px-2" 
              to='/user_sign_in'
            >
              تسجيل الدخول
            </NavLink>
          )}
        </div>

      </div>
    </div>
  )
}

export default Navbar