'use client'

import { memo, useEffect, useRef } from 'react'

interface ContextMenuProps {
	x: number
	y: number
	isPinned: boolean
	onClose: () => void
	onTogglePin: () => void
}

function ContextMenu({ x, y, isPinned, onClose, onTogglePin }: ContextMenuProps) {
	const menuRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				onClose()
			}
		}
		const handleScroll = () => onClose()
		window.addEventListener('mousedown', handleClickOutside)
		window.addEventListener('scroll', handleScroll, true)
		window.addEventListener('resize', handleScroll)
		return () => {
			window.removeEventListener('mousedown', handleClickOutside)
			window.removeEventListener('scroll', handleScroll, true)
			window.removeEventListener('resize', handleScroll)
		}
	}, [onClose])

	return (
		<div
			ref={menuRef}
			className='fixed z-50 bg-white rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-gray-100 py-1.5 min-w-40 animate-in fade-in zoom-in-95 duration-100 flex flex-col'
			style={{ top: y, left: x }}
		>
			<button
				onClick={e => {
					e.stopPropagation()
					onTogglePin()
				}}
				className='w-full text-left px-3 py-2 text-[13px] text-gray-700 hover:bg-gray-50 hover:text-black flex items-center gap-3 font-medium transition-colors'
			>
				<span className='text-base w-4 text-center'>{isPinned ? '❌' : '📌'}</span>
				{isPinned ? 'Відкріпити' : 'Закріпити'}
			</button>
		</div>
	)
}

export default memo(ContextMenu)
