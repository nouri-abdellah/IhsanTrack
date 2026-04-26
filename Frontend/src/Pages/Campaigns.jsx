import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Navbar from '../Components/Navbar'
import DonationActionModal from '../Components/DonationActionModal'
import useCampaigns from '../hooks/useCampaigns'

const formatCurrency = (value) => new Intl.NumberFormat('ar-DZ').format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return 'غير محدد';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'غير محدد';

  return new Intl.DateTimeFormat('ar-DZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
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

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-12 h-12 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin" />
  </div>
);

const Campaigns = () => {
  const { campaigns, loading, error } = useCampaigns();
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [searchParams] = useSearchParams();

  // Auto-open modal if campaign ID is in URL
  useEffect(() => {
    const campaignId = searchParams.get('id');
    if (campaignId && campaigns.length > 0) {
      const campaign = campaigns.find(c => c.id === Number(campaignId));
      if (campaign) {
        setSelectedCampaign(campaign);
      }
    }
  }, [searchParams, campaigns]);

  return (
    <div className="min-h-screen bg-gray-950 text-white font-arabic" dir="rtl">
      <Navbar/>

      <section className="max-w-6xl mx-auto px-4 py-8 pt-20">
        <div className="mb-6 text-right">
          <h1 className="text-3xl font-bold">حملات التبرع</h1>
          <p className="text-gray-400 mt-2">قائمة الحملات المتاحة من واجهة IhsanTrack API</p>
        </div>

        {loading ? <LoadingSpinner /> : null}
        {error ? <p className="text-red-400 text-right">{error}</p> : null}

        {!loading && !error && campaigns.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">
            <h3 className="text-white text-lg font-bold">لا توجد حملات حالياً</h3>
            <p className="text-gray-400 text-sm mt-2">سيتم عرض الحملات هنا عند إضافتها من طرف الجمعيات.</p>
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {campaigns.map((campaign) => {
            const goal = Number(campaign.goal_amount || 0);
            const current = Number(campaign.current_amount || 0);
            const progress = goal > 0 ? Math.min(100, Math.round((current / goal) * 100)) : 0;
            const associationName = campaign.association?.name || campaign.association?.user?.full_name || 'جمعية غير محددة';
            const coverImage = campaign.image_url || campaign.coverImage || campaign.image;
            const deadline = campaign.max_date || campaign.end_date || campaign.deadline;
            const recentDonors = buildRecentDonors(campaign.donations || []);

            return (
              <article
                key={campaign.id}
                className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:border-green-700/60 hover:-translate-y-1"
                onClick={() => setSelectedCampaign(campaign)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setSelectedCampaign(campaign);
                  }
                }}
              >
                <div className="relative h-48 bg-linear-to-br from-green-950 to-gray-800 overflow-hidden flex items-center justify-center">
                  {coverImage ? (
                    <img
                      src={coverImage}
                      alt={campaign.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-6xl opacity-50">💚</span>
                  )}
                  <div className="absolute top-3 right-3 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {progress}%
                  </div>
                  {deadline ? (
                    <div className="absolute top-3 left-3 bg-black/60 text-white text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm">
                      {formatDate(deadline)}
                    </div>
                  ) : null}
                </div>

                <div className="p-5 text-right">
                  <p className="text-sm text-green-400 mb-2">{associationName}</p>
                  <h2 className="text-xl font-semibold mb-3">{campaign.title}</h2>
                  <p className="text-gray-300 mb-4 line-clamp-3">{campaign.description}</p>

                  <div className="mb-2 flex justify-between text-sm text-gray-300">
                    <span>{progress}%</span>
                    <span>{formatCurrency(current)} / {formatCurrency(goal)} دج</span>
                  </div>

                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-green-600" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                    <span>{recentDonors.length > 0 ? `${recentDonors.length} متبرع حديث` : "لا توجد تبرعات بعد"}</span>
                    <span>المزيد في صفحة الجمعية</span>
                  </div>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedCampaign(campaign);
                    }}
                    className="mt-4 w-full py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-sm transition-all duration-200"
                  >
                    عرض التفاصيل والتبرع
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <DonationActionModal
        campaign={selectedCampaign}
        onClose={() => setSelectedCampaign(null)}
      />
    </div>
  )
}

export default Campaigns