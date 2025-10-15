import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {

	private baseUrl = 'http://localhost:8080/api/auth';

	constructor(private http: HttpClient) {}

	// Attempts login; returns a Promise that resolves true on success, false on failure
	async login(email: string, password: string): Promise<boolean> {
		try {
			const res: any = await firstValueFrom(
				this.http.post(`${this.baseUrl}/login`, { email, password })
			);

			if (res?.token) {
				localStorage.setItem('auth_token', res.token);
			} else if (res?.id) {
				localStorage.setItem('auth_user', JSON.stringify(res));
			}
			return true;
		} catch (err) {
			return false;
		}
	}

	logout(): void {
		localStorage.removeItem('auth_token');
		localStorage.removeItem('auth_user');
	}

	isAuthenticated(): boolean {
		return !!(localStorage.getItem('auth_token') || localStorage.getItem('auth_user'));
	}
}
