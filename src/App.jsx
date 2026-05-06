import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import AboutUs from './pages/AboutUs'
import Towers from './pages/Towers'
import Gallery from './pages/Gallery'
import SocialClub from './pages/SocialClub'
import WellnessClub from './pages/WellnessClub'
import CentralCourtyard from './pages/CentralCourtyard'
import SkyClub from './pages/SkyClub'
import ConventionCenter from './pages/ConventionCenter'
import UnitPlans from './pages/UnitPlans'
import Maps from './pages/Maps'
import SixtyDegree from './pages/SixtyDegree'

const App = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/about" replace />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/towers" element={<Towers />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/gallery/social-club" element={<SocialClub />} />
        <Route path="/gallery/wellness-club" element={<WellnessClub />} />
        <Route path="/gallery/central-courtyard" element={<CentralCourtyard />} />
        <Route path="/gallery/sky-club" element={<SkyClub />} />
        <Route path="/gallery/convention-center" element={<ConventionCenter />} />
        <Route path="/unit-plans" element={<UnitPlans />} />
        <Route path="/maps" element={<Maps />} />
        <Route path="/360" element={<SixtyDegree />} />
        <Route path="*" element={<Navigate to="/about" replace />} />
      </Route>
    </Routes>
  )
}

export default App
