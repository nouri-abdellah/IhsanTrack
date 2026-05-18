import { Link } from "react-router-dom";

export default function AuthTopBar({ title, subtitle, actionLabel, actionPath }) {
  return (
    <div className="absolute top-0 inset-x-0 z-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-gray-950/55 backdrop-blur-xl px-4 py-3 shadow-2xl shadow-black/20">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-green-500 to-emerald-700 flex items-center justify-center text-white font-black shadow-lg shadow-green-900/30">
              إ
            </div>
            <div className="text-right leading-tight">
              <p className="text-white font-extrabold">طريق الإحسان</p>
              <p className="text-xs text-gray-400">منصة التبرع الجزائرية</p>
            </div>
          </Link>

          <div className="hidden md:block text-right">
            <p className="text-sm font-semibold text-white">{title}</p>
            <p className="text-xs text-gray-400">{subtitle}</p>
          </div>

          <Link
            to={actionPath}
            className="inline-flex items-center justify-center rounded-xl border border-green-700/50 bg-green-600/15 px-4 py-2 text-sm font-semibold text-green-300 hover:bg-green-600/25 hover:text-white transition-colors"
          >
            {actionLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}