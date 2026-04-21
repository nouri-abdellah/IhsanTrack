import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const [searchParams] = useSearchParams();

  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setError('رابط إعادة التعيين غير صالح.');
      return;
    }

    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل.');
      return;
    }

    if (password !== confirmPassword) {
      setError('تأكيد كلمة المرور غير مطابق.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await resetPassword({ token, password });
      setSuccess(response?.message || 'تم تغيير كلمة المرور بنجاح.');
      setTimeout(() => navigate('/user_sign_in'), 1200);
    } catch (err) {
      setError(err?.response?.data?.error || 'فشل إعادة تعيين كلمة المرور.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#10221C] flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-6 text-right">
        <h1 className="text-2xl text-white font-bold mb-2">إعادة تعيين كلمة المرور</h1>
        <p className="text-gray-400 mb-6">أدخل كلمة المرور الجديدة.</p>

        <label className="text-sm text-gray-300">كلمة المرور الجديدة</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full h-10 px-3 text-sm text-white border border-gray-700 rounded-md bg-transparent"
          required
        />

        <label className="text-sm text-gray-300 mt-4 block">تأكيد كلمة المرور</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="mt-2 w-full h-10 px-3 text-sm text-white border border-gray-700 rounded-md bg-transparent"
          required
        />

        {error ? <p className="text-red-400 text-sm mt-3">{error}</p> : null}
        {success ? <p className="text-green-400 text-sm mt-3">{success}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full h-10 text-white rounded-md bg-green-700 hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'جارٍ الحفظ...' : 'حفظ كلمة المرور الجديدة'}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
