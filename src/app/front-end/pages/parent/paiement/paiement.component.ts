import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { LignePaiement, PaiementStore } from '../../../services/paiement.store';

@Component({
  selector: 'app-paiement',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './paiement.component.html',
  styleUrls: ['./paiement.component.css']
})
export class PaiementComponent {

  private readonly store = inject(PaiementStore);
  private readonly router = inject(Router);

  readonly enfants = [
    { id: 1, prenom: 'Junior' },
    { id: 2, prenom: 'Grace' }
  ];

  /** Filtre d'affichage. `null` signifie « tous les enfants ». */
  readonly filtreEnfant = signal<number | null>(null);

  readonly message = signal<string | null>(null);

  // ===== Lecture du store partagé =====
  readonly paiements = this.store.paiements;
  readonly echeanceEnCours = this.store.echeanceEnCours;
  readonly soldeDuMois = this.store.soldeDuMois;
  readonly regularisationsTardives = this.store.regularisationsTardives;
  readonly libelleRegularisations = this.store.libelleRegularisations;
  readonly aJour = this.store.aJour;
  readonly prochainRappel = this.store.prochainRappel;

  readonly paiementsFiltres = computed(() => {
    const id = this.filtreEnfant();
    return id === null
      ? this.paiements()
      : this.paiements().filter(p => p.eleveId === id);
  });

  // ===== Affichage =====

  montantFormate(montant: number): string {
    return this.store.montantFormate(montant);
  }

  libelleStatut(ligne: LignePaiement): string {
    return this.store.libelleStatut(ligne);
  }

  filtrer(id: number | null): void {
    this.filtreEnfant.set(id);
    this.message.set(null);
  }

  // ===== Actions =====

  /** Ouvre le parcours de règlement sur l'échéance choisie. */
  regler(ligne: LignePaiement | null): void {
    if (!ligne) return;
    this.router.navigate(['/parent/regler-un-paiement'], { queryParams: { echeance: ligne.id } });
  }

  telechargerRecu(ligne: LignePaiement): void {
    // TODO : appeler GET /parents/moi/paiements/{id}/recu
    this.message.set('Reçu de ' + ligne.mois + ' (' + ligne.eleve + ') en préparation.');
  }

  exporter(): void {
    // TODO : appeler GET /parents/moi/paiements/export?format=xlsx
    const n = this.paiementsFiltres().length;
    this.message.set('Export Excel de ' + n + ' ligne' + (n > 1 ? 's' : '') + ' en préparation.');
  }
}
