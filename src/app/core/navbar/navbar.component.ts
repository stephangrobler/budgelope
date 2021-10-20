import { Component, OnInit } from '@angular/core';
import { UserService } from '../../shared/user.service';
import { Budget } from '../../shared/budget';

@Component({
  selector: 'navi-bar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavComponent implements OnInit {
  theUser: firebase.User;
  theBudget: Budget;
  budgets: Budget[];

  constructor(private userService: UserService) {}

  ngOnInit() {}

  logout() {}
}
