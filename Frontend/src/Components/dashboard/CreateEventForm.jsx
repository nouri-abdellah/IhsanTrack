import { useState } from "react";
import api from "../../api/axios";
import { fileToDataUrl } from "../../utils/fileToDataUrl";
import { ASSOCIATION_LOCATIONS } from "../../utils/associationOptions"; // <-- Imported cities

const EMPTY_FORM = {
  title: "",
  description: "",
  image_url: "",
  start_date: "",
  end_date: "",
  location_wilaya: "",
  location_maps_link: "",
  max_participants: "",
  age_range: "",
};

export default function CreateEventForm({ onCreated, onCancel }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setRequestError("");
  };

  const handleImageFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const dataUrl = await fileToDataUrl(file);
    update("image_url", dataUrl);
    setImagePreview(dataUrl);
  };

  const validate = () => {
    const errs = {};

    if (!form.title.trim()) errs.title = "عنوان الفعالية مطلوب";
    if (!form.description.trim() || form.description.trim().length < 10) {
      errs.description = "وصف الفعالية يجب أن يكون 10 أحرف على الأقل";
    }
    if (!form.image_url.trim()) {
      errs.image_url = "صورة الفعالية مطلوبة";
    }
    if (!form.start_date) errs.start_date = "تاريخ بداية الفعالية مطلوب";
    if (!form.end_date) errs.end_date = "تاريخ نهاية الفعالية مطلوب";

    const startDate = form.start_date ? new Date(form.start_date) : null;
    const endDate = form.end_date ? new Date(form.end_date) : null;

    if (startDate && Number.isNaN(startDate.getTime())) errs.start_date = "تاريخ البداية غير صالح";
    if (endDate && Number.isNaN(endDate.getTime())) errs.end_date = "تاريخ النهاية غير صالح";
    if (startDate && endDate && endDate <= startDate) {
      errs.end_date = "تاريخ النهاية يجب أن يكون بعد تاريخ البداية";
    }

    if (!form.location_wilaya.trim()) errs.location_wilaya = "الولاية مطلوبة";
    if (!/^https?:\/\//.test(form.location_maps_link.trim())) {
      errs.location_maps_link = "رابط الموقع يجب أن يكون URL صالح";
    }

    const maxParticipants = Number(form.max_participants);
    if (!form.max_participants || !Number.isInteger(maxParticipants) || maxParticipants <= 0) {
      errs.max_participants = "العدد الأقصى للمشاركين يجب أن يكون رقماً صحيحاً أكبر من 0";
    }

    if (form.age_range && form.age_range.length > 50) {
      errs.age_range = "الفئة العمرية يجب ألا تتجاوز 50 حرفاً";
    }

    return errs;
  };

  const toCreatedEvent = (event) => {
    const maxVolunteers = Number(event.max_participants || 0);
    const volunteers = Number(event.spots_taken || 0);
    const progress = maxVolunteers > 0 ? Math.min(100, Math.round((volunteers / maxVolunteers) * 100)) : 0;

    let status = "انتظار";
    const now = Date.now();
    const start = event.start_date ? new Date(event.start_date).getTime() : now;
    const end = event.end_date ? new Date(event.end_date).getTime() : now;

    if (end < now || progress >= 100) status = "مكتملة";
    else if (start <= now && end >= now) status = "نشطة";

    return {
      id: event.id,
      title: event.title,
      image: event.image_url,
      imageEmoji: "📅",
      volunteers,
      maxVolunteers,
      raised: volunteers,
      goal: maxVolunteers,
      progress,
      status,
      statusColor: status === "نشطة" ? "green" : status === "مكتملة" ? "blue" : "yellow",
      createdAt: "الآن",
      category: event.age_range || "عام",
      description: event.description,
    };
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    setRequestError("");

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        image_url: form.image_url.trim(),
        start_date: new Date(form.start_date).toISOString(),
        end_date: new Date(form.end_date).toISOString(),
        location_wilaya: form.location_wilaya.trim(),
        location_maps_link: form.location_maps_link.trim(),
        max_participants: Number(form.max_participants),
        age_range: form.age_range.trim() || undefined,
        spots_taken: 0,
      };

      const token = window.localStorage.getItem("token");
      const requestConfig = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : undefined;

      const response = await api.post("/events", payload, requestConfig);
      const createdEvent = toCreatedEvent(response.data);

      setForm(EMPTY_FORM);
      setImagePreview("");
      onCreated(createdEvent);
    } catch (err) {
      const status = err?.response?.status;
      const details = err?.response?.data?.details;
      const firstDetail = Array.isArray(details) && details.length ? details[0]?.message : "";
      const apiError = err?.response?.data?.error;
      if (status === 403 && /verify/i.test(String(apiError || ""))) {
        setRequestError("تحقق من البريد الإلكتروني للجمعية أولاً ثم أعد المحاولة.");
      } else {
        setRequestError(firstDetail || apiError || "فشل إنشاء الفعالية.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-end gap-2 px-6 py-4 border-b border-gray-800">
        <h3 className="text-white font-bold text-base">بيانات الفعالية الجديدة</h3>
        <span className="text-green-400 text-lg">✏️</span>
      </div>

      <div className="p-6">
        <div className="space-y-4 text-right">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-200">
              عنوان الفعالية<span className="text-green-400 mr-1">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="مثال: حملة تنظيف الحي"
              className={inputCls(errors.title)}
              dir="rtl"
            />
            {errors.title ? <p className="text-red-400 text-xs">{errors.title}</p> : null}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-200">
              وصف الفعالية<span className="text-green-400 mr-1">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="اكتب وصفاً مفصلاً للفعالية..."
              rows={4}
              className={`${inputCls(errors.description)} resize-none leading-relaxed`}
              dir="rtl"
            />
            {errors.description ? <p className="text-red-400 text-xs">{errors.description}</p> : null}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-200">
              صورة الغلاف من الجهاز<span className="text-green-400 mr-1">*</span>
            </label>
            <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-700 bg-gray-900/60 px-4 py-5 text-center cursor-pointer hover:border-green-500 transition-colors">
              <span className="text-3xl">🖼️</span>
              <span className="text-sm text-gray-300 font-medium">اختر صورة من جهازك</span>
              <span className="text-xs text-gray-500">PNG, JPG, WEBP</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
            </label>
            {imagePreview ? (
              <img src={imagePreview} alt="معاينة صورة الفعالية" className="h-36 w-full rounded-2xl object-cover border border-gray-800" />
            ) : null}
            {errors.image_url ? <p className="text-red-400 text-xs">{errors.image_url}</p> : null}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-200">تاريخ البداية*</label>
              <input
                type="datetime-local"
                value={form.start_date}
                onChange={(e) => update("start_date", e.target.value)}
                className={inputCls(errors.start_date)}
                dir="ltr"
              />
              {errors.start_date ? <p className="text-red-400 text-xs">{errors.start_date}</p> : null}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-200">تاريخ النهاية*</label>
              <input
                type="datetime-local"
                value={form.end_date}
                onChange={(e) => update("end_date", e.target.value)}
                className={inputCls(errors.end_date)}
                dir="ltr"
              />
              {errors.end_date ? <p className="text-red-400 text-xs">{errors.end_date}</p> : null}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-200">الولاية*</label>
            <div className="relative">
              <select
                value={form.location_wilaya}
                onChange={(e) => update("location_wilaya", e.target.value)}
                className={`${inputCls(errors.location_wilaya)} appearance-none pr-4 pl-10 cursor-pointer`}
                dir="rtl"
              >
                <option value="">اختر الولاية</option>
                {ASSOCIATION_LOCATIONS.map((wilaya) => (
                  <option key={wilaya} value={wilaya}>{wilaya}</option>
                ))}
              </select>
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">▼</span>
            </div>
            {errors.location_wilaya ? <p className="text-red-400 text-xs">{errors.location_wilaya}</p> : null}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-200">رابط الموقع على الخريطة*</label>
            <input
              type="url"
              value={form.location_maps_link}
              onChange={(e) => update("location_maps_link", e.target.value)}
              placeholder="https://maps.google.com/..."
              className={inputCls(errors.location_maps_link)}
              dir="ltr"
            />
            {errors.location_maps_link ? <p className="text-red-400 text-xs">{errors.location_maps_link}</p> : null}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-200">العدد الأقصى للمشاركين*</label>
            <input
              type="number"
              min="1"
              step="1"
              value={form.max_participants}
              onChange={(e) => update("max_participants", e.target.value)}
              placeholder="100"
              className={inputCls(errors.max_participants)}
              dir="ltr"
            />
            {errors.max_participants ? <p className="text-red-400 text-xs">{errors.max_participants}</p> : null}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-200">الفئة العمرية (اختياري)</label>
            <input
              type="text"
              value={form.age_range}
              onChange={(e) => update("age_range", e.target.value)}
              placeholder="18-35"
              className={inputCls(errors.age_range)}
              dir="rtl"
            />
            {errors.age_range ? <p className="text-red-400 text-xs">{errors.age_range}</p> : null}
          </div>
        </div>

        {requestError ? <p className="text-red-400 text-sm mt-4 text-right">{requestError}</p> : null}

        <div className="flex items-center gap-3 justify-start mt-6 pt-5 border-t border-gray-800">
          <button
            onClick={onCancel}
            disabled={submitting}
            className="px-5 py-2.5 text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold bg-green-600 hover:bg-green-500 text-white rounded-xl transition-all duration-200 shadow-lg shadow-green-900/40 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                جاري الإنشاء...
              </>
            ) : (
              "✓ إنشاء الفعالية"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls = (hasError) =>
  `w-full bg-gray-800 border ${
    hasError ? "border-red-500 focus:border-red-400" : "border-gray-700 hover:border-gray-600 focus:border-green-500"
  } focus:ring-1 focus:ring-green-500/30 text-white placeholder-gray-500 text-sm rounded-xl px-4 py-2.5 outline-none transition-all duration-200`;