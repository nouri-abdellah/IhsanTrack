/**
 * UserStatsCards.jsx
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * USED ON: UserProfilePage only
 * FILE LOCATION: src/components/user/UserStatsCards.jsx
 *
 * CONTAINS:
 * Two side-by-side stat cards (matching screenshot):
 *
 *   Card 1 — إجمالي التبرعات  (right card in RTL)
 *     Value:  50,000 دج
 *     Icon:   💚 (heart with hand)
 *     Color:  green accent
 *
 *   Card 2 — الفعاليات المشارك فيها  (left card in RTL)
 *     Value:  12 فعالية
 *     Icon:   📅
 *     Color:  blue accent
 *
 * In production: values come from user object fetched via GET /api/users/me
 *
 * Props: user — user object (needs totalDonations, totalEvents)
 */
export default function UserStatsCards({ user }) {
  return (
    <div className="grid grid-cols-2 gap-4">

      {/* Card 1 — إجمالي التبرعات */}
      <div className="bg-gray-900 border border-gray-800 hover:border-green-800/50 rounded-2xl p-5 text-right transition-all duration-300 hover:-translate-y-0.5 group">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-green-900/40 border border-green-800/40 flex items-center justify-center text-xl shrink-0">
            💚
          </div>
          <span className="text-gray-400 text-xs font-medium">إجمالي التبرعات</span>
        </div>
        <div className="flex items-baseline gap-1 justify-end">
          <span className="text-gray-400 text-sm">دج</span>
          <span className="text-2xl font-extrabold text-white group-hover:text-green-50 transition-colors">
            {user.totalDonations.toLocaleString("ar-DZ")}
          </span>
        </div>
      </div>

      {/* Card 2 — الفعاليات المشارك فيها */}
      <div className="bg-gray-900 border border-gray-800 hover:border-blue-800/50 rounded-2xl p-5 text-right transition-all duration-300 hover:-translate-y-0.5 group">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-blue-900/40 border border-blue-800/40 flex items-center justify-center text-xl shrink-0">
            📅
          </div>
          <span className="text-gray-400 text-xs font-medium">الفعاليات المشارك فيها</span>
        </div>
        <div className="flex items-baseline gap-1 justify-end">
          <span className="text-gray-400 text-sm">فعالية</span>
          <span className="text-2xl font-extrabold text-white group-hover:text-blue-100 transition-colors">
            {user.totalEvents}
          </span>
        </div>
      </div>

    </div>
  );
}
