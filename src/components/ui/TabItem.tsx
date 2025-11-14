import { TabItem } from '@/types/tap.types'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { clsx, type ClassValue } from 'clsx'
import { useRouter } from 'next/navigation'
import React, { CSSProperties, memo } from 'react'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

interface TabItemProps {
	tab: TabItem
	isActive: boolean
	onContextMenu: (e: React.MouseEvent, tab: TabItem) => void
	onClose: () => void
	style?: CSSProperties
	isOverlay?: boolean
	variant?: 'default' | 'dropdown' | 'ghost'
}

const TabItemComponent = React.forwardRef<HTMLDivElement, TabItemProps>(
	(
		{ tab, isActive, onContextMenu, onClose, style, isOverlay, variant = 'default' },
		ref,
	) => {
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
			transform: isOverlay ? undefined : CSS.Translate.toString(transform),
			transition: isOverlay ? undefined : transition,
			...style,
		}

		const handleTabClick = () => router.push(tab.url)

		const handleContextMenu = (e: React.MouseEvent) => {
			e.preventDefault()
			onContextMenu(e, tab)
		}

		const handleClose = (e: React.MouseEvent) => {
			e.stopPropagation()
			onClose()
		}

		const handleAuxClick = (e: React.MouseEvent) => {
			if (e.button === 1) {
				e.stopPropagation()
				e.preventDefault()
				onClose()
			}
		}

		const finalRef = enableDnd ? setNodeRef : ref

		return (
			<div
				ref={finalRef}
				data-tab-id={tab.id}
				style={enableDnd ? dndStyle : style}
				{...(enableDnd ? attributes : {})}
				{...(enableDnd ? listeners : {})}
				onClick={handleTabClick}
				onAuxClick={handleAuxClick}
				onContextMenu={handleContextMenu}
				className={cn(
					'relative flex items-center h-full text-[14px] font-medium cursor-pointer select-none group whitespace-nowrap transition-colors shrink-0 tab-item-node',

					tab.isPinned && !isDropdown
						? 'w-[50px] justify-center px-0'
						: !isDropdown
						? 'px-4'
						: '',

					isOverlay &&
						'bg-[#4B5563] text-white shadow-xl z-50 opacity-100 border-none rounded-sm',

					!isOverlay && isDragging && 'opacity-0',

					!isOverlay &&
						!isDragging &&
						!isDropdown &&
						!isGhost &&
						(isActive
							? 'bg-[#F3F4F6] text-gray-900 z-10'
							: 'bg-white text-gray-500 hover:bg-[#F3F4F6] hover:text-gray-900'),

					isDropdown &&
						'w-full h-10 hover:bg-gray-100 px-4 min-w-0 max-w-none text-gray-600 border-b border-gray-50 shrink',

					isGhost && 'opacity-0 pointer-events-none',
				)}
			>
				{!isDropdown && !isGhost && isActive && !isOverlay && (
					<div className='absolute top-0 left-0 right-0 h-[3px] bg-blue-600 z-20' />
				)}
				{!isActive && !isDropdown && !isGhost && !isOverlay && !isDragging && (
					<div className='absolute right-0 top-1/2 -translate-y-1/2 h-4 w-px bg-gray-200 group-hover:hidden' />
				)}

				<span
					className={cn(
						'text-lg flex items-center justify-center',
						!tab.isPinned && 'mr-2',
						isDropdown && 'w-6',
					)}
				>
					{tab.icon}
				</span>

				{(!tab.isPinned || isDropdown) && (
					<span
						className={cn('truncate leading-none pb-px block', !isDropdown && 'pr-6')}
					>
						{tab.title}
					</span>
				)}

				{!isGhost && !isOverlay && (
					<div
						className={cn(
							'flex items-center justify-center transition-all z-30',
							!isDropdown &&
								'absolute right-0 top-0 bottom-0 w-8 opacity-0 group-hover:opacity-100 pr-2 justify-end bg-linear-to-l to-transparent',
							!isDropdown &&
								(isActive ? 'from-[#F3F4F6] ' : 'from-white group-hover:from-[#F3F4F6]'),
							isDropdown && 'relative ml-auto w-5 h-5 bg-transparent',
						)}
					>
						<button
							onClick={handleClose}
							className={cn(
								'flex items-center justify-center transition-colors',
								!isDropdown &&
									'w-4 h-4 rounded-full bg-[#EF4444] text-white hover:bg-red-600 shadow-sm',
								isDropdown && 'w-full h-full text-gray-400 hover:text-gray-600',
							)}
						>
							{isDropdown ? (
								<svg
									width='16'
									height='16'
									viewBox='0 0 24 24'
									fill='none'
									stroke='currentColor'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'
								>
									<circle cx='12' cy='12' r='10' className='fill-gray-200 stroke-none' />
									<path d='m15 9-6 6' stroke='white' />
									<path d='m9 9 6 6' stroke='white' />
								</svg>
							) : (
								<svg
									width='8'
									height='8'
									viewBox='0 0 24 24'
									fill='none'
									stroke='currentColor'
									strokeWidth='4'
									strokeLinecap='round'
									strokeLinejoin='round'
								>
									<path d='M18 6 6 18' />
									<path d='m6 6 12 12' />
								</svg>
							)}
						</button>
					</div>
				)}
			</div>
		)
	},
)

TabItemComponent.displayName = 'TabItemComponent'

export default memo(TabItemComponent)
