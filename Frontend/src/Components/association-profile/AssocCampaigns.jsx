import { useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * AssocCampaigns.jsx
 *
 * USED ON: AssocProfilePage only
 *
 * CONTAINS:
 * Grid of the association's active (and recently completed) donation campaigns:
 *   - Campaign card with image area
 *   - Title + short description
 *   - Progress bar (raised / goal)
 *   - Donor count + days remaining
 *   - "تبرع الآن" button → /campaigns/:id
 *   - "Completed" overlay if campaign.completed === true
 *
 * LAYOUT: 3-column grid on desktop, 2-column on tablet, 1-column on mobile
 *
 * Props: campaigns (array of campaign objects from assoc.activeCampaigns)
 */
export default function AssocCampaigns({ campaigns }) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const safeCampaigns = campaigns || [];
  if (safeCampaigns.length === 0) return null;

  const displayedCampaigns = isExpanded ? safeCampaigns : safeCampaigns.slice(0, 3);
  const hasMore = safeCampaigns.length > 3;

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between mb-5" dir="rtl">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-green-500 rounded-full" />
          <h2 className="text-xl font-extrabold text-white">حملات التبرع الحالية</h2>
        </div>
        {hasMore ? (
          <button 
            onClick={() => setIsExpanded((prev) => !prev)}
            className="text-green-400 hover:text-green-300 text-sm font-medium transition-colors flex items-center gap-1"
          >
            {isExpanded ? "عرض أقل" : "عرض الكل"} →
          </button>
        ) : (
          <div />
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayedCampaigns.map((campaign) => (
          <AssocCampaignCard
            key={campaign.id}
            campaign={campaign}
            onDonate={() => navigate(`/campaigns?id=${campaign.id}`)}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * AssocCampaignCard — campaign card specific to the association profile
 * Slightly more compact than the homepage CampaignCard
 */
function AssocCampaignCard({ campaign, onDonate }) {
  const safeGoal = Number(campaign?.goal || 0);
  const safeRaised = Number(campaign?.raised || 0);
  const progressPercent = Math.min(
    100,
    safeGoal > 0 ? Math.round((safeRaised / safeGoal) * 100) : 0
  );
  const deadline = campaign?.max_date ? new Date(campaign.max_date) : null;
  const isExpired = deadline instanceof Date && !Number.isNaN(deadline.getTime()) && deadline < new Date();
  const isCompleted = Boolean(campaign?.completed) || progressPercent >= 100;
  const canDonate = Boolean(campaign?.canDonate ?? (!isCompleted && !isExpired));
  const statusText = isCompleted ? "اكتملت الحملة" : isExpired ? "انتهت مدة الحملة" : "حملة نشطة";

  return (
    <div className="relative bg-gray-900 border border-gray-800 hover:border-green-700/50 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-green-950/30 group">

      {!canDonate && (
        <div className="absolute top-3 right-3 z-10 rounded-full px-3 py-1 text-[11px] font-bold text-white bg-gray-800 border border-gray-700 shadow-lg">
          {statusText}
        </div>
      )}

      {/* Card image */}
      <div className="relative h-40 bg-linear-to-br from-green-950 to-gray-800 flex items-center justify-center overflow-hidden">
        {campaign?.image ? (
          <img src={campaign.image} alt={campaign?.title || "Campaign"} className="w-full h-full object-cover" />
        ) : (
          <span className="text-5xl opacity-50 group-hover:scale-110 transition-transform duration-500">
            {campaign?.imageEmoji || "💚"}
          </span>
        )}

        {/* Urgent badge */}
        {campaign?.urgent && canDonate && (
          <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            عاجل
          </div>
        )}

        {/* Category badge */}
        <div className={`absolute top-3 left-3 ${campaign?.categoryColor || "bg-green-600"} text-white text-xs font-medium px-2 py-1 rounded-full`}>
          {campaign?.category || "تبرعات"}
        </div>
      </div>

      {/* Card content */}
      <div className="p-4 text-right">
        <h3 className="text-white font-bold text-sm mb-1 leading-snug line-clamp-1 group-hover:text-green-100 transition-colors">
          {campaign?.title || "حملة تبرع"}
        </h3>
        <p className="text-gray-500 text-xs mb-3 leading-relaxed line-clamp-2">
          {campaign?.description || "لا يوجد وصف متاح لهذه الحملة."}
        </p>

        {!canDonate ? (
          <div className="mb-3 rounded-xl border border-amber-800/40 bg-amber-950/20 px-3 py-2 text-right text-[11px] text-amber-200 leading-relaxed">
            {isCompleted
              ? "اكتملت الحملة، ويمكنك مراجعة تفاصيلها ونتائجها دون إمكانية التبرع مجدداً."
              : "انتهت مدة هذه الحملة، لذا تم إيقاف التبرع مع إبقاء الحملة ظاهرة في صفحة الجمعية."}
          </div>
        ) : null}

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span className={`font-semibold ${isCompleted ? "text-green-400" : "text-green-400"}`}>
              {progressPercent}%
            </span>
            <span>
              {safeRaised.toLocaleString("ar-DZ")} / {safeGoal.toLocaleString("ar-DZ")} دج
            </span>
          </div>
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isCompleted
                  ? "bg-green-500"
                    : "bg-linear-to-l from-green-500 to-green-700"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Meta + amounts */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          {Number(campaign?.daysLeft || 0) > 0 ? (
            <span className="text-yellow-400 font-medium">⏳ {campaign.daysLeft} يوم</span>
          ) : (
            <span className="text-gray-600">—</span>
          )}
          <span>👥 {Number(campaign?.donors || 0)} متبرع</span>
        </div>

        {/* Button */}
        {canDonate ? (
          <button
            onClick={onDonate}
            className="w-full py-2 text-xs font-bold bg-green-600 hover:bg-green-500 text-white rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-green-900/40"
          >
            تبرع الآن
          </button>
        ) : (
          <div className="w-full text-center py-2 text-xs font-medium bg-gray-800 text-gray-400 rounded-xl">
            {isCompleted ? "عرض التفاصيل" : "التبرع متوقف"}
          </div>
        )}
      </div>
    </div>
  );
}
