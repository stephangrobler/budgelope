import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-budgetview',
  templateUrl: './budgetview.component.html',
  styleUrls: ['./budgetview.component.css']
})
export class BudgetviewComponent implements OnInit {
  categoriesAllocations: Array<any>;

  constructor() {
    this.categoriesAllocations = [{
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
    ];
  }

  ngOnInit() {
  }

}
