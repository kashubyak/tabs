import { MouseEvent, useCallback, useState } from 'react'
import { TabItem } from '../types/tap.types'

interface ContextMenuState {
	x: number
	y: number
	tabId: string
	isPinned: boolean
}

export function useContextMenu() {
	const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)

	const handleContextMenu = useCallback((e: MouseEvent, tab: TabItem) => {
		e.preventDefault()
		setContextMenu({
			x: e.clientX,
			y: e.clientY,
			tabId: tab.id,
			isPinned: tab.isPinned,
		})
	}, [])

	const closeContextMenu = useCallback(() => {
		setContextMenu(null)
	}, [])

	return {
		contextMenu,
		handleContextMenu,
		closeContextMenu,
	}
}
