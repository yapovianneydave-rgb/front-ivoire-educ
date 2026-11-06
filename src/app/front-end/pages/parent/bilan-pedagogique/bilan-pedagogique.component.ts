import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export type StatutBilan = 'atteint' | 'en-progres' | 'non-atteint';

export interface SeanceBilan {
  date: string;
  resume: string;
}

export interface Bilan {
  id: number;
  eleve: string;
  matiere: string;
  periode: string;
  /** Libellé court utilisé dans le tableau d'historique. */
  periodeCourte: string;
  repetiteur: string;
  depose: string;
  statut: StatutBilan;
  objectif: string;
  notionsMaitrisees: number;
  notionsTotal: number;
  progression: string;
  seances: SeanceBilan[];
}

@Component({
  selector: 'app-bilan-pedagogique',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bilan-pedagogique.component.html',
  styleUrls: ['./bilan-pedagogique.component.css']
})
export class BilanPedagogiqueComponent {

  // TODO : remplacer par GET /parents/moi/bilans
  readonly bilans = signal<Bilan[]>([
    {
      id: 1,
      eleve: 'Junior Konan',
      matiere: 'Mathématiques',
      periode: 'Bilan du 14 au 28 juillet 2026',
      periodeCourte: '14–28 juil. 2026',
      repetiteur: 'M. Yao Kouassi Bertrand',
      depose: 'déposé le 28/07 à 19h12',
      statut: 'atteint',
      objectif: 'Calcul littéral du 2nd degré — factorisation et développement.',
      notionsMaitrisees: 7,
      notionsTotal: 8,
      progression: 'Assiduité excellente sur la période (4/4 séances). Bonne assimilation, encore quelques hésitations en rédaction de démonstration.',
      seances: [
        { date: 'Séance du 28/07', resume: "Exercices d'application — identités remarquables. Très bonne progression." },
        { date: 'Séance du 21/07', resume: 'Introduction à la factorisation. Notion bien comprise après reformulation.' },
        { date: 'Séance du 14/07', resume: "Rappels sur le développement d'expressions littérales." }
      ]
    },
    {
      id: 2,
      eleve: 'Grace Konan',
      matiere: 'Anglais',
      periode: 'Bilan du 30 juin au 13 juillet 2026',
      periodeCourte: '30 juin–13 juil. 2026',
      repetiteur: 'Mme Fatou Diabaté',
      depose: 'déposé le 13/07 à 18h40',
      statut: 'en-progres',
      objectif: "Compréhension orale et prise de parole — préparation à l'épreuve du BAC.",
      notionsMaitrisees: 4,
      notionsTotal: 7,
      progression: "Travail écrit régulier et sérieux. La prise de parole reste hésitante : le stress gêne encore la fluidité à l'oral.",
      seances: [
        { date: 'Séance du 13/07', resume: 'Oral blanc chronométré. Vocabulaire maîtrisé, débit encore irrégulier.' },
        { date: 'Séance du 10/07', resume: "Compréhension d'un document audio. Bons repérages, restitution à affermir." },
        { date: 'Séance du 06/07', resume: 'Révision des temps du passé. Notions acquises.' }
      ]
    },
    {
      id: 3,
      eleve: 'Junior Konan',
      matiere: 'Physique-Chimie',
      periode: 'Bilan du 16 au 29 juin 2026',
      periodeCourte: '16–29 juin 2026',
      repetiteur: 'M. Yao Kouassi Bertrand',
      depose: 'déposé le 29/06 à 20h05',
      statut: 'atteint',
      objectif: 'Les états de la matière et les changements d\'état.',
      notionsMaitrisees: 6,
      notionsTotal: 6,
      progression: 'Objectif entièrement couvert. Junior restitue les schémas de mémoire et sait justifier ses réponses.',
      seances: [
        { date: 'Séance du 29/06', resume: 'Évaluation de fin de séquence. Toutes les notions validées.' },
        { date: 'Séance du 22/06', resume: 'Exercices sur les courbes de changement d\'état.' },
        { date: 'Séance du 16/06', resume: 'Introduction aux trois états de la matière.' }
      ]
    }
  ]);

  /** Bilan affiché dans la fiche du haut. Cliquer une ligne d'historique le change. */
  readonly bilanAfficheId = signal(1);

  readonly message = signal<string | null>(null);

  readonly bilanAffiche = computed(
    () => this.bilans().find(b => b.id === this.bilanAfficheId()) ?? this.bilans()[0]
  );

  /** Part de l'objectif couverte, en pourcentage entier. */
  readonly pourcentage = computed(() => {
    const b = this.bilanAffiche();
    if (!b || b.notionsTotal === 0) return 0;
    return Math.round((b.notionsMaitrisees / b.notionsTotal) * 100);
  });

  afficher(bilan: Bilan): void {
    this.bilanAfficheId.set(bilan.id);
    this.message.set(null);
  }

  libelleStatut(statut: StatutBilan): string {
    switch (statut) {
      case 'atteint': return 'Objectif atteint';
      case 'en-progres': return 'En progrès';
      case 'non-atteint': return 'Objectif non atteint';
    }
  }

  exporter(bilan: Bilan): void {
    // TODO : appeler GET /parents/moi/bilans/{id}/pdf et déclencher le téléchargement
    this.message.set(
      'Export du bilan « ' + bilan.eleve + ' — ' + bilan.matiere
      + ' » (' + bilan.periodeCourte + ') en préparation.'
    );
  }
}
