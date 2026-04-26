import { useState } from "react";
import { Link } from "react-router-dom";

/**
 * AssocHeader.jsx
 *
 * USED ON: AssocProfilePage only
 *
 * CONTAINS:
 * - Association logo (circular, overlaps the hero banner bottom)
 * - Association name + verified badge (✓)
 * - Tagline / subtitle
 * - Category tag (e.g. "خيرية")
 * - Two action buttons:
 *     "متابعة" (Follow)   → toggles follow state locally; in prod POST /api/associations/:id/follow
 *     "تبرع الآن" (Donate) → navigates to /campaigns?assoc=:id
 * - Social links: Facebook, Instagram, Website
 *
 * Props: assoc (association object)
 */
export default function AssocHeader({ assoc }) {
  const [following, setFollowing] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative -mt-10 sm:-mt-14">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6">

          {/* Logo circle — overlaps hero banner */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl border-4 border-gray-950 bg-green-800 shadow-xl shadow-green-950/60 flex items-center justify-center overflow-hidden">
              {assoc.logoImage ? (
                <img src={assoc.logoImage} alt={assoc.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl sm:text-4xl font-black text-white select-none">
                  {assoc.name.charAt(0)}
                </span>
              )}
            </div>
            {/* Verified badge on logo */}
            {assoc.verified && (
              <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-950 flex items-center justify-center">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
            )}
          </div>

          {/* Name + meta */}
          <div className="flex-1 pb-1 text-right">
            <div className="flex items-center gap-2 justify-end flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">{assoc.name}</h1>
              {assoc.verified && (
                <span className="inline-flex items-center gap-1 bg-green-600/20 border border-green-600/40 text-green-400 text-xs font-semibold px-2 py-0.5 rounded-full">
                  <span>✓</span> موثوق
                </span>
              )}
            </div>
            <p className="text-gray-400 text-sm mt-0.5">{assoc.tagline}</p>
            <div className="flex items-center gap-2 justify-end mt-2 flex-wrap">
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <span>📍</span>{assoc.location}
              </span>
              <span className="text-xs bg-green-900/50 border border-green-800/50 text-green-300 px-2 py-0.5 rounded-full">
                {assoc.category}
              </span>
              <span className="text-xs text-gray-500">
                🗓️ منذ {assoc.founded}
              </span>
            </div>
          </div>

          {/* Action buttons — right side on desktop */}
          <div className="sm:pb-2 shrink-0 w-full sm:w-auto">
            <div className="flex flex-col gap-2 items-end">
              <div className="flex items-center gap-2">
                {assoc.socialLinks?.facebook && (
                  <a
                    href={assoc.socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-gray-900 hover:bg-blue-700 border border-gray-700 hover:border-blue-600 rounded-xl flex items-center justify-center text-gray-300 hover:text-white text-xs font-bold transition-all duration-200"
                    aria-label="Facebook"
                  >
                    f
                  </a>
                )}
                {assoc.socialLinks?.instagram && (
                  <a
                    href={assoc.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-gray-900 hover:bg-pink-700 border border-gray-700 hover:border-pink-600 rounded-xl flex items-center justify-center text-gray-300 hover:text-white text-xs transition-all duration-200"
                    aria-label="Instagram"
                  >
                    📷
                  </a>
                )}
                {assoc.socialLinks?.website && (
                  <a
                    href={assoc.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-gray-900 hover:bg-gray-700 border border-gray-700 rounded-xl flex items-center justify-center text-gray-300 hover:text-white text-xs transition-all duration-200"
                    aria-label="Website"
                  >
                    🌐
                  </a>
                )}
                <span className="text-[11px] text-gray-500">روابط التواصل</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {/* Follow button */}
            <button
              onClick={() => setFollowing(!following)}
              className={`px-4 py-2 text-sm font-semibold rounded-xl border transition-all duration-200 ${
                following
                  ? "bg-green-600 border-green-600 text-white"
                  : "bg-transparent border-green-600 text-green-400 hover:bg-green-600/20"
              }`}
            >
              {following ? "✓ متابَع" : "+ متابعة"}
            </button>

            {/* Donate button */}
            <Link
              to={`/campaigns?assoc=${assoc.id}`}
              className="px-5 py-2 text-sm font-bold bg-green-600 hover:bg-green-500 text-white rounded-xl transition-all duration-200 shadow-lg shadow-green-900/40"
            >
              تبرع الآن
            </Link>
              </div>
            </div>
          </div>

        </div>

        {/* Tags row */}
        {assoc.tags && assoc.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-end mt-4">
            {assoc.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs text-gray-400 bg-gray-800 hover:bg-gray-700 border border-gray-700 px-3 py-1 rounded-full cursor-default transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
