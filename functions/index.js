var functions = require('firebase-functions');
const admin = require('firebase-admin');
const moment = require('moment');
admin.initializeApp(functions.config().firebase);
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

/**
 * This does the initial setup for the user on account creation
 */
exports.createUser = functions.auth.user().onCreate(function(event) {
  let uid = event.data.uid;


  let budgetRef = admin.database().ref('/budgets').push();
  let budgetKey = budgetRef.key;
  // create a budget
  budgetRef.update({
    active: true,
    balance: 0,
    name: "Starting Budget",
    owner: uid
  });

  // create a profile and set active budget
  let profileRef = admin.database().ref('/users/' + uid).set({
    activeBudget: budgetKey,
    registered: "",
    subscription: "trial"
  });

  // create all default categories for the budget
  let categories = [{
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
  }, ];

  let baseCategory = {
    "balance": 0,
    "hidden": false,
    "sortingOrder": "",
    "type": "expense"
  }

  let catListRef = admin.database().ref('/categories/'+budgetKey);
  let parentCount = 0;
  let parentKey = "";
  let childCount = 0;
  categories.forEach(category => {
    let catRef = catListRef.push();
    let catKey = catRef.key;
    baseCategory.name = category.name;
    baseCategory.parent = category.parent;

    if (category.parent == ""){
      parentCount++;
      baseCategory.sortingOrder = ('000'+parentCount).slice(-3);
      parentKey = catKey;
      childCount = 0;
    } else {
      childCount++;
      baseCategory.sortingOrder = ('000'+parentCount).slice(-3);
      baseCategory.sortingOrder += ':' + ('000'+childCount).slice(-3);
      baseCategory.parentId = parentKey;
    }

    catRef.set(baseCategory);
  });
});

/**
 * This removes the user data as wel as all OWNED budgets related data
 */
exports.removeUser = functions.auth.user().onDelete(event => {

});


exports.updateCategory = functions.database.ref('/categories/{budgetId}/{categoryId}')
  .onWrite(event => {
    // Exit when the data is deleted.
    if (!event.data.exists()) {
      return;
    }

    // allocation data complete category object + planned, actual, previousBalance

    // if new, add to current allocation months.
    if (!event.data.previous.exists()) {
      // current allocation
      let currentDate = new Date();
      let month = moment().format('YYYYMM');
      let nextMonth = moment().add(1, 'months').format("YYYYMM");
      let catData = event.data.val();
      let allocData = {
        "actual": 0,
        "balance": 0,
        "planned": 0,
        "previousBalance": 0,
        "name": catData.name,
        "parent": catData.parent,
        "sortingOrder": catData.sortingOrder,
        "type": catData.type,
      }
      let currentAllocationMonthRef = '/allocations/' + event.params.budgetId + '/' + month;
      let nextAllocationMonthRef = '/allocations/' + event.params.budgetId + '/' + nextMonth;
      return Promise.all([
        admin.database().ref(currentAllocationMonthRef).child(event.params.categoryId).set(allocData),
        admin.database().ref(nextAllocationMonthRef).child(event.params.categoryId).set(allocData),
        admin.database().ref('/categoryAllocations/' + event.params.budgetId + '/' + event.params.categoryId).child(month).set(true),
        admin.database().ref('/categoryAllocations/' + event.params.budgetId + '/' + event.params.categoryId).child(nextMonth).set(true)
      ]).then(() => {
        console.log('Created ' + catData.name + ' successfully!');
      });
    } else {
      let updateObj = {};

      // only run if sortingOrder was changed
      let sortingOrderSnapShot = event.data.child('sortingOrder');

      const original = event.data.val();
      // get all allocations
      let allocationsRef = '/categoryAllocations/' + event.params.budgetId + '/' + event.params.categoryId;
      // update the allocations
      let allocationLocations = admin.database().ref(allocationsRef).once('value').then(results => {
        let allResults = results.val();
        // update allocations

        Object.keys(allResults).forEach(month => {
          // push all different items to the object
          let refAll = '/allocations/' + event.params.budgetId + '/' + month + '/' + event.params.categoryId;
          updateObj[refAll + '/sortingOrder'] = original.sortingOrder;
          updateObj[refAll + '/name'] = original.name;
          updateObj[refAll + '/parent'] = original.parent;
          updateObj[refAll + '/type'] = original.type;
        });
        return admin.database().ref('/').update(updateObj).then(() => {
          console.log('Update Category ' + event.params.categoryId + ':' + original.name + ' complete.');
        });
      });
    }
  });

exports.transactions = functions.database.ref('transactions/{budgetId}/{transactionId}')
  .onWrite(event => {
    // Exit when the data is deleted.
    if (!event.data.exists()) {
      //deleted
      return;
    }

    if (!event.data.previous.exists()) {
      // new

    } else {
      // update
    }
  });
