import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AngularFireStorage } from '@angular/fire/storage';
import { TransactionService } from '../transaction.service';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})
export class ImportComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<ImportComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private storage: AngularFireStorage,
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
      console.log(snap);
    });
  }

  onMatchTransactions() {
    this.transService.matchTransactions(this.data.budgetId, this.data.accountId, this.data.accountName);
  }

  onCancel() {
    this.dialogRef.close('Pizza!');
  }
}
