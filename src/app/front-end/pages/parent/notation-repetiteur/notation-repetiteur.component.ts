import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Critere {
  id: string;
  libelle: string;
  description: string;
  /** Pondération dans le score global, en pourcentage. Définie par l'administration. */
  poids: number;
}

export interface Repetiteur {
  id: number;
  civiliteNom: string;
  eleve: string;
  nbAvis: number;
  /** Moyenne reçue par critère, tous parents confondus. */
  moyennes: Record<string, number>;
  /** Nombre de séances écoulées depuis la dernière notation du parent. */
  seancesDepuisNotation: number;
}

@Component({
  selector: 'app-notation-repetiteur',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notation-repetiteur.component.html',
  styleUrls: ['./notation-repetiteur.component.css']
})
export class NotationRepetiteurComponent {

  readonly etoiles = [1, 2, 3, 4, 5];

  /** Cycle au terme duquel une notation est demandée (paramétrage admin, module 16). */
  readonly cycleSeances = 8;

  // TODO : remplacer par GET /parametres/criteres-notation (paramétrage admin, module 16)
  readonly criteres: Critere[] = [
    { id: 'ponctualite', libelle: 'Ponctualité', description: 'Respect des horaires convenus', poids: 25 },
    { id: 'pedagogie', libelle: 'Pédagogie', description: 'Clarté des explications, adaptation au rythme', poids: 35 },
    { id: 'comportement', libelle: 'Comportement', description: 'Tenue, respect, communication avec la famille', poids: 20 },
    { id: 'impact', libelle: "Impact sur l'élève", description: 'Progrès constatés sur la période', poids: 20 }
  ];

  // TODO : remplacer par GET /parents/moi/repetiteurs
  readonly repetiteurs: Repetiteur[] = [
    {
      id: 1, civiliteNom: 'M. Yao Kouassi Bertrand', eleve: 'Junior Konan', nbAvis: 18,
      moyennes: { ponctualite: 4.9, pedagogie: 4.8, comportement: 5.0, impact: 4.6 },
      seancesDepuisNotation: 8
    },
    {
      id: 2, civiliteNom: 'Mme Fatou Diabaté', eleve: 'Grace Konan', nbAvis: 11,
      moyennes: { ponctualite: 4.5, pedagogie: 4.0, comportement: 4.6, impact: 3.8 },
      seancesDepuisNotation: 5
    }
  ];

  readonly repetiteurChoisiId = signal(1);

  /** Notes saisies par le parent, par identifiant de critère. */
  readonly notes = signal<Record<string, number>>({});

  commentaire = '';
  recommandations = '';

  readonly erreur = signal<string | null>(null);
  readonly envoye = signal(false);

  readonly repetiteur = computed(
    () => this.repetiteurs.find(r => r.id === this.repetiteurChoisiId()) ?? this.repetiteurs[0]
  );

  /** Moyenne pondérée déjà reçue par le répétiteur. */
  readonly scoreGlobal = computed(() => {
    const moyennes = this.repetiteur().moyennes;
    const total = this.criteres.reduce(
      (somme, c) => somme + (moyennes[c.id] ?? 0) * c.poids, 0
    );
    return Math.round(total / 100 * 10) / 10;
  });

  readonly notesCompletes = computed(
    () => this.criteres.every(c => (this.notes()[c.id] ?? 0) > 0)
  );

  /**
   * Score que donnerait la notation en cours, une fois pondérée.
   * Affiché en direct pour que le parent voie l'effet du barème.
   */
  readonly scoreSaisi = computed(() => {
    if (!this.notesCompletes()) return null;
    const notes = this.notes();
    const total = this.criteres.reduce(
      (somme, c) => somme + notes[c.id] * c.poids, 0
    );
    return Math.round(total / 100 * 10) / 10;
  });

  readonly sommePoids = computed(
    () => this.criteres.reduce((somme, c) => somme + c.poids, 0)
  );

  // ===== Affichage =====

  /** Vrai si l'étoile de rang donné est pleine pour une note. */
  pleine(note: number, rang: number): boolean {
    return rang <= Math.round(note);
  }

  noteSaisie(critere: Critere): number {
    return this.notes()[critere.id] ?? 0;
  }

  moyenne(critere: Critere): number {
    return this.repetiteur().moyennes[critere.id] ?? 0;
  }

  /** Largeur de la barre de moyenne, en pourcentage de 5. */
  largeur(critere: Critere): number {
    return this.moyenne(critere) / 5 * 100;
  }

  // ===== Saisie =====

  choisirRepetiteur(id: number): void {
    this.repetiteurChoisiId.set(id);
    this.notes.set({});
    this.commentaire = '';
    this.recommandations = '';
    this.erreur.set(null);
    this.envoye.set(false);
  }

  noter(critere: Critere, valeur: number): void {
    this.notes.update(notes => ({ ...notes, [critere.id]: valeur }));
    this.erreur.set(null);
  }

  envoyer(): void {
    if (!this.notesCompletes()) {
      const manquants = this.criteres
        .filter(c => !(this.notes()[c.id] > 0))
        .map(c => c.libelle)
        .join(', ');
      this.erreur.set('Notez tous les critères avant d\'envoyer : ' + manquants + '.');
      return;
    }

    // TODO : appeler POST /parents/moi/notations { repetiteurId, notes, commentaire, recommandations }
    this.erreur.set(null);
    this.envoye.set(true);
  }

  recommencer(): void {
    this.notes.set({});
    this.commentaire = '';
    this.recommandations = '';
    this.envoye.set(false);
  }
}
