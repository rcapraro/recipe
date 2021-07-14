import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as fromApp from '../../store/app.reducer';
import { map } from 'rxjs/operators';
import { AddRecipe, UpdateRecipe } from '../store/recipe.actions';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-recipe-edit',
  templateUrl: './recipe-edit.component.html',
  styleUrls: ['./recipe-edit.component.css']
})
export class RecipeEditComponent implements OnInit, OnDestroy {
  id: number;
  editMode: boolean = false;
  recipeEditForm: FormGroup;
  private storeSub: Subscription;

  constructor(private store: Store<fromApp.AppState>,
              private route: ActivatedRoute,
              private router: Router) {
  }

  get controls() {
    return (<FormArray>this.recipeEditForm.get('ingredients')).controls;
  }

  ngOnInit(): void {
    this.route.params.subscribe(
      (params: Params) => {
        this.id = +params['id'];
        this.editMode = params['id'] != null;
        this.initForm();
      }
    )
  }

  ngOnDestroy(): void {
    if (this.storeSub) {
      this.storeSub.unsubscribe();
    }
  }

  onAddIngredient() {
    (<FormArray>this.recipeEditForm.get('ingredients')).push(
      new FormGroup({
        'name': new FormControl(null, Validators.required),
        'amount': new FormControl(null, [
          Validators.required,
          Validators.pattern(/^[1-9]+[0-9]*$/)
        ]),
        'unit': new FormControl()
      })
    );
  }

  onDeleteIngredient(id: number) {
    (<FormArray>this.recipeEditForm.get('ingredients')).removeAt(id);
  }

  onSubmit() {
    if (this.editMode) {
      //this.recipeService.updateRecipe(this.id, this.recipeEditForm.value);
      this.store.dispatch(new UpdateRecipe({index: this.id, newRecipe: this.recipeEditForm.value}));
    } else {
      this.store.dispatch(new AddRecipe(this.recipeEditForm.value));
    }
    this.onCancel();
  }

  onCancel() {
    this.router.navigate(['../'], {relativeTo: this.route});
  }

  private initForm() {
    let recipeName = '';
    let recipeImagePath = '';
    let recipeDescription = '';
    let recipeIngredients = new FormArray([]);

    if (this.editMode) {
      this.storeSub = this.store.select('recipes')
        .pipe(
          map(recipeState => recipeState.recipes.find(
            (_, index) => index === this.id)
          )
        ).subscribe(
          recipe => {
            recipeName = recipe.name;
            recipeImagePath = recipe.imagePath;
            recipeDescription = recipe.description;
            if (recipe.ingredients) {
              for (let ingredient of recipe.ingredients) {
                recipeIngredients.push(new FormGroup(
                  {
                    'name': new FormControl(ingredient.name, Validators.required),
                    'amount': new FormControl(ingredient.amount,
                      [
                        Validators.required,
                        Validators.pattern(/^[1-9]+[0-9]*$/)
                      ]),
                    'unit': new FormControl(ingredient.unit)
                  }
                ));
              }
            }
          })
    }

    this.recipeEditForm = new FormGroup(
      {
        'name': new FormControl(recipeName, Validators.required),
        'imagePath': new FormControl(recipeImagePath, Validators.required),
        'description': new FormControl(recipeDescription, Validators.required),
        'ingredients': recipeIngredients
      }
    );
  }
}
