// "Back to Amenities" — sits after Home in the back/home group on every club
// page and hotspot slide, so the sales team can jump straight to the gallery
// hub from any depth instead of stepping back through each level. Same round
// glass button as its neighbours; the icon is the Amenities crown from the home
// navbar, redrawn in white at the group's stroke weight.
const AmenitiesButton = ({ onClick }) => (
  <button
    type="button"
    aria-label="Go to amenities"
    onClick={onClick}
    className="flex items-center justify-center rounded-full transition-[transform,filter] duration-200 hover:scale-[1.05] hover:brightness-125 focus:outline-none focus-visible:scale-[1.05] focus-visible:brightness-125 h-8 w-8 xl:h-10 xl:w-10 2xl:h-12 2xl:w-12 3xl:h-15 3xl:w-15 4xl:h-20 4xl:w-20 5xl:h-30 5xl:w-30"
    style={{ backgroundColor: 'rgba(49, 49, 49, 0.2)' }}
  >
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3.5 h-3.5 xl:w-4 xl:h-4 2xl:w-5 2xl:h-5 3xl:w-6 3xl:h-6 4xl:w-8 4xl:h-8 5xl:w-12 5xl:h-12"
    >
      <path d="M2.16 5.88C2.16 5.88 2.8 8.19 3.5 9.13C4.2 10.07 5.38 10.73 6.48 10.44C7.44 10.19 8.15 9.29 8.47 8.32C8.79 7.34 8.79 6.29 8.78 5.26C8.76 7.09 9 9.37 10.65 10.03C11.85 10.51 13.25 9.75 13.98 8.64C14.72 7.53 14.93 6.15 15.13 4.82C14.89 6.42 14.76 8.32 15.92 9.39C17.04 10.43 18.88 10.09 20.02 9.07C21.15 8.06 21.76 6.55 22.32 5.1C21.48 9.52 20.64 13.94 19.81 18.36C16.65 19.06 13.4 19.27 10.19 18.96C8.3 18.79 6.36 18.44 4.54 18.99C3.66 14.71 2.16 5.88 2.16 5.88Z" />
      <path d="M4.55 22.22C9.81 22.45 15.1 22.38 20.35 22.02" />
      <path d="M1 1.43L1.69 3.82" />
      <path d="M8.83 1L8.91 3.4" />
      <path d="M15.37 1L15.34 3.23" />
      <path d="M22.97 1C23.07 1.8 22.99 2.63 22.77 3.41" />
    </svg>
  </button>
)

export default AmenitiesButton
