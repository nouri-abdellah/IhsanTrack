/**
 * UserFooter.jsx
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * USED ON: UserProfilePage only
 * FILE LOCATION: src/components/user/UserFooter.jsx
 *
 * CONTAINS:
 * Minimal footer matching the screenshot — just a centered copyright line.
 * Matches the "© 2024 منصة الجزء جميع الحقوق محفوظة" line at the bottom.
 *
 * Much simpler than the public Footer.jsx — no link columns, no social icons.
 */
export default function UserFooter() {
  return (
    <footer className="border-t border-gray-800/60 mt-8">
      <div className="max-w-2xl mx-auto px-4 py-5 text-center">
        <p className="text-gray-600 text-xs">
          © {new Date().getFullYear()} منصة إحسان الجزائر — جميع الحقوق محفوظة
        </p>
      </div>
    </footer>
  );
}
