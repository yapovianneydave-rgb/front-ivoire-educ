import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface Plage {
  id: string;
  libelle: string;
  /** Durée de la plage, en heures. */
  duree: number;
  /** Plage entièrement bloquée (ex. cours en établissement) : aucune case n'est cochable. */
  bloquee?: string;
}

export interface EleveAffecte {
  nom: string;
  commune: string;
  zone: string;
}

export interface Absence {
  du: string;
  au: string;
  motif: string;
}

@Component({
  selector: 'app-mes-disponibilites',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './mes-disponibilites.component.html',
  styleUrls: ['./mes-disponibilites.component.css']
})
export class MesDisponibilitesComponent {

  readonly jours = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  readonly plages: Plage[] = [
    { id: 'matin', libelle: '08h–12h', duree: 4, bloquee: 'indisponible (cours en établissement)' },
    { id: 'a14', libelle: '14h–16h', duree: 2 },
    { id: 'a16', libelle: '16h–19h', duree: 3 },
    { id: 's19', libelle: '19h–21h', duree: 2 }
  ];

  readonly communes = [
    'Cocody', 'Yopougon', 'Marcory', 'Treichville', 'Plateau',
    'Abobo', 'Adjamé', 'Koumassi', 'Port-Bouët', 'Bingerville'
  ];

  // TODO : remplacer par GET /repetiteurs/moi/disponibilites
  /** Clé « plage|indexJour » → disponible. */
  readonly grille = signal<Record<string, boolean>>(this.grilleInitiale());

  /** Heures déjà affectées par l'administration (lecture seule). */
  readonly heuresAffectees = 7.5;

  readonly heuresDeclarees = computed(() => {
    const g = this.grille();
    return this.plages.reduce((total, p) =>
      total + this.jours.reduce((s, _, j) => s + (g[`${p.id}|${j}`] ? p.duree : 0), 0), 0);
  });

  readonly messageGrille = signal<string | null>(null);
  readonly erreurGrille = signal<string | null>(null);

  // ===== Zones d'intervention =====
  readonly zones = signal<string[]>(['Cocody', 'Marcory', 'Plateau']);
  readonly ajoutZoneOuvert = signal(false);
  readonly communesDisponibles = computed(() => this.communes.filter(c => !this.zones().includes(c)));

  // TODO : remplacer par GET /repetiteurs/moi/affectations
  readonly elevesAffectes: EleveAffecte[] = [
    { nom: 'Aminata Traoré', commune: 'Marcory', zone: 'Zone 4' }
  ];

  // ===== Absence programmée =====
  absence: Absence = { du: '2026-08-15', au: '2026-08-22', motif: 'Congés familiaux' };
  readonly absences = signal<Absence[]>([]);
  readonly erreurAbsence = signal<string | null>(null);

  estCoche(plage: Plage, jour: number): boolean {
    return !!this.grille()[`${plage.id}|${jour}`];
  }

  basculer(plage: Plage, jour: number): void {
    if (plage.bloquee) return;
    const cle = `${plage.id}|${jour}`;
    this.grille.update(g => ({ ...g, [cle]: !g[cle] }));
    this.messageGrille.set(null);
    this.erreurGrille.set(null);
  }

  enregistrerGrille(): void {
    if (this.heuresDeclarees() < this.heuresAffectees) {
      this.erreurGrille.set('Vos disponibilités ne couvrent plus les heures déjà affectées.');
      return;
    }
    // TODO : PUT /repetiteurs/moi/disponibilites
    this.messageGrille.set('Disponibilités enregistrées.');
  }

  formaterHeures(h: number): string {
    const entieres = Math.floor(h);
    const minutes = Math.round((h - entieres) * 60);
    return minutes ? `${entieres}h${String(minutes).padStart(2, '0')}` : `${entieres} heures`;
  }

  ajouterZone(commune: string): void {
    if (commune) {
      // TODO : PUT /repetiteurs/moi/zones
      this.zones.update(z => [...z, commune]);
    }
    this.ajoutZoneOuvert.set(false);
  }

  retirerZone(commune: string): void {
    this.zones.update(z => z.filter(c => c !== commune));
  }

  estDansMesZones(eleve: EleveAffecte): boolean {
    return this.zones().includes(eleve.commune);
  }

  declarerAbsence(): void {
    const { du, au, motif } = this.absence;
    if (!du || !au) {
      this.erreurAbsence.set('Indiquez les dates de début et de fin.');
      return;
    }
    if (au < du) {
      this.erreurAbsence.set('La date de fin doit suivre la date de début.');
      return;
    }
    if (!motif.trim()) {
      this.erreurAbsence.set('Le motif est obligatoire.');
      return;
    }
    // TODO : POST /repetiteurs/moi/absences
    this.absences.update(a => [...a, { du, au, motif: motif.trim() }]);
    this.absence = { du: '', au: '', motif: '' };
    this.erreurAbsence.set(null);
  }

  annulerAbsence(index: number): void {
    this.absences.update(a => a.filter((_, i) => i !== index));
  }

  formaterDate(iso: string): string {
    const [a, m, j] = iso.split('-');
    return `${j}/${m}/${a}`;
  }

  private grilleInitiale(): Record<string, boolean> {
    // Valeurs de la maquette : Lun→Dim
    const coches: Record<string, number[]> = {
      a14: [0, 2, 3, 5],
      a16: [0, 1, 2, 3, 4]
    };
    const g: Record<string, boolean> = {};
    Object.entries(coches).forEach(([plage, jours]) => jours.forEach(j => g[`${plage}|${j}`] = true));
    return g;
  }
}
