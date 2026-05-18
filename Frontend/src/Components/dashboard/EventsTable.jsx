import { useState } from "react";
import api from "../../api/axios";
import { fileToDataUrl } from "../../utils/fileToDataUrl";
import { ASSOCIATION_LOCATIONS } from "../../utils/associationOptions";

const STATUS_TABS = ["الجميع", "نشطة", "انتظار", "مكتملة"];

const STATUS_STYLES = {
  نشطة:   { pill: "bg-green-900/40 text-green-300 border-green-800/50",   dot: "bg-green-400" },
  انتظار: { pill: "bg-yellow-900/40 text-yellow-300 border-yellow-800/50", dot: "bg-yellow-400" },
  مكتملة: { pill: "bg-blue-900/40 text-blue-300 border-blue-800/50",     dot: "bg-blue-400" },
  ملغاة:  { pill: "bg-red-900/40 text-red-300 border-red-800/50",        dot: "bg-red-400" },
};

const ITEMS_PER_PAGE = 5;

export default function EventsTable({
  events,
  volunteers,
  selectedEvent,
  setSelectedEvent,
  onRefresh,
}) {
  const [activeTab, setActiveTab] = useState("الجميع");
  const [page, setPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [requestError, setRequestError] = useState("");

  if (!events || events.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center empty-state">
        <h3 className="text-white text-lg font-bold">لا توجد فعاليات</h3>
        <p className="text-gray-400 text-sm mt-2">
          لم تقم بإنشاء أي فعالية تطوعية بعد. انقر على "إنشاء فعالية جديدة" للبدء!
        </p>
      </div>
    );
  }

  const filtered = activeTab === "الجميع"
    ? events
    : events.filter((e) => e.status === activeTab);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleDelete = async (id) => {
    setBusyId(id);
    setRequestError("");
    try {
      await api.delete(`/events/${id}`);
      if (selectedEvent?.id === id) setSelectedEvent(null);
      setDeleteConfirm(null);
      await onRefresh?.();
    } catch (err) {
      setRequestError(err?.response?.data?.error || "تعذر حذف الفعالية.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDecision = async (eventId, userId, decision) => {
    setBusyId(userId);
    setRequestError("");
    try {
      await api.patch(`/events/${eventId}/applications/${userId}/${decision}`);
      await onRefresh?.();
    } catch (err) {
      setRequestError(err?.response?.data?.error || "تعذر تحديث حالة الطلب.");
    } finally {
      setBusyId(null);
    }
  };

  const eventVolunteers = selectedEvent ? (volunteers[selectedEvent.id] || []) : [];

  return (
    <div className="relative">
      <div className="transition-all duration-300 w-full">
        {/* Section header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-white">آخر الفعاليات</h2>
            <div className="w-1 h-5 bg-green-500 rounded-full" />
          </div>

          <div className="flex items-center gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setPage(1); }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                  activeTab === tab
                    ? "bg-green-600 text-white shadow-sm"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Table card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-900/80">
                  <th className="px-4 py-3.5 text-gray-400 font-semibold text-xs whitespace-nowrap">الفعالية</th>
                  <th className="px-4 py-3.5 text-gray-400 font-semibold text-xs whitespace-nowrap">التقدم</th>
                  <th className="px-4 py-3.5 text-gray-400 font-semibold text-xs whitespace-nowrap text-center">المسجلون</th>
                  <th className="px-4 py-3.5 text-gray-400 font-semibold text-xs whitespace-nowrap text-center">الحالة</th>
                  <th className="px-4 py-3.5 text-gray-400 font-semibold text-xs whitespace-nowrap text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/70">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-500 text-sm">
                      لا توجد فعاليات في هذه الفئة
                    </td>
                  </tr>
                ) : (
                  paginated.map((event) => (
                    <EventRow
                      key={event.id}
                      event={event}
                      isSelected={selectedEvent?.id === event.id}
                      onViewVolunteers={() =>
                        setSelectedEvent(selectedEvent?.id === event.id ? null : event)
                      }
                      onEditRequest={() => setEditingEvent(event)}
                      onDeleteRequest={() => setDeleteConfirm(event.id)}
                      volunteerCount={(volunteers[event.id] || []).length}
                      disabled={busyId === event.id}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-800 bg-gray-900/50">
            <p className="text-gray-500 text-xs">
              عرض {Math.min((page - 1) * ITEMS_PER_PAGE + 1, filtered.length)}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} من {filtered.length} فعالية
            </p>
            <div className="flex items-center gap-1.5" dir="ltr">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                    page === p
                      ? "bg-green-600 text-white border border-green-600"
                      : "border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Volunteers Drawer ── */}
      <VolunteersDrawer
        event={selectedEvent}
        volunteers={eventVolunteers}
        busyId={busyId}
        onClose={() => setSelectedEvent(null)}
        onAccept={(volunteerId) => handleDecision(selectedEvent.id, volunteerId, "accept")}
        onReject={(volunteerId) => handleDecision(selectedEvent.id, volunteerId, "reject")}
      />

      {requestError ? (
        <p className="text-red-400 text-sm mt-3 text-right">{requestError}</p>
      ) : null}

      {editingEvent ? (
        <EditEventModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSaved={async () => {
            setEditingEvent(null);
            await onRefresh?.();
          }}
        />
      ) : null}

      {/* Delete modal */}
      {deleteConfirm !== null && (
        <DeleteModal
          loading={busyId === deleteConfirm}
          onConfirm={() => handleDelete(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}

function EventRow({ event, isSelected, onViewVolunteers, onEditRequest, onDeleteRequest, volunteerCount, disabled }) {
  const statusStyle = STATUS_STYLES[event.status] || STATUS_STYLES["انتظار"];

  return (
    <tr className={`hover:bg-gray-800/30 transition-colors group ${isSelected ? "bg-green-950/20" : ""}`}>
      {/* الفعالية */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3 justify-start">
          <div className="w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center overflow-hidden shrink-0">
            {event.image ? (
              <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl">{event.imageEmoji}</span>
            )}
          </div>
          <div className="text-right">
            <p className="text-white font-semibold text-sm leading-snug group-hover:text-green-100 transition-colors">
              {event.title}
            </p>
            <p className="text-gray-500 text-xs mt-0.5 flex items-center gap-1 justify-start">
              <span>{event.createdAt}</span>
              <span>•</span>
              <span>🤝 {event.volunteers} متطوع</span>
            </p>
          </div>
        </div>
      </td>

      {/* التقدم */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2 justify-start w-32">
          <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                event.progress >= 100 ? "bg-blue-500" : event.progress >= 50 ? "bg-green-500" : "bg-yellow-500"
              }`}
              style={{ width: `${Math.min(100, event.progress)}%` }}
            />
          </div>
          <span className={`text-xs font-bold tabular-nums w-8 ${
            event.progress >= 100 ? "text-blue-400" : "text-green-400"
          }`}>
            {event.progress}%
          </span>
        </div>
      </td>

      {/* المسجلون */}
      <td className="px-4 py-3.5 text-center">
        <div className="text-white font-semibold text-sm">
          {event.volunteers.toLocaleString("ar-DZ")}
        </div>
        <div className="text-gray-500 text-xs mt-0.5">
          من أصل {event.maxVolunteers.toLocaleString("ar-DZ")}
        </div>
      </td>

      {/* الحالة */}
      <td className="px-4 py-3.5 text-center">
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${statusStyle.pill}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
          {event.status}
        </span>
      </td>

      {/* إجراءات */}
      <td className="px-4 py-3.5">
        <div className="flex items-center justify-end gap-1.5">
          <button
            title="حذف"
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-700 text-gray-500 text-xs transition-all duration-200 hover:bg-red-900/40 hover:border-red-700/50 hover:text-red-300"
            onClick={onDeleteRequest}
            disabled={disabled}
          >
            🗑
          </button>
          <button
            title="تعديل"
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-700 text-gray-500 text-xs transition-all duration-200 hover:bg-green-900/40 hover:border-green-700/50 hover:text-green-300"
            onClick={onEditRequest}
            disabled={disabled}
          >
            ✏️
          </button>
          <button
            title="عرض المتطوعين"
            onClick={onViewVolunteers}
            className={`w-7 h-7 flex items-center justify-center rounded-lg border text-xs transition-all duration-200
              ${isSelected
                ? "bg-green-600 border-green-500 text-white"
                : "border-gray-700 text-gray-500 hover:bg-green-900/40 hover:border-green-700/50 hover:text-green-300"
              }`}
          >
            👥
            {volunteerCount > 0 && (
              <span className="sr-only">{volunteerCount}</span>
            )}
          </button>
        </div>
      </td>
    </tr>
  );
}

function VolunteersDrawer({ event, volunteers, onClose, onAccept, onReject, busyId }) {
  if (!event) return null;

  const AVATAR_COLORS = [
    "bg-green-700", "bg-blue-700", "bg-purple-700",
    "bg-orange-700", "bg-pink-700", "bg-teal-700",
  ];

  return (
    <>
      {/* إزالة backdrop-blur-sm من هنا، لتصبح الخلفية شفافة داكنة فقط 
      */}
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* القائمة تنزلق من اليسار */}
      <div className="fixed left-0 top-0 h-full w-80 bg-gray-900 border-r border-gray-800 z-50 shadow-2xl shadow-black/60 flex flex-col transform transition-transform duration-300">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 shrink-0">
          <div className="text-right flex-1">
            <h3 className="text-white font-bold text-sm">المتطوعون المسجلون</h3>
            <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">{event.title}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-all duration-200 text-sm mr-2"
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-3 border-b border-gray-800/60 shrink-0">
          <div className="flex items-center justify-start gap-2">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
              volunteers.length > 0
                ? "text-green-300 bg-green-900/40 border-green-800/50"
                : "text-gray-500 bg-gray-800 border-gray-700"
            }`}>
              {volunteers.length} متطوع مسجّل
            </span>
            <span className="text-gray-400 text-xs">إجمالي</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {volunteers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3 text-center">
              <span className="text-4xl opacity-30">🤝</span>
              <p className="text-gray-500 text-sm">لا يوجد متطوعون مسجلون في هذه الفعالية بعد</p>
            </div>
          ) : (
            volunteers.map((vol, idx) => (
              <div
                key={vol.id}
                className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-3 text-right hover:border-gray-600 transition-colors group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 flex-1 justify-start">
                    <div className={`w-8 h-8 rounded-xl ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                      {vol.avatar}
                    </div>
                    <div className="text-right min-w-0">
                      <p className="text-white font-semibold text-sm leading-snug">{vol.name}</p>
                      <p className="text-gray-500 text-xs mt-0.5 truncate">{vol.email}</p>
                      <p className="text-gray-400 text-xs mt-0.5 flex items-center gap-1 justify-start">
                        <span>{vol.phone}</span>
                        <span>•</span>
                        <span>📍 {vol.wilaya}</span>
                      </p>
                      <p className="text-gray-600 text-xs mt-0.5">{vol.joinedAt}</p>
                    </div>
                  </div>

                  <div className="shrink-0 mt-1 flex flex-col gap-1.5">
                    <span className={`text-[11px] font-semibold px-2 py-1 rounded-full border text-center ${
                      vol.status === "accepted"
                        ? "text-green-300 bg-green-900/30 border-green-800/50"
                        : vol.status === "rejected"
                        ? "text-red-300 bg-red-900/30 border-red-800/50"
                        : "text-yellow-300 bg-yellow-900/30 border-yellow-800/50"
                    }`}>
                      {vol.status === "accepted" ? "مقبول" : vol.status === "rejected" ? "مرفوض" : "قيد المراجعة"}
                    </span>
                    <button
                      onClick={() => onAccept(vol.id)}
                      disabled={busyId === vol.id || vol.status === "accepted"}
                      className="px-2 py-1 text-xs text-green-300 border border-green-800/60 rounded-lg hover:bg-green-900/30 disabled:opacity-40 transition-colors"
                    >
                      قبول
                    </button>
                    <button
                      onClick={() => onReject(vol.id)}
                      disabled={busyId === vol.id || vol.status === "rejected"}
                      className="px-2 py-1 text-xs text-red-300 border border-red-800/60 rounded-lg hover:bg-red-900/30 disabled:opacity-40 transition-colors"
                    >
                      رفض
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-5 py-3 border-t border-gray-800 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2 text-sm font-semibold text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 rounded-xl transition-all duration-200"
          >
            إغلاق
          </button>
        </div>
      </div>
    </>
  );
}

/* ── EDIT EVENT MODAL ────────────────────────────────────────────── */
function EditEventModal({ event, onClose, onSaved }) {
  const raw = event.raw || event;
  
  const [form, setForm] = useState({
    title: raw.title || "",
    description: raw.description || "",
    image_url: raw.image_url || raw.image || "",
    start_date: raw.start_date ? new Date(raw.start_date).toISOString().slice(0, 16) : "",
    end_date: raw.end_date ? new Date(raw.end_date).toISOString().slice(0, 16) : "",
    location_wilaya: raw.location_wilaya || "",
    location_maps_link: raw.location_maps_link || "",
    max_participants: String(raw.max_participants || ""),
    age_range: raw.age_range || "",
  });
  
  const [imagePreview, setImagePreview] = useState(raw.image_url || raw.image || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setForm((prev) => ({ ...prev, image_url: dataUrl }));
    setImagePreview(dataUrl);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.start_date || !form.end_date || !form.max_participants || !form.image_url) {
       setError("يرجى تعبئة جميع الحقول الإلزامية.");
       return;
    }

    setSaving(true);
    setError("");
    try {
      await api.put(`/events/${event.id}`, {
        title: form.title.trim(),
        description: form.description.trim(),
        image_url: form.image_url.trim(),
        start_date: new Date(form.start_date).toISOString(),
        end_date: new Date(form.end_date).toISOString(),
        location_wilaya: form.location_wilaya.trim(),
        location_maps_link: form.location_maps_link.trim(),
        max_participants: Number(form.max_participants),
        age_range: form.age_range.trim() || undefined,
      });
      await onSaved?.();
    } catch (err) {
      setError(err?.response?.data?.error || "تعذر حفظ تعديلات الفعالية.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full bg-gray-800 border border-gray-700 hover:border-gray-600 focus:border-green-500 focus:ring-1 focus:ring-green-500/30 text-white placeholder-gray-500 text-sm rounded-xl px-4 py-2.5 outline-none transition-all duration-200";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl text-right shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 shrink-0">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            تعديل بيانات الفعالية <span className="text-green-400">✏️</span>
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">✕</button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-200">عنوان الفعالية*</label>
            <input
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="عنوان الفعالية"
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-200">الوصف*</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="اكتب وصفاً مفصلاً للفعالية..."
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-200">صورة الغلاف*</label>
            <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-700 bg-gray-900/60 px-4 py-4 text-center cursor-pointer hover:border-green-500 transition-colors">
              <span className="text-2xl">🖼️</span>
              <span className="text-sm text-gray-300 font-medium">تغيير الصورة</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
            </label>
            {imagePreview && (
              <img src={imagePreview} alt="معاينة" className="h-32 w-full rounded-2xl object-cover border border-gray-800 mt-2" />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-200">تاريخ البداية*</label>
              <input
                type="datetime-local"
                value={form.start_date}
                onChange={(e) => setForm((prev) => ({ ...prev, start_date: e.target.value }))}
                className={inputClass}
                dir="ltr"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-200">تاريخ النهاية*</label>
              <input
                type="datetime-local"
                value={form.end_date}
                onChange={(e) => setForm((prev) => ({ ...prev, end_date: e.target.value }))}
                className={inputClass}
                dir="ltr"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-200">الولاية*</label>
            <div className="relative">
              <select
                value={form.location_wilaya}
                onChange={(e) => setForm((prev) => ({ ...prev, location_wilaya: e.target.value }))}
                className={`${inputClass} appearance-none pr-4 pl-10 cursor-pointer`}
                dir="rtl"
              >
                <option value="">اختر الولاية</option>
                {ASSOCIATION_LOCATIONS.map((wilaya) => (
                  <option key={wilaya} value={wilaya}>{wilaya}</option>
                ))}
              </select>
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">▼</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-200">رابط الموقع (خرائط جوجل)*</label>
            <input
              type="url"
              value={form.location_maps_link}
              onChange={(e) => setForm((prev) => ({ ...prev, location_maps_link: e.target.value }))}
              placeholder="https://maps.google.com/..."
              className={inputClass}
              dir="ltr"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-200">أقصى عدد مشاركين*</label>
              <input
                type="number"
                min="1"
                value={form.max_participants}
                onChange={(e) => setForm((prev) => ({ ...prev, max_participants: e.target.value }))}
                placeholder="100"
                className={inputClass}
                dir="ltr"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-200">الفئة العمرية</label>
              <input
                value={form.age_range}
                onChange={(e) => setForm((prev) => ({ ...prev, age_range: e.target.value }))}
                placeholder="18-35"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {error ? <p className="text-red-400 text-sm px-6 pb-2">{error}</p> : null}

        {/* Footer */}
        <div className="flex gap-3 justify-start px-6 py-4 border-t border-gray-800 shrink-0">
          <button onClick={onClose} disabled={saving} className="px-5 py-2.5 text-sm text-gray-400 border border-gray-700 rounded-xl hover:text-white hover:border-gray-500 transition-colors">
            إلغاء
          </button>
          <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 text-sm font-bold bg-green-600 hover:bg-green-500 text-white rounded-xl disabled:opacity-60 transition-colors">
            {saving ? "جاري الحفظ..." : "حفظ التعديلات ✓"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({ onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full text-right shadow-2xl">
        <div className="text-3xl mb-3 text-center">⚠️</div>
        <h3 className="text-white font-bold text-lg mb-2 text-center">حذف الفعالية</h3>
        <p className="text-gray-400 text-sm mb-5 leading-relaxed text-center">
          هل أنت متأكد من حذف هذه الفعالية؟ سيتم حذف جميع بيانات المتطوعين المرتبطة بها.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={onCancel} className="px-5 py-2 text-sm text-gray-400 border border-gray-700 rounded-xl hover:text-white transition-all">
            إلغاء
          </button>
          <button onClick={onConfirm} disabled={loading} className="px-5 py-2 text-sm font-bold bg-red-600 hover:bg-red-500 text-white rounded-xl transition-all disabled:opacity-60">
            {loading ? "جاري الحذف..." : "نعم، احذف"}
          </button>
        </div>
      </div>
    </div>
  );
}