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
  userId: string;
  activeBudget: any;

  constructor(
    private db:AngularFireDatabase,
    private budgetService: BudgetService,
    private userService: UserService
  ) {
    this.activeBudget = this.budgetService.getActiveBudget();
    this.userId = this.userService.authUser.uid;

    db.list('categories/'+this.userId, ).subscribe(categories => {
      categories.forEach(snap => {
        let dbRef = 'categoryAllocations/' + this.activeBudget.id + '/' + snap.$key;
        snap.allocations = this.db.list(dbRef, {
          query: {
            limitToLast: 2
          }
        });

      });
      console.log(categories);
      this.categories = categories;
    });



    /*
      "category": "Groceries",
      "allocations": {
        "2017-04": {
          "Planned": 500,
          "Actual": 0,
          "Balance": 500
        },
        "2017-05": {
          "Planned": 1500,
          "Actual": 2000,
          "Balance": -500
        },
        "2017-06": {
          "Planned": 500,
          "Actual": 1000,
          "Balance": -500
        }
      },
    }, {
        "category": "Spending Money",
        "allocations": {
          "2017-04": {
            "Planned": 500,
            "Actual": 0,
            "Balance": 500
          },
          "2017-05": {
            "Planned": 1500,
            "Actual": 1000,
            "Balance": 500
          },
          "2017-06": {
            "Planned": 500,
            "Actual": 1000,
            "Balance": -500
          }
        },
      }, {
        "category": "Restaurants",
        "allocations": {
          "2017-04": {
            "Planned": 500,
            "Actual": 0,
            "Balance": 500
          },
          "2017-05": {
            "Planned": 1500,
            "Actual": 1000,
            "Balance": 500
          },
          "2017-06": {
            "Planned": 500,
            "Actual": 1000,
            "Balance": -500
          }
        },
      }
    ];*/
  }

  ngOnInit() {
  }

}
