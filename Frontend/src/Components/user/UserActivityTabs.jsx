import { useState } from "react";
import { Link } from "react-router-dom";

/**
 * UserActivityTabs.jsx
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * USED ON: UserProfilePage only
 * FILE LOCATION: src/components/user/UserActivityTabs.jsx
 *
 * CONTAINS:
 * A tabbed card with two tabs (matching screenshot):
 *
 *   Tab 1 — سجل التبرعات  (Donations history) — DEFAULT ACTIVE
 *     List of donation rows, each showing:
 *       RIGHT: campaign icon (colored circle) + campaign name + date
 *       LEFT:  donation amount in green + "مكتمل" gray badge
 *     "عرض كل السجل" link at bottom → /dashboard/user/donations
 *
 *   Tab 2 — سجل الفعاليات  (Events history)
 *     List of event rows, each showing:
 *       RIGHT: event icon (colored circle) + event name + location + date
 *       LEFT:  status badge ("حضرت" green / "مسجّل" yellow)
 *     "عرض كل السجل" link at bottom → /dashboard/user/events
 *
 * ACTIVE TAB:
 * - Indicated by green bottom border + white text
 * - Inactive tab: gray text, no border
 *
 * SHOW ALL:
 * By default shows up to 4 items. "عرض كل السجل" shows all items inline
 * (toggle) OR navigates to a dedicated history page (your choice).
 * Currently implemented as inline toggle (showAll state).
 *
 * Props:
 *   donations — array of donation history objects
 *   events    — array of event history objects
 */

const STATUS_DONATION = {
  مكتمل:  { pill: "text-gray-500 bg-gray-800/60 border-gray-700/50" },
  جارٍ:   { pill: "text-yellow-400 bg-yellow-900/30 border-yellow-800/50" },
  ملغى:   { pill: "text-red-400 bg-red-900/30 border-red-800/50" },
};

const STATUS_EVENT = {
  حضرت:   { pill: "text-green-400 bg-green-900/30 border-green-800/50" },
  "مسجّل": { pill: "text-yellow-400 bg-yellow-900/30 border-yellow-800/50" },
  غاب:    { pill: "text-red-400 bg-red-900/30 border-red-800/50" },
};

const PREVIEW_COUNT = 4;

