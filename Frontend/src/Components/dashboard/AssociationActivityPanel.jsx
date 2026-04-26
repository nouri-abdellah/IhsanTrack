const MAX_ITEMS = 4;

function formatDate(value) {
  if (!value) return "غير محدد";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "غير محدد";

  return new Intl.DateTimeFormat("ar-DZ", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("ar-DZ").format(Number(value || 0));
}

export default function AssociationActivityPanel({ donations = [], requests = [] }) {
  const donationItems = [...donations]
    .sort((left, right) => new Date(right.date || right.createdAt || 0) - new Date(left.date || left.createdAt || 0))
    .slice(0, MAX_ITEMS)
    .map((donation) => ({
      id: `donation-${donation.id}`,
      type: "donation",
      title: donation.projectTitle || donation.donationProject?.title || "حملة تبرع",
      name: donation.anonymous
        ? "متبرع مجهول"
        : donation.donorName || donation.donor?.full_name || donation.donor?.email || "متبرع",
      email: donation.anonymous ? "مخفي" : donation.donor?.email || donation.donorEmail || "غير متوفر",
      phone: donation.anonymous ? "مخفي" : donation.donor?.phone || donation.donorPhone || "غير متوفر",
      amount: donation.amount,
      date: donation.date || donation.createdAt,
      meta: donation.payment_method || "غير محدد",
      anonymous: Boolean(donation.anonymous),
    }));

  const requestItems = [...requests]
    .sort((left, right) => new Date(right.registered_at || right.joinedAt || 0) - new Date(left.registered_at || left.joinedAt || 0))
    .slice(0, MAX_ITEMS)
    .map((request) => ({
      id: `request-${request.id}`,
      type: "request",
      title: request.eventTitle || request.event?.title || "فعالية تطوعية",
      name: request.name || request.full_name || request.user?.full_name || request.user?.email || "مشارك",
      email: request.email || request.user?.email || "غير متوفر",
      phone: request.phone || request.user?.phone || "غير متوفر",
      amount: null,
      date: request.registered_at || request.joinedAt,
      meta: request.status || "pending",
    }));

  const items = [...donationItems, ...requestItems]
    .sort((left, right) => new Date(right.date || 0) - new Date(left.date || 0))
    .slice(0, MAX_ITEMS);

  return (
    <section className="rounded-3xl overflow-hidden border border-emerald-900/50 bg-linear-to-b from-gray-900 via-gray-900 to-emerald-950/20 shadow-xl shadow-emerald-950/20">
      <div className="px-5 py-4 border-b border-emerald-900/40 flex items-center justify-between gap-3">
        <div className="text-right">
          <h3 className="text-white font-extrabold text-lg">آخر التنبيهات</h3>
          <p className="text-gray-400 text-xs mt-0.5">تبرعات جديدة وطلبات مشاركة واردة حديثاً</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-200 bg-emerald-900/25 border border-emerald-800/50 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          مباشر من قاعدة البيانات
        </div>
      </div>

      <div className="divide-y divide-emerald-900/30">
        {items.length === 0 ? (
          <div className="px-5 py-8 text-center text-gray-400 text-sm">
            لا توجد تنبيهات حديثة بعد.
          </div>
        ) : (
          items.map((item) => (
            <article key={item.id} className="px-5 py-4 flex items-start justify-between gap-4 hover:bg-emerald-900/10 transition-colors">
              <div className="w-11 h-11 shrink-0 rounded-xl bg-gray-800 border border-emerald-900/50 flex items-center justify-center text-lg">
                {item.type === "donation" ? "💚" : "🤝"}
              </div>
              <div className="text-right flex-1 min-w-0">
                <div className="flex items-center justify-end gap-2 mb-2 flex-wrap">
                  <span
                    className={`text-[11px] font-semibold px-2 py-1 rounded-full border ${
                      item.type === "donation"
                        ? "text-green-300 bg-green-900/20 border-green-800/50"
                        : "text-blue-300 bg-blue-900/20 border-blue-800/50"
                    }`}
                  >
                    {item.type === "donation" ? "تبرع" : "مشاركة"}
                  </span>
                  {item.anonymous ? (
                    <span className="text-[11px] font-semibold px-2 py-1 rounded-full border text-gray-300 bg-gray-900 border-gray-700">
                      مجهول
                    </span>
                  ) : null}
                  <h4 className="text-white font-semibold text-sm truncate">{item.title}</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-300">
                  <div className="rounded-xl border border-emerald-900/30 bg-gray-900/70 px-3 py-2">
                    <p className="text-gray-500 mb-1">الاسم</p>
                    <p className="text-white font-medium truncate">{item.name}</p>
                  </div>
                  <div className="rounded-xl border border-emerald-900/30 bg-gray-900/70 px-3 py-2">
                    <p className="text-gray-500 mb-1">التواصل</p>
                    <p className="text-white font-medium truncate">{item.email}</p>
                    <p className="text-gray-400 truncate">{item.phone}</p>
                  </div>
                </div>

                <p className="text-gray-500 text-xs mt-2">
                  {formatDate(item.date)} • {item.type === "donation" ? `${formatCurrency(item.amount)} دج` : item.meta}
                </p>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
