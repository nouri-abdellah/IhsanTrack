
import './App.css'
import Home from './Pages/Home'
import User_sign_in from './Pages/User_sign_in'
import User_sign_up from './Pages/User_sign_up'
import Associations from './Pages/Associations'
import Campaigns from './Pages/Campaigns'
import About_us from './Pages/About_us'
import Events from './Pages/Events'
import Donate from './Pages/Donate'
import ForgotPassword from './Pages/ForgotPassword'
import ResetPassword from './Pages/ResetPassword'

import AssocProfilePage from "./Pages/AssocProfilePage";
import AssocEditProfilePage from "./Pages/AssocEditProfilePage";
import AssocCampaignsDashboardPage from "./Pages/AssocCampaignsDashboardPage";
import AssocEventsDashboardPage from "./Pages/AssocEventsDashboardPage";
import UserProfilePage from "./Pages/UserProfilePage";


import {BrowserRouter as Router,Route,Routes } from 'react-router-dom'

function App() {
 

  return (
    <>
    <Router>
     <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/associations' element={<Associations/>}/>
      <Route path='/campaigns' element={<Campaigns/>}/>
      <Route path='/about_us' element={<About_us/>}/>
      <Route path='/events' element={<Events/>}/>
      <Route path='/user_sign_in' element={<User_sign_in/>}/>
      <Route path='/user_sign_up' element={<User_sign_up/>}/>
      <Route path='/forgot-password' element={<ForgotPassword/>}/>
      <Route path='/reset-password' element={<ResetPassword/>}/>
      <Route path='/donate' element={<Donate/>}/>
      
      <Route path="/associations/:id" element={<AssocProfilePage />} />
      <Route path="/dashboard/association/profile"   element={<AssocEditProfilePage />} />
      <Route path="/dashboard/association/campaigns" element={<AssocCampaignsDashboardPage />} />
      <Route path="/dashboard/association/events"    element={<AssocEventsDashboardPage />} />
      <Route path="/dashboard/user/profile"          element={<UserProfilePage />} />
     </Routes>
    </Router>
    </>
  )
}

export default App
