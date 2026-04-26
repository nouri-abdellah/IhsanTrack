/**
 * AssocEditSidebar.jsx
 *
 * USED ON: AssocEditProfilePage only (right column in RTL = left visually)
 *
 * CONTAINS TWO CARDS:
 *
 * ── Card 1: حالة الحساب ──────────────────────────────
 *   - Account type badge: "بطاقة التوثيق" (pill)
 *   - Status tag: "جزائري" (green badge)
 *   - Profile completion progress bar: e.g. 86%
 *   - Completion label + percentage
 *   - Tip: "أكمل ملفك لزيادة الثقة"
 *
 * ── Card 2: روابط التواصل الاجتماعي ─────────────────
 *   Three social link inputs:
 *   - Facebook URL   (icon: f)
 *   - Instagram URL  (icon: 📷)
 *   - الموقع الإلكتروني (icon: 🌐)
 *   Each input has a gray icon prefix on the left (RTL = right visually).
 *
 * Props:
 *   formData    — current form state
 *   updateField — (field, value) => void
 */
export default function AssocEditSidebar({ formData, updateField }) {
  const completion = formData.profileCompletion ?? 86;

  return (
    <>
      {/* ── Card 1: حالة الحساب ── */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-b border-gray-800">
          <h3 className="text-white font-bold text-sm">حالة الحساب</h3>
          <span className="text-yellow-400 text-base">✏️</span>
        </div>

        <div className="p-5 space-y-4 text-right">

          {/* Account type badge */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 bg-gray-800 border border-gray-700 px-3 py-1 rounded-full">
              {formData.accountType}
            </span>
            <span className="text-gray-400 text-xs">نوع الحساب</span>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-green-300 bg-green-900/40 border border-green-800/50 px-3 py-1 rounded-full">
              ✓ {formData.accountStatus}
            </span>
            <span className="text-gray-400 text-xs">الحالة</span>
          </div>

          {/* Profile completion */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-green-400 font-bold text-sm">{completion}%</span>
              <span className="text-gray-400 text-xs">اكتمال الملف</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-l from-green-500 to-green-700 rounded-full transition-all duration-700"
                style={{ width: `${completion}%` }}
              />
            </div>
            {completion < 100 && (
              <p className="text-gray-500 text-xs mt-2">
                أكمل ملفك لزيادة الثقة والظهور في نتائج البحث
              </p>
            )}
          </div>

          {/* Completion checklist hints */}
          <div className="space-y-1.5 pt-1">
            {[
              { label: "صورة الشعار", done: !!formData.logoImage },
              { label: "صورة الغلاف", done: !!formData.coverImage },
              { label: "البريد الإلكتروني", done: !!formData.email },
              { label: "وصف الجمعية", done: formData.description?.length >= 50 },
              { label: "الموقع الجغرافي", done: !!formData.address },
              {
                label: "روابط التواصل",
                done: !!(formData.facebook?.trim() || formData.instagram?.trim() || formData.website?.trim()),
              },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-end gap-2">
                <span className="text-xs text-gray-400">{item.label}</span>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                  item.done ? "bg-green-600 text-white" : "bg-gray-700 text-gray-500"
                }`}>
                  {item.done ? "✓" : "○"}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── Card 2: روابط التواصل الاجتماعي ── */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-b border-gray-800">
          <h3 className="text-white font-bold text-sm">روابط التواصل الاجتماعي</h3>
          <span className="text-blue-400 text-base">🔗</span>
        </div>

        <div className="p-5 space-y-4">

          {/* Facebook */}
          <SocialInput
            icon={<span className="font-black text-blue-400 text-sm">f</span>}
            placeholder="https://facebook.com/your-page"
            value={formData.facebook}
            onChange={(v) => updateField("facebook", v)}
            label="فيسبوك"
          />

          {/* Instagram */}
          <SocialInput
            icon={<span className="text-pink-400 text-sm">📷</span>}
            placeholder="https://instagram.com/your-page"
            value={formData.instagram}
            onChange={(v) => updateField("instagram", v)}
            label="إنستغرام"
          />

          {/* Website */}
          <SocialInput
            icon={<span className="text-green-400 text-sm">🌐</span>}
            placeholder="https://your-website.dz"
            value={formData.website}
            onChange={(v) => updateField("website", v)}
            label="الموقع الإلكتروني"
          />

        </div>
      </div>
    </>
  );
}

/**
 * SocialInput — icon-prefixed URL input (local helper)
 */
function SocialInput({ icon, placeholder, value, onChange, label }) {
  return (
    <div className="space-y-1 text-right">
      <label className="text-xs font-semibold text-gray-400">{label}</label>
      <div className="relative flex items-center">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-gray-800 border border-gray-700 hover:border-gray-600 focus:border-green-500 focus:ring-1 focus:ring-green-500/30 text-white placeholder-gray-600 text-xs rounded-xl pl-10 pr-3 py-2.5 outline-none transition-all duration-200"
          dir="ltr"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}
