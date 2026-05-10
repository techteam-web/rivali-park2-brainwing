import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import AboutUs from './pages/AboutUs'
import Towers from './pages/Towers'
import Gallery from './pages/Gallery'
import UnitPlans from './pages/UnitPlans'
import Maps from './pages/Maps'
import SixtyDegree from './pages/SixtyDegree'

const App = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/towers" element={<Towers />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/unit-plans" element={<UnitPlans />} />
        <Route path="/maps" element={<Maps />} />
        <Route path="/360" element={<SixtyDegree />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
