import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GoalService {
  private apiUrl = 'http://localhost:8080/api/goal';

  constructor(private http: HttpClient) {}

  getGoals(page: number = 1, size: number = 10): Observable<any> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : ''
    });
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);

    return this.http.get<any>(this.apiUrl, { headers, params });
  }
}
