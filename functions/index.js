var functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.updateCategorySorting = functions.database.ref('/categories/{budgetId}/{categoryId}')
  .onWrite(event => {
    // Exit when the data is deleted.
    if (!event.data.exists()) {
      return;
    }
    // only run if sortingOrder was changed
    let sortingOrderSnapShot = event.data.child('sortingOrder');
    if (!sortingOrderSnapShot.changed()) {
      return;
    }

    const original = event.data.val();
    // get all allocations
    let allocationsRef = '/categoryAllocations/' + event.params.budgetId + '/' + event.params.categoryId;
    // update the allocations
    let allocationLocations = admin.database().ref(allocationsRef).once('value').then(results => {
      let allResults = results.val();
      // update allocations
      let updateObj = {};
      Object.keys(allResults).forEach(month => {
        // push all different items to the object
        let refAll = '/allocations/' + event.params.budgetId + '/' + month + '/' + event.params.categoryId;
        updateObj[refAll + '/sortingOrder'] = original.sortingOrder;
      });
      admin.database().ref('/').update(updateObj).then(() => console.log('Update Category ' + event.params.categoryId + ' complete.'));
    });
  });

exports.insertCategoryIntoAllocations = functions.database.ref('categories/{budgetId}/{categoryId}')
  .onWrite(event => {
    // Only edit data when it is first created.
    if (event.data.previous.exists()) {
      return;
    }
  });
