import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Navbar from '../Components/Navbar'
import EventJoinModal from '../Components/EventJoinModal'
import useEvents from '../hooks/useEvents'
import Footer from '../Components/Footer';
import { FiCalendar, FiMapPin, FiSearch, FiArrowLeft, FiChevronDown } from 'react-icons/fi'
import { ASSOCIATION_LOCATIONS } from '../utils/associationOptions'

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-24">
    <div className="w-12 h-12 rounded-full border-4 border-[#10b981]/20 border-t-[#10b981] animate-spin" />
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
  const [searchParams] = useSearchParams();
  
  // Filter States
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [onlyOpen, setOnlyOpen] = useState(true);

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();
    
    return (events || []).filter((event) => {
      // 1. Search Query
      const titleMatch = event?.title?.toLowerCase().includes(query);
      const descriptionMatch = event?.description?.toLowerCase().includes(query);
      const associationMatch = event?.association?.name?.toLowerCase().includes(query);
      const matchesQuery = !query || titleMatch || descriptionMatch || associationMatch;
      
      // 2. City Match
      const matchesCity = city === 'all' || (event?.location_wilaya || event?.location || '').toLowerCase().includes(city.toLowerCase());
      
      // 3. Date Range Match (From - To)
      let matchesDate = true;
      if (event?.start_date) {
        const evDate = new Date(event.start_date).getTime();
        
        if (dateFrom) {
          const fromTime = new Date(dateFrom).getTime();
          matchesDate = matchesDate && evDate >= fromTime;
        }
        
        if (dateTo) {
          // Add 86400000ms (1 day) to include the entire 'To' day
          const toTime = new Date(dateTo).getTime() + 86400000;
          matchesDate = matchesDate && evDate <= toTime;
        }
      } else if (dateFrom || dateTo) {
        matchesDate = false; // If filtering by date and event has no date, hide it
      }

      // 4. Open Registration Match
      const seatsLeft = Math.max(0, Number(event?.max_participants || 0) - Number(event?.spots_taken || 0));
      const matchesOpen = !onlyOpen || seatsLeft > 0;
      
      return matchesQuery && matchesCity && matchesDate && matchesOpen;
    });
  }, [city, dateFrom, dateTo, events, onlyOpen, search]);

  useEffect(() => {
    const eventId = searchParams.get('id');
    if (!eventId || !events.length) return;

    const target = events.find((item) => Number(item?.id) === Number(eventId));
    if (target) setSelectedEvent(target);
  }, [events, searchParams]);

  return (
    <div className="min-h-screen bg-[#0b1411] text-white font-arabic" dir="rtl">
      <Navbar/>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
        
        {/* Modern Filter Section */}
        <div className="mb-8 rounded-3xl border border-[#21362f] bg-[#111a17] p-5 sm:p-7 shadow-xl shadow-black/20">
          <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="text-right">
              <h1 className="text-3xl font-black text-white sm:text-4xl">الفعاليات وفرص التطوع</h1>
              <p className="mt-2 text-sm text-[#8da399]">ابحث عن الفعالية المناسبة، تصفح الأماكن المفتوحة، وسجل مباشرة في الفرص المتاحة.</p>
            </div>

            <button
              type="button"
              onClick={() => setOnlyOpen((value) => !value)}
              className={`shrink-0 inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition-all border ${
                onlyOpen 
                  ? 'bg-[#10b981] text-white border-[#10b981]' 
                  : 'bg-[#0d1613] text-[#8ca197] border-[#2d463d] hover:border-[#10b981]/50'
              }`}
            >
              <span className={onlyOpen ? 'text-white' : 'text-[#10b981]'}>⚡</span>
              {onlyOpen ? 'متاحة للتسجيل فقط' : 'عرض كل الفعاليات'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <label className="flex items-center gap-3 rounded-2xl border border-[#2d463d] bg-[#0d1613] px-4 py-3 text-sm transition-colors focus-within:border-[#10b981]">
              <FiSearch className="shrink-0 text-[#7f948b]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث عن فعالية، جمعية..."
                className="w-full bg-transparent outline-none text-right text-white placeholder:text-[#6f837a]"
              />
            </label>

            {/* City Select */}
            <div className="relative">
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full appearance-none rounded-2xl border border-[#2d463d] bg-[#0d1613] px-4 py-3 pr-10 text-sm text-white outline-none transition-colors hover:border-[#10b981]/50"
              >
                <option value="all">كل المدن (58 ولاية)</option>
                {ASSOCIATION_LOCATIONS.map((wilaya) => (
                  <option key={wilaya} value={wilaya}>{wilaya}</option>
                ))}
              </select>
              <FiChevronDown className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8ca197]" />
            </div>

            {/* Date From */}
            <label className="flex items-center gap-2 rounded-2xl border border-[#2d463d] bg-[#0d1613] px-4 py-3 text-sm transition-colors focus-within:border-[#10b981]">
              <span className="shrink-0 text-[#7f948b] text-xs font-bold w-6">من:</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full bg-transparent outline-none text-right text-white placeholder:text-[#6f837a]"
              />
            </label>

            {/* Date To */}
            <label className="flex items-center gap-2 rounded-2xl border border-[#2d463d] bg-[#0d1613] px-4 py-3 text-sm transition-colors focus-within:border-[#10b981]">
              <span className="shrink-0 text-[#7f948b] text-xs font-bold w-6">إلى:</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full bg-transparent outline-none text-right text-white placeholder:text-[#6f837a]"
              />
            </label>
          </div>
        </div>

        {loading ? <LoadingSpinner /> : null}
        {error ? <p className="text-red-400 text-right">{error}</p> : null}

        {!loading && !error && filteredEvents.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-[#22352d] bg-[#111a17] p-10 text-center text-[#9eb0a7]">
            <h3 className="text-white text-lg font-bold mb-2">لا توجد فعاليات مطابقة لبحثك</h3>
            <p className="text-[#8da399] text-sm">جرب تغيير الفلاتر أو إزالة النطاق الزمني لعرض المزيد من النتائج.</p>
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const maxParticipants = Number(event.max_participants || 0);
            const spotsTaken = Number(event.spots_taken || 0);
            const seatsLeft = Math.max(0, maxParticipants - spotsTaken);
            const associationName = event.association?.name || event.association?.user?.full_name || 'جمعية غير محددة';
            const coverImage = event.image_url || event.coverImage || event.image;
            const location = event.location_wilaya || event.location || 'غير محدد';
            const progress = maxParticipants > 0 ? Math.min(100, Math.round((spotsTaken / maxParticipants) * 100)) : 0;

            return (
              <article
                key={event.id}
                className="group overflow-hidden rounded-2xl border border-[#243a32] bg-[#111a17] shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:border-[#10b981]/40 hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
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
                <div className="relative aspect-video overflow-hidden bg-linear-to-br from-[#0f3d32] via-[#12332a] to-[#334155] flex items-center justify-center">
                  {coverImage ? (
                    <img
                      src={coverImage}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <span className="text-6xl opacity-20">📅</span>
                  )}
                  
                  {seatsLeft > 0 ? (
                    <div className="absolute top-3 right-3 rounded-full bg-[#10b981] px-3 py-1 text-xs font-bold text-white shadow-lg shadow-emerald-900/30">
                      مفتوح للتسجيل
                    </div>
                  ) : (
                    <div className="absolute top-3 right-3 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white shadow-lg shadow-red-900/30">
                      مكتمل
                    </div>
                  )}

                  {seatsLeft > 0 && seatsLeft <= 5 && (
                    <div className="absolute top-3 left-3 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white shadow-lg shadow-red-950/30 animate-pulse">
                      عاجل
                    </div>
                  )}
                </div>

                <div className="flex h-full flex-col p-5 text-right">
                  <div className="mb-4">
                    {/* Fixed: justify-start properly aligns to the right in RTL */}
                    <p className="mb-2 flex items-center justify-start gap-1 text-sm font-semibold text-[#3b82f6]">
                      {associationName}
                      <span className="text-[#10b981]">✓</span>
                    </p>
                    <h2 className="line-clamp-2 text-xl font-black text-white">{event.title}</h2>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#8ea49a]">{event.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs text-[#9eb0a7]">
                    {/* Fixed: items-start pushes elements to the right in RTL */}
                    <div className="rounded-2xl border border-[#22352d] bg-[#0d1613] p-3 flex flex-col items-start">
                      <div className="mb-1 flex items-center gap-1.5"><span className="text-[#10b981]">🕒</span><span>الوقت</span></div>
                      <div className="text-white font-medium text-right" dir="rtl">{event.time || formatDateTime(event.start_date).split(' ')[0]}</div>
                    </div>
                    {/* Fixed: items-start pushes elements to the right in RTL */}
                    <div className="rounded-2xl border border-[#22352d] bg-[#0d1613] p-3 flex flex-col items-start">
                      <div className="mb-1 flex items-center gap-1.5"><span className="text-[#10b981]">📅</span><span>التاريخ</span></div>
                      <div className="text-white font-medium text-right" dir="rtl">{formatDate(event.start_date)}</div>
                    </div>
                    {/* Fixed: items-start pushes elements to the right in RTL */}
                    <div className="col-span-2 rounded-2xl border border-[#22352d] bg-[#0d1613] p-3 flex flex-col items-start">
                      <div className="mb-1 flex items-center gap-1.5"><span className="text-[#10b981]">📍</span><span>الموقع</span></div>
                      <div className="text-white font-medium text-right" dir="rtl">{location}</div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between text-xs text-[#9eb0a7] font-medium">
                      <span>{spotsTaken} / {maxParticipants} محجوز</span>
                      <span className={seatsLeft <= 5 && seatsLeft > 0 ? "text-red-400" : "text-[#10b981]"}>
                        {seatsLeft} مقعد متاح
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[#1c2a24] overflow-hidden">
                      <div className="h-full rounded-full bg-[#10b981] transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  {seatsLeft > 0 ? (
                    <button
                      type="button"
                      onClick={(eventClick) => {
                        eventClick.stopPropagation();
                        setSelectedEvent(event);
                      }}
                      className="group/btn mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f7a59] border border-[#1f6f57] px-4 py-3 font-bold text-white transition-all duration-300 hover:bg-[#10b981] hover:border-[#10b981]"
                    >
                      <span className="transition-transform duration-300 group-hover/btn:-translate-x-1">←</span>
                      احجز مقعدي الآن
                    </button>
                  ) : (
                    <div className="mt-5 w-full rounded-xl border border-[#22352d] bg-[#111a17] px-4 py-3 text-center text-sm font-extrabold text-[#74847c]">
                      اكتمل العدد
                    </div>
                  )}
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
      <Footer />
    </div>
  )
}

export default Events