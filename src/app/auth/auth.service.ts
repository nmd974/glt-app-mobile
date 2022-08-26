import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, from } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Preferences } from '@capacitor/preferences';

import { environment } from '../../environments/environment';
import { User } from './user.model';

const BACKEND_URL = environment.backendURL;

export interface AuthResponseData {
  token: string;
  email: string;
  userId: string;
  role: string;
  expiresIn: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  private _user = new BehaviorSubject<User>(null);
  private activeLogoutTimer: any;

  get userIsAuthenticated() {
    return this._user.asObservable().pipe(
      map(user => {
        if (user) {
          return !!user.token;
        } else {
          return false;
        }
      })
    );
  }

  get userId() {
    return this._user.asObservable().pipe(
      map(user => {
        if (user) {
          return user.id;
        } else {
          return null;
        }
      })
    );
  }

  get token() {
    return this._user.asObservable().pipe(
      map(user => {
        if (user) {
          return user.token;
        } else {
          return null;
        }
      })
    );
  }

  constructor(private http: HttpClient) {}

  autoLogin() {
    return from(Preferences.get({ key: 'authData' })).pipe(
      map((storedData: any) => {
        if (!storedData || !storedData.value) {
          return null;
        }
        const parsedData = JSON.parse(storedData.value) as {
          token: string;
          tokenExpirationDate: string;
          role: string;
          userId: string;
          email: string;
        };
        const expirationTime = new Date(parsedData.tokenExpirationDate);
        if (expirationTime <= new Date()) {
          return null;
        }
        const user = new User(
          parsedData.userId,
          parsedData.email,
          parsedData.role,
          parsedData.token,
          expirationTime
        );
        return user;
      }),
      tap(user => {
        if (user) {
          this._user.next(user);
          this.autoLogout(user.tokenDuration);
        }
      }),
      map(user => {
        return !!user;
      })
    );
  }

  login(email: string, password: string) {
    return this.http
      .post<AuthResponseData>(
        BACKEND_URL + "/auth/login",
        { email: email, password: password },
      )
      .pipe(tap(this.setUserData.bind(this)));
  }

  logout() {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
    this._user.next(null);
    Preferences.remove({ key: 'authData' });
  }

  ngOnDestroy() {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
  }

  private autoLogout(duration: number) {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
    this.activeLogoutTimer = setTimeout(() => {
      this.logout();
    }, duration);
  }

  private setUserData(userData: AuthResponseData) {
    const expirationTime = new Date(
      new Date().getTime() + +userData.expiresIn * 1000
    );
    const user = new User(
      userData.userId,
      userData.email,
      userData.role,
      userData.token,
      expirationTime
    );
    this._user.next(user);
    this.autoLogout(user.tokenDuration);
    this.storeAuthData(
      userData.userId,
      userData.token,
      expirationTime.toISOString(),
      userData.email,
      userData.role,
    );
  }

  private storeAuthData(
    userId: string,
    token: string,
    tokenExpirationDate: string,
    email: string,
    role: string,
  ) {
    const data = JSON.stringify({
      userId: userId,
      token: token,
      tokenExpirationDate: tokenExpirationDate,
      email: email
    });
    Preferences.set({ key: 'authData', value: data });
  }
}
