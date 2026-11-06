import { Injectable, computed, signal } from '@angular/core';

export type StatutPaiement = 'a-regler' | 'paye' | 'paye-retard';

export interface LignePaiement {
  id: number;
  /** Libellé « Mois Année », par exemple « Décembre 2026 ». */
  mois: string;
  eleve: string;
  eleveId: number;
  classe: string;
  matiere: string;
  repetiteur: string;
  montant: number;
  statut: StatutPaiement;
  /** Nombre de jours de retard, pour les règlements tardifs. */
  joursRetard?: number;
  moyen?: string;
  /** Date d'échéance au format JJ/MM/AAAA. */
  echeance: string;
}

interface Profil {
  eleve: string;
  eleveId: number;
  classe: string;
  matiere: string;
  repetiteur: string;
  montant: number;
}

const JUNIOR: Profil = {
  eleve: 'Junior Konan', eleveId: 1, classe: '6ème',
  matiere: 'Mathématiques', repetiteur: 'M. Kouassi', montant: 75000
};

const GRACE: Profil = {
  eleve: 'Grace Konan', eleveId: 2, classe: 'Terminale D',
  matiere: 'Anglais', repetiteur: 'Mme Diabaté', montant: 60000
};

const MOYENS_HISTORIQUE = ['Wave', 'Orange Money', 'MTN MoMo', 'Wave', 'Virement bancaire'];

/**
 * Source unique des échéances du parent, partagée par le suivi des paiements
 * (module 6) et le parcours de règlement (module 7). Sans elle, chaque écran
 * gardait sa propre copie et un règlement ne se répercutait nulle part.
 */
@Injectable({ providedIn: 'root' })
export class PaiementStore {

  // TODO : remplacer par GET /parents/moi/paiements?mois=12
  readonly paiements = signal<LignePaiement[]>(this.jeuDeDepart());

  /** Seule échéance encore ouverte, s'il y en a une. */
  readonly echeanceEnCours = computed(
    () => this.paiements().find(p => p.statut === 'a-regler') ?? null
  );

  readonly soldeDuMois = computed(() => this.echeanceEnCours()?.montant ?? 0);

  readonly regularisationsTardives = computed(
    () => this.paiements().filter(p => p.statut === 'paye-retard').length
  );

  readonly aJour = computed(
    () => this.paiements().every(p => p.statut !== 'a-regler' || !this.echeanceDepassee(p))
  );

  readonly libelleRegularisations = computed(() => {
    const n = this.regularisationsTardives();
    if (n === 0) return 'Aucun retard sur 12 mois';
    return n + ' régularisation' + (n > 1 ? 's' : '')
      + ' tardive' + (n > 1 ? 's' : '') + ' sur 12 mois';
  });

  /** Rappel envoyé une semaine avant l'échéance ouverte. */
  readonly prochainRappel = computed(() => {
    const echeance = this.echeanceEnCours();
    if (!echeance) return null;
    const date = this.enDate(echeance.echeance);
    date.setDate(date.getDate() - 7);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  });

  parId(id: number): LignePaiement | null {
    return this.paiements().find(p => p.id === id) ?? null;
  }

  /**
   * Enregistre le règlement d'une échéance. Le mois suivant n'est pas créé ici :
   * c'est la facturation côté serveur qui l'émettra.
   */
  // TODO : appeler POST /parents/moi/paiements/{id}/regler et recharger la liste
  marquerPaye(id: number, moyen: string): void {
    this.paiements.update(liste =>
      liste.map(p => p.id === id ? { ...p, statut: 'paye' as StatutPaiement, moyen } : p)
    );
  }

  montantFormate(montant: number): string {
    return montant.toLocaleString('fr-FR') + ' FCFA';
  }

  libelleStatut(ligne: LignePaiement): string {
    switch (ligne.statut) {
      case 'a-regler': return 'À régler';
      case 'paye': return 'Payé';
      case 'paye-retard': return 'Payé · J+' + (ligne.joursRetard ?? 0);
    }
  }

  /** Vrai si la date d'échéance est passée. */
  private echeanceDepassee(ligne: LignePaiement): boolean {
    return this.enDate(ligne.echeance).getTime() < Date.now();
  }

  private enDate(valeur: string): Date {
    const [jour, mois, annee] = valeur.split('/').map(Number);
    return new Date(annee, mois - 1, jour);
  }

  /**
   * Douze mois glissants calés sur la date du jour : l'échéance du mois
   * prochain reste à régler, les onze précédentes sont soldées. Des dates
   * figées finissaient par afficher une échéance « à régler » déjà dépassée.
   */
  private jeuDeDepart(): LignePaiement[] {
    const decalages = [1, 0, -1, -2, -3, -4, -5, -6, -7, -8, -9, -10];

    return decalages.map((decalage, index) => {
      const profil = index % 2 === 0 ? JUNIOR : GRACE;
      const tardif = decalage === -3;

      return {
        id: index + 1,
        mois: this.moisDecale(decalage),
        eleve: profil.eleve,
        eleveId: profil.eleveId,
        classe: profil.classe,
        matiere: profil.matiere,
        repetiteur: profil.repetiteur,
        montant: profil.montant,
        statut: decalage === 1 ? 'a-regler' : (tardif ? 'paye-retard' : 'paye'),
        joursRetard: tardif ? 6 : undefined,
        moyen: decalage === 1 ? undefined : MOYENS_HISTORIQUE[index % MOYENS_HISTORIQUE.length],
        echeance: this.echeanceDecalee(decalage)
      };
    });
  }

  /** Libellé « Mois Année » décalé de n mois par rapport à aujourd'hui. */
  private moisDecale(n: number): string {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() + n);
    const libelle = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    return libelle.charAt(0).toUpperCase() + libelle.slice(1);
  }

  /** Échéance au 5 du mois décalé de n mois, au format JJ/MM/AAAA. */
  private echeanceDecalee(n: number): string {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() + n);
    date.setDate(5);
    const jj = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    return jj + '/' + mm + '/' + date.getFullYear();
  }
}
