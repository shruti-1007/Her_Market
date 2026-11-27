import { useEffect, useState } from 'react'
import { getListings } from '../api/listings.js'
import { errorMessage } from '../api/errors.js'

export default function useListings(limit) {
  const [state, setState] = useState({ loading: true, error: '', listings: [] })

  useEffect(() => {
    let active = true
    getListings({ limit })
      .then((d) => active && setState({ loading: false, error: '', listings: d.listings }))
      .catch((e) => active && setState({ loading: false, error: errorMessage(e), listings: [] }))
    return () => {
      active = false
    }
  }, [limit])

  return state
}
