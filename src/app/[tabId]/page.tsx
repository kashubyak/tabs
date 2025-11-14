'use client'

import TabsLayout from '@/components/TabsLayout'
import { useParams } from 'next/navigation'

export default function TabPage() {
	const params = useParams()

	const tabId = Array.isArray(params.tabId) ? params.tabId[0] : params.tabId

	return (
		<TabsLayout>
			<h2 className='text-2xl font-bold mb-4 text-zinc-800'>
				Content for /{tabId ? decodeURIComponent(tabId) : 'Loading...'}
			</h2>
			<p className='text-gray-600'>
				Тут буде відображено вміст активного таба. Наприклад, логіка `Logenverwaltung`.
			</p>
		</TabsLayout>
	)
}
