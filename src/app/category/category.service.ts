import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = 'http://localhost:8080/api/category';

  constructor(private http: HttpClient) {}

  getCategories(page: number = 1, size: number = 10): Observable<any> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : ''
    });
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);

    return this.http.get<any>(this.apiUrl, { headers, params });
  }

  createCategory(category: any): Observable<any> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    });
    return this.http.post<any>(this.apiUrl, category, { headers });
  }
}
