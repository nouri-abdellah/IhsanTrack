import z from '../assets/Icons/Vector.png';
import q from '../assets/Icons/johann-siemens-EPy0gBJzzZU-unsplash.jpg';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import AuthTopBar from '../Components/auth/AuthTopBar';
import { fileToDataUrl } from '../utils/fileToDataUrl';

const Assoc_sign_up = () => {
  const navigate = useNavigate();
  const {
    checkEmailAvailability,
    verifyRegistrationCode,
    resendRegistrationCode,
  } = useAuth();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    social_number: '',
    name: '',
    description: '',
    logo_url: '',
    wilaya: '',
    Maps_link: '',
    phone_number: '',
    opening_hours: '',
    social_media_links: '',
    agreed_to_tos: false,
  });

  const [loading, setLoading] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState('');
  const [error, setError] = useState('');
  const [verificationPending, setVerificationPending] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationMsg, setVerificationMsg] = useState('');
  const [logoPreview, setLogoPreview] = useState('');

  const onChange = (field) => (e) => {
    const value = field === 'agreed_to_tos' ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setFormData((prev) => ({ ...prev, logo_url: dataUrl }));
    setLogoPreview(dataUrl);
  };

  const handleEmailBlur = async () => {
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) return;

    setCheckingEmail(true);
    setError('');

    try {
      const result = await checkEmailAvailability(formData.email.trim());
      if (result?.exists && result?.is_verified) {
        setEmailStatus('هذا البريد الإلكتروني مستخدم مسبقاً.');
      } else if (result?.exists && !result?.is_verified) {
        setEmailStatus('البريد مسجل لكنه غير مفعل. يمكنك المتابعة لإعادة إرسال كود التحقق.');
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

  const parseSocialLinks = (raw) => {
    if (!raw.trim()) return undefined;

    const pairs = raw
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const [key, ...rest] = item.split(':');
        return [key?.trim(), rest.join(':').trim()];
      })
      .filter(([key, value]) => key && value);

    if (!pairs.length) return undefined;
    return Object.fromEntries(pairs);
  };

  const validate = () => {
    if (formData.full_name.trim().length < 2) return 'الاسم الكامل غير صالح.';
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) return 'البريد الإلكتروني غير صالح.';
    if (formData.password.length < 6) return 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.';
    if (formData.password !== formData.confirmPassword) return 'تأكيد كلمة المرور غير مطابق.';
    if (formData.phone.trim().length < 8) return 'رقم الهاتف الأساسي غير صالح.';
    if (formData.social_number.trim().length < 2) return 'رقم التسجيل الاجتماعي مطلوب.';
    if (formData.name.trim().length < 2) return 'اسم الجمعية مطلوب.';
    if (formData.description.trim().length < 10) return 'وصف الجمعية يجب أن يكون 10 أحرف على الأقل.';
    if (!formData.logo_url.trim()) return 'صورة شعار الجمعية مطلوبة.';
    if (!formData.wilaya.trim()) return 'الولاية مطلوبة.';
    if (!/^https?:\/\//.test(formData.Maps_link)) return 'رابط الخريطة يجب أن يكون URL صالح.';
    if (formData.phone_number.trim().length < 8) return 'رقم هاتف الجمعية غير صالح.';
    if (!formData.agreed_to_tos) return 'يجب الموافقة على الشروط للمتابعة.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const emailCheck = await checkEmailAvailability(formData.email.trim());
      if (emailCheck?.exists && emailCheck?.is_verified) {
        setError('هذا البريد الإلكتروني مستخدم مسبقاً.');
        setLoading(false);
        return;
      }

      const payload = {
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
        social_number: formData.social_number.trim(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        logo_url: formData.logo_url.trim(),
        wilaya: formData.wilaya.trim(),
        Maps_link: formData.Maps_link.trim(),
        phone_number: formData.phone_number.trim(),
        social_media_links: parseSocialLinks(formData.social_media_links),
        opening_hours: formData.opening_hours.trim() || undefined,
        agreed_to_tos: formData.agreed_to_tos,
      };

      const response = await api.post('/auth/register-association', payload, { skipAuthRedirect: true });
      if (response.data?.requires_email_verification) {
        setVerificationPending(true);
        setVerificationMsg('تم إرسال كود التحقق إلى بريدك الإلكتروني. أدخله لإكمال تسجيل الجمعية.');
      } else {
        navigate('/dashboard/association/profile');
      }
    } catch (err) {
      const apiError = err?.response?.data?.error;
      const details = err?.response?.data?.details;
      const firstDetail = Array.isArray(details) && details.length ? details[0]?.message : '';
      setError(firstDetail || apiError || 'فشل إنشاء حساب الجمعية.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');

    if (!/^\d{6}$/.test(verificationCode)) {
      setError('كود التحقق يجب أن يكون 6 أرقام.');
      return;
    }

    setLoading(true);

    try {
      const data = await verifyRegistrationCode({
        email: formData.email.trim(),
        code: verificationCode,
      });

      if (data?.user?.role === 'association') {
        navigate('/dashboard/association/profile');
      } else {
        navigate('/dashboard/user/profile');
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'فشل التحقق من الكود.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setLoading(true);

    try {
      const res = await resendRegistrationCode(formData.email.trim());
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
        title="إنشاء حساب جمعية"
        subtitle="أنشئ حسابك وابدأ بإدارة حملاتك"
        actionLabel="تسجيل الدخول"
        actionPath="/assoc_sign_in"
      />
      <div className="relative h-full w-1/2">
        <img className="w-full h-full object-cover" src={q} alt="" />
        <div className="absolute inset-0 bg-linear-to-b from-[#064E3B]/2 to-[#064E3B]"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
          <h2 className="text-5xl mt-110 text-white">نسعى لازدهار الجزائر</h2>
          <br />
          <p className="text-xl w-100 text-gray-400">
            من خلال طريق الاحسان نحاول الربط بين المتبرع و الجمعيات الخيرية
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center w-1/2 min-h-screen bg-[#10221C] overflow-y-auto py-16 px-6 relative">
        <form onSubmit={verificationPending ? handleVerifyCode : handleSubmit} className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl shadow-black/20 p-8 flex flex-col items-center">
          <div className="flex items-center gap-3">
            <img src={z} alt="" />
            <h2 className="text-2xl font-bold text-white">طريق الاحسان</h2>
          </div>
          <h3 className="mt-4 text-3xl font-extrabold text-white">إنشاء حساب جمعية</h3>
          <p className="mt-2 text-sm text-gray-400 text-center">
            {verificationPending
              ? 'أدخل كود التحقق المرسل إلى بريد الجمعية'
              : 'املأ بيانات الجمعية كما هي مطلوبة في النظام'}
          </p>

          <div className="mt-8 w-full space-y-4 text-right">
            {!verificationPending ? (
              <>
                <div>
                  <p className="mb-2 text-sm text-gray-300">اسم مسؤول الحساب</p>
                  <input type="text" value={formData.full_name} onChange={onChange('full_name')} placeholder="الاسم و اللقب" className="w-full h-11 px-4 text-sm text-white border border-gray-700 rounded-xl bg-gray-950/60 placeholder-gray-600 focus:border-green-500 outline-none" />
                </div>

                <div>
                  <p className="mb-2 text-sm text-gray-300">البريد الإلكتروني</p>
                  <input type="email" value={formData.email} onChange={onChange('email')} onBlur={handleEmailBlur} placeholder="name@example.com" className="w-full h-11 px-4 text-sm text-white border border-gray-700 rounded-xl bg-gray-950/60 placeholder-gray-600 focus:border-green-500 outline-none" />
                  {checkingEmail ? <p className="text-xs text-gray-400 mt-1">جارٍ التحقق من البريد...</p> : null}
                  {!checkingEmail && emailStatus ? <p className={`text-xs mt-1 ${emailStatus.includes('متاح') ? 'text-green-400' : 'text-yellow-400'}`}>{emailStatus}</p> : null}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="mb-2 text-sm text-gray-300">كلمة المرور</p>
                    <input type="password" value={formData.password} onChange={onChange('password')} placeholder="••••••••" className="w-full h-11 px-4 text-sm text-white border border-gray-700 rounded-xl bg-gray-950/60 placeholder-gray-600 focus:border-green-500 outline-none" />
                  </div>
                  <div>
                    <p className="mb-2 text-sm text-gray-300">تأكيد كلمة المرور</p>
                    <input type="password" value={formData.confirmPassword} onChange={onChange('confirmPassword')} placeholder="••••••••" className="w-full h-11 px-4 text-sm text-white border border-gray-700 rounded-xl bg-gray-950/60 placeholder-gray-600 focus:border-green-500 outline-none" />
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm text-gray-300">هاتف المسؤول</p>
                  <input type="text" value={formData.phone} onChange={onChange('phone')} placeholder="0555555555" className="w-full h-11 px-4 text-sm text-white border border-gray-700 rounded-xl bg-gray-950/60 placeholder-gray-600 focus:border-green-500 outline-none" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="mb-2 text-sm text-gray-300">رقم السجل الاجتماعي</p>
                    <input type="text" value={formData.social_number} onChange={onChange('social_number')} placeholder="social_number" className="w-full h-11 px-4 text-sm text-white border border-gray-700 rounded-xl bg-gray-950/60 placeholder-gray-600 focus:border-green-500 outline-none" />
                  </div>
                  <div>
                    <p className="mb-2 text-sm text-gray-300">اسم الجمعية</p>
                    <input type="text" value={formData.name} onChange={onChange('name')} placeholder="اسم الجمعية" className="w-full h-11 px-4 text-sm text-white border border-gray-700 rounded-xl bg-gray-950/60 placeholder-gray-600 focus:border-green-500 outline-none" />
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm text-gray-300">وصف الجمعية</p>
                  <textarea value={formData.description} onChange={onChange('description')} placeholder="وصف نشاط الجمعية" className="w-full min-h-24 px-4 py-3 text-sm text-white border border-gray-700 rounded-xl placeholder-gray-600 bg-gray-950/60 focus:border-green-500 outline-none resize-none" />
                </div>

                <div>
                  <p className="mb-2 text-sm text-gray-300">شعار الجمعية</p>
                  <label className="w-full rounded-2xl border border-dashed border-gray-700 bg-white/5 hover:border-green-500 transition-colors cursor-pointer px-4 py-4 text-center block">
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl">🖼️</span>
              <span className="text-sm text-gray-300">اختر صورة الشعار من جهازك</span>
              <span className="text-xs text-gray-500">PNG, JPG, WEBP</span>
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          </label>
                  {logoPreview ? <img src={logoPreview} alt="معاينة الشعار" className="mt-3 w-28 h-28 object-cover rounded-2xl border border-gray-800 mx-auto" /> : null}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="mb-2 text-sm text-gray-300">الولاية</p>
                    <input type="text" value={formData.wilaya} onChange={onChange('wilaya')} placeholder="مثال: الجزائر" className="w-full h-11 px-4 text-sm text-white border border-gray-700 rounded-xl bg-gray-950/60 placeholder-gray-600 focus:border-green-500 outline-none" />
                  </div>
                  <div>
                    <p className="mb-2 text-sm text-gray-300">هاتف الجمعية</p>
                    <input type="text" value={formData.phone_number} onChange={onChange('phone_number')} placeholder="0555555555" className="w-full h-11 px-4 text-sm text-white border border-gray-700 rounded-xl bg-gray-950/60 placeholder-gray-600 focus:border-green-500 outline-none" />
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm text-gray-300">رابط الخريطة</p>
                  <input type="url" value={formData.Maps_link} onChange={onChange('Maps_link')} placeholder="https://maps.google.com/..." className="w-full h-11 px-4 text-sm text-white border border-gray-700 rounded-xl bg-gray-950/60 placeholder-gray-600 focus:border-green-500 outline-none" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="mb-2 text-sm text-gray-300">ساعات العمل (اختياري)</p>
                    <input type="text" value={formData.opening_hours} onChange={onChange('opening_hours')} placeholder="08:00 - 16:00" className="w-full h-11 px-4 text-sm text-white border border-gray-700 rounded-xl bg-gray-950/60 placeholder-gray-600 focus:border-green-500 outline-none" />
                  </div>
                  <div>
                    <p className="mb-2 text-sm text-gray-300">روابط التواصل (اختياري)</p>
                    <input type="text" value={formData.social_media_links} onChange={onChange('social_media_links')} placeholder="facebook:https://...,instagram:https://..." className="w-full h-11 px-4 text-sm text-white border border-gray-700 rounded-xl bg-gray-950/60 placeholder-gray-600 focus:border-green-500 outline-none" />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input type="checkbox" checked={formData.agreed_to_tos} onChange={onChange('agreed_to_tos')} />
                  أوافق على الشروط والأحكام
                </label>
              </>
            ) : (
              <>
                <div>
                  <p className="mb-2 text-sm text-gray-300">كود التحقق (6 أرقام)</p>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full h-11 px-4 text-sm text-white border border-gray-700 rounded-xl bg-gray-950/60 placeholder-gray-600 focus:border-green-500 outline-none"
                  />
                  {verificationMsg ? <p className="text-green-400 text-xs mt-2">{verificationMsg}</p> : null}
                </div>
              </>
            )}
          </div>

          {error ? <p className="text-red-400 text-sm mt-4 text-center">{error}</p> : null}

          <button type="submit" disabled={loading} className="mt-6 w-full h-11 text-md font-bold text-white border border-green-700/50 rounded-xl bg-linear-to-r from-green-700 to-emerald-600 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? 'جارٍ المعالجة...' : verificationPending ? 'تأكيد الكود' : 'إنشاء حساب الجمعية'}
          </button>

          {verificationPending ? (
            <button
              type="button"
              disabled={loading}
              onClick={handleResendCode}
              className="w-full h-11 mt-3 text-md text-green-300 border border-green-700 rounded-xl hover:bg-green-700/10 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              إعادة إرسال الكود
            </button>
          ) : null}

          <div className="mt-4 flex items-center gap-1 text-sm text-gray-300">
            <span>لديك حساب جمعية بالفعل؟</span>
            <p onClick={() => navigate('/assoc_sign_in')} className="text-[#25c481] hover:text-[#1e9e68] hover:cursor-pointer">تسجيل الدخول</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Assoc_sign_up;
