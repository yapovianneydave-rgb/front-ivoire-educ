import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface Enfant {
  id: number;
  prenom: string;
  nom: string;
  classe: string;
}

export interface Seance {
  enfantId: number;
  titre: string;
  detail: string;
  couleur: 'verte' | 'bleue' | 'orange';
}

@Component({
  selector: 'app-tableau-de-bord-parent',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './tableau-de-bord.component.html',
  styleUrls: ['./tableau-de-bord.component.css']
})
export class TableauDeBordParentComponent {

  readonly prenomParent = 'Aya';

  // TODO : remplacer par GET /parents/moi/enfants
  readonly enfants: Enfant[] = [
    { id: 1, prenom: 'Junior', nom: 'Konan', classe: '6ème' },
    { id: 2, prenom: 'Grace', nom: 'Konan', classe: 'Terminale D' }
  ];

  /** Enfant sélectionné : `null` signifie « tous ». Le filtre vaut pour tout l'espace. */
  readonly enfantAffiche = signal<number | null>(null);

  // TODO : remplacer par GET /parents/moi/activite?jours=7
  private readonly activite: Seance[] = [
    {
      enfantId: 1,
      titre: 'Cours de Mathématiques — Junior Konan',
      detail: 'M. Yao Kouassi Bertrand · mardi 29 juillet, 17h–18h30 · compte rendu déposé',
      couleur: 'verte'
    },
    {
      enfantId: 2,
      titre: "Cours d'Anglais — Grace Konan",
      detail: 'Mme Fatou Diabaté · lundi 28 juillet, 16h–17h · comportement : très assidue',
      couleur: 'bleue'
    },
    {
      enfantId: 1,
      titre: 'Bilan bimensuel disponible',
      detail: 'Progression de Junior en calcul littéral — à consulter dans « Bilan pédagogique »',
      couleur: 'orange'
    }
  ];

  readonly activiteFiltree = computed(() => {
    const id = this.enfantAffiche();
    return id === null ? this.activite : this.activite.filter(s => s.enfantId === id);
  });

  /** Dernier cours effectué, dépendant de l'enfant affiché. */
  readonly dernierCours = computed(() => {
    const id = this.enfantAffiche();
    if (id === 2) return { date: 'Lundi 28 juil.', detail: 'Anglais — Grace' };
    return { date: 'Mardi 29 juil.', detail: 'Mathématiques — Junior' };
  });

  readonly prochainCours = computed(() => {
    const id = this.enfantAffiche();
    if (id === 1) return { date: 'Mardi 17h00', detail: 'Mathématiques — Junior' };
    return { date: 'Vendredi 15h00', detail: 'Français — Grace' };
  });

  readonly libelleEnfantAffiche = computed(() => {
    const id = this.enfantAffiche();
    if (id === null) return 'vos enfants';
    const enfant = this.enfants.find(e => e.id === id);
    return enfant ? enfant.prenom : 'vos enfants';
  });

  choisirEnfant(id: number | null): void {
    this.enfantAffiche.set(id);
  }
}
