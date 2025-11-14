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

const LOCAL_STORAGE_KEY = 'tabs-order-state'
const MORE_BUTTON_WIDTH = 50

interface TabsLayoutProps {
	children: React.ReactNode
}

export default function TabsLayout({ children }: TabsLayoutProps) {
	const pathname = usePathname()
	const [tabs, setTabs] = useState<TabItem[]>(initialTabs)
	const [mounted, setMounted] = useState(false)

	const [visibleTabs, setVisibleTabs] = useState<TabItem[]>([])
	const [hiddenTabs, setHiddenTabs] = useState<TabItem[]>([])

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
				console.error('Failed to parse tabs state', e)
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
				const width = ghostNodes[index]?.getBoundingClientRect().width || 120
				totalTabsWidth += width
				return { ...tab, width }
			})

			if (totalTabsWidth <= containerWidth) {
				setVisibleTabs(tabs)
				setHiddenTabs([])
				return
			}

			const availableWidth = containerWidth - MORE_BUTTON_WIDTH
			let currentWidth = 0
			const newVisible: TabItem[] = []
			const newHidden: TabItem[] = []

			tabsWithWidth.forEach(tab => {
				if (tab.isPinned) {
					newVisible.push(tab)
					currentWidth += tab.width
				} else {
					if (currentWidth < availableWidth) {
						newVisible.push(tab)
						currentWidth += tab.width

						if (currentWidth > availableWidth) {
							newHidden.push(tab)
						}
					} else {
						newHidden.push(tab)
					}
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
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 5,
			},
		}),
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
				if (tab.id === id) {
					return { ...tab, isPinned: !tab.isPinned }
				}
				return tab
			})
			return newTabs.sort((a, b) => {
				if (a.isPinned === b.isPinned) return 0
				return a.isPinned ? -1 : 1
			})
		})
	}

	if (!mounted) return null

	return (
		<div className='flex flex-col h-screen bg-gray-50'>
			<div className='fixed top-0 left-0 w-0 h-0 overflow-hidden invisible pointer-events-none'>
				<div ref={ghostContainerRef} className='flex' style={{ width: 'max-content' }}>
					{tabs.map(tab => (
						<TabItemComponent
							key={tab.id}
							tab={tab}
							isActive={false}
							onPinToggle={() => {}}
							variant='ghost'
						/>
					))}
				</div>
			</div>

			<header className='bg-white border-b border-gray-300 shadow-sm z-20'>
				<div className='flex items-center w-full justify-between' ref={containerRef}>
					<div className='flex-1 flex items-end overflow-hidden pl-2 h-full relative flex-nowrap'>
						<DndContext
							sensors={sensors}
							collisionDetection={closestCenter}
							onDragEnd={handleDragEnd}
						>
							<SortableContext
								items={visibleTabs.map(t => t.id)}
								strategy={horizontalListSortingStrategy}
							>
								<div className='flex h-full items-end w-full flex-nowrap'>
									{visibleTabs.map(tab => (
										<TabItemComponent
											key={tab.id}
											tab={tab}
											isActive={pathname === tab.url}
											onPinToggle={handlePinToggle}
											variant='default'
										/>
									))}
								</div>
							</SortableContext>
						</DndContext>
					</div>

					{hiddenTabs.length > 0 && (
						<div className='shrink-0 border-l border-gray-200 bg-white z-30'>
							<TabsDropdown
								hiddenTabs={hiddenTabs}
								activeTabUrl={pathname || ''}
								onPinToggle={handlePinToggle}
							/>
						</div>
					)}
				</div>
			</header>

			<main className='flex-1 p-6 overflow-auto bg-[#F3F4F6]'>
				<div className='max-w-7xl mx-auto bg-white rounded-lg shadow-sm min-h-[400px] p-6 border border-gray-200'>
					{children}
				</div>
			</main>
		</div>
	)
}
