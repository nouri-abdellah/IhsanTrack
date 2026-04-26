import { useEffect, useMemo, useState, useRef } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const PAYMENT_METHODS = ["CIB", "SIM", "Baridimob"];
const QUICK_AMOUNTS = [500, 1000, 2000, 5000];

export default function DonationActionModal({ campaign, onClose, onSuccess }) {
  const { user, isAuthenticated } = useAuth();
  const overlayRef = useRef(null);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "" });
  const [amount, setAmount] = useState("1000");
  const [paymentMethod, setPaymentMethod] = useState("CIB");
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!campaign) return;
    setForm({
      full_name: user?.full_name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
    setAmount("1000");
    setPaymentMethod("CIB");
    setAnonymous(false);
    setSubmitting(false);
    setError("");
    setSuccess(false);
  }, [campaign, user?.email, user?.full_name, user?.phone]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    if (campaign) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [campaign]);

  const associationName = useMemo(
    () => campaign?.association?.name || campaign?.associationName || "جمعية غير محددة",
    [campaign]
  );

  const topDonors = useMemo(() => {
    const fromCampaignDonations = Array.isArray(campaign?.donations)
      ? [...campaign.donations]
      : [];

    if (fromCampaignDonations.length > 0) {
      return fromCampaignDonations
        .sort((left, right) => Number(right.amount || 0) - Number(left.amount || 0))
        .slice(0, 3)
        .map((donation) => ({
          id: donation.id,
          amount: Number(donation.amount || 0),
          anonymous: Boolean(donation.anonymous),
          name: donation.anonymous
            ? "متبرع مجهول"
            : donation.donor?.full_name || donation.donor?.email || "متبرع",
        }));
    }

    if (Array.isArray(campaign?.recentDonors)) {
      return campaign.recentDonors.slice(0, 3).map((donor, index) => ({
        id: donor.id || index,
        amount: Number(donor.amount || 0),
        anonymous: Boolean(donor.anonymous),
        name: donor.anonymous ? "متبرع مجهول" : donor.name || "متبرع",
      }));
    }

    return [];
  }, [campaign]);

  if (!campaign) return null;

  const amountNumber = Number(amount);

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      setError("يجب إنشاء حساب أو تسجيل الدخول قبل التبرع.");
      return;
    }

    if (user?.role === "association") {
      setError("حسابات الجمعيات لا يمكنها التبرع.");
      return;
    }

    if (!form.full_name.trim() || !form.phone.trim() || !form.email.trim()) {
      setError("يرجى إكمال بياناتك الشخصية.");
      return;
    }

    if (!amountNumber || amountNumber <= 0) {
      setError("مبلغ التبرع غير صالح.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await api.post("/donations", {
        donation_project_id: Number(campaign.id),
        amount: amountNumber,
        payment_method: paymentMethod,
        anonymous,
      });
      setSuccess(true);
      onSuccess?.();
    } catch (err) {
      setError(err?.response?.data?.error || "فشل تنفيذ التبرع.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      ref={overlayRef}
      className="fixed inset-0 z-100 bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      dir="rtl"
    >
      <div className="w-full max-w-lg rounded-2xl border border-gray-800 bg-gray-950 text-white overflow-hidden flex flex-col max-h-[92vh]">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between shrink-0">
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
          <h3 className="font-bold text-lg">التبرع للحملة</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="text-right">
            <p className="text-gray-400 text-sm">الحملة</p>
            <p className="font-semibold">{campaign.title}</p>
            <p className="text-green-400 text-sm">{associationName}</p>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-900/70 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500">حسب أعلى مبلغ تبرع</span>
              <h4 className="text-white font-semibold text-sm">أفضل 3 متبرعين</h4>
            </div>

            {topDonors.length === 0 ? (
              <p className="text-xs text-gray-500 text-right">لا توجد تبرعات بعد.</p>
            ) : (
              <div className="space-y-2">
                {topDonors.map((donor, index) => (
                  <div key={donor.id} className="flex items-center justify-between text-xs">
                    <span className="text-green-400 font-bold tabular-nums">
                      {Number(donor.amount || 0).toLocaleString("ar-DZ")} دج
                    </span>
                    <div className="flex items-center gap-2">
                      {donor.anonymous ? (
                        <span className="px-2 py-0.5 rounded-full border border-gray-700 text-gray-300">مجهول</span>
                      ) : null}
                      <span className="text-gray-200">{donor.name}</span>
                      <span className="text-gray-500">#{index + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {success ? (
            <div className="rounded-xl border border-green-800 bg-green-900/20 p-4 text-right">
              <p className="font-bold text-green-300">تم إرسال التبرع بنجاح.</p>
              <p className="text-sm text-green-200 mt-1">تم إشعار الجمعية بمشاركتك.</p>
            </div>
          ) : (
            <>
              {!isAuthenticated ? (
                <div className="rounded-xl border border-yellow-800 bg-yellow-900/20 p-3 text-sm text-yellow-200">
                  للتبرع، يجب إنشاء حساب مستخدم أولاً.
                </div>
              ) : null}

              {user?.role === "association" ? (
                <div className="rounded-xl border border-red-800 bg-red-900/20 p-3 text-sm text-red-200">
                  حسابات الجمعيات غير مسموح لها بالتبرع.
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

              <div className="flex items-center justify-between rounded-xl border border-gray-800 bg-gray-900/70 px-4 py-3">
                <button
                  type="button"
                  onClick={() => setAnonymous((value) => !value)}
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${anonymous ? "bg-green-600 text-white" : "bg-gray-800 text-gray-300"}`}
                >
                  <span className={`w-2 h-2 rounded-full ${anonymous ? "bg-white" : "bg-gray-500"}`} />
                  {anonymous ? "التبرع كمتبرع مجهول" : "التبرع بشكل مجهول"}
                </button>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">وضع الخصوصية</p>
                  <p className="text-xs text-gray-400">عند التفعيل، لا يتم إرسال بياناتك الشخصية حتى لمدير الجمعية</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-300 mb-2 text-right">اختر المبلغ</p>
                <div className="flex flex-wrap gap-2 justify-end mb-2">
                  {QUICK_AMOUNTS.map((value) => (
                    <button
                      key={value}
                      onClick={() => setAmount(String(value))}
                      className={`px-3 py-1.5 rounded-lg border text-sm ${amount === String(value) ? "bg-green-600 border-green-500" : "bg-gray-900 border-gray-700"}`}
                    >
                      {value} دج
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5"
                />
              </div>

              <div>
                <p className="text-sm text-gray-300 mb-2 text-right">طريقة الدفع</p>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5"
                >
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {error ? <p className="text-sm text-red-400 text-right">{error}</p> : null}

          <div className="flex gap-2 justify-start">
            {!isAuthenticated ? (
              <a href="/user_sign_up" className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-sm font-semibold">
                إنشاء حساب
              </a>
            ) : null}

            {!success ? (
              <button
                onClick={handleSubmit}
                disabled={submitting || !isAuthenticated || user?.role === "association"}
                className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-500 disabled:opacity-50 text-sm font-semibold"
              >
                {submitting ? "جاري الإرسال..." : "تأكيد التبرع"}
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
