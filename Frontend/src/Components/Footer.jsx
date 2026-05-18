import { Link } from "react-router-dom";
import q from '../assets/Icons/q.png'

const quickLinks = [
  { label: "الرئيسية", path: "/" },
  { label: "من نحن", path: "/about_us" },
];

const platformLinks = [
  { label: "الجمعيات الخيرية", path: "/associations" },
  { label: "حملات التبرع", path: "/campaigns" },
  { label: "الفعاليات التطوعية", path: "/events" },
];

export default function Footer() {
  return (
    <footer className="bg-[#0b1411] border-t border-[#1f3029] font-arabic" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 text-right">

          {/* Brand Column */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 justify-start mb-6">
              <img className="w-8 h-8 object-contain" src={q} alt="شعار المنصة" />
              <span className="text-white font-black text-xl">
                طريق <span className="text-[#10b981]">الإحسان</span>
              </span>
            </Link>

            <p className="text-[#8ca197] text-sm leading-relaxed mb-6 max-w-sm">
              منصة جزائرية موثوقة تربط المتبرعين بالجمعيات الخيرية بشفافية، لتيسير التبرع والمشاركة في الفعاليات التطوعية عبر جميع الولايات.
            </p>

            {/* Social icons (You can add real links here later) */}
            <div className="flex items-center gap-3 justify-start">
              {[
                { icon: "f", label: "Facebook" },
                { icon: "in", label: "Instagram" },
                { icon: "𝕏", label: "Twitter" },
              ].map((social) => (
                <a
                  key={social.label}
                  href="#"
                  aria-label={social.label}
                  className="w-9 h-9 rounded-xl bg-[#111a17] hover:bg-[#0f7a59] border border-[#243a32] hover:border-[#10b981] flex items-center justify-center text-[#8ca197] hover:text-white text-xs font-bold transition-all duration-300"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-black mb-5 text-sm">روابط سريعة</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="text-[#8ca197] hover:text-[#10b981] text-sm font-medium transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-white font-black mb-5 text-sm">المنصة</h4>
            <ul className="space-y-3">
              {platformLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="text-[#8ca197] hover:text-[#10b981] text-sm font-medium transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-[#1f3029] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#6f837a] text-xs font-medium">
            صنع بـ 💚 في الجزائر &mdash; جميع الحقوق محفوظة © {new Date().getFullYear()}
          </p>
          <p className="text-[#6f837a] text-xs font-medium">
            طريق الإحسان &mdash; منصة التبرع الجزائرية
          </p>
        </div>

      </div>
    </footer>
  );
}