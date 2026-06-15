import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, inlineSvgsReady } from '../../lib/gsap'
import InlineSVG from '../about/InlineSVG'

const STORAGE_KEY = 'rivaliVisitor'

export const readStoredVisitor = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || !parsed.name) return null
    return parsed
  } catch {
    return null
  }
}

export const clearStoredVisitor = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

const writeStoredVisitor = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // ignore
  }
}

const labelScale =
  'text-[10px] lg:text-[10px] xl:text-[11px] 2xl:text-[12px] 3xl:text-[14px] 4xl:text-[18px] 5xl:text-[26px]'

const inputScale =
  'text-[14px] lg:text-[14px] xl:text-[16px] 2xl:text-[18px] 3xl:text-[22px] 4xl:text-[30px] 5xl:text-[44px]'

const headingScale =
  'text-[26px] lg:text-[28px] xl:text-[36px] 2xl:text-[42px] 3xl:text-[52px] 4xl:text-[70px] 5xl:text-[104px]'

const subheadScale =
  'text-[11px] lg:text-[11px] xl:text-[12px] 2xl:text-[14px] 3xl:text-[16px] 4xl:text-[22px] 5xl:text-[32px]'

const buttonScale =
  'text-sm lg:text-base 2xl:text-lg 3xl:text-xl 4xl:text-2xl 5xl:text-4xl'

const validate = ({ name, phone, email }) => {
  const errors = {}
  if (!name || name.trim().length < 2) errors.name = 'Please enter your name'
  const phoneDigits = (phone || '').replace(/\D/g, '')
  if (phoneDigits.length < 7) errors.phone = 'Enter a valid phone number'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || '').trim()))
    errors.email = 'Enter a valid email'
  return errors
}

