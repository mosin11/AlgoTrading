import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './Dashboard/dashboard.component';
import { AuthGuard } from './auth.guard';
import { OptionChainComponent } from './option-chain/option-chain.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'home', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'optionchain', component: OptionChainComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/optionchain', pathMatch: 'full' }
];
