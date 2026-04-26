import { useEffect, useMemo, useState } from "react";
import AssocDashboardNavbar from "../Components/dashboard/AssocDashboardNavbar";
import AssocEditCoverHeader from "../Components/association-profile/AssocEditCoverHeader";
import AssocEditBasicInfo from "../Components/association-profile/AssocEditBasicInfo";
import AssocEditSidebar from "../Components/association-profile/AssocEditSidebar";
import AssocEditLocation from "../Components/association-profile/AssocEditLocation";
import DashboardFooter from "../Components/dashboard/DashboardFooter";
import api from "../api/axios";

/**
 * AssocEditProfilePage.jsx
 *
 * ROUTE: /dashboard/association/profile
 *
 * ACCESS: Protected — only logged-in associations can access this.
 * Wrap with <ProtectedRoute role="association"> in App.jsx.
 *
 * WHAT THIS PAGE IS:
 * The association's private edit interface for their public profile.
 * Changes here update what visitors see on /associations/:id.
 *
 * PAGE LAYOUT:
 * ┌─────────────────────────────────────────────────────┐
 * │  AssocDashboardNavbar  (fixed top)                  │
 * ├─────────────────────────────────────────────────────┤
 * │  Page header: title + save/cancel buttons           │
 * ├─────────────────────────────────────────────────────┤
 * │  AssocEditCoverHeader  (cover upload + logo + name) │
 * ├────────────────────────┬────────────────────────────┤
 * │  AssocEditSidebar      │  AssocEditBasicInfo         │
 * │  (left/RTL-right):     │  (right/RTL-left):          │
 * │  - Account status      │  - Basic info fields        │
 * │  - Social links        │  - Contact details          │
 * │                        ├────────────────────────────┤
 * │                        │  AssocEditLocation          │
 * │                        │  - Address input            │
 * │                        │  - Map picker               │
 * └────────────────────────┴────────────────────────────┘
 * │  DashboardFooter                                    │
 * └─────────────────────────────────────────────────────┘
 *
 * FORM STATE:
 * All form fields are controlled via a single `formData` state object.
 * On "حفظ التغييرات" → call PATCH /api/associations/:id with formData.
 * On "إلغاء" → reset to original data or navigate(-1).
 */

const emptyFormData = {
  id: null,
  name: "",
  fullName: "",
  description: "",
  email: "",
  phone: "",
  address: "",
  locationNote: "",
  lat: 36.7538,
  lng: 3.0588,
  facebook: "",
  instagram: "",
  website: "",
  mapLink: "",
  openingHours: "",
  coverImage: null,
  logoImage: null,
  profileCompletion: 0,
  accountStatus: "غير موثق",
  accountType: "حساب جمعية",
};

