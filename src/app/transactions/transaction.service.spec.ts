import { TestBed, async } from '@angular/core/testing';
import { TransactionService } from './transaction.service';

describe('Transaction Service to be thing', () => {
  let service: TransactionService;
  let dbMock, categoryServiceMock;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [TransactionService] });
    this.dbMock = jasmine.createSpyObj('AngularFirestore', ['collection', 'doc']);
    this.categoryServiceMock = jasmine.createSpyObj('CategoryService', ['test']);
  });

  it('should register as a service', () => {
    this.dbMock.doc.and.returnValue({valueChanges:()=>{}});
    service = new TransactionService(this.dbMock, this.categoryServiceMock);
    let subscription = service.getTransaction('string', 'string2');
    expect(this.dbMock.doc).toHaveBeenCalledWith('budgets/string/transactions/string2');
  });

});
