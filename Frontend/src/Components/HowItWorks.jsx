import { Link } from "react-router-dom";

/**
 * HowItWorks.jsx
 *
 * USED ON: HomePage only (also reachable via anchor /#how-it-works from nav)
 *
 * CONTAINS:
 * Section explaining the 3-step donation process:
 *   1. اختر حملة (Choose a campaign)  → links to /campaigns
 *   2. تبرع وشارك (Donate & Share)    → user action, no separate page
 *   3. تابع أثرك (Track your impact)  → links to /dashboard after login
 *
 * The id="how-it-works" anchor allows the navbar "كيف يعمل" link to scroll here.
 *
 * DESIGN: Three cards with connecting dotted arrow between them on desktop.
 * Each card has a numbered icon, title, and description.
 */

const steps = [
  {
    number: "01",
    icon: "🔍",
    title: "اختر حملة",
    description:
      "تصفح مئات الحملات الإنسانية والاجتماعية من جمعيات معتمدة عبر 58 ولاية جزائرية، واختر ما يلمس قلبك.",
    cta: "استكشف الحملات",
    ctaPath: "/campaigns",
    color: "from-green-600 to-green-800",
  },
  {
    number: "02",
    icon: "💳",
    title: "تبرع وشارك",
    description:
      "أتمم تبرعك بأمان عبر بطاقة الدفع أو CIB أو SIM. شارك الحملة مع أصدقائك لمضاعفة الأثر.",
    cta: "ابدأ التبرع",
    ctaPath: "/campaigns",
    color: "from-blue-600 to-blue-800",
  },
  {
    number: "03",
    icon: "📊",
    title: "تابع أثرك",
    description:
      "تابع كيف يصل تبرعك إلى مستحقيه. تقارير شفافة دورية من الجمعية مع إشعارات فورية.",
    cta: "لوحة التتبع",
    ctaPath: "/dashboard",
    color: "from-purple-600 to-purple-800",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-gray-900 font-arabic" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center mb-14">
          <span className="text-green-400 text-sm font-semibold uppercase tracking-widest mb-3 block">
            الطريقة
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            كيف تعمل المنصة؟
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-base leading-relaxed">
            ثلاث خطوات بسيطة تفصلك عن إحداث أثر حقيقي في حياة إنسان جزائري
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">

          {/* Connecting line on desktop */}
          <div className="hidden md:block absolute top-14 left-1/6 right-1/6 h-0.5 bg-gradient-to-l from-transparent via-green-700/40 to-transparent pointer-events-none" />

          {steps.map((step, index) => (
            <StepCard key={index} step={step} index={index} />
          ))}
        </div>

      </div>
    </section>
  );
}

/**
 * StepCard — individual step card
 */
function StepCard({ step, index }) {
  return (
    <div className="relative bg-gray-950 border border-gray-800 hover:border-green-700/50 rounded-2xl p-7 text-right transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-green-950/30 group">

      {/* Step number (background) */}
      <div className="absolute top-4 left-5 text-6xl font-black text-gray-800/50 select-none group-hover:text-green-900/30 transition-colors duration-300">
        {step.number}
      </div>

      {/* Icon circle */}
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-2xl mb-5 shadow-lg ml-auto`}>
        {step.icon}
      </div>

      {/* Title */}
      <h3 className="text-white font-bold text-xl mb-3">{step.title}</h3>

      {/* Description */}
      <p className="text-gray-400 text-sm leading-relaxed mb-5">{step.description}</p>

      {/* CTA link */}
      <Link
        to={step.ctaPath}
        className="text-green-400 hover:text-green-300 text-sm font-semibold flex items-center gap-1 justify-end group-hover:gap-2 transition-all duration-200"
      >
        {step.cta} ←
      </Link>
    </div>
  );
}
