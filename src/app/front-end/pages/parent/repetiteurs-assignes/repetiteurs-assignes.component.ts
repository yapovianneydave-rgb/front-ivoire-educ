import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type StatutPassage = 'confirme' | 'attente';

export interface DerniereSeance {
  libelle: string;
  detail: string;
  statut: StatutPassage;
}

export interface Repetiteur {
  id: number;
  civiliteNom: string;
  initiales: string;
  couleur: string;
  matieres: string[];
  note: number;
  nbAvis: number;
  bio: string;
  eleveSuivi: string;
  creneau: string;
  /** Le numéro réel n'est jamais exposé : les appels passent par la plateforme. */
  telephoneMasque: string;
  derniereSeance: DerniereSeance;
}

/** Les deux actions possibles sur un passage, selon son statut. */
export type TypeSignalement = 'contestation' | 'absence-pointage';

@Component({
  selector: 'app-repetiteurs-assignes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './repetiteurs-assignes.component.html',
  styleUrls: ['./repetiteurs-assignes.component.css']
})
export class RepetiteursAssignesComponent {

  readonly etoiles = [1, 2, 3, 4, 5];

  // TODO : remplacer par GET /parents/moi/repetiteurs
  readonly repetiteurs = signal<Repetiteur[]>([
    {
      id: 1,
      civiliteNom: 'M. Yao Kouassi Bertrand',
      initiales: 'YK',
      couleur: '#0c2340',
      matieres: ['Mathématiques', 'Physique-Chimie'],
      note: 4.8,
      nbAvis: 18,
      bio: "Titulaire d'un Master en Mathématiques, 6 ans d'expérience en soutien scolaire niveau collège et lycée.",
      eleveSuivi: 'Junior Konan',
      creneau: 'Mardi & vendredi, 17h–18h30',
      telephoneMasque: '+225 05 •• •• 12 09',
      derniereSeance: {
        libelle: 'Séance du 29/07 — 17h00',
        detail: 'Pointée par le répétiteur à 17h02, clôturée à 18h31',
        statut: 'confirme'
      }
    },
    {
      id: 2,
      civiliteNom: 'Mme Fatou Diabaté',
      initiales: 'FD',
      couleur: '#f6821f',
      matieres: ['Français', 'Anglais'],
      note: 4.2,
      nbAvis: 11,
      bio: 'Professeure certifiée, spécialiste de la préparation au BAC séries A/D.',
      eleveSuivi: 'Grace Konan',
      creneau: 'Lundi & jeudi, 16h–17h',
      telephoneMasque: '+225 01 •• •• 65 40',
      derniereSeance: {
        libelle: 'Séance du 28/07 — 16h00',
        detail: 'Aucun pointage enregistré par la répétitrice',
        statut: 'attente'
      }
    }
  ]);

  // ===== Appel relayé =====
  readonly appelEnCours = signal<Repetiteur | null>(null);

  // ===== Signalement =====
  readonly signalement = signal<{ repetiteur: Repetiteur; type: TypeSignalement } | null>(null);
  motif = '';
  readonly erreurMotif = signal<string | null>(null);

  readonly message = signal<string | null>(null);

  // ===== Affichage =====

  /** Vrai si l'étoile de rang donné doit être pleine. */
  etoilePleine(repetiteur: Repetiteur, rang: number): boolean {
    return rang <= Math.round(repetiteur.note);
  }

  libelleStatut(statut: StatutPassage): string {
    return statut === 'confirme' ? 'Passage confirmé' : 'En attente de pointage';
  }

  libelleAction(statut: StatutPassage): string {
    return statut === 'confirme' ? 'Contester' : 'Signaler';
  }

  // ===== Appel =====

  appeler(repetiteur: Repetiteur): void {
    this.fermer();
    this.appelEnCours.set(repetiteur);
  }

  // ===== Signalement =====

  ouvrirSignalement(repetiteur: Repetiteur): void {
    this.fermer();
    this.motif = '';
    this.erreurMotif.set(null);
    this.signalement.set({
      repetiteur,
      type: repetiteur.derniereSeance.statut === 'confirme' ? 'contestation' : 'absence-pointage'
    });
  }

  titreSignalement(type: TypeSignalement): string {
    return type === 'contestation'
      ? 'Contester le passage'
      : "Signaler l'absence de pointage";
  }

  envoyerSignalement(): void {
    const courant = this.signalement();
    if (!courant) return;

    if (this.motif.trim().length < 10) {
      this.erreurMotif.set('Décrivez le problème en quelques mots (10 caractères minimum).');
      return;
    }

    // TODO : appeler POST /parents/moi/demandes { type: 'reclamation', ... }
    this.signalement.set(null);
    this.message.set(
      'Demande envoyée à l\'administration concernant ' + courant.repetiteur.civiliteNom
      + '. Délai de traitement : 24 h.'
    );
  }

  fermer(): void {
    this.appelEnCours.set(null);
    this.signalement.set(null);
    this.erreurMotif.set(null);
  }

  @HostListener('document:keydown.escape')
  surEchap(): void {
    this.fermer();
  }
}
