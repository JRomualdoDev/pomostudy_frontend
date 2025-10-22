import { Routes } from '@angular/router';
import { ZardDemoGoalTableComponent } from './goal/goal.component';
import { IndexTaskFormComponent } from './index/index.component';

export const routes: Routes = [
	{
		path: '',
		redirectTo: 'login',
		pathMatch: 'full'
	},
	{
		path: 'login',
		loadComponent: () =>
			import('./auth/login.component').then(m => m.LoginComponent),
		title: 'PomoStudy - Login'
	},
	{
		path: 'dashboard',
		loadComponent: () =>
			import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
			title: 'PomoStudy - Dashboard',
			children: [
				{
					path: 'index',
					loadComponent: () => import('./index/index.component').then(m => m.IndexTaskFormComponent),
					title: 'PomoStudy - Dashboard'
				},
				{
					path: 'daily',
					loadComponent: () => import('./daily/daily.component').then(m => m.DailyComponent),
					title: 'PomoStudy - Daily'
				},
				{
					path: 'task',
					loadComponent: () => import('./task/task.component').then(m => m.ZardDemoTableSimpleComponent),
					title: 'PomoStudy - Tasks'
				},
				{
					path: 'category',
					loadComponent: () => import('./category/category.component').then(m => m.ZardDemoCategoryTableComponent),
					title: 'PomoStudy - Categories'
				},
				{
					path: 'goals',
					component: ZardDemoGoalTableComponent
				},
			]
	},
	{
		path: 'index',
		component: IndexTaskFormComponent
	},
	{
		path: '**',
		redirectTo: 'login'
	}
];
