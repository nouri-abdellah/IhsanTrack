import { Link } from "react-router-dom";

export default function AssociationCTA() {
  return (
    <section className="py-20 bg-[#0b1411] font-arabic" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#0a2e22] to-[#12332a] border border-[#243a32] shadow-2xl">

          <div className="absolute top-0 left-0 w-full h-full opacity-30" style={{ backgroundImage: "radial-gradient(#10b981 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
          
          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 p-10 lg:p-16 items-center">
            
            {/* RIGHT SIDE (Text) */}
            <div className="text-right space-y-6">
              <div className="inline-flex items-center gap-2 bg-[#0b1411] border border-[#2d463d] rounded-full px-4 py-2 text-[#10b981] text-xs font-bold w-fit">
                🏛️ للجمعيات والمؤسسات الخيرية
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                هل تدير جمعية خيرية وتريد توسيع أثرك؟
              </h2>
              <p className="text-[#8ca197] text-base leading-relaxed max-w-lg">
                انضم إلى منصة إحسان، وابدأ في نشر حملاتك، وإدارة التبرعات، وتنظيم الفعاليات التطوعية بكل سهولة وشفافية واحترافية.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link to="/assoc_sign_up" className="px-8 py-3.5 bg-[#10b981] hover:bg-emerald-400 text-[#0b1411] rounded-xl text-sm font-black transition-all duration-300 shadow-lg shadow-emerald-900/40">
                  سجل جمعيتك الآن
                </Link>
                <Link to="/associations" className="px-8 py-3.5 bg-[#0b1411] border border-[#2d463d] text-white hover:bg-[#111a17] rounded-xl text-sm font-bold transition-all duration-300">
                  تصفح الجمعيات
                </Link>
              </div>
            </div>

            {/* LEFT SIDE (Visuals) */}
            <div className="relative hidden lg:flex justify-end items-center h-full pr-10">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#10b981]/20 blur-[80px] rounded-full" />
              
              <div className="grid grid-cols-2 gap-4 relative z-10 w-full max-w-sm">
                <div className="space-y-4 pt-8">
                  <div className="bg-[#111a17] border border-[#243a32] p-5 rounded-2xl shadow-xl transform transition-transform hover:-translate-y-2 text-center">
                    <span className="text-4xl block mb-2">📊</span>
                    <span className="text-white font-bold text-sm">لوحة تحكم كاملة</span>
                  </div>
                  <div className="bg-[#111a17] border border-[#243a32] p-5 rounded-2xl shadow-xl transform transition-transform hover:-translate-y-2 text-center relative">
                    {/* Badge replaced with actual value instead of fake numbers */}
                    <div className="absolute -top-3 -right-3 bg-[#10b981] text-[#0b1411] text-[10px] font-black px-2 py-1 rounded-full border border-[#0f7a59] shadow-lg">100% مجاني</div>
                    <span className="text-4xl block mb-2">👥</span>
                    <span className="text-white font-bold text-sm">إدارة المتطوعين</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-[#111a17] border border-[#2d463d] p-5 rounded-2xl shadow-xl transform transition-transform hover:-translate-y-2 text-center border-b-4 border-b-[#10b981]">
                    <span className="text-4xl block mb-2">💳</span>
                    <span className="text-white font-bold text-sm">دفع إلكتروني آمن</span>
                  </div>
                  <div className="bg-[#111a17] border border-[#243a32] p-5 rounded-2xl shadow-xl transform transition-transform hover:-translate-y-2 text-center">
                    <span className="text-4xl block mb-2">📑</span>
                    <span className="text-white font-bold text-sm">تقارير شفافة</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}