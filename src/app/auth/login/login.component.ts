import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  UntypedFormControl,
  Validators,
  UntypedFormGroup,
} from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { NotificationService } from 'src/app/core/services/notification.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm!: UntypedFormGroup;
  loading!: boolean;

  constructor(
    private router: Router,
    private titleService: Title,
    private notificationService: NotificationService,
    private authenticationService: AuthenticationService
  ) {}

  ngOnInit() {
    this.titleService.setTitle('Projeto Petrobras - Login');
    this.authenticationService.logout();
    this.createForm();
  }

  private createForm() {
    const savedUserEmail = localStorage.getItem('savedUserEmail');

    this.loginForm = new UntypedFormGroup({
      email: new UntypedFormControl(savedUserEmail, [
        Validators.required,
        Validators.email,
      ]),
      password: new UntypedFormControl('', Validators.required),
    });
  }

  login() {
    const email = this.loginForm.get('email')?.value;
    const password = this.loginForm.get('password')?.value;

    this.loading = true;
    this.authenticationService.login(email.toLowerCase(), password).subscribe(
      (data) => {
        localStorage.removeItem('savedUserEmail');

        this.router.navigate(['/']);
      },
      (error) => {
        this.notificationService.openSnackBar(error.error);
        this.loading = false;
      }
    );
  }

}
