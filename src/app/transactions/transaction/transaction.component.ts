import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';


@Component({
  templateUrl: 'component-name.component.html',
})
export class nameComponent implements OnInit {
  payee: string;
  accountId: string;
  categoryId: string;

  constructor() {  }

  ngOnInit() {}
}
