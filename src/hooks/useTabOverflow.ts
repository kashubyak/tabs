import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { TabItem } from '../types/tap.types'

export function useTabOverflow(tabs: TabItem[], mounted: boolean) {
	const [overflowTabs, setOverflowTabs] = useState<TabItem[]>([])
	const containerRef = useRef<HTMLDivElement>(null)
	const scrollContainerRef = useRef<HTMLDivElement>(null)

	const updateOverflow = useCallback(() => {
		const container = scrollContainerRef.current
		if (!container) return

		const containerRect = container.getBoundingClientRect()
		const nodes = container.querySelectorAll('.tab-item-node')
		const hiddenIds: string[] = []

		nodes.forEach(node => {
			const rect = node.getBoundingClientRect()
			if (rect.left > containerRect.right - 5) {
				const id = node.getAttribute('data-tab-id')
				if (id) hiddenIds.push(id)
			}
		})

		const newOverflowTabs = tabs.filter(t => hiddenIds.includes(t.id))

		setOverflowTabs(prev => {
			if (
				prev.length === newOverflowTabs.length &&
				prev.every((t, i) => t.id === newOverflowTabs[i].id)
			)
				return prev

			return newOverflowTabs
		})
	}, [tabs])

	useLayoutEffect(() => {
		if (!mounted) return
		setTimeout(updateOverflow, 0)

		const resizeObserver = new ResizeObserver(() => requestAnimationFrame(updateOverflow))
		if (containerRef.current) resizeObserver.observe(containerRef.current)
		return () => resizeObserver.disconnect()
	}, [tabs, mounted, updateOverflow])

	const handleWheel = useCallback((e: React.WheelEvent) => {
		if (scrollContainerRef.current) {
			if (e.deltaY !== 0) scrollContainerRef.current.scrollLeft += e.deltaY
		}
	}, [])

	return {
		visibleTabs: tabs,
		overflowTabs,
		containerRef,
		scrollContainerRef,
		updateOverflow,
		handleWheel,
	}
}
