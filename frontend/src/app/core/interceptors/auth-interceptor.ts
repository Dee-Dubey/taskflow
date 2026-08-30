import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { Router } from '@angular/router';

let isRefreshing = false
const refreshedToken$ = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService)
  const router = inject(Router);
  const token = auth.accessToken();

  const authReq = token ? req.clone({setHeaders: {Authorization: `Bearer ${token}`}}) : req;

  const isAuthEndpoint = req.url.includes('/auth/login') || req.url.includes('/auth/refresh') || req.url.includes('/auth/register');

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if(err.status !== 401 || isAuthEndpoint){
        return throwError(()=> err)
      }

      if(isRefreshing){
        return refreshedToken$.pipe(
          filter((t) => t !== null),
          take(1),
          switchMap((newToken) => {
            const retryReq = req.clone({ setHeaders: {Authorization: `Bearer ${newToken}`}})
            return next(retryReq)
          })
        )
      }

      isRefreshing = true
      refreshedToken$.next(null);

      return auth.refresh().pipe(
        switchMap((res) => {
          isRefreshing = false
          refreshedToken$.next(res.accessToken);
          const retryReq = req.clone({setHeaders: {Authorization: `Bearer ${res.accessToken}`}})
          return next(retryReq);
        }),
        catchError((refreshErr) => {
          isRefreshing = false
          auth.logout().subscribe();
          router.navigate(['/login']);
          return throwError(()=> refreshErr)
        })
      )
    })
  )

  if(token){
    req = req.clone({setHeaders: { Authorization: `Bearer ${token}`}});
  }
  return next(req);
};
