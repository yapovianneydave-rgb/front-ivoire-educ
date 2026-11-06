import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { PaiementComponent } from './paiement.component';

/** Libellé « Mois Année » décalé de n mois, pour comparer sans figer de date. */
function moisDecale(n: number): string {
  const date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth() + n);
  const libelle = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  return libelle.charAt(0).toUpperCase() + libelle.slice(1);
}

describe('Paiement', () => {
  let component: PaiementComponent;
  let fixture: ComponentFixture<PaiementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaiementComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(PaiementComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('couvre douze mois glissants', () => {
    expect(component.paiements().length).toBe(12);
  });

  it('deduit le solde de l echeance ouverte', () => {
    expect(component.echeanceEnCours()?.mois).toBe(moisDecale(1));
    expect(component.soldeDuMois()).toBe(75000);
  });

  it('place l echeance ouverte dans le futur', () => {
    expect(component.aJour()).toBe(true);
  });

  it('compte les regularisations tardives depuis les lignes', () => {
    expect(component.regularisationsTardives()).toBe(1);
    expect(component.libelleRegularisations()).toBe('1 régularisation tardive sur 12 mois');
  });

  it('fixe le rappel une semaine avant l echeance', () => {
    const echeance = component.echeanceEnCours()!;
    const [jj, mm, aaaa] = echeance.echeance.split('/').map(Number);
    const attendu = new Date(aaaa, mm - 1, jj);
    attendu.setDate(attendu.getDate() - 7);
    expect(component.prochainRappel())
      .toBe(attendu.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }));
  });

  it('filtre l historique par enfant', () => {
    expect(component.paiementsFiltres().length).toBe(12);
    component.filtrer(2);
    expect(component.paiementsFiltres().every(p => p.eleve === 'Grace Konan')).toBe(true);
    expect(component.paiementsFiltres().length).toBe(6);
    component.filtrer(null);
    expect(component.paiementsFiltres().length).toBe(12);
  });

  it('formate les montants a la francaise', () => {
    expect(component.montantFormate(75000).replace(/ | /g, ' ')).toBe('75 000 FCFA');
  });

  it('affiche le retard dans le statut', () => {
    const tardif = component.paiements().find(p => p.statut === 'paye-retard')!;
    expect(component.libelleStatut(tardif)).toBe('Payé · J+6');
  });

  it('route vers le module 7 avec l echeance choisie', () => {
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate');
    const echeance = component.echeanceEnCours()!;
    component.regler(echeance);
    expect(navigate).toHaveBeenCalledWith(
      ['/parent/regler-un-paiement'], { queryParams: { echeance: echeance.id } }
    );
  });

  it('ne route pas sans echeance', () => {
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate');
    component.regler(null);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('compte les lignes filtrees a l export', () => {
    component.filtrer(2);
    component.exporter();
    expect(component.message()).toContain('6 lignes');
  });
});
