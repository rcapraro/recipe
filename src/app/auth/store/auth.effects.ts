import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as AuthActions from './auth.actions';
import { AuthenticateSuccess } from './auth.actions';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../user.model';
import { AuthService } from '../auth.service';

export interface AuthResponseData {
  idToken: string,
  email: string,
  refreshToken: string,
  expiresIn: string,
  localId: string,
  registered?: boolean
}

const handleAuthentication = (email: string, userId: string, token: string, expiresIn: number) => {
  const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
  const user = new User(email, userId, token, expirationDate);
  localStorage.setItem('userData', JSON.stringify(user));
  return new AuthActions.AuthenticateSuccess(
    {
      email: email,
      userId: userId,
      token: token,
      expirationDate: expirationDate,
      redirect: true
    }
  );
};
const handleError = (errorResponse: HttpErrorResponse) => {
  let errorMessage = 'An Unknown error occurred!';
  if (!errorResponse.error || !errorResponse.error.error) {
    return of(new AuthActions.AuthenticateFailure(errorMessage));
  }
  switch (errorResponse.error.error.message) {
    case 'EMAIL_EXISTS':
      errorMessage = 'This email already exists.';
      break;
    case 'EMAIL_NOT_FOUND':
    case 'INVALID_PASSWORD':
      errorMessage = 'The email or password is invalid.';
      break;
    case 'USER_DISABLED':
      errorMessage = "This user has been disabled by an administrator.";
      break;
  }
  return of(new AuthActions.AuthenticateFailure(errorMessage));
};

@Injectable()
export class AuthEffects {

  signup$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuthActions.SIGNUP_START),
      switchMap((authData: AuthActions.SignupStart) => {
        return this.http.post<AuthResponseData>(
          'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + environment.firebaseAPIKey,
          {
            email: authData.payload.email,
            password: authData.payload.password,
            returnSecureToken: true
          }
        ).pipe(
          tap((resData) => this.authService.setLogoutTimer(+resData.expiresIn * 1000)),
          map(resData => handleAuthentication(resData.email, resData.localId, resData.idToken, +resData.expiresIn)),
          catchError(errorResponse => handleError(errorResponse)),
        )
      })
    );
  });

  login$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuthActions.LOGIN_START),
      switchMap((authData: AuthActions.LoginStart) => {
          return this.http.post<AuthResponseData>(
            'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + environment.firebaseAPIKey,
            {
              email: authData.payload.email,
              password: authData.payload.password,
              returnSecureToken: true
            }
          ).pipe(
            tap((resData) => this.authService.setLogoutTimer(+resData.expiresIn * 1000)),
            map(resData => handleAuthentication(resData.email, resData.localId, resData.idToken, +resData.expiresIn)),
            catchError(errorResponse => handleError(errorResponse)),
          )
        }
      )
    );
  });

  autoLogin$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuthActions.AUTO_LOGIN), map(() => {
        const userData: {
          email: string,
          id: string,
          _token: string,
          _tokenExpirationDate: string
        } = JSON.parse(localStorage.getItem('userData'));

        if (!userData) {
          return {type: 'DUMMY'};
        }
        const loadedUser = new User(
          userData.email,
          userData.id,
          userData._token,
          new Date(userData._tokenExpirationDate)
        );

        //non expired token ?
        if (loadedUser.token) {
          const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
          this.authService.setLogoutTimer(expirationDuration);
          return new AuthActions.AuthenticateSuccess({
              email: loadedUser.email,
              userId: loadedUser.id,
              token: loadedUser.token,
              expirationDate: new Date(userData._tokenExpirationDate),
              redirect: false
            }
          );
        }
        return {type: 'DUMMY'};
      })
    )
  });

  logout$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuthActions.LOGOUT),
      tap(() => {
        this.authService.cleaLogoutTimer();
        localStorage.removeItem('userData');
        this.router.navigate(['/auth']);
      })
    );
  }, {dispatch: false});

  authenticateSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuthActions.AUTHENTICATE_SUCCESS),
      tap((authSuccessAction: AuthenticateSuccess) => {
        if (authSuccessAction.payload.redirect) {
          this.router.navigate(['/']);
        }
      })
    );
  }, {dispatch: false});

  constructor(
    private actions$: Actions,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService) {
  }

}
