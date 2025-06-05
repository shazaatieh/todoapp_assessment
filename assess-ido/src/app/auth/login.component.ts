import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import jwtDecode from 'jwt-decode';

interface JwtPayload {
  sub: string; 
  email: string;
  exp: number;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private http: HttpClient, private router: Router) {}


  loginOrRegister(emailInput: HTMLInputElement, passwordInput: HTMLInputElement) {
    emailInput.setCustomValidity('');
    passwordInput.setCustomValidity('');
    this.errorMessage = '';
  
    const emailRegex = /^[^\s@]+@user\.com$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[\W_]).{8,}$/;
  
    let hasError = false;
  
    if (!this.email || !this.password) {
      if (!this.email) {
        emailInput.setCustomValidity('Email is required');
      }
      if (!this.password) {
        passwordInput.setCustomValidity('Password is required');
      }
      hasError = true;
    } else {
      if (!emailRegex.test(this.email)) {
        emailInput.setCustomValidity('Email must end with @user.com');
        hasError = true;
      }
  
      if (!passwordRegex.test(this.password)) {
        passwordInput.setCustomValidity(
          'Password must have 8+ chars, 1 capital letter, and 1 special character.'
        );
        hasError = true;
      }
    }
  
    if (hasError) {
      emailInput.reportValidity();
      passwordInput.reportValidity();
      return;
    }
  
    this.http.post('https://localhost:7171/api/Auth/login', {
      email: this.email,
      password: this.password
    }).subscribe({
      next: (res: any) => {
        localStorage.setItem('token', res.token);
        this.fetchUserAndNavigate();
      },
      error: loginErr => {
        const name = this.email.split('@')[0];
        const newUser = {
          name: name.charAt(0).toUpperCase() + name.slice(1),
          email: this.email,
          password: this.password,
          avatar: 'https://i.pravatar.cc/150?img=' + (Math.floor(Math.random() * 70) + 1)
        };
  
        this.http.post('https://localhost:7171/api/Auth/register', newUser).subscribe({
          next: (res: any) => {
            localStorage.setItem('token', res.token);
            this.fetchUserAndNavigate();
          },
          error: registerErr => {
            this.errorMessage = 'User exists but password is incorrect.';
          }
        });
      }
    });
  }
  
  
  
  fetchUserAndNavigate() {
  const token = localStorage.getItem('token');
  if (!token) return;

  const headers = { Authorization: `Bearer ${token}` };

  this.http.get('https://localhost:7171/api/Auth/profile', { headers }).subscribe({
    next: (user: any) => {
      localStorage.setItem('user', JSON.stringify(user));
      this.router.navigate(['/todo']);
    },
    error: (err) => {
      this.errorMessage = err?.error?.message || 'Failed to load user profile';
    }
  });
}


  ngOnInit() {
    if (localStorage.getItem('token') && localStorage.getItem('user') ) {
      this.router.navigate(['/todo']);
    }
  }
}
