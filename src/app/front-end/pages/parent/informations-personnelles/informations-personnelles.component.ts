import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Coordonnees {
  nom: string;
  prenoms: string;
  telephone: string;
  email: string;
  ville: string;
  commune: string;
  quartier: string;
}

export interface CanalNotification {
  id: string;
  libelle: string;
  /** Mention affichée sous le libellé, par exemple pour un canal verrouillé. */
  mention?: string;
  /** Les alertes critiques passent toujours par l'in-app : il n'est pas désactivable. */
  verrouille: boolean;
  rappels: boolean;
  paiement: boolean;
  bilans: boolean;
}

type ColonneNotification = 'rappels' | 'paiement' | 'bilans';

@Component({
  selector: 'app-informations-personnelles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './informations-personnelles.component.html',
  styleUrls: ['./informations-personnelles.component.css']
})
export class InformationsPersonnellesComponent {

  readonly villes = ['Abidjan', 'Bouaké', 'Yamoussoukro', 'San-Pédro', 'Korhogo', 'Daloa'];
  readonly communes = [
    'Cocody', 'Yopougon', 'Marcory', 'Treichville', 'Plateau',
    'Abobo', 'Adjamé', 'Koumassi', 'Port-Bouët', 'Bingerville'
  ];

  // TODO : remplacer par GET /parents/moi
  private readonly enregistrees: Coordonnees = {
    nom: 'Konan',
    prenoms: "Aya N'Guessan",
    telephone: '+225 07 08 12 34 56',
    email: 'aya.konan@email.com',
    ville: 'Abidjan',
    commune: 'Cocody',
    quartier: 'Angré'
  };

  /** Valeurs affichées. En édition, la saisie se fait sur cette copie. */
  readonly coordonnees = signal<Coordonnees>({ ...this.enregistrees });

  readonly modeEdition = signal(false);
  readonly messageCoordonnees = signal<string | null>(null);
  readonly erreurCoordonnees = signal<string | null>(null);

  // TODO : remplacer par GET /parents/moi/preferences-notification
  readonly canaux = signal<CanalNotification[]>([
    { id: 'sms', libelle: 'SMS', verrouille: false, rappels: true, paiement: true, bilans: false },
    { id: 'whatsapp', libelle: 'WhatsApp', verrouille: false, rappels: true, paiement: true, bilans: true },
    { id: 'email', libelle: 'Email', verrouille: false, rappels: false, paiement: true, bilans: true },
    {
      id: 'inapp', libelle: 'In-app', mention: 'Non désactivable',
      verrouille: true, rappels: true, paiement: true, bilans: true
    }
  ]);

  // ===== Sécurité =====
  motDePasseActuel = '';
  nouveauMotDePasse = '';
  confirmation = '';
  readonly messageMotDePasse = signal<string | null>(null);
  readonly erreurMotDePasse = signal<string | null>(null);

  /** Le téléphone modifié impose une vérification : on prévient avant d'enregistrer. */
  readonly telephoneModifie = computed(
    () => this.coordonnees().telephone.trim() !== this.enregistrees.telephone
  );

  // ===== Coordonnées =====

  activerEdition(): void {
    this.messageCoordonnees.set(null);
    this.erreurCoordonnees.set(null);
    this.modeEdition.set(true);
  }

  annulerEdition(): void {
    this.coordonnees.set({ ...this.enregistrees });
    this.erreurCoordonnees.set(null);
    this.modeEdition.set(false);
  }

  majChamp(champ: keyof Coordonnees, valeur: string): void {
    this.coordonnees.update(c => ({ ...c, [champ]: valeur }));
    this.erreurCoordonnees.set(null);
  }

  enregistrerCoordonnees(): void {
    const c = this.coordonnees();

    if (!c.nom.trim() || !c.prenoms.trim()) {
      this.erreurCoordonnees.set('Le nom et le prénom sont obligatoires.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email.trim())) {
      this.erreurCoordonnees.set("Le format de l'adresse email n'est pas valide.");
      return;
    }
    if (c.telephone.replace(/\D/g, '').length < 8) {
      this.erreurCoordonnees.set('Le numéro de téléphone est incomplet.');
      return;
    }

    const verificationRequise = this.telephoneModifie();

    // TODO : appeler PUT /parents/moi avec les coordonnées
    Object.assign(this.enregistrees, c);
    this.modeEdition.set(false);
    this.erreurCoordonnees.set(null);
    this.messageCoordonnees.set(
      verificationRequise
        ? 'Coordonnées enregistrées. Un SMS de vérification a été envoyé à votre nouveau numéro.'
        : 'Coordonnées enregistrées.'
    );
  }

  // ===== Notifications =====

  basculer(canal: CanalNotification, colonne: ColonneNotification): void {
    if (canal.verrouille) return;
    // TODO : appeler PATCH /parents/moi/preferences-notification
    this.canaux.update(liste =>
      liste.map(c => c.id === canal.id ? { ...c, [colonne]: !c[colonne] } : c)
    );
  }

  // ===== Mot de passe =====

  modifierMotDePasse(): void {
    this.messageMotDePasse.set(null);

    if (!this.motDePasseActuel || !this.nouveauMotDePasse || !this.confirmation) {
      this.erreurMotDePasse.set('Les trois champs sont obligatoires.');
      return;
    }
    if (this.nouveauMotDePasse !== this.confirmation) {
      this.erreurMotDePasse.set('Les deux mots de passe ne correspondent pas.');
      return;
    }
    if (!this.motDePasseConforme(this.nouveauMotDePasse)) {
      this.erreurMotDePasse.set('Minimum 8 caractères, une majuscule et un chiffre.');
      return;
    }
    if (this.nouveauMotDePasse === this.motDePasseActuel) {
      this.erreurMotDePasse.set("Le nouveau mot de passe doit différer de l'actuel.");
      return;
    }

    // TODO : appeler PUT /parents/moi/mot-de-passe
    this.motDePasseActuel = '';
    this.nouveauMotDePasse = '';
    this.confirmation = '';
    this.erreurMotDePasse.set(null);
    this.messageMotDePasse.set('Mot de passe modifié. Vos autres sessions ont été fermées.');
  }

  private motDePasseConforme(mdp: string): boolean {
    return mdp.length >= 8 && /[A-Z]/.test(mdp) && /[0-9]/.test(mdp);
  }
}
