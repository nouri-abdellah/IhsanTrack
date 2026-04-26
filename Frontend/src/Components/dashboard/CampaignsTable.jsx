import { useState } from "react";
import api from "../../api/axios";

/**
 * CampaignsTable.jsx
 *
 * USED ON: AssocCampaignsDashboardPage only
 *
 * CONTAINS:
 * Section: "آخر الحملات"
 *
 * TABLE COLUMNS (RTL order — rightmost column first visually):
 *   الحملة        — thumbnail + title + donor count
 *   التقدم        — % text + mini progress bar
 *   المبلغ المجموع — raised دج / goal دج
 *   الحالة        — colored badge (نشطة / انتظار / مكتملة / ملغاة)
 *   إجراءات      — action buttons (edit / pause / delete)
 *
 * FEATURES:
 * - Filter tabs above table: الجميع | نشطة | انتظار | مكتملة
 * - Pagination: showing "عرض 1-3 من 14 حملة"
 * - Status badges: green=نشطة, yellow=انتظار, blue=مكتملة, red=ملغاة
 * - Action buttons per row: ✏️ edit, ⏸ pause, 🗑 delete (with confirm)
 * - Responsive: on mobile some columns collapse
 *
 * Props:
 *   campaigns     — array of campaign objects
 *   setCampaigns  — setter to update campaigns list (for delete/status change)
 */

const STATUS_TABS = ["الجميع", "نشطة", "انتظار", "مكتملة"];

const STATUS_STYLES = {
  نشطة:    { pill: "bg-green-900/40 text-green-300 border-green-800/50",  dot: "bg-green-400" },
  انتظار:  { pill: "bg-yellow-900/40 text-yellow-300 border-yellow-800/50", dot: "bg-yellow-400" },
  مكتملة:  { pill: "bg-blue-900/40 text-blue-300 border-blue-800/50",    dot: "bg-blue-400" },
  ملغاة:   { pill: "bg-red-900/40 text-red-300 border-red-800/50",       dot: "bg-red-400" },
};

const ITEMS_PER_PAGE = 5;

