'use client'

import { closestCenter, DndContext, DragOverlay } from '@dnd-kit/core'
import { horizontalListSortingStrategy, SortableContext } from '@dnd-kit/sortable'
import { usePathname } from 'next/navigation'
import React from 'react'
import { createPortal } from 'react-dom'

import { useContextMenu } from '../hooks/useContextMenu'
import { useTabDragDrop } from '../hooks/useTabDragDrop'
import { useTabOverflow } from '../hooks/useTabOverflow'
import { useTabs } from '../hooks/useTabs'

import TabItemComponent from './TabItem'
import TabsDropdown from './TabsDropdown'
import ContextMenu from './ui/ContextMenu'

export default function TabsLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname()

	const { tabs, setTabs, handlePinToggle, handleCloseTab, mounted } = useTabs()

	const {
		visibleTabs,
		overflowTabs,
		containerRef,
		scrollContainerRef,
		updateOverflow,
		handleWheel,
	} = useTabOverflow(tabs, mounted)

	const { activeId, sensors, handleDragStart, handleDragEnd } = useTabDragDrop(
		setTabs,
		updateOverflow,
	)

	const { contextMenu, handleContextMenu, closeContextMenu } = useContextMenu()

	const activeTab = activeId ? tabs.find(t => t.id === activeId) : null

	if (!mounted) return null

	const scrollbarStyles = `
    .tab-scrollbar::-webkit-scrollbar { height: 3px; }
    .tab-scrollbar::-webkit-scrollbar-track { background: transparent; margin: 0 10px; }
    .tab-scrollbar::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 10px; }
    .tab-scrollbar::-webkit-scrollbar-thumb:hover { background: #9CA3AF; }
    .tab-scrollbar { scrollbar-width: thin; scrollbar-color: #D1D5DB transparent; }
  `

	return (
		<div className='flex flex-col h-screen bg-[#F9FAFB]'>
			<style>{scrollbarStyles}</style>

			{contextMenu && (
				<ContextMenu
					x={contextMenu.x}
					y={contextMenu.y}
					isPinned={contextMenu.isPinned}
					onClose={closeContextMenu}
					onTogglePin={() => {
						handlePinToggle(contextMenu.tabId)
						closeContextMenu()
					}}
				/>
			)}

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
								items={visibleTabs.map(t => t.id)}
								strategy={horizontalListSortingStrategy}
							>
								<div className='flex h-full min-w-full flex-nowrap'>
									{visibleTabs.map(tab => (
										<TabItemComponent
											key={tab.id}
											tab={tab}
											isActive={pathname === tab.url}
											onContextMenu={handleContextMenu}
											onClose={() => {
												handleCloseTab(tab.id)
												setTimeout(updateOverflow, 0)
											}}
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
								onCloseTab={id => {
									handleCloseTab(id)
									setTimeout(updateOverflow, 0)
								}}
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
