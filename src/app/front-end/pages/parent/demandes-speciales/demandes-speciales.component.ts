import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type StatutDemande = 'en-cours' | 'resolue' | 'rejetee';

export interface TypeDemande {
  id: string;
  libelle: string;
  /** Délai cible en heures, fixé par l'administration (module 14). */
  delaiHeures: number;
  equipe: string;
}

export interface Demande {
  id: number;
  type: string;
  eleve: string;
  /** Date de dépôt au format JJ/MM/AAAA. */
  date: string;
  delaiHeures: number;
  statut: StatutDemande;
  /** Nombre de jours écoulés depuis le dépôt, pour les demandes ouvertes. */
  jours?: number;
  motifRejet?: string;
}

@Component({
  selector: 'app-demandes-speciales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './demandes-speciales.component.html',
  styleUrls: ['./demandes-speciales.component.css']
})
export class DemandesSpecialesComponent {

  // TODO : remplacer par GET /parametres/types-demande (paramétrage admin, module 14)
  readonly types: TypeDemande[] = [
    { id: 'changement', libelle: 'Changement de répétiteur', delaiHeures: 72, equipe: 'Affectations' },
    { id: 'matiere', libelle: "Ajout d'une nouvelle matière", delaiHeures: 48, equipe: 'Affectations' },
    { id: 'planning', libelle: 'Réajustement du planning', delaiHeures: 48, equipe: 'Plannings' },
    { id: 'reclamation', libelle: 'Réclamation / préoccupation', delaiHeures: 24, equipe: 'Support' }
  ];

  readonly eleves = ['Junior Konan', 'Grace Konan'];

  // ===== Formulaire =====
  readonly typeChoisiId = signal('changement');
  eleveChoisi = 'Junior Konan';
  message = '';
  readonly pieceJointe = signal<string | null>(null);

  readonly erreur = signal<string | null>(null);
  readonly confirmation = signal<string | null>(null);

  readonly typeChoisi = computed(
    () => this.types.find(t => t.id === this.typeChoisiId()) ?? this.types[0]
  );

  // TODO : remplacer par GET /parents/moi/demandes
  readonly demandes = signal<Demande[]>([
    {
      id: 1, type: 'Réajustement planning', eleve: 'Grace Konan',
      date: this.ilYA(1), delaiHeures: 48, statut: 'en-cours', jours: 1
    },
    {
      id: 2, type: 'Ajout matière (SVT)', eleve: 'Junior Konan',
      date: this.ilYA(20), delaiHeures: 48, statut: 'resolue'
    },
    {
      id: 3, type: 'Changement répétiteur', eleve: 'Grace Konan',
      date: this.ilYA(157), delaiHeures: 72, statut: 'rejetee',
      motifRejet: "Le répétiteur demandé n'intervient pas sur la commune de Cocody. "
        + 'Une alternative vous a été proposée : Mme Fatou Diabaté.'
    }
  ]);

  /** Dernière demande rejetée, dont le motif est affiché sous le tableau. */
  readonly derniereRejetee = computed(
    () => this.demandes().find(d => d.statut === 'rejetee' && d.motifRejet) ?? null
  );

  /** Résumé des délais, construit depuis le paramétrage plutôt que recopié. */
  readonly resumeDelais = computed(
    () => [...this.types]
      .sort((a, b) => a.delaiHeures - b.delaiHeures)
      .map(t => t.libelle + ' ' + t.delaiHeures + ' h')
      .join(' · ')
  );

  // ===== Affichage =====

  libelleStatut(demande: Demande): string {
    switch (demande.statut) {
      case 'en-cours': return 'En cours · J+' + (demande.jours ?? 0);
      case 'resolue': return 'Résolue';
      case 'rejetee': return 'Rejetée';
    }
  }

  /** Vrai si une demande ouverte a dépassé son délai cible. */
  horsDelai(demande: Demande): boolean {
    if (demande.statut !== 'en-cours') return false;
    return (demande.jours ?? 0) * 24 > demande.delaiHeures;
  }

  // ===== Saisie =====

  changerType(id: string): void {
    this.typeChoisiId.set(id);
    this.erreur.set(null);
  }

  surFichier(evenement: Event): void {
    const fichiers = (evenement.target as HTMLInputElement).files;
    if (!fichiers?.length) {
      this.pieceJointe.set(null);
      return;
    }
    const fichier = fichiers[0];
    if (fichier.size > 5 * 1024 * 1024) {
      this.erreur.set('La pièce jointe dépasse 5 Mo.');
      this.pieceJointe.set(null);
      return;
    }
    this.erreur.set(null);
    this.pieceJointe.set(fichier.name);
  }

  envoyer(): void {
    if (this.message.trim().length < 10) {
      this.erreur.set('Décrivez votre demande en quelques mots (10 caractères minimum).');
      return;
    }

    const type = this.typeChoisi();

    // TODO : appeler POST /parents/moi/demandes { type, eleve, message, pieceJointe }
    this.demandes.update(liste => [
      {
        id: Math.max(0, ...liste.map(d => d.id)) + 1,
        type: type.libelle,
        eleve: this.eleveChoisi,
        date: this.ilYA(0),
        delaiHeures: type.delaiHeures,
        statut: 'en-cours' as StatutDemande,
        jours: 0
      },
      ...liste
    ]);

    this.confirmation.set(
      'Demande envoyée à l\'équipe ' + type.equipe
      + '. Réponse attendue sous ' + type.delaiHeures + ' h.'
    );
    this.erreur.set(null);
    this.message = '';
    this.pieceJointe.set(null);
  }

  /** Date au format JJ/MM/AAAA, n jours avant aujourd'hui. */
  private ilYA(jours: number): string {
    const date = new Date();
    date.setDate(date.getDate() - jours);
    const jj = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    return jj + '/' + mm + '/' + date.getFullYear();
  }
}