function calculateProfileCompletion(next) {
  const hasSocialLink = Boolean(
    next.facebook?.trim() || next.instagram?.trim() || next.website?.trim()
  );
  const checks = [
    Boolean(next.logoImage),
    Boolean(next.coverImage),
    Boolean(next.email),
    (next.description || "").length >= 50,
    Boolean(next.address),
    hasSocialLink,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export default function AssocEditProfilePage() {
  const [formData, setFormData] = useState(emptyFormData);
  const [initialFormData, setInitialFormData] = useState(emptyFormData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const hydrate = async () => {
      setLoading(true);
      setError("");

      try {
        const [associationRes, meRes] = await Promise.all([
          api.get("/associations/me"),
          api.get("/auth/me"),
        ]);

        const association = associationRes.data;
        const me = meRes.data;
        const socialLinks = association.social_media_links || {};

        const next = {
          id: association.id,
          name: association.name || "",
          fullName: me.full_name || association.name || "",
          description: association.description || "",
          email: me.email || "",
          phone: me.phone || association.phone_number || "",
          address: association.wilaya || "",
          locationNote: "",
          lat: 36.7538,
          lng: 3.0588,
          facebook: socialLinks.facebook || "",
          instagram: socialLinks.instagram || "",
          website: socialLinks.website || "",
          mapLink: association.Maps_link || "",
          openingHours: association.opening_hours || "",
          coverImage: null,
          logoImage: association.logo_url || null,
          profileCompletion: 0,
          accountStatus: me.is_email_verified ? "موثق" : "غير موثق",
          accountType: "حساب جمعية",
        };

        next.profileCompletion = calculateProfileCompletion(next);

        if (isMounted) {
          setFormData(next);
          setInitialFormData(next);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.error || "تعذر تحميل بيانات الجمعية.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    hydrate();

    return () => {
      isMounted = false;
    };
  }, []);

  // Generic field updater — used by all child components via prop
  const updateField = (field, value) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      next.profileCompletion = calculateProfileCompletion(next);
      return next;
    });
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      const social_media_links = {};
      if (formData.facebook?.trim()) social_media_links.facebook = formData.facebook.trim();
      if (formData.instagram?.trim()) social_media_links.instagram = formData.instagram.trim();
      if (formData.website?.trim()) social_media_links.website = formData.website.trim();

      await api.put(`/associations/${formData.id}`, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        logo_url: formData.logoImage || undefined,
        wilaya: formData.address.trim(),
        Maps_link: formData.mapLink?.trim() || undefined,
        phone_number: formData.phone.trim(),
        opening_hours: formData.openingHours?.trim() || undefined,
        social_media_links: Object.keys(social_media_links).length ? social_media_links : undefined,
      });

      await api.patch("/auth/me/profile", {
        full_name: formData.fullName.trim(),
        phone: formData.phone.trim(),
      });

      setInitialFormData(formData);
      setSaved(true);
    } catch (err) {
      const details = err?.response?.data?.details;
      const firstDetail = Array.isArray(details) && details.length ? details[0]?.message : "";
      setError(firstDetail || err?.response?.data?.error || "تعذر حفظ التغييرات.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    setSaved(false);
    setError("");
  };

  const pageContent = useMemo(() => {
    if (loading) {
      return <div className="max-w-6xl mx-auto px-4 py-14 text-center text-gray-300">جارٍ تحميل بيانات الملف...</div>;
    }

    if (error && !formData.id) {
      return <div className="max-w-6xl mx-auto px-4 py-14 text-center text-red-300">{error}</div>;
    }

    return (
      <>
        <AssocEditCoverHeader formData={formData} updateField={updateField} />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <div className="lg:col-span-1 lg:order-2 space-y-5">
              <AssocEditSidebar formData={formData} updateField={updateField} />
            </div>

            <div className="lg:col-span-2 lg:order-1 space-y-5">
              <AssocEditBasicInfo formData={formData} updateField={updateField} />
              <AssocEditLocation formData={formData} updateField={updateField} />
            </div>

          </div>
        </div>
      </>
    );
  }, [error, formData, loading]);

  return (
    <div className="font-arabic min-h-screen bg-gray-950 text-white" dir="rtl">
      <AssocDashboardNavbar />

      <main className="pt-14">
        {/* ── Page Header ── */}
        <div className="bg-gray-950 border-b border-gray-800/60 sticky top-14 z-40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between gap-4">
              {/* Title block */}
              <div className="flex items-center gap-3">
                {/* Save / Cancel buttons */}
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 rounded-xl transition-all duration-200"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || loading || !formData.id}
                  className={`px-5 py-2 text-sm font-bold rounded-xl transition-all duration-200 flex items-center gap-2 ${
                    saved
                      ? "bg-green-700 text-white border border-green-600"
                      : "bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/40"
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  {saving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : saved ? (
                    "✓ تم الحفظ"
                  ) : (
                    "حفظ التغييرات"
                  )}
                </button>
              </div>

              {/* Title right side */}
              <div className="text-right">
                <h1 className="text-lg sm:text-xl font-extrabold text-white">
                  إدارة ملف الجمعية
                </h1>
                <p className="text-gray-400 text-xs mt-0.5">
                  قم بتحديث معلومات ملفك الشخصي العام والصورة والموقع الجغرافي
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && formData.id ? (
          <div className="max-w-6xl mx-auto px-4 pt-4 text-right text-red-300 text-sm">{error}</div>
        ) : null}

        {pageContent}
      </main>

      <DashboardFooter />
    </div>
  );
}
