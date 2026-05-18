const stats = [
  { value: "0%", label: "عمولة", desc: "لا نأخذ أي عمولة على التبرعات", icon: "🤝" },
  { value: "24/7", label: "دعم متواصل", desc: "فريق الدعم متاح على مدار الساعة", icon: "🕐" },
  { value: "58", label: "ولاية", desc: "نغطي كامل الولايات الجزائرية", icon: "📍" },
  { value: "100%", label: "شفافية", desc: "تتبع كل تبرع من المصدر للهدف", icon: "✅" },
];

export default function StatsBar() {
  return (
    <section className="bg-[#0d1613] border-y border-[#1f3029] font-arabic" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-x-reverse divide-[#1f3029]">
          {stats.map((stat, index) => (
            <div key={index} className="py-10 px-6 text-center group hover:bg-[#111a17] transition-colors duration-300">
              <div className="text-3xl mb-3 opacity-80 group-hover:opacity-100 transition-opacity">{stat.icon}</div>
              <div className="text-3xl sm:text-4xl font-black text-[#10b981] mb-2 group-hover:scale-105 transition-transform duration-300" dir="ltr">
                {stat.value}
              </div>
              <div className="text-white font-bold text-base mb-1">{stat.label}</div>
              <div className="text-[#8ca197] text-xs leading-relaxed">{stat.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}