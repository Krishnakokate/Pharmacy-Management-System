import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { SnackbarService } from './snackbar.service';
import { decode } from 'querystring';
import jwt_decode from 'jwt-decode'
import { GlobalConstants } from '../shared/global-constant';
@Injectable({
  providedIn: 'root'
})
export class RouteGuardService {

  constructor(public auth: AuthService,
    public router: Router,
    private snakbarService: SnackbarService) { }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    let expectedRoleArray = route.data;
    expectedRoleArray = expectedRoleArray.expectedRoleArray;

    const token: any = localStorage.getItem('token');
    var tokenPayload: any;
    try {
      tokenPayload = jwt_decode(token);
    }
    catch (err) {
      localStorage.clear();
      this.router.navigate(['/']);
    }
    let checkRole = false;
    for (let i = 0; i < expectedRoleArray.length; i++) {
      if (expectedRoleArray[i] == tokenPayload.role) {
        checkRole = true;
      }
    }
    if (tokenPayload.role == 'user' || tokenPayload.role== 'admin') {
      if (this.auth.isAuthenticated() && checkRole) {
        return true;
      }
      this.snakbarService.openSnackBar(GlobalConstants.unauthroized, GlobalConstants.error);
      this.router.navigate(['/store/dashboard']);
      return false;
    }
    else{
      this.router.navigate(['/']);
      localStorage.clear();
      return false;
    }
  }
}
