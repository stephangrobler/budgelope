import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import * as firebase from 'firebase';

import { BudgetService } from '../../core/budget.service';
import { UserService } from '../../shared/user.service';

@Component({
  selector: 'app-budgetview',
  templateUrl: './budgetview.component.html',
  styleUrls: ['./budgetview.component.css']
})
export class BudgetviewComponent implements OnInit {
  categoriesAllocations: FirebaseListObservable<any>;
  categories: any[];
  allocations: FirebaseListObservable<any>;
  userId: string;
  activeBudget: any;
  selectedMonth: string = '201707';
  monthDisplay: Date;

  constructor(
    private db: AngularFireDatabase,
    private budgetService: BudgetService,
    private userService: UserService
  ) {
    // this.activeBudget = this.budgetService.getActiveBudget();
    // this.userId = this.userService.authUser.uid;
    this.activeBudget = { id: '-Kj4WoSIBP26dbPlEwj5' };
    this.userId = '';
    this.allocations = db.list('categoryAllocations/' + this.activeBudget.id + '/' + this.selectedMonth);
    this.allocations.subscribe(snp => {

      if (snp.length == 0){
        console.log('creating new allocations records for ' + this.selectedMonth);
        // get the categories list and push new allocations to the list.
        db.list('categories/'+this.activeBudget.id).subscribe(catSnapshots => {
          catSnapshots.forEach(catSnapshot => {
            this.allocations.update(catSnapshot.$key, {
              planned: 0,
              actual: 0,
              balance: 0,
              name: catSnapshot.name
            });
          });
        });
      }
    })
  }

  ngOnInit() {
  }

  alert(key) {
    console.log('key for', key);
  }

  focus(item) {
    console.log('focus for', item);
  }

  blur(item) {

    if (item.planned) {
      // cat.subscribe(catSnap => {
      //   val = catSnap.val();
      // });
      //   if (!val.balance) {
      //     val.balance = 0;
      //   }
      //   console.log(val);
      //   console.log("OldBalance", val.balance);
      //   val.balance += (item.Planned - val.old.Planned);
      //   console.log("NewBalance", val.balance);
      //   // check to see if the price is updated or the price is from zero
      //   // catRef.update({ "balance": val.balance });
      //   console.log(val);

      this.allocations.update(item.$key, { "planned": item.planned });
    }
  }
}
