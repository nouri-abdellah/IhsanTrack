import Navbar from '../Components/Navbar'
import useCampaigns from '../hooks/useCampaigns'

const Campaigns = () => {
  const { campaigns, loading, error } = useCampaigns();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar/>

      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6 text-right">
          <h1 className="text-3xl font-bold">حملات التبرع</h1>
          <p className="text-gray-400 mt-2">قائمة الحملات المتاحة من واجهة IhsanTrack API</p>
        </div>

        {loading ? <p className="text-gray-300 text-right">جارٍ تحميل الحملات...</p> : null}
        {error ? <p className="text-red-400 text-right">{error}</p> : null}

        {!loading && !error && campaigns.length === 0 ? (
          <p className="text-gray-400 text-right">لا توجد حملات حالياً.</p>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {campaigns.map((campaign) => {
            const goal = Number(campaign.goal_amount || 0);
            const current = Number(campaign.current_amount || 0);
            const progress = goal > 0 ? Math.min(100, Math.round((current / goal) * 100)) : 0;

            return (
              <article key={campaign.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <img
                  src={campaign.image_url}
                  alt={campaign.title}
                  className="w-full h-48 object-cover"
                />

                <div className="p-5 text-right">
                  <p className="text-sm text-green-400 mb-2">{campaign.association?.name || 'جمعية غير محددة'}</p>
                  <h2 className="text-xl font-semibold mb-3">{campaign.title}</h2>
                  <p className="text-gray-300 mb-4 line-clamp-3">{campaign.description}</p>

                  <div className="mb-2 flex justify-between text-sm text-gray-300">
                    <span>{progress}%</span>
                    <span>
                      {current.toLocaleString('ar-DZ')} / {goal.toLocaleString('ar-DZ')} دج
                    </span>
                  </div>

                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-green-600" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  )
}

export default Campaigns