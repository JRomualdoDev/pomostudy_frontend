import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ZardButtonComponent } from '../shared/components/button/button.component';
import { ZardSkeletonComponent } from '../shared/components/skeleton/skeleton.component';
import { ContentComponent } from '../shared/components/layout/content.component';
import { FooterComponent } from '../shared/components/layout/footer.component';
import { HeaderComponent } from '../shared/components/layout/header.component';
import { LayoutComponent } from '../shared/components/layout/layout.component';
import { SidebarComponent, SidebarGroupComponent, SidebarGroupLabelComponent } from '../shared/components/layout/sidebar.component';
import { RouterLink, RouterOutlet } from '@angular/router';

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
        ZardSkeletonComponent,
        RouterLink,
        RouterOutlet
    ],
	templateUrl: './dashboard.html',
    styleUrls: ['./dashboard.css']
})
export class DashboardComponent {
    year = new Date().getFullYear();
}
