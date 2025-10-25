import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TaskService } from '../task/task.service'; // import the service
import { ZardSelectComponent } from '@shared/components/select/select.component';
import { ZardPopoverComponent, ZardPopoverDirective } from '@shared/components/popover/popover.component';
import { ZardSelectItemComponent } from '@shared/components/select/select-item.component';
import { ZardFormModule } from '@shared/components/form/form.module';
import { TaskComponent } from '../task/task.component';
import { CategoryService } from '../category/category.service'; // add import

@Component({
  selector: 'app-daily',
  templateUrl: './daily.component.html',
  styleUrls: ['./daily.component.css'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ZardFormModule,
    ZardSelectComponent,
    ZardSelectItemComponent,
    ZardPopoverComponent,
    ZardPopoverDirective,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DailyComponent implements OnInit {
  tasks: any[] = [];              // tasks in progress / pending
  completedTasks: any[] = [];     // completed tasks
  selectedTask: any = null;
  newTaskTitle: string = '';
  showCompleted = true;

  // model used by the sidebar form
  sidebarTask: any = { name: '', description: '', startDate: '', endDate: '', status: 'PENDING', priority: 'LOW' };

  categories: any[] = []; // store categories

  // confirmation state for toggling completed
  confirmToggle: null | {
    task: any;
    newValue: boolean;
    previousValue: boolean;
    message: string;
  } = null;

  constructor(private taskService: TaskService, private categoryService: CategoryService) {
    // constructor body
  }

  ngOnInit() {
    this.loadTasksFromServer();
    this.loadCategories(); // new: load categories
  }


  loadTasksFromServer() {
    this.taskService.getTasks().subscribe({
      next: (data: any) => {
        const all = Array.isArray(data.content) ? data.content : [];

        // separate completed and not completed
        this.completedTasks = all.filter((t: any) => t.status === 'COMPLETED');
        this.tasks = all.filter((t: any) => t.status !== 'COMPLETED');

        console.log('Loaded tasks:', this.tasks);
        console.log('Loaded completed tasks:', this.completedTasks);

        // set selectedTask to the first available
        this.selectedTask = this.tasks.length > 0 ? this.tasks[0] : (this.completedTasks.length > 0 ? this.completedTasks[0] : null);

        // populate sidebar form with selected task (if any)
        if (this.selectedTask) {
          this.populateSidebarTask(this.selectedTask);
        }
      },
      error: (err) => {
        console.error('Error loading tasks', err);
        // fallback: keep arrays empty
        this.tasks = [];
        this.completedTasks = [];
        this.selectedTask = null;
      }
    });
  }

  // Called when the user clicks a row
  onSelectTask(task: any) {
    this.selectedTask = task;
    this.populateSidebarTask(task);
  }

  // copy values from a task into the sidebar form model
  populateSidebarTask(task: any) {
    this.sidebarTask = {
      name: task?.name ?? '',
      description: task?.description ?? '',
      // convert to 'yyyy-MM-dd' for input[type="date"]
      startDate: task?.startDate ? this.formatDateForInput(task.startDate) : '',
      endDate: task?.endDate ? this.formatDateForInput(task.endDate) : '',
      status: task?.status ?? 'PENDING',
      priority: task?.priority ?? 'LOW'
    };
  }

  // convert various date strings (ISO, with timezone, timestamp) to 'yyyy-MM-dd' for date input value
  formatDateForInput(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  // returns normalized values from currently selected task for comparison
  private getSelectedTaskNormalized() {
    if (!this.selectedTask) return null;
    return {
      name: this.selectedTask.name ?? '',
      description: this.selectedTask.description ?? '',
      startDate: this.selectedTask.startDate ? this.formatDateForInput(this.selectedTask.startDate) : '',
      endDate: this.selectedTask.endDate ? this.formatDateForInput(this.selectedTask.endDate) : '',
      status: this.selectedTask.status ?? 'PENDING',
      priority: this.selectedTask.priority ?? 'LOW'
    };
  }

  // returns true when sidebarTask differs from selectedTask (so Update should be enabled)
  isSidebarModified(): boolean {
    const sel = this.getSelectedTaskNormalized();
    if (!sel || !this.selectedTask?.id) return false;
    const s = this.sidebarTask || {};
    return (
      (sel.name ?? '') !== (s.name ?? '') ||
      (sel.description ?? '') !== (s.description ?? '') ||
      (sel.startDate ?? '') !== (s.startDate ?? '') ||
      (sel.endDate ?? '') !== (s.endDate ?? '') ||
      (sel.status ?? '') !== (s.status ?? '') ||
      (sel.priority ?? '') !== (s.priority ?? '')
    );
  }

  addTask() {
    const title = this.newTaskTitle?.trim();
    if (!title) return;

    const newTask = {
      name: title,
      description: '',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: '',
      status: 'PENDING',
      priority: 'LOW',
      timeTotalLearning: 0,
      important: false,
      completed: false
    };

    // If the service exists, create on the server and refresh the list on success
    if (this.taskService && typeof this.taskService.createTask === 'function') {

      const taskToSend = {
        ...newTask,
        startDate: this.formatDateToBackend(newTask.startDate),
        endDate: this.formatDateToBackend(newTask.endDate),
        timeTotalLearning: 0
      };

      this.taskService.createTask(taskToSend).subscribe({
        next: (created: any) => {
          // reload from server to ensure ordering and consistent data
          this.loadTasksFromServer();
          this.newTaskTitle = '';
        },
        error: (err) => {
          console.error('Error creating task on server, using local fallback', err);
          // local fallback to avoid losing user's input
          this.tasks.unshift(newTask);
          this.selectedTask = newTask;
          this.newTaskTitle = '';
        }
      });
    } else {
      // fallback if service not available
      this.tasks.unshift(newTask);
      this.selectedTask = newTask;
      this.newTaskTitle = '';
    }
  }

  // create task from sidebar form
  createTaskFromSidebar() {
    const name = this.sidebarTask.name?.trim();
    if (!name) return;

    const payload: any = {
      name: this.sidebarTask.name,
      description: this.sidebarTask.description || undefined,
      startDate: this.formatDateToBackend(this.sidebarTask.startDate) || undefined,
      endDate: this.formatDateToBackend(this.sidebarTask.endDate) || undefined,
      status: this.sidebarTask.status,
      priority: this.sidebarTask.priority,
      timeTotalLearning: 0
    };

    this.taskService.createTask(payload).subscribe({
      next: () => {
        this.loadTasksFromServer(); // refresh list
        // reset form
        this.sidebarTask = { name: '', description: '', startDate: '', endDate: '', status: 'PENDING', priority: 'LOW' };
      },
      error: (err) => {
        console.error('Error creating task from sidebar', err);
        // fallback: add locally
        this.tasks.unshift({
          name: payload.name,
          description: payload.description,
          startDate: this.sidebarTask.startDate,
          endDate: this.sidebarTask.endDate,
          status: payload.status,
          priority: payload.priority,
          timeTotalLearning: 0,
          important: false,
          completed: false
        });
        this.sidebarTask = { name: '', description: '', startDate: '', endDate: '', status: 'PENDING', priority: 'LOW' };
      }
    });
  }

  // New: update the selected task on the server (PUT). If no selectedTask, nothing happens.
  updateTask() {
    if (!this.selectedTask || !this.selectedTask.id) return;

    const payload: any = {
      name: this.sidebarTask.name ?? this.selectedTask.name,
      description: (this.sidebarTask.description ?? this.selectedTask.description) || undefined,
      startDate: this.formatDateToBackend(this.sidebarTask.startDate || this.selectedTask.startDate) || undefined,
      endDate: this.formatDateToBackend(this.sidebarTask.endDate || this.selectedTask.endDate) || undefined,
      status: this.sidebarTask.status ?? this.selectedTask.status,
      priority: this.sidebarTask.priority ?? this.selectedTask.priority,
      timeTotalLearning: this.selectedTask.timeTotalLearning ?? 0
    };

    // Use TaskComponent wrapper to perform the update
    const taskComp = new TaskComponent(this.taskService);
    taskComp.editTask(this.selectedTask.id, payload).subscribe({
      next: (updated: any) => {
        // refresh list to reflect server state
        this.loadTasksFromServer();
      },
      error: (err) => {
        console.error('Error updating task', err);
      }
    });
  }

  formatDateToBackend(dateStr: string): string | null {
    if (!dateStr) return null;
    // dateStr is 'yyyy-MM-dd'
    const date = new Date(dateStr);
    // Adjust to local timezone
    const tzOffset = -date.getTimezoneOffset();
    const diff = tzOffset >= 0 ? '+' : '-';
    const pad = (n: number) => `${Math.floor(Math.abs(n) / 10)}${Math.abs(n) % 10}`;
    const offsetHours = pad(Math.abs(tzOffset / 60));
    const offsetMinutes = pad(Math.abs(tzOffset % 60));
    // yyyy-MM-ddTHH:mm:ss.sss±hh:mm
    return (
      date.toISOString().slice(0, 19) +
      diff +
      offsetHours +
      ':' +
      offsetMinutes
    );
  }

  // new: load categories for the popup (deduplicates by name, case-insensitive)
  loadCategories() {
    this.categoryService.getCategories(1, 200).subscribe({
      next: (data: any) => {
        const all = Array.isArray(data.content) ? data.content : data || [];
        const unique: any[] = [];
        const seen = new Set<string>();
        for (const cat of all) {
          const nameKey = (cat?.name ?? '').toString().trim().toLowerCase();
          if (!nameKey) continue;
          if (!seen.has(nameKey)) {
            seen.add(nameKey);
            unique.push(cat);
          }
        }
        this.categories = unique;
      },
      error: (err) => {
        console.error('Error loading categories', err);
        this.categories = [];
      }
    });
  }

  // called when a category is selected from popup
  onSidebarCategorySelect(catId: any) {
    this.sidebarTask.categoryId = catId;
    // if editing a selectedTask, update its categoryId in UI model (doesn't persist until Update)
    if (this.selectedTask) {
      this.selectedTask.categoryId = catId;
    }
  }

  // Return category name by id, safe for templates
	getCategoryName(categoryId: any): string {
		if (!categoryId || !Array.isArray(this.categories)) return '';
		const cat = this.categories.find((c: any) => c && c.id === categoryId);
		return cat ? (cat.name ?? '') : '';
	}

  // Safely close the popover trigger if it exposes a close() method
	closeCategoryPopover(triggerRef: any) {
		if (!triggerRef) return;
		try {
			const maybeClose = (triggerRef as any).close;
			if (typeof maybeClose === 'function') {
				maybeClose.call(triggerRef);
			}
		} catch (e) {
			// ignore if closing is not supported
			console.warn('Could not close category popover', e);
		}
	}

  // Called when a checkbox is toggled (table or sidebar)
  onToggleCompleted(task: any, event: Event) {
    // determine desired value from the input element
    const input = event.target as HTMLInputElement;
    const newValue = !!input.checked;
    const prev = !!task.completed;

    // if no change, do nothing
    if (newValue === prev) {
      return;
    }

    // prepare message
    const verb = newValue ? 'mark' : 'unmark';
    const msg = `Do you want to ${verb} task "${task.name}" as completed?`;

    // set confirmation state (overlay will appear)
    this.confirmToggle = {
      task,
      newValue,
      previousValue: prev,
      message: msg
    };

    // Note: UI will still show the checkbox changed briefly; we will revert if user cancels.
    // Revert immediate visual to previous to avoid flicker (optional)
    // Re-apply previous value so visual matches model until confirmed
    (event.target as HTMLInputElement).checked = prev;
  }

  // User confirmed the change
  confirmToggleYes() {
    if (!this.confirmToggle) return;
    const { task, newValue } = this.confirmToggle;

    console.log('User confirmed toggle completed to', newValue, 'for task', task);

    // If task has id, persist to server
    if (task && task.id != null) {
      if (newValue == true) { 
        const payload: any = { status : 'COMPLETED' };
      
        // call updateTask on service
        this.taskService.updateTask(task.id, payload).subscribe({
          next: (updated: any) => {
            // apply changes locally and refresh lists
            this.loadTasksFromServer();
            this.confirmToggle = null;
          },
          error: (err) => {
            console.error('Error updating completed flag', err);
            // keep state unchanged and notify user (or revert)
            this.confirmToggle = null;
          }
        });
      }
    } else {
      // no id: apply locally
      task.completed = newValue;
      // move between lists if needed
      if (newValue) {
        // remove from tasks and add to completedTasks at top
        this.tasks = this.tasks.filter((t) => t !== task);
        this.completedTasks.unshift({ ...task, completed: true });
      } else {
        // remove from completed and add to tasks
        this.completedTasks = this.completedTasks.filter((t) => t !== task);
        this.tasks.unshift({ ...task, completed: false });
      }
      this.confirmToggle = null;
    }
  }

  // User canceled the change
  confirmToggleNo() {
    if (!this.confirmToggle) return;
    const { task, previousValue } = this.confirmToggle;
    // Ensure UI reflects previous value
    task.completed = previousValue;
    this.confirmToggle = null;
  }
  
}
