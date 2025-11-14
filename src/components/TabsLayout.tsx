'use client'

import {
	closestCenter,
	DndContext,
	DragEndEvent,
	DragOverlay,
	DragStartEvent,
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
import { usePathname, useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { initialTabs } from '../data/initialTabs'
import { TabItem } from '../types/tap.types'
import TabItemComponent from './TabItem'
import TabsDropdown from './TabsDropdown'
import ContextMenu from './ui/ContextMenu'

const LOCAL_STORAGE_KEY = 'tabs-order-state'

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
	const router = useRouter()
	const [tabs, setTabs] = useState<TabItem[]>(initialTabs)
	const [mounted, setMounted] = useState(false)

	const [overflowTabs, setOverflowTabs] = useState<TabItem[]>([])

	const [activeId, setActiveId] = useState<string | null>(null)
	const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)

	const containerRef = useRef<HTMLDivElement>(null)
	const scrollContainerRef = useRef<HTMLDivElement>(null)
	const ghostContainerRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
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
		setOverflowTabs(newOverflowTabs)
	}, [tabs])

	useLayoutEffect(() => {
		if (!mounted) return

		setTimeout(updateOverflow, 0)

		const resizeObserver = new ResizeObserver(() => {
			requestAnimationFrame(updateOverflow)
		})

		if (containerRef.current) {
			resizeObserver.observe(containerRef.current)
		}

		return () => resizeObserver.disconnect()
	}, [mounted, updateOverflow])

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
		useSensor(KeyboardSensor),
	)

	const handleDragStart = (event: DragStartEvent) => {
		setActiveId(event.active.id as string)
	}

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event
		if (over && active.id !== over.id) {
			setTabs(items => {
				const oldIndex = items.findIndex(item => item.id === active.id)
				const newIndex = items.findIndex(item => item.id === over.id)
				return arrayMove(items, oldIndex, newIndex)
			})
		}
		setActiveId(null)
		setTimeout(updateOverflow, 100)
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

	const handleCloseTab = (id: string) => {
		const tabToClose = tabs.find(t => t.id === id)
		const isActive = tabToClose?.url === pathname

		const newTabs = tabs.filter(t => t.id !== id)
		setTabs(newTabs)

		if (isActive && newTabs.length > 0) {
			const nextTab = newTabs[newTabs.length - 1]
			router.push(nextTab.url)
		}
		setTimeout(updateOverflow, 0)
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

	const handleWheel = (e: React.WheelEvent) => {
		if (scrollContainerRef.current) {
			if (e.deltaY !== 0) {
				scrollContainerRef.current.scrollLeft += e.deltaY
			}
		}
	}

	const activeTab = activeId ? tabs.find(t => t.id === activeId) : null

	if (!mounted) return null

	const scrollbarStyles = `
    .tab-scrollbar::-webkit-scrollbar {
      height: 3px;
    }
    .tab-scrollbar::-webkit-scrollbar-track {
      background: transparent;
      margin: 0 10px;
    }
    .tab-scrollbar::-webkit-scrollbar-thumb {
      background: #D1D5DB;
      border-radius: 10px;
    }
    .tab-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #9CA3AF;
    }
    .tab-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: #D1D5DB transparent;
    }
  `

	return (
		<div className='flex flex-col h-screen bg-[#F9FAFB]'>
			<style>{scrollbarStyles}</style>

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
							onClose={() => {}}
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
					<div
						ref={scrollContainerRef}
						className='flex-1 flex h-full overflow-x-auto overflow-y-hidden pl-0 relative flex-nowrap tab-scrollbar pb-3.5'
						onWheel={handleWheel}
						onScroll={updateOverflow}
					>
						<DndContext
							sensors={sensors}
							collisionDetection={closestCenter}
							onDragStart={handleDragStart}
							onDragEnd={handleDragEnd}
						>
							<SortableContext
								items={tabs.map(t => t.id)}
								strategy={horizontalListSortingStrategy}
							>
								<div className='flex h-full min-w-full flex-nowrap'>
									{tabs.map(tab => (
										<TabItemComponent
											key={tab.id}
											tab={tab}
											isActive={pathname === tab.url}
											onContextMenu={handleContextMenu}
											onClose={() => handleCloseTab(tab.id)}
											variant='default'
										/>
									))}
								</div>
							</SortableContext>

							{typeof document !== 'undefined' &&
								createPortal(
									<DragOverlay adjustScale={false} zIndex={50}>
										{activeTab ? (
											<TabItemComponent
												tab={activeTab}
												isActive={pathname === activeTab.url}
												onContextMenu={() => {}}
												onClose={() => {}}
												variant='default'
												isOverlay
											/>
										) : null}
									</DragOverlay>,
									document.body,
								)}
						</DndContext>
					</div>

					{overflowTabs.length > 0 && (
						<div className='shrink-0 border-l border-gray-200 bg-white h-full z-30 shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.05)]'>
							<TabsDropdown
								overflowTabs={overflowTabs}
								activeTabUrl={pathname || ''}
								onContextMenu={handleContextMenu}
								onCloseTab={handleCloseTab}
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
