/**
 * CampaignsDashboardStats.jsx
 *
 * USED ON: AssocCampaignsDashboardPage only
 *
 * CONTAINS:
 * Three KPI cards in a horizontal row:
 *
 *   Card 1 — إجمالي التبرعات
 *     Value:  5,240,000 دج
 *     Badge:  +175% نسبة النمو  (green up arrow)
 *     Icon:   💰
 *
 *   Card 2 — الحملات النشطة
 *     Value:  12
 *     Badge:  +24 حملات جديدة  (green up arrow)
 *     Icon:   📢
 *
 *   Card 3 — عدد المتبرعين
 *     Value:  1,450
 *     Badge:  +100% زيادة  (green up arrow)
 *     Icon:   👥
 *
 * In production, fetch from: GET /api/associations/me/stats
 * Response: { totalRaised, activeCampaigns, totalDonors, growthRates }
 */

export default function CampaignsDashboardStats({ stats }) {
  const cards = [
    {
      id: 1,
      icon: "💰",
      iconBg: "bg-green-900/40 border-green-800/40",
      label: "إجمالي التبرعات",
      value: Number(stats?.totalRaised || 0).toLocaleString("ar-DZ"),
      unit: "دج",
      unitPosition: "before",
      badge: `${stats?.campaignCount || 0} حملة`,
      badgeColor: "text-green-400 bg-green-900/30 border-green-800/40",
      badgeIcon: "•",
    },
    {
      id: 2,
      icon: "📢",
      iconBg: "bg-blue-900/40 border-blue-800/40",
      label: "الحملات النشطة",
      value: String(stats?.activeCampaigns || 0),
      unit: "",
      unitPosition: "after",
      badge: `${stats?.completedCampaigns || 0} مكتملة`,
      badgeColor: "text-blue-400 bg-blue-900/30 border-blue-800/40",
      badgeIcon: "•",
    },
    {
      id: 3,
      icon: "👥",
      iconBg: "bg-purple-900/40 border-purple-800/40",
      label: "عدد المتبرعين",
      // Prefer total donations (including anonymous); fall back to unique donors
      value: String(stats?.totalDonations ?? stats?.uniqueDonors ?? 0),
      unit: "",
      unitPosition: "after",
      badge: "بيانات فعلية من قاعدة البيانات",
      badgeColor: "text-purple-400 bg-purple-900/30 border-purple-800/40",
      badgeIcon: "•",
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
      {/* Top row: label + icon */}
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl border ${stat.iconBg} flex items-center justify-center text-xl`}>
          {stat.icon}
        </div>
        <span className="text-gray-400 text-sm font-medium">{stat.label}</span>
      </div>

      {/* Value */}
      <div className="mb-3">
        {stat.unitPosition === "before" && stat.unit && (
          <span className="text-gray-400 text-sm ml-1">{stat.unit}</span>
        )}
        <span className="text-2xl sm:text-3xl font-extrabold text-white group-hover:text-green-50 transition-colors">
          {stat.value}
        </span>
        {stat.unitPosition === "after" && stat.unit && (
          <span className="text-gray-400 text-sm mr-1">{stat.unit}</span>
        )}
      </div>

      {/* Growth badge */}
      <div className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${stat.badgeColor}`}>
        <span className="text-xs leading-none">{stat.badgeIcon}</span>
        {stat.badge}
      </div>
    </div>
  );
}
