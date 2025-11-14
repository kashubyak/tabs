import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { initialTabs } from '../data/initialTabs'
import { TabItem } from '../types/tap.types'

const LOCAL_STORAGE_KEY = 'tabs-order-state'

export function useTabs() {
	const [tabs, setTabs] = useState<TabItem[]>(initialTabs)
	const [mounted, setMounted] = useState(false)
	const pathname = usePathname()
	const router = useRouter()

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setMounted(true)
		const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
		if (saved) {
			try {
				setTabs(JSON.parse(saved))
			} catch (e) {
				console.error('Failed to load tabs', e)
			}
		}
	}, [])

	useEffect(() => {
		if (mounted) localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tabs))
	}, [tabs, mounted])

	const handlePinToggle = useCallback((id: string) => {
		setTabs(prevTabs => {
			const newTabs = prevTabs.map(tab => {
				if (tab.id === id) return { ...tab, isPinned: !tab.isPinned }
				return tab
			})
			return newTabs.sort((a, b) => {
				if (a.isPinned === b.isPinned) return 0
				return a.isPinned ? -1 : 1
			})
		})
	}, [])

	const handleCloseTab = useCallback(
		(id: string) => {
			setTabs(currentTabs => {
				const tabToClose = currentTabs.find(t => t.id === id)
				const isActive = tabToClose?.url === pathname
				const newTabs = currentTabs.filter(t => t.id !== id)

				if (isActive && newTabs.length > 0) {
					const index = currentTabs.findIndex(t => t.id === id)
					const nextTab = newTabs[index - 1] || newTabs[0]
					if (nextTab) router.push(nextTab.url)
				}

				return newTabs
			})
		},
		[pathname, router],
	)

	return {
		tabs,
		setTabs,
		handlePinToggle,
		handleCloseTab,
		mounted,
	}
}
