import im from '../assets/Icons/uim.png'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
    <div className="h-screen w-full flex">
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

          <div className="flex flex-col items-center justify-center w-1/2 h-screen bg-[#10221C]">
        <form onSubmit={handleLogin} className="flex flex-col items-center">
               <h2 className="text-3xl text-white">طريق الاحسان</h2>
               <br />
               <h3 className="text-2xl text-white">تسجيل الدخول</h3>
               <br />
               <p className="text-md text-gray-400">مرحباً بك مجدداً في مجتمعنا</p>
                <br />
               <p className="text-md text-gray-300 ml-34">البريد الإلكتروني أو الهاتف</p>
               <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="أدخل البريد الإلكتروني أو رقم الهاتف" className="w-80 h-9 pr-2 pl-2 text-sm text-white  border border-gray-700 rounded-md  placeholder-gray-600" />
                <br />
               <div className="flex"><p className="text-sm ml-37 text-gray-300">كلمة المرور</p> <p onClick={() => navigate('/forgot-password')} className='text-xs text-[#25c481] hover:text-[#1e9e68] hover:cursor-pointer'>نسيت كلمة السر؟</p></div>
               <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-80 h-9 pr-2 pl-2 text-sm text-white  border border-gray-700 rounded-md  placeholder-gray-600"/>
                <br />
                {error ? <p className="text-red-400 text-sm mb-3 text-center">{error}</p> : null}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-70 h-9 pr-2 pl-2 text-md text-white border border-gray-700 rounded-md bg-green-700 hover:cursor-pointer hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول'}
                </button>
                <br />
               <div className="flex"><p className="text-sm text-gray-300 ">ليس لديك حساب؟ </p> <p onClick={()=>navigate("/user_sign_up")} className=' text-[#25c481] hover:text-[#1e9e68] hover:cursor-pointer'>أنشئ حساباً</p></div>
              </form>
          </div>
    </div>
  )
}

export default User_sign_in