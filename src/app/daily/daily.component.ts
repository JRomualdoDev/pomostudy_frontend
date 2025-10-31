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
import { firstValueFrom } from 'rxjs';

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
  sidebarTask: any = { name: '', description: '', startDate: '', endDate: '', status: 'PENDING', priority: 'LOW', categoryId: null };

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
    // load categories first so we can map categoryId -> name when tasks arrive
    this.loadCategories();
    this.loadTasksFromServer();
  }

  // new helper: ensure categories are loaded (returns a Promise)
	private async ensureCategoriesLoaded(): Promise<void> {
		// already loaded
		if (Array.isArray(this.categories) && this.categories.length > 0) return;
		try {
			// use firstValueFrom to await the observable result
			const data: any = await firstValueFrom(this.categoryService.getCategories(1, 200));
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
		} catch (err) {
			console.error('Error ensuring categories loaded', err);
			this.categories = [];
		}
	}

  loadTasksFromServer() {
    const prevSelectedId = this.selectedTask?.id ?? null;
    this.taskService.getTasks().subscribe({
      next: (data: any) => {
        const all = Array.isArray(data.content) ? data.content : [];

        // separate completed and not completed
        this.completedTasks = all.filter((t: any) => t.status === 'COMPLETED');
        this.tasks = all.filter((t: any) => t.status !== 'COMPLETED');

        // preserve previously selected task by id if present
        if (prevSelectedId != null) {
          const foundInTasks = this.tasks.find((t: any) => String(t.id) === String(prevSelectedId));
          const foundInCompleted = this.completedTasks.find((t: any) => String(t.id) === String(prevSelectedId));
          this.selectedTask = foundInTasks ?? foundInCompleted ?? null;
        } else {
          this.selectedTask = this.tasks.length > 0 ? this.tasks[0] : (this.completedTasks.length > 0 ? this.completedTasks[0] : null);
        }

        // populate sidebar form with selected task (if any) and ensure category fallback
        if (this.selectedTask) {
          this.populateSidebarTask(this.selectedTask);
          const cid = this.sidebarTask?.categoryId ?? this.selectedTask?.categoryId ?? null;
          if (cid != null) {
            if (!Array.isArray(this.categories) || this.categories.length === 0) {
              this.ensureCategoriesLoaded().then(() => {
                const resolved = this.getCategoryName(cid);
                console.log('Resolved category name after loading categories:', resolved);
                if (resolved) this.sidebarTask._categoryNameFallback = resolved;
              });
            } else {
              const resolved = this.getCategoryName(cid);
              if (resolved) this.sidebarTask._categoryNameFallback = resolved;
            }
          }
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

    // ensure categories loaded and set fallback name immediately
    const cid = this.sidebarTask?.categoryId ?? this.selectedTask?.categoryId ?? null;
    if (cid != null) {
      if (!Array.isArray(this.categories) || this.categories.length === 0) {
        this.ensureCategoriesLoaded().then(() => {
          const resolved = this.getCategoryName(cid);
          if (resolved) this.sidebarTask._categoryNameFallback = resolved;
        });
      } else {
        const resolved = this.getCategoryName(cid);
        if (resolved) this.sidebarTask._categoryNameFallback = resolved;
      }
    } else if (this.selectedTask?.category?.name) {
      this.sidebarTask._categoryNameFallback = this.selectedTask.category.name;
    }
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
      priority: task?.priority ?? 'LOW',
      // normalize category id: support task.categoryId or nested task.category.id
      categoryId: task?.categoryId ?? task?.category?.id ?? null,
      // keep a possible fallback category name coming from the task object itself
      _categoryNameFallback: task?.category?.name ?? null
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
        this.sidebarTask = { name: '', description: '', startDate: '', endDate: '', status: 'PENDING', priority: 'LOW', categoryId: null };
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
        this.sidebarTask = { name: '', description: '', startDate: '', endDate: '', status: 'PENDING', priority: 'LOW', categoryId: null };
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

        // if sidebar already has a categoryId, set fallback name so label shows immediately
        if (this.sidebarTask?.categoryId) {
          const name = this.getCategoryName(this.sidebarTask.categoryId);
          if (name) {
            this.sidebarTask._categoryNameFallback = name;
          }
        }
      },
      error: (err) => {
        console.error('Error loading categories', err);
        this.categories = [];
      }
    });
  }

  // called when a category is selected from popup (now receives optional triggerRef)
  onSidebarCategorySelect(catId: any, triggerRef?: any) {
    // set in sidebar model immediately so UI updates
    this.sidebarTask.categoryId = catId;

    // resolve category name fast
    const cat = Array.isArray(this.categories) ? this.categories.find((c: any) => String(c.id) === String(catId)) : null;
    if (cat && cat.name) {
      this.sidebarTask._categoryNameFallback = cat.name;
    }

    // Update selectedTask UI model immediately
    if (this.selectedTask) {
      this.selectedTask.categoryId = catId;
      if (cat) this.selectedTask.category = { id: cat.id, name: cat.name };
    }

    // Persist immediately if selected task exists on server
    if (this.selectedTask && this.selectedTask.id != null) {
      const payload: any = { categoryId: catId };
      this.taskService.updateTask(this.selectedTask.id, payload).subscribe({
        next: (updated: any) => {
          // update local models only (avoid full reload that resets UI)
          if (updated) {
            // if backend returns updated object, sync fields
            if (updated.id === this.selectedTask.id) {
              this.selectedTask = { ...this.selectedTask, ...updated };
              this.populateSidebarTask(this.selectedTask);
              // ensure fallback shows the new name
              const resolved = this.getCategoryName(catId) || (cat?.name ?? '');
              if (resolved) this.sidebarTask._categoryNameFallback = resolved;
            }
          }
          if (triggerRef) this.closeCategoryPopover(triggerRef);
        },
        error: (err) => {
          console.error('Error saving category for task', err);
          if (triggerRef) this.closeCategoryPopover(triggerRef);
        }
      });
    } else {
      // No selected task id: just close popover for convenience
      if (triggerRef) this.closeCategoryPopover(triggerRef);
    }
  }

  // helper to close the category popover/overlay in a tolerant way
  private closeCategoryPopover(triggerRef: any): void {
    try {
      if (!triggerRef) return;
      // common patterns: Angular CDK/Material/third-party components may expose .close() or .hide()
      if (typeof triggerRef.close === 'function') {
        triggerRef.close();
        return;
      }
      if (typeof triggerRef.hide === 'function') {
        triggerRef.hide();
        return;
      }
      // if it's an ElementRef or DOM node, try to dispatch a click on a close button if present
      if (triggerRef.nativeElement) {
        const el = triggerRef.nativeElement as HTMLElement;
        const btn = el.querySelector('[data-close], .close, [aria-label="close"]') as HTMLElement | null;
        if (btn && typeof btn.click === 'function') {
          btn.click();
          return;
        }
      }
    } catch (e) {
      console.error('Error closing category popover', e);
    }
  }

  // Return category name by id, safe for templates
	getCategoryName(categoryId: any): string {
		if (!categoryId) return '';

		const idKey = String(categoryId).trim();

		// Try to find in loaded categories (handle number/string and multiple id fields)
		if (Array.isArray(this.categories) && this.categories.length > 0) {
			const cat = this.categories.find((c: any) => {
				if (!c) return false;
				// check common id fields and stringified equality
				const possibleIds = [c.id, c.categoryId, c._id];
				for (const pid of possibleIds) {
					if (pid !== undefined && pid !== null && String(pid) === idKey) return true;
				}
				return false;
			});
			if (cat && cat.name) return cat.name;
		}

		// Try matching category name directly (in case backend stored name in the id slot)
		if (Array.isArray(this.categories) && this.categories.length > 0) {
			const byName = this.categories.find((c: any) => c && String(c.name).trim() === idKey);
			if (byName && byName.name) return byName.name;
		}

		// Fallbacks: sidebar fallback or nested selectedTask.category.name
		if (this.sidebarTask && this.sidebarTask._categoryNameFallback) {
			return this.sidebarTask._categoryNameFallback;
		}
		if (this.selectedTask && this.selectedTask.category && this.selectedTask.category.name) {
			return this.selectedTask.category.name;
		}

		// final fallback empty
		return '';
	}

  // Return the category name to display on the sidebar chooser:
	// prefer sidebarTask.categoryId -> loaded categories -> fallback name -> selectedTask.category name -> empty
	getDisplayedCategoryName(): string {
		// 1. try sidebarTask.categoryId
		const cid = this.sidebarTask?.categoryId ?? (this.selectedTask?.categoryId ?? null);
		if (cid != null) {
			const nameFromLoaded = this.getCategoryName(cid);
			if (nameFromLoaded) return nameFromLoaded;
		}

		// 2. try fallback name stored in sidebarTask (from task payload)
		if (this.sidebarTask?._categoryNameFallback) return this.sidebarTask._categoryNameFallback;

		// 3. try selectedTask.category.name (nested)
		if (this.selectedTask?.category?.name) return this.selectedTask.category.name;

		// 4. try selectedTask.categoryId mapped to loaded categories
		if (this.selectedTask?.categoryId != null) {
			const nameFromLoaded2 = this.getCategoryName(this.selectedTask.categoryId);
			if (nameFromLoaded2) return nameFromLoaded2;
		}

		return 'Choose category';
	}
}