export default function CampaignsTable({ campaigns, onRefresh }) {
  const [activeTab, setActiveTab] = useState("الجميع");
  const [page, setPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [requestError, setRequestError] = useState("");

  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center empty-state">
        <h3 className="text-white text-lg font-bold">No records found</h3>
        <p className="text-gray-400 text-sm mt-2">
          You haven't created any campaigns yet. Click "Create" to start!
        </p>
      </div>
    );
  }

  // Filter by status tab
  const filtered = activeTab === "الجميع"
    ? campaigns
    : campaigns.filter((c) => c.status === activeTab);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleDelete = async (id) => {
    setBusyId(id);
    setRequestError("");
    try {
      await api.delete(`/donation-projects/${id}`);
      setDeleteConfirm(null);
      await onRefresh?.();
    } catch (err) {
      setRequestError(err?.response?.data?.error || "تعذر حذف الحملة.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="relative">
      <div className={`transition-all duration-300 ${selectedCampaign ? "lg:ml-80" : ""}`}>
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
                    لا توجد حملات في هذه الفئة
                  </td>
                </tr>
              ) : (
                paginated.map((campaign) => (
                  <CampaignRow
                    key={campaign.id}
                    campaign={campaign}
                    onOpenDonors={() =>
                      setSelectedCampaign(selectedCampaign?.id === campaign.id ? null : campaign)
                    }
                    isSelected={selectedCampaign?.id === campaign.id}
                    onEditRequest={() => setEditingCampaign(campaign)}
                    onDeleteRequest={() => setDeleteConfirm(campaign.id)}
                    disabled={busyId === campaign.id}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer: count + pagination */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-800 bg-gray-900/50">
          {/* Pagination buttons */}
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

          {/* Count */}
          <p className="text-gray-500 text-xs">
            عرض {Math.min((page - 1) * ITEMS_PER_PAGE + 1, filtered.length)}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} من {filtered.length} حملة
          </p>
        </div>
      </div>

      {requestError ? (
        <p className="text-red-400 text-sm mt-3 text-right">{requestError}</p>
      ) : null}

      {/* Delete confirmation modal */}
      {deleteConfirm !== null && (
        <DeleteModal
          loading={busyId === deleteConfirm}
          onConfirm={() => handleDelete(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      {editingCampaign ? (
        <EditCampaignModal
          campaign={editingCampaign}
          onClose={() => setEditingCampaign(null)}
          onSaved={async () => {
            setEditingCampaign(null);
            await onRefresh?.();
          }}
        />
      ) : null}

      <CampaignDonorsDrawer
        campaign={selectedCampaign}
        onClose={() => setSelectedCampaign(null)}
      />
      </div>
    </div>
  );
}

/* ── Campaign Row ─────────────────────────────────────────────────────────── */
function CampaignRow({ campaign, onOpenDonors, isSelected, onEditRequest, onDeleteRequest, disabled }) {
  const statusStyle = STATUS_STYLES[campaign.status] || STATUS_STYLES["انتظار"];

  return (
    <tr className="hover:bg-gray-800/30 transition-colors group">

      {/* إجراءات */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1.5">
          <ActionBtn
            title="عرض المتبرعين"
            icon="👥"
            className={`hover:bg-blue-900/40 hover:border-blue-700/50 hover:text-blue-300 ${
              isSelected ? "bg-blue-900/40 border-blue-700/50 text-blue-300" : ""
            }`}
            onClick={onOpenDonors}
            disabled={disabled}
          />
          {/* Edit */}
          <ActionBtn
            title="تعديل"
            icon="✏️"
            className="hover:bg-green-900/40 hover:border-green-700/50 hover:text-green-300"
            onClick={onEditRequest}
            disabled={disabled}
          />
          {/* Delete */}
          <ActionBtn
            title="حذف"
            icon="🗑"
            className="hover:bg-red-900/40 hover:border-red-700/50 hover:text-red-300"
            onClick={onDeleteRequest}
            disabled={disabled}
          />
        </div>
      </td>

      {/* الحالة */}
      <td className="px-4 py-3.5">
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${statusStyle.pill}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
          {campaign.status}
        </span>
      </td>

      {/* المبلغ المجموع */}
      <td className="px-4 py-3.5">
        <div className="text-white font-semibold text-sm">
          {campaign.raised.toLocaleString("ar-DZ")} دج
        </div>
        <div className="text-gray-500 text-xs mt-0.5">
          من {campaign.goal.toLocaleString("ar-DZ")} دج
        </div>
      </td>

      {/* التقدم */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2 justify-end">
          <div className="w-20 h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                campaign.progress >= 100
                  ? "bg-blue-500"
                  : campaign.progress >= 50
                  ? "bg-green-500"
                  : "bg-yellow-500"
              }`}
              style={{ width: `${Math.min(100, campaign.progress)}%` }}
            />
          </div>
          <span className={`text-xs font-bold tabular-nums min-w-10 ${
            campaign.progress >= 100 ? "text-blue-400" : "text-green-400"
          }`}>
            {campaign.progress}%
          </span>
        </div>
      </td>

      {/* الحملة */}
      <td className="px-4 py-3.5">
        <button
          type="button"
          onClick={onOpenDonors}
          className="w-full text-right"
          title="عرض قائمة المتبرعين"
        >
        <div className="flex items-center gap-3 justify-end hover:opacity-90 transition-opacity">
          <div className="text-right">
            <p className="text-white font-semibold text-sm leading-snug group-hover:text-green-100 transition-colors">
              {campaign.title}
            </p>
            <p className="text-gray-500 text-xs mt-0.5 flex items-center gap-1 justify-end">
              <span>{campaign.createdAt}</span>
              <span>•</span>
              <span>👥 {campaign.donors} متبرع</span>
            </p>
          </div>
          {/* Thumbnail */}
          <div className="w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center overflow-hidden shrink-0">
            {campaign.image ? (
              <img src={campaign.image} alt={campaign.title} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl">{campaign.imageEmoji}</span>
            )}
          </div>
        </div>
        </button>
      </td>

    </tr>
  );
}

function CampaignDonorsDrawer({ campaign, onClose }) {
  if (!campaign) return null;

  const donations = [...(campaign.donations || [])].sort(
    (left, right) => new Date(right.date || 0) - new Date(left.date || 0)
  );

  return (
    <div className="fixed lg:absolute inset-y-0 left-0 w-full sm:w-96 bg-gray-900/98 border-r border-gray-800 shadow-2xl z-40 flex flex-col">
      <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
        <button onClick={onClose} className="text-gray-400 hover:text-white text-sm">إغلاق ✕</button>
        <div className="text-right">
          <h3 className="text-white font-bold text-base">قائمة المتبرعين</h3>
          <p className="text-gray-500 text-xs">{campaign.title}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {donations.length === 0 ? (
          <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4 text-center text-sm text-gray-400">
            لا توجد تبرعات لهذه الحملة بعد.
          </div>
        ) : (
          donations.map((donation) => {
            const donorName = donation.anonymous
              ? "متبرع مجهول"
              : donation.donor?.full_name || donation.donor?.email || "متبرع";
            const donorEmail = donation.anonymous ? "مخفي" : donation.donor?.email || "غير متوفر";
            const donorPhone = donation.anonymous ? "مخفي" : donation.donor?.phone || "غير متوفر";
            const donationDate = donation.date
              ? new Intl.DateTimeFormat("ar-DZ", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                }).format(new Date(donation.date))
              : "غير محدد";

            return (
              <article key={donation.id} className="rounded-xl border border-gray-800 bg-gray-900/70 p-3 text-right">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-green-400 font-bold text-sm tabular-nums">
                    {Number(donation.amount || 0).toLocaleString("ar-DZ")} دج
                  </span>
                  <div className="flex items-center gap-2">
                    {donation.anonymous ? (
                      <span className="text-[11px] font-semibold px-2 py-1 rounded-full border text-gray-300 bg-gray-900 border-gray-700">
                        مجهول
                      </span>
                    ) : null}
                    <span className="text-white text-sm font-semibold truncate">{donorName}</span>
                  </div>
                </div>

                <p className="text-gray-400 text-xs truncate">{donorEmail}</p>
                <p className="text-gray-500 text-xs truncate">{donorPhone}</p>
                <p className="text-gray-500 text-xs mt-2">{donationDate} • {donation.payment_method || "غير محدد"}</p>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ── ActionBtn helper ─────────────────────────────────────────────────────── */
function ActionBtn({ icon, title, className, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`w-7 h-7 flex items-center justify-center rounded-lg border border-gray-700 text-gray-500 text-xs transition-all duration-200 ${className}`}
    >
      {icon}
    </button>
  );
}

function EditCampaignModal({ campaign, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: campaign.title || "",
    description: campaign.description || "",
    goal_amount: String(campaign.goal || ""),
    max_date: campaign.maxDate ? new Date(campaign.maxDate).toISOString().slice(0, 16) : "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await api.put(`/donation-projects/${campaign.id}`, {
        title: form.title.trim(),
        description: form.description.trim(),
        goal_amount: Number(form.goal_amount),
        max_date: form.max_date ? new Date(form.max_date).toISOString() : null,
      });
      await onSaved?.();
    } catch (err) {
      setError(err?.response?.data?.error || "تعذر حفظ تعديلات الحملة.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-lg text-right shadow-2xl">
        <h3 className="text-white font-bold text-lg mb-4">تعديل الحملة</h3>
        <div className="space-y-3">
          <input
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            placeholder="عنوان الحملة"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5"
          />
          <textarea
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            placeholder="وصف الحملة"
            rows={4}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 resize-none"
          />
          <input
            type="number"
            min="1"
            value={form.goal_amount}
            onChange={(event) => setForm((prev) => ({ ...prev, goal_amount: event.target.value }))}
            placeholder="المبلغ المستهدف"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5"
          />
          <input
            type="datetime-local"
            value={form.max_date}
            onChange={(event) => setForm((prev) => ({ ...prev, max_date: event.target.value }))}
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

/* ── Delete confirmation modal ────────────────────────────────────────────── */
function DeleteModal({ onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full text-right shadow-2xl">
        <div className="text-3xl mb-3 text-right">⚠️</div>
        <h3 className="text-white font-bold text-lg mb-2">حذف الحملة</h3>
        <p className="text-gray-400 text-sm mb-5 leading-relaxed">
          هل أنت متأكد من حذف هذه الحملة؟ لا يمكن التراجع عن هذا الإجراء.
        </p>
        <div className="flex gap-3 justify-start">
          <button
            onClick={onCancel}
            className="px-5 py-2 text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 rounded-xl transition-all"
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-2 text-sm font-bold bg-red-600 hover:bg-red-500 text-white rounded-xl transition-all"
          >
            {loading ? "جاري الحذف..." : "نعم، احذف"}
          </button>
        </div>
      </div>
    </div>
  );
}
