import { useState, useEffect, useRef } from "react";

/**
 * EventRegistrationModal.jsx
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT IT IS:
 * A popup modal that appears when a user clicks "سجّل الآن" on any volunteer
 * event card. It shows event details and lets the user register their seat.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHERE TO PUT THIS FILE:
 *   src/components/EventRegistrationModal.jsx
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * HOW TO USE IN ANY PARENT COMPONENT:
 *
 *   import EventRegistrationModal from "../components/EventRegistrationModal";
 *
 *   const [selectedEvent, setSelectedEvent] = useState(null);
 *
 *   // On event card button click:
 *   <button onClick={() => setSelectedEvent(event)}>سجّل الآن</button>
 *
 *   // At bottom of JSX:
 *   <EventRegistrationModal
 *     event={selectedEvent}
 *     onClose={() => setSelectedEvent(null)}
 *   />
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ALREADY WIRED INTO:
 *   - AssocUpcomingEvents.jsx  (association public profile page)
 *   - (wire into any future events listing page the same way)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * MODAL SECTIONS (top to bottom, matching screenshot):
 *
 *   1. HERO IMAGE
 *      - Full-width event cover image (~200px tall)
 *      - "X مقعداً متبقياً" seats-remaining badge (bottom-right of image)
 *      - ✕ close button (top-left)
 *
 *   2. EVENT IDENTITY
 *      - Event title (large, centered, bold)
 *      - Association name with 📍 icon (green, centered, clickable)
 *
 *   3. DATE / TIME CARDS
 *      - Two side-by-side info cards:
 *          التاريخ — date string + 📅 icon
 *          الوقت   — time string + 🕐 icon
 *
 *   4. LOCATION CARD
 *      - Full-width card: الموقع label + location string + 📍 icon
 *      - "خرائط جوجل" link (opens Google Maps)
 *
 *   5. ملاحظات (Notes)
 *      - Section header with 📋 icon
 *      - List of notes, each with a ✅ green checkmark
 *
 *   6. CTA BUTTON
 *      - "حجز مكاني الآن" full-width green button
 *      - Shows loading spinner while registering
 *      - After success → shows confirmation step
 *
 *   7. PRIVACY DISCLAIMER
 *      - Small gray text below button
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * PROPS:
 *   event   — event object (see shape below) or null (modal hidden when null)
 *   onClose — function called when user closes the modal
 *
 * EVENT OBJECT SHAPE:
 * {
 *   id, title, coverImage, imageEmoji,
 *   association, assocId,
 *   date,           // e.g. "15 أكتوبر 2023"
 *   time,           // e.g. "9:00 صباحاً"
 *   location,       // e.g. "جبال الأطلس المتوسط، المغرب"
 *   mapsLink,       // Google Maps URL
 *   seatsLeft,      // number of seats remaining
 *   notes,          // string[] — list of requirements/notes
 *   category,
 * }
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * API (production):
 *   POST /api/events/:id/register   → registers current user for the event
 *   Response: { success, confirmationCode }
 */

