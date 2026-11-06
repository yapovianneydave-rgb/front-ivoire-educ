import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

interface ModuleParent {
  numero: number;
  libelle: string;
  /** Absent tant que l'écran n'est pas développé : l'entrée reste visible mais inactive. */
  lien?: string;
}

@Component({
  selector: 'app-parent-layout',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './parent-layout.component.html',
  styleUrls: ['./parent-layout.component.css']
})
export class ParentLayoutComponent {

  private readonly router = inject(Router);

  /** Les 9 modules de l'espace parent, dans l'ordre du cahier des charges. */
  readonly modules: ModuleParent[] = [
    { numero: 1, libelle: 'Tableau de bord', lien: '/parent/tableau-de-bord' },
    { numero: 2, libelle: 'Informations personnelles', lien: '/parent/informations-personnelles' },
    { numero: 3, libelle: 'Informations élèves', lien: '/parent/informations-eleves' },
    { numero: 4, libelle: 'Répétiteurs assignés', lien: '/parent/repetiteurs-assignes' },
    { numero: 5, libelle: 'Bilan pédagogique', lien: '/parent/bilan-pedagogique' },
    { numero: 6, libelle: 'Paiement', lien: '/parent/paiement' },
    { numero: 7, libelle: 'Régler un paiement', lien: '/parent/regler-un-paiement' },
    { numero: 8, libelle: 'Notation du répétiteur', lien: '/parent/notation-repetiteur' },
    { numero: 9, libelle: 'Demandes spéciales', lien: '/parent/demandes-speciales' }
  ];

  readonly nomUtilisateur = this.lireNom();

  get initiales(): string {
    return this.nomUtilisateur
      .split(' ')
      .filter(mot => mot.length)
      .slice(0, 2)
      .map(mot => mot[0].toUpperCase())
      .join('');
  }

  /**
   * Vide tout ce que la connexion a posé, puis renvoie à l'écran de login.
   * L'ancienne version de l'en-tête supprimait une clé « token » que la
   * connexion n'écrit jamais : la session n'était donc pas réellement fermée.
   */
  seDeconnecter(): void {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    sessionStorage.clear();
    this.router.navigate(['/auth/login']);
  }

  private lireNom(): string {
    try {
      return localStorage.getItem('userName') || 'Mon compte';
    } catch {
      return 'Mon compte';
    }
  }
}
