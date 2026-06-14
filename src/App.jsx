import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import AboutUs from './pages/AboutUs'
import Towers from './pages/Towers'
import Gallery from './pages/Gallery'
import SocialClub from './pages/SocialClub'
import SocialClubHotspot from './pages/SocialClubHotspot'
import WellnessClub from './pages/WellnessClub'
import WellnessClubHotspot from './pages/WellnessClubHotspot'
import CentralCourtyard from './pages/CentralCourtyard'
import CentralCourtyardHotspot from './pages/CentralCourtyardHotspot'
import SkyClub from './pages/SkyClub'
import SkyClubHotspot from './pages/SkyClubHotspot'
import ConventionCenter from './pages/ConventionCenter'
import ConventionCenterHotspot from './pages/ConventionCenterHotspot'
import UnitPlans from './pages/UnitPlans'
import UnitPlanDetail from './pages/UnitPlanDetail'
import UnitPlanCompare from './pages/UnitPlanCompare'
import Maps from './pages/Maps'
import SixtyDegree from './pages/SixtyDegree'
import Viewspage from './pages/ViewsPage'
const App = () => {
  return (
    <Routes>
         
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/towers" element={<Towers />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/gallery/social-club" element={<SocialClub />} />
        <Route path="/gallery/social-club/:hotspot" element={<SocialClubHotspot />} />
        <Route path="/gallery/wellness-club" element={<WellnessClub />} />
        <Route path="/gallery/wellness-club/:hotspot" element={<WellnessClubHotspot />} />
        <Route path="/gallery/central-courtyard" element={<CentralCourtyard />} />
        <Route path="/gallery/central-courtyard/:hotspot" element={<CentralCourtyardHotspot />} />
        <Route path="/gallery/sky-club" element={<SkyClub />} />
        <Route path="/gallery/sky-club/:hotspot" element={<SkyClubHotspot />} />
        <Route path="/gallery/convention-center" element={<ConventionCenter />} />
        <Route path="/gallery/convention-center/:hotspot" element={<ConventionCenterHotspot />} />
        <Route path="/unit-plans" element={<UnitPlans />} />
        <Route path="/unit-plans/compare" element={<UnitPlanCompare />} />
        <Route path="/unit-plans/:tower/:n" element={<UnitPlanDetail />} />
        <Route path="/maps" element={<Maps />} />
        <Route path="/360" element={<SixtyDegree />} />
        <Route path="/viewspage" element={<Viewspage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
