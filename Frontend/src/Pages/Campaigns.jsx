import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  FiActivity,
  FiAlertTriangle,
  FiArrowLeft,
  FiBookOpen,
  FiCheckCircle,
  FiChevronDown,
  FiMoon,
  FiSearch,
  FiUsers,
} from 'react-icons/fi'
import Navbar from '../Components/Navbar'
import DonationActionModal from '../Components/DonationActionModal'
import useCampaigns from '../hooks/useCampaigns'
import Footer from '../Components/Footer';

const categoryStyles = {
  all: {
    label: 'عام',
    header: 'from-[#0f3d32] via-[#145647] to-[#1e6b59]',
    accent: 'bg-[#10b981]',
    icon: FiActivity,
  },
  health: {
    label: 'صحة',
    header: 'from-[#0d2a4a] via-[#154272] to-[#1c5ea0]',
    accent: 'bg-sky-500',
    icon: FiActivity,
  },
  education: {
    label: 'تعليم',
    header: 'from-[#27265f] via-[#3a3f95] to-[#555fc9]',
    accent: 'bg-indigo-500',
    icon: FiBookOpen,
  },
  relief: {
    label: 'إغاثة',
    header: 'from-[#6b1f1f] via-[#943333] to-[#b54545]',
    accent: 'bg-red-500',
    icon: FiAlertTriangle,
  },
  orphans: {
    label: 'أيتام',
    header: 'from-[#3c235f] via-[#5b3590] to-[#7a4fba]',
    accent: 'bg-purple-500',
    icon: FiUsers,
  },
  ramadan: {
    label: 'رمضان',
    header: 'from-[#7b3b13] via-[#a4511c] to-[#ca6a28]',
    accent: 'bg-orange-500',
    icon: FiMoon,
  },
}

const categoryTabs = ['all', 'health', 'education', 'relief', 'orphans', 'ramadan']

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-24">
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#10b981]/20 border-t-[#10b981]" />
  </div>
)

const formatCurrency = (value) => new Intl.NumberFormat('ar-DZ').format(Number(value || 0))

export default function Campaigns() {
  const { campaigns, loading, error } = useCampaigns()
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [searchParams] = useSearchParams()
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('latest')

  useEffect(() => {
    const campaignId = searchParams.get('id')
    if (campaignId && campaigns.length > 0) {
      const campaign = campaigns.find((item) => item.id === Number(campaignId))
      if (campaign) setSelectedCampaign(campaign)
    }
  }, [searchParams, campaigns])

  const normalizedCampaigns = useMemo(() => (campaigns || []).map(mapCampaignCard), [campaigns])

  const filteredCampaigns = useMemo(() => {
    const query = search.trim().toLowerCase()
    const visibleCampaigns = normalizedCampaigns.filter((campaign) => campaign.canDonate)
    const byCategory = activeCategory === 'all'
      ? visibleCampaigns
      : visibleCampaigns.filter((campaign) => campaign.categoryKey === activeCategory)

    const bySearch = byCategory.filter((campaign) => {
      if (!query) return true
      return [campaign.title, campaign.description, campaign.associationName, campaign.categoryLabel]
        .join(' ')
        .toLowerCase()
        .includes(query)
    })

    const sorted = [...bySearch]
    if (sortBy === 'goal-near') {
      sorted.sort((a, b) => b.progress - a.progress)
    } else if (sortBy === 'raised-high') {
      sorted.sort((a, b) => b.raised - a.raised)
    } else if (sortBy === 'days-left') {
      sorted.sort((a, b) => a.daysLeft - b.daysLeft)
    } else {
      sorted.sort((a, b) => Number(b.id || 0) - Number(a.id || 0))
    }

    return sorted
  }, [activeCategory, normalizedCampaigns, search, sortBy])

  return (
    <div className="min-h-screen bg-[#0b1411] text-white font-arabic" dir="rtl">
      <Navbar />

      <section className="mx-auto max-w-7xl px-4 pb-10 pt-20 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-3xl border border-[#21362f] bg-[#111a17] p-5 sm:p-7">
          <div className="mb-6 text-right">
            <h1 className="text-3xl font-black text-white sm:text-4xl">استكشف حملات التبرع</h1>
            <p className="mt-2 text-sm text-[#8da399]">حملات محدثة يومياً من جمعيات موثوقة مع تقارير تقدم شفافة.</p>
          </div>

          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col gap-3 xl:flex-1 xl:flex-row xl:items-center">
              <label className="flex items-center gap-3 rounded-2xl border border-[#2d463d] bg-[#0d1613] px-4 py-3 text-sm xl:min-w-65 xl:max-w-80 xl:flex-1">
                <FiSearch className="text-[#7f948b]" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="ابحث عن حملة..."
                  className="w-full bg-transparent text-white outline-none placeholder:text-[#6f837a]"
                />
              </label>

              <div className="relative shrink-0">
                <select
                  value={activeCategory}
                  onChange={(event) => setActiveCategory(event.target.value)}
                  className="w-full appearance-none rounded-2xl border border-[#2d463d] bg-[#0d1613] px-4 py-3 pr-10 text-sm text-white outline-none xl:w-52"
                >
                  <option value="all">المجال: الكل</option>
                  {categoryTabs.filter((categoryKey) => categoryKey !== 'all').map((categoryKey) => {
                    const style = categoryStyles[categoryKey] || categoryStyles.all
                    return (
                      <option key={categoryKey} value={categoryKey}>
                        المجال: {style.label}
                      </option>
                    )
                  })}
                </select>
                <FiChevronDown className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8ca197]" />
              </div>
            </div>

            <div className="relative shrink-0">
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="w-full appearance-none rounded-2xl border border-[#2d463d] bg-[#0d1613] px-4 py-3 pr-10 text-sm text-white outline-none xl:w-48"
              >
                <option value="latest"> الأحدث</option>
                <option value="goal-near"> الأقرب للهدف</option>
                <option value="raised-high"> الأعلى جمعاً</option>
                <option value="days-left"> الأقل أياماً</option>
              </select>
              <FiChevronDown className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8ca197]" />
            </div>
          </div>
        </div>

        {loading ? <LoadingSpinner /> : null}
        {error ? <p className="mt-6 text-right text-red-400">{error}</p> : null}

        {!loading && !error && filteredCampaigns.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-[#22352d] bg-[#111a17] p-10 text-center text-[#9eb0a7]">
            لا توجد حملات مطابقة للفئة الحالية.
          </div>
        ) : null}

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCampaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onDonate={() => setSelectedCampaign(campaign.raw)}
            />
          ))}
        </div>
      </section>

      <DonationActionModal
        campaign={selectedCampaign}
        onClose={() => setSelectedCampaign(null)}
      />
      <Footer />
    </div>
  )
}

