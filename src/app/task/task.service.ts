import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private apiUrl = 'http://localhost:8080/api/task';

	constructor(private http: HttpClient) {}

  getTasks(page: number = 1, size: number = 10, sort: string = 'id,desc'): Observable<any> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : ''
    });
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', sort);

    return this.http.get<any>(this.apiUrl, { headers, params });
  }

  getTaskById(taskId: number): Observable<any> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : ''
    });
    return this.http.get<any>(`${this.apiUrl}/${taskId}`, { headers });
  }    

  getTasksByMonth(month: string, page: number = 1, size: number = 100): Observable<any> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : ''
    });
    const params = new HttpParams()
      .set('month', month)
      .set('page', page)
      .set('size', size);
      
    return this.http.get<any>(`${this.apiUrl}/month/${month}`, { headers, params });
  }

  createTask(task: any): Observable<any> {

    Object.keys(task).forEach(key => {
      if (task[key] === null || task[key] === undefined || task[key] === '') {
        console.log(`Removing key: ${key} with value: ${task[key]}`);
        delete task[key];
      }
    });

    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    });
    return this.http.post<any>(this.apiUrl, task, { headers });
  }

  getTasksByCategory(categoryId: number): Observable<any> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : ''
    });
    // Ajuste a URL conforme seu backend espera (exemplo: /api/task/category/{id})
    return this.http.get<any>(`${this.apiUrl}?categoryId=${categoryId}`, { headers });
  }
}
