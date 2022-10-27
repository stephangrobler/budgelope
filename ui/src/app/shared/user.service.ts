import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { IProfile } from '../shared/profile';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  authenticated = false;
  profile$: Observable<IProfile>;

  constructor(private router: Router) {}

  verifyLogin(url: string): boolean {
    if (this.authenticated) {
      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }

  /**
   * Sets up a profile and starter budget for a new user
   * @param  user User object
   * @return      [description]
   */
  setupProfile(user: any) {
    if (!user) {
      return;
    }
  }
  getProfile() {
    return of({
      activeBudget: '',
    });
  }
}
