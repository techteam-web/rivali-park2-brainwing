import AccessIcon from '../../assets/locations/svgs/access.svg?react'
import LeisureIcon from '../../assets/locations/svgs/leisure.svg?react'
import HealthcareIcon from '../../assets/locations/svgs/hospital.svg?react'
import SchoolsIcon from '../../assets/locations/svgs/schools.svg?react'
import BusinessIcon from '../../assets/locations/svgs/business.svg?react'
import ParksIcon from '../../assets/locations/svgs/parks.svg?react'

// Ordered list the bottom nav renders from; a later pass reuses `id` to filter
// map points of interest. Labels stay title-case here — the nav uppercases them
// via CSS.
export const locationsCategories = [
  { id: 'access', label: 'Access', Icon: AccessIcon },
  { id: 'leisure', label: 'Leisure', Icon: LeisureIcon },
  { id: 'healthcare', label: 'Healthcare', Icon: HealthcareIcon },
  { id: 'schools', label: 'Schools', Icon: SchoolsIcon },
  { id: 'business', label: 'Business', Icon: BusinessIcon },
  { id: 'parks', label: 'Parks', Icon: ParksIcon },
]
