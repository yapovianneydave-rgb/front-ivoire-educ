import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ReglerUnPaiementComponent } from './regler-un-paiement.component';
import { PaiementStore } from '../../../services/paiement.store';

describe('ReglerUnPaiement', () => {
  let component: ReglerUnPaiementComponent;
  let fixture: ComponentFixture<ReglerUnPaiementComponent>;
  let store: PaiementStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReglerUnPaiementComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    store = TestBed.inject(PaiementStore);
    fixture = TestBed.createComponent(ReglerUnPaiementComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('propose les douze mois dans la liste', () => {
    expect(component.echeances().length).toBe(12);
  });

  it('ouvre sur l echeance encore a regler', () => {
    expect(component.echeance().statut).toBe('a-regler');
    expect(component.reglable()).toBe(true);
  });

  it('libelle chaque option avec montant et statut', () => {
    const ouverte = store.echeanceEnCours()!;
    const libelle = component.optionMois(ouverte);
    expect(libelle).toContain(ouverte.mois);
    expect(libelle).toContain('À régler');
  });

  it('selectionne Wave par defaut', () => {
    expect(component.moyenChoisi().id).toBe('wave');
  });

  it('calcule les frais Wave a 1,2 pour cent', () => {
    expect(component.frais()).toBe(900);      // 75 000 x 1,2 %
    expect(component.total()).toBe(75900);
  });

  it('recalcule le total en changeant de moyen', () => {
    component.choisir(component.moyens.find(m => m.id === 'orange')!);
    expect(component.frais()).toBe(1125);     // 75 000 x 1,5 %
    expect(component.total()).toBe(76125);
  });

  it('un virement ne coute rien', () => {
    component.choisir(component.moyens.find(m => m.id === 'virement')!);
    expect(component.frais()).toBe(0);
    expect(component.total()).toBe(75000);
    expect(component.moyenChoisi().delai).toBe('48h');
  });

  it('ignore un canal desactive', () => {
    component.choisir(component.moyens.find(m => m.id === 'especes')!);
    expect(component.moyenChoisi().id).toBe('wave');
  });

  it('bascule en consultation sur un mois deja regle', () => {
    const paye = store.paiements().find(p => p.statut === 'paye')!;
    component.choisirEcheance(String(paye.id));
    expect(component.reglable()).toBe(false);
    expect(component.titre()).toContain('Facture de');
  });

  it('refuse un numero incomplet', () => {
    component.numero = '0708';
    component.confirmer();
    expect(component.confirme()).toBe(false);
    expect(component.erreur()).toBeTruthy();
  });

  it('ne regle pas une echeance deja soldee', () => {
    const paye = store.paiements().find(p => p.statut === 'paye')!;
    component.choisirEcheance(String(paye.id));
    component.confirmer();
    expect(component.confirme()).toBe(false);
  });

  it('propage le reglement au store partage', () => {
    const id = component.echeance().id;
    component.choisir(component.moyens.find(m => m.id === 'orange')!);
    component.confirmer();

    expect(component.confirme()).toBe(true);
    expect(store.parId(id)!.statut).toBe('paye');
    expect(store.parId(id)!.moyen).toBe('Orange Money');
    expect(store.echeanceEnCours()).toBeNull();
    expect(store.soldeDuMois()).toBe(0);
  });
});
