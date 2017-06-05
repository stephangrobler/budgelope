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
// exports.createUser = functions.auth.user().onCreate(function(event) {
//
// });

/**
 * This removes the user data as wel as all OWNED budgets related data
 */
// exports.removeUser = functions.auth.user().onDelete(event => {
//
// });


// exports.updateCategory = functions.database.ref('/categories/{budgetId}/{categoryId}')
//   .onWrite(event => {
//     // Exit when the data is deleted.
//     if (!event.data.exists()) {
//       return;
//     }
//
//     // allocation data complete category object + planned, actual, previousBalance
//
//     // if new, add to current allocation months.
//     if (!event.data.previous.exists()) {
//
//     } else {
//
//     }
//   });

// exports.transactions = functions.database.ref('transactions/{budgetId}/{transactionId}')
//   .onWrite(event => {
//     // Exit when the data is deleted.
//     if (!event.data.exists()) {
//       //deleted
//       return;
//     }
//
//     if (!event.data.previous.exists()) {
//       // new
//
//     } else {
//       // update
//     }
//   });
