import { Link } from "react-router-dom";

/**
 * DashboardFooter.jsx
 *
 * USED ON: All association dashboard pages
 * (lighter than the public Footer — no full link columns)
 *
 * CONTAINS:
 * - Logo + tagline
 * - Social icons: Instagram, Facebook
 * - Copyright line
 *
 * Matches the simplified footer shown at the bottom of the edit profile screenshot.
 */
export default function DashboardFooter() {
  return (
    <footer className="bg-gray-950 border-t border-gray-800/60 mt-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-right">

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

          {/* Social icons */}
          <div className="flex items-center gap-3">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-blue-700 border border-gray-700 hover:border-blue-600 flex items-center justify-center text-gray-400 hover:text-white text-xs font-bold transition-all duration-200"
            >
              f
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-pink-700 border border-gray-700 hover:border-pink-600 flex items-center justify-center text-gray-400 hover:text-white text-xs transition-all duration-200"
            >
              📷
            </a>
          </div>

          {/* Logo + description */}
          <div className="text-right">
            <Link to="/" className="flex items-center gap-2 justify-end mb-2">
              <span className="text-white font-bold text-base">
                إحسان <span className="text-green-400">الجزائر</span>
              </span>
              <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">إ</span>
              </div>
            </Link>
            <p className="text-gray-500 text-xs leading-relaxed max-w-xs mr-0 ml-auto">
              إدارة ملفك وحملاتك بكل سهولة. مساعدتك هدفنا، لأننا نؤمن أن كل عمل خيري يستحق الدعم.
            </p>
          </div>

        </div>

        <div className="mt-6 pt-4 border-t border-gray-800 text-center">
          <p className="text-gray-600 text-xs">
            جميع الحقوق محفوظة © {new Date().getFullYear()} — إحسان الجزائر
          </p>
        </div>

      </div>
    </footer>
  );
}
