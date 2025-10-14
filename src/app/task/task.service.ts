import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private apiUrl = 'http://localhost:8080/api/task';

	constructor(private http: HttpClient) {}

  getTasks(): Observable<any> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : ''
    });
    return this.http.get<any>(this.apiUrl, { headers });
  }
}
