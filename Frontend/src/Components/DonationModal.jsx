import { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

/**
 * DonationModal.jsx
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FILE LOCATION: src/components/DonationModal.jsx
 *
 * USED ON: Any page with campaign cards — FeaturedCampaigns, AssocCampaigns, etc.
 *
 * HOW TO USE:
 *   const [selectedCampaign, setSelectedCampaign] = useState(null);
 *   <button onClick={() => setSelectedCampaign(campaign)}>تبرع الآن</button>
 *   <DonationModal campaign={selectedCampaign} onClose={() => setSelectedCampaign(null)} />
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FLOW — 4 STEPS:
 *
 *   Step 1 — "info"
 *   ───────────────
 *   The campaign overview:
 *   - Hero image + title + status badge
 *   - Raised / goal amounts + progress bar
 *   - "عن المشروع" description (expandable)
 *   - "آخر المتبرعين" recent donors list
 *   - CTA button: "تصدق الآن ♡" → goes to step 2
 *
 *   Step 2 — "personal"   ← NEW STEP
 *   ─────────────────────────────────
 *   Personal information form (auto-filled from user session):
 *   - Section header: "معلوماتك الشخصية" + step indicator (1/2)
 *   - الاسم الكامل*     → text input (auto-filled)
 *   - رقم الهاتف*       → tel input  (auto-filled)
 *   - البريد الإلكتروني → email input (auto-filled)
 *   - الولاية           → select dropdown (48 wilayas)
 *   - تبرع بشكل مجهول  → toggle switch
 *   - "التالي — اختر المبلغ" green button → goes to step 3
 *   - "← رجوع" back to step 1
 *
 *   Step 3 — "donate"
 *   ─────────────────
 *   Amount selection:
 *   - Section header: "مبلغ التبرع" + step indicator (2/2)
 *   - Quick-select amount buttons: 500, 1000, 2000, 5000 دج
 *   - Custom amount text input
 *   - Payment method selector: CIB / Baridimob
 *   - Order summary card: name, wilaya, amount, method
 *   - "تأكيد التبرع ✓" green button → submits → step 4
 *   - "← رجوع" back to step 2
 *
 *   Step 4 — "success"
 *   ───────────────────
 *   Confirmation screen:
 *   - 💚 animated icon
 *   - "جزاك الله خيراً!" heading
 *   - Confirmation receipt card: name, amount, campaign, ref number
 *   - "إغلاق" button
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * AUTO-FILL:
 * In production, pre-fill the personal form from the logged-in user's session:
 *   const user = useAuthStore(s => s.user);  // or from context
 *   Then set AUTOFILL_USER = { name: user.name, phone: user.phone, ... }
 * Currently uses MOCK_USER_SESSION as placeholder.
 *
 * API (production):
 *   POST /api/donations
 *   Body: { campaignId, amount, paymentMethod, donorInfo, anonymous }
 */

// ── Mock logged-in user session (auto-fill source) ────────────────────────────
// In production: replace with real user from auth context/store
const MOCK_USER_SESSION = {
  name:  "محمد عبد الله",
  phone: "+213 550 123 456",
  email: "mohammed@example.com",
  wilaya: "الجزائر",
};

const QUICK_AMOUNTS   = [500, 1000, 2000, 5000];
const PAYMENT_METHODS = [
  { id: "cib",      label: "CIB",       icon: "💳", desc: "بطاقة CIB البنكية" },
  { id: "baridimob",label: "Baridimob", icon: "🏦", desc: "بريد الجزائر موبايل" },
];
const AVATAR_COLORS = [
  "bg-green-700","bg-blue-700","bg-purple-700","bg-orange-700","bg-teal-700","bg-pink-700",
];

const WILAYAS = [
  "الجزائر","وهران","قسنطينة","عنابة","سطيف","باتنة","بليدة","تلمسان","بجاية","سيدي بلعباس",
  "تيزي وزو","المسيلة","بسكرة","تبسة","ورقلة","غرداية","أدرار","تمنراست","إليزي","برج بوعريريج",
  "بومرداس","الطارف","تيندوف","تيسمسيلت","الوادي","خنشلة","سوق أهراس","تيبازة","ميلة","عين الدفلى",
  "النعامة","عين تيموشنت","غليزان","مستغانم","المدية","معسكر","سكيكدة","عنابة","قالمة","الشلف",
  "الأغواط","أم البواقي","بشار","البويرة","تمنراست","جيجل","جلفة","خنشلة","سعيدة","سكيكدة",
];

// ── input class helper ────────────────────────────────────────────────────────
const iCls = (err) =>
  `w-full bg-gray-800 border ${err ? "border-red-500 focus:border-red-400" : "border-gray-700 hover:border-gray-600 focus:border-green-500"} focus:ring-1 focus:ring-green-500/30 text-white placeholder-gray-500 text-sm rounded-xl px-4 py-2.5 outline-none transition-all duration-200`;

export default function DonationModal({ campaign, onClose }) {
  const { user, isAuthenticated } = useAuth();
  // ── step state ───────────────────────────────────────────────────────────────
  const [step, setStep] = useState("info"); // "info" | "personal" | "donate" | "success"

  // ── personal form state ──────────────────────────────────────────────────────
  const [personal, setPersonal] = useState({
    name:   MOCK_USER_SESSION.name,
    phone:  MOCK_USER_SESSION.phone,
    email:  MOCK_USER_SESSION.email,
    wilaya: MOCK_USER_SESSION.wilaya,
  });
  const [personalErrors, setPersonalErrors] = useState({});
  const [anonymous, setAnonymous] = useState(false);

  // ── amount + payment state ───────────────────────────────────────────────────
  const [amount, setAmount]           = useState(1000);
  const [customAmount, setCustomAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cib");

  // ── misc ─────────────────────────────────────────────────────────────────────
  const [submitting, setSubmitting]   = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [confirmRef, setConfirmRef]   = useState("");
  const [submitError, setSubmitError] = useState("");
  const [imageLoadError, setImageLoadError] = useState(false);
  const overlayRef = useRef(null);

  // Reset when new campaign opens
  useEffect(() => {
    if (campaign) {
      setStep("info");
      setPersonal({ name: MOCK_USER_SESSION.name, phone: MOCK_USER_SESSION.phone, email: MOCK_USER_SESSION.email, wilaya: MOCK_USER_SESSION.wilaya });
      setPersonalErrors({});
      setAnonymous(false);
      setAmount(1000);
      setCustomAmount("");
      setPaymentMethod("cib");
      setSubmitting(false);
      setDescExpanded(false);
      setImageLoadError(false);
      setSubmitError("");
      setConfirmRef("");
    }
  }, [campaign?.id]);

  // Escape key
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = campaign ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [campaign]);

  if (!campaign) return null;

  // ── derived ─────────────────────────────────────────────────────────────────
  const raised        = Number(campaign.raised ?? campaign.current_amount ?? campaign.currentAmount ?? 0);
  const goal          = Number(campaign.goal ?? campaign.goal_amount ?? campaign.goalAmount ?? 0);
  const donationsList = Array.isArray(campaign.donations) ? campaign.donations : [];
  const donorsFromList = new Set(donationsList.map((donation) => donation.user_id).filter(Boolean)).size;
  const donors        = Number(campaign.donors ?? campaign.donor_count ?? donorsFromList ?? 0);
  const progress      = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
  const recentDonors  = donationsList
    .slice()
    .sort((left, right) => new Date(right.date || 0).getTime() - new Date(left.date || 0).getTime())
    .slice(0, 3)
    .map((donation, index) => {
      const donorName = donation.anonymous
        ? "متبرع مجهول"
        : donation.donor?.full_name || donation.donor?.email || "متبرع";
      const dateValue = donation.date ? new Date(donation.date) : null;

      return {
        id: donation.id || index,
        name: donorName,
        amount: Number(donation.amount || 0),
        timeAgo: dateValue && !Number.isNaN(dateValue.getTime())
          ? dateValue.toLocaleDateString("ar-DZ")
          : "",
        avatar: donorName.charAt(0),
        anonymous: Boolean(donation.anonymous),
      };
    });
  const finalAmount   = customAmount ? Number(customAmount) : amount;
  const description   = campaign.description ?? "لا يوجد وصف متاح لهذه الحملة حالياً.";
  const coverImageRaw = campaign.coverImage ?? campaign.image_url ?? campaign.image;
  const coverImage = typeof coverImageRaw === "string" ? coverImageRaw.trim() : "";
  const hasValidCoverImage = Boolean(coverImage) && !imageLoadError;
  const associationName = campaign.association?.name ?? campaign.associationName ?? campaign.association?.user?.full_name ?? "جمعية غير محددة";
  const associationWilaya = campaign.association?.wilaya ?? campaign.associationWilaya ?? campaign.wilaya ?? "غير محددة";
  const deadline      = campaign.max_date ?? campaign.end_date ?? campaign.deadline;
  const category      = campaign.category ?? campaign.project_type ?? campaign.type;
  const createdAt     = campaign.created_at ?? campaign.createdAt;
  const deadlineDate = deadline ? new Date(deadline) : null;
  const isExpired = deadlineDate instanceof Date && !Number.isNaN(deadlineDate.getTime()) && deadlineDate < new Date();
  const isCompleted = progress >= 100;
  const canDonate = Boolean(campaign?.canDonate ?? (!isExpired && !isCompleted));
  const blockedReason = isCompleted
    ? "هذه الحملة اكتملت بالفعل ولم يعد التبرع متاحاً لها."
    : isExpired
      ? "انتهت مدة هذه الحملة ولم يعد التبرع متاحاً لها."
      : "";

  // ── validate personal form ──────────────────────────────────────────────────
  const validatePersonal = () => {
    const errs = {};
    if (!personal.name.trim())  errs.name  = "الاسم الكامل مطلوب";
    if (!personal.phone.trim()) errs.phone = "رقم الهاتف مطلوب";
    if (personal.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personal.email))
      errs.email = "البريد الإلكتروني غير صالح";
    return errs;
  };

  const handlePersonalNext = () => {
    const errs = validatePersonal();
    if (Object.keys(errs).length > 0) { setPersonalErrors(errs); return; }
    setPersonalErrors({});
    setStep("donate");
  };

  // ── submit donation ──────────────────────────────────────────────────────────
  const handleDonate = async () => {
    if (!canDonate) {
      setSubmitError(blockedReason || "التبرع غير متاح لهذه الحملة.");
      return;
    }

    if (!finalAmount || finalAmount <= 0) return;

    if (!isAuthenticated) {
      setSubmitError("يجب تسجيل الدخول قبل إتمام التبرع.");
      return;
    }

    if (user?.role === "association") {
      setSubmitError("حسابات الجمعيات غير مسموح لها بالتبرع.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const response = await api.post("/donations", {
        donation_project_id: Number(campaign.id),
        amount: Number(finalAmount),
        payment_method: paymentMethod,
        anonymous,
      });

      setConfirmRef(String(response?.data?.id || ""));
      setStep("success");
    } catch (err) {
      setSubmitError(err?.response?.data?.error || "فشل تنفيذ التبرع.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── step indicator component ─────────────────────────────────────────────────
  const StepIndicator = ({ current, total, label }) => (
    <div className="flex items-center justify-between mb-4">
      <div className="flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i < current ? "w-8 bg-green-500" : "w-4 bg-gray-700"}`} />
        ))}
      </div>
      <span className="text-gray-400 text-xs">{current}/{total}</span>
    </div>
  );

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      dir="rtl"
    >
      <div className="relative w-full max-w-2xl bg-gray-950 rounded-3xl overflow-hidden shadow-2xl shadow-black/80 flex flex-col max-h-[96vh]">

        {/* ══════════════════════ HERO IMAGE ══════════════════════ */}
        <div className="relative h-56 shrink-0 overflow-hidden">
          {hasValidCoverImage ? (
            <img
              src={coverImage}
              alt={campaign.title}
              className="w-full h-full object-cover"
              onError={() => setImageLoadError(true)}
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-green-900 via-green-800 to-gray-900 flex items-center justify-center">
              <span className="text-8xl opacity-40 select-none">{campaign.imageEmoji ?? "💧"}</span>
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, #22c55e 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/90 via-black/50 to-transparent" />
          {/* Status badge */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-green-600/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            حملة نشطة
          </div>
          {deadline ? (
            <div className="absolute top-4 left-4 bg-black/55 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/10">
              تنتهي: {new Date(deadline).toLocaleDateString("ar-DZ")}
            </div>
          ) : null}
          {/* Close */}
          <button onClick={onClose} className="absolute top-3 left-3 w-8 h-8 bg-black/50 hover:bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white/80 hover:text-white text-sm transition-all duration-200 border border-white/10" aria-label="إغلاق">✕</button>
          {/* Title */}
          <div className="absolute bottom-4 right-4 left-4">
            <h2 className="text-white text-lg font-extrabold leading-tight drop-shadow-lg line-clamp-2">{campaign.title}</h2>
          </div>
        </div>

        {/* ══════════════════════ STATS BAR ═══════════════════════ */}
        <div className="px-5 pt-4 pb-3 border-b border-gray-800/60 shrink-0">
          <div className="flex flex-wrap gap-2 justify-end mb-3">
            <DetailChip label={associationName} tone="green" />
            <DetailChip label={`الولاية: ${associationWilaya}`} tone="gray" />
            {category ? <DetailChip label={category} tone="gray" /> : null}
            {createdAt ? <DetailChip label={new Date(createdAt).toLocaleDateString("ar-DZ")} tone="gray" /> : null}
          </div>
          <div className="grid grid-cols-2 gap-3 mb-2.5">
            <div className="text-right">
              <p className="text-gray-400 text-xs mb-0.5">المبلغ المجمع</p>
              <p className="text-white text-base font-extrabold">{raised.toLocaleString("ar-DZ")} <span className="text-gray-400 text-xs font-normal">دج</span></p>
            </div>
            <div className="text-left">
              <p className="text-gray-400 text-xs mb-0.5 text-left">الهدف المنشود</p>
              <p className="text-white text-base font-extrabold text-left">{goal.toLocaleString("ar-DZ")} <span className="text-gray-400 text-xs font-normal">دج</span></p>
            </div>
          </div>
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden mb-1.5">
            <div className="h-full bg-linear-to-l from-green-400 to-green-600 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">{donors} متبرع</span>
            <span className="text-green-400 font-bold">{progress}% من الهدف</span>
          </div>
        </div>

        {/* ══════════════════════ SCROLLABLE BODY ══════════════════ */}
        <div className="flex-1 overflow-y-auto">

          {/* ─────────── STEP 1: INFO ─────────── */}
          {step === "info" && (
            <>
              {/* About */}
              <div className="px-5 pt-4 pb-3">
                <div className="flex items-center gap-2 justify-end mb-2">
                  <h3 className="text-white font-bold text-sm">عن المشروع</h3>
                  <span className="text-green-400">ℹ️</span>
                </div>
                <p className={`text-gray-300 text-sm leading-relaxed text-right ${descExpanded ? "" : "line-clamp-3"}`}>{description}</p>
                {description.length > 150 && (
                  <button onClick={() => setDescExpanded(!descExpanded)} className="text-green-400 hover:text-green-300 text-xs font-medium mt-1 transition-colors">
                    {descExpanded ? "عرض أقل ↑" : "عرض المزيد ↓"}
                  </button>
                )}
              </div>
              <div className="px-5 pb-4">
                <div className="grid grid-cols-2 gap-3 text-right">
                  <InfoRow label="الجمعية" value={associationName} />
                  <InfoRow label="الولاية" value={associationWilaya} />
                </div>
              </div>
              {/* Recent donors */}
              <div className="px-5 pb-4">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-gray-500 text-xs">{recentDonors.length > 0 ? "آخر التحديثات من قاعدة البيانات" : "لا توجد تبرعات بعد"}</span>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-bold text-sm">آخر المتبرعين</h3>
                    <span className="text-blue-400">👥</span>
                  </div>
                </div>
                {recentDonors.length === 0 ? (
                  <div className="rounded-xl border border-gray-800/60 bg-gray-900/40 px-4 py-3 text-right text-xs text-gray-500">
                    لا توجد تبرعات مسجلة لهذه الحملة حالياً.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentDonors.map((donor, idx) => (
                      <div key={donor.id ?? idx} className="flex items-center justify-between bg-gray-900/60 border border-gray-800/60 rounded-xl px-3 py-2.5">
                        <span className="text-green-400 font-bold text-sm tabular-nums">{donor.amount.toLocaleString("ar-DZ")} دج</span>
                        <div className="flex items-center gap-2.5">
                          <div className="text-right">
                            <p className="text-white text-sm font-semibold leading-tight">{donor.anonymous ? "متبرع مجهول" : donor.name}</p>
                            <p className="text-gray-500 text-xs">{donor.timeAgo || ""}</p>
                          </div>
                          <div className={`w-8 h-8 rounded-xl ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                            {donor.anonymous ? "؟" : donor.avatar ?? donor.name?.charAt(0)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ─────────── STEP 2: PERSONAL INFO ─────────── */}
          {step === "personal" && (
            <div className="px-6 py-4">
              <StepIndicator current={1} total={2} label="معلوماتك الشخصية" />

              {/* Header + autofill notice in one row */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 bg-green-900/20 border border-green-800/40 rounded-xl px-3 py-1.5">
                  <span className="text-green-400 text-xs">✓</span>
                  <p className="text-green-300 text-xs">ملء تلقائي من حسابك</p>
                </div>
                <div className="text-right">
                  <h3 className="text-white font-bold text-base">معلوماتك الشخصية</h3>
                  <p className="text-gray-400 text-xs">يمكنك تعديل البيانات قبل المتابعة</p>
                </div>
              </div>

              {/* 2-column grid for all fields */}
              <div className="grid grid-cols-2 gap-3">
                {/* الاسم الكامل */}
                <FormField label="الاسم الكامل" required error={personalErrors.name}>
                  <input
                    type="text"
                    value={personal.name}
                    onChange={(e) => setPersonal(p => ({ ...p, name: e.target.value }))}
                    placeholder="أدخل اسمك الكامل"
                    className={iCls(personalErrors.name)}
                    dir="rtl"
                  />
                </FormField>

                {/* رقم الهاتف */}
                <FormField label="رقم الهاتف" required error={personalErrors.phone}>
                  <div className="relative">
                    <input
                      type="tel"
                      value={personal.phone}
                      onChange={(e) => setPersonal(p => ({ ...p, phone: e.target.value }))}
                      placeholder="+213 5XX XXX XXX"
                      className={`${iCls(personalErrors.phone)} pl-10`}
                      dir="ltr"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">📞</span>
                  </div>
                </FormField>

                {/* البريد الإلكتروني */}
                <FormField label="البريد الإلكتروني" error={personalErrors.email}>
                  <div className="relative">
                    <input
                      type="email"
                      value={personal.email}
                      onChange={(e) => setPersonal(p => ({ ...p, email: e.target.value }))}
                      placeholder="example@gmail.com"
                      className={`${iCls(personalErrors.email)} pl-10`}
                      dir="ltr"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">✉️</span>
                  </div>
                </FormField>

                {/* الولاية */}
                <FormField label="الولاية">
                  <select
                    value={personal.wilaya}
                    onChange={(e) => setPersonal(p => ({ ...p, wilaya: e.target.value }))}
                    className={`${iCls(false)} cursor-pointer`}
                    dir="rtl"
                  >
                    <option value="">اختر الولاية</option>
                    {WILAYAS.map((w) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </FormField>
              </div>

              {/* Anonymous toggle + back */}
              <div className="mt-4 space-y-3">
                <button
                  type="button"
                  onClick={() => setAnonymous(!anonymous)}
                  className={`flex w-full cursor-pointer items-center justify-between rounded-2xl border px-3.5 py-3 text-right transition-all duration-300 ${
                    anonymous
                      ? "border-green-500 bg-green-900/20 shadow-[0_0_0_3px_rgba(34,197,94,0.14)]"
                      : "border-gray-800 bg-gray-900/60 hover:border-gray-700"
                  }`}
                  role="switch"
                  aria-checked={anonymous}
                  aria-label="تبرع بشكل مجهول"
                >
                  <div className="text-right leading-tight">
                    <p className="text-sm font-semibold text-white">تبرع بشكل مجهول</p>
                    <p className="mt-1 text-xs text-gray-400">لن يظهر اسمك في قائمة آخر المتبرعين</p>
                  </div>

                  <span
                    className={`relative inline-flex h-8 w-20 items-center rounded-full border p-1 transition-all duration-300 ${
                      anonymous
                        ? "border-green-400 bg-green-600"
                        : "border-gray-600 bg-gray-800"
                    }`}
                  >
                    <span className={`w-full text-[10px] font-extrabold tracking-wide transition-colors duration-300 ${anonymous ? "pl-2 text-left text-white" : "pr-2 text-right text-gray-300"}`}>
                      {anonymous ? "" : ""}
                    </span>
                    <span
                      className={`absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-white shadow-lg transition-all duration-300 ${anonymous ? "left-1" : "right-1"}`}
                    />
                  </span>
                </button>

                <div className="flex items-center justify-between">
                  <button onClick={() => setStep("info")} className="text-gray-500 hover:text-gray-300 text-xs transition-colors">
                    ← رجوع
                  </button>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${anonymous ? "bg-green-900/40 text-green-300 border border-green-700/60" : "bg-gray-800 text-gray-300 border border-gray-700"}`}>
                    {anonymous ? "سيظهر: متبرع مجهول" : "سيظهر: اسمك الحقيقي"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ─────────── STEP 3: AMOUNT + PAYMENT ─────────── */}
          {step === "donate" && (
            <div className="px-6 py-4">
              <StepIndicator current={2} total={2} label="مبلغ التبرع" />

              <div className="flex items-start gap-6">
                {/* LEFT COLUMN — Amount + custom + payment */}
                <div className="flex-1 space-y-3">
                  <div className="text-right">
                    <h3 className="text-white font-bold text-base">اختر مبلغ التبرع</h3>
                    <p className="text-gray-400 text-xs mt-0.5">كل دينار يصنع فرقاً في حياة أسرة محتاجة</p>
                  </div>

                  {/* Quick amounts */}
                  <div className="grid grid-cols-4 gap-2">
                    {QUICK_AMOUNTS.map((amt) => (
                      <button
                        key={amt}
                        onClick={() => { setAmount(amt); setCustomAmount(""); }}
                        className={`py-2.5 text-sm font-bold rounded-xl border transition-all duration-200 ${
                          amount === amt && !customAmount
                            ? "bg-green-600 border-green-500 text-white shadow-lg shadow-green-900/40"
                            : "bg-gray-800 border-gray-700 text-gray-300 hover:border-green-600/50 hover:text-green-300"
                        }`}
                      >
                        {amt.toLocaleString()}
                      </button>
                    ))}
                  </div>

                  {/* Custom amount */}
                  <div className="space-y-1">
                    <label className="text-gray-400 text-xs font-medium text-right block">أو أدخل مبلغاً مخصصاً (دج)</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="100"
                        value={customAmount}
                        onChange={(e) => { setCustomAmount(e.target.value); setAmount(0); }}
                        placeholder="أدخل المبلغ..."
                        className="w-full bg-gray-800 border border-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500/30 text-white placeholder-gray-500 text-sm rounded-xl px-4 py-2.5 pl-14 outline-none transition-all duration-200"
                        dir="rtl"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm select-none">دج</span>
                    </div>
                  </div>

                  {/* Payment method */}
                  <div className="space-y-1.5">
                    <p className="text-gray-400 text-xs font-medium text-right">طريقة الدفع</p>
                    <div className="grid grid-cols-2 gap-2">
                      {PAYMENT_METHODS.map((method) => (
                        <button
                          key={method.id}
                          onClick={() => setPaymentMethod(method.id)}
                          className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl border text-xs font-semibold transition-all duration-200 ${
                            paymentMethod === method.id
                              ? "bg-green-600/20 border-green-500 text-green-300"
                              : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300"
                          }`}
                        >
                          <span className="text-lg">{method.icon}</span>
                          <span>{method.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN — Order summary */}
                <div className="w-52 shrink-0 space-y-3">
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2.5 text-sm">
                    <p className="text-gray-400 text-xs font-semibold text-right mb-2">ملخص التبرع</p>
                    <SummaryRow label="المتبرع"      value={anonymous ? "مجهول" : personal.name} />
                    <SummaryRow label="الولاية"      value={personal.wilaya || "—"} />
                    <SummaryRow label="طريقة الدفع" value={PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label} />
                    <div className="h-px bg-gray-800" />
                    <div className="flex items-center justify-between">
                      <span className="text-green-400 font-extrabold text-base tabular-nums">
                        {finalAmount > 0 ? finalAmount.toLocaleString("ar-DZ") : "—"} دج
                      </span>
                      <span className="text-gray-500 text-xs">المبلغ</span>
                    </div>
                  </div>

                  {/* Back */}
                  <button onClick={() => setStep("personal")} className="text-gray-500 hover:text-gray-300 text-xs transition-colors block text-right">
                    ← رجوع
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─────────── STEP 4: SUCCESS ─────────── */}
          {step === "success" && (
            <div className="px-5 py-8 flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 bg-green-600/20 border-2 border-green-500 rounded-full flex items-center justify-center text-3xl animate-bounce">
                💚
              </div>
              <h3 className="text-white font-extrabold text-xl">جزاك الله خيراً!</h3>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                تم استلام تبرعك بنجاح. ستصلك رسالة تأكيد على {personal.email || "بريدك الإلكتروني"}.
              </p>

              {/* Receipt card */}
              <div className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-4 text-right space-y-2.5">
                <p className="text-gray-400 text-xs font-semibold mb-3 text-center">إيصال التبرع</p>
                <SummaryRow label="المتبرع"   value={anonymous ? "متبرع مجهول" : personal.name} />
                <SummaryRow label="الحملة"    value={campaign.title} small />
                <SummaryRow label="طريقة الدفع" value={PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label} />
                <div className="h-px bg-gray-800" />
                <div className="flex items-center justify-between">
                  <span className="text-green-400 font-extrabold text-lg tabular-nums">{finalAmount.toLocaleString("ar-DZ")} دج</span>
                  <span className="text-gray-400 text-xs">المبلغ المتبرع به</span>
                </div>
                {confirmRef && (
                  <p className="text-gray-600 text-xs text-center pt-1">
                    رقم المرجع: <span className="text-gray-400 font-mono">{confirmRef}</span>
                  </p>
                )}
              </div>

              <button onClick={onClose} className="px-8 py-2.5 border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 text-sm rounded-xl transition-all">
                إغلاق
              </button>
            </div>
          )}
        </div>

        {/* ══════════════════════ BOTTOM CTA ═══════════════════════ */}
        {step !== "success" && (
          <div className="px-5 py-4 bg-gray-950 border-t border-gray-800/60 shrink-0">
            {submitError ? (
              <p className="mb-3 rounded-xl border border-red-800/60 bg-red-900/20 px-3 py-2 text-right text-xs text-red-300">
                {submitError}
              </p>
            ) : null}
            {step === "info" && (
              <div className="space-y-3">
                {canDonate ? null : (
                  <div className="rounded-2xl border border-amber-800/40 bg-amber-950/20 px-4 py-3 text-right text-amber-200 text-xs leading-relaxed">
                    {blockedReason}
                  </div>
                )}
                <button
                  onClick={() => canDonate && setStep("personal")}
                  disabled={!canDonate}
                  className="w-full py-3.5 bg-linear-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 active:from-green-700 active:to-emerald-600 text-white font-extrabold text-base rounded-2xl transition-all duration-200 shadow-xl shadow-green-900/50 hover:-translate-y-0.5 flex items-center justify-center gap-2 border border-green-400/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-lg">←</span>
                  <span>{canDonate ? "تبرع الآن" : "التبرع غير متاح"}</span>
                </button>
              </div>
            )}
            {step === "personal" && (
              <button
                onClick={handlePersonalNext}
                className="w-full py-3.5 bg-green-600 hover:bg-green-500 text-white font-extrabold text-base rounded-2xl transition-all duration-200 shadow-xl shadow-green-900/50 flex items-center justify-center gap-2"
              >
                التالي — اختر المبلغ ←
              </button>
            )}
            {step === "donate" && (
              <button
                onClick={handleDonate}
                disabled={submitting || finalAmount <= 0}
                className="w-full py-3.5 bg-green-600 hover:bg-green-500 text-white font-extrabold text-base rounded-2xl transition-all duration-200 shadow-xl shadow-green-900/50 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> جاري المعالجة...</>
                ) : (
                  <>✓ تأكيد التبرع{finalAmount > 0 ? ` — ${finalAmount.toLocaleString("ar-DZ")} دج` : ""}</>
                )}
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

/* ── FormField helper ─────────────────────────────────────────────────────── */
function FormField({ label, required, error, children }) {
  return (
    <div className="space-y-1.5 text-right">
      <label className="block text-sm font-semibold text-gray-200">
        {label}{required && <span className="text-green-400 mr-1">*</span>}
      </label>
      {children}
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}

/* ── SummaryRow helper ────────────────────────────────────────────────────── */
function SummaryRow({ label, value, small }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className={`text-white font-semibold ${small ? "text-xs truncate max-w-40" : "text-sm"}`}>{value}</span>
      <span className="text-gray-500 text-xs shrink-0">{label}</span>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2">
      <p className="text-gray-500 text-xs mb-0.5">{label}</p>
      <p className="text-white text-sm font-semibold leading-snug">{value || "—"}</p>
    </div>
  );
}

function DetailChip({ label, tone }) {
  const styles = tone === "green"
    ? "bg-green-900/20 text-green-300 border-green-800/50"
    : "bg-gray-900 text-gray-300 border-gray-800";

  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-full border text-xs font-medium ${styles}`}>
      {label}
    </span>
  );
}
