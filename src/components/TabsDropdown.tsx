import { useEffect, useRef, useState } from 'react'
import { TabItem } from '../types/tap.types'
import TabItemComponent from './TabItem'

interface TabsDropdownProps {
	overflowTabs: TabItem[]
	activeTabUrl: string
	onContextMenu: (e: React.MouseEvent, tab: TabItem) => void
	onCloseTab: (id: string) => void
}

export default function TabsDropdown({
	overflowTabs,
	activeTabUrl,
	onContextMenu,
	onCloseTab,
}: TabsDropdownProps) {
	const [isOpen, setIsOpen] = useState(false)
	const menuRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node))
				setIsOpen(false)
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	if (overflowTabs.length === 0) return null

	const isHiddenTabActive = overflowTabs.some(t => t.url === activeTabUrl)

	return (
		<div className='relative h-full flex items-center z-30' ref={menuRef}>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className={`relative flex items-center justify-center w-[50px] h-full border-l transition-colors duration-200 ${
					isOpen
						? 'bg-blue-600 text-white border-blue-600'
						: isHiddenTabActive
						? 'bg-blue-50 text-blue-600 border-gray-200'
						: 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
				}`}
			>
				<svg
					width='20'
					height='20'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='2'
					strokeLinecap='round'
					strokeLinejoin='round'
					className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
				>
					<path d='m6 9 6 6 6-6' />
				</svg>

				{!isOpen && (
					<span className='absolute top-2 right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-gray-200 px-1 text-[10px] font-bold text-gray-600'>
						{overflowTabs.length}
					</span>
				)}
			</button>

			{isOpen && (
				<div className='absolute top-full right-0 w-64 bg-white shadow-xl border border-gray-200 border-t-0 z-50 flex flex-col'>
					<div className='max-h-[80vh] overflow-y-auto'>
						{overflowTabs.map(tab => (
							<TabItemComponent
								key={tab.id}
								tab={tab}
								isActive={tab.url === activeTabUrl}
								onContextMenu={onContextMenu}
								onClose={() => onCloseTab(tab.id)}
								variant='dropdown'
							/>
						))}
					</div>
				</div>
			)}
		</div>
	)
}
