import Navbar from '../Components/Navbar'
import HeroSection from '../Components/HeroSection'
import FeaturedCampaigns from '../Components/FeaturedCampaigns'
import HowItWorks from '../Components/HowItWorks'
import Footer from '../Components/Footer'
const Home = () => {
  return (
    <div className="font-arabic" dir="rtl">
      <Navbar/>
      <main className="pt-20">
        <HeroSection/>
        <FeaturedCampaigns />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  )
}

export default Home