import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await forgotPassword(email.trim());
      setSuccess(response?.message || 'تم إرسال رابط إعادة تعيين كلمة المرور إذا كان البريد مسجلاً.');
    } catch (err) {
      setError(err?.response?.data?.error || 'تعذر إرسال رابط إعادة التعيين. حاول لاحقاً.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#10221C] flex items-center justify-center px-4 font-arabic" dir="rtl">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-6 text-right">
        <h1 className="text-2xl text-white font-bold mb-2">نسيت كلمة المرور</h1>
        <p className="text-gray-400 mb-6">أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين.</p>

        <label className="text-sm text-gray-300">البريد الإلكتروني</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
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
          {loading ? 'جارٍ الإرسال...' : 'إرسال رابط إعادة التعيين'}
        </button>

        <button
          type="button"
          onClick={() => navigate('/user_sign_in')}
          className="mt-3 w-full h-10 text-green-400 border border-green-700 rounded-md hover:bg-green-700/10"
        >
          العودة لتسجيل الدخول
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
