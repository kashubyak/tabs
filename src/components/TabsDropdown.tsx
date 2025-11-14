import { useEffect, useRef, useState } from 'react'
import { TabItem } from '../types/tap.types'
import TabItemComponent from './TabItem'

interface TabsDropdownProps {
	hiddenTabs: TabItem[]
	activeTabUrl: string
	onPinToggle: (id: string) => void
}

export default function TabsDropdown({
	hiddenTabs,
	activeTabUrl,
	onPinToggle,
}: TabsDropdownProps) {
	const [isOpen, setIsOpen] = useState(false)
	const menuRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setIsOpen(false)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	if (hiddenTabs.length === 0) return null

	const isHiddenTabActive = hiddenTabs.some(t => t.url === activeTabUrl)

	return (
		<div className='relative flex items-center z-30 bg-white' ref={menuRef}>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className={`flex items-center justify-center w-12 h-12 border-l border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
					isHiddenTabActive ? 'text-blue-600 bg-blue-50' : 'text-gray-500'
				}`}
			>
				{isOpen ? '🔼' : '🔽'}
				<span className='absolute top-2 right-2 text-[10px] bg-gray-200 rounded-full px-1 min-w-3.5 text-center font-bold text-gray-600'>
					{hiddenTabs.length}
				</span>
			</button>

			{isOpen && (
				<div className='absolute top-full right-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 overflow-hidden z-50 flex flex-col'>
					<div className='px-4 py-2 text-xs font-semibold text-gray-400 uppercase'>
						More tabs
					</div>
					<div className='max-h-[80vh] overflow-y-auto'>
						{hiddenTabs.map(tab => (
							<TabItemComponent
								key={tab.id}
								tab={tab}
								isActive={tab.url === activeTabUrl}
								onPinToggle={onPinToggle}
								variant='dropdown'
							/>
						))}
					</div>
				</div>
			)}
		</div>
	)
}
