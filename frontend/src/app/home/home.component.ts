import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { SignupComponent } from '../signup/signup.component';
import { ForgetPasswordComponent } from '../forget-password/forget-password.component';
import { LoginComponent } from '../login/login.component';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { error } from 'console';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private dialog:MatDialog,
    private router:Router,
    private userService:UserService) { }

  ngOnInit(): void {
    if(localStorage.getItem('token')!=null){
      this.userService.checkToken().subscribe((response:any)=>{
        this.router.navigate(['/store/dashboard']);
      }),(error:any)=>{
        console.log(error);
      }

    }
  }
  signupAction(){
    const dialogConfig=new MatDialogConfig();
    dialogConfig.width="550px";
    this.dialog.open(SignupComponent,dialogConfig);
  }
  forgotPasswordAction(){
    const dialogConfig=new MatDialogConfig();
    dialogConfig.width="550px";
    this.dialog.open(ForgetPasswordComponent,dialogConfig);
  }
  loginAction(){
    const dialogConfig=new MatDialogConfig();
    dialogConfig.width="550px";
    this.dialog.open(LoginComponent,dialogConfig);
  }
}
