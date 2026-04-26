import { useCallback, useEffect, useMemo, useState } from "react";
import AssocDashboardNavbar from "../Components/dashboard/AssocDashboardNavbar";
import DashboardFooter from "../Components/dashboard/DashboardFooter";
import AssociationActivityPanel from "../Components/dashboard/AssociationActivityPanel";
import CampaignsDashboardStats from "../Components/dashboard/CampaignsDashboardStats";
import CreateCampaignForm from "../Components/dashboard/CreateCampaignForm";
import CampaignsTable from "../Components/dashboard/CampaignsTable";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

/**
 * AssocCampaignsDashboardPage.jsx
 *
 * ROUTE: /dashboard/association/campaigns
 *
 * ACCESS: Protected — association accounts only.
 * Wrap with <ProtectedRoute role="association"> in App.jsx.
 *
 * PURPOSE:
 * The association's campaign management interface. Allows them to:
 *   1. View overall donation stats (total raised, active campaigns, donor count)
 *   2. Create a new campaign via inline form
 *   3. View, filter, and manage all their campaigns in a table
 *
 * PAGE LAYOUT (top to bottom):
 * ┌────────────────────────────────────────────────┐
 * │  AssocDashboardNavbar  (إدارة الحملات active)  │
 * ├────────────────────────────────────────────────┤
 * │  Page header: title + export + create buttons  │
 * ├────────────────────────────────────────────────┤
 * │  CampaignsDashboardStats  (3 KPI cards)        │
 * ├────────────────────────────────────────────────┤
 * │  CreateCampaignForm  (بيانات الحملة الجديدة)  │
 * ├────────────────────────────────────────────────┤
 * │  CampaignsTable  (آخر الحملات)                 │
 * ├────────────────────────────────────────────────┤
 * │  DashboardFooter                               │
 * └────────────────────────────────────────────────┘
 *
 * STATE:
 * - showCreateForm: toggles visibility of the create campaign form
 * - campaigns: list of campaigns (mock → replace with API)
 * Adding a new campaign via the form prepends it to the campaigns list.
 */

export default function AssocCampaignsDashboardPage() {
  const { user, isAuthenticated, authLoading } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const campaignStats = useMemo(() => {
    const totalRaised = campaigns.reduce((sum, campaign) => sum + Number(campaign.raised || 0), 0);
    const activeCampaigns = campaigns.filter((campaign) => campaign.status === "نشطة").length;
    const completedCampaigns = campaigns.filter((campaign) => campaign.status === "مكتملة").length;
    const uniqueDonors = new Set(
      campaigns.flatMap((campaign) => (campaign.donationUserIds || []).filter(Boolean))
    ).size;

    return {
      totalRaised,
      campaignCount: campaigns.length,
      activeCampaigns,
      completedCampaigns,
      uniqueDonors,
    };
  }, [campaigns]);

  const recentDonations = useMemo(
    () =>
      campaigns.flatMap((campaign) =>
        (campaign.donations || []).map((donation) => ({
          id: donation.id,
          amount: donation.amount,
          date: donation.date,
          payment_method: donation.payment_method,
          projectTitle: campaign.title,
          donorName: donation.donor?.full_name,
          donor: donation.donor,
          donorEmail: donation.donor?.email,
          donorPhone: donation.donor?.phone,
          anonymous: donation.anonymous,
        }))
      ),
    [campaigns]
  );

  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/associations/me/campaigns");
      setCampaigns((response.data || []).map(mapCampaignRow));
    } catch (err) {
      setError(err?.response?.data?.error || "تعذر تحميل الحملات.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || user?.role !== "association") {
      setLoading(false);
      setCampaigns([]);
      setError("يجب تسجيل الدخول بحساب جمعية لعرض هذه الصفحة.");
      return;
    }

    let ignore = false;

    (async () => {
      await loadCampaigns();
      if (ignore) return;
    })();

    return () => {
      ignore = true;
    };
  }, [authLoading, isAuthenticated, loadCampaigns, user?.role]);

  // Called when CreateCampaignForm submits successfully
  const handleCampaignCreated = async () => {
    setShowCreateForm(false);
    await loadCampaigns();
  };

  return (
    <div className="font-arabic min-h-screen bg-gray-950 text-white" dir="rtl">
      <AssocDashboardNavbar activeTab="/dashboard/association/campaigns" />

      <main className="pt-14">

        {/* ── Page Header ── */}
        <div className="bg-gray-950 border-b border-gray-800/60 sticky top-14 z-40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">

              {/* Left: action buttons */}
              <div className="flex items-center gap-2">
                {/* Export report */}
                <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white border border-gray-700 hover:border-gray-500 rounded-xl transition-all duration-200">
                  <span>📊</span>
                  تصدير التقرير
                </button>
                {/* Create new campaign */}
                <button
                  onClick={() => setShowCreateForm((v) => !v)}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-bold bg-green-600 hover:bg-green-500 text-white rounded-xl transition-all duration-200 shadow-lg shadow-green-900/40"
                >
                  <span className="text-base leading-none">+</span>
                  إنشاء حملة جديدة
                </button>
              </div>

              {/* Right: title */}
              <div className="text-right">
                <h1 className="text-lg sm:text-xl font-extrabold text-white">
                  إدارة التبرعات الخيرية
                </h1>
                <p className="text-gray-400 text-xs mt-0.5">
                  قم بإنشاء وتفعيل ومراقبة حملات تبرع الخاصة بك
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <CampaignsDashboardStats stats={campaignStats} />
          <AssociationActivityPanel donations={recentDonations} />

          {/* Create campaign form (toggle) */}
          {showCreateForm && (
            <CreateCampaignForm
              onCreated={handleCampaignCreated}
              onCancel={() => setShowCreateForm(false)}
            />
          )}

          {error ? <div className="empty-state"><h3>No records found</h3><p>{error}</p></div> : null}
          {!error ? (
            <CampaignsTable campaigns={campaigns} onRefresh={loadCampaigns} loading={loading} />
          ) : null}
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
}

function mapCampaignRow(campaign) {
  const raised = Number(campaign.current_amount || 0);
  const goal = Number(campaign.goal_amount || 0);
  const progress = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
  const donationUserIds = Array.isArray(campaign.donations)
    ? campaign.donations.map((donation) => donation.user_id)
    : [];
  const donors = new Set(donationUserIds.filter(Boolean)).size;
  const donations = Array.isArray(campaign.donations)
    ? campaign.donations.map((donation) => ({
        id: donation.id,
        amount: Number(donation.amount || 0),
        date: donation.date,
        payment_method: donation.payment_method,
        anonymous: Boolean(donation.anonymous),
        donor: donation.donor || null,
      }))
    : [];

  return {
    id: campaign.id,
    title: campaign.title,
    description: campaign.description || "",
    image: campaign.image_url,
    image_url: campaign.image_url,
    imageEmoji: "🍱",
    donors,
    donationUserIds,
    raised,
    goal,
    maxDate: campaign.max_date || null,
    progress,
    status: progress >= 100 ? "مكتملة" : "نشطة",
    statusColor: progress >= 100 ? "blue" : "green",
    createdAt: campaign.createdAt ? new Date(campaign.createdAt).toLocaleDateString("ar-DZ") : "الآن",
    donations,
  };
}
