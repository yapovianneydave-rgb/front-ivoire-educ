import { Component } from '@angular/core';

/** Écran provisoire : l'Espace Admin sera intégré module par module. */
@Component({
  selector: 'app-accueil-admin',
  standalone: true,
  template: `
    <p class="surtitre">Espace Admin</p>
    <h1>Bienvenue, Administrateur</h1>
    <p class="intro">Les écrans de l'espace administrateur seront intégrés prochainement.</p>
  `,
  styles: [`
    :host { display: block; color: #0c2340; }
    .surtitre { margin: 0 0 8px; font-size: .68rem; font-weight: 700; letter-spacing: 1.3px; text-transform: uppercase; color: #f6821f; }
    h1 { margin: 0 0 6px; font-size: 1.6rem; font-weight: 700; }
    .intro { margin: 0; font-size: .85rem; color: #5b6b80; }
  `]
})
export class AccueilAdminComponent {}
