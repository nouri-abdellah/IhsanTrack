import Navbar from '../Components/Navbar'
import Footer from '../Components/Footer'
import { Link } from 'react-router-dom'

const About_us = () => {
  return (
    <div className="font-arabic bg-[#0b1411] min-h-screen flex flex-col text-white" dir="rtl">
      <Navbar />
      
      <main className="flex-1 w-full pt-20">
        
        {/* ── Hero Section ── */}
        <section className="relative py-24 overflow-hidden border-b border-[#1f3029]">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f3d32]/30 via-[#0b1411] to-[#0b1411]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#10b981]/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#111a17] border border-[#2d463d] rounded-full px-4 py-1.5 text-[#10b981] text-sm shadow-lg mx-auto">
              <span className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse" />
              من نحن
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight text-white">
              طريق الإحسان <br />
              <span className="text-[#10b981] mt-2 block text-3xl sm:text-4xl">جسر الثقة بين المتبرع والمحتاج</span>
            </h1>
            
            <p className="text-[#8ca197] text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto">
              منصة جزائرية وطنية تهدف إلى رقمنة العمل الخيري، وتسهيل عملية التبرع للجمعيات المعتمدة بكل شفافية وأمان عبر 58 ولاية.
            </p>
          </div>
        </section>

        {/* ── Vision & Mission ── */}
        <section className="py-20 bg-[#0d1613]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Mission */}
              <div className="bg-[#111a17] border border-[#243a32] rounded-3xl p-8 hover:border-[#10b981]/40 transition-colors">
                <div className="w-16 h-16 rounded-2xl bg-[#0b1411] border border-[#2d463d] flex items-center justify-center text-3xl mb-6 shadow-inner text-[#10b981]">
                  🎯
                </div>
                <h2 className="text-2xl font-black text-white mb-4">رسالتنا</h2>
                <p className="text-[#8ca197] leading-loose text-base">
                  تسهيل الوصول إلى فرص الخير من خلال توفير منصة تقنية متطورة تجمع بين المتبرعين والجمعيات الخيرية، وتضمن وصول التبرعات إلى مستحقيها بأسرع وقت وأقل جهد، مع توفير تقارير شفافة لكل حملة.
                </p>
              </div>

              {/* Vision */}
              <div className="bg-[#111a17] border border-[#243a32] rounded-3xl p-8 hover:border-[#10b981]/40 transition-colors">
                <div className="w-16 h-16 rounded-2xl bg-[#0b1411] border border-[#2d463d] flex items-center justify-center text-3xl mb-6 shadow-inner text-[#10b981]">
                  👁️
                </div>
                <h2 className="text-2xl font-black text-white mb-4">رؤيتنا</h2>
                <p className="text-[#8ca197] leading-loose text-base">
                  أن نكون المنصة الأولى والأكثر موثوقية في الجزائر للعمل الخيري والتطوعي، وأن نساهم في بناء مجتمع متكافل ومترابط يمد يد العون لكل محتاج في أي بقعة من وطننا الحبيب.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Our Values ── */}
        <section className="py-20 bg-[#0b1411] border-y border-[#1f3029]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">القيم التي تحركنا</h2>
              <p className="text-[#8ca197] max-w-xl mx-auto text-base">بنيت منصة طريق الإحسان على أسس وقيم راسخة لضمان أفضل تجربة للمتبرع والجمعية</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="space-y-4 p-6 rounded-2xl hover:bg-[#111a17] transition-colors duration-300">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-xl font-bold text-white">الشفافية التامة</h3>
                <p className="text-[#8ca197] leading-relaxed text-sm">
                  كل دينار تتبرع به يتم تتبعه بدقة، مع توفير تقارير دورية حول مسار التبرعات ونتائج الحملات.
                </p>
              </div>
              <div className="space-y-4 p-6 rounded-2xl hover:bg-[#111a17] transition-colors duration-300">
                <div className="text-5xl mb-4">🔒</div>
                <h3 className="text-xl font-bold text-white">الأمان والموثوقية</h3>
                <p className="text-[#8ca197] leading-relaxed text-sm">
                  لا نقبل إلا الجمعيات المعتمدة رسمياً، ونوفر بوابات دفع إلكتروني محلية مشفرة وآمنة 100%.
                </p>
              </div>
              <div className="space-y-4 p-6 rounded-2xl hover:bg-[#111a17] transition-colors duration-300">
                <div className="text-5xl mb-4">🤝</div>
                <h3 className="text-xl font-bold text-white">العمل المجتمعي</h3>
                <p className="text-[#8ca197] leading-relaxed text-sm">
                  نحن نؤمن بقوة التعاون، ولذلك لا نأخذ أي عمولة على التبرعات، لضمان وصول المبالغ كاملة.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Call to Action ── */}
        <section className="py-24 bg-[#0d1613]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-6 leading-tight">
              كن جزءاً من مسيرة الخير <br />
              وابدأ بإحداث الأثر اليوم
            </h2>
            <p className="text-[#8ca197] text-lg mb-10 max-w-2xl mx-auto">
              سواء كنت فرداً يبحث عن فرصة للمساعدة، أو جمعية تبحث عن الدعم، طريق الإحسان هي بوابتك.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/campaigns"
                className="w-full sm:w-auto px-8 py-3.5 bg-[#0f7a59] hover:bg-[#10b981] text-white font-bold rounded-xl transition-all duration-300 border border-[#1f6f57] hover:border-[#10b981] shadow-lg shadow-emerald-900/20"
              >
                تصفح الحملات وتبرع
              </Link>
              <Link
                to="/events"
                className="w-full sm:w-auto px-8 py-3.5 bg-[#111a17] border border-[#2d463d] text-[#10b981] hover:bg-[#1a2922] hover:border-[#10b981]/50 font-bold rounded-xl transition-all duration-300"
              >
                انضم للفعاليات التطوعية
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}

export default About_us