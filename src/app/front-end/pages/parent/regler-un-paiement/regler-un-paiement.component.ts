import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { LignePaiement, PaiementStore } from '../../../services/paiement.store';

export interface MoyenPaiement {
  id: string;
  libelle: string;
  /** Taux appliqué par l'opérateur, en pourcentage. 0 pour un canal sans frais. */
  tauxFrais: number;
  delai: 'immediat' | '48h';
  actif: boolean;
  motifInactif?: string;
}

@Component({
  selector: 'app-regler-un-paiement',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './regler-un-paiement.component.html',
  styleUrls: ['./regler-un-paiement.component.css']
})
export class ReglerUnPaiementComponent {

  private readonly store = inject(PaiementStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // TODO : remplacer par GET /parents/moi/modes-paiement (paramétrage admin, module 13)
  readonly moyens: MoyenPaiement[] = [
    { id: 'wave', libelle: 'Wave', tauxFrais: 1.2, delai: 'immediat', actif: true },
    { id: 'orange', libelle: 'Orange Money', tauxFrais: 1.5, delai: 'immediat', actif: true },
    { id: 'mtn', libelle: 'MTN MoMo', tauxFrais: 1.5, delai: 'immediat', actif: true },
    { id: 'moov', libelle: 'Moov Money', tauxFrais: 1.5, delai: 'immediat', actif: true },
    { id: 'virement', libelle: 'Virement bancaire', tauxFrais: 0, delai: '48h', actif: true },
    {
      id: 'especes', libelle: 'Espèces', tauxFrais: 0, delai: '48h',
      actif: false, motifInactif: "Canal désactivé par l'administration"
    }
  ];

  /** Les 12 mois glissants proposés dans la liste déroulante. */
  readonly echeances = this.store.paiements;

  /** Mois sélectionné. Par défaut l'échéance ouverte, ou celle passée en paramètre. */
  readonly echeanceChoisieId = signal(this.idInitial());

  readonly moyenChoisiId = signal('wave');
  numero = '+225 07 08 12 34 56';

  readonly erreur = signal<string | null>(null);
  readonly confirme = signal(false);
  readonly message = signal<string | null>(null);

  readonly echeance = computed(
    () => this.store.parId(this.echeanceChoisieId()) ?? this.echeances()[0]
  );

  /** Seule une échéance encore ouverte peut être réglée. */
  readonly reglable = computed(() => this.echeance().statut === 'a-regler');

  readonly moyenChoisi = computed(
    () => this.moyens.find(m => m.id === this.moyenChoisiId()) ?? this.moyens[0]
  );

  /** Frais de l'opérateur, arrondis au franc. */
  readonly frais = computed(
    () => Math.round(this.echeance().montant * this.moyenChoisi().tauxFrais / 100)
  );

  readonly total = computed(() => this.echeance().montant + this.frais());

  readonly titre = computed(() => {
    const e = this.echeance();
    return this.reglable()
      ? 'Régler la mensualité de ' + e.mois.toLowerCase()
      : 'Facture de ' + e.mois.toLowerCase();
  });

  // ===== Affichage =====

  montantFormate(montant: number): string {
    return this.store.montantFormate(montant);
  }

  libelleStatut(ligne: LignePaiement): string {
    return this.store.libelleStatut(ligne);
  }

  /** Libellé d'une option de la liste déroulante. */
  optionMois(ligne: LignePaiement): string {
    return ligne.mois + ' — ' + this.montantFormate(ligne.montant)
      + ' · ' + this.libelleStatut(ligne);
  }

  detailMoyen(moyen: MoyenPaiement): string {
    if (!moyen.actif) return moyen.motifInactif ?? 'Indisponible';
    if (moyen.tauxFrais === 0) return 'Sans frais · validation sous 48h';
    const frais = Math.round(this.echeance().montant * moyen.tauxFrais / 100);
    return 'Frais ' + moyen.tauxFrais.toString().replace('.', ',') + ' % · '
      + frais.toLocaleString('fr-FR') + ' FCFA';
  }

  // ===== Sélection =====

  choisirEcheance(id: string): void {
    this.echeanceChoisieId.set(Number(id));
    this.confirme.set(false);
    this.erreur.set(null);
    this.message.set(null);
  }

  choisir(moyen: MoyenPaiement): void {
    if (!moyen.actif) return;
    this.moyenChoisiId.set(moyen.id);
    this.erreur.set(null);
  }

  // ===== Règlement =====

  confirmer(): void {
    if (!this.reglable()) return;

    if (this.numero.replace(/\D/g, '').length < 8) {
      this.erreur.set('Le numéro à débiter est incomplet.');
      return;
    }
    if (!this.moyenChoisi().actif) {
      this.erreur.set('Ce moyen de paiement est indisponible.');
      return;
    }

    this.store.marquerPaye(this.echeance().id, this.moyenChoisi().libelle);
    this.erreur.set(null);
    this.confirme.set(true);
  }

  telechargerRecu(): void {
    // TODO : appeler GET /parents/moi/paiements/{id}/recu
    this.message.set('Reçu de ' + this.echeance().mois + ' en préparation.');
  }

  retourSuivi(): void {
    this.router.navigate(['/parent/paiement']);
  }

  /** Échéance passée en paramètre d'URL, sinon la seule encore ouverte. */
  private idInitial(): number {
    const parametre = Number(this.route.snapshot.queryParamMap.get('echeance'));
    if (parametre && this.store.parId(parametre)) return parametre;
    return this.store.echeanceEnCours()?.id ?? this.store.paiements()[0].id;
  }
}
