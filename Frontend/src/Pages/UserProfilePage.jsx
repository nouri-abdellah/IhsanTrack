import { useEffect, useMemo, useState } from "react";
import Navbar from "../Components/Navbar";
import UserProfileHeader from "../Components/user/UserProfileHeader";
import UserStatsCards from "../Components/user/UserStatsCards";
import UserActivityTabs from "../Components/user/UserActivityTabs";
import UserFooter from "../Components/user/UserFooter";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { fileToDataUrl } from "../utils/fileToDataUrl";

function formatDate(value) {
  if (!value) return "غير محدد";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "غير محدد";

  return new Intl.DateTimeFormat("ar-DZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function mapDonations(donations = []) {
  return donations.map((donation) => ({
    id: donation.id,
    campaignTitle: donation.donationProject?.title || "حملة تبرع",
    campaignIcon: "💚",
    campaignColor: "bg-green-900/40 border-green-800/40",
    date: formatDate(donation.date),
    amount: Number(donation.amount || 0),
    status: "مكتمل",
  }));
}

function mapEvents(events = []) {
  return events.map((event) => ({
    id: event.id,
    eventTitle: event.title,
    eventIcon: "📅",
    eventColor: "bg-blue-900/40 border-blue-800/40",
    date: formatDate(event.registered_at || event.date),
    location: event.location || "",
    status: event.status === "accepted" ? "حضرت" : event.status === "rejected" ? "غاب" : "مسجّل",
  }));
}

export default function UserProfilePage() {
  const { user: authUser, updateProfile } = useAuth();

  const [user, setUser] = useState(null);
  const [donations, setDonations] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [avatarEditorOpen, setAvatarEditorOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadProfile = async () => {
      setLoading(true);
      setError("");

      try {
        const [profileRes, donationsRes, eventsRes] = await Promise.all([
          api.get("/auth/me"),
          api.get("/donations/my"),
          api.get("/events/my"),
        ]);

        if (ignore) return;

        setUser(profileRes.data);
        setDonations(donationsRes.data || []);
        setEvents(eventsRes.data || []);
        setAvatarUrl(profileRes.data?.avatar_url || "");
        setAvatarPreview(profileRes.data?.avatar_url || "");
      } catch (err) {
        if (!ignore) {
          setError(err?.response?.data?.error || "تعذر تحميل بيانات الملف الشخصي.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      ignore = true;
    };
  }, [authUser?.id]);

  const profileUser = useMemo(() => {
    const activeUser = user || authUser;
    if (!activeUser) return null;

    return {
      id: activeUser.id,
      full_name: activeUser.full_name,
      email: activeUser.email,
      avatar_url: activeUser.avatar_url,
      is_email_verified: activeUser.is_email_verified,
      memberSince: activeUser.createdAt ? new Date(activeUser.createdAt).getFullYear() : new Date().getFullYear(),
      totalDonations: donations.reduce((sum, donation) => sum + Number(donation.amount || 0), 0),
      totalEvents: events.length,
    };
  }, [authUser, donations, events, user]);

  const handleSaveAvatar = async () => {
    setSavingAvatar(true);
    setError("");

    try {
      const response = await updateProfile({ avatar_url: avatarUrl.trim() || null });
      setUser((current) => ({ ...(current || {}), ...response.user }));
      setAvatarEditorOpen(false);
    } catch (err) {
      setError(err?.response?.data?.error || "تعذر تحديث الصورة الشخصية.");
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleAvatarFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const dataUrl = await fileToDataUrl(file);
    setAvatarUrl(dataUrl);
    setAvatarPreview(dataUrl);
  };

  return (
    <div className="font-arabic min-h-screen bg-gray-950 text-white" dir="rtl">
      <Navbar />

      <main className="pt-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">
          {loading ? (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center text-gray-400">
              جارٍ تحميل الملف الشخصي...
            </div>
          ) : error && !profileUser ? (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center text-red-400">
              {error}
            </div>
          ) : profileUser ? (
            <>
              <UserProfileHeader user={profileUser} onEditAvatar={() => setAvatarEditorOpen(true)} />
              <UserStatsCards user={profileUser} />
              <UserActivityTabs donations={mapDonations(donations)} events={mapEvents(events)} />
            </>
          ) : null}
        </div>
      </main>

      {avatarEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4">
          <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-6 text-right">
            <h2 className="text-xl font-bold mb-2">تغيير الصورة الشخصية</h2>
            <p className="text-sm text-gray-400 mb-4">
              اختر صورة من جهازك. إذا تركت الحقل فارغاً سيظهر أول حرف من اسمك تلقائياً.
            </p>

            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-700 bg-gray-950/60 px-4 py-5 text-center hover:border-green-500 transition-colors">
              <span className="text-2xl">🖼️</span>
              <span className="text-sm text-gray-300">اختر صورة من الجهاز</span>
              <span className="text-xs text-gray-500">PNG, JPG, WEBP</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} />
            </label>

            {avatarPreview ? (
              <img src={avatarPreview} alt="معاينة الصورة الشخصية" className="mt-4 mx-auto h-24 w-24 rounded-full object-cover border border-gray-800" />
            ) : null}

            {error ? <p className="text-red-400 text-sm mt-3">{error}</p> : null}

            <div className="mt-5 flex gap-3 justify-start">
              <button
                type="button"
                onClick={handleSaveAvatar}
                disabled={savingAvatar}
                className="h-10 px-4 rounded-md bg-green-700 hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {savingAvatar ? "جارٍ الحفظ..." : "حفظ الصورة"}
              </button>
              <button
                type="button"
                onClick={() => setAvatarEditorOpen(false)}
                className="h-10 px-4 rounded-md border border-gray-700 text-gray-300 hover:text-white"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      <UserFooter />
    </div>
  );
}
