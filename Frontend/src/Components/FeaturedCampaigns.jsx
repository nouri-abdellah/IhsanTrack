import { Link, useNavigate } from "react-router-dom";
import useCampaigns from "../hooks/useCampaigns";

const formatCurrency = (value) => new Intl.NumberFormat("ar-DZ").format(Number(value || 0));

export default function FeaturedCampaigns() {
  const navigate = useNavigate();
  const { campaigns, loading, error } = useCampaigns();
  
  // تصفية الحملات وعرض 3 حملات عاجلة فقط (استبعاد المكتملة والمنتهية)
  const featuredCampaigns = (campaigns || [])
    .filter((campaign) => {
      const goal = Number(campaign.goal_amount || campaign.goal || 0);
      const raised = Number(campaign.current_amount || campaign.raised || 0);
      const progress = goal > 0 ? (raised / goal) * 100 : 0;
      
      const isCompleted = progress >= 100;
      const isExpired = campaign.end_date && new Date(campaign.end_date).getTime() < Date.now();
      const status = campaign.status || "";
      const isStatusFinished = ["مكتملة", "منتهية", "ملغاة"].includes(status);

      // نقبل فقط الحملات التي لم تكتمل ولم تنتهِ
      return !isCompleted && !isExpired && !isStatusFinished;
    })
    .sort((a, b) => {
      // ترتيب الحملات بناءً على نسبة التقدم (الأقرب لاكتمال الهدف تظهر أولاً)
      const progA = Number(a.goal_amount) > 0 ? (Number(a.current_amount) / Number(a.goal_amount)) : 0;
      const progB = Number(b.goal_amount) > 0 ? (Number(b.current_amount) / Number(b.goal_amount)) : 0;
      return progB - progA;
    })
    .slice(0, 3) // أخذ 3 حملات فقط
    .map((campaign) => ({
      ...campaign,
      association: campaign.association?.name || campaign.association?.user?.full_name || "جمعية غير محددة",
      assocId: campaign.association?.id || campaign.association_id,
      raised: Number(campaign.current_amount || campaign.raised || 0),
      goal: Number(campaign.goal_amount || campaign.goal || 0),
      image: campaign.image_url || campaign.coverImage || campaign.image,
      category: campaign.domain || "عام",
    }));

  return (
    <section className="py-20 bg-[#0b1411] font-arabic" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-row items-end justify-between mb-12">
          <div className="text-right">
            <div className="flex items-center gap-3 justify-start mb-2">
              <h2 className="text-3xl sm:text-4xl font-black text-white">حملات عاجلة</h2>
              <span className="w-3 h-3 bg-[#10b981] rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
            </div>
            <p className="text-[#8ca197] text-sm font-medium">حملات تحتاج دعمك الآن</p>
          </div>
          <Link 
            to="/campaigns" 
            className="hidden sm:flex text-[#10b981] hover:text-emerald-400 text-sm font-bold items-center gap-2 transition-colors border border-[#2d463d] px-5 py-2.5 rounded-xl hover:border-[#10b981]/50 bg-[#111a17]"
          >
            عرض جميع الحملات ←
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-[400px] rounded-2xl border border-[#243a32] bg-[#111a17] animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-900/40 bg-red-950/20 p-6 text-center text-red-400 font-bold">
            {error}
          </div>
        ) : featuredCampaigns.length === 0 ? (
          <div className="rounded-2xl border border-[#243a32] bg-[#111a17] p-10 text-center text-[#8ca197] font-bold">
            لا توجد حملات عاجلة في الوقت الحالي.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCampaigns.map((campaign) => {
              const progress = campaign.goal > 0 ? Math.min(100, Math.round((campaign.raised / campaign.goal) * 100)) : 0;
              
              return (
                <div key={campaign.id} className="group overflow-hidden rounded-2xl border border-[#243a32] bg-[#111a17] transition-all duration-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:-translate-y-1 hover:border-[#10b981]/40 flex flex-col">
                  
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#0f3d32] to-[#12332a] shrink-0">
                    {campaign.image ? (
                      <img src={campaign.image} alt={campaign.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">💚</div>
                    )}
                    <div className="absolute top-3 right-3 bg-[#10b981] text-[#0b1411] text-xs font-black px-3 py-1.5 rounded-full shadow-lg">
                      {campaign.category}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 text-right flex flex-col flex-1">
                    <Link to={`/associations/${campaign.assocId}`} className="text-[#3b82f6] text-xs font-bold hover:underline mb-3 flex items-center gap-1 justify-start">
                      {campaign.association}
                      <span className="text-[#10b981]">✓</span>
                    </Link>
                    
                    <h3 className="text-white font-black text-lg mb-2 line-clamp-2">{campaign.title}</h3>
                    <p className="text-[#8ca197] text-xs leading-relaxed mb-5 line-clamp-2 flex-1">
                      {campaign.description || "ساهم في دعم هذه الحملة الإنسانية وكن جزءاً من التغيير."}
                    </p>
                    
                    {/* Progress */}
                    <div className="mb-4 mt-auto">
                      <div className="flex justify-between text-xs font-bold mb-2">
                        <span className="text-[#8ca197]">الهدف: {formatCurrency(campaign.goal)} دج</span>
                        <span className="text-[#10b981]">{progress}%</span>
                      </div>
                      <div className="h-2 bg-[#0d1613] rounded-full overflow-hidden border border-[#1f3029]">
                        <div className="h-full bg-[#10b981] transition-all duration-700" style={{ width: `${progress}%` }} />
                      </div>
                      <div className="mt-2 text-xs font-bold text-white">
                        تم جمع: {formatCurrency(campaign.raised)} دج
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/campaigns?id=${campaign.id}`)}
                      className="mt-2 w-full py-3 bg-[#0f7a59] hover:bg-[#10b981] text-white font-bold rounded-xl text-sm transition-all duration-300 border border-[#1f6f57] hover:border-[#10b981]"
                    >
                      تبرع الآن
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Mobile View Link */}
        <div className="mt-8 text-center sm:hidden">
           <Link to="/campaigns" className="text-[#10b981] font-bold text-sm">عرض جميع الحملات ←</Link>
        </div>
      </div>
    </section>
  );
}