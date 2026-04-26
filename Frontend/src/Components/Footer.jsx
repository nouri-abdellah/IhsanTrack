import { Link } from "react-router-dom";

/**
 * Footer.jsx
 *
 * USED ON: Every page (imported in each Page component or in a Layout wrapper)
 *
 * CONTAINS:
 * - Logo + short description + social media icons (Facebook, Instagram, Twitter/X)
 * - Quick links column: الرئيسية, الحملات, الجمعيات, كيف يعمل
 * - Support links: تواصل معنا, الأسئلة الشائعة, سياسة الخصوصية, شروط الاستخدام
 * - Bottom bar: copyright + "صنع بـ 💚 في الجزائر"
 *
 * SOCIAL LINKS: Update hrefs with real social media URLs before going live.
 */

const quickLinks = [
  { label: "الرئيسية", path: "/" },
  { label: "الحملات", path: "/campaigns" },
  { label: "الجمعيات", path: "/associations" },
  { label: "كيف يعمل", path: "/#how-it-works" },
  { label: "عن المنصة", path: "/about" },
];

const supportLinks = [
  { label: "تواصل معنا", path: "/contact" },
  { label: "الأسئلة الشائعة", path: "/faq" },
  { label: "سياسة الخصوصية", path: "/privacy" },
  { label: "شروط الاستخدام", path: "/terms" },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-green-900/30 mt-16 font-arabic" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-right">

          {/* Brand Column */}
          <div className="md:col-span-2">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 justify-end mb-4">
              <span className="text-white font-bold text-xl">
                إحسان <span className="text-green-400">الجزائر</span>
              </span>
              <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-900/50">
                <span className="text-white text-sm font-bold">إ</span>
              </div>
            </Link>

            {/* Tagline */}
            <p className="text-gray-400 text-sm leading-relaxed mb-5">
              منصة التبرع الجزائرية الأولى التي تربط المتبرعين بالجمعيات والأفراد المحتاجين بكل شفافية وأمان عبر 58 ولاية.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3 justify-end">
              {[
                { icon: "f", label: "Facebook", href: "https://facebook.com" },
                { icon: "in", label: "Instagram", href: "https://instagram.com" },
                { icon: "𝕏", label: "Twitter/X", href: "https://x.com" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-green-700 border border-gray-700 hover:border-green-600 flex items-center justify-center text-gray-400 hover:text-white text-xs font-bold transition-all duration-200"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm tracking-wide">روابط سريعة</h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-green-400 text-sm transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm tracking-wide">الدعم</h4>
            <ul className="space-y-2.5">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-green-400 text-sm transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-600 text-xs">
            صنع بـ 💚 في الجزائر &mdash; جميع الحقوق محفوظة © {new Date().getFullYear()}
          </p>
          <p className="text-gray-600 text-xs">
            إحسان الجزائر &mdash; منصة التبرع الجزائرية
          </p>
        </div>

      </div>
    </footer>
  );
}
