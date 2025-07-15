import { defineStore } from 'pinia'
import { useRoute, useRouter } from 'vue-router'

export const useURLSyncStore = defineStore('urlSync', () => {
  const route = useRoute()
  const router = useRouter()

  const updateURLParams = (params: Record<string, string | string[]>) => {
    const currentParams = { ...route.query }

    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        currentParams[key] = value
      } else if (typeof value === 'string' && value) {
        currentParams[key] = value
      } else {
        delete currentParams[key]
      }
    })

    router.replace({ query: currentParams })
  }

  const getURLParams = () => {
    const params: Record<string, string | string[]> = {}

    Object.entries(route.query).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        params[key] = value.filter(v => v !== null) as string[]
      } else if (value) {
        params[key] = value
      }
    })

    return params
  }

  const parseArrayParam = (value: string | string[] | undefined): string[] => {
    if (Array.isArray(value)) {
      return value
    }
    if (typeof value === 'string') {
      return value.split(',').filter(Boolean)
    }
    return []
  }

  const parseNumberParam = (value: string | string[] | undefined): number => {
    if (typeof value === 'string') {
      const parsed = parseFloat(value)
      return isNaN(parsed) ? 0 : parsed
    }
    return 0
  }

  return {
    updateURLParams,
    getURLParams,
    parseArrayParam,
    parseNumberParam
  }
})
