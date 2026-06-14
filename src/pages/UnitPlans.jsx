import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import UnitArtboard from '../components/unitplan/UnitArtboard'
import UnitHeader from '../components/unitplan/UnitHeader'
import { TOWER_TABS, towerUnits } from '../data/unitPlans'

// Floor-plan selector (Figma "Unit Plans"). The exported sheet is a
// self-contained landscape page (its own title/compass/logo baked in), so it
// just needs a centered, aspect-correct box below the header with the clickable
// unit markers overlaid. Clicking a marker opens that unit's detail sheet.
const UnitPlans = () => {
  const navigate = useNavigate()
  const [activeTower, setActiveTower] = useState('skyleap')

  const current =
    TOWER_TABS.find((t) => t.id === activeTower) ??
    TOWER_TABS.find((t) => t.id === 'skyleap')

  const units = towerUnits(current.id)

  return (
    <UnitArtboard>
      <UnitHeader onBack={() => navigate('/')}>
        <nav className="flex items-center gap-10">
          {TOWER_TABS.map((tab) => {
            const isActive = tab.id === activeTower
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTower(tab.id)}
                className="relative flex items-center justify-center uppercase transition-colors"
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: isActive ? 17 : 16,
                  lineHeight: '24px',
                  letterSpacing: isActive ? '0.07em' : '0.1em',
                  color: isActive ? '#313131' : '#666666',
                }}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute left-1/2 -bottom-2 h-0.5 w-3.75 -translate-x-1/2 rounded-full bg-[#7A4833]" />
                )}
              </button>
            )
          })}
        </nav>
      </UnitHeader>

      {/* Courtyard / external facing labels + floor plan */}
      <p
        className="absolute left-1/2 top-40 -translate-x-1/2 uppercase"
        style={{
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 600,
          fontSize: 18,
          letterSpacing: '0.12em',
          color: '#7A4833',
        }}
      >
        Courtyard Facing
      </p>

      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{ top: 200, width: 1200, height: 640 }}
      >
        {current.plan ? (
          <>
            <img
              src={current.plan}
              alt={`${current.label} floor plan`}
              className="h-full w-full object-contain"
            />

            {units.map((u) => (
                <button
                  key={u.n}
                  type="button"
                  aria-label={`View ${current.label} unit ${u.n} plan`}
                  onClick={() => navigate(`/unit-plans/${current.id}/${u.n}`)}
                  className="absolute grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-[#7A4833] bg-white/80 text-[#7A4833] backdrop-blur-sm transition-all hover:bg-[#7A4833] hover:text-white"
                  style={{
                    left: `${u.left}%`,
                    top: `${u.top}%`,
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 600,
                    fontSize: 18,
                    letterSpacing: '0.05em',
                  }}
                >
                  {u.n}
                </button>
              ))}
          </>
        ) : (
          <div
            className="grid h-full w-full place-items-center uppercase"
            style={{
              fontFamily: 'Poppins, sans-serif',
              letterSpacing: '0.1em',
              color: '#666666',
            }}
          >
            {current.label} floor plan coming soon
          </div>
        )}
      </div>

      <p
        className="absolute left-1/2 bottom-10 -translate-x-1/2 uppercase"
        style={{
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 600,
          fontSize: 18,
          letterSpacing: '0.12em',
          color: '#7A4833',
        }}
      >
        External Facing
      </p>
    </UnitArtboard>
  )
}

export default UnitPlans
