'use client'

import {
	closestCenter,
	DndContext,
	DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core'
import {
	arrayMove,
	horizontalListSortingStrategy,
	SortableContext,
} from '@dnd-kit/sortable'
import { usePathname } from 'next/navigation'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'

import { initialTabs } from '../data/initialTabs'
import { TabItem } from '../types/tap.types'
import TabItemComponent from './TabItem'
import TabsDropdown from './TabsDropdown'
import ContextMenu from './ui/ContextMenu'

const LOCAL_STORAGE_KEY = 'tabs-order-state'
const MORE_BUTTON_WIDTH = 50

interface TabsLayoutProps {
	children: React.ReactNode
}

interface ContextMenuState {
	x: number
	y: number
	tabId: string
	isPinned: boolean
}

export default function TabsLayout({ children }: TabsLayoutProps) {
	const pathname = usePathname()
	const [tabs, setTabs] = useState<TabItem[]>(initialTabs)
	const [mounted, setMounted] = useState(false)

	const [visibleTabs, setVisibleTabs] = useState<TabItem[]>([])
	const [hiddenTabs, setHiddenTabs] = useState<TabItem[]>([])

	const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)

	const containerRef = useRef<HTMLDivElement>(null)
	const ghostContainerRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setMounted(true)
		const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
		if (saved) {
			try {
				setTabs(JSON.parse(saved))
			} catch (e) {
				console.error(e)
			}
		}
	}, [])

	useEffect(() => {
		if (mounted) {
			localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tabs))
		}
	}, [tabs, mounted])

	useLayoutEffect(() => {
		if (!mounted) return

		const calculateVisibleTabs = () => {
			if (!containerRef.current || !ghostContainerRef.current) return

			const containerWidth = containerRef.current.offsetWidth
			const ghostNodes = Array.from(ghostContainerRef.current.children) as HTMLElement[]
			if (ghostNodes.length !== tabs.length) return

			let totalTabsWidth = 0
			const tabsWithWidth = tabs.map((tab, index) => {
				const width = Math.ceil(ghostNodes[index]?.getBoundingClientRect().width || 120)
				totalTabsWidth += width
				return { ...tab, width }
			})

			if (totalTabsWidth <= containerWidth) {
				setVisibleTabs(tabs)
				setHiddenTabs([])
				return
			}

			const availableWidth = containerWidth - MORE_BUTTON_WIDTH
			let currentPosition = 0
			const newVisible: TabItem[] = []
			const newHidden: TabItem[] = []

			tabsWithWidth.forEach(tab => {
				if (tab.isPinned) {
					newVisible.push(tab)
					currentPosition += tab.width
				} else {
					if (currentPosition < availableWidth) newVisible.push(tab)
					else newHidden.push(tab)

					currentPosition += tab.width
				}
			})

			setVisibleTabs(newVisible)
			setHiddenTabs(newHidden)
		}

		calculateVisibleTabs()

		const resizeObserver = new ResizeObserver(() => {
			requestAnimationFrame(calculateVisibleTabs)
		})

		if (containerRef.current) {
			resizeObserver.observe(containerRef.current)
		}

		return () => resizeObserver.disconnect()
	}, [tabs, mounted])

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
		useSensor(KeyboardSensor),
	)

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event
		if (over && active.id !== over.id) {
			setTabs(items => {
				const oldIndex = items.findIndex(item => item.id === active.id)
				const newIndex = items.findIndex(item => item.id === over.id)
				return arrayMove(items, oldIndex, newIndex)
			})
		}
	}

	const handlePinToggle = (id: string) => {
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
		setContextMenu(null)
	}

	const handleContextMenu = (e: React.MouseEvent, tab: TabItem) => {
		e.preventDefault()
		setContextMenu({
			x: e.clientX,
			y: e.clientY,
			tabId: tab.id,
			isPinned: tab.isPinned,
		})
	}

	if (!mounted) return null

	return (
		<div className='flex flex-col h-screen bg-[#F9FAFB]'>
			{contextMenu && (
				<ContextMenu
					x={contextMenu.x}
					y={contextMenu.y}
					isPinned={contextMenu.isPinned}
					onClose={() => setContextMenu(null)}
					onTogglePin={() => handlePinToggle(contextMenu.tabId)}
				/>
			)}

			<div className='fixed top-0 left-0 w-0 h-0 overflow-hidden invisible pointer-events-none'>
				<div ref={ghostContainerRef} className='flex' style={{ width: 'max-content' }}>
					{tabs.map(tab => (
						<TabItemComponent
							key={tab.id}
							tab={tab}
							isActive={false}
							onContextMenu={() => {}}
							variant='ghost'
						/>
					))}
				</div>
			</div>

			<header className='bg-white border-b border-gray-200 h-[50px] z-20'>
				<div
					className='flex items-center w-full justify-between h-full'
					ref={containerRef}
				>
					<div className='flex-1 flex h-full overflow-hidden pl-0 relative flex-nowrap'>
						<DndContext
							sensors={sensors}
							collisionDetection={closestCenter}
							onDragEnd={handleDragEnd}
						>
							<SortableContext
								items={visibleTabs.map(t => t.id)}
								strategy={horizontalListSortingStrategy}
							>
								<div className='flex h-full w-full flex-nowrap'>
									{visibleTabs.map(tab => (
										<TabItemComponent
											key={tab.id}
											tab={tab}
											isActive={pathname === tab.url}
											onContextMenu={handleContextMenu}
											variant='default'
										/>
									))}
								</div>
							</SortableContext>
						</DndContext>
					</div>

					{hiddenTabs.length > 0 && (
						<div className='shrink-0 border-l border-gray-200 bg-white h-full z-30'>
							<TabsDropdown
								hiddenTabs={hiddenTabs}
								activeTabUrl={pathname || ''}
								onContextMenu={handleContextMenu}
							/>
						</div>
					)}
				</div>
			</header>

			<main className='flex-1 p-6 overflow-auto'>
				<div className='max-w-7xl mx-auto bg-white rounded-lg shadow-sm min-h-[400px] p-6 border border-gray-200'>
					{children}
				</div>
			</main>
		</div>
	)
}
