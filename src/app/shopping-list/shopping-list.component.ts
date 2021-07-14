import { Component, OnDestroy, OnInit } from '@angular/core';
import { Ingredient } from '../shared/ingredient.model';
import { Observable } from 'rxjs';
import * as fromApp from '../store/app.reducer';
import { Store } from '@ngrx/store';
import { StartEdit } from './store/shopping-list-actions';

@Component({
  selector: 'app-shopping-list',
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.css']
})
export class ShoppingListComponent implements OnInit, OnDestroy {

  ingredients: Observable<{ ingredients: Ingredient[] }>;

  constructor(private store: Store<fromApp.AppState>) {
  }

  ngOnInit(): void {
    this.ingredients = this.store.select('shoppingList')
  }

  ngOnDestroy(): void {
  }

  onEditItem(id: number) {
    this.store.dispatch(new StartEdit(id));
  }
}