export default function UserActivityTabs({ donations, events }) {
  const [activeTab, setActiveTab] = useState("donations");
  const [showAllDonations, setShowAllDonations] = useState(false);
  const [showAllEvents, setShowAllEvents] = useState(false);

  const visibleDonations = showAllDonations ? donations : donations.slice(0, PREVIEW_COUNT);
  const visibleEvents    = showAllEvents    ? events    : events.slice(0, PREVIEW_COUNT);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">

      {/* ── Tab headers ── */}
      <div className="flex border-b border-gray-800">
        <TabButton
          label="سجل الفعاليات"
          active={activeTab === "events"}
          onClick={() => setActiveTab("events")}
        />
        <TabButton
          label="سجل التبرعات"
          active={activeTab === "donations"}
          onClick={() => setActiveTab("donations")}
        />
      </div>

      {/* ── Tab content ── */}
      <div className="p-2">

        {/* DONATIONS TAB */}
        {activeTab === "donations" && (
          <div>
            {donations.length === 0 ? (
              <EmptyState message="لم تقم بأي تبرع بعد" icon="💸" />
            ) : (
              <>
                <div className="divide-y divide-gray-800/60">
                  {visibleDonations.map((donation) => (
                    <DonationRow key={donation.id} donation={donation} />
                  ))}
                </div>

                {/* Show all / collapse */}
                {donations.length > PREVIEW_COUNT && (
                  <button
                    onClick={() => setShowAllDonations(!showAllDonations)}
                    className="w-full flex items-center justify-center gap-2 py-3 text-gray-400 hover:text-green-400 text-sm font-medium transition-colors border-t border-gray-800/60 mt-1"
                  >
                    <span>{showAllDonations ? "عرض أقل ↑" : "← عرض كل السجل"}</span>
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* EVENTS TAB */}
        {activeTab === "events" && (
          <div>
            {events.length === 0 ? (
              <EmptyState message="لم تشارك في أي فعالية بعد" icon="📅" />
            ) : (
              <>
                <div className="divide-y divide-gray-800/60">
                  {visibleEvents.map((event) => (
                    <EventRow key={event.id} event={event} />
                  ))}
                </div>

                {events.length > PREVIEW_COUNT && (
                  <button
                    onClick={() => setShowAllEvents(!showAllEvents)}
                    className="w-full flex items-center justify-center gap-2 py-3 text-gray-400 hover:text-green-400 text-sm font-medium transition-colors border-t border-gray-800/60 mt-1"
                  >
                    <span>{showAllEvents ? "عرض أقل ↑" : "← عرض كل السجل"}</span>
                  </button>
                )}
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

/* ── TabButton helper ────────────────────────────────────────────────────────── */
function TabButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex-1 py-3.5 text-sm font-semibold transition-all duration-200
        ${active ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
    >
      {label}
      {/* Active underline */}
      {active && (
        <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-green-500 rounded-full" />
      )}
    </button>
  );
}

/* ── DonationRow ─────────────────────────────────────────────────────────────── */
/**
 * A single donation record row
 * RIGHT: icon circle + campaign name + date
 * LEFT:  amount (green, bold) + status badge
 */
function DonationRow({ donation }) {
  const statusStyle = STATUS_DONATION[donation.status] ?? STATUS_DONATION["مكتمل"];

  return (
    <div className="flex items-center justify-between gap-3 px-3 py-3.5 hover:bg-gray-800/30 transition-colors rounded-xl group">

      {/* LEFT: amount + status */}
      <div className="flex flex-col items-start gap-1 shrink-0">
        <span className="text-green-400 font-bold text-sm tabular-nums">
          {donation.amount.toLocaleString("ar-DZ")} DZD
        </span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusStyle.pill}`}>
          {donation.status}
        </span>
      </div>

      {/* RIGHT: icon + name + date */}
      <div className="flex items-center gap-3 justify-end min-w-0">
        <div className="text-right min-w-0">
          <p className="text-white font-semibold text-sm leading-snug group-hover:text-green-100 transition-colors truncate">
            {donation.campaignTitle}
          </p>
          <p className="text-gray-500 text-xs mt-0.5 flex items-center gap-1 justify-end">
            <span>{donation.date}</span>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </p>
        </div>
        {/* Icon circle */}
        <div className={`w-10 h-10 rounded-xl ${donation.campaignColor} flex items-center justify-center text-xl shrink-0 border`}>
          {donation.campaignIcon}
        </div>
      </div>

    </div>
  );
}

/* ── EventRow ────────────────────────────────────────────────────────────────── */
/**
 * A single event participation record row
 * RIGHT: icon circle + event name + location + date
 * LEFT:  status badge
 */
function EventRow({ event }) {
  const statusStyle = STATUS_EVENT[event.status] ?? STATUS_EVENT["مسجّل"];

  return (
    <div className="flex items-center justify-between gap-3 px-3 py-3.5 hover:bg-gray-800/30 transition-colors rounded-xl group">

      {/* LEFT: status badge */}
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${statusStyle.pill}`}>
        {event.status}
      </span>

      {/* RIGHT: icon + name + location/date */}
      <div className="flex items-center gap-3 justify-end min-w-0">
        <div className="text-right min-w-0">
          <p className="text-white font-semibold text-sm leading-snug group-hover:text-green-100 transition-colors truncate">
            {event.eventTitle}
          </p>
          <div className="flex items-center gap-2 justify-end mt-0.5">
            <p className="text-gray-500 text-xs flex items-center gap-1">
              <span>{event.date}</span>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
            </p>
            {event.location && (
              <>
                <span className="text-gray-700 text-xs">•</span>
                <p className="text-gray-500 text-xs flex items-center gap-1">
                  <span>{event.location}</span>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                    <circle cx="12" cy="9" r="2.5" />
                  </svg>
                </p>
              </>
            )}
          </div>
        </div>
        {/* Icon circle */}
        <div className={`w-10 h-10 rounded-xl ${event.eventColor} flex items-center justify-center text-xl shrink-0 border`}>
          {event.eventIcon}
        </div>
      </div>

    </div>
  );
}

/* ── EmptyState ──────────────────────────────────────────────────────────────── */
function EmptyState({ message, icon }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
      <span className="text-4xl opacity-30">{icon}</span>
      <p className="text-gray-500 text-sm">{message}</p>
    </div>
  );
}
