import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import AssocAbout from "../Components/association-profile/AssocAbout";
import AssocUpcomingEvents from "../Components/association-profile/AssocUpcomingEvents";
import AssocCampaigns from "../Components/association-profile/AssocCampaigns";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { FiGlobe } from "react-icons/fi";
import api from "../api/axios";
import { fieldLabelById } from "../utils/associationOptions";

const LoadingSpinner = () => (
  <div className="max-w-4xl mx-auto px-4 py-20 flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin" />
  </div>
);

const normalizeUrl = (value) => {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const socialPlatforms = [
  {
    key: "facebook",
    label: "Facebook",
    icon: FaFacebookF,
    gradient: "from-blue-950/70 to-blue-900/40",
    border: "border-blue-700/40 hover:border-blue-500/60",
    iconColor: "text-blue-300",
  },
  {
    key: "instagram",
    label: "Instagram",
    icon: FaInstagram,
    gradient: "from-pink-950/70 to-fuchsia-900/30",
    border: "border-pink-700/40 hover:border-pink-500/60",
    iconColor: "text-pink-300",
  },
  {
    key: "twitter",
    label: "X",
    icon: FaXTwitter,
    gradient: "from-slate-900/80 to-gray-800/70",
    border: "border-gray-700/60 hover:border-gray-400/70",
    iconColor: "text-gray-100",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    icon: FaLinkedinIn,
    gradient: "from-sky-950/70 to-blue-900/30",
    border: "border-sky-700/40 hover:border-sky-500/60",
    iconColor: "text-sky-300",
  },
  {
    key: "website",
    label: "Website",
    icon: FiGlobe,
    gradient: "from-emerald-950/70 to-green-900/30",
    border: "border-emerald-700/40 hover:border-emerald-500/60",
    iconColor: "text-emerald-300",
  },
];

/**
 * AssocProfilePage.jsx
 *
 * ROUTE: /associations/:id
 * e.g.  /associations/1  → loads جمعية الأمل الخيرية
 *
 * HOW DATA FLOWS:
 * - useParams() gives you the :id from the URL
 * - In production, fetch association data from:
 *     GET /api/associations/:id
 * - For now, mockAssociation is used as placeholder
 *
 * PAGE SECTIONS (top to bottom):
 *   1. Navbar  (global)
 *   2. AssocHeroBanner  — full-width cover image with back button
 *   3. AssocHeader      — logo, name, stats, follow/donate buttons
 *   4. AssocStatsBar    — 4 KPI numbers (followers, projects, volunteers, years)
 *   5. AssocAbout       — map card (left) + "من نحن" text (right)
 *   6. AssocUpcomingEvents — horizontal scrollable event cards
 *   7. AssocCampaigns   — active donation campaigns grid
 *   8. Footer  (global)
 */

export default function AssocProfilePage() {
  const { id } = useParams();
  const [rawAssociation, setRawAssociation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchAssociation = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await api.get(`/associations/${id}`);
        if (isMounted) setRawAssociation(response.data);
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.error || "تعذر تحميل بيانات الجمعية.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    if (id) fetchAssociation();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const assoc = useMemo(() => {
    if (!rawAssociation) return null;

    const now = Date.now();
    const donationProjects = Array.isArray(rawAssociation?.donationProjects) ? rawAssociation.donationProjects : [];
    const events = Array.isArray(rawAssociation?.events) ? rawAssociation.events : [];
    const description = rawAssociation.description?.trim() || "لا يوجد وصف متاح حالياً.";
    const social = rawAssociation?.social_media_links || {};
    const fields = Array.isArray(rawAssociation.fields) ? rawAssociation.fields : [];
    const fieldTags = fields.length > 0
      ? fields.map((fieldId) => ({ id: fieldId, label: fieldLabelById[fieldId] || fieldId }))
      : [{ id: "general", label: "عام" }];
    const totalRaised = donationProjects.reduce((sum, campaign) => sum + Number(campaign?.current_amount || 0), 0);

    const upcomingEvents = events
      .map((event, index) => {
        const startTime = event.start_date ? new Date(event.start_date).getTime() : null;
        const isUpcoming = typeof startTime === "number" && Number.isFinite(startTime) && startTime >= now;

        return {
          id: event?.id ?? `event-${index}`,
          sortTime: startTime || 0,
          title: event?.title || "فعالية تطوعية",
          description: event?.description || "فعالية تطوعية لخدمة المجتمع المحلي.",
          date: event.start_date ? new Date(event.start_date).toLocaleDateString("ar-DZ") : "غير محدد",
          location: event?.location_wilaya || rawAssociation?.wilaya || "الجزائر",
          category: event?.age_range || "فعالية",
          categoryColor: "bg-blue-600",
          image: event?.image_url || null,
          imageEmoji: "📅",
          badge: isUpcoming ? "قريباً" : "مفتوح",
          badgeColor: isUpcoming ? "bg-yellow-600" : "bg-green-600",
        };
      })
      .sort((a, b) => a.sortTime - b.sortTime);

    const activeCampaigns = donationProjects
      .map((campaign, index) => {
        const goal = Number(campaign?.goal_amount || 0);
        const raised = Number(campaign?.current_amount || 0);
        const progress = goal > 0 ? Math.round((raised / goal) * 100) : 0;
        const maxDate = campaign.max_date ? new Date(campaign.max_date).getTime() : null;
        const daysLeft = maxDate ? Math.max(0, Math.ceil((maxDate - now) / (1000 * 60 * 60 * 24))) : 0;
        const isExpired = maxDate ? maxDate < now : false;
        const canDonate = Boolean(campaign?.canDonate ?? (progress < 100 && !isExpired));

        return {
          id: campaign?.id ?? `campaign-${index}`,
          title: campaign?.title || "حملة تبرع",
          description: campaign?.description || "لا يوجد وصف متاح لهذه الحملة.",
          raised,
          goal,
          donors: Number(campaign?.donations?.length || 0),
          daysLeft,
          category: "تبرعات",
          categoryColor: "bg-green-600",
          image: campaign?.image_url || null,
          imageEmoji: "💚",
          urgent: daysLeft > 0 && daysLeft <= 7,
          completed: progress >= 100,
          canDonate,
          expired: isExpired,
          recentDonors: Array.isArray(campaign?.donations)
            ? [...campaign.donations]
                .sort((left, right) => new Date(right.date || 0) - new Date(left.date || 0))
                .slice(0, 3)
                .map((donation) => ({
                  id: donation?.id,
                  name: donation.anonymous ? "متبرع مجهول" : donation.donor?.full_name || "متبرع",
                  amount: Number(donation.amount || 0),
                  timeAgo: donation.date
                    ? new Intl.DateTimeFormat("ar-DZ", { year: "numeric", month: "short", day: "numeric" }).format(new Date(donation.date))
                    : "حديثاً",
                  avatar: donation.anonymous ? "؟" : (donation.donor?.full_name || "م").charAt(0),
                  anonymous: Boolean(donation.anonymous),
                }))
            : [],
        };
      })
      .sort((a, b) => Number(b?.id || 0) - Number(a?.id || 0));

    const founded = rawAssociation?.createdAt ? new Date(rawAssociation.createdAt).getFullYear() : new Date().getFullYear();
    const yearsActive = Math.max(1, new Date().getFullYear() - founded + 1);
    const volunteersCount = events.reduce((sum, event) => sum + Number(event?.spots_taken || 0), 0);
    const socialLinks = {
      facebook: normalizeUrl(rawAssociation?.facebook || social?.facebook || ""),
      instagram: normalizeUrl(rawAssociation?.instagram || social?.instagram || ""),
      twitter: normalizeUrl(rawAssociation?.twitter || social?.twitter || ""),
      linkedin: normalizeUrl(rawAssociation?.linkedin || social?.linkedin || ""),
      website: normalizeUrl(rawAssociation?.website || social?.website || ""),
    };

    return {
      id: rawAssociation?.id,
      name: rawAssociation?.name || "جمعية",
      description,
      tagline: rawAssociation?.description?.slice(0, 90) || "نعمل لخدمة المجتمع بكل شفافية وتأثير.",
      verified: Boolean(rawAssociation?.user?.is_email_verified),
      category: fieldTags[0]?.label || "جمعية",
      email: rawAssociation?.user?.email || "",
      phone: rawAssociation?.phone_number || "",
      address: rawAssociation?.address || rawAssociation?.wilaya || "الجزائر",
      location: `${rawAssociation?.wilaya || "الجزائر"}، الجزائر`,
      lat: 36.7538,
      lng: 3.0588,
      mapsLink: rawAssociation?.Maps_link || "",
      founded,
      yearsActive,
      coverImage: rawAssociation?.cover_image_url || null,
      logoImage: rawAssociation?.logo_url || null,
      aboutParagraphs: description
        .split(/\n+/)
        .filter(Boolean)
        .map((paragraph, index) => ({ id: `paragraph-${index + 1}`, text: paragraph })),
      tags: fieldTags,
      socialLinks,
      openingHours: rawAssociation?.opening_hours || "غير محدد",
      socialNumber: rawAssociation?.social_number || "غير متوفر",
      agreedToTos: Boolean(rawAssociation?.agreed_to_tos),
      stats: {
        totalCampaigns: donationProjects.length,
        totalEvents: events.length,
        totalVolunteers: volunteersCount,
        totalRaised,
      },
      upcomingEvents,
      activeCampaigns,
    };
  }, [rawAssociation]);

  const association = assoc;

  if (isLoading || (!association && !error)) {
    return (
      <div className="flex justify-center items-center min-h-screen font-arabic bg-gray-950 text-white" dir="rtl">
        {isLoading ? <LoadingSpinner /> : "Loading Profile..."}
      </div>
    );
  }

  return (
    <div className="font-arabic min-h-screen bg-gray-950 text-white" dir="rtl">
      <Navbar />

      {/* Add top padding to account for fixed navbar */}
      <main className="pt-20">
        {error ? (
          <div className="max-w-4xl mx-auto px-4 py-20 text-center text-red-300">{error}</div>
        ) : association ? (
          <>
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="relative overflow-hidden rounded-3xl border border-gray-800 bg-gray-900">
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, rgba(34,197,94,0.25), transparent 40%), radial-gradient(circle at 80% 0%, rgba(14,165,233,0.18), transparent 35%)" }} />
                <div className="h-52 sm:h-60 bg-linear-to-br from-gray-800 via-gray-900 to-green-950">
                  {association.coverImage ? (
                    <img src={association.coverImage} alt={association.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-gray-800 via-gray-900 to-green-950" />
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-gray-950 to-transparent" />
                </div>

                <div className="px-5 sm:px-8 pb-6 sm:pb-8 -mt-12 sm:-mt-14 relative z-10">
                  <div className="flex flex-col sm:flex-row-reverse items-start sm:items-end sm:justify-end gap-4 sm:gap-4">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-gray-950 bg-green-800 overflow-hidden shadow-xl">
                      {association.logoImage ? (
                        <img src={association.logoImage} alt={association.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl font-black text-white">
                          {association.name?.charAt(0) || "ج"}
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="flex items-center justify-end flex-wrap gap-2">
                        {association.verified ? (
                          <span className="inline-flex items-center gap-1 bg-green-900/30 border border-green-700/60 text-green-300 text-xs px-2 py-0.5 rounded-full">
                            ✓ موثق
                          </span>
                        ) : null}
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{association.name}</h1>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-3 text-center">
                  <p className="text-green-400 text-lg font-extrabold">{association.stats.totalCampaigns}</p>
                  <p className="text-gray-400 text-xs">الحملات</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-3 text-center">
                  <p className="text-blue-400 text-lg font-extrabold">{association.stats.totalEvents}</p>
                  <p className="text-gray-400 text-xs">الفعاليات</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-3 text-center">
                  <p className="text-yellow-400 text-lg font-extrabold">{association.stats.totalVolunteers}</p>
                  <p className="text-gray-400 text-xs">المتطوعون</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-3 text-center">
                  <p className="text-emerald-400 text-lg font-extrabold">{Number(association.stats.totalRaised || 0).toLocaleString("ar-DZ")}</p>
                  <p className="text-gray-400 text-xs">إجمالي التبرعات (دج)</p>
                </div>
              </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-5">
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                      <div className="flex flex-row-reverse items-center justify-end gap-2 px-5 py-4 border-b border-gray-800" dir="rtl">
                        <h3 className="text-white font-bold text-base">حالة الحساب</h3>
                      <span className="text-yellow-400">✏️</span>
                    </div>
                    <div className="p-5 text-right space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-gray-500 text-sm">نوع الحساب</span>
                        <span className="text-sm text-gray-200 bg-gray-800 border border-gray-700 px-3 py-1 rounded-full">حساب جمعية</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-gray-500 text-sm">الحالة</span>
                        <span className={`text-sm font-semibold px-3 py-1 rounded-full border ${association.verified ? "text-green-300 bg-green-900/30 border-green-800/50" : "text-yellow-300 bg-yellow-900/30 border-yellow-800/50"}`}>
                          {association.verified ? "✓ موثق" : "قيد التحقق"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-gray-500 text-sm">السجل الاجتماعي</span>
                        <span className="text-sm text-gray-200">{association.socialNumber}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-gray-500 text-sm">ساعات العمل</span>
                        <span className="text-sm text-gray-200">{association.openingHours}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-end gap-2 px-5 py-4 border-b border-gray-800">
                      <h3 className="text-white font-bold text-base">روابط التواصل</h3>
                      <span className="text-blue-400">🔗</span>
                    </div>
                    <div className="p-5 flex flex-wrap gap-2 justify-end">
                      {socialPlatforms.map((platform) => {
                        const href = association.socialLinks?.[platform.key];
                        if (!href) return null;
                        const Icon = platform.icon;

                        return (
                          <a
                            key={platform.key}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`group inline-flex items-center gap-2 rounded-xl border bg-linear-to-r ${platform.gradient} ${platform.border} px-3 py-2 text-sm text-gray-100 transition-all duration-200 hover:-translate-y-0.5`}
                            aria-label={platform.label}
                            title={platform.label}
                          >
                            <Icon className={`${platform.iconColor} text-base`} />
                            <span className="font-medium">{platform.label}</span>
                          </a>
                        );
                      })}
                      {!association.socialLinks.facebook && !association.socialLinks.instagram && !association.socialLinks.twitter && !association.socialLinks.linkedin && !association.socialLinks.website ? (
                        <p className="text-sm text-gray-500">لا توجد روابط مضافة حالياً.</p>
                      ) : null}
                    </div>
                  </div>
                </div>

                  <div className="lg:col-span-2">
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                    <div className="flex flex-row-reverse items-center justify-end gap-2 px-6 py-4 border-b border-gray-800" dir="rtl">
                      <h3 className="text-white font-bold text-base">المعلومات الأساسية</h3>
                      <span className="text-green-400">📋</span>
                    </div>
                    <div className="p-6 text-right space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-gray-500 text-sm">البريد الإلكتروني</p>
                          <p className="text-gray-100 text-base wrap-break-word">{association.email || "غير متوفر"}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-500 text-sm">رقم الهاتف</p>
                          <p className="text-gray-100 text-base">{association.phone || "غير متوفر"}</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-gray-500 text-sm">العنوان</p>
                        <p className="text-gray-100 text-base">{association.address || "غير متوفر"}</p>
                      </div>

                      <div className="flex items-center justify-end gap-3">
                        {association.email ? (
                          <a href={`mailto:${association.email}`} className="inline-flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg text-sm">
                            <span className="text-sm">✉️</span>
                            <span className="font-medium">إرسال بريد</span>
                          </a>
                        ) : null}

                        {association.phone ? (
                          <a href={`tel:${association.phone}`} className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 hover:bg-gray-800/90 text-gray-100 rounded-lg text-sm">
                            <span className="text-sm">📞</span>
                            <span className="font-medium">اتصال</span>
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <AssocAbout
                name={association?.name || ""}
                description={association?.description || ""}
                paragraphs={association?.aboutParagraphs || []}
                address={association?.address || ""}
                phone={association?.phone || ""}
                email={association?.email || ""}
                lat={association?.lat || 36.7538}
                lng={association?.lng || 3.0588}
                mapsLink={association?.mapsLink || ""}
                tags={association?.tags || []}
              />
              <AssocUpcomingEvents events={association?.upcomingEvents || []} />
              <AssocCampaigns campaigns={association?.activeCampaigns || []} />
            </div>
          </>
        ) : (
          <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-300">لا توجد بيانات لعرضها.</div>
        )}
      </main>

      <Footer />
    </div>
  );
}