const WelcomeForm = ({ onSubmit, onExit }) => {
  const containerRef = useRef(null)
  const overlayRef = useRef(null)

  const [stored, setStored] = useState(() => readStoredVisitor())
  const [values, setValues] = useState({ name: '', phone: '', email: '' })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState(false)

  const { contextSafe } = useGSAP(() => {
    gsap.fromTo(
      overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.5, ease: 'power2.out' },
    )

    // Draw-in choreography for the decorative SVGs. inlineSvgsReady waits
    // for every [data-inline-svg] inside scope to have data-inline-svg-loaded
    // set — same helper Hero.jsx uses. Once they're all in DOM we query the
    // drawable elements and tween drawSVG + opacity together.
    const drawSel =
      'svg path, svg line, svg polyline, svg polygon, svg circle, svg ellipse, svg rect'

    inlineSvgsReady(overlayRef.current).then(() => {
      const targets =
        overlayRef.current?.querySelectorAll('[data-draw-target]') ?? []
      targets.forEach((el, i) => {
        const paths = el.querySelectorAll(drawSel)
        if (!paths.length) return
        gsap.killTweensOf(paths)
        gsap.set(paths, { opacity: 0, drawSVG: 0 })
        gsap.to(paths, {
          opacity: 1,
          drawSVG: '0% 100%',
          stagger: 0.012,
          duration: 1.2,
          ease: 'power1.inOut',
          delay: 0.2 + i * 0.25,
        })
      })
    })
  }, { scope: containerRef })

  const finish = contextSafe((visitor) => {
    onSubmit?.(visitor)
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.inOut',
      onComplete: () => onExit?.(visitor),
    })
  })

  const handleContinue = () => {
    if (!stored) return
    finish(stored)
  }

  const handleStartFresh = () => {
    clearStoredVisitor()
    setStored(null)
    setValues({ name: '', phone: '', email: '' })
    setErrors({})
    setTouched(false)
  }

  const handleChange = (key) => (event) => {
    const next = { ...values, [key]: event.target.value }
    setValues(next)
    if (touched) setErrors(validate(next))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setTouched(true)
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    const visitor = {
      name: values.name.trim(),
      phone: values.phone.trim(),
      email: values.email.trim(),
      submittedAt: new Date().toISOString(),
    }
    writeStoredVisitor(visitor)
    finish(visitor)
  }

  return (
    <div ref={containerRef}>
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-pastel-brown-bg px-6 overflow-hidden"
      >
        <InlineSVG
          src="/about/designed-clouds-buildings.svg"
          aria-hidden="true"
          data-draw
          data-draw-target
          className="pointer-events-none absolute top-4 right-4 w-[260px] lg:w-[320px] xl:w-[400px] 2xl:w-[480px] 3xl:w-[600px] 4xl:w-[800px] 5xl:w-[1200px] h-auto opacity-70 select-none"
        />
        <InlineSVG
          src="/about/about-footer.svg"
          aria-hidden="true"
          data-draw
          data-draw-target
          className="pointer-events-none absolute bottom-0 left-0 w-full h-auto opacity-60 select-none"
        />
        <InlineSVG
          src="/about/masters-scribble.svg"
          aria-hidden="true"
          data-draw
          data-draw-target
          className="pointer-events-none absolute top-[8%] left-[6%] w-[120px] lg:w-[140px] xl:w-[170px] 2xl:w-[200px] 3xl:w-[240px] 4xl:w-[320px] 5xl:w-[460px] h-auto opacity-80 rotate-[-12deg] select-none"
        />

        <div className="relative z-10 w-full max-w-[380px] lg:max-w-[420px] xl:max-w-[480px] 2xl:max-w-[560px] 3xl:max-w-[680px] 4xl:max-w-[900px] 5xl:max-w-[1300px]">
          <div className="text-center mb-8 lg:mb-8 xl:mb-10 2xl:mb-12 3xl:mb-14 4xl:mb-20 5xl:mb-28">
            <p
              className={`${subheadScale} font-sans uppercase tracking-[0.3em] text-on-light-grey mb-3 lg:mb-3 xl:mb-4 2xl:mb-5 3xl:mb-6 4xl:mb-8 5xl:mb-12`}
            >
              Welcome
            </p>
            <h1
              className={`${headingScale} font-normal tracking-[-0.5px] leading-[1.16] text-on-light-black`}
            >
              Tell us about you
            </h1>
            <p
              className={`${subheadScale} font-sans text-on-light-grey/90 mt-3 lg:mt-3 xl:mt-4 2xl:mt-4 3xl:mt-5 4xl:mt-7 5xl:mt-10 leading-[1.6]`}
            >
              A short hello before we begin your experience.
            </p>
          </div>

          {stored && (
            <div className="mb-8 lg:mb-8 xl:mb-10 2xl:mb-12 3xl:mb-14 4xl:mb-20 5xl:mb-28 border-y border-on-light-stroke py-5 lg:py-5 xl:py-6 2xl:py-7 3xl:py-9 4xl:py-12 5xl:py-16 text-center">
              <p
                className={`${subheadScale} font-sans text-on-light-black mb-4 lg:mb-4 xl:mb-5 2xl:mb-6 3xl:mb-7 4xl:mb-10 5xl:mb-14`}
              >
                We remember you,{' '}
                <span className="font-medium text-brand-brown">
                  {stored.name}
                </span>
                . Continue with the same details or start fresh?
              </p>
              <div className="flex items-center justify-center gap-3 lg:gap-3 xl:gap-4 2xl:gap-5 3xl:gap-6 4xl:gap-8 5xl:gap-12">
                <button
                  type="button"
                  onClick={handleContinue}
                  className={`${labelScale} font-sans uppercase tracking-[0.25em] text-on-light-black border-b border-on-light-black/50 hover:border-on-light-black px-4 py-2 lg:px-4 lg:py-2 xl:px-5 xl:py-3 2xl:px-6 2xl:py-3 3xl:px-8 3xl:py-4 4xl:px-10 4xl:py-5 5xl:px-16 5xl:py-8 transition-colors`}
                >
                  Continue
                </button>
                <button
                  type="button"
                  onClick={handleStartFresh}
                  className={`${labelScale} font-sans uppercase tracking-[0.25em] text-on-light-grey hover:text-on-light-black border-b border-transparent hover:border-on-light-black px-4 py-2 lg:px-4 lg:py-2 xl:px-5 xl:py-3 2xl:px-6 2xl:py-3 3xl:px-8 3xl:py-4 4xl:px-10 4xl:py-5 5xl:px-16 5xl:py-8 transition-colors`}
                >
                  Start fresh
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5 lg:space-y-5 xl:space-y-6 2xl:space-y-7 3xl:space-y-9 4xl:space-y-12 5xl:space-y-16">
            <Field
              id="welcome-name"
              label="Name"
              type="text"
              autoComplete="name"
              value={values.name}
              onChange={handleChange('name')}
              error={errors.name}
            />
            <Field
              id="welcome-phone"
              label="Phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              value={values.phone}
              onChange={handleChange('phone')}
              error={errors.phone}
            />
            <Field
              id="welcome-email"
              label="Email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={values.email}
              onChange={handleChange('email')}
              error={errors.email}
            />

            <div className="pt-4 lg:pt-4 xl:pt-5 2xl:pt-6 3xl:pt-8 4xl:pt-10 5xl:pt-14 flex justify-center">
              <button
                type="submit"
                className={`${buttonScale} font-sans text-on-light-black uppercase tracking-[0.25em] border-b border-on-light-black/30 hover:border-on-light-black px-8 py-4 lg:px-10 lg:py-5 3xl:px-14 3xl:py-7 4xl:px-20 4xl:py-10 5xl:px-32 5xl:py-16 transition-colors`}
              >
                Submit & Continue
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

const Field = ({ id, label, type, value, onChange, error, ...rest }) => {
  return (
    <div>
      <label
        htmlFor={id}
        className={`${labelScale} block font-sans uppercase tracking-[0.25em] text-on-light-grey mb-2 lg:mb-2 xl:mb-3 2xl:mb-3 3xl:mb-4 4xl:mb-5 5xl:mb-7`}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        className={`${inputScale} w-full bg-transparent font-sans text-on-light-black placeholder-on-light-grey/60 border-b ${
          error ? 'border-brand-brown' : 'border-on-light-stroke'
        } focus:border-on-light-black focus:outline-none py-2 lg:py-2 xl:py-3 2xl:py-3 3xl:py-4 4xl:py-5 5xl:py-7 transition-colors`}
        {...rest}
      />
      {error && (
        <p
          className={`${labelScale} mt-2 lg:mt-2 xl:mt-2 2xl:mt-3 3xl:mt-3 4xl:mt-4 5xl:mt-6 font-sans text-brand-brown tracking-[0.1em]`}
        >
          {error}
        </p>
      )}
    </div>
  )
}

export default WelcomeForm
