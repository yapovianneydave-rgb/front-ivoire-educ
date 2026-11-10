import { Component, computed, signal } from '@angular/core';

export interface BilanEnCours {
  du: string;
  au: string;
  statut: 'brouillon' | 'envoye';
  notionsValidees: number;
  notionsTotal: number;
}

export interface EleveAttribue {
  id: number;
  prenom: string;
  nom: string;
  classe: string;
  matiere: string;
  parent: string;
  telephoneParent: string;
  quartier: string;
  couleur: string;
  objectifs: string;
  bilan?: BilanEnCours;
}

@Component({
  selector: 'app-mes-eleves',
  standalone: true,
  templateUrl: './mes-eleves.component.html',
  styleUrls: ['./mes-eleves.component.css']
})
export class MesElevesComponent {

  // TODO : remplacer par GET /repetiteurs/moi/eleves
  readonly eleves: EleveAttribue[] = [
    {
      id: 1, prenom: 'Junior', nom: 'Konan', classe: '6ème', matiere: 'Maths',
      parent: 'Aya Konan', telephoneParent: '+225 07 08 12 34 56', quartier: 'Cocody, Angré',
      couleur: '#1f8a3e',
      objectifs: 'Consolider les fractions et les opérations sur les nombres décimaux.',
      bilan: { du: '21/07', au: '04/08', statut: 'brouillon', notionsValidees: 3, notionsTotal: 4 }
    },
    {
      id: 2, prenom: 'Marc-Aurèle', nom: 'Yao', classe: '2nde C', matiere: 'Physique-Chimie',
      parent: 'Solange Yao', telephoneParent: '+225 01 45 67 89 62', quartier: 'Yopougon, Sicogi',
      couleur: '#b8862b',
      objectifs: 'Renforcer la compréhension des lois de Newton et préparer le contrôle trimestriel sur la mécanique.',
      bilan: { du: '21/07', au: '04/08', statut: 'brouillon', notionsValidees: 2, notionsTotal: 5 }
    },
    {
      id: 3, prenom: 'Aminata', nom: 'Traoré', classe: '3ème', matiere: 'Maths',
      parent: 'Ibrahim Traoré', telephoneParent: '+225 05 22 33 44 21', quartier: 'Marcory, Zone 4',
      couleur: '#1f8a3e',
      objectifs: 'Préparer le BEPC : théorème de Thalès, équations du premier degré.'
    }
  ];

  /** Élève dont la fiche détaillée est affichée (maquette : Marc-Aurèle Yao). */
  readonly selectionId = signal(2);
  readonly selection = computed(() => this.eleves.find(e => e.id === this.selectionId()) ?? this.eleves[0]);

  selectionner(eleve: EleveAttribue): void {
    this.selectionId.set(eleve.id);
  }

  initiales(e: EleveAttribue): string {
    return (e.prenom[0] + e.nom[0]).toUpperCase();
  }

  /** « +225 07 08 12 34 56 » → « 07 •• •• 34 56 » : le numéro complet n'apparaît que dans le lien d'appel. */
  numeroMasque(tel: string): string {
    const blocs = tel.replace('+225', '').trim().split(' ');
    return blocs.map((b, i) => (i === 1 || i === 2 ? '••' : b)).join(' ');
  }

  lienAppel(tel: string): string {
    return 'tel:' + tel.replace(/\s/g, '');
  }

  progression(b: BilanEnCours): number {
    return Math.round((b.notionsValidees / b.notionsTotal) * 100);
  }
}
