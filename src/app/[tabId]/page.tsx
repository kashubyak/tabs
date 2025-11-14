import TabsLayout from '@/components/TabsLayout'
import { initialTabs } from '@/data/initialTabs'

export async function generateStaticParams() {
	return initialTabs.map(tab => ({
		tabId: tab.url.replace('/', ''),
	}))
}

interface PageProps {
	params: {
		tabId: string
	}
}

export default function TabPage({ params }: PageProps) {
	const { tabId } = params

	return (
		<TabsLayout>
			<h2 className='text-2xl font-bold mb-4 text-zinc-800'>
				/{tabId ? decodeURIComponent(tabId) : 'Loading...'}
			</h2>
		</TabsLayout>
	)
}
