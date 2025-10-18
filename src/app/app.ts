import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DarkModeService } from '@shared/services/darkmode.service';

@Component({
  selector: 'app-root',
  template: `<router-outlet></router-outlet>`,
  styleUrls: ['./app.css'],
  imports: [RouterOutlet],
})
export class App {
  protected readonly title = signal('PomoStudy');

  private readonly darkmodeService = inject(DarkModeService);

  ngOnInit() {
    this.darkmodeService.initTheme();
  }
}