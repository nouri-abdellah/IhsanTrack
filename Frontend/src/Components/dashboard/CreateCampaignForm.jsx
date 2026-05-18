import { useState } from "react";
import api from "../../api/axios";
import { fileToDataUrl } from "../../utils/fileToDataUrl";

const EMPTY_FORM = {
  title: "",
  description: "",
  domain: "عام",
  image_url: "",
  goal_amount: "",
  max_date: "",
};

const DOMAIN_OPTIONS = ["عام", "صحة", "تعليم", "إغاثة", "أيتام", "رمضان"];

export default function CreateCampaignForm({ onCreated, onCancel }) {
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

    if (!form.title.trim()) errs.title = "عنوان الحملة مطلوب";
    if (!form.description.trim() || form.description.trim().length < 10) {
      errs.description = "وصف الحملة يجب أن يكون 10 أحرف على الأقل";
    }
    if (!form.image_url.trim()) {
      errs.image_url = "صورة الحملة مطلوبة";
    }

    const goalAmount = Number(form.goal_amount);
    if (!form.goal_amount || Number.isNaN(goalAmount) || goalAmount <= 0) {
      errs.goal_amount = "المبلغ المستهدف يجب أن يكون أكبر من 0";
    }

    if (form.max_date) {
      const parsed = new Date(form.max_date);
      if (Number.isNaN(parsed.getTime())) {
        errs.max_date = "تاريخ النهاية غير صالح";
      } else if (parsed <= new Date()) {
        errs.max_date = "يجب أن يكون تاريخ النهاية في المستقبل";
      }
    }

    return errs;
  };

  const toCreatedCampaign = (campaign) => {
    const raised = Number(campaign.current_amount || 0);
    const goal = Number(campaign.goal_amount || 0);
    const progress = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;

    return {
      id: campaign.id,
      title: campaign.title,
      image: campaign.image_url,
      domain: campaign.domain || "عام",
      category: campaign.domain || "عام",
      imageEmoji: "💚",
      donors: 0,
      raised,
      goal,
      progress,
      status: progress >= 100 ? "مكتملة" : "نشطة",
      statusColor: progress >= 100 ? "blue" : "green",
      createdAt: "الآن",
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
        domain: form.domain || "عام",
        image_url: form.image_url.trim(),
        goal_amount: Number(form.goal_amount),
        current_amount: 0,
        max_date: form.max_date ? new Date(form.max_date).toISOString() : undefined,
      };

      const token = window.localStorage.getItem("token");
      const requestConfig = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : undefined;

      const response = await api.post("/donation-projects", payload, requestConfig);
      const createdCampaign = toCreatedCampaign(response.data);

      setForm(EMPTY_FORM);
      setImagePreview("");
      onCreated(createdCampaign);
    } catch (err) {
      const status = err?.response?.status;
      const details = err?.response?.data?.details;
      const firstDetail = Array.isArray(details) && details.length ? details[0]?.message : "";
      const apiError = err?.response?.data?.error;
      if (status === 403 && /verify/i.test(String(apiError || ""))) {
        setRequestError("تحقق من البريد الإلكتروني للجمعية أولاً ثم أعد المحاولة.");
      } else {
        setRequestError(firstDetail || apiError || "فشل إنشاء الحملة.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-end gap-2 px-6 py-4 border-b border-gray-800">
        <h3 className="text-white font-bold text-base">بيانات الحملة الجديدة</h3>
        <span className="text-green-400 text-lg">✏️</span>
      </div>

      <div className="p-6">
        <div className="space-y-4 text-right">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-200">
              عنوان الحملة<span className="text-green-400 mr-1">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="مثال: قفة رمضان 2026"
              className={inputCls(errors.title)}
              dir="rtl"
            />
            {errors.title ? <p className="text-red-400 text-xs">{errors.title}</p> : null}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-200">
              وصف الحملة<span className="text-green-400 mr-1">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="اكتب وصفاً مفصلاً للحملة..."
              rows={4}
              className={`${inputCls(errors.description)} resize-none leading-relaxed`}
              dir="rtl"
            />
            {errors.description ? <p className="text-red-400 text-xs">{errors.description}</p> : null}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-200">مجال الحملة</label>
            <select
              value={form.domain}
              onChange={(e) => update("domain", e.target.value)}
              className={`${inputCls(errors.domain)} cursor-pointer`}
              dir="rtl"
            >
              {DOMAIN_OPTIONS.map((domain) => (
                <option key={domain} value={domain}>{domain}</option>
              ))}
            </select>
            {errors.domain ? <p className="text-red-400 text-xs">{errors.domain}</p> : null}
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
              <img src={imagePreview} alt="معاينة صورة الحملة" className="h-36 w-full rounded-2xl object-cover border border-gray-800" />
            ) : null}
            {errors.image_url ? <p className="text-red-400 text-xs">{errors.image_url}</p> : null}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-200">
              المبلغ المستهدف (دج)<span className="text-green-400 mr-1">*</span>
            </label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={form.goal_amount}
              onChange={(e) => update("goal_amount", e.target.value)}
              placeholder="0.00"
              className={inputCls(errors.goal_amount)}
              dir="ltr"
            />
            {errors.goal_amount ? <p className="text-red-400 text-xs">{errors.goal_amount}</p> : null}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-200">تاريخ نهاية الحملة (اختياري)</label>
            <input
              type="datetime-local"
              value={form.max_date}
              onChange={(e) => update("max_date", e.target.value)}
              className={inputCls(errors.max_date)}
              dir="ltr"
            />
            {errors.max_date ? <p className="text-red-400 text-xs">{errors.max_date}</p> : null}
            <p className="text-gray-500 text-xs leading-relaxed">
              عند انتهاء التاريخ، ستُخفى الحملة تلقائياً من القوائم مثل الحملة المكتملة.
            </p>
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
              "✓ إنشاء الحملة"
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
