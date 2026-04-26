import { Link } from "react-router-dom";

/**
 * HeroSection.jsx
 *
 * USED ON: HomePage only
 *
 * CONTAINS:
 * - Background: deep dark green with subtle radial gradient + dot-grid texture
 * - LEFT PANEL (RTL right): animated stats ticker — "أكثر من 12,450+" donations, SIM badge, "850+" associations
 * - RIGHT PANEL (RTL left): Main headline, subtext, two CTA buttons
 * - Two CTA buttons:
 *     "تبرع الآن" (Donate Now)  → /campaigns
 *     "ابدأ حملة" (Start Campaign) → /register?type=association
 *
 * BACKGROUND DETAIL:
 * The dark green mesh gradient mimics the original design's atmosphere.
 * A subtle dot-grid SVG pattern is layered for depth.
 */

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden bg-gray-950 font-arabic" dir="rtl">

      {/* Background mesh gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-green-950/80 via-gray-950 to-gray-950" />

      {/* Decorative green glow blobs */}
      <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-green-700/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-green-600/10 rounded-full blur-2xl pointer-events-none" />

      {/* Dot grid texture overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #22c55e 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* RIGHT COLUMN (RTL: displayed first visually) — Main Content */}
          <div className="space-y-8 text-right order-1 lg:order-1">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-green-900/40 border border-green-700/50 rounded-full px-4 py-1.5 text-green-400 text-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              منصة التبرع الأولى في الجزائر
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-white">
              معاً من أجل{" "}
              <span className="text-green-400 relative">
                جزائر
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
                  <path d="M0 6 Q100 0 200 6" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
              <br />
              <span className="text-gray-200 text-3xl sm:text-4xl font-bold">أكثر تكاملاً وإنسانية</span>
            </h1>

            {/* Subtext */}
            <p className="text-gray-400 text-lg leading-relaxed max-w-xl mr-auto lg:mr-0">
              منصة إحسان الجزائر تربط المتبرعين بالجمعيات والأفراد المحتاجين، لتيسير التبرع بشفافية وأمان تام عبر جميع الولايات.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 justify-end">
              <Link
                to="/campaigns"
                className="px-8 py-3.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all duration-300 shadow-xl shadow-green-900/40 hover:shadow-green-700/50 hover:-translate-y-0.5 text-base"
              >
                تبرع الآن
              </Link>
              <Link
                to="/register?type=association"
                className="px-8 py-3.5 bg-transparent border-2 border-green-600 text-green-400 hover:bg-green-600 hover:text-white font-bold rounded-xl transition-all duration-300 text-base"
              >
                ابدأ حملة
              </Link>
            </div>
          </div>

          {/* LEFT COLUMN (RTL: displayed second) — Stats Card */}
          <div className="order-2 lg:order-2 flex justify-center lg:justify-start">
            <div className="relative w-full max-w-sm">
              {/* Main stats card */}
              <div className="bg-gray-900/80 backdrop-blur-sm border border-green-800/40 rounded-2xl p-6 shadow-2xl shadow-green-950/60">
                <p className="text-gray-400 text-sm mb-4 text-right font-medium">الإحصائيات الكلية</p>

                {/* Stat rows */}
                <div className="space-y-4">
                  <StatRow
                    icon="💚"
                    value="+12,450"
                    label="إجمالي التبرعات"
                    color="text-green-400"
                  />
                  <div className="h-px bg-green-900/30" />
                  <StatRow
                    icon="🏦"
                    value="SIM"
                    label="دفع آمن عبر البنك"
                    color="text-blue-400"
                    badge
                  />
                  <div className="h-px bg-green-900/30" />
                  <StatRow
                    icon="🏢"
                    value="+850"
                    label="جمعية مسجلة"
                    color="text-yellow-400"
                  />
                </div>

                {/* Bottom CTA mini */}
                <Link
                  to="/campaigns"
                  className="mt-5 w-full block text-center py-2.5 bg-green-600/20 hover:bg-green-600/40 border border-green-700/50 text-green-300 text-sm font-medium rounded-xl transition-all duration-200"
                >
                  استكشف الحملات ←
                </Link>
              </div>

              {/* Floating badge top-right */}
              <div className="absolute -top-3 -right-3 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg shadow-green-900/50">
                ✓ موثوق
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

/**
 * StatRow — small helper component used only inside HeroSection
 * NOT exported separately; defined here for colocation.
 */
function StatRow({ icon, value, label, color, badge }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-lg font-bold ${color}`}>{value}</span>
      <div className="flex items-center gap-2 text-right">
        <span className="text-gray-300 text-sm">{label}</span>
        <span className="text-xl">{icon}</span>
      </div>
    </div>
  );
}
