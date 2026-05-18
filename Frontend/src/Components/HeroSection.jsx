import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-12 overflow-hidden bg-[#0b1411] font-arabic" dir="rtl">
      {/* Background mesh gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f3d32]/20 via-[#0b1411] to-[#0b1411]" />

      {/* Decorative green glow blobs */}
      <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-[#10b981]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-[#0f7a59]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Dot grid texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #10b981 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* RIGHT COLUMN (RTL: displayed first visually) */}
          <div className="space-y-8 text-right order-1">
            <div className="inline-flex items-center gap-2 bg-[#111a17] border border-[#2d463d] rounded-full px-4 py-1.5 text-[#10b981] text-sm shadow-lg shadow-black/20">
              <span className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse" />
              منصة التبرع الأولى في الجزائر
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.2] text-white">
              معاً من أجل{" "}
              <span className="text-[#10b981] relative">
                جزائر
                <svg className="absolute -bottom-2 left-0 w-full opacity-70" viewBox="0 0 200 8" fill="none">
                  <path d="M0 6 Q100 0 200 6" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>
              <br />
              <span className="text-[#d7e1dc] text-3xl sm:text-4xl font-extrabold mt-2 block">أكثر تكاملاً وإنسانية</span>
            </h1>

            <p className="text-[#8ca197] text-lg leading-relaxed max-w-xl">
              منصة إحسان تربط المتبرعين بالجمعيات والأفراد المحتاجين، لتيسير التبرع والمشاركة في الفعاليات التطوعية بشفافية وأمان عبر جميع الولايات.
            </p>

            <div className="flex flex-wrap gap-4 justify-start">
              <Link
                to="/campaigns"
                className="px-8 py-3.5 bg-[#0f7a59] hover:bg-[#10b981] text-white font-bold rounded-xl transition-all duration-300 border border-[#1f6f57] hover:border-[#10b981] shadow-lg shadow-emerald-900/20"
              >
                تبرع الآن
              </Link>
              <Link
                to="/assoc_sign_up"
                className="px-8 py-3.5 bg-[#111a17] border border-[#2d463d] text-[#10b981] hover:bg-[#1a2922] hover:border-[#10b981]/50 font-bold rounded-xl transition-all duration-300"
              >
                سجل جمعيتك
              </Link>
            </div>
          </div>

          {/* LEFT COLUMN (RTL: displayed second) */}
          <div className="order-2 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-sm">
              <div className="bg-[#111a17]/80 backdrop-blur-md border border-[#243a32] rounded-3xl p-7 shadow-2xl shadow-black/40">
                <p className="text-[#8ca197] text-sm mb-6 font-semibold">مميزات المنصة</p>

                <div className="space-y-5">
                  <StatRow icon="🤝" value="0%" label="بدون أي عمولة" color="text-[#10b981]" />
                  <div className="h-px bg-[#1f3029]" />
                  <StatRow icon="💳" value="آمن" label="دفع إلكتروني موثوق" color="text-blue-400" />
                  <div className="h-px bg-[#1f3029]" />
                  <StatRow icon="📍" value="58" label="ولاية جزائرية مغطاة" color="text-yellow-400" />
                </div>

                <Link
                  to="/events"
                  className="mt-6 w-full block text-center py-3 bg-[#0d1613] hover:bg-[#1a2922] border border-[#2d463d] text-[#10b981] text-sm font-bold rounded-xl transition-all duration-200"
                >
                  استكشف الفعاليات التطوعية ←
                </Link>
              </div>

              <div className="absolute -top-4 -right-4 bg-[#10b981] text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg shadow-emerald-900/30 border border-[#0f7a59]">
                ✓ شفافية تامة
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

function StatRow({ icon, value, label, color }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-xl font-black ${color}`} dir="ltr">{value}</span>
      <div className="flex items-center gap-3 text-right">
        <span className="text-[#d7e1dc] text-sm font-medium">{label}</span>
        <span className="text-2xl bg-[#0b1411] p-2 rounded-xl border border-[#243a32]">{icon}</span>
      </div>
    </div>
  );
}