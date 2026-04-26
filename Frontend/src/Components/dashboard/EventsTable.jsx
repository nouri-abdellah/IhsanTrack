import { useState } from "react";
import api from "../../api/axios";

/**
 * EventsTable.jsx
 *
 * USED ON: AssocEventsDashboardPage only
 *
 * CONTAINS:
 *
 * ── MAIN TABLE ─────────────────────────────────────────────────────────────
 * Section: "آخر الحملات" (same structure as CampaignsTable)
 *
 * TABLE COLUMNS (RTL, rightmost first visually):
 *   الحملة        — thumbnail emoji + title + volunteer count
 *   التقدم        — % + mini progress bar
 *   المبلغ المجموع — raised / goal دج
 *   الحالة        — colored status badge
 *   إجراءات      — 👥 volunteers, ✏️ edit, 🗑 delete
 *
 * Features:
 *   - Filter tabs: الجميع | نشطة | انتظار | مكتملة
 *   - Pagination (5 items per page)
 *   - Delete confirmation modal
 *   - "👥" action button opens the VolunteersDrawer for that event
 *
 * ── VOLUNTEERS DRAWER ──────────────────────────────────────────────────────
 * Slides in from the left when an event's 👥 button is clicked.
 * Shows a list of all volunteers who signed up for that event:
 *   - Avatar circle (initial letter)
 *   - Name, phone, wilaya, joinedAt
 *   - "إزالة" (remove) button per volunteer
 *   - Empty state if no volunteers yet
 *   - "إغلاق" button to close the drawer
 *
 * Props:
 *   events           — array of event objects
 *   setEvents        — state setter
 *   volunteers       — { [eventId]: volunteer[] }
 *   selectedEvent    — currently open event (for drawer)
 *   setSelectedEvent — setter for selectedEvent
 *   onRemoveVolunteer(eventId, volunteerId) — removes a volunteer
 */

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
        <h3 className="text-white text-lg font-bold">No records found</h3>
        <p className="text-gray-400 text-sm mt-2">
          You haven't created any campaigns/events yet. Click "Create" to start!
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
      <div className={`transition-all duration-300 ${selectedEvent ? "lg:ml-80" : ""}`}>

        {/* Section header */}
        <div className="flex items-center justify-between mb-4">
          {/* Filter tabs */}
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

          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-white">آخر الحملات</h2>
            <div className="w-1 h-5 bg-green-500 rounded-full" />
          </div>
        </div>

        {/* Table card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-900/80">
                  <th className="px-4 py-3.5 text-gray-400 font-semibold text-xs">إجراءات</th>
                  <th className="px-4 py-3.5 text-gray-400 font-semibold text-xs">الحالة</th>
                  <th className="px-4 py-3.5 text-gray-400 font-semibold text-xs">المبلغ المجموع</th>
                  <th className="px-4 py-3.5 text-gray-400 font-semibold text-xs">التقدم</th>
                  <th className="px-4 py-3.5 text-gray-400 font-semibold text-xs">الحملة</th>
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
            <div className="flex items-center gap-1.5">
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
            <p className="text-gray-500 text-xs">
              عرض {Math.min((page - 1) * ITEMS_PER_PAGE + 1, filtered.length)}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} من {filtered.length} حملة
            </p>
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

/* ── Event Row ──────────────────────────────────────────────────────────────── */
function EventRow({ event, isSelected, onViewVolunteers, onEditRequest, onDeleteRequest, volunteerCount, disabled }) {
  const statusStyle = STATUS_STYLES[event.status] || STATUS_STYLES["انتظار"];

  return (
    <tr className={`hover:bg-gray-800/30 transition-colors group ${isSelected ? "bg-green-950/20 border-r-2 border-r-green-600" : ""}`}>

      {/* إجراءات */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1.5">
          {/* View volunteers */}
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
          {/* Edit */}
          <button
            title="تعديل"
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-700 text-gray-500 text-xs transition-all duration-200 hover:bg-green-900/40 hover:border-green-700/50 hover:text-green-300"
            onClick={onEditRequest}
            disabled={disabled}
          >
            ✏️
          </button>
          {/* Delete */}
          <button
            title="حذف"
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-700 text-gray-500 text-xs transition-all duration-200 hover:bg-red-900/40 hover:border-red-700/50 hover:text-red-300"
            onClick={onDeleteRequest}
            disabled={disabled}
          >
            🗑
          </button>
        </div>
      </td>

      {/* الحالة */}
      <td className="px-4 py-3.5">
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${statusStyle.pill}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
          {event.status}
        </span>
      </td>

      {/* المبلغ المجموع */}
      <td className="px-4 py-3.5">
        <div className="text-white font-semibold text-sm">
          {event.raised.toLocaleString("ar-DZ")} دج
        </div>
        <div className="text-gray-500 text-xs mt-0.5">
          من {event.goal.toLocaleString("ar-DZ")} دج
        </div>
      </td>

      {/* التقدم */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2 justify-end">
          <div className="w-20 h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                event.progress >= 100 ? "bg-blue-500" : event.progress >= 50 ? "bg-green-500" : "bg-yellow-500"
              }`}
              style={{ width: `${Math.min(100, event.progress)}%` }}
            />
          </div>
          <span className={`text-xs font-bold tabular-nums min-w-10 ${
            event.progress >= 100 ? "text-blue-400" : "text-green-400"
          }`}>
            {event.progress}%
          </span>
        </div>
      </td>

      {/* الحملة */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3 justify-end">
          <div className="text-right">
            <p className="text-white font-semibold text-sm leading-snug group-hover:text-green-100 transition-colors">
              {event.title}
            </p>
            <p className="text-gray-500 text-xs mt-0.5 flex items-center gap-1 justify-end">
              <span>{event.createdAt}</span>
              <span>•</span>
              <span>🤝 {event.volunteers} متطوع</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center overflow-hidden shrink-0">
            {event.image ? (
              <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl">{event.imageEmoji}</span>
            )}
          </div>
        </div>
      </td>

    </tr>
  );
}

/* ── Volunteers Drawer ────────────────────────────────────────────────────── */
/**
 * VolunteersDrawer
 *
 * Slides in from the LEFT side of the screen (fixed panel) when an event row
 * is clicked. Shows the list of signed-up volunteers for that event.
 *
 * Each volunteer entry shows:
 *   - Colored initial avatar circle
 *   - Full name (bold)
 *   - Phone number
 *   - Wilaya (city)
 *   - Join date
 *   - "إزالة" red button to remove from the event
 *
 * Empty state: "لا يوجد متطوعون مسجلون في هذه الفعالية بعد"
 */
function VolunteersDrawer({ event, volunteers, onClose, onAccept, onReject, busyId }) {

  if (!event) return null;

  const AVATAR_COLORS = [
    "bg-green-700", "bg-blue-700", "bg-purple-700",
    "bg-orange-700", "bg-pink-700", "bg-teal-700",
  ];

  return (
    <>
      {/* Backdrop (mobile) */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className="fixed left-0 top-0 h-full w-80 bg-gray-900 border-r border-gray-800 z-50 shadow-2xl shadow-black/60 flex flex-col">

        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 shrink-0">
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-all duration-200 text-sm"
            aria-label="إغلاق"
          >
            ✕
          </button>
          <div className="text-right">
            <h3 className="text-white font-bold text-sm">المتطوعون المسجلون</h3>
            <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">{event.title}</p>
          </div>
        </div>

        {/* Volunteer count badge */}
        <div className="px-5 py-3 border-b border-gray-800/60 shrink-0">
          <div className="flex items-center justify-end gap-2">
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

        {/* Volunteers list */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
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
                      className="px-2 py-1 text-xs text-green-300 border border-green-800/60 rounded-lg hover:bg-green-900/30 disabled:opacity-40"
                    >
                      قبول
                    </button>
                    <button
                      onClick={() => onReject(vol.id)}
                      disabled={busyId === vol.id || vol.status === "rejected"}
                      className="px-2 py-1 text-xs text-red-300 border border-red-800/60 rounded-lg hover:bg-red-900/30 disabled:opacity-40"
                    >
                      رفض
                    </button>
                  </div>

                  {/* Volunteer info */}
                  <div className="flex items-start gap-2.5 flex-1 justify-end">
                    <div className="text-right min-w-0">
                      <p className="text-white font-semibold text-sm leading-snug">{vol.name}</p>
                      <p className="text-gray-500 text-xs mt-0.5 truncate">{vol.email}</p>
                      <p className="text-gray-400 text-xs mt-0.5 flex items-center gap-1 justify-end">
                        <span>{vol.phone}</span>
                        <span>•</span>
                        <span>📍 {vol.wilaya}</span>
                      </p>
                      <p className="text-gray-600 text-xs mt-0.5">{vol.joinedAt}</p>
                    </div>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-xl ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                      {vol.avatar}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer footer */}
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

/* ── Delete confirmation modal ────────────────────────────────────────────── */
function EditEventModal({ event, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: event.title || "",
    max_participants: String(event.maxVolunteers || ""),
    start_date: event.startDateValue ? new Date(event.startDateValue).toISOString().slice(0, 16) : "",
    end_date: event.endDateValue ? new Date(event.endDateValue).toISOString().slice(0, 16) : "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await api.put(`/events/${event.id}`, {
        title: form.title.trim(),
        max_participants: Number(form.max_participants),
        start_date: new Date(form.start_date).toISOString(),
        end_date: new Date(form.end_date).toISOString(),
      });
      await onSaved?.();
    } catch (err) {
      setError(err?.response?.data?.error || "تعذر حفظ تعديلات الفعالية.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-lg text-right shadow-2xl">
        <h3 className="text-white font-bold text-lg mb-4">تعديل الفعالية</h3>
        <div className="space-y-3">
          <input
            value={form.title}
            onChange={(eventValue) => setForm((prev) => ({ ...prev, title: eventValue.target.value }))}
            placeholder="عنوان الفعالية"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5"
          />
          <input
            type="number"
            min="1"
            value={form.max_participants}
            onChange={(eventValue) => setForm((prev) => ({ ...prev, max_participants: eventValue.target.value }))}
            placeholder="العدد الأقصى للمشاركين"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5"
          />
          <input
            type="datetime-local"
            value={form.start_date}
            onChange={(eventValue) => setForm((prev) => ({ ...prev, start_date: eventValue.target.value }))}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5"
          />
          <input
            type="datetime-local"
            value={form.end_date}
            onChange={(eventValue) => setForm((prev) => ({ ...prev, end_date: eventValue.target.value }))}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5"
          />
        </div>

        {error ? <p className="text-red-400 text-sm mt-3">{error}</p> : null}

        <div className="flex gap-3 justify-start mt-5">
          <button onClick={onClose} disabled={saving} className="px-5 py-2 text-sm text-gray-400 border border-gray-700 rounded-xl hover:text-white">
            إلغاء
          </button>
          <button onClick={handleSave} disabled={saving} className="px-5 py-2 text-sm font-bold bg-green-600 hover:bg-green-500 text-white rounded-xl disabled:opacity-60">
            {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({ onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full text-right shadow-2xl">
        <div className="text-3xl mb-3">⚠️</div>
        <h3 className="text-white font-bold text-lg mb-2">حذف الفعالية</h3>
        <p className="text-gray-400 text-sm mb-5 leading-relaxed">
          هل أنت متأكد من حذف هذه الفعالية؟ سيتم حذف جميع بيانات المتطوعين المرتبطة بها.
        </p>
        <div className="flex gap-3 justify-start">
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
