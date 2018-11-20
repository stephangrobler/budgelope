import { TestBed, inject } from '@angular/core/testing';

import { AuthService } from './auth.service';
import { of } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';

describe('AuthService', () => {
  let afAuthMock;

  beforeEach(() => {
    afAuthMock = jasmine.createSpyObj('AngularFireAuth', ['test']);
    afAuthMock.authState = of({
      uid: '12345'
    });
    TestBed.configureTestingModule({
      providers: [AuthService, { provide: AngularFireAuth, useValue: afAuthMock }]
    });
  });

  it('should be created', inject([AuthService], (service: AuthService) => {
    expect(service).toBeTruthy();
  }));
});
