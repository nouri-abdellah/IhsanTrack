import { useState } from 'react'
import Navbar from '../Components/Navbar'
import EventJoinModal from '../Components/EventJoinModal'
import useEvents from '../hooks/useEvents'

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-12 h-12 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin" />
  </div>
);

const formatDateTime = (dateValue) => {
  if (!dateValue) return 'غير محدد';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'غير محدد';

  return new Intl.DateTimeFormat('ar-DZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

const formatDate = (dateValue) => {
  if (!dateValue) return 'غير محدد';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'غير محدد';

  return new Intl.DateTimeFormat('ar-DZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

const Events = () => {
  const { events, loading, error } = useEvents();
  const [selectedEvent, setSelectedEvent] = useState(null);

  return (
    <div className="min-h-screen bg-gray-950 text-white font-arabic" dir="rtl">
      <Navbar/>

      <section className="max-w-6xl mx-auto px-4 py-8 pt-20">
        <div className="mb-6 text-right">
          <h1 className="text-3xl font-bold">الفعاليات</h1>
          <p className="text-gray-400 mt-2">قائمة الفعاليات من واجهة IhsanTrack API</p>
        </div>

        {loading ? <LoadingSpinner /> : null}
        {error ? <p className="text-red-400 text-right">{error}</p> : null}

        {!loading && !error && events.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">
            <h3 className="text-white text-lg font-bold">لا توجد فعاليات حالياً</h3>
            <p className="text-gray-400 text-sm mt-2">سيتم عرض الفعاليات هنا عند نشرها من طرف الجمعيات.</p>
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event) => {
            const maxParticipants = Number(event.max_participants || 0);
            const spotsTaken = Number(event.spots_taken || 0);
            const seatsLeft = Math.max(0, maxParticipants - spotsTaken);
            const associationName = event.association?.name || event.association?.user?.full_name || 'جمعية غير محددة';
            const coverImage = event.image_url || event.coverImage || event.image;
            const location = event.location_wilaya || event.location || 'غير محدد';

            return (
              <article
                key={event.id}
                className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:border-green-700/60 hover:-translate-y-1"
                onClick={() => setSelectedEvent(event)}
                role="button"
                tabIndex={0}
                onKeyDown={(eventKey) => {
                  if (eventKey.key === 'Enter' || eventKey.key === ' ') {
                    eventKey.preventDefault();
                    setSelectedEvent(event);
                  }
                }}
              >
                <div className="relative h-48 bg-linear-to-br from-green-950 to-gray-800 overflow-hidden flex items-center justify-center">
                  {coverImage ? (
                    <img
                      src={coverImage}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-6xl opacity-50">📅</span>
                  )}
                  <div className="absolute top-3 right-3 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {seatsLeft} مقعد متبقٍ
                  </div>
                  <div className="absolute top-3 left-3 bg-black/60 text-white text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm">
                    {formatDateTime(event.start_date)}
                  </div>
                </div>

                <div className="p-5 text-right">
                  <p className="text-sm text-green-400 mb-2">{associationName}</p>
                  <h2 className="text-xl font-semibold mb-3">{event.title}</h2>
                  <p className="text-gray-300 mb-4 line-clamp-3">{event.description}</p>

                  <div className="space-y-1 text-sm text-gray-300">
                    <p>من: {formatDate(event.start_date)}</p>
                    <p>إلى: {formatDate(event.end_date)}</p>
                    <p>الولاية: {location}</p>
                    <p>
                      المقاعد: {spotsTaken} / {maxParticipants}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(eventClick) => {
                      eventClick.stopPropagation();
                      setSelectedEvent(event);
                    }}
                    className="mt-4 w-full py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-sm transition-all duration-200"
                  >
                    سجّل الآن
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <EventJoinModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  )
}

export default Events