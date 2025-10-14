import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {

	private baseUrl = 'http://localhost:8080/api/auth';

	// Attempts login; returns a Promise that resolves true on success, false on failure
	async login(email: string, password: string): Promise<boolean> {
		try {
			const res = await fetch(`${this.baseUrl}/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password })
			});
			if (!res.ok) {
				return false;
			}
			// expect JSON with token or user data
			const data = await res.json();
			// store token if provided (adjust property name if backend differs)
			if (data?.token) {
				localStorage.setItem('auth_token', data.token);
			} else if (data?.id) {
				// fallback: store a marker for logged-in user
				localStorage.setItem('auth_user', JSON.stringify(data));
			}
			return true;
		} catch (err) {
			// network or other error -> treat as failure
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
