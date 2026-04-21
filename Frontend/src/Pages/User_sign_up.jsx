import z from '../assets/Icons/Vector.png'
import q from '../assets/Icons/johann-siemens-EPy0gBJzzZU-unsplash.jpg'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

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
<div className="h-screen w-full flex">
         <div className="relative h-full w-1/2">
  <img className="w-full h-full object-cover" src={q} alt="" />
  <div className="absolute inset-0 bg-linear-to-b from-[#064E3B]/2  to-[#064E3B]"></div>
  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
    <h2 className="text-5xl mt-110 text-white  ">نسعى لازدهار الجزائر</h2>
    <br />
    <p className="text-xl w-100 text-gray-400">من خلال طريق الاحسان نحاول الربط بين المتبرع و الجمعيات الخيرية </p>
  </div>
</div>

          <div className="flex flex-col items-center justify-center w-1/2 h-screen bg-[#10221C]">
      <form onSubmit={verificationPending ? handleVerifyCode : handleSubmit} className="flex flex-col items-center">
               <div className='flex gap-3 ml-30'><img src={z} alt="" /><h2 className="text-2xl text-white">  طريق الاحسان </h2></div>
               <br />
               <h3 className="text-3xl ml-20 text-white"> إنشاء حساب جديد</h3>
               <br />
               <p className="text-md text-gray-400">{verificationPending ? 'أدخل كود التحقق المرسل إلى بريدك الإلكتروني' : '  انضم إلى مجتمعنا وساهم في بناء مستقبل أفضل.  '}</p>
                <br />
               {!verificationPending ? (
                 <>
               <p className="text-md  text-gray-300 ml-55"> الاسم الكامل  </p>
               <input type="text" value={form.full_name} onChange={updateField('full_name')} placeholder="الاسم و اللقب" className="w-80 h-9 pr-2 pl-2 text-sm text-white  border border-gray-700 rounded-md  placeholder-gray-600" />
                <br />
               <p className="text-md  text-gray-300 ml-55"> البريد الإلكتروني </p>
               <input type="email" value={form.email} onChange={updateField('email')} onBlur={handleEmailBlur} placeholder="name@example.com" className="w-80 h-9 pr-2 pl-2 text-sm text-white  border border-gray-700 rounded-md  placeholder-gray-600" />
               {checkingEmail ? <p className="text-xs text-gray-400 mt-1">جارٍ التحقق من البريد...</p> : null}
               {!checkingEmail && emailStatus ? <p className={`text-xs mt-1 ${emailStatus.includes('متاح') ? 'text-green-400' : 'text-yellow-400'}`}>{emailStatus}</p> : null}
                <br />
               <p className="text-md  text-gray-300 ml-60"> رقم الهاتف</p>
               <input type="text" value={form.phone} onChange={updateField('phone')} placeholder="0555555555" className="w-80 h-9 pr-2 pl-2 text-sm text-white  border border-gray-700 rounded-md  placeholder-gray-600" />
                <br />
               <p className="text-sm text-gray-300 ml-58">الدور</p>
               <select value={form.role} onChange={updateField('role')} className="w-80 h-9 pr-2 pl-2 text-sm text-white bg-[#10221C] border border-gray-700 rounded-md">
                 <option value="donor">متبرع</option>
                 <option value="volunteer">متطوع</option>
               </select>
               <br />
               <p className="text-sm  ml-60 text-gray-300">كلمة المرور</p>
               <input type="password" value={form.password} onChange={updateField('password')} placeholder="••••••••" className="w-80 h-9 pr-2 pl-2 text-sm text-white  border border-gray-700 rounded-md  placeholder-gray-600"/>
                <br />
               <p className="text-sm  ml-55 text-gray-300"> تأكيد كلمة المرور</p>
               <input type="password" value={form.confirmPassword} onChange={updateField('confirmPassword')} placeholder="••••••••" className="w-80 h-9 pr-2 pl-2 text-sm text-white  border border-gray-700 rounded-md  placeholder-gray-600"/>
                <br />
                 </>
               ) : (
                 <>
                  <p className="text-md text-gray-300 ml-45">كود التحقق (6 أرقام)</p>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-80 h-9 pr-2 pl-2 text-sm text-white border border-gray-700 rounded-md placeholder-gray-600"
                  />
                  {verificationMsg ? <p className="text-green-400 text-xs mt-2">{verificationMsg}</p> : null}
                  <br />
                 </>
               )}
                {error ? <p className="text-red-400 text-sm mb-3 text-center">{error}</p> : null}
                <button type="submit" disabled={loading} className="w-70 h-9 pr-2 pl-2 text-md text-white border border-gray-700 rounded-md bg-green-700 hover:cursor-pointer hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed">{loading ? 'جارٍ المعالجة...' : verificationPending ? 'تأكيد الكود' : 'إنشاء الحساب'}</button>
                {verificationPending ? (
                  <button type="button" disabled={loading} onClick={handleResendCode} className="w-70 h-9 mt-3 pr-2 pl-2 text-md text-green-300 border border-green-700 rounded-md hover:bg-green-700/10 disabled:opacity-60 disabled:cursor-not-allowed">إعادة إرسال الكود</button>
                ) : null}
                <br />
               <div className="flex"><p className="text-sm text-gray-300 ">هل لديك حساب بالفعل ؟ </p> <p onClick={()=>navigate("/user_sign_in")} className=' text-[#25c481] hover:text-[#1e9e68] hover:cursor-pointer '>تسجيل الدخول</p></div>
               </form>

          </div>
    </div>
  )
}

export default User_sign_up