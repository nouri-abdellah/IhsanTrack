import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiChevronDown, FiSearch } from "react-icons/fi";
import Navbar from "../Components/Navbar";
import Footer from '../Components/Footer';
import api from "../api/axios";
import { ASSOCIATION_FIELDS, ASSOCIATION_LOCATIONS, fieldLabelById } from "../utils/associationOptions";

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-24">
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#10b981]/20 border-t-[#10b981]" />
  </div>
);

const activityOptions = [
  { id: "all", label: "كل المجالات" },
  ...ASSOCIATION_FIELDS,
];

export default function Associations() {
  const [associations, setAssociations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("all");
  const [activity, setActivity] = useState("all");

  useEffect(() => {
    let ignore = false;

    const loadAssociations = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/associations");
        if (ignore) return;
        setAssociations(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        if (!ignore) {
          setError(err?.response?.data?.error || "تعذر تحميل بيانات الجمعيات.");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadAssociations();

    return () => {
      ignore = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    
    return (associations || []).filter((association) => {
      const name = association?.name || "";
      const description = association?.description || "";
      const wilaya = association?.wilaya || "";
      const email = association?.user?.email || "";
      const social = JSON.stringify(association?.social_media_links || {}).toLowerCase();
      
      const matchesSearch = !q || [name, description, wilaya, email, social].some((field) => field.toLowerCase().includes(q));
      const matchesCity = city === "all" || wilaya === city;
      
      const descriptionText = `${name} ${description} ${wilaya}`.toLowerCase();
      
      // Check if it matches by the explicit fields array OR by text inference
      const matchesActivity = activity === "all" || 
        (Array.isArray(association?.fields) && association.fields.includes(activity)) ||
        descriptionText.includes((fieldLabelById[activity] || "").toLowerCase());

      return matchesSearch && matchesCity && matchesActivity;
    });
  }, [associations, city, search, activity]);

  return (
    <div className="min-h-screen bg-[#0b1411] text-white font-arabic" dir="rtl">
      <Navbar />

      <section className="mx-auto max-w-7xl px-4 pb-10 pt-20 sm:px-6 lg:px-8">
        
        {/* Modern Horizontal Filter Bar */}
        <div className="mb-8 rounded-3xl border border-[#21362f] bg-[#111a17] p-5 sm:p-7 shadow-xl shadow-black/20">
          <div className="mb-6 text-right">
            <h1 className="text-3xl font-black text-white sm:text-4xl">دليل الجمعيات</h1>
            <p className="mt-2 text-sm text-[#8da399]">
              استعرض الجمعيات، ابحث بالمدينة أو مجال النشاط، وافتح الملف الكامل لكل جمعية.
            </p>
          </div>

          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col gap-3 xl:flex-1 xl:flex-row xl:items-center">
              
              {/* Search Bar */}
              <label className="flex items-center gap-3 rounded-2xl border border-[#2d463d] bg-[#0d1613] px-4 py-3 text-sm xl:min-w-65 xl:max-w-80 xl:flex-1 transition-colors focus-within:border-[#10b981]">
                <FiSearch className="text-[#7f948b]" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="ابحث عن جمعية..."
                  className="w-full bg-transparent text-white outline-none placeholder:text-[#6f837a]"
                />
              </label>

              {/* Activity Field Dropdown (Using Shared Options) */}
              <div className="relative shrink-0">
                <select
                  value={activity}
                  onChange={(event) => setActivity(event.target.value)}
                  className="w-full appearance-none rounded-2xl border border-[#2d463d] bg-[#0d1613] px-4 py-3 pr-10 text-sm text-white outline-none transition-colors hover:border-[#10b981]/50 xl:w-52"
                >
                  {activityOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8ca197]" />
              </div>

              {/* City Dropdown Filter (Using Shared Locations) */}
              <div className="relative shrink-0">
                <select
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  className="w-full appearance-none rounded-2xl border border-[#2d463d] bg-[#0d1613] px-4 py-3 pr-10 text-sm text-white outline-none transition-colors hover:border-[#10b981]/50 xl:w-52"
                >
                  <option value="all">كل المدن</option>
                  {ASSOCIATION_LOCATIONS.map((wilaya) => (
                    <option key={wilaya} value={wilaya}>
                      {wilaya}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8ca197]" />
              </div>

            </div>
          </div>
        </div>

        {loading ? <LoadingSpinner /> : null}
        {error ? <p className="mt-6 text-right text-red-400">{error}</p> : null}

        {!loading && !error && filtered.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-[#22352d] bg-[#111a17] p-10 text-center text-[#9eb0a7]">
            لا توجد جمعيات مطابقة للبحث أو الفلاتر الحالية.
          </div>
        ) : null}

        {/* Associations Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((association) => {
            const categories = getCategories(association);
            const lastActive = formatRelativeTime(association?.updatedAt || association?.createdAt);
            
            return (
              <Link
                key={association?.id}
                to={`/associations/${association?.id}`}
                className="group overflow-hidden rounded-2xl border border-[#243a32] bg-[#111a17] transition-all duration-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:-translate-y-1"
              >
                {/* Header Image */}
                <div className="relative h-45 overflow-hidden bg-linear-to-br from-[#0f3d32] via-[#145647] to-[#1e6b59]">
                  {association?.cover_image_url ? (
                    <img
                      src={association.cover_image_url}
                      alt={association?.name || 'Association'}
                      className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
                </div>

                <div className="p-5 text-right">
                  {/* Title and Logo Row */}
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-[#d7e1dc]">{association?.wilaya || 'ولاية غير محددة'}</span>

                    <div className="h-8 w-8 overflow-hidden rounded-full border border-[#2f4b40] bg-[#0f1714]">
                      {association?.logo_url ? (
                        <img src={association.logo_url} alt="Logo" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-bold text-[#10b981]">
                          {(association?.name || 'ج').charAt(0)}
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="line-clamp-2 text-lg font-black text-white">{association?.name || 'جمعية'}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#8ea49a]">
                    {association?.description || 'لا يوجد وصف متاح حالياً.'}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <span
                        key={category}
                        className="rounded-full bg-[#123229] px-3 py-1 text-xs font-medium text-[#a8dbc8]"
                      >
                        {category}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-[#1f2b26] pt-4 text-xs font-semibold text-[#8ca095]">
                    <span className="text-[#10b981] transition-colors group-hover:text-emerald-400">
                      عرض الملف الشخصي ←
                    </span>
                    <span>آخر نشاط: {lastActive}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
      <Footer />
    </div>
  );
}

// Dynamically generate category tags based on the explicit fields selected during sign up
function getCategories(association) {
  // If the backend has an array of field IDs, use the shared mapping utility to extract Labels
  if (Array.isArray(association?.fields) && association.fields.length > 0) {
    return association.fields.map(id => fieldLabelById[id] || id);
  }

  // Fallback: Infer categories from text description if fields are empty
  const text = `${association?.name || ''} ${association?.description || ''}`.toLowerCase();
  const categories = [];
  if (text.includes('تعليم')) categories.push('تعليم');
  if (text.includes('إغاثة') || text.includes('اغاثة')) categories.push('إغاثة عاجلة');
  if (text.includes('صحة') || text.includes('طب')) categories.push('صحة');
  if (text.includes('غذاء') || text.includes('food')) categories.push('سلال غذائية');
  if (text.includes('اجتماعي')) categories.push('تنمية مجتمعية');
  if (text.includes('أيتام') || text.includes('يتيم')) categories.push('رعاية الأيتام');
  
  return categories.length > 0 ? categories : ['عام'];
}

function formatRelativeTime(value) {
  if (!value) return 'غير محدد';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'غير محدد';

  const diff = Date.now() - date.getTime();
  const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  if (days <= 1) return 'اليوم';
  if (days < 7) return `منذ ${days} أيام`;
  if (days < 30) return `منذ ${Math.floor(days / 7)} أسابيع`;
  return `منذ ${Math.floor(days / 30)} أشهر`;
}