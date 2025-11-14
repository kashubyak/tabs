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
import React, { useEffect, useState } from 'react'

import { initialTabs } from '../data/initialTabs'
import { TabItem } from '../types/tap.types'
import TabItemComponent from './TabItem'

const LOCAL_STORAGE_KEY = 'tabs-order-state'

interface TabsLayoutProps {
	children: React.ReactNode
}

export default function TabsLayout({ children }: TabsLayoutProps) {
	const pathname = usePathname()
	const [tabs, setTabs] = useState<TabItem[]>(initialTabs)
	const [mounted, setMounted] = useState(false)

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
			<header className='bg-white border-b border-gray-300 shadow-sm z-20'>
				<div className='flex items-center w-full'>
					<div className='flex-1 overflow-hidden pl-2'>
						<DndContext
							sensors={sensors}
							collisionDetection={closestCenter}
							onDragEnd={handleDragEnd}
						>
							<SortableContext
								items={tabs.map(t => t.id)}
								strategy={horizontalListSortingStrategy}
							>
								<div className='flex h-full items-end'>
									{tabs.map(tab => (
										<TabItemComponent
											key={tab.id}
											tab={tab}
											isActive={pathname === tab.url}
											onPinToggle={handlePinToggle}
										/>
									))}
								</div>
							</SortableContext>
						</DndContext>
					</div>

					<div className='flex items-center justify-center px-3 border-l border-gray-200 h-12 cursor-pointer hover:bg-gray-50 shrink-0 z-30 bg-white'>
						<span className='text-gray-500'>🔽</span>
					</div>
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
