import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../Components/Navbar";
import api from "../api/axios";

const Associations = () => {
  const [associations, setAssociations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

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

  // Filter associations by search
  const filtered = associations.filter((a) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      a.name?.toLowerCase().includes(q) ||
      a.description?.toLowerCase().includes(q) ||
      a.wilaya?.toLowerCase().includes(q) ||
      a.phone_number?.toLowerCase().includes(q) ||
      a.user?.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white font-arabic" dir="rtl">
      <Navbar />

      <section className="max-w-6xl mx-auto px-4 py-8" dir="rtl">
        <div className="mb-6 text-right">
          <h1 className="text-3xl font-bold">الجمعيات</h1>
          <p className="text-gray-400 mt-2">العدد الفعلي للجمعيات المسجلة: {associations.length}</p>
          <p className="text-gray-500 text-xs mt-1">المقاس المثالي لصورة الجمعية داخل البطاقة: 320x320 بكسل (مربع).</p>
        </div>

        {/* Search bar */}
        <div className="mb-8 flex justify-end">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث عن جمعية..."
            className="w-full md:w-1/2 lg:w-1/3 px-4 py-2 rounded-xl border border-gray-700 bg-gray-900 text-white focus:outline-none focus:border-green-500 transition-all text-right placeholder:text-gray-400"
            dir="rtl"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin" />
          </div>
        ) : null}

        {error ? <p className="text-red-400 text-right">{error}</p> : null}

        {!loading && !error && filtered.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center text-gray-400">
            لا توجد جمعيات مطابقة لبحثك.
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((association) => (
            <Link
              key={association.id}
              to={`/associations/${association.id}`}
              className="group block bg-gray-900 border border-gray-800 rounded-2xl p-5 text-right transition-all duration-300 hover:-translate-y-1 hover:border-green-700/60 hover:shadow-xl hover:shadow-green-950/20"
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <span className={`text-xs px-2 py-1 rounded-full border ${association.user?.is_email_verified ? "text-green-300 border-green-800 bg-green-900/20" : "text-yellow-300 border-yellow-800 bg-yellow-900/20"}`}>
                  {association.user?.is_email_verified ? "موثقة" : "غير موثقة"}
                </span>
                <div className="flex items-center gap-3 min-w-0">
                  <h2 className="font-bold text-lg truncate">{association.name}</h2>
                  <div className="w-14 h-14 rounded-xl overflow-hidden border border-gray-700 bg-gray-800 shrink-0 flex items-center justify-center">
                    {association.logo_url ? (
                      <img src={association.logo_url} alt={association.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg text-gray-400">🏛️</span>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-gray-300 text-sm line-clamp-3">{association.description}</p>
              <div className="mt-4 space-y-1 text-sm text-gray-400">
                <p>الولاية: {association.wilaya}</p>
                <p>الهاتف: {association.phone_number}</p>
                <p>البريد: {association.user?.email || "غير متوفر"}</p>
              </div>
              <div className="mt-4 inline-flex items-center gap-2 text-xs text-green-300 group-hover:text-green-200">
                <span>عرض الملف</span>
                <span>←</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Associations;