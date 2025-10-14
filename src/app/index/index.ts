
import { Component } from '@angular/core';
 
import { ZardButtonComponent } from '../shared/components/button/button.component';
import { ZardSkeletonComponent } from '../shared/components/skeleton/skeleton.component';
import { ContentComponent } from '../shared/components/layout/content.component';
import { FooterComponent } from '../shared/components/layout/footer.component';
import { HeaderComponent } from '../shared/components/layout/header.component';
import { LayoutComponent } from '../shared/components/layout/layout.component';
import { SidebarComponent, SidebarGroupComponent, SidebarGroupLabelComponent } from '../shared/components/layout/sidebar.component';
import { RouterLink, RouterOutlet } from '@angular/router';
 
@Component({
  selector: 'z-demo-layout-full',
  // standalone: true,
  imports: [
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
  template: `
    <!-- Fazer o layout ocupar toda a altura da viewport -->
    <z-layout class="h-screen flex flex-col">
      <z-header>
        <div class="flex items-center justify-between w-full">
          <div class="font-semibold text-lg flex items-center">
            <img src="pomostudy.svg" alt="Logo" width="32" height="32" />
            <span class="ml-2">PomoStudy</span>
          </div>
          <div class="flex items-center gap-2">
            <button z-button zType="ghost" zSize="sm">
              <i class="icon-search"></i>
            </button>
            <button z-button zType="ghost" zSize="sm">
              <i class="icon-bell"></i>
            </button>
          </div>
        </div>
      </z-header>
 
      <!-- Conteúdo principal ocupa o restante da tela -->
      <z-layout class="flex-1 flex min-h-0">
        <z-sidebar [zWidth]="200" class="!p-0 h-full">
          <nav class="flex flex-col h-full gap-2 p-4">
            <z-sidebar-group>
              <z-sidebar-group-label>Menu</z-sidebar-group-label>
              <button z-button zType="secondary" class="justify-start">
                <i class="icon-house mr-2"></i>
                <a routerLink="/index">Dashboard</a>
              </button>
              <button z-button zType="ghost" class="justify-start">
                <i class="icon-layers mr-2"></i>
                <a routerLink="task">Tasks</a>              
              </button>
              <button z-button zType="ghost" class="justify-start">
                <i class="icon-users mr-2"></i>
                Categories
              </button>
              <button z-button zType="ghost" class="justify-start">
                <i class="icon-calendar mr-2"></i>
                Goals
              </button>
            </z-sidebar-group>
          </nav>
        </z-sidebar>
 
        <!-- Área de conteúdo principal (direita) -->
        <z-layout class="flex-1 flex flex-col min-h-0">
          <z-content class="flex-1 overflow-auto min-h-0">
            <div class="space-y-4 m-6 p-6">
              <!-- <z-skeleton class="h-170 w-full"></z-skeleton> -->
              <router-outlet class="flex-1 min-h-0"></router-outlet>
            </div>
          </z-content>
 
          <z-footer class="flex-none">
            <div class="flex items-center justify-center w-full text-sm text-muted-foreground">© {{ year }} PomoStudy</div>
          </z-footer>
        </z-layout>
      </z-layout>
    </z-layout>
  `,
})
export class LayoutDemoFullComponent {
  year = new Date().getFullYear();
}