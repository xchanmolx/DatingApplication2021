import { catchError, retry } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';

export class ErrorIntercept implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req)
            .pipe(
                retry(1),
                catchError((error: HttpErrorResponse) => {
                    let modalStateErrors = '';
                    const serverError = error.error;
                    if (error.status === 401) {
                        return throwError(error.statusText)
                    }
                    if (error.error instanceof ErrorEvent) {
                        // client-side error
                        const applicationError = error.headers.get('Application-Error');
                        if (applicationError) {
                            return throwError(applicationError);
                        }
                    } else {
                        // server-side error
                        if (serverError.errors && typeof serverError.errors === 'object') {
                            for (const key in serverError.errors) {
                                if (serverError.errors[key]) {
                                    modalStateErrors += serverError.errors[key] + '\n';
                                }
                            }
                        }
                    }
                    return throwError(modalStateErrors || serverError || 'Server Error');
                })
            );
    }
}
