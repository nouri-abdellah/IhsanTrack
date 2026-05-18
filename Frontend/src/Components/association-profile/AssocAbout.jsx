/**
 * AssocAbout.jsx
 *
 * USED ON: AssocProfilePage only
 *
 * CONTAINS:
 * Two-column layout:
 *
 * LEFT COLUMN (RTL = right visually):
 *   - "من نحن" section heading
 *   - 3 paragraphs of association description text
 *
 * RIGHT COLUMN (RTL = left visually):
 *   - Map card showing the association's location
 *   - Uses an embedded OpenStreetMap iframe (free, no API key needed)
 *   - Association location label below the map
 *   - "عرض الخريطة" link to open full Google Maps
 *
 * Props: assoc (association object)
 *
 * MAP INTEGRATION:
 * The iframe uses OpenStreetMap with the association's lat/lng coordinates.
 * If you want Google Maps: replace the iframe src with:
 *   https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed
 * (Google Maps embed requires API key in production)
 */
export default function AssocAbout({
  name,
  description,
  paragraphs,
  address,
  phone,
  email,
  lat,
  lng,
  mapsLink,
  tags,
}) {
  const safeLat = Number.isFinite(Number(lat)) ? Number(lat) : 36.7538;
  const safeLng = Number.isFinite(Number(lng)) ? Number(lng) : 3.0588;
  const safeTags = Array.isArray(tags) ? tags : [];
  const safeParagraphs = Array.isArray(paragraphs) && paragraphs.length > 0
    ? paragraphs
    : [{ id: "paragraph-1", text: description || "لا يوجد وصف متاح حالياً." }];
  const safeMapLink = mapsLink || `https://www.google.com/maps?q=${safeLat},${safeLng}`;
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${safeLng - 0.05}%2C${safeLat - 0.05}%2C${safeLng + 0.05}%2C${safeLat + 0.05}&layer=mapnik&marker=${safeLat}%2C${safeLng}`;

  return (
    <div>
      {/* Section label */}
      <div className="flex flex-row-reverse items-center justify-end gap-2 mb-6" dir="rtl">
        <h2 className="text-xl font-extrabold text-white">من نحن</h2>
        <div className="w-1 h-6 bg-green-500 rounded-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* RIGHT COLUMN (RTL): Map card — takes 1/3 width */}
        <div className="lg:order-2 order-1">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">

            {/* Map iframe */}
            <div className="relative h-44 bg-gray-800 overflow-hidden">
              <iframe
                src={mapSrc}
                title={`خريطة ${name || "الجمعية"}`}
                width="100%"
                height="100%"
                className="border-0 w-full h-full grayscale brightness-75 hover:grayscale-0 hover:brightness-100 transition-all duration-500"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              {/* Overlay label */}
              <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-gray-900/80 to-transparent h-10 pointer-events-none" />
            </div>

            {/* Location info */}
            <div className="p-4 text-right">
              <div className="flex items-center justify-between">
                <a
                  href={safeMapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300 text-xs font-medium transition-colors"
                >
                  عرض الخريطة ↗
                </a>
                <div className="text-right">
                  <p className="text-white text-sm font-semibold flex items-center gap-1 justify-end">
                    <span>📍</span> {address || "الجزائر"}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Quick contact card */}
          <div className="mt-3 bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-right space-y-2">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">تواصل معنا</p>
            <p className="text-xs text-gray-300 wrap-break-word">📧 {email || "غير متوفر"}</p>
            <p className="text-xs text-gray-300 wrap-break-word">📞 {phone || "غير متوفر"}</p>
            <p className="text-xs text-gray-300 wrap-break-word">📍 {address || "غير متوفر"}</p>
          </div>
        </div>

        {/* LEFT COLUMN (RTL): About text — takes 2/3 width */}
        <div className="lg:col-span-2 lg:order-1 order-2 space-y-4 text-right">
          {safeParagraphs.map((paragraph) => (
            <p key={paragraph.id} className="text-gray-300 text-sm sm:text-base leading-relaxed whitespace-pre-wrap wrap-break-word">
              {paragraph?.text || ""}
            </p>
          ))}

          {/* Association fields */}
          <div className="pt-3" dir="rtl">
            <div className="flex flex-row-reverse items-center justify-end gap-2 mb-4">
              <h3 className="text-base sm:text-lg font-extrabold text-white">مجالات عمل الجمعية</h3>
              <div className="w-1 h-5 bg-green-500 rounded-full" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {safeTags.length > 0 ? safeTags.map((tag, index) => (
                <div
                  key={tag.id}
                  className="rounded-2xl border border-gray-700/80 bg-linear-to-r from-gray-900/95 to-gray-800/85 px-4 py-4 text-right shadow-lg shadow-black/20"
                >
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-green-800/50 bg-green-900/20 mb-2">
                    <span className="text-[11px] text-green-300 font-bold">مجال {index + 1}</span>
                  </div>
                  <p className="text-base sm:text-lg font-semibold text-gray-100 leading-snug wrap-break-word">
                    {tag.label}
                  </p>
                </div>
              )) : (
                <div className="rounded-2xl border border-gray-700/80 bg-gray-900/80 px-4 py-4 text-right text-gray-400">
                  لا توجد مجالات مضافة حالياً.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
