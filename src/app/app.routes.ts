import { Routes } from '@angular/router';
import {AuthLayoutComponent} from './front-end/layouts/auth-layout/auth-layout.component';
import {LoginComponent} from './front-end/auth/login/login.component';
import {RegisterComponent} from './front-end/auth/register/register.component';
import {MotDePasseOublieComponent} from './front-end/auth/mot-de-passe-oublie/mot-de-passe-oublie.component';
import {ParentLayoutComponent} from './front-end/layouts/parent-layout/parent-layout.component';
import {TableauDeBordParentComponent} from './front-end/pages/parent/tableau-de-bord/tableau-de-bord.component';
import {InformationsPersonnellesComponent} from './front-end/pages/parent/informations-personnelles/informations-personnelles.component';
import {InformationsElevesComponent} from './front-end/pages/parent/informations-eleves/informations-eleves.component';
import {RepetiteursAssignesComponent} from './front-end/pages/parent/repetiteurs-assignes/repetiteurs-assignes.component';
import {BilanPedagogiqueComponent} from './front-end/pages/parent/bilan-pedagogique/bilan-pedagogique.component';
import {PaiementComponent} from './front-end/pages/parent/paiement/paiement.component';
import {ReglerUnPaiementComponent} from './front-end/pages/parent/regler-un-paiement/regler-un-paiement.component';
import {NotationRepetiteurComponent} from './front-end/pages/parent/notation-repetiteur/notation-repetiteur.component';
import {DemandesSpecialesComponent} from './front-end/pages/parent/demandes-speciales/demandes-speciales.component';
import {RepetiteurLayoutComponent} from './front-end/layouts/repetiteur-layout/repetiteur-layout.component';
import {MonProfilComponent} from './front-end/pages/repetiteur/mon-profil/mon-profil.component';
import { MesDisponibilitesComponent } from './front-end/pages/repetiteur/mes-disponibilites/mes-disponibilites.component';
import {MesElevesComponent} from './front-end/pages/repetiteur/mes-eleves/mes-eleves.component';
import {AdminLayoutComponent} from './front-end/layouts/admin-layout/admin-layout.component';
import {AccueilAdminComponent} from './front-end/pages/admin/accueil/accueil-admin.component';
import {roleGuard} from './front-end/services/auth-demo.service';

export const routes: Routes = [

  // ===== Authentification =====
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
      { path: 'auth/login', component: LoginComponent },
      { path: 'auth/register', component: RegisterComponent },
      { path: 'auth/mot-de-passe-oublie', component: MotDePasseOublieComponent }
    ]
  },

  // ===== Espace Parent =====
  {
    path: 'parent',
    component: ParentLayoutComponent,
    canActivate: [roleGuard('parent')],
    children: [
      { path: '', redirectTo: 'tableau-de-bord', pathMatch: 'full' },
      { path: 'tableau-de-bord', component: TableauDeBordParentComponent },
      { path: 'informations-personnelles', component: InformationsPersonnellesComponent },
      { path: 'informations-eleves', component: InformationsElevesComponent },
      { path: 'repetiteurs-assignes', component: RepetiteursAssignesComponent },
      { path: 'bilan-pedagogique', component: BilanPedagogiqueComponent },
      { path: 'paiement', component: PaiementComponent },
      { path: 'regler-un-paiement', component: ReglerUnPaiementComponent },
      { path: 'notation-repetiteur', component: NotationRepetiteurComponent },
      { path: 'demandes-speciales', component: DemandesSpecialesComponent }
    ]
  },

  // ===== Espace Répétiteur =====
  {
    path: 'repetiteur',
    component: RepetiteurLayoutComponent,
    canActivate: [roleGuard('repetiteur')],
    children: [
      { path: '', redirectTo: 'mon-profil', pathMatch: 'full' },
      { path: 'mon-profil', component: MonProfilComponent },
      { path: 'mes-disponibilites', component: MesDisponibilitesComponent },
      { path: 'mes-eleves', component: MesElevesComponent }
    ]
  },

  // ===== Espace Admin =====
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [roleGuard('admin')],
    children: [
      { path: '', redirectTo: 'accueil', pathMatch: 'full' },
      { path: 'accueil', component: AccueilAdminComponent }
    ]
  },

  // Toute URL inconnue renvoie à la connexion.
  { path: '**', redirectTo: 'auth/login' }

];
