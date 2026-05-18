import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function EventJoinModal({ event, onClose, onSuccess }) {
  const { user, isAuthenticated } = useAuth();
  const [form, setForm] = useState({ full_name: "", email: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!event) return;
    setForm({
      full_name: user?.full_name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
    setSubmitting(false);
    setError("");
    setSuccess(false);
  }, [event, user?.email, user?.full_name, user?.phone]);

  const seatsLeft = useMemo(() => {
    const max = Number(event?.max_participants || 0);
    const taken = Number(event?.spots_taken || 0);
    return Math.max(0, max - taken);
  }, [event]);

  if (!event) return null;

  const handleJoin = async () => {
    if (!isAuthenticated) {
      setError("يجب إنشاء حساب أو تسجيل الدخول قبل المشاركة.");
      return;
    }

    if (user?.role === "association") {
      setError("حسابات الجمعيات غير مسموح لها بالمشاركة في الفعاليات.");
      return;
    }

    if (!form.full_name.trim() || !form.phone.trim() || !form.email.trim()) {
      setError("يرجى إكمال بياناتك الشخصية.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await api.post(`/events/${event.id}/register`);
      setSuccess(true);
      onSuccess?.();
    } catch (err) {
      setError(err?.response?.data?.error || "فشل إرسال طلب المشاركة.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center" dir="rtl">
      <div className="w-full max-w-lg rounded-2xl border border-gray-800 bg-gray-950 text-white overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
          <h3 className="font-bold text-lg">التسجيل في الفعالية</h3>
        </div>

        <div className="p-5 space-y-4 text-right">
          <div>
            <p className="font-semibold">{event.title}</p>
            <p className="text-green-400 text-sm">{event.association?.name || "جمعية غير محددة"}</p>
            <p className="text-gray-400 text-sm">المقاعد المتبقية: {seatsLeft}</p>
          </div>

          {success ? (
            <div className="rounded-xl border border-green-800 bg-green-900/20 p-4">
              <p className="font-bold text-green-300">تم إرسال طلب المشاركة بنجاح.</p>
              <p className="text-sm text-green-200 mt-1">تم إرسال مشاركتك إلى الجمعية وهي الآن بانتظار الموافقة.</p>
            </div>
          ) : (
            <>
              {!isAuthenticated ? (
                <div className="rounded-xl border border-yellow-800 bg-yellow-900/20 p-3 text-sm text-yellow-200">
                  للتسجيل في الفعالية، يجب إنشاء حساب مستخدم أولاً.
                </div>
              ) : null}

              {user?.role === "association" ? (
                <div className="rounded-xl border border-red-800 bg-red-900/20 p-3 text-sm text-red-200">
                  حسابات الجمعيات غير مسموح لها بالمشاركة في الفعاليات.
                </div>
              ) : null}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  value={form.full_name}
                  onChange={(e) => setForm((prev) => ({ ...prev, full_name: e.target.value }))}
                  placeholder="الاسم الكامل"
                  className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5"
                />
                <input
                  value={form.phone}
                  onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="رقم الهاتف"
                  className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5"
                />
                <input
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="البريد الإلكتروني"
                  className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 sm:col-span-2"
                />
              </div>
            </>
          )}

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <div className="flex gap-2 justify-start">
            {!isAuthenticated ? (
              <a href="/user_sign_up" className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-sm font-semibold">
                إنشاء حساب
              </a>
            ) : null}

            {!success ? (
              <button
                onClick={handleJoin}
                disabled={submitting || seatsLeft <= 0 || !isAuthenticated || user?.role === "association"}
                className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-500 disabled:opacity-50 text-sm font-semibold"
              >
                {submitting ? "جاري الإرسال..." : "إرسال طلب المشاركة"}
              </button>
            ) : (
              <button onClick={onClose} className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-sm font-semibold">
                إغلاق
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
