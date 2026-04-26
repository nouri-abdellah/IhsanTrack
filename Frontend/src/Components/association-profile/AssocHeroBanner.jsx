import { Link, useNavigate } from "react-router-dom";

/**
 * AssocHeroBanner.jsx
 *
 * USED ON: AssocProfilePage only
 *
 * CONTAINS:
 * - Full-width cover image area (360px tall)
 *   → In production replace the gradient bg with: <img src={assoc.coverImage} />
 * - "VOLUNTEERS" large text overlay (matches the screenshot)
 * - Illustrated volunteer figures (emoji placeholders for the illustration)
 * - Back arrow button (top-right in RTL) → navigates to /associations list
 * - Green overlay gradient for readability
 *
 * Props: assoc (association object)
 */
export default function AssocHeroBanner({ assoc }) {
  const navigate = useNavigate();

  return (
    <div className="relative w-full h-56 sm:h-72 md:h-80 overflow-hidden bg-gray-900 border-b border-gray-800">

      {/* Cover image — replace gradient with real image */}
      {assoc.coverImage ? (
        <img
          src={assoc.coverImage}
          alt={assoc.name}
          className="w-full h-full object-cover"
        />
      ) : (
        /* Clean blank background when no cover image */
        <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900" />
      )}

      {/* Dark overlay at bottom for text legibility */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-950 to-transparent" />

      {/* Back button — top right (RTL: top left visually) */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 right-4 flex items-center gap-2 bg-black/40 hover:bg-black/60 backdrop-blur-sm border border-white/20 text-white text-sm font-medium px-3 py-2 rounded-xl transition-all duration-200"
        aria-label="العودة"
      >
        <span>→</span>
        <span className="hidden sm:inline">العودة</span>
      </button>

      {/* Breadcrumb optional */}
      <div className="absolute top-4 left-4 text-xs text-white/50">
        <Link to="/" className="hover:text-white/80 transition-colors">الرئيسية</Link>
        <span className="mx-1">/</span>
        <Link to="/associations" className="hover:text-white/80 transition-colors">الجمعيات</Link>
      </div>

    </div>
  );
}
