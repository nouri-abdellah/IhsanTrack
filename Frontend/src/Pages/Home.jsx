import Navbar from '../Components/Navbar'
import HeroSection from '../Components/HeroSection'
import StatsBar from '../Components/StatsBar'
import FeaturedCampaigns from '../Components/FeaturedCampaigns'
import HowItWorks from '../Components/HowItWorks'
import AssociationCTA from '../Components/AssociationCTA'
import Footer from '../Components/Footer'

const Home = () => {
  return (
    <div className="font-arabic bg-[#0b1411] min-h-screen flex flex-col text-white" dir="rtl">
      <Navbar/>
      <main className="flex-1 flex flex-col w-full">
        <HeroSection/>
        <StatsBar />
        <FeaturedCampaigns />
        <HowItWorks />
        <AssociationCTA />
      </main>
      <Footer />
    </div>
  )
}

export default Home