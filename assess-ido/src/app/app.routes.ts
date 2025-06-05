import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login.component';
import { TodoComponent } from './todo/todo.component';
import { AuthGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'todo', component: TodoComponent, canActivate: [AuthGuard] }
];
