import { Routes } from '@angular/router';

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
                path: 'task',
                loadComponent: () => import('./task/task.component').then(m => m.ZardDemoTableSimpleComponent),
                title: 'PomoStudy - Tasks'
            }
        ]
	},
	{
		path: '**',
		redirectTo: 'login'
	}
];
