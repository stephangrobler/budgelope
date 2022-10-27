import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportComponent } from './import.component';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFireFunctions } from '@angular/fire/functions';
import { TransactionService } from '../transaction.service';

describe('ImportComponent', () => {
  let component: ImportComponent;
  let fixture: ComponentFixture<ImportComponent>;

  beforeEach(async(() => {
    let matDialogRefStub, storageStub, functionStub, transServiceStub;

    matDialogRefStub = jasmine.createSpyObj('MatDialogRef', ['close']);
    storageStub = jasmine.createSpyObj('AngularFireStorage', ['ref']);
    functionStub = jasmine.createSpyObj('AngularFireFunctions', ['httpsCallable']);
    transServiceStub = jasmine.createSpyObj('TransactionService', ['matchTransactions']);

    TestBed.configureTestingModule({
      declarations: [ImportComponent],
      imports: [MatDialogModule, MatIconModule],
      providers: [
        {
          provide: MatDialogRef,
          useValue: matDialogRefStub
        },
        {
          provide: AngularFireStorage,
          useValue: storageStub
        },
        {
          provide: AngularFireFunctions,
          useValue: functionStub
        },
        {
          provide: TransactionService,
          useValue: transServiceStub
        },
        {
          provide: MatDialogRef,
          useValue: matDialogRefStub
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            accountId: 'abcde'
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
