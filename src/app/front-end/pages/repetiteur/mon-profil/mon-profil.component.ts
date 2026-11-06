import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface ProfilRepetiteur {
  nomComplet: string;
  telephone: string;
  email: string;
  commune: string;
}

export interface PieceJustificative {
  id: 'cv' | 'diplome' | 'identite';
  libelle: string;
  fichier?: string;
  dateDepot?: string;
  taille?: string;
  statut: 'valide' | 'en-attente' | 'absent';
}

@Component({
  selector: 'app-mon-profil',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './mon-profil.component.html',
  styleUrls: ['./mon-profil.component.css']
})
export class MonProfilComponent {

  readonly communes = [
    'Cocody', 'Yopougon', 'Marcory', 'Treichville', 'Plateau',
    'Abobo', 'Adjamé', 'Koumassi', 'Port-Bouët', 'Bingerville'
  ];

  // TODO : remplacer par GET /repetiteurs/moi
  private enregistre: ProfilRepetiteur = {
    nomComplet: 'Yao Kouassi Bertrand',
    telephone: '+225 05 44 77 12 09',
    email: 'b.kouassi@email.com',
    commune: 'Cocody'
  };

  readonly profil = signal<ProfilRepetiteur>({ ...this.enregistre });
  readonly profilValide = true;
  readonly membreDepuis = 'mars 2025';
  readonly message = signal<string | null>(null);
  readonly erreur = signal<string | null>(null);

  readonly matieres = signal<string[]>(['Mathématiques', 'Physique-Chimie', 'SVT']);
  readonly niveaux = 'Collège, Lycée';
  readonly diplome = 'Master Mathématiques';

  readonly pieces = signal<PieceJustificative[]>([
    { id: 'cv', libelle: 'CV', fichier: 'kouassi-bertrand.pdf', dateDepot: '12/03/2025', taille: '340 Ko', statut: 'valide' },
    { id: 'diplome', libelle: 'Copie du diplôme', dateDepot: '12/03/2025', taille: '1,2 Mo', statut: 'valide' },
    { id: 'identite', libelle: "Pièce d'identité", statut: 'absent' }
  ]);

  readonly titreNom = computed(() => {
    // Maquette : « Bertrand Kouassi Yao » en titre, « M. Yao Kouassi Bertrand » dans la carte.
    return this.enregistre.nomComplet.split(' ').reverse().join(' ');
  });

  readonly initiales = computed(() =>
    this.profil().nomComplet.split(' ').filter(Boolean).slice(0, 2).map(m => m[0].toUpperCase()).join('')
  );

  modifier<K extends keyof ProfilRepetiteur>(champ: K, valeur: ProfilRepetiteur[K]): void {
    this.profil.update(p => ({ ...p, [champ]: valeur }));
    this.message.set(null);
    this.erreur.set(null);
  }

  enregistrer(): void {
    const p = this.profil();
    if (!p.nomComplet.trim() || !p.telephone.trim() || !p.email.trim()) {
      this.erreur.set('Nom, téléphone et email sont obligatoires.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) {
      this.erreur.set("L'adresse email n'est pas valide.");
      return;
    }
    // TODO : PUT /repetiteurs/moi
    this.enregistre = { ...p };
    this.message.set('Vos informations ont été enregistrées.');
  }

  ajouterMatiere(): void {
    const nom = prompt('Nom de la matière à ajouter :')?.trim();
    if (nom && !this.matieres().includes(nom)) {
      this.matieres.update(m => [...m, nom]);
    }
  }

  retirerMatiere(nom: string): void {
    this.matieres.update(m => m.filter(x => x !== nom));
  }

  /** Dépôt local du fichier ; le statut passe « en attente » jusqu'à validation par l'administration. */
  deposer(piece: PieceJustificative, event: Event): void {
    const input = event.target as HTMLInputElement;
    const fichier = input.files?.[0];
    if (!fichier) return;
    // TODO : POST /repetiteurs/moi/pieces/{id}
    const taille = fichier.size >= 1024 * 1024
      ? `${(fichier.size / 1024 / 1024).toFixed(1).replace('.', ',')} Mo`
      : `${Math.round(fichier.size / 1024)} Ko`;
    const d = new Date();
    const date = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    this.pieces.update(liste => liste.map(p =>
      p.id === piece.id ? { ...p, fichier: fichier.name, dateDepot: date, taille, statut: 'en-attente' } : p
    ));
    input.value = '';
  }
}
