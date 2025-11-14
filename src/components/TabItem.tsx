import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { clsx, type ClassValue } from 'clsx'
import { useRouter } from 'next/navigation'
import React, { CSSProperties } from 'react'
import { twMerge } from 'tailwind-merge'
import { TabItem } from '../types/tap.types'

function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

interface TabItemProps {
	tab: TabItem
	isActive: boolean
	onPinToggle: (id: string) => void
	style?: CSSProperties
	isOverlay?: boolean
	variant?: 'default' | 'dropdown' | 'ghost'
}

const TabItemComponent = React.forwardRef<HTMLDivElement, TabItemProps>(
	({ tab, isActive, onPinToggle, style, isOverlay, variant = 'default' }, ref) => {
		const router = useRouter()
		const isDropdown = variant === 'dropdown'
		const isGhost = variant === 'ghost'
		const enableDnd = variant === 'default'

		const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
			useSortable({
				id: tab.id,
				data: { type: 'TAB', tab },
				disabled: !enableDnd,
			})

		const dndStyle: React.CSSProperties = {
			transform: CSS.Translate.toString(transform),
			transition,
			...style,
		}

		const handleTabClick = () => {
			router.push(tab.url)
		}

		const finalRef = enableDnd ? setNodeRef : ref

		return (
			<div
				ref={finalRef}
				style={enableDnd ? dndStyle : style}
				{...(enableDnd ? attributes : {})}
				{...(enableDnd ? listeners : {})}
				onClick={handleTabClick}
				className={cn(
					'relative flex items-center h-full text-[14px] font-medium cursor-pointer select-none group whitespace-nowrap transition-colors',

					tab.isPinned && !isDropdown
						? 'w-[52px] justify-center px-0 shrink-0'
						: !isDropdown
						? 'px-5 min-w-[120px] max-w-60'
						: '',

					!isDropdown &&
						!isGhost &&
						(isActive
							? 'bg-[#F3F4F6] text-gray-900 z-10'
							: 'bg-white text-gray-500 hover:bg-[#F3F4F6] hover:text-gray-900'),

					isActive && isOverlay && 'bg-[#F3F4F6] shadow-xl opacity-90',
					isDragging && 'opacity-50 z-50 shadow-md',

					isDropdown &&
						'w-full h-10 hover:bg-gray-100 px-4 min-w-0 max-w-none text-gray-600 border-b border-gray-50',
					isGhost && 'opacity-0 pointer-events-none',
				)}
			>
				{!isDropdown && !isGhost && isActive && (
					<div className='absolute top-0 left-0 right-0 h-[3px] bg-blue-600 z-20' />
				)}

				{!isActive && !isDropdown && !isGhost && !isOverlay && (
					<div className='absolute right-0 top-1/2 -translate-y-1/2 h-4 w-px bg-gray-200 group-hover:hidden' />
				)}

				<span
					className={cn(
						'text-lg flex items-center justify-center',
						!tab.isPinned && 'mr-3',
						isDropdown && 'w-6',
					)}
				>
					{tab.icon}
				</span>

				{(!tab.isPinned || isDropdown) && (
					<span className='truncate leading-none pb-px'>{tab.title}</span>
				)}

				<button
					className={cn(
						'absolute transition-opacity text-gray-400 hover:text-gray-600',
						'opacity-0 group-hover:opacity-100',
						tab.isPinned && !isDropdown ? 'top-1 right-1 text-[10px]' : 'right-2',
						isDropdown && 'opacity-100 relative right-0 ml-auto',
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
	},
)

TabItemComponent.displayName = 'TabItemComponent'

export default TabItemComponent
