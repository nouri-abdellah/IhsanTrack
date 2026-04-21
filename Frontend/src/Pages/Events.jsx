import Navbar from '../Components/Navbar'
import useEvents from '../hooks/useEvents'

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

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar/>

      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6 text-right">
          <h1 className="text-3xl font-bold">الفعاليات</h1>
          <p className="text-gray-400 mt-2">قائمة الفعاليات من واجهة IhsanTrack API</p>
        </div>

        {loading ? <p className="text-gray-300 text-right">جارٍ تحميل الفعاليات...</p> : null}
        {error ? <p className="text-red-400 text-right">{error}</p> : null}

        {!loading && !error && events.length === 0 ? (
          <p className="text-gray-400 text-right">لا توجد فعاليات حالياً.</p>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event) => {
            const maxParticipants = Number(event.max_participants || 0);
            const spotsTaken = Number(event.spots_taken || 0);

            return (
              <article key={event.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="w-full h-48 object-cover"
                />

                <div className="p-5 text-right">
                  <p className="text-sm text-green-400 mb-2">{event.association?.name || 'جمعية غير محددة'}</p>
                  <h2 className="text-xl font-semibold mb-3">{event.title}</h2>
                  <p className="text-gray-300 mb-4 line-clamp-3">{event.description}</p>

                  <div className="space-y-1 text-sm text-gray-300">
                    <p>من: {formatDate(event.start_date)}</p>
                    <p>إلى: {formatDate(event.end_date)}</p>
                    <p>الولاية: {event.location_wilaya || 'غير محدد'}</p>
                    <p>
                      المقاعد: {spotsTaken} / {maxParticipants}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  )
}

export default Events