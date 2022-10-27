import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AngularFireStorage } from '@angular/fire/storage';
import { TransactionService } from '../transaction.service';
import { AngularFireFunctions } from '@angular/fire/functions';
import { Subscription, Observable } from 'rxjs';
import { IImportedTransaction } from './importedTransaction';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})
export class ImportComponent implements OnInit {
  data$: Observable<any>;
  dataResponse: IImportedTransaction[];

  constructor(
    public dialogRef: MatDialogRef<ImportComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private storage: AngularFireStorage,
    private functions: AngularFireFunctions,
    private transService: TransactionService
  ) {}

  ngOnInit() {}

  uploadFile(event) {
    if (!this.data.accountId) {
      console.error('Unable to upload without an account id');
      return;
    }
    const file = event.target.files[0];
    const filepath = 'budgets/' + this.data.budgetId + '/uploads/' + this.data.accountId + '.ofx';
    const ref = this.storage.ref(filepath);
    const task = ref.put(file).then(snap => {
      // create data object
      const data = {
        filename: snap.metadata.fullPath,
        bucket: snap.metadata.bucket
      };
      const callable = this.functions.httpsCallable('addMessage');

      callable(data).subscribe(dataResponse => {
        this.dataResponse = dataResponse;
        console.log('TCL: ImportComponent -> uploadFile -> dataResponse', dataResponse);
        this.transService.matchTransactions(
          this.data.budgetId,
          this.data.accountId,
          this.data.accountName,
          dataResponse
        );
      });
    });
  }

  onMatchTransactions() {
    throw Error('Not Implemented');
  }

  onTestAddMessage() {
    const callable = this.functions.httpsCallable('addMessage');
    // callable({ text: 'some-data' }).subscribe(data => console.log(data));
  }

  onCancel() {
    this.dialogRef.close('Pizza!');
  }
}
