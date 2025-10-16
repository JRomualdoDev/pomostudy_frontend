import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { TaskService } from '../task/task.service';

@Component({
  selector: 'app-pomodoro',
  standalone: true,
  templateUrl: './pomodoro.component.html',
  styleUrls: ['./pomodoro.component.css'],
  providers: [TaskService]
})
export class PomodoroComponent implements OnInit {
  @Input() task: any;
  @Output() close = new EventEmitter<void>();

  timeLeft = 25 * 60; // default 25 minutes
  selectedTime = 25; // selected minutes
  interval: any;
  running = false;
  paused = false;
  round = 1;
  totalRounds = 4;
  goal = 0; // from task

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    this.goal = this.task?.timeTotalLearning || 0;
  }

  get minutes() {
    return Math.floor(this.timeLeft / 60).toString().padStart(2, '0');
  }
  get seconds() {
    return (this.timeLeft % 60).toString().padStart(2, '0');
  }

  setTime(minutes: number) {
    this.selectedTime = minutes;
    this.timeLeft = minutes * 60;
    this.stop();
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.paused = false;
    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.completeRound();
      }
    }, 1000);
  }

  pause() {
    this.running = false;
    this.paused = true;
    if (this.interval) clearInterval(this.interval);
  }

  stop() {
    this.running = false;
    this.paused = false;
    if (this.interval) clearInterval(this.interval);
    this.timeLeft = this.selectedTime * 60;
  }

  reset() {
    this.stop();
    this.round = 1;
  }

  completeRound() {
    this.stop();
    this.round++;
    // Adiciona o tempo do pomodoro ao totalLearningTime da task e envia ao backend
    const minutesToAdd = this.selectedTime;
    if (this.task) {
      const updatedTask = {
        ...this.task,
        timeTotalLearning: (this.task.timeTotalLearning || 0) + minutesToAdd
      };
      this.taskService.createTask(updatedTask).subscribe({
        next: (updated) => {
          this.task.timeTotalLearning = updated.timeTotalLearning;
          this.goal = updated.timeTotalLearning;
        },
        error: () => {
          // opcional: mostrar erro ao usuário
        }
      });
    }
    if (this.round > this.totalRounds) {
      this.round = 1;
      // Optional: notify goal reached
    }
    // Reset timer for next round
    this.timeLeft = this.selectedTime * 60;
  }

  ngOnDestroy() {
    this.stop();
  }
}
