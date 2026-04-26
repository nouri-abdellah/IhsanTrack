import { Link, useNavigate } from "react-router-dom";
import useCampaigns from "../hooks/useCampaigns";

/**
 * FeaturedCampaigns.jsx  (updated)
 *
 * USED ON: HomePage only
 *
 * KEY CHANGE: "تبرع الآن" button on each card now opens DonationModal
 * instead of navigating to /campaigns/:id.
 * The modal handles the full donation flow inline.
 *
 * HOW IT CONNECTS:
 *   selectedCampaign === null  → modal hidden
 *   selectedCampaign === obj   → DonationModal renders with that campaign
 *   onClose()                  → resets selectedCampaign to null
 */

const formatCurrency = (value) => new Intl.NumberFormat("ar-DZ").format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("ar-DZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

const buildRecentDonors = (donations = []) =>
  [...donations]
    .sort((left, right) => new Date(right.date || 0) - new Date(left.date || 0))
    .slice(0, 3)
    .map((donation) => ({
      id: donation.id,
      name: donation.anonymous ? "متبرع مجهول" : donation.donor?.full_name || donation.donor?.email || "متبرع",
      amount: Number(donation.amount || 0),
      timeAgo: donation.date ? formatDate(donation.date) : "حديثاً",
      avatar: donation.anonymous ? "؟" : (donation.donor?.full_name || "م").charAt(0),
      anonymous: Boolean(donation.anonymous),
    }));

export default function FeaturedCampaigns() {
  const navigate = useNavigate();
  const { campaigns, loading, error } = useCampaigns();
  const featuredCampaigns = (campaigns || []).slice(0, 3).map((campaign) => ({
    ...campaign,
    association: campaign.association?.name || campaign.association?.user?.full_name || "جمعية غير محددة",
    assocId: campaign.association?.id || campaign.association_id,
    raised: Number(campaign.current_amount || campaign.raised || 0),
    goal: Number(campaign.goal_amount || campaign.goal || 0),
    donors: Number(campaign.donors || campaign.donor_count || 0),
    daysLeft: campaign.max_date ? Math.max(0, Math.ceil((new Date(campaign.max_date) - new Date()) / (1000 * 60 * 60 * 24))) : 0,
    urgent: Boolean(campaign.urgent),
    image: campaign.image_url || campaign.coverImage || campaign.image,
    imageEmoji: campaign.imageEmoji || "💚",
    category: campaign.category || "حملة",
    categoryColor: "bg-green-600",
    recentDonors: buildRecentDonors(campaign.donations || campaign.recentDonors || []),
  }));

  return (
    <section className="py-16 bg-gray-950 font-arabic" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <Link to="/campaigns" className="text-green-400 hover:text-green-300 text-sm font-medium flex items-center gap-1 transition-colors">
            ← عرض جميع الحملات
          </Link>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end mb-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">حملات عاجلة</h2>
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
            </div>
            <p className="text-gray-400 text-sm">حملات تحتاج دعمك الآن</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-96 rounded-2xl border border-gray-800 bg-gray-900 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-900/40 bg-red-950/20 p-6 text-right text-red-300">
            {error}
          </div>
        ) : featuredCampaigns.length === 0 ? (
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8 text-center text-gray-400">
            لا توجد حملات مميزة حالياً.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCampaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onDonate={() => navigate(`/campaigns?id=${campaign.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function CampaignCard({ campaign, onDonate }) {
  const progressPercent = campaign.goal > 0 ? Math.round((campaign.raised / campaign.goal) * 100) : 0;
  const deadline = formatDate(campaign.max_date || campaign.end_date || campaign.deadline);

  return (
    <div className="bg-gray-900 border border-gray-800 hover:border-green-700/50 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-green-950/40 group">
      <div className="relative h-44 bg-linear-to-br from-green-950 to-gray-800 flex items-center justify-center overflow-hidden">
        {campaign.image ? (
          <img src={campaign.image} alt={campaign.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-6xl opacity-50 group-hover:scale-110 transition-transform duration-500">{campaign.imageEmoji}</span>
        )}
        {campaign.urgent && (
          <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />عاجل
          </div>
        )}
        <div className={`absolute top-3 left-3 ${campaign.categoryColor} text-white text-xs font-medium px-2 py-1 rounded-full`}>
          {campaign.category}
        </div>
        {deadline ? (
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[11px] font-medium px-2 py-1 rounded-full backdrop-blur-sm">
            {deadline}
          </div>
        ) : null}
      </div>

      <div className="p-5 text-right">
        <Link to={`/associations/${campaign.assocId}`} className="text-green-400 text-xs font-medium hover:text-green-300 transition-colors mb-2 block">
          {campaign.association}
        </Link>
        <h3 className="text-white font-bold text-base mb-4 leading-snug line-clamp-2 group-hover:text-green-100 transition-colors">
          {campaign.title}
        </h3>
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span className="text-green-400 font-semibold">{progressPercent}%</span>
            <span>{formatCurrency(campaign.raised)} دج / {formatCurrency(campaign.goal)} دج</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-linear-to-l from-green-500 to-green-700 rounded-full transition-all duration-700" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <span className="text-yellow-400 font-medium">⏳ {campaign.daysLeft} أيام متبقية</span>
          <span>👥 {campaign.donors} متبرع</span>
        </div>
        {campaign.recentDonors?.length ? (
          <div className="mb-4 flex -space-x-2 justify-end">
            {campaign.recentDonors.map((donor) => (
              <div
                key={donor.id}
                className="w-8 h-8 rounded-full border-2 border-gray-900 bg-gray-800 text-[11px] font-bold flex items-center justify-center text-white"
                title={donor.anonymous ? "متبرع مجهول" : donor.name}
              >
                {donor.avatar}
              </div>
            ))}
          </div>
        ) : null}
        <button
          onClick={onDonate}
          className="w-full py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-sm transition-all duration-200 hover:shadow-lg hover:shadow-green-900/40"
        >
          تبرع الآن
        </button>
      </div>
    </div>
  );
}
