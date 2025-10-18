import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ZardDividerComponent } from "@shared/components/divider/divider.component";
import { ZardFormFieldComponent, ZardFormControlComponent, ZardFormMessageComponent } from "@shared/components/form/form.component";

@Component({
	selector: 'app-login',
	imports: [CommonModule, ReactiveFormsModule, ZardDividerComponent, ZardFormFieldComponent, ZardFormControlComponent, ZardFormMessageComponent],
	templateUrl: './login.html', 
	styleUrls: ['./login.component.css'] 
})
export class LoginComponent {

    protected readonly title = signal('PomoStudy');
    
	profileForm!: FormGroup;
	error: string | null = null;


	constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
		this.profileForm = this.fb.group({
			email: ['', [Validators.required, Validators.email]],
			password: ['', [Validators.required, Validators.minLength(6)]]
		});
	}

	async onSubmit() {
		if (this.profileForm.invalid) {
			return;
		}
		this.error = null;
		const { email, password } = this.profileForm.value;
		const ok = await this.auth.login(email, password);
		if (ok) {		
			this.router.navigate(['/dashboard/index']);
		} else {
			// show inline error
			this.error = 'Invalid credentials';
		}
	}

}
