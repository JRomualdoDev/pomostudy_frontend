import { Component } from '@angular/core';
 
import { ZardTableComponent } from '../shared/components/table/table.component';
import { TaskService } from './task.service';
 
interface Task {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  priority: string;
  timeTotalLearning: number;
  categoryId: number;
}
 
@Component({
  selector: 'zard-demo-table-simple',
  imports: [ZardTableComponent],
  templateUrl: './task.html',
  styleUrls: ['./task.css']
})
export class ZardDemoTableSimpleComponent {

   listOfData: Task[] = [];

   constructor(private taskService: TaskService) {}

   ngOnInit(): void {
    this.taskService.getTasks().subscribe({
      next: (data) => {
        console.log('Dados recebidos do backend:', data);
        
        if (Array.isArray(data.content)) {
          this.listOfData = data.content;
        } else {
          this.listOfData = [];
        }
      },
      error: (err) => {
        console.error('Erro ao buscar tarefas:', err);
        this.listOfData = [];
      }
    });
  }
  
}
