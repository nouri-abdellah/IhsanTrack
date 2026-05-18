/**
 * AssocEditLocation.jsx
 *
 * USED ON: AssocEditProfilePage only (below AssocEditBasicInfo in main column)
 *
 * CONTAINS:
 * Card: "الموقع الجغرافي"
 *   - العنوان* → text input (street address)
 *   - تحديد الموقع → text input (landmark / additional detail)
 *   - Embedded OpenStreetMap iframe showing current lat/lng
 *   - "تحديث الموقع على الخريطة" button → simulates geocoding
 *   - Lat/Lng display (read-only, updated by geocoding in prod)
 *
 * MAP:
 * Uses OpenStreetMap embed (free, no API key).
 * In production, integrate a geocoding API (e.g. Nominatim or Google Geocoding)
 * to convert address text to coordinates when user clicks "تحديث الموقع".
 *
 * CLICK-TO-PLACE (advanced):
 * For click-to-place on map, replace the iframe with Leaflet.js:
 *   npm install react-leaflet leaflet
 *   Use <MapContainer> + <Marker draggable> to let user drag the pin
 *
 * Props:
 *   formData    — current form state
 *   updateField — (field, value) => void
 */
import { useState } from "react";
import { ASSOCIATION_LOCATIONS } from "../../utils/associationOptions";

export default function AssocEditLocation({ formData, updateField }) {
  const [locating, setLocating] = useState(false);
  const [locateMsg, setLocateMsg] = useState("");

  // Simulate geocoding — in production call Nominatim or Google Geocoding API
  const handleLocate = async () => {
    if (!formData.address) return;
    setLocating(true);
    setLocateMsg("");
    await new Promise((r) => setTimeout(r, 1200));
    setLocating(false);
    setLocateMsg("✓ تم تحديث الموقع على الخريطة");
  };

  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${formData.lng - 0.05}%2C${formData.lat - 0.05}%2C${formData.lng + 0.05}%2C${formData.lat + 0.05}&layer=mapnik&marker=${formData.lat}%2C${formData.lng}`;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">

      {/* Card header */}
      <div className="flex items-center justify-end gap-2 px-6 py-4 border-b border-gray-800">
        <h3 className="text-white font-bold text-base">الموقع الجغرافي</h3>
        <span className="text-green-400 text-lg">📍</span>
      </div>

      <div className="p-6 space-y-5">

        {/* المدينة / الولاية */}
        <div className="space-y-1.5 text-right">
          <label className="block text-sm font-semibold text-gray-200">
            المدينة / الولاية<span className="text-green-400 mr-1">*</span>
          </label>
          <select
            value={formData.address}
            onChange={(e) => updateField("address", e.target.value)}
            className={inputCls}
            dir="rtl"
          >
            <option value="">اختر المدينة</option>
            {ASSOCIATION_LOCATIONS.map((location) => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
        </div>

        {/* تحديد الموقع */}
        <div className="space-y-1.5 text-right">
          <label className="block text-sm font-semibold text-gray-200">
            تحديد الموقع
          </label>
          <input
            type="text"
            value={formData.locationNote}
            onChange={(e) => updateField("locationNote", e.target.value)}
            placeholder="قريب من... معلم بارز للمساعدة في التوجيه"
            className={inputCls}
            dir="rtl"
          />
          <p className="text-gray-500 text-xs">
            قم بتحديد الموقع بدقة أكبر، اختر الموقع على الخريطة أو أدخل الإحداثيات
          </p>
        </div>

        {/* Update location button */}
        <div className="flex items-center justify-end gap-3">
          {locateMsg && (
            <span className="text-green-400 text-xs">{locateMsg}</span>
          )}
          <button
            onClick={handleLocate}
            disabled={locating || !formData.address}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-green-600/20 hover:bg-green-600/40 border border-green-700/50 hover:border-green-600 text-green-300 hover:text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {locating ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" />
                جاري التحديث...
              </>
            ) : (
              <>
                <span>🗺️</span>
                تحديث الموقع على الخريطة
              </>
            )}
          </button>
        </div>

        {/* Map embed */}
        <div className="rounded-xl overflow-hidden border border-gray-700 shadow-lg">
          <iframe
            src={mapSrc}
            title="موقع الجمعية"
            width="100%"
            height="260"
            className="border-0 w-full block"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            style={{ filter: "saturate(0.7) brightness(0.85)" }}
          />
        </div>

        {/* Coordinates display */}
        <div className="flex items-center justify-end gap-4 text-xs text-gray-500">
          <span>خط الطول: {formData.lng.toFixed(6)}</span>
          <span>خط العرض: {formData.lat.toFixed(6)}</span>
          <span className="text-gray-600">الإحداثيات</span>
        </div>

      </div>
    </div>
  );
}

const inputCls =
  "w-full bg-gray-800 border border-gray-700 hover:border-gray-600 focus:border-green-500 focus:ring-1 focus:ring-green-500/30 text-white placeholder-gray-500 text-sm rounded-xl px-4 py-2.5 outline-none transition-all duration-200";
