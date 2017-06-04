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

exports.updateCategory = functions.database.ref('/categories/{budgetId}/{categoryId}')
  .onWrite(event => {
    // Exit when the data is deleted.
    if (!event.data.exists()) {
      return;
    }

    // allocation data complete category object + planned, actual, previousBalance

    // if new, add to current allocation months.
    if (!event.data.previous.exists()){
      // current allocation
      let currentDate = new Date();
      let month = moment().format('YYYYMM');
      let nextMonth = moment().add(1, 'months').format("YYYYMM");
      let catData = event.data.val();
      let allocData = {
        "actual":0,
        "balance":0,
        "planned":0,
        "previousBalance":0,
        "name" : catData.name,
        "parent" : catData.parent,
        "sortingOrder" : catData.sortingOrder,
        "type" : catData.type,
      }
      let currentAllocationMonthRef = '/allocations/' + event.params.budgetId + '/' + month;
      let nextAllocationMonthRef = '/allocations/' + event.params.budgetId + '/' + nextMonth;
      return Promise.all([
        admin.database().ref(currentAllocationMonthRef).child(event.params.categoryId).set(allocData),
        admin.database().ref(nextAllocationMonthRef).child(event.params.categoryId).set(allocData),
        admin.database().ref('/categoryAllocations/' + event.params.budgetId + '/' + event.params.categoryId).child(month).set(true),
        admin.database().ref('/categoryAllocations/' + event.params.budgetId + '/' + event.params.categoryId).child(nextMonth).set(true)
      ]).then(() => {
        console.log('Created '+ catData.name + ' successfully!');
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
        return admin.database().ref('/').update(updateObj).then(() => console.log('Update Category ' + event.params.categoryId + ':' + original.name + ' complete.'));
      });
    }


  });