function mapCampaignCard(campaign) {
  const goal = Number(campaign?.goal_amount || campaign?.goal || 0)
  const raised = Number(campaign?.current_amount || campaign?.raised || 0)
  const progress = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0
  const associationName = campaign?.association?.name || campaign?.association?.user?.full_name || 'جمعية غير محددة'
  const associationVerified = Boolean(campaign?.association?.user?.is_email_verified || campaign?.association?.verified)
  const rawCategory = String(campaign?.domain || campaign?.category || campaign?.type || '').trim()
  const categoryLabel = rawCategory || 'عام'
  const categoryKey = getCategoryKey(categoryLabel, campaign)
  const deadlineValue = campaign?.max_date || campaign?.end_date || campaign?.deadline || null
  const daysLeft = deadlineValue ? Math.max(0, Math.ceil((new Date(deadlineValue).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0
  const categoryStyle = categoryStyles[categoryKey] || categoryStyles.all
  const statusText = categoryKey === 'relief' || daysLeft <= 7 ? 'عاجل' : 'جارية الآن'
  const expired = deadlineValue ? new Date(deadlineValue).getTime() < Date.now() : false
  const coverImage = resolveImageUrl(
    campaign?.image_url || campaign?.coverImage || campaign?.cover_image || campaign?.image,
  )

  return {
    id: campaign?.id,
    raw: campaign,
    title: campaign?.title || 'حملة تبرع',
    associationName,
    associationVerified,
    associationLogo: campaign?.association?.logo_url || campaign?.association?.logo,
    categoryKey,
    categoryLabel: categoryStyle.label,
    progress,
    goal,
    raised,
    daysLeft,
    expired,
    canDonate: Boolean(campaign?.canDonate ?? (progress < 100 && !expired)),
    endSoon: daysLeft > 0 && daysLeft <= 7,
    headerClass: categoryStyle.header,
    statusText,
    icon: categoryStyle.icon,
    coverImage,
    description: campaign?.description || 'لا يوجد وصف متاح لهذه الحملة حالياً.',
  }
}

function CampaignCard({ campaign, onDonate }) {
  const Icon = campaign.icon || FiActivity
  const [logoLoadError, setLogoLoadError] = useState(false)
  const [coverLoadError, setCoverLoadError] = useState(false)
  const showLogoImage = Boolean(campaign.associationLogo) && !logoLoadError
  const showCoverImage = Boolean(campaign.coverImage) && !coverLoadError
  const donateLabel = campaign.expired ? 'انتهت الحملة' : 'مكتملة'

  return (
    <article className="group overflow-hidden rounded-2xl border border-[#243a32] bg-[#111a17] transition-all duration-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
      <div className={`relative h-45 overflow-hidden bg-linear-to-br ${campaign.headerClass} flex items-center justify-center`}>
        {showCoverImage ? (
          <img
            src={campaign.coverImage}
            alt={campaign.title}
            className="h-full w-full object-cover"
            onError={() => setCoverLoadError(true)}
          />
        ) : (
          <Icon className="text-[88px] text-white/20" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/45 via-transparent to-black/10" />

        <div className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/35 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
          {campaign.statusText}
        </div>

        <div className="absolute bottom-3 right-4 rounded-full border border-black/20 bg-black/45 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          {campaign.categoryLabel}
        </div>
      </div>

      <div className="p-5 text-right">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {campaign.associationVerified ? <FiCheckCircle className="text-[#3b82f6]" size={16} /> : null}
            <span className="text-sm font-medium text-[#d7e1dc]">{campaign.associationName}</span>
          </div>

          <div className="h-8 w-8 overflow-hidden rounded-full border border-[#2f4b40] bg-[#0f1714]">
            {showLogoImage ? (
              <img
                src={campaign.associationLogo}
                alt={campaign.associationName}
                className="h-full w-full object-cover"
                onError={() => setLogoLoadError(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-bold text-[#10b981]">
                {(campaign.associationName || 'ج').charAt(0)}
              </div>
            )}
          </div>
        </div>

        <h3 className="line-clamp-2 text-lg font-black text-white">{campaign.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#8ea49a]">{campaign.description}</p>

        <div className="mt-4 h-2 rounded-full bg-[#1f2b26] overflow-hidden">
          <div className="h-full rounded-full bg-[#10b981]" style={{ width: `${campaign.progress}%` }} />
        </div>

        <div className="mt-3 flex items-center justify-between text-xs font-semibold">
          <span className="text-[#d8e2dc]">{formatCurrency(campaign.goal)} د.ج الهدف</span>
          <span className="text-[#10b981]">{formatCurrency(campaign.raised)} د.ج تم جمعه</span>
        </div>

        <p className={`mt-2 text-xs font-bold ${campaign.endSoon ? 'text-red-400' : 'text-[#facc15]'}`}>
          {campaign.progress >= 85 ? 'اقترب الهدف!' : `باقي ${campaign.daysLeft} يوم`}
        </p>

        {campaign.canDonate ? (
          <button
            onClick={onDonate}
            className="group mt-4 w-full rounded-xl border border-[#1f6f57] bg-[#0f1f1a] px-4 py-2.5 text-center text-base font-extrabold text-[#10b981] transition-all duration-300 hover:border-[#10b981] hover:text-green-400 hover:bg-[#112821]"
          >
            <span className="inline-flex items-center gap-2">
              <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span>
              <span>تبرع الآن</span>
            </span>
          </button>
        ) : (
          <div className="mt-4 w-full rounded-xl border border-gray-800 bg-gray-800 px-4 py-2.5 text-center text-base font-extrabold text-gray-400">
            {donateLabel}
          </div>
        )}
        
      </div>
    </article>
  )
}

function getCategoryKey(label, campaign) {
  const text = `${label} ${campaign?.description || ''} ${campaign?.title || ''}`.toLowerCase()
  if (text.includes('health') || text.includes('صحة') || text.includes('medical')) return 'health'
  if (text.includes('education') || text.includes('تعليم') || text.includes('school')) return 'education'
  if (text.includes('relief') || text.includes('اغاث') || text.includes('إغاث') || text.includes('urgent') || text.includes('طوارئ')) return 'relief'
  if (text.includes('orphan') || text.includes('أيتام') || text.includes('يتيم')) return 'orphans'
  if (text.includes('ramadan') || text.includes('رمضان') || text.includes('iftar') || text.includes('food')) return 'ramadan'
  return 'all'
}

function resolveImageUrl(value) {
  const raw = typeof value === 'string' ? value.trim() : ''
  if (!raw) return ''
  if (raw.startsWith('data:image/')) return raw
  if (/^https?:\/\//i.test(raw)) return raw
  if (raw.startsWith('/')) {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
    const origin = apiBase.replace(/\/api\/?$/, '')
    return `${origin}${raw}`
  }
  return raw
}
