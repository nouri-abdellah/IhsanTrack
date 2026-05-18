/**
 * UserProfileHeader.jsx
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * USED ON: UserProfilePage only
 * FILE LOCATION: src/components/user/UserProfileHeader.jsx
 *
 * CONTAINS:
 * - Large circular avatar (center-aligned)
 *   → Shows user photo if available, otherwise emoji placeholder
 *   → Green ✓ verified badge overlaid on bottom-right of avatar
 * - User full name (large, bold, centered)
 * - Email address (gray, centered)
 * - "عضو منذ 20XX" pill badge (gray border, centered)
 *
 * EDIT BUTTON (optional, not in screenshot but useful):
 * A small edit icon can be added to the avatar to allow profile photo change.
 * Uncomment the edit section below when ready.
 *
 * Props: user — user object from API
 */
export default function UserProfileHeader({ user, onEditAvatar }) {
  const avatarInitial = (user.full_name || user.email || "").trim().charAt(0).toUpperCase() || "👤";

  return (
    <div className="flex flex-col items-center text-center gap-3 pt-4">

      {/* ── Avatar ── */}
      <div className="relative">
        <div className="w-28 h-28 rounded-full border-4 border-gray-800 bg-linear-to-br from-green-800 to-gray-800 flex items-center justify-center overflow-hidden shadow-xl shadow-green-950/50">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.full_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-5xl select-none">{avatarInitial}</span>
          )}
        </div>

        {/* Verified badge */}
        {user.is_email_verified && (
          <div className="absolute bottom-1 right-1 w-7 h-7 bg-green-500 rounded-full border-3 border-gray-950 flex items-center justify-center shadow-lg"
            style={{ borderWidth: "3px", borderColor: "#030712" }}
          >
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}

        {onEditAvatar && (
        <button
          type="button"
          onClick={onEditAvatar}
          className="absolute bottom-1 left-1 w-7 h-7 bg-gray-800 border border-gray-600 hover:border-green-600 rounded-full flex items-center justify-center text-gray-400 hover:text-green-400 text-xs transition-all"
          aria-label="تغيير الصورة"
        >
          ✏️
        </button>
        )}
      </div>

      {/* ── Name ── */}
      <h1 className="text-2xl font-extrabold text-white tracking-wide">
        {user.full_name}
      </h1>

      {/* ── Email ── */}
      <p className="text-gray-400 text-sm">{user.email}</p>

      {/* ── Member since badge ── */}
      <div className="flex items-center gap-2 bg-gray-900/60 border border-gray-700 rounded-full px-4 py-1.5 text-gray-300 text-sm">
        <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
        <span>عضو منذ {user.memberSince}</span>
      </div>

    </div>
  );
}
