import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface RepetiteurAssigne {
  nom: string;
  matiere: string;
}

export interface Eleve {
  id: number;
  prenom: string;
  nom: string;
  classe: string;
  etablissement: string;
  matieres: string[];
  repetiteurs: RepetiteurAssigne[];
  observations: string;
  pointsForts: string;
  difficultes: string;
  /** Couleur de la pastille d'initiales dans la liste. */
  couleur: string;
}

@Component({
  selector: 'app-informations-eleves',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './informations-eleves.component.html',
  styleUrls: ['./informations-eleves.component.css']
})
export class InformationsElevesComponent {

  // TODO : remplacer par GET /parents/moi/eleves
  readonly eleves = signal<Eleve[]>([
    {
      id: 1,
      prenom: 'Junior',
      nom: 'Konan',
      classe: '6ème',
      etablissement: 'Collège Sainte-Marie, Cocody',
      matieres: ['Maths', 'Physique'],
      repetiteurs: [
        { nom: 'M. Yao Kouassi Bertrand', matiere: 'Mathématiques' },
        { nom: 'M. Yao Kouassi Bertrand', matiere: 'Physique-Chimie' }
      ],
      observations: 'Bonne logique, difficulté en rédaction',
      pointsForts: "Bonne logique de calcul, participe activement en classe, rapide sur les exercices d'application.",
      difficultes: 'Rédaction des démonstrations, gestion du temps lors des évaluations chronométrées.',
      couleur: '#009e49'
    },
    {
      id: 2,
      prenom: 'Grace',
      nom: 'Konan',
      classe: 'Terminale D',
      etablissement: 'Lycée Moderne Cocody',
      matieres: ['Français', 'Anglais'],
      repetiteurs: [
        { nom: 'Mme Fatou Diabaté', matiere: 'Français' },
        { nom: 'Mme Fatou Diabaté', matiere: 'Anglais' }
      ],
      observations: "Très assidue, stress à l'oral",
      pointsForts: "Expression écrite solide, vocabulaire riche, travail régulier à la maison.",
      difficultes: "Prise de parole en public, gestion du stress lors des oraux blancs.",
      couleur: '#2f6fd0'
    }
  ]);

  /** Élève dont le détail est ouvert. `null` quand aucune modale n'est affichée. */
  readonly eleveDetaille = signal<Eleve | null>(null);

  /** Élève dont le retrait est en attente de confirmation. */
  readonly eleveARetirer = signal<Eleve | null>(null);

  readonly message = signal<string | null>(null);

  ouvrirDetail(eleve: Eleve): void {
    this.eleveARetirer.set(null);
    this.eleveDetaille.set(eleve);
  }

  demanderRetrait(eleve: Eleve): void {
    this.eleveDetaille.set(null);
    this.eleveARetirer.set(eleve);
  }

  fermer(): void {
    this.eleveDetaille.set(null);
    this.eleveARetirer.set(null);
  }

  confirmerRetrait(): void {
    const eleve = this.eleveARetirer();
    if (!eleve) return;

    // TODO : appeler DELETE /parents/moi/eleves/{id}
    this.eleves.update(liste => liste.filter(e => e.id !== eleve.id));
    this.eleveARetirer.set(null);
    this.message.set(
      eleve.prenom + ' ' + eleve.nom + ' sortira du suivi à la fin du mois en cours.'
    );
  }

  /** Initiales affichées dans la pastille, par exemple « JK ». */
  initiales(eleve: Eleve): string {
    return (eleve.prenom[0] + eleve.nom[0]).toUpperCase();
  }

  /** Un répétiteur peut couvrir plusieurs matières : on ne le liste qu'une fois. */
  repetiteursUniques(eleve: Eleve): RepetiteurAssigne[] {
    const parNom = new Map<string, string[]>();
    for (const r of eleve.repetiteurs) {
      parNom.set(r.nom, [...(parNom.get(r.nom) ?? []), r.matiere]);
    }
    return [...parNom.entries()].map(([nom, matieres]) => ({
      nom,
      matiere: matieres.join(', ')
    }));
  }

  @HostListener('document:keydown.escape')
  surEchap(): void {
    this.fermer();
  }
}
