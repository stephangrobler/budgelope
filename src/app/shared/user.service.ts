import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { environment } from '../../environments/environment';
import * as firebase from 'firebase';

@Injectable()
export class UserService implements CanActivate {
  userLoggedIn: boolean = false;
  loggedInUser: string;
  authUser: any;


  constructor(private router: Router) {
    firebase.initializeApp(environment.firebase);
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    let url: string = state.url;
    return this.verifyLogin(url);
  }

  verifyLogin(url: string): boolean {
    if (this.userLoggedIn) { return true; }

    this.router.navigate(['/login']);
    return false;
  }

  register(email: string, password: string) {
    firebase.auth().createUserWithEmailAndPassword(email, password)
      .catch(function(error) {
        alert(`${error.message} Please try again!`);
      });
  }

  verifyUser() {
    this.authUser = firebase.auth().currentUser;
    if (this.authUser) {
      this.loggedInUser = this.authUser.email;
      this.userLoggedIn = true;
    }
  }

  login(loginEmail: string, loginPassword: string) {
    firebase.auth().signInWithEmailAndPassword(loginEmail, loginPassword)
      .catch(function(error) {
        alert(`${error.message} Unable to login. Try again.`);
      })
  }

  logout() {
    this.userLoggedIn = false;
    firebase.auth().signOut().then(function() {
      alert(`Logged out!`);
    }, function(error) {
      alert(`${error.message} Unable to logout. Try again!`);
    });
  }

