import im from '../assets/Icons/uim.png'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthTopBar from '../Components/auth/AuthTopBar';

const User_sign_in = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { login } = useAuth();
  const navigate = useNavigate();

  const getDashboardPathByRole = (role) => {
    if (role === 'association') return '/dashboard/association/profile';
    return '/dashboard/user/profile';
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await login({ email, password });
      const role = data?.user?.role;
      navigate(getDashboardPathByRole(role));
    } catch (err) {
      const apiError = err?.response?.data?.error;
      setError(apiError || 'فشل تسجيل الدخول. تحقق من البريد وكلمة المرور ثم أعد المحاولة.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-gray-950 font-arabic" dir="rtl">
         <AuthTopBar
           title="تسجيل دخول المستخدم"
           subtitle="ادخل إلى حسابك وتابع أثر تبرعاتك"
           actionLabel="إنشاء حساب"
           actionPath="/user_sign_up"
         />
         <div className="relative h-full w-1/2">
  <img className="w-full h-full object-cover" src={im} alt="" />
  <div className="absolute inset-0 bg-linear-to-b from-[#064E3B]/30 via-[#064E3B]/80 to-[#064E3B]"></div>
  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
    <h2 className="text-5xl  text-white ">معاً نبني مستقبلاً أفضل</h2>
    <br />
    <p className="text-xl w-100 text-gray-400">من خلال "طريق الاحسان"، نجمع القلوب ونوحد الجهود
لخدمة مجتمعنا. انضم إلينا وكن جزءاً من التغيير الإيجابي.</p>
  </div>
</div>
          <div className="flex flex-col items-center justify-center w-1/2 min-h-screen bg-[#10221C] px-6 py-16 relative">
        <form onSubmit={handleLogin} className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl shadow-black/20 p-8 flex flex-col items-center">
               <div className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2 text-xs font-semibold text-green-300">
                 <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                 دخول آمن وسريع
               </div>
               <h2 className="mt-4 text-3xl font-extrabold text-white">طريق الاحسان</h2>
               <h3 className="mt-2 text-2xl font-bold text-white">تسجيل الدخول</h3>
               <p className="mt-2 text-sm text-gray-400 text-center">مرحباً بك مجدداً في مجتمعنا</p>
               <div className="mt-8 w-full space-y-4">
               <div>
                 <p className="mb-2 text-sm text-gray-300 text-right">البريد الإلكتروني أو الهاتف</p>
                 <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="أدخل البريد الإلكتروني أو رقم الهاتف" className="w-full h-11 px-4 text-sm text-white border border-gray-700 rounded-xl bg-gray-950/60 placeholder-gray-600 focus:border-green-500 outline-none" />
               </div>
               <div>
                 <div className="flex items-center justify-between mb-2">
                   <p className="text-sm text-gray-300">كلمة المرور</p>
                   <p onClick={() => navigate('/forgot-password')} className='text-xs text-[#25c481] hover:text-[#1e9e68] hover:cursor-pointer'>نسيت كلمة السر؟</p>
                 </div>
                 <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full h-11 px-4 text-sm text-white border border-gray-700 rounded-xl bg-gray-950/60 placeholder-gray-600 focus:border-green-500 outline-none"/>
               </div>
               </div>
                {error ? <p className="text-red-400 text-sm mt-4 text-center">{error}</p> : null}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-6 w-full h-11 text-md font-bold text-white border border-green-700/50 rounded-xl bg-linear-to-r from-green-700 to-emerald-600 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول'}
                </button>
               <div className="mt-4 flex items-center gap-1 text-sm text-gray-300">
                 <span>ليس لديك حساب؟</span>
                 <p onClick={()=>navigate("/user_sign_up")} className='text-[#25c481] hover:text-[#1e9e68] hover:cursor-pointer'>أنشئ حساباً</p>
               </div>
              </form>
          </div>
    </div>
  )
}

export default User_sign_in