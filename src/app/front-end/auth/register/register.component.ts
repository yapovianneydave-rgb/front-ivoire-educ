import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  currentStep = 1;
  showPassword = false;
  showConfirm = false;
  errorMessage = ''; // Pour afficher les erreurs proprement sans alert()

  form = {
    nom: '',
    prenom: '',
    role: '',
    telephone: '',
    email: '',
    commune: '',
    quartier: '',
    password: '',
    confirm: '',
    acceptConditions: false
  };

  constructor(private router: Router) {}

  /**
   * Passage à l'étape suivante avec validation stricte des champs obligatoires
   */
  nextStep() {
    this.errorMessage = ''; // Réinitialise l'erreur

    if (this.currentStep === 1) {
      if (!this.form.nom.trim() || !this.form.prenom.trim()) {
        this.errorMessage = 'Le nom et le prénom sont obligatoires.';
        return;
      }
      if (!this.form.role) {
        this.errorMessage = 'Veuillez sélectionner si vous êtes Répétiteur ou Parent.';
        return;
      }
    }

    if (this.currentStep === 2) {
      if (!this.form.telephone.trim()) {
        this.errorMessage = 'Le numéro de téléphone est obligatoire.';
        return;
      }
      if (!this.form.email.trim()) {
        this.errorMessage = "L'adresse email est obligatoire.";
        return;
      }
      if (!this.isValidEmail(this.form.email)) {
        this.errorMessage = "Le format de l'adresse email n'est pas valide.";
        return;
      }
    }

    if (this.currentStep < 3) {
      this.currentStep++;
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Remonte proprement en haut de la carte
    }
  }

  /**
   * Retour à l'étape précédente
   */
  prevStep() {
    this.errorMessage = '';
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  /**
   * Soumission finale du formulaire d'inscription
   */
  onSubmit() {
    this.errorMessage = '';

    if (!this.form.password || !this.form.confirm) {
      this.errorMessage = 'Veuillez configurer et confirmer votre mot de passe.';
      return;
    }

    if (this.form.password !== this.form.confirm) {
      this.errorMessage = 'Les deux mots de passe ne correspondent pas.';
      return;
    }

    if (this.form.password.length < 6) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères.';
      return;
    }

    if (!this.form.acceptConditions) {
      this.errorMessage = 'Vous devez accepter les conditions générales pour continuer.';
      return;
    }

    // Tout est OK
    console.log('✅ Inscription Élite Académie réussie ! Data :', this.form);

    // Redirection vers la page de connexion
    this.router.navigate(['/auth/login']);
  }

  /**
   * Validation du format Email via une Regex simple
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
