import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {

  constructor(private router: Router) { }

  canActivate(): boolean | Observable<boolean> | Promise<boolean> {
    const token = localStorage.getItem('authToken');
    console.log("token is in canactive",token)

    if (token) {
      this.router.navigate(['/home']);
      return false;
    } else {
      
      return true;
    }
  }
}
