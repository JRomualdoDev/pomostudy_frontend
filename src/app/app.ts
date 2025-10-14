import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: 'index/index.html',
  styleUrl: 'index/index.css'
})
export class App {
  protected readonly title = signal('pomostudy');
}
