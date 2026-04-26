import { useCallback, useEffect, useMemo, useState } from "react";
import AssocDashboardNavbar from "../Components/dashboard/AssocDashboardNavbar";
import DashboardFooter from "../Components/dashboard/DashboardFooter";
import AssociationActivityPanel from "../Components/dashboard/AssociationActivityPanel";
import EventsDashboardStats from "../Components/dashboard/EventsDashboardStats";
import CreateEventForm from "../Components/dashboard/CreateEventForm";
import EventsTable from "../Components/dashboard/EventsTable";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

/**
 * AssocEventsDashboardPage.jsx
 *
 * ROUTE: /dashboard/association/events
 *
 * ACCESS: Protected — association accounts only.
 * Wrap with <ProtectedRoute role="association"> in App.jsx.
 *
 * PURPOSE:
 * The association's event & volunteer management interface. Allows them to:
 *   1. View overall event stats (published events, total volunteers, ongoing events)
 *   2. Create a new participation event/campaign via inline form
 *   3. View, filter, manage all their events in a table
 *   4. See who signed up (volunteers) for each event
 *
 * PAGE LAYOUT (top to bottom):
 * ┌──────────────────────────────────────────────────────┐
 * │  AssocDashboardNavbar (إدارة الفعاليات tab active)  │
 * ├──────────────────────────────────────────────────────┤
 * │  Page header: title + subtitle + create button       │
 * ├──────────────────────────────────────────────────────┤
 * │  EventsDashboardStats  (3 KPI cards)                 │
 * ├──────────────────────────────────────────────────────┤
 * │  CreateEventForm  (بيانات الحملة الجديدة)           │
 * ├──────────────────────────────────────────────────────┤
 * │  EventsTable  (events list + volunteer drawer)       │
 * ├──────────────────────────────────────────────────────┤
 * │  DashboardFooter                                     │
 * └──────────────────────────────────────────────────────┘
 *
 * STATE:
 * - showCreateForm: toggles the create event form
 * - events: array of event objects (mock → replace with API)
 * - selectedEvent: when set, shows the volunteers side panel
 *
 * API ENDPOINTS (production):
 *   GET    /api/associations/me/events          → load events list
 *   POST   /api/associations/me/events          → create event
 *   DELETE /api/associations/me/events/:id      → delete event
 *   GET    /api/events/:id/volunteers           → list volunteers for an event
 *   DELETE /api/events/:id/volunteers/:userId   → remove a volunteer
 */

export default function AssocEventsDashboardPage() {
  const { user, isAuthenticated, authLoading } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null); // for volunteers drawer
  const [volunteers, setVolunteers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const eventStats = useMemo(() => {
    const now = Date.now();
    const upcomingEvents = events.filter((event) => {
      const start = event.startDateValue || 0;
      return start > now;
    }).length;
    const activeEvents = events.filter((event) => event.status === "نشطة").length;
    const totalVolunteerRequests = Object.values(volunteers).reduce(
      (sum, eventVolunteers) => sum + eventVolunteers.length,
      0
    );
    const acceptedVolunteers = Object.values(volunteers)
      .flat()
      .filter((volunteer) => volunteer.status === "accepted").length;

    return {
      eventCount: events.length,
      upcomingEvents,
      activeEvents,
      totalVolunteerRequests,
      acceptedVolunteers,
    };
  }, [events, volunteers]);

  const recentRequests = useMemo(
    () =>
      events.flatMap((event) =>
        (volunteers[event.id] || []).map((volunteer) => ({
          id: volunteer.id,
          name: volunteer.name,
          email: volunteer.email,
          phone: volunteer.phone,
          registered_at: volunteer.joinedAt,
          status: volunteer.status,
          eventTitle: event.title,
          event: { title: event.title },
        }))
      ),
    [events, volunteers]
  );

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/associations/me/events");
      const rawEvents = response.data || [];
      const mappedEvents = rawEvents.map(mapEventRow);
      setEvents(mappedEvents);
      setVolunteers(buildVolunteerMap(rawEvents));
    } catch (err) {
      setError(err?.response?.data?.error || "تعذر تحميل الفعاليات.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || user?.role !== "association") {
      setLoading(false);
      setEvents([]);
      setVolunteers({});
      setError("يجب تسجيل الدخول بحساب جمعية لعرض هذه الصفحة.");
      return;
    }

    let ignore = false;

    (async () => {
      await loadEvents();
      if (ignore) return;
    })();

    return () => {
      ignore = true;
    };
  }, [authLoading, isAuthenticated, loadEvents, user?.role]);

  const handleEventCreated = async () => {
    setShowCreateForm(false);
    await loadEvents();
  };

  return (
    <div className="font-arabic min-h-screen bg-gray-950 text-white" dir="rtl">
      <AssocDashboardNavbar activeTab="/dashboard/association/events" />

      <main className="pt-14">
        {/* ── Page Header ── */}
        <div className="bg-gray-950 border-b border-gray-800/60 sticky top-14 z-40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              {/* Left: create button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCreateForm((v) => !v)}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-bold bg-green-600 hover:bg-green-500 text-white rounded-xl transition-all duration-200 shadow-lg shadow-green-900/40"
                >
                  <span className="text-base leading-none">+</span>
                  إنشاء فعالية جديدة
                </button>
              </div>
              {/* Right: title */}
              <div className="text-right">
                <h1 className="text-lg sm:text-xl font-extrabold text-white">
                  إدارة الحملات والمتطوعين
                </h1>
                <p className="text-gray-400 text-xs mt-0.5">
                  قم بإدارة فعالياتك التطوعية وتتبعت جميع المشاركين المتطوعين الخيرية التطوعية
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <EventsDashboardStats stats={eventStats} />
          <AssociationActivityPanel requests={recentRequests} />

          {showCreateForm && (
            <CreateEventForm
              onCreated={handleEventCreated}
              onCancel={() => setShowCreateForm(false)}
            />
          )}

          {error ? <div className="empty-state"><h3>No records found</h3><p>{error}</p></div> : null}
          {!error ? (
            <EventsTable
              events={events}
              volunteers={volunteers}
              selectedEvent={selectedEvent}
              setSelectedEvent={setSelectedEvent}
              onRefresh={loadEvents}
              loading={loading}
            />
          ) : null}
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
}

function mapEventRow(event) {
  const maxVolunteers = Number(event.max_participants || 0);
  const volunteers = Number(event.spots_taken || 0);
  const progress = maxVolunteers > 0 ? Math.min(100, Math.round((volunteers / maxVolunteers) * 100)) : 0;

  const now = Date.now();
  const start = event.start_date ? new Date(event.start_date).getTime() : now;
  const end = event.end_date ? new Date(event.end_date).getTime() : now;

  let status = "انتظار";
  if (end < now || progress >= 100) status = "مكتملة";
  else if (start <= now && end >= now) status = "نشطة";

  return {
    id: event.id,
    title: event.title,
    image: event.image_url,
    imageEmoji: "📅",
    volunteers,
    maxVolunteers,
    raised: volunteers,
    goal: maxVolunteers,
    progress,
    status,
    statusColor: status === "نشطة" ? "green" : status === "مكتملة" ? "blue" : "yellow",
    createdAt: event.createdAt ? new Date(event.createdAt).toLocaleDateString("ar-DZ") : "الآن",
    category: event.age_range || "عام",
    startDateValue: start,
    endDateValue: end,
  };
}

function buildVolunteerMap(events) {
  return events.reduce((accumulator, event) => {
    const eventVolunteers = Array.isArray(event.volunteers)
      ? event.volunteers.map((volunteer) => ({
          id: volunteer.id,
          name: volunteer.full_name || "مستخدم",
          email: volunteer.email || "غير متوفر",
          phone: volunteer.phone || "غير متوفر",
          wilaya: event.location_wilaya || "غير محدد",
          joinedAt: volunteer.VolunteersRegistry?.registered_at
            ? new Date(volunteer.VolunteersRegistry.registered_at).toLocaleDateString("ar-DZ")
            : "غير محدد",
          avatar: (volunteer.full_name || "م").charAt(0),
          status: volunteer.VolunteersRegistry?.status || "pending",
        }))
      : [];

    accumulator[event.id] = eventVolunteers;
    return accumulator;
  }, {});
}
