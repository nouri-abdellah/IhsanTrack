import { useRef } from "react";
import { fileToDataUrl } from "../../utils/fileToDataUrl";

/**
 * AssocEditCoverHeader.jsx
 *
 * USED ON: AssocEditProfilePage only
 *
 * CONTAINS:
 * - Cover image upload area (full width, ~180px tall)
 *   → Click anywhere on cover to trigger file input
 *   → Shows upload hint overlay on hover
 *   → Previews selected image immediately via FileReader
 * - Logo upload circle (overlaps cover, bottom center-right)
 *   → Click to upload logo image
 *   → Shows association initial as placeholder
 * - Association name + location displayed below logo (read-only preview)
 *   (the actual editable fields are in AssocEditBasicInfo)
 *
 * Props:
 *   formData    — current form state
 *   updateField — (field, value) => void  to update parent state
 */
export default function AssocEditCoverHeader({ formData, updateField }) {
  const coverInputRef = useRef(null);
  const logoInputRef = useRef(null);

  const handleCoverChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    updateField("coverImage", dataUrl);
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    updateField("logoImage", dataUrl);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      <div className="relative">

        {/* ── Cover image upload area ── */}
        <div
          className="relative w-full h-44 sm:h-52 rounded-2xl overflow-hidden cursor-pointer group bg-gray-800 border-2 border-dashed border-gray-700 hover:border-green-600 transition-all duration-300"
          onClick={() => coverInputRef.current?.click()}
          role="button"
          aria-label="رفع صورة الغلاف"
        >
          {/* Cover preview or placeholder */}
          {formData.coverImage ? (
            <img
              src={formData.coverImage}
              alt="غلاف الجمعية"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-linear-to-br from-gray-800 to-gray-900">
              {/* Placeholder heart image vibe */}
              <span className="text-6xl opacity-20 select-none">❤️</span>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-xl">📷</span>
            </div>
            <span className="text-white text-sm font-semibold">تغيير صورة الغلاف</span>
            <span className="text-gray-300 text-xs">PNG, JPG حتى 5MB</span>
          </div>
        </div>

        {/* Hidden cover file input */}
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleCoverChange}
        />

        {/* ── Logo circle (overlaps cover bottom) ── */}
        <div className="absolute bottom-0 translate-y-1/2 right-6">
          <div
            className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-gray-950 bg-green-800 shadow-xl overflow-hidden cursor-pointer group"
            onClick={() => logoInputRef.current?.click()}
            role="button"
            aria-label="رفع شعار الجمعية"
          >
            {formData.logoImage ? (
              <img
                src={formData.logoImage}
                alt="شعار الجمعية"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-green-700 to-green-900">
                <span className="text-white text-2xl font-black select-none">
                  {formData.name?.charAt(0) || "ج"}
                </span>
              </div>
            )}
            {/* Logo hover overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <span className="text-lg">✏️</span>
            </div>
          </div>

          {/* Edit badge */}
          <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-green-600 rounded-full border-2 border-gray-950 flex items-center justify-center pointer-events-none">
            <span className="text-white text-xs">✏️</span>
          </div>
        </div>

        {/* Hidden logo file input */}
        <input
          ref={logoInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleLogoChange}
        />

      </div>

      {/* ── Association name preview (below cover) ── */}
      <div className="pt-14 pb-2 text-right">
        <h2 className="text-lg font-extrabold text-white">{formData.name || "اسم الجمعية"}</h2>
        <p className="text-gray-400 text-sm">
          {formData.address ? formData.address.split("،")[0] : "الموقع الجغرافي"}
        </p>
      </div>

    </div>
  );
}
