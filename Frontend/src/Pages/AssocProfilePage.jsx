import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import AssocHeroBanner from "../Components/association-profile/AssocHeroBanner";
import AssocHeader from "../Components/association-profile/AssocHeader";
import AssocStatsBar from "../Components/association-profile/AssocStatsBar";
import AssocAbout from "../Components/association-profile/AssocAbout";
import AssocUpcomingEvents from "../Components/association-profile/AssocUpcomingEvents";
import AssocCampaigns from "../Components/association-profile/AssocCampaigns";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchAssociation = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get(`/associations/${id}`);
        if (isMounted) setRawAssociation(response.data);
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.error || "تعذر تحميل بيانات الجمعية.");
        }
      } finally {
        if (isMounted) setLoading(false);
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
    const donationProjects = Array.isArray(rawAssociation.donationProjects) ? rawAssociation.donationProjects : [];
    const events = Array.isArray(rawAssociation.events) ? rawAssociation.events : [];
    const description = rawAssociation.description?.trim() || "لا يوجد وصف متاح حالياً.";

    const upcomingEvents = events
      .map((event) => {
        const startTime = event.start_date ? new Date(event.start_date).getTime() : null;
        const isUpcoming = typeof startTime === "number" && Number.isFinite(startTime) && startTime >= now;

        return {
          id: event.id,
          sortTime: startTime || 0,
          title: event.title,
          description: event.description || "فعالية تطوعية لخدمة المجتمع المحلي.",
          date: event.start_date ? new Date(event.start_date).toLocaleDateString("ar-DZ") : "غير محدد",
          location: event.location_wilaya || rawAssociation.wilaya || "الجزائر",
          category: event.age_range || "فعالية",
          categoryColor: "bg-blue-600",
          image: event.image_url || null,
          imageEmoji: "📅",
          badge: isUpcoming ? "قريباً" : "مفتوح",
          badgeColor: isUpcoming ? "bg-yellow-600" : "bg-green-600",
        };
      })
      .sort((a, b) => a.sortTime - b.sortTime)
      .map(({ sortTime, ...event }) => event);

    const activeCampaigns = donationProjects
      .map((campaign) => {
        const goal = Number(campaign.goal_amount || 0);
        const raised = Number(campaign.current_amount || 0);
        const progress = goal > 0 ? Math.round((raised / goal) * 100) : 0;
        const maxDate = campaign.max_date ? new Date(campaign.max_date).getTime() : null;
        const daysLeft = maxDate ? Math.max(0, Math.ceil((maxDate - now) / (1000 * 60 * 60 * 24))) : 0;

        return {
          id: campaign.id,
          title: campaign.title,
          description: campaign.description,
          raised,
          goal,
          donors: Number(campaign.donations?.length || 0),
          daysLeft,
          category: "تبرعات",
          categoryColor: "bg-green-600",
          image: campaign.image_url || null,
          imageEmoji: "💚",
          urgent: daysLeft > 0 && daysLeft <= 7,
          completed: progress >= 100,
          recentDonors: Array.isArray(campaign.donations)
            ? [...campaign.donations]
                .sort((left, right) => new Date(right.date || 0) - new Date(left.date || 0))
                .slice(0, 3)
                .map((donation) => ({
                  id: donation.id,
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
      .sort((a, b) => b.id - a.id);

    const founded = rawAssociation.createdAt ? new Date(rawAssociation.createdAt).getFullYear() : new Date().getFullYear();
    const yearsActive = Math.max(1, new Date().getFullYear() - founded + 1);
    const volunteersCount = events.reduce((sum, event) => sum + Number(event.spots_taken || 0), 0);

    return {
      id: rawAssociation.id,
      name: rawAssociation.name || "جمعية",
      tagline: rawAssociation.description?.slice(0, 90) || "نعمل لخدمة المجتمع بكل شفافية وتأثير.",
      verified: Boolean(rawAssociation.user?.is_email_verified),
      category: "جمعية",
      location: `${rawAssociation.wilaya || "الجزائر"}، الجزائر`,
      lat: 36.7538,
      lng: 3.0588,
      founded,
      yearsActive,
      followers: `${(rawAssociation.id || 1) * 3}K`,
      projects: donationProjects.length,
      volunteers: `${volunteersCount}+`,
      coverImage: rawAssociation.cover_image_url || null,
      logoImage: rawAssociation.logo_url || null,
      about: description.split(/\n+/).filter(Boolean),
      tags: ["إغاثة", "تعليم", "دعم اجتماعي"],
      socialLinks: {
        facebook: rawAssociation.social_media_links?.facebook || "",
        instagram: rawAssociation.social_media_links?.instagram || "",
        website: rawAssociation.social_media_links?.website || "",
      },
      upcomingEvents,
      activeCampaigns,
    };
  }, [rawAssociation]);

  return (
    <div className="font-arabic min-h-screen bg-gray-950 text-white" dir="rtl">
      <Navbar />

      {/* Add top padding to account for fixed navbar */}
      <main className="pt-20">
        {loading ? (
          <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-300">جارٍ تحميل بيانات الجمعية...</div>
        ) : error ? (
          <div className="max-w-4xl mx-auto px-4 py-20 text-center text-red-300">{error}</div>
        ) : assoc ? (
          <>
            <AssocHeroBanner assoc={assoc} />
            <AssocHeader assoc={assoc} />
            <AssocStatsBar assoc={assoc} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">
              <AssocAbout assoc={assoc} />
              <AssocUpcomingEvents events={assoc.upcomingEvents} />
              <AssocCampaigns campaigns={assoc.activeCampaigns} />
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