export default function EventRegistrationModal({ event, onClose }) {
  const [step, setStep] = useState("details"); // "details" | "success"
  const [registering, setRegistering] = useState(false);
  const overlayRef = useRef(null);

  // Reset when new event opens
  useEffect(() => {
    if (event) {
      setStep("details");
      setRegistering(false);
    }
  }, [event?.id]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    if (event) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [event]);

  if (!event) return null;

  // ── Default values (fallback if event data is incomplete) ──────────────────
  const maxParticipants = Number(event.max_participants ?? event.maxParticipants ?? 12);
  const spotsTaken = Number(event.spots_taken ?? event.spotsTaken ?? 0);
  const seatsLeft  = event.seatsLeft ?? Math.max(0, maxParticipants - spotsTaken);
  const startDate  = event.start_date ?? event.date ?? "15 أكتوبر 2023";
  const endDate    = event.end_date ?? event.date ?? "15 أكتوبر 2023";
  const location   = event.location_wilaya ?? event.location ?? "جبال الأطلس المتوسط، المغرب";
  const mapsLink   = event.location_maps_link ?? event.mapsLink ?? `https://maps.google.com/?q=${encodeURIComponent(location)}`;
  const coverImage = event.coverImage ?? event.image_url ?? event.image;
  const description = event.description ?? "فعالية تطوعية تهدف إلى جمع المشاركين حول مبادرة مجتمعية مفيدة ومؤثرة.";
  const ageRange   = event.age_range ?? event.ageRange;
  const association = event.association?.name ?? event.associationName ?? "جمعية أطلس الخضراء";
  const assocId = event.assocId ?? event.association?.id;
  const time = formatEventTime(startDate);
  const notes      = event.notes ?? [
    "أحذية مريحة مخصصة للمشي الجبلي",
    "قارورة ماء قابلة لإعادة التعبئة",
    "قفازات عمل وقبعة للحماية من الشمس",
  ];
  const details = [
    { label: "التاريخ", value: formatEventDate(startDate) },
    { label: "الوقت", value: time },
    { label: "المقاعد", value: `${spotsTaken} / ${maxParticipants}` },
    { label: "حتى", value: formatEventDate(endDate) },
  ];

  // ── Registration handler ────────────────────────────────────────────────────
  const handleRegister = async () => {
    setRegistering(true);
    // In production: await fetch(`/api/events/${event.id}/register`, { method: "POST" })
    await new Promise((r) => setTimeout(r, 1300));
    setRegistering(false);
    setStep("success");
  };

  return (
    /* ── Backdrop ── */
    <div
      ref={overlayRef}
      className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      dir="rtl"
    >
      {/* ── Modal container ── */}
      <div className="relative w-full max-w-sm bg-gray-950 rounded-3xl overflow-hidden shadow-2xl shadow-black/80 flex flex-col max-h-[92vh]">

        {/* ════════════════════════════════════════════════════ */}
        {/* SECTION 1 — HERO IMAGE                             */}
        {/* ════════════════════════════════════════════════════ */}
        <div className="relative h-52 shrink-0 overflow-hidden">
          {coverImage ? (
            <img
              src={coverImage}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-green-800 via-green-900 to-gray-900 flex items-center justify-center">
              <span className="text-8xl opacity-30 select-none">{event.imageEmoji ?? "🌱"}</span>
              {/* dot pattern */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: "radial-gradient(circle, #22c55e 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              />
            </div>
          )}

          {/* Subtle bottom gradient */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-gray-950/60 to-transparent" />

          {seatsLeft > 0 && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-green-600/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              <span>👥</span>
              <span>{seatsLeft} مقعداً متبقياً</span>
            </div>
          )}

          {seatsLeft === 0 && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-red-600/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              <span>⚠️</span>
              <span>المقاعد ممتلئة</span>
            </div>
          )}

          {/* ✕ Close button — top left (RTL layout) */}
          <button
            onClick={onClose}
            className="absolute top-3 left-3 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-gray-800 hover:text-gray-950 text-sm font-bold transition-all duration-200 shadow-md"
            aria-label="إغلاق"
          >
            ✕
          </button>

          {/* Seats remaining badge — bottom right of image */}
          {seatsLeft > 0 && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-green-600/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              <span>👥</span>
              <span>{seatsLeft} مقعداً متبقياً</span>
            </div>
          )}

          {seatsLeft === 0 && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-red-600/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              <span>⚠️</span>
              <span>المقاعد ممتلئة</span>
            </div>
          )}
        </div>

        {/* ════════════════════════════════════════════════════ */}
        {/* SCROLLABLE BODY                                     */}
        {/* ════════════════════════════════════════════════════ */}
        <div className="flex-1 overflow-y-auto">

          {step === "details" && (
            <>
              {/* ── SECTION 2 — EVENT IDENTITY ── */}
              <div className="px-5 pt-5 pb-4 text-center border-b border-gray-800/60">
                <h2 className="text-white text-xl font-extrabold leading-tight mb-2">
                  {event.title}
                </h2>
                <a
                  href={assocId ? `/associations/${assocId}` : "#"}
                  className="inline-flex items-center gap-1.5 text-green-400 hover:text-green-300 text-sm font-medium transition-colors"
                >
                  <span>📍</span>
                  <span>بواسطة {association}</span>
                </a>
                <p className="text-gray-400 text-sm leading-relaxed mt-3 text-right">
                  {description}
                </p>
              </div>

              {/* ── SECTION 3 — QUICK DETAILS ── */}
              <div className="px-5 pt-4 pb-3 grid grid-cols-2 gap-3">
                {details.map((item) => (
                  <InfoCard
                    key={item.label}
                    label={item.label}
                    value={item.value}
                    icon={
                      <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                      </svg>
                    }
                  />
                ))}
              </div>

              {/* ── SECTION 4 — LOCATION CARD ── */}
              <div className="px-5 pb-4">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
                  <a
                    href={mapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-300 text-xs font-semibold transition-colors shrink-0"
                  >
                    خرائط جوجل
                  </a>
                  <div className="flex items-center gap-2 text-right min-w-0">
                    <div className="min-w-0">
                      <p className="text-gray-500 text-xs mb-0.5">الموقع</p>
                      <p className="text-white text-sm font-semibold leading-snug">{location}</p>
                    </div>
                    <div className="w-9 h-9 bg-green-900/40 border border-green-800/50 rounded-xl flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                        <circle cx="12" cy="9" r="2.5" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── SECTION 5 — ملاحظات ── */}
              <div className="px-5 pb-5">
                <div className="flex items-center justify-end gap-2 mb-3">
                  <h3 className="text-white font-bold text-sm">ملاحظات:</h3>
                  <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>

                <ul className="space-y-2.5">
                  {notes.map((note, idx) => (
                    <li key={idx} className="flex items-center gap-3 justify-end">
                      <span className="text-gray-300 text-sm text-right leading-snug">{note}</span>
                      <span className="w-5 h-5 bg-green-600/20 border border-green-700/50 rounded-full flex items-center justify-center shrink-0">
                        <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* ── SUCCESS STEP ── */}
          {step === "success" && (
            <div className="px-5 py-10 flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 bg-green-600/20 border-2 border-green-500 rounded-full flex items-center justify-center text-3xl">
                ✅
              </div>
              <h3 className="text-white font-extrabold text-xl">تم تسجيلك بنجاح!</h3>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                تم حجز مقعدك في الفعالية. ستصلك رسالة تأكيد على بريدك الإلكتروني قريباً.
              </p>

              {/* Confirmation card */}
              <div className="w-full bg-green-900/20 border border-green-800/40 rounded-2xl px-5 py-4 text-right space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-green-400 font-semibold">{date}</span>
                  <span className="text-gray-400">التاريخ</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-400 font-semibold">{time}</span>
                  <span className="text-gray-400">الوقت</span>
                </div>
                <div className="h-px bg-green-800/30" />
                <p className="text-gray-300 text-xs">{location}</p>
              </div>

              <button
                onClick={onClose}
                className="mt-1 px-8 py-2.5 border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 text-sm rounded-xl transition-all"
              >
                إغلاق
              </button>
            </div>
          )}
        </div>

        {/* ════════════════════════════════════════════════════ */}
        {/* SECTION 6 — BOTTOM CTA                             */}
        {/* ════════════════════════════════════════════════════ */}
        {step === "details" && (
          <div className="px-5 pt-3 pb-5 bg-gray-950 border-t border-gray-800/60 shrink-0">
            <button
              onClick={seatsLeft > 0 ? handleRegister : undefined}
              disabled={registering || seatsLeft === 0}
              className={`w-full py-4 font-extrabold text-base rounded-2xl transition-all duration-200 flex items-center justify-center gap-2
                ${seatsLeft === 0
                  ? "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
                  : "bg-green-600 hover:bg-green-500 active:bg-green-700 text-white shadow-xl shadow-green-900/50 hover:shadow-green-700/40 hover:-translate-y-0.5"
                }
                disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none`}
            >
              {registering ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري التسجيل...
                </>
              ) : seatsLeft === 0 ? (
                "المقاعد ممتلئة"
              ) : (
                "حجز مكاني الآن"
              )}
            </button>

            {/* Privacy disclaimer */}
            {seatsLeft > 0 && (
              <p className="text-gray-600 text-xs text-center mt-2 leading-relaxed">
                بالنقر على «حجز»، فإنك توافق على{" "}
                <a href="/terms" className="text-gray-500 hover:text-gray-400 underline transition-colors">
                  شروط الخدمة
                </a>{" "}
                وسياسة الخصوصية الخاصة بالجمعية.
              </p>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

function formatEventDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ar-DZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function formatEventTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "غير محدد";
  }

  return new Intl.DateTimeFormat("ar-DZ", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/* ── InfoCard helper ── */
/**
 * InfoCard — the date/time info boxes (local helper, not exported)
 * Props: label, value, icon (JSX)
 */
function InfoCard({ label, value, icon }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-3 flex items-center justify-between gap-2">
      <div className="w-9 h-9 bg-green-900/40 border border-green-800/50 rounded-xl flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="text-right min-w-0">
        <p className="text-gray-500 text-xs mb-0.5">{label}</p>
        <p className="text-white text-sm font-bold leading-snug">{value}</p>
      </div>
    </div>
  );
}
