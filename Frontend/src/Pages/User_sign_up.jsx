import z from '../assets/Icons/Vector.png'
import q from '../assets/Icons/johann-siemens-EPy0gBJzzZU-unsplash.jpg'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import AuthTopBar from '../Components/auth/AuthTopBar'

const User_sign_up = () => {
  const navigate = useNavigate();
  const {
    register,
    checkEmailAvailability,
    verifyRegistrationCode,
    resendRegistrationCode,
  } = useAuth();

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'donor',
  });
  const [loading, setLoading] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState('');
  const [error, setError] = useState('');
  const [verificationPending, setVerificationPending] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationMsg, setVerificationMsg] = useState('');

  const updateField = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const validateForm = () => {
    if (form.full_name.trim().length < 2) return 'الاسم الكامل يجب أن يحتوي على حرفين على الأقل.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'يرجى إدخال بريد إلكتروني صحيح.';
    if (form.phone.trim().length < 8) return 'رقم الهاتف غير صالح.';
    if (form.password.length < 6) return 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.';
    if (form.password !== form.confirmPassword) return 'تأكيد كلمة المرور غير مطابق.';
    return '';
  };

  const handleEmailBlur = async () => {
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return;
    setCheckingEmail(true);
    setError('');

    try {
      const result = await checkEmailAvailability(form.email);
      if (result?.exists && result?.is_verified) {
        setEmailStatus('هذا البريد الإلكتروني مسجل بالفعل.');
      } else if (result?.exists && !result?.is_verified) {
        setEmailStatus('البريد مسجل لكنه غير مفعل. يمكنك المتابعة لإعادة إرسال كود التفعيل.');
      } else {
        setEmailStatus('البريد الإلكتروني متاح.');
      }
    } catch (err) {
      setEmailStatus('تعذر التحقق من البريد حالياً.');
      setError(err?.response?.data?.error || 'تعذر التحقق من البريد الإلكتروني.');
    } finally {
      setCheckingEmail(false);
    }
  };

  const getDashboardPathByRole = (role) => (role === 'association' ? '/dashboard/association/profile' : '/dashboard/user/profile');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const emailCheck = await checkEmailAvailability(form.email);
      if (emailCheck?.exists && emailCheck?.is_verified) {
        setError('هذا البريد الإلكتروني مستخدم مسبقاً.');
        setLoading(false);
        return;
      }

      const payload = {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        role: form.role,
      };

      const data = await register(payload);
      if (data?.requires_email_verification) {
        setVerificationPending(true);
        setVerificationMsg('تم إرسال كود التحقق إلى بريدك الإلكتروني. أدخله لإكمال التسجيل.');
      } else {
        navigate(getDashboardPathByRole(data?.user?.role));
      }
    } catch (err) {
      const details = err?.response?.data?.details;
      const firstDetail = Array.isArray(details) && details.length ? details[0]?.message : '';
      setError(firstDetail || err?.response?.data?.error || 'فشل إنشاء الحساب. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(verificationCode)) {
      setError('كود التحقق يجب أن يكون 6 أرقام.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await verifyRegistrationCode({ email: form.email.trim(), code: verificationCode });
      navigate(getDashboardPathByRole(data?.user?.role));
    } catch (err) {
      setError(err?.response?.data?.error || 'فشل التحقق من الكود.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await resendRegistrationCode(form.email.trim());
      setVerificationMsg(res?.message || 'تمت إعادة إرسال كود التحقق.');
    } catch (err) {
      setError(err?.response?.data?.error || 'تعذر إعادة إرسال الكود.');
    } finally {
      setLoading(false);
    }
  };

  return (
<div className="min-h-screen w-full flex bg-gray-950 font-arabic" dir="rtl">
         <AuthTopBar
           title="إنشاء حساب مستخدم"
           subtitle="سجّل الآن كمتبرع أو متطوع"
           actionLabel="تسجيل الدخول"
           actionPath="/user_sign_in"
         />
         <div className="relative h-full w-1/2">
  <img className="w-full h-full object-cover" src={q} alt="" />
  <div className="absolute inset-0 bg-linear-to-b from-[#064E3B]/2  to-[#064E3B]"></div>
  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
    <h2 className="text-5xl mt-110 text-white  ">نسعى لازدهار الجزائر</h2>
    <br />
    <p className="text-xl w-100 text-gray-400">من خلال طريق الاحسان نحاول الربط بين المتبرع و الجمعيات الخيرية </p>
  </div>
</div>

          <div className="flex flex-col items-center justify-center w-1/2 min-h-screen bg-[#10221C] px-6 py-16 relative">
      <form onSubmit={verificationPending ? handleVerifyCode : handleSubmit} className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl shadow-black/20 p-8 flex flex-col items-center">
               <div className='flex items-center gap-3'><img src={z} alt="" /><h2 className="text-2xl font-bold text-white">طريق الاحسان</h2></div>
               <h3 className="mt-4 text-3xl font-extrabold text-white">إنشاء حساب جديد</h3>
               <p className="mt-2 text-sm text-gray-400 text-center">{verificationPending ? 'أدخل كود التحقق المرسل إلى بريدك الإلكتروني' : 'انضم إلى مجتمعنا وساهم في بناء مستقبل أفضل.'}</p>
                <div className="mt-8 w-full space-y-4">
               {!verificationPending ? (
                 <>
               <div>
                 <p className="mb-2 text-sm text-gray-300 text-right">الاسم الكامل</p>
               <input type="text" value={form.full_name} onChange={updateField('full_name')} placeholder="الاسم و اللقب" className="w-full h-11 px-4 text-sm text-white border border-gray-700 rounded-xl bg-gray-950/60 placeholder-gray-600 focus:border-green-500 outline-none" />
               </div>
               <div>
                 <p className="mb-2 text-sm text-gray-300 text-right">البريد الإلكتروني</p>
               <input type="email" value={form.email} onChange={updateField('email')} onBlur={handleEmailBlur} placeholder="name@example.com" className="w-full h-11 px-4 text-sm text-white border border-gray-700 rounded-xl bg-gray-950/60 placeholder-gray-600 focus:border-green-500 outline-none" />
               {checkingEmail ? <p className="text-xs text-gray-400 mt-1">جارٍ التحقق من البريد...</p> : null}
               {!checkingEmail && emailStatus ? <p className={`text-xs mt-1 ${emailStatus.includes('متاح') ? 'text-green-400' : 'text-yellow-400'}`}>{emailStatus}</p> : null}
               </div>
               <div>
                 <p className="mb-2 text-sm text-gray-300 text-right">رقم الهاتف</p>
               <input type="text" value={form.phone} onChange={updateField('phone')} placeholder="0555555555" className="w-full h-11 px-4 text-sm text-white border border-gray-700 rounded-xl bg-gray-950/60 placeholder-gray-600 focus:border-green-500 outline-none" />
               </div>
               <div>
                 <p className="mb-2 text-sm text-gray-300 text-right">الدور</p>
               <select value={form.role} onChange={updateField('role')} className="w-full h-11 px-4 text-sm text-white bg-[#10221C] border border-gray-700 rounded-xl focus:border-green-500 outline-none">
                 <option value="donor">متبرع</option>
                 <option value="volunteer">متطوع</option>
               </select>
               </div>
               <div>
                 <p className="mb-2 text-sm text-gray-300 text-right">كلمة المرور</p>
               <input type="password" value={form.password} onChange={updateField('password')} placeholder="••••••••" className="w-full h-11 px-4 text-sm text-white border border-gray-700 rounded-xl bg-gray-950/60 placeholder-gray-600 focus:border-green-500 outline-none"/>
               </div>
               <div>
                 <p className="mb-2 text-sm text-gray-300 text-right">تأكيد كلمة المرور</p>
               <input type="password" value={form.confirmPassword} onChange={updateField('confirmPassword')} placeholder="••••••••" className="w-full h-11 px-4 text-sm text-white border border-gray-700 rounded-xl bg-gray-950/60 placeholder-gray-600 focus:border-green-500 outline-none"/>
               </div>
                 </>
               ) : (
                 <>
                  <p className="text-sm text-gray-300 text-right w-full">كود التحقق (6 أرقام)</p>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full h-11 px-4 text-sm text-white border border-gray-700 rounded-xl bg-gray-950/60 placeholder-gray-600 focus:border-green-500 outline-none"
                  />
                  {verificationMsg ? <p className="text-green-400 text-xs mt-2">{verificationMsg}</p> : null}
                 </>
               )}
                </div>
                {error ? <p className="text-red-400 text-sm mt-4 text-center">{error}</p> : null}
                <button type="submit" disabled={loading} className="mt-6 w-full h-11 text-md font-bold text-white border border-green-700/50 rounded-xl bg-linear-to-r from-green-700 to-emerald-600 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed">{loading ? 'جارٍ المعالجة...' : verificationPending ? 'تأكيد الكود' : 'إنشاء الحساب'}</button>
                {verificationPending ? (
                  <button type="button" disabled={loading} onClick={handleResendCode} className="w-full h-11 mt-3 text-md text-green-300 border border-green-700 rounded-xl hover:bg-green-700/10 disabled:opacity-60 disabled:cursor-not-allowed">إعادة إرسال الكود</button>
                ) : null}
               <div className="mt-4 flex items-center gap-1 text-sm text-gray-300">
                 <span>هل لديك حساب بالفعل؟</span>
                 <p onClick={()=>navigate("/user_sign_in")} className='text-[#25c481] hover:text-[#1e9e68] hover:cursor-pointer'>تسجيل الدخول</p>
               </div>
               </form>

          </div>
    </div>
  )
}

export default User_sign_up