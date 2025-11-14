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
					'relative flex items-center h-12 text-sm font-medium transition-colors cursor-pointer border-r border-gray-200 select-none group bg-white whitespace-nowrap',
					tab.isPinned && !isDropdown ? 'w-[50px] justify-center px-0 shrink-0' : '',
					!tab.isPinned && !isDropdown ? 'px-4 min-w-[120px] max-w-[200px]' : '',
					isActive && !isOverlay && 'bg-gray-50',
					isActive && isOverlay && 'bg-white shadow-xl opacity-90',
					isDragging && 'opacity-50 z-50 shadow-md',
					isDropdown && 'w-full border-0 hover:bg-gray-50 px-4 min-w-0 max-w-none',
					isGhost && 'opacity-0 pointer-events-none',
				)}
			>
				{isActive && !isDropdown && !isGhost && (
					<div className='absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 z-10' />
				)}

				<span className={cn('text-lg', !tab.isPinned && 'mr-2')}>{tab.icon}</span>

				{(!tab.isPinned || isDropdown) && (
					<span className='truncate text-gray-700 group-hover:text-black'>
						{tab.title}
					</span>
				)}

				<button
					className={cn(
						'absolute opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600',
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
