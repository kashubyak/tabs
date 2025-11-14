import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { clsx, type ClassValue } from 'clsx'
import { useRouter } from 'next/navigation'
import React from 'react'
import { twMerge } from 'tailwind-merge'
import { TabItem } from '../types/tap.types'

function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

interface TabItemProps {
	tab: TabItem
	isActive: boolean
	onPinToggle: (id: string) => void
}

const TabItemComponent: React.FC<TabItemProps> = ({ tab, isActive, onPinToggle }) => {
	const router = useRouter()

	const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
		useSortable({ id: tab.id, data: { type: 'TAB', tab } })

	const style: React.CSSProperties = {
		transform: CSS.Translate.toString(transform),
		transition,
	}

	const handleTabClick = () => {
		router.push(tab.url)
	}

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			onClick={handleTabClick}
			className={cn(
				'relative flex items-center h-12 text-sm font-medium transition-colors cursor-pointer border-r border-gray-200 select-none group bg-white',
				tab.isPinned
					? 'w-[50px] justify-center px-0 shrink-0'
					: 'px-4 min-w-[120px] max-w-[200px]',
				isActive && 'bg-gray-50',
				isDragging && 'opacity-50 z-50 shadow-md',
			)}
		>
			{isActive && (
				<div className='absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 z-10' />
			)}

			<span className={cn('text-lg', !tab.isPinned && 'mr-2')}>{tab.icon}</span>

			{!tab.isPinned && (
				<span className='truncate text-gray-700 group-hover:text-black'>{tab.title}</span>
			)}

			<button
				className={cn(
					'absolute opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600',
					tab.isPinned ? 'top-1 right-1 text-[10px]' : 'right-2',
				)}
				onClick={e => {
					e.stopPropagation()
					onPinToggle(tab.id)
				}}
				title={tab.isPinned ? 'Unpin' : 'Pin'}
			>
				{tab.isPinned ? '❌' : '📌'}
			</button>
		</div>
	)
}

export default TabItemComponent
