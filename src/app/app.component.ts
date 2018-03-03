import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';



import { UserService } from './core/user.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app works!';


  constructor(private userService: UserService) {

  }

  ngOnInit() {
    this.userService.verifyUser();
    console.log('running app');
    let messaging = firebase.messaging();
    messaging.requestPermission()
      .then(function() {
        console.log('Notification permission granted.');
        // TODO(developer): Retrieve an Instance ID token for use with FCM.
        // ...
      })
      .catch(function(err) {
        console.log('Unable to get permission to notify.', err);
      });
  }
}
