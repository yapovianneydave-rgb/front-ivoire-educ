import { Component, OnDestroy, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

type Canal = 'sms' | 'email';

/** Durée avant de pouvoir redemander un code, en secondes. */
const DELAI_RENVOI = 180;

/** Nombre d'envois de code autorisés par heure. */
const ENVOIS_MAX = 3;

@Component({
  selector: 'app-mot-de-passe-oublie',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './mot-de-passe-oublie.component.html',
  styleUrls: ['./mot-de-passe-oublie.component.css']
})
export class MotDePasseOublieComponent implements OnDestroy {

  /** Étape courante du parcours : 1 identification, 2 code, 3 nouveau mot de passe. */
  readonly etape = signal<1 | 2 | 3>(1);

  readonly erreur = signal<string | null>(null);
  readonly secousse = signal(false);

  // ===== Étape 1 =====
  identifiant = '';
  readonly canal = signal<Canal>('sms');

  // ===== Étape 2 =====
  readonly chiffres = signal<string[]>(['', '', '', '', '', '']);
  readonly envois = signal(1);
  readonly secondesRestantes = signal(DELAI_RENVOI);
  private minuteur?: ReturnType<typeof setInterval>;

  // ===== Étape 3 =====
  motDePasse = '';
  confirmation = '';
  afficherMotDePasse = false;

  /** Destination masquée, affichée après l'envoi du code. */
  readonly destinationMasquee = computed(() =>
    this.canal() === 'sms' ? this.masquerTelephone(this.identifiant) : this.masquerEmail(this.identifiant)
  );

  readonly apercuSms = computed(() => this.masquerTelephone(this.identifiant));
  readonly apercuEmail = computed(() => this.masquerEmail(this.identifiant));

  readonly codeComplet = computed(() => this.chiffres().every(c => c !== ''));

  readonly peutRenvoyer = computed(
    () => this.secondesRestantes() === 0 && this.envois() < ENVOIS_MAX
  );

  readonly compteARebours = computed(() => {
    const total = this.secondesRestantes();
    const m = Math.floor(total / 60);
    const s = total % 60;
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  });

  /** Score de robustesse du mot de passe, de 0 à 100. */
  readonly robustesse = computed(() => {
    const mdp = this.motDePasseSignal();
    if (!mdp) return 0;
    let score = 0;
    if (mdp.length >= 8) score += 35;
    if (mdp.length >= 12) score += 15;
    if (/[A-Z]/.test(mdp)) score += 20;
    if (/[0-9]/.test(mdp)) score += 20;
    if (/[^A-Za-z0-9]/.test(mdp)) score += 10;
    return Math.min(score, 100);
  });

  readonly libelleRobustesse = computed(() => {
    const s = this.robustesse();
    if (s >= 85) return 'Mot de passe robuste';
    if (s >= 55) return 'Mot de passe correct';
    if (s > 0) return 'Mot de passe trop faible';
    return '';
  });

  /** ngModel n'alimente pas de signal : on recopie la saisie pour les calculs. */
  private readonly motDePasseSignal = signal('');

  constructor(private router: Router) {}

  ngOnDestroy(): void {
    this.arreterMinuteur();
  }

  // ===== Étape 1 : identification =====

  choisirCanal(canal: Canal): void {
    this.canal.set(canal);
    this.erreur.set(null);
  }

  envoyerLeCode(): void {
    const saisie = this.identifiant.trim();

    if (!saisie) {
      this.signalerErreur('Saisissez votre email ou votre numéro de téléphone.');
      return;
    }
    if (this.canal() === 'email' && !this.emailValide(saisie)) {
      this.signalerErreur("Le format de l'adresse email n'est pas valide.");
      return;
    }
    if (this.canal() === 'sms' && !this.telephoneValide(saisie)) {
      this.signalerErreur('Le numéro de téléphone doit contenir au moins 8 chiffres.');
      return;
    }

    // TODO : appeler POST /auth/mot-de-passe-oublie avec { identifiant, canal }
    this.erreur.set(null);
    this.etape.set(2);
    this.demarrerMinuteur();
  }

  // ===== Étape 2 : code de vérification =====

  saisirChiffre(index: number, evenement: Event): void {
    const champ = evenement.target as HTMLInputElement;
    const valeur = champ.value.replace(/\D/g, '').slice(-1);

    this.chiffres.update(liste => {
      const copie = [...liste];
      copie[index] = valeur;
      return copie;
    });
    champ.value = valeur;

    if (valeur && index < 5) this.focaliser(index + 1);
    this.erreur.set(null);
  }

  /** Retour arrière sur une case vide : on remonte à la précédente. */
  toucheChiffre(index: number, evenement: KeyboardEvent): void {
    if (evenement.key === 'Backspace' && !this.chiffres()[index] && index > 0) {
      this.focaliser(index - 1);
    }
  }

  /** Colle un code reçu par SMS d'un seul coup. */
  collerCode(evenement: ClipboardEvent): void {
    const colle = (evenement.clipboardData?.getData('text') ?? '').replace(/\D/g, '').slice(0, 6);
    if (!colle) return;
    evenement.preventDefault();
    this.chiffres.set(Array.from({ length: 6 }, (_, i) => colle[i] ?? ''));
    this.focaliser(Math.min(colle.length, 5));
  }

  renvoyerLeCode(): void {
    if (!this.peutRenvoyer()) return;
    // TODO : rappeler POST /auth/mot-de-passe-oublie
    this.envois.update(n => n + 1);
    this.demarrerMinuteur();
  }

  validerLeCode(): void {
    if (!this.codeComplet()) {
      this.signalerErreur('Saisissez les 6 chiffres du code reçu.');
      return;
    }
    // TODO : appeler POST /auth/verifier-code avec { identifiant, code }
    this.erreur.set(null);
    this.arreterMinuteur();
    this.etape.set(3);
  }

  // ===== Étape 3 : nouveau mot de passe =====

  surSaisieMotDePasse(valeur: string): void {
    this.motDePasse = valeur;
    this.motDePasseSignal.set(valeur);
    this.erreur.set(null);
  }

  enregistrer(): void {
    if (!this.motDePasse || !this.confirmation) {
      this.signalerErreur('Renseignez et confirmez votre nouveau mot de passe.');
      return;
    }
    if (this.motDePasse !== this.confirmation) {
      this.signalerErreur('Les deux mots de passe ne correspondent pas.');
      return;
    }
    if (this.robustesse() < 55) {
      this.signalerErreur('Minimum 8 caractères, une majuscule et un chiffre.');
      return;
    }

    // TODO : appeler POST /auth/reinitialiser avec { identifiant, code, motDePasse }
    this.router.navigate(['/auth/login']);
  }

  // ===== Navigation =====

  retour(): void {
    this.erreur.set(null);
    if (this.etape() === 2) { this.arreterMinuteur(); this.etape.set(1); }
    else if (this.etape() === 3) { this.etape.set(2); this.demarrerMinuteur(); }
  }

  // ===== Utilitaires =====

  private demarrerMinuteur(): void {
    this.arreterMinuteur();
    this.secondesRestantes.set(DELAI_RENVOI);
    this.minuteur = setInterval(() => {
      this.secondesRestantes.update(s => s - 1);
      if (this.secondesRestantes() <= 0) this.arreterMinuteur();
    }, 1000);
  }

  private arreterMinuteur(): void {
    if (this.minuteur) { clearInterval(this.minuteur); this.minuteur = undefined; }
  }

  private focaliser(index: number): void {
    const champ = document.getElementById('chiffre-' + index) as HTMLInputElement | null;
    champ?.focus();
    champ?.select();
  }

  private signalerErreur(message: string): void {
    this.erreur.set(message);
    this.secousse.set(true);
    setTimeout(() => this.secousse.set(false), 600);
  }

  private emailValide(valeur: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valeur);
  }

  private telephoneValide(valeur: string): boolean {
    return valeur.replace(/\D/g, '').length >= 8;
  }

  private masquerTelephone(valeur: string): string {
    const chiffres = valeur.replace(/\D/g, '');
    if (chiffres.length < 4) return '••• ••• •• ••';
    return '••• ••• ' + chiffres.slice(-4, -2) + ' ' + chiffres.slice(-2);
  }

  private masquerEmail(valeur: string): string {
    const arobase = valeur.indexOf('@');
    if (arobase < 1) return 'a•••n@email.com';
    const debut = valeur[0];
    const fin = valeur[arobase - 1];
    return debut + '•••' + (arobase > 1 ? fin : '') + valeur.slice(arobase);
  }
}
