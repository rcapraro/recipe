import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromApp from '../store/app.reducer';
import { map } from 'rxjs/operators';
import { Logout } from '../auth/store/auth.actions';
import { FetchRecipes, StoreRecipes } from '../recipes/store/recipe.actions';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  private userSub: Subscription;

  constructor(private authService: AuthService,
              private store: Store<fromApp.AppState>) {
  }

  ngOnInit(): void {
    this.userSub = this.store.select('auth')
      .pipe(map(authState => authState.user))
      .subscribe(
        user => {
          this.isAuthenticated = !!user;
        }
      );
  }

  onSaveData() {
    this.store.dispatch(new StoreRecipes());
  }

  onFetchData() {
    this.store.dispatch(new FetchRecipes());
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }

  onLogout() {
    this.store.dispatch(new Logout());
  }
}
