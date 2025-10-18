import { Injectable, inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  return next(req).pipe(
    catchError((err) => {
      if (err?.status === 403) {
        localStorage.removeItem('auth_token');
        router.navigate(['/login']);
      }
      return throwError(() => err);
    })
  );
};
// ;
