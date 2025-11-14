import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useRouter } from 'next/navigation'
import React from 'react'
import { TabItem } from '../types/tap.types'

interface TabItemProps {
	tab: TabItem
	isActive: boolean
	onPinToggle: (id: string) => void
	style?: React.CSSProperties
}

const TabItemComponent: React.FC<TabItemProps> = ({
	tab,
	isActive,
	onPinToggle,
	style = {},
}) => {
	const router = useRouter()

	const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
		useSortable({ id: tab.id, disabled: tab.isPinned })

	const dndStyle: React.CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition,
		zIndex: isDragging ? 20 : isActive ? 10 : 1,
		cursor: tab.isPinned ? 'default' : 'grab',
		marginRight: '1px',
		...style,
	}

	const handleTabClick = () => {
		router.push(tab.url)
	}

	const classes = [
		'flex',
		'items-center',
		'h-10',
		'px-4',
		'text-sm',
		'font-normal',
		'cursor-pointer',
		'transition-all',
		'relative',
		'group',
		'min-w-0',
		tab.isPinned ? 'w-[40px] justify-center p-0' : 'max-w-[200px] pr-6',
		isActive
			? 'text-zinc-800 border-b-2 border-blue-600 bg-gray-100'
			: 'text-zinc-600 hover:text-zinc-800 hover:bg-gray-50',
		isDragging ? 'opacity-50 shadow-lg' : '',
	].join(' ')

	const PinIcon = tab.isPinned ? '🔒' : '📍'

	return (
		<div
			ref={setNodeRef}
			style={dndStyle}
			className={classes}
			onClick={handleTabClick}
			{...attributes}
			{...listeners}
		>
			<span className={tab.isPinned ? 'text-lg' : 'mr-2 text-lg'}>{tab.icon}</span>

			{!tab.isPinned && <span className='truncate'>{tab.title}</span>}

			<div className='absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity'>
				<button
					className='text-gray-400 hover:text-zinc-700 text-xs'
					onClick={e => {
						e.stopPropagation()
						onPinToggle(tab.id)
					}}
					title={tab.isPinned ? 'Unpin' : 'Pin'}
				>
					{PinIcon}
				</button>
			</div>
		</div>
	)
}

export default TabItemComponent
