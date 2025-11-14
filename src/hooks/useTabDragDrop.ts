import {
	DragEndEvent,
	DragStartEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useCallback, useState } from 'react'
import { TabItem } from '../types/tap.types'

export function useTabDragDrop(
	setTabs: React.Dispatch<React.SetStateAction<TabItem[]>>,
	onDragEndCallback?: () => void,
) {
	const [activeId, setActiveId] = useState<string | null>(null)
	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
		useSensor(KeyboardSensor),
	)

	const handleDragStart = useCallback(
		(event: DragStartEvent) => setActiveId(event.active.id as string),
		[],
	)

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			const { active, over } = event

			if (over && active.id !== over.id) {
				setTabs(items => {
					const oldIndex = items.findIndex(item => item.id === active.id)
					const newIndex = items.findIndex(item => item.id === over.id)
					return arrayMove(items, oldIndex, newIndex)
				})
			}

			setActiveId(null)
			if (onDragEndCallback) setTimeout(onDragEndCallback, 100)
		},
		[setTabs, onDragEndCallback],
	)

	return {
		activeId,
		sensors,
		handleDragStart,
		handleDragEnd,
	}
}
