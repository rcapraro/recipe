import { Action } from '@ngrx/store';

export const SIGNUP_START = '[Auth] SIGNUP START';
export const LOGIN_START = '[Auth] LOGIN START';
export const AUTHENTICATE_SUCCESS = '[Auth] AUTHENTICATE_SUCCESS';
export const AUTHENTICATE_FAILURE = '[Auth] AUTHENTICATE_FAILURE'
export const LOGOUT = '[Auth] LOGOUT';
export const CLEAR_ERROR = '[Auth] CLEAR_ERROR';
export const AUTO_LOGIN = '[Auth] AUTO_LOGIN';

export class SignupStart implements Action {
  readonly type = SIGNUP_START;

  constructor(public payload: { email: string; password: string }) {
  }
}

export class LoginStart implements Action {
  readonly type = LOGIN_START;

  constructor(public payload: { email: string; password: string }) {
  }
}

export class AuthenticateSuccess implements Action {
  readonly type = AUTHENTICATE_SUCCESS;

  constructor(
    public payload: {
      email: string;
      userId: string;
      token: string;
      expirationDate: Date,
      redirect: boolean
    }
  ) {
  }
}

export class AuthenticateFailure implements Action {
  readonly type = AUTHENTICATE_FAILURE;

  constructor(public payload: string) {
  }
}

export class Logout implements Action {
  readonly type = LOGOUT;
}

export class ClearError implements Action {
  readonly type = CLEAR_ERROR;
}

export class AutoLogin implements Action {
  readonly type = AUTO_LOGIN;
}

export type AuthActions =
  | LoginStart
  | AutoLogin
  | SignupStart
  | AuthenticateSuccess
  | Logout
  | AuthenticateFailure
  | ClearError;
