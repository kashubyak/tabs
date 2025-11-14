import { TabItem } from '../types/tap.types'

export const initialTabs: TabItem[] = [
	{
		id: 'Lagerverwaltung',
		title: 'Lagerverwaltung',
		url: '/Lagerverwaltung',
		icon: '📦',
		isPinned: true,
	},
	{
		id: 'dashboard',
		title: 'Dashboard',
		url: '/dashboard',
		icon: '🏠',
		isPinned: true,
	},
	{
		id: 'banking',
		title: 'Banking',
		url: '/banking',
		icon: '🏦',
		isPinned: false,
	},
	{
		id: 'telefonia',
		title: 'Telefonia',
		url: '/telefonia',
		icon: '📞',
		isPinned: false,
	},
	{
		id: 'accounting',
		title: 'Accounting',
		url: '/accounting',
		icon: '📊',
		isPinned: false,
	},
	{
		id: 'verkauf',
		title: 'Verkauf',
		url: '/verkauf',
		icon: '🛒',
		isPinned: false,
	},
	{
		id: 'statistik',
		title: 'Statistik',
		url: '/statistik',
		icon: '📈',
		isPinned: false,
	},
	{
		id: 'postOffice',
		title: 'Post Office',
		url: '/postOffice',
		icon: '✉️',
		isPinned: false,
	},
	{
		id: 'administration',
		title: 'Administration',
		url: '/administration',
		icon: '⚙️',
		isPinned: false,
	},
	{ id: 'help', title: 'Help', url: '/help', icon: '❓', isPinned: false },
]
