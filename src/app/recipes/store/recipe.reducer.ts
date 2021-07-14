import { Recipe } from '../recipe.model';
import * as RecipesActions from './recipe.actions';
import { ADD_RECIPE, DELETE_RECIPE, UPDATE_RECIPE } from './recipe.actions';

export interface State {
  recipes: Recipe[];
}

const initialState: State = {
  recipes: []
}

export function recipeReducer(state: State = initialState, action: RecipesActions.RecipesActions) {
  switch (action.type) {
    case RecipesActions.SET_RECIPES:
      return {
        ...state,
        recipes: [...action.payload]
      };
    case ADD_RECIPE:
      return {
        ...state,
        recipes: [...state.recipes, action.payload]
      };
    case UPDATE_RECIPE:
      const updatedRecipe = {...state.recipes[action.payload.index], ...action.payload.newRecipe};
      const updatedRecipes = [...state.recipes];
      updatedRecipes[action.payload.index] = updatedRecipe;

      return {
        ...state,
        recipes: updatedRecipes
      }
    case DELETE_RECIPE:
      return {
        ...state,
        recipes: state.recipes.filter((_, index) => index !== action.payload)
      };
    default:
      return state;
  }
}
