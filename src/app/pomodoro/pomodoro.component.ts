import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pomodoro',
  standalone: true,
  templateUrl: './pomodoro.html',
  styleUrls: ['./pomodoro.css']
})
export class PomodoroComponent {
  @Input() task: any;
  @Output() close = new EventEmitter<void>();

  timeLeft = 25 * 60; // 25 minutes in seconds
  interval: any;
  running = false;

  get minutes() {
    return Math.floor(this.timeLeft / 60).toString().padStart(2, '0');
  }
  get seconds() {
    return (this.timeLeft % 60).toString().padStart(2, '0');
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.stop();
      }
    }, 1000);
  }

  stop() {
    this.running = false;
    if (this.interval) clearInterval(this.interval);
  }

  reset() {
    this.stop();
    this.timeLeft = 25 * 60;
  }

  ngOnDestroy() {
    this.stop();
  }
}
