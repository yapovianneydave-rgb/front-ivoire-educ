import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthDemoService } from '../../services/auth-demo.service';

interface ModuleAdmin {
  numero: number;
  libelle: string;
  /** Absent tant que l'écran n'est pas développé : l'entrée reste visible mais inactive. */
  lien?: string;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent {

  private readonly router = inject(Router);
  private readonly auth = inject(AuthDemoService);

  /** Modules de l'espace administrateur (liste provisoire, à aligner sur le cahier des charges). */
  readonly modules: ModuleAdmin[] = [
    { numero: 1, libelle: 'Accueil', lien: '/admin/accueil' },
    { numero: 2, libelle: 'Gestion des utilisateurs' },
    { numero: 3, libelle: 'Validation des profils' },
    { numero: 4, libelle: 'Affectations' },
    { numero: 5, libelle: 'Paiements' }
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
    this.auth.deconnecter();
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
