import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ACCUEIL_PAR_ROLE, AuthDemoService } from '../../services/auth-demo.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
    email: string = '';
  password: string = '';
  showPassword:boolean = false;

  constructor(private router: Router, private auth: AuthDemoService) {}

  onLogin(): void {

    if (!this.email || !this.password) {
      alert('Veuillez remplir tous les champs');
      return;
    }


    // Le champ « email » porte désormais le matricule (PAR-…, REP-…, ADM-…).
    const role = this.auth.connecter(this.email, this.password);
    if (!role) {
      alert('Matricule ou mot de passe incorrect');
      return;
    }

    this.router.navigate([ACCUEIL_PAR_ROLE[role]]);
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}
