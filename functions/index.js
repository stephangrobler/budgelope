var functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Storage } = require('@google-cloud/storage');
const moment = require('moment');
const path = require('path');
const fs = require('fs');
const os = require('os');
const xml2js = require('xml2js');

admin.initializeApp(functions.config().firebase);
const settings = { timestampsInSnapshots: true };
const db = admin.firestore();
db.settings(settings);

exports.importOFX = functions.storage.object().onFinalize(object => {
  
  console.log(object);
  // Exit if this is triggered on a file that is not an image.
  if (!object.contentType.startsWith('application/')) {
    console.log('This is not an ofx file.');
    return null;
  }
  
  // get the file to local instance first
  const filePath = object.name; // File path in the bucket.
  const fileDir = path.dirname(filePath);
  const fileBucket = object.bucket;
  const fileParts = filePath.split('/');
  const tempLocalFile = path.join(os.tmpdir(), filePath);
  const tempLocalDir = path.dirname(tempLocalFile);
  const storage = new Storage({
    projectId: 'yrab-6c2b5'
  });
  // the budget id will be the second part and the account id will be the 4th with .ofx extension
  

  // Download file from bucket.
  // Get the file name.
  const fileName = path.basename(filePath);
  const bucket = storage.bucket(fileBucket);
  const tempFilePath = path.join(os.tmpdir(), fileName);

  return bucket.file(filePath).download({
    destination: tempFilePath,
  }).then(() => {
    console.log('OFX downloaded locally to', tempFilePath);

    
    var parser = new xml2js.Parser({ explicitArray: false, normalizeTags: true });
    console.log(parser);
    fs.readFile(tempFilePath, 'utf8', (err, ofxStr) => {
      if (err) console.log(err);
      console.log('Read the file succesfully.');
      var data = {
        xml: ''
      };

      var ofxRes = ofxStr.split('<OFX>', 2);
      var ofx = '<OFX>' + ofxRes[1];
      var headerString = ofxRes[0].split(/\r|\n/);
      //console.log("OFX FILE: \n" + ofx);

      data.xml = ofx
        .replace(/>\s+</g, '><')
        .replace(/\s+</g, '<')
        .replace(/>\s+/g, '>')
        .replace(/<([A-Z0-9_]*)+\.+([A-Z0-9_]*)>([^<]+)/g, '<$1$2>$3')
        .replace(/<(\w+?)>([^<]+)/g, '<$1>$2</$1>');

      // console.log(data.xml);
      console.log('Converted to xml.');
      parser.parseString(data.xml, (err, result) => {
        if (err) console.log(err);
        console.log('Succesfully parsed the xml');
        // console.log(result.ofx.bankmsgsrsv1.stmttrnrs.stmtrs.banktranlist.stmttrn);
        let transactionList = result.ofx.bankmsgsrsv1.stmttrnrs.stmtrs.banktranlist.stmttrn;
        let accountNumber = result.ofx.bankmsgsrsv1.stmttrnrs.stmtrs.bankacctfrom.acctid;
        
        transactionList = transactionList.filter(tran => {
          return tran.dtposted > '20181122';
        });
        
        console.log('Filter transactions:', transactionList.length);

        const refString = '/budgets/' + fileParts[1] + '/imported/' + path.basename(filePath, '.ofx') + '/transactions';
        console.log('Collection to upload to: ' + refString);
        const ref = db.collection(refString);
        const trPromises = [];
        db.collection('/test').doc('test').set({name: 'test'}).then((result) => {
          console.log(result);
        }).catch((reason) => {
          console.log(reason);
        })
        for (let i = 0; i < transactionList.length; i++) {
          let transaction = transactionList[i];
          transaction.trnamt = Number(transaction.trnamt);
          transaction.acctid = accountNumber;
          console.log(i, transaction);
          trPromises.push(ref.doc(transaction.fitid).set(transaction));
          
        }
        return Promise.all(trPromises)
          .then((results) => console.log(results))
          .catch((reason) => console.log(reason));
      });
    });
  });
});

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
