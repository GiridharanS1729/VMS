import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent {

  constructor(private router: Router) { }

  submitForm(action: string): void {
    const form = document.getElementById('authForm') as HTMLFormElement;
    const username = (document.getElementById('username') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;

    if (action === 'login') {
      form.action = 'http://localhost:4201/login';
      this.router.navigate(['/home']);
    } else if (action === 'signup') {
      form.action = 'http://localhost:4201/signup';
      form.submit();
    }
  }
}
