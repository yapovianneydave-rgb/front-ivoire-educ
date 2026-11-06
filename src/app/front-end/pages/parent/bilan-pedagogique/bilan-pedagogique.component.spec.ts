import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BilanPedagogiqueComponent } from './bilan-pedagogique.component';

describe('BilanPedagogique', () => {
  let component: BilanPedagogiqueComponent;
  let fixture: ComponentFixture<BilanPedagogiqueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BilanPedagogiqueComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(BilanPedagogiqueComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('affiche le bilan le plus recent par defaut', () => {
    expect(component.bilanAffiche().eleve).toBe('Junior Konan');
    expect(component.bilanAffiche().matiere).toBe('Mathématiques');
  });

  it('calcule le pourcentage de notions maitrisees', () => {
    expect(component.pourcentage()).toBe(88);   // 7 / 8
  });

  it('change de bilan au clic sur l historique', () => {
    component.afficher(component.bilans()[1]);
    expect(component.bilanAffiche().eleve).toBe('Grace Konan');
    expect(component.pourcentage()).toBe(57);   // 4 / 7
  });

  it('atteint 100 pour cent quand tout est couvert', () => {
    component.afficher(component.bilans()[2]);
    expect(component.pourcentage()).toBe(100);  // 6 / 6
  });

  it('traduit les statuts', () => {
    expect(component.libelleStatut('atteint')).toBe('Objectif atteint');
    expect(component.libelleStatut('en-progres')).toBe('En progrès');
    expect(component.libelleStatut('non-atteint')).toBe('Objectif non atteint');
  });

  it('annonce l export du bilan choisi', () => {
    component.exporter(component.bilans()[1]);
    expect(component.message()).toContain('Grace Konan');
    expect(component.message()).toContain('30 juin–13 juil. 2026');
  });

  it('efface le message en changeant de bilan', () => {
    component.exporter(component.bilans()[0]);
    expect(component.message()).not.toBeNull();
    component.afficher(component.bilans()[1]);
    expect(component.message()).toBeNull();
  });
});
