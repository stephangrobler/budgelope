import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import dayjs from 'dayjs';
import { environment } from 'environments/environment';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  authState = null;
  currentUser = new BehaviorSubject(null);

  constructor(private httpClient: HttpClient) {
    this.loadUser();
  }

  login(email: string, password: string) {
    return this.httpClient
      .post(`${environment.apiUrl}login`, {
        email,
        password,
      })
      .pipe(tap((response) => this.setSession(response)));
  }

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('expiresAt');
    localStorage.removeItem('loggedInUser');
  }

  private setSession(authResponse): void {
    const expiresAt = dayjs().add(authResponse.expiresIn, 'second');
    localStorage.setItem('accessToken', authResponse.accessToken);
    localStorage.setItem('expiresAt', JSON.stringify(expiresAt.valueOf()));
    this.loadUser();
  }

  getExpiration() {
    const expiration = localStorage.getItem('expiresAt');
    const expires_in = expiration ? JSON.parse(expiration) : dayjs().valueOf();
    return dayjs(expires_in);
  }

  get authenticated(): boolean {
    const loggedIn = dayjs().isBefore(this.getExpiration());
    return loggedIn;
  }

  loadUser(): void {
    if (this.currentUser.value === null) {
      this.httpClient
        .get(`${environment.apiUrl}users/me`)
        .subscribe((user) => {
          localStorage.setItem('loggedInUser', JSON.stringify(user));
          this.currentUser.next(user);
        });
    }
  }

  get currentUserId(): string {
    return this.authenticated ? '612a89fd692d16f56176636d' : '';
  }
}
