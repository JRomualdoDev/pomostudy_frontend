import { Routes } from '@angular/router';
import { LayoutDemoFullComponent } from './index';
import { ZardDemoTableSimpleComponent } from './task/task';

export const routes: Routes = [
    { 
        path: "index", 
        component: LayoutDemoFullComponent,
        title: "PomoStudy - Home",
        children: [
            {
                path: "task",
                component: ZardDemoTableSimpleComponent,
                title: "PomoStudy - Tasks"
            }
        ]
    },
    
];
