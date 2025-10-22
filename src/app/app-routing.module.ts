import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DailyComponent } from './daily/daily.component';

const routes: Routes = [
  // ...existing routes
  { path: 'daily', component: DailyComponent },
  // ...existing routes
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }