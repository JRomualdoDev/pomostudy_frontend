import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { ZardButtonComponent } from '../shared/components/button/button.component';
import { ContentComponent } from '../shared/components/layout/content.component';
import { FooterComponent } from '../shared/components/layout/footer.component';
import { HeaderComponent } from '../shared/components/layout/header.component';
import { LayoutComponent } from '../shared/components/layout/layout.component';
import { SidebarComponent, SidebarGroupComponent, SidebarGroupLabelComponent } from '../shared/components/layout/sidebar.component';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { DarkModeService } from '@shared/services/darkmode.service';

@Component({
	selector: 'app-dashboard',
	standalone: true,
	imports: [
        CommonModule,
        LayoutComponent,
        HeaderComponent,
        ContentComponent,
        FooterComponent,
        SidebarComponent,
        SidebarGroupComponent,
        SidebarGroupLabelComponent,
        ZardButtonComponent,
        RouterOutlet
    ],
	templateUrl: './dashboard.html',
    styleUrls: ['./dashboard.css']
})
export class DashboardComponent {
    year = new Date().getFullYear();
    selectedMenu = 'dashboard';

    private readonly darkmodeService = inject(DarkModeService);

    constructor(
        private router: Router,
        private authService: AuthService
    ) {
       
        const url = this.router.url;
        if (url.includes('/dashboard/task')) this.selectedMenu = 'task';
        else if (url.includes('/dashboard/category')) this.selectedMenu = 'category';
        else if (url.includes('/dashboard/goals')) this.selectedMenu = 'goals';
        else this.selectedMenu = 'dashboard';
    }

    toggleTheme(): void {
        this.darkmodeService.toggleTheme();
    }

    getCurrentTheme(): 'light' | 'dark' {
        return this.darkmodeService.getCurrentTheme();
    }

    selectMenu(menu: string) {
        this.selectedMenu = menu;
    }

    navigate(path: string) {
        this.router.navigate([path]);
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}
