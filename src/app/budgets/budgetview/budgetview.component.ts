import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

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
  selectedMonth: string = '201704';

  constructor(
    private db:AngularFireDatabase,
    private budgetService: BudgetService,
    private userService: UserService
  ) {
    // this.activeBudget = this.budgetService.getActiveBudget();
    // this.userId = this.userService.authUser.uid;
    this.activeBudget = {id: '-Kj4WoSIBP26dbPlEwj5'};
    this.userId = '';

    db.list('categories/' + this.activeBudget.id).subscribe((catSnap) => {
      catSnap.forEach((cat) => {
        let allRef = this.db.object('categoryAllocations/' + this.activeBudget.id +'/'+this.selectedMonth+'/' + cat.$key);
        cat.allocations = allRef;
      });
      this.categories = catSnap;
    });
  }

  ngOnInit() {
  }

}
