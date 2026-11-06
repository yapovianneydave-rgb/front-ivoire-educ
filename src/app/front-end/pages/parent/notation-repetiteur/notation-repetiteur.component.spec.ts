import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotationRepetiteurComponent } from './notation-repetiteur.component';

describe('NotationRepetiteur', () => {
  let component: NotationRepetiteurComponent;
  let fixture: ComponentFixture<NotationRepetiteurComponent>;

  /** Note tous les critères avec la même valeur. */
  function noterTout(valeur: number): void {
    component.criteres.forEach(c => component.noter(c, valeur));
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotationRepetiteurComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(NotationRepetiteurComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('les ponderations totalisent 100 pour cent', () => {
    expect(component.sommePoids()).toBe(100);
  });

  it('calcule le score global pondere du repetiteur', () => {
    // 4.9x25 + 4.8x35 + 5.0x20 + 4.6x20 = 480,5 -> 4,8
    expect(component.scoreGlobal()).toBe(4.8);
  });

  it('recalcule le score en changeant de repetiteur', () => {
    component.choisirRepetiteur(2);
    // 4.5x25 + 4.0x35 + 4.6x20 + 3.8x20 = 419,25 -> 4,2
    expect(component.scoreGlobal()).toBe(4.2);
  });

  it('ne propose pas de score tant que tout n est pas note', () => {
    expect(component.scoreSaisi()).toBeNull();
    component.noter(component.criteres[0], 5);
    expect(component.notesCompletes()).toBe(false);
    expect(component.scoreSaisi()).toBeNull();
  });

  it('pondere la note saisie', () => {
    noterTout(4);
    expect(component.scoreSaisi()).toBe(4);
    // Seule la pedagogie a 5 : 4x25 + 5x35 + 4x20 + 4x20 = 435 -> 4,4
    component.noter(component.criteres[1], 5);
    expect(component.scoreSaisi()).toBe(4.4);
  });

  it('refuse l envoi avec des criteres manquants', () => {
    component.noter(component.criteres[0], 5);
    component.envoyer();
    expect(component.envoye()).toBe(false);
    expect(component.erreur()).toContain('Pédagogie');
  });

  it('envoie une notation complete', () => {
    noterTout(5);
    component.commentaire = 'Très bon suivi.';
    component.envoyer();
    expect(component.envoye()).toBe(true);
    expect(component.erreur()).toBeNull();
  });

  it('remet la saisie a zero en changeant de repetiteur', () => {
    noterTout(5);
    component.commentaire = 'Texte';
    component.choisirRepetiteur(2);
    expect(component.notesCompletes()).toBe(false);
    expect(component.commentaire).toBe('');
    expect(component.envoye()).toBe(false);
  });

  it('mesure la barre de moyenne sur 5', () => {
    const comportement = component.criteres.find(c => c.id === 'comportement')!;
    expect(component.largeur(comportement)).toBe(100);   // 5,0 / 5
  });
});
