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
export default function AssocAbout({ assoc }) {
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${assoc.lng - 0.05}%2C${assoc.lat - 0.05}%2C${assoc.lng + 0.05}%2C${assoc.lat + 0.05}&layer=mapnik&marker=${assoc.lat}%2C${assoc.lng}`;
  const mapsLink = `https://www.google.com/maps?q=${assoc.lat},${assoc.lng}`;

  return (
    <div>
      {/* Section label */}
      <div className="flex items-center justify-end gap-2 mb-6">
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
                title={`خريطة ${assoc.name}`}
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
                  href={mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300 text-xs font-medium transition-colors"
                >
                  ← عرض الخريطة
                </a>
                <div className="text-right">
                  <p className="text-white text-sm font-semibold flex items-center gap-1 justify-end">
                    <span>📍</span> {assoc.location}
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {assoc.lat.toFixed(4)}°N, {Math.abs(assoc.lng).toFixed(4)}°W
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Quick contact card */}
          <div className="mt-3 bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-right space-y-2">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">تواصل معنا</p>
            {assoc.socialLinks?.facebook && (
              <a
                href={assoc.socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-end gap-2 text-xs text-gray-400 hover:text-green-400 transition-colors"
              >
                <span>Facebook</span>
                <span>f</span>
              </a>
            )}
            {assoc.socialLinks?.instagram && (
              <a
                href={assoc.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-end gap-2 text-xs text-gray-400 hover:text-green-400 transition-colors"
              >
                <span>Instagram</span>
                <span>📷</span>
              </a>
            )}
            {assoc.socialLinks?.website && (
              <a
                href={assoc.socialLinks.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-end gap-2 text-xs text-gray-400 hover:text-green-400 transition-colors"
              >
                <span>{assoc.socialLinks.website.replace("https://", "")}</span>
                <span>🌐</span>
              </a>
            )}
            {!assoc.socialLinks?.facebook && !assoc.socialLinks?.instagram && !assoc.socialLinks?.website && (
              <p className="text-xs text-gray-500">لا توجد روابط اجتماعية مضافة حالياً.</p>
            )}
          </div>
        </div>

        {/* LEFT COLUMN (RTL): About text — takes 2/3 width */}
        <div className="lg:col-span-2 lg:order-1 order-2 space-y-4 text-right">
          {assoc.about.map((paragraph, i) => (
            <p key={i} className="text-gray-300 text-sm sm:text-base leading-relaxed">
              {paragraph}
            </p>
          ))}

          {/* Tags */}
          <div className="flex flex-wrap gap-2 justify-end pt-2">
            <span className="text-gray-500 text-xs self-center">مجالات العمل:</span>
            {assoc.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs text-green-300 bg-green-900/30 border border-green-800/40 px-3 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