  setupProfile(uid: string) {
    if (!uid){
      return;
    }

    let budgetRef = firebase.database().ref('/budgets').push();
    let budgetKey = budgetRef.key;
    // create a budget
    budgetRef.update({
      active: true,
      balance: 0,
      name: "Starting Budget",
      owner: uid
    });

    // create a profile and set active budget
    let profileRef = firebase.database().ref('/users/' + uid).set({
      activeBudget: budgetKey,
      registered: "",
      subscription: "trial"
    });

    // create all default categories for the budget
    let categories = [
      {
        "name": "Giving",
        "parent": ""
      }, {
        "name": "Tithing",
        "parent": "Giving"
      }, {
        "name": "Offerings",
        "parent": "Giving"
      }, {
        "name": "Charities",
        "parent": "Giving"
      }, {
        "name": "Specific Needs",
        "parent": "Giving"
      }, {
        "name": "Food",
        "parent": ""
      }, {
        "name": "Groceries",
        "parent": "Food"
      }, {
        "name": "Restaurants",
        "parent": "Food"
      }, {
        "name": "Pet food/Treats",
        "parent": "Food"
      }, {
        "name": "Shelter",
        "parent": ""
      }, {
        "name": "Mortgage",
        "parent": "Shelter"
      }, {
        "name": "Rent",
        "parent": "Shelter"
      }, {
        "name": "Property Taxes",
        "parent": "Shelter"
      }, {
        "name": "Household Repairs",
        "parent": "Shelter"
      }, {
        "name": "Utilities",
        "parent": ""
      }, {
        "name": "Electricity",
        "parent": "Utilities"
      }, {
        "name": "Water",
        "parent": "Utilities"
      }, {
        "name": "Heating",
        "parent": "Utilities"
      }, {
        "name": "Garbage",
        "parent": "Utilities"
      }, {
        "name": "Phones",
        "parent": "Utilities"
      }, {
        "name": "Cable",
        "parent": "Utilities"
      }, {
        "name": "Internet",
        "parent": "Utilities"
      }, {
        "name": "Clothing",
        "parent": ""
      }, {
        "name": "Childrens Clothing",
        "parent": "Clothing"
      }, {
        "name": "Adults Clothing",
        "parent": "Clothing"
      }, {
        "name": "Transportation",
        "parent": ""
      }, {
        "name": "Fuel",
        "parent": "Transportation"
      }, {
        "name": "Tires",
        "parent": "Transportation"
      }, {
        "name": "Oil Changes",
        "parent": "Transportation"
      }, {
        "name": "Maintenance",
        "parent": "Transportation"
      }, {
        "name": "Parking Fees",
        "parent": "Transportation"
      }, {
        "name": "Repairs",
        "parent": "Transportation"
      }, {
        "name": "Licence Fees",
        "parent": "Transportation"
      }, {
        "name": "Vehicle Replacement",
        "parent": "Transportation"
      }, {
        "name": "Medical",
        "parent": ""
      }, {
        "name": "Primary Care",
        "parent": "Medical"
      }, {
        "name": "Dental Care",
        "parent": "Medical"
      }, {
        "name": "Speciality Care",
        "parent": "Medical"
      }, {
        "name": "Medications",
        "parent": "Medical"
      }, {
        "name": "Medical Devices",
        "parent": "Medical"
      }, {
        "name": "Insurance",
        "parent": ""
      }, {
        "name": "Health Insurance",
        "parent": "Insurance"
      }, {
        "name": "Homeowners Insurance",
        "parent": "Insurance"
      }, {
        "name": "Renters Insurance",
        "parent": "Insurance"
      }, {
        "name": "Auto Insurance",
        "parent": "Insurance"
      }, {
        "name": "Life Insurance",
        "parent": "Insurance"
      }, {
        "name": "Disability Insurance",
        "parent": "Insurance"
      }, {
        "name": "Identity Insurance",
        "parent": "Insurance"
      }, {
        "name": "Longterm Care Insurance",
        "parent": "Insurance"
      }, {
        "name": "Household Items",
        "parent": ""
      }, {
        "name": "Toiletries",
        "parent": "Household Items"
      }, {
        "name": "Laundry Detergent",
        "parent": "Household Items"
      }, {
        "name": "Dishwasher Detergent",
        "parent": "Household Items"
      }, {
        "name": "Cleaning Supplies",
        "parent": "Household Items"
      }, {
        "name": "Personal",
        "parent": ""
      }, {
        "name": "Gym Memberships",
        "parent": "Personal"
      }, {
        "name": "Hair Cuts",
        "parent": "Personal"
      }, {
        "name": "Salon Services",
        "parent": "Personal"
      }, {
        "name": "Cosmeticts",
        "parent": "Personal"
      }, {
        "name": "Babysitter",
        "parent": "Personal"
      }, {
        "name": "Child Support",
        "parent": "Personal"
      }, {
        "name": "Alimony",
        "parent": "Personal"
      }, {
        "name": "Subscriptions",
        "parent": "Personal"
      }, {
        "name": "Debt Reduction",
        "parent": ""
      }, {
        "name": "Mortgage",
        "parent": "Debt Reduction"
      }, {
        "name": "Credit Card",
        "parent": "Debt Reduction"
      }, {
        "name": "Personal Loan",
        "parent": "Debt Reduction"
      }, {
        "name": "Student Loan",
        "parent": "Debt Reduction"
      }, {
        "name": "Retirement",
        "parent": ""
      }, {
        "name": "Financial Planning",
        "parent": "Retirement"
      }, {
        "name": "Investing",
        "parent": "Retirement"
      }, {
        "name": "Education",
        "parent": ""
      }, {
        "name": "Financial Coaching",
        "parent": "Education"
      }, {
        "name": "Childrens College",
        "parent": "Education"
      }, {
        "name": "Your College",
        "parent": "Education"
      }, {
        "name": "School Supplies",
        "parent": "Education"
      }, {
        "name": "Books",
        "parent": "Education"
      }, {
        "name": "Conferences",
        "parent": "Education"
      }, {
        "name": "Savings",
        "parent": ""
      }, {
        "name": "Emergency Fund",
        "parent": "Savings"
      }, {
        "name": "Hill and Valley Fund",
        "parent": "Savings"
      }, {
        "name": "Other Savings",
        "parent": "Savings"
      }, {
        "name": "Gifts",
        "parent": ""
      }, {
        "name": "Birthday",
        "parent": "Gifts"
      }, {
        "name": "Anniversary",
        "parent": "Gifts"
      }, {
        "name": "Wedding",
        "parent": "Gifts"
      }, {
        "name": "Christmas",
        "parent": "Gifts"
      }, {
        "name": "Special Occasion",
        "parent": "Gifts"
      }, {
        "name": "Fun Money",
        "parent": ""
      }, {
        "name": "Entertainment",
        "parent": "Fun Money"
      }, {
        "name": "Games",
        "parent": "Fun Money"
      }, {
        "name": "Eating Out",
        "parent": "Fun Money"
      }, {
        "name": "Spontaneous Giving",
        "parent": "Fun Money"
      }, {
        "name": "Vacations",
        "parent": "Fun Money"
      }, {
        "name": "Subscriptions",
        "parent": "Fun Money"
      },];

    let baseCategory = {
      "name": "",
      "parent": "",
      "parentId": "",
      "balance": 0,
      "hidden": false,
      "sortingOrder": "",
      "type": "expense"
    }

    let catListRef = firebase.database().ref('/categories/' + budgetKey);
    let parentCount = 0;
    let parentKey = "";
    let childCount = 0;
    categories.forEach(category => {
      let catRef = catListRef.push();
      let catKey = catRef.key;
      baseCategory.name = category.name;
      baseCategory.parent = category.parent;

      if (category.parent == "") {
        parentCount++;
        baseCategory.sortingOrder = ('000' + parentCount).slice(-3);
        parentKey = catKey;
        childCount = 0;
      } else {
        childCount++;
        baseCategory.sortingOrder = ('000' + parentCount).slice(-3);
        baseCategory.sortingOrder += ':' + ('000' + childCount).slice(-3);
        baseCategory.parentId = parentKey;
      }

      catRef.set(baseCategory);
    });
  }

}
