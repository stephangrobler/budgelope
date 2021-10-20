import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Budget } from '../../shared/budget';
import { BudgetService } from '../budget.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from 'app/shared/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-budget-form',
  templateUrl: 'budget.component.html',
})
export class BudgetComponent implements OnInit {
  budgetName: string;
  userId: string;

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
  });

  constructor(
    private router: Router,
    private budgetService: BudgetService,
    private auth: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.userId = this.auth.currentUserId;
  }

  async onSubmit() {
    const budget: Budget = {} as Budget;
    budget.name = this.budgetName;
    budget.user_id = this.auth.currentUserId;
    this.budgetService.add(budget);
  }

  onCancel() {
    this.router.navigate(['/budgets']);
  }
}
