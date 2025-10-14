import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  template: `<router-outlet></router-outlet>`,
  styleUrls: ['./app.css'],
  imports: [RouterOutlet],
})
export class App {
  protected readonly title = signal('PomoStudy');
}