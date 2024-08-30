import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './Dashboard/dashboard.component';
import { AuthGuard } from './auth.guard';
import { OptionChainComponent } from './option-chain/option-chain.component';
import { LoginGuard } from './login.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'home', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'optionchain', component: OptionChainComponent, canActivate: [AuthGuard] }
];
