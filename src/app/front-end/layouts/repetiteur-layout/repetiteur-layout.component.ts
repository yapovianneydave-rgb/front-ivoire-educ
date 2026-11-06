import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthDemoService } from '../../services/auth-demo.service';

interface ModuleRepetiteur {
  numero: number;
  libelle: string;
  /** Absent tant que l'écran n'est pas développé : l'entrée reste visible mais inactive. */
  lien?: string;
}

@Component({
  selector: 'app-repetiteur-layout',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './repetiteur-layout.component.html',
  styleUrls: ['./repetiteur-layout.component.css']
})
export class RepetiteurLayoutComponent {

  private readonly router = inject(Router);
  private readonly auth = inject(AuthDemoService);

  /** Les 9 modules de l'espace répétiteur, dans l'ordre du cahier des charges. */
  readonly modules: ModuleRepetiteur[] = [
    { numero: 1, libelle: 'Mon profil', lien: '/repetiteur/mon-profil' },
    { numero: 2, libelle: 'Mes disponibilités' },
    { numero: 3, libelle: 'Mes élèves' },
    { numero: 4, libelle: 'Mon planning' },
    { numero: 5, libelle: 'Mes séances' },
    { numero: 6, libelle: 'Rédiger un bilan' },
    { numero: 7, libelle: 'Notes des élèves' },
    { numero: 8, libelle: 'Mes notations' },
    { numero: 9, libelle: 'Mes notifications' }
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
