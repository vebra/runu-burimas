import { useEffect } from 'react'

const BASE_TITLE = 'Runų Būrimas'

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${BASE_TITLE}` : `${BASE_TITLE} 🔮 | Elder Futhark Runų Aplikacija`
    return () => {
      document.title = `${BASE_TITLE} 🔮 | Elder Futhark Runų Aplikacija`
    }
  }, [title])
}
