import { RouterOutlet } from '@angular/router';

import { ChangeDetectionStrategy, Component, ViewEncapsulation, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
 
import { ZardButtonComponent } from './shared/components/button/button.component';
import { ZardInputDirective } from './shared/components/input/input.directive';
import { ZardFormModule } from './shared/components/form/form.module';
import { ZardDividerComponent } from "@shared/components/divider/divider.component";

@Component({
  selector: 'app-root',
  // imports: [RouterOutlet],
  templateUrl: 'app.html',
  styleUrl: 'app.css',
  imports: [ReactiveFormsModule, ZardButtonComponent, ZardInputDirective, ZardFormModule, ZardDividerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class App {
  protected readonly title = signal('PomoStudy');

  profileForm = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });
 
  onSubmit() {
    if (this.profileForm.valid) {
      console.log('Form submitted:', this.profileForm.value);
    }
  }
}
