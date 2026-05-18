/**
 * AssocEditBasicInfo.jsx
 *
 * USED ON: AssocEditProfilePage only (main right column)
 *
 * CONTAINS:
 * Card: "المعلومات الأساسية"
 *   - اسم الجمعية*       → text input  (required)
 *   - الملف الأكمل       → text input  (full official name)
 *   - بنبذة عن الجمعية* → textarea    (required, ~4 rows)
 *   - البريد الإلكتروني → email input with icon
 *   - رقم الهاتف        → tel input with phone icon
 *
 * All inputs are controlled via formData / updateField from parent.
 * Labels are right-aligned (RTL). Required fields marked with *.
 *
 * VALIDATION (basic):
 * - Name: required, minLength 3
 * - Description: required, minLength 50
 * - Email: valid email format
 * - Phone: Algerian format +213 or 0...
 *
 * Props:
 *   formData    — current form state
 *   updateField — (field, value) => void
 */
export default function AssocEditBasicInfo({ formData, updateField }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">

      {/* Card header */}
      <div className="flex items-center justify-end gap-2 px-6 py-4 border-b border-gray-800">
        <h3 className="text-white font-bold text-base">المعلومات الأساسية</h3>
        <span className="text-green-400 text-lg">📋</span>
      </div>

      <div className="p-6 space-y-5">

        {/* Row: اسم الجمعية + الملف الأكمل (2 columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="الملف الأكمل"
            required={false}
          >
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => updateField("fullName", e.target.value)}
              placeholder="الاسم الرسمي الكامل للجمعية"
              className={inputCls}
              dir="rtl"
            />
          </FormField>

          <FormField label="اسم الجمعية" required>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="اسم الجمعية المختصر"
              className={inputCls}
              dir="rtl"
            />
          </FormField>
        </div>

        {/* بنبذة عن الجمعية */}
        <FormField label="بنبذة عن الجمعية" required hint="اشرح أهداف جمعيتك وإنجازاتها باختصار. يظهر هذا في الملف العام.">
          <textarea
            value={formData.description}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder="أدخل وصفاً شاملاً للجمعية..."
            rows={5}
            className={`${inputCls} resize-none leading-relaxed`}
            dir="rtl"
          />
          <div className="flex justify-between items-center mt-1">
            <span className={`text-xs ${formData.description.length < 50 ? "text-red-400" : "text-gray-500"}`}>
              {formData.description.length < 50
                ? `${50 - formData.description.length} حرف إضافي مطلوب`
                : `${formData.description.length} حرف`}
            </span>
          </div>
        </FormField>

        {/* Divider */}
        <div className="h-px bg-gray-800" />

        {/* Row: Email + Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="رقم الهاتف">
            <div className="relative">
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="+213 5XX XXX XXX"
                className={`${inputCls} pl-10`}
                dir="ltr"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">📞</span>
            </div>
          </FormField>

          <FormField label="البريد الإلكتروني">
            <div className="relative">
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="contact@association.dz"
                className={`${inputCls} pl-10`}
                dir="ltr"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">✉️</span>
            </div>
          </FormField>
        </div>

      </div>
    </div>
  );
}

/**
 * FormField — reusable label + input wrapper (local helper)
 * Props: label, required, hint, children
 */
function FormField({ label, required, hint, children }) {
  return (
    <div className="space-y-1.5 text-right">
      <label className="block text-sm font-semibold text-gray-200">
        {label}
        {required && <span className="text-green-400 mr-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-gray-500 text-xs leading-relaxed">{hint}</p>}
    </div>
  );
}

/* Shared Tailwind input class string */
const inputCls =
  "w-full bg-gray-800 border border-gray-700 hover:border-gray-600 focus:border-green-500 focus:ring-1 focus:ring-green-500/30 text-white placeholder-gray-500 text-sm rounded-xl px-4 py-2.5 outline-none transition-all duration-200";
