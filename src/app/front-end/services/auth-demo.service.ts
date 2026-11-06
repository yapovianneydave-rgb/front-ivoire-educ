import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';

export type Role = 'parent' | 'repetiteur' | 'admin';

interface CompteDemo {
  matricule: string;
  motDePasse: string;
  role: Role;
  nom: string;
}

/**
 * Comptes de démonstration — prototype sans back-end.
 * TODO : remplacer par POST /auth/login quand l'API sera branchée.
 */
const COMPTES_DEMO: CompteDemo[] = [
  { matricule: 'PAR-0001', motDePasse: 'parent2026', role: 'parent', nom: 'Kouassi Jean' },
  { matricule: 'REP-0001', motDePasse: 'repetiteur2026', role: 'repetiteur', nom: 'Yao Kouassi Bertrand' },
  { matricule: 'ADM-0001', motDePasse: 'admin2026', role: 'admin', nom: 'Administrateur' }
];

/** Écran d'accueil de chaque rôle. */
export const ACCUEIL_PAR_ROLE: Record<Role, string> = {
  parent: '/parent/tableau-de-bord',
  repetiteur: '/repetiteur/mon-profil',
  admin: '/admin/accueil'
};

@Injectable({ providedIn: 'root' })
export class AuthDemoService {

  private readonly navigateur = isPlatformBrowser(inject(PLATFORM_ID));

  /** Renvoie le rôle si les identifiants sont bons, sinon null. */
  connecter(matricule: string, motDePasse: string): Role | null {
    const compte = COMPTES_DEMO.find(
      c => c.matricule.toLowerCase() === matricule.trim().toLowerCase() && c.motDePasse === motDePasse
    );
    if (!compte) return null;
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userId', compte.matricule);
    localStorage.setItem('userName', compte.nom);
    localStorage.setItem('userRole', compte.role);
    return compte.role;
  }

  deconnecter(): void {
    ['isLoggedIn', 'userId', 'userName', 'userRole'].forEach(k => localStorage.removeItem(k));
    sessionStorage.clear();
  }

  /** Rôle de la session en cours ; null si non connecté (ou rendu serveur). */
  roleCourant(): Role | null {
    if (!this.navigateur) return null;
    try {
      if (localStorage.getItem('isLoggedIn') !== 'true') return null;
      return (localStorage.getItem('userRole') as Role) || null;
    } catch {
      return null;
    }
  }

  get estNavigateur(): boolean {
    return this.navigateur;
  }
}

/** Garde : seul le rôle attendu entre ; les autres sont renvoyés vers leur propre espace ou la connexion. */
export function roleGuard(role: Role): CanActivateFn {
  return () => {
    const auth = inject(AuthDemoService);
    const router = inject(Router);
    // Au rendu serveur, localStorage n'existe pas : on laisse le navigateur trancher.
    if (!auth.estNavigateur) return true;
    const courant = auth.roleCourant();
    if (courant === role) return true;
    return router.parseUrl(courant ? ACCUEIL_PAR_ROLE[courant] : '/auth/login');
  };
}
