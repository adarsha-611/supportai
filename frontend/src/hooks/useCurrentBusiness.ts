import { useEffect, useState } from 'react'
import { businessService } from '../services/businessService'
import type { Business } from '../types/business'

export function useCurrentBusiness() {
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    businessService
      .listMine()
      .then((list) => setBusiness(list[0] ?? null))
      .catch(() => setBusiness(null))
      .finally(() => setLoading(false))
  }, [])

  return { business, loading }
}