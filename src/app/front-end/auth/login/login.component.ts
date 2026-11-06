import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

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

  private readonly IDENTIFIANT_VALIDE = '150503Y@';
  private readonly MOT_DE_PASSE_VALIDE = 'ivoire2026';


  constructor(private router: Router) {}

  onLogin(): void {

    if (!this.email || !this.password) {
      alert('Veuillez remplir tous les champs');
      return;
    }


    if (this.email !== this.IDENTIFIANT_VALIDE || this.password !== this.MOT_DE_PASSE_VALIDE) {
      alert('Identifiant ou mot de passe incorrect');
      return;
    }

    console.log('✅ Connexion réussie:', this.email);

    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userId', this.email);
    localStorage.setItem('userName', 'Kouassi Jean');


    this.router.navigate(['/parent/tableau-de-bord']);
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}
