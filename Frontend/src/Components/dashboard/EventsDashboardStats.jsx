/**
 * EventsDashboardStats.jsx
 *
 * USED ON: AssocEventsDashboardPage only
 *
 * CONTAINS:
 * Three KPI stat cards specific to volunteer events:
 *
 *   Card 1 — الفعاليات المنشئة  (Events created)
 *     Value:  12
 *     Badge:  — (no growth badge, stable count)
 *     Icon:   📅
 *     Color:  blue
 *
 *   Card 2 — إجمالي المتطوعين المسجلين  (Total registered volunteers)
 *     Value:  450
 *     Badge:  +95% زيادة  ↑ green
 *     Icon:   🤝
 *     Color:  green
 *
 *   Card 3 — الفعاليات القادمة  (Upcoming events)
 *     Value:  85
 *     Badge:  -45% انخفاض  ↓ red  (matches screenshot showing red badge)
 *     Icon:   🏃
 *     Color:  orange
 *
 * In production: GET /api/associations/me/events/stats
 */

export default function EventsDashboardStats({ stats }) {
  const cards = [
    {
      id: 1,
      icon: "📅",
      iconBg: "bg-blue-900/40 border-blue-800/40",
      label: "الفعاليات المنشئة",
      value: String(stats?.eventCount || 0),
      badge: null,
      badgeColor: "",
      badgeIcon: "",
      valueColor: "text-white",
    },
    {
      id: 2,
      icon: "🤝",
      iconBg: "bg-green-900/40 border-green-800/40",
      label: "إجمالي طلبات المتطوعين",
      value: String(stats?.totalVolunteerRequests || 0),
      badge: `${stats?.acceptedVolunteers || 0} مقبول`,
      badgeColor: "text-green-400 bg-green-900/30 border-green-800/40",
      badgeIcon: "•",
      valueColor: "text-white",
    },
    {
      id: 3,
      icon: "🏃",
      iconBg: "bg-orange-900/40 border-orange-800/40",
      label: "الفعاليات القادمة",
      value: String(stats?.upcomingEvents || 0),
      badge: `${stats?.activeEvents || 0} فعالية نشطة`,
      badgeColor: "text-orange-300 bg-orange-900/30 border-orange-800/40",
      badgeIcon: "•",
      valueColor: "text-white",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((stat) => (
        <StatCard key={stat.id} stat={stat} />
      ))}
    </div>
  );
}

function StatCard({ stat }) {
  return (
    <div className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl p-5 text-right transition-all duration-300 hover:-translate-y-0.5 group">

      {/* Top: label + icon */}
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl border ${stat.iconBg} flex items-center justify-center text-xl`}>
          {stat.icon}
        </div>
        <span className="text-gray-400 text-sm font-medium">{stat.label}</span>
      </div>

      {/* Value */}
      <div className="mb-3">
        <span className={`text-3xl font-extrabold ${stat.valueColor} group-hover:text-green-50 transition-colors`}>
          {stat.value}
        </span>
      </div>

      {/* Badge */}
      {stat.badge ? (
        <div className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${stat.badgeColor}`}>
          <span className="text-xs leading-none">{stat.badgeIcon}</span>
          {stat.badge}
        </div>
      ) : (
        <div className="h-6" /> /* spacer to keep card heights equal */
      )}
    </div>
  );
}
