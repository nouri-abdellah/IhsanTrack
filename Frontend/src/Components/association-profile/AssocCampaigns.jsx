import { useState } from "react";
import DonationModal from "../DonationModal";

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
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showAll, setShowAll] = useState(false);
  
  if (!campaigns || campaigns.length === 0) return null;

  // Show only first 3 campaigns by default
  const displayedCampaigns = showAll ? campaigns : campaigns.slice(0, 3);
  const hasMore = campaigns.length > 3;

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between mb-5">
        {!showAll && hasMore ? (
          <button 
            onClick={() => setShowAll(true)}
            className="text-green-400 hover:text-green-300 text-sm font-medium transition-colors flex items-center gap-1"
          >
            عرض جميع الحملات ←
          </button>
        ) : showAll && hasMore ? (
          <button 
            onClick={() => setShowAll(false)}
            className="text-green-400 hover:text-green-300 text-sm font-medium transition-colors flex items-center gap-1"
          >
            إخفاء الحملات الإضافية ←
          </button>
        ) : (
          <div />
        )}
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-extrabold text-white">حملات التبرع الحالية</h2>
          <div className="w-1 h-6 bg-green-500 rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayedCampaigns.map((campaign) => (
          <AssocCampaignCard
            key={campaign.id}
            campaign={campaign}
            onDonate={() => setSelectedCampaign(campaign)}
          />
        ))}
      </div>

      <DonationModal
        campaign={selectedCampaign}
        onClose={() => setSelectedCampaign(null)}
      />
    </div>
  );
}

/**
 * AssocCampaignCard — campaign card specific to the association profile
 * Slightly more compact than the homepage CampaignCard
 */
function AssocCampaignCard({ campaign, onDonate }) {
  const progressPercent = Math.min(
    100,
    Math.round((campaign.raised / campaign.goal) * 100)
  );
  const isCompleted = campaign.completed || progressPercent >= 100;

  return (
    <div className="relative bg-gray-900 border border-gray-800 hover:border-green-700/50 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-green-950/30 group">

      {/* Completed overlay */}
      {isCompleted && (
        <div className="absolute inset-0 bg-gray-950/70 z-10 flex items-center justify-center rounded-2xl backdrop-blur-sm">
          <div className="bg-green-600 text-white font-bold text-sm px-5 py-2 rounded-full shadow-lg">
            ✓ اكتملت الحملة
          </div>
        </div>
      )}

      {/* Card image */}
      <div className="relative h-40 bg-gradient-to-br from-green-950 to-gray-800 flex items-center justify-center overflow-hidden">
        {campaign.image ? (
          <img src={campaign.image} alt={campaign.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-5xl opacity-50 group-hover:scale-110 transition-transform duration-500">
            {campaign.imageEmoji}
          </span>
        )}

        {/* Urgent badge */}
        {campaign.urgent && !isCompleted && (
          <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            عاجل
          </div>
        )}

        {/* Category badge */}
        <div className={`absolute top-3 left-3 ${campaign.categoryColor} text-white text-xs font-medium px-2 py-1 rounded-full`}>
          {campaign.category}
        </div>
      </div>

      {/* Card content */}
      <div className="p-4 text-right">
        <h3 className="text-white font-bold text-sm mb-1 leading-snug line-clamp-1 group-hover:text-green-100 transition-colors">
          {campaign.title}
        </h3>
        <p className="text-gray-500 text-xs mb-3 leading-relaxed line-clamp-2">
          {campaign.description}
        </p>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span className={`font-semibold ${isCompleted ? "text-green-400" : "text-green-400"}`}>
              {progressPercent}%
            </span>
            <span>
              {campaign.raised.toLocaleString("ar-DZ")} / {campaign.goal.toLocaleString("ar-DZ")} دج
            </span>
          </div>
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isCompleted
                  ? "bg-green-500"
                  : "bg-gradient-to-l from-green-500 to-green-700"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Meta + amounts */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          {campaign.daysLeft > 0 ? (
            <span className="text-yellow-400 font-medium">⏳ {campaign.daysLeft} يوم</span>
          ) : (
            <span className="text-gray-600">—</span>
          )}
          <span>👥 {campaign.donors} متبرع</span>
        </div>

        {/* Button */}
        {!isCompleted ? (
          <button
            onClick={onDonate}
            className="w-full py-2 text-xs font-bold bg-green-600 hover:bg-green-500 text-white rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-green-900/40"
          >
            تبرع الآن
          </button>
        ) : (
          <Link
            to={`/campaigns/${campaign.id}`}
            className="w-full block text-center py-2 text-xs font-medium bg-gray-800 text-gray-400 rounded-xl hover:bg-gray-700 transition-all duration-200"
          >
            عرض التفاصيل
          </Link>
        )}
      </div>
    </div>
  );
}
