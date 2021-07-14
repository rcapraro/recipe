import { Actions, createEffect, ofType } from '@ngrx/effects';
import { FETCH_RECIPES, SetRecipes, STORE_RECIPES } from './recipe.actions';
import { map, switchMap, withLatestFrom } from 'rxjs/operators';
import { Recipe } from '../recipe.model';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromApp from '../../store/app.reducer';

@Injectable()
export class RecipeEffects {
  fetchRecipes$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(FETCH_RECIPES),
      switchMap(() => {
        return this.http.get<Recipe[]>(
          'https://recipe-f970d-default-rtdb.europe-west1.firebasedatabase.app/recipes.json',
        );
      }),
      map(recipes => {
        return recipes.map(recipe => {
          return {...recipe, ingredients: recipe.ingredients ? recipe.ingredients : []}
        })
      }),
      map(recipes => {
        return new SetRecipes(recipes);
      })
    );
  });

  storeRecipes$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(STORE_RECIPES),
      withLatestFrom(this.store.select('recipes')),
      switchMap(([actionData, recipesState]) => {
        return this.http.put(
          'https://recipe-f970d-default-rtdb.europe-west1.firebasedatabase.app/recipes.json',
          recipesState.recipes
        )
      })
    );
  }, {dispatch: false});

  constructor(private actions$: Actions, private http: HttpClient, private store: Store<fromApp.AppState>) {
  }
}
