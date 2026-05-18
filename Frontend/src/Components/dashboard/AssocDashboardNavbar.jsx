import q from '../../assets/Icons/q.png'
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

const dashboardTabs = [
  { label: "ملف الجمعية",     path: "/dashboard/association/profile" },
  { label: "إدارة الحملات",   path: "/dashboard/association/campaigns" },
  { label: "إدارة الفعاليات", path: "/dashboard/association/events" },
];

export default function AssocDashboardNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitial = () => {
    const source = user?.full_name || user?.name || user?.email || 'ج';
    return source.trim().charAt(0).toUpperCase();
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate("/assoc_sign_in");
  };

  return (
    <div className='fixed top-0 left-0 right-0 z-50 h-20 bg-[#0b1411]/95 backdrop-blur-md border-b border-[#1f3029] font-arabic shadow-sm' dir='rtl'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between relative'>
        
        {/* الشعار */}
        <Link to='/' className='flex items-center gap-3 shrink-0'>
          {/* Logo with transparent background (no white box) */}
          <img className='w-10 h-10 object-contain' src={q} alt="شعار المنصة" />
          <div className='flex text-2xl font-black'>
            <span className='text-white'>طريق</span>
            <span className='text-[#10b981]'>الإحسان</span>
          </div>
        </Link>

        {/* الروابط (تظهر في الشاشات الكبيرة) - متمركزة تماماً */}
        <nav className='hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2'>
          {dashboardTabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            return (
              <Link
                key={tab.label}
                to={tab.path}
                className={`transition-colors duration-300 text-sm font-bold hover:text-[#10b981] relative ${
                  isActive ? "text-[#10b981]" : "text-[#d7e1dc]"
                }`}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute -bottom-[30px] left-0 right-0 h-1 bg-[#10b981] rounded-t-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* الإجراءات (زر الحساب) */}
        <div className='flex items-center gap-4 shrink-0'>
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#10b981] to-[#0f7a59] text-white font-bold text-lg shadow-md shadow-black/20 border border-[#2d463d] overflow-hidden hover:scale-105 transition-transform"
              aria-label="قائمة الحساب"
            >
              {user?.avatar_url || user?.logo_url ? (
                <img src={user.avatar_url || user.logo_url} alt="الملف الشخصي" className="w-full h-full object-cover" />
              ) : (
                getInitial()
              )}
            </button>

            {menuOpen && (
              <div className="absolute left-0 top-14 w-48 bg-[#111a17] border border-[#243a32] rounded-xl shadow-2xl shadow-black/50 py-2 text-right z-50">
                <div className="px-4 py-2 border-b border-[#1f3029] mb-1">
                  <p className="text-white text-sm font-bold truncate">{user?.full_name || user?.name || 'جمعية'}</p>
                  <p className="text-[#8ca197] text-xs truncate">{user?.email}</p>
                </div>
                <button
                  type="button"
                  className="w-full text-right px-4 py-2.5 text-sm text-[#d7e1dc] hover:text-[#10b981] hover:bg-[#1a2922] transition-colors"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate(`/associations/${user?.association?.id || user?.id || 1}`);
                  }}
                >
                  عرض الصفحة العامة
                </button>
                <button
                  type="button"
                  className="w-full text-right px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors"
                  onClick={handleLogout}
                >
                  تسجيل الخروج
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}