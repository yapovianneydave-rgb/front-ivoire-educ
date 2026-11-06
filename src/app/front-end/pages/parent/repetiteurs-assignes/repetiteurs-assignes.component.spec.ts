import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepetiteursAssignesComponent } from './repetiteurs-assignes.component';

describe('RepetiteursAssignes', () => {
  let component: RepetiteursAssignesComponent;
  let fixture: ComponentFixture<RepetiteursAssignesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RepetiteursAssignesComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(RepetiteursAssignesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('aucune modale a l ouverture', () => {
    expect(component.appelEnCours()).toBeNull();
    expect(component.signalement()).toBeNull();
  });

  it('remplit les etoiles selon la note', () => {
    const kouassi = component.repetiteurs()[0];   // 4.8 -> 5 etoiles
    const diabate = component.repetiteurs()[1];   // 4.2 -> 4 etoiles
    expect(component.etoilePleine(kouassi, 5)).toBe(true);
    expect(component.etoilePleine(diabate, 5)).toBe(false);
    expect(component.etoilePleine(diabate, 4)).toBe(true);
  });

  it('propose Contester sur un passage confirme', () => {
    expect(component.libelleAction('confirme')).toBe('Contester');
    expect(component.libelleStatut('confirme')).toBe('Passage confirmé');
  });

  it('propose Signaler quand le pointage manque', () => {
    expect(component.libelleAction('attente')).toBe('Signaler');
    expect(component.libelleStatut('attente')).toBe('En attente de pointage');
  });

  it('choisit le type de signalement selon le statut', () => {
    component.ouvrirSignalement(component.repetiteurs()[0]);
    expect(component.signalement()?.type).toBe('contestation');
    component.ouvrirSignalement(component.repetiteurs()[1]);
    expect(component.signalement()?.type).toBe('absence-pointage');
  });

  it('refuse un motif trop court', () => {
    component.ouvrirSignalement(component.repetiteurs()[0]);
    component.motif = 'trop';
    component.envoyerSignalement();
    expect(component.signalement()).not.toBeNull();
    expect(component.erreurMotif()).toBeTruthy();
  });

  it('envoie le signalement avec un motif valable', () => {
    component.ouvrirSignalement(component.repetiteurs()[0]);
    component.motif = "Le cours n'a duré que 40 minutes.";
    component.envoyerSignalement();
    expect(component.signalement()).toBeNull();
    expect(component.message()).toContain('24 h');
  });

  it('n ouvre qu une modale a la fois', () => {
    component.appeler(component.repetiteurs()[0]);
    expect(component.appelEnCours()).not.toBeNull();
    component.ouvrirSignalement(component.repetiteurs()[0]);
    expect(component.appelEnCours()).toBeNull();
    expect(component.signalement()).not.toBeNull();
  });

  it('echap ferme tout', () => {
    component.appeler(component.repetiteurs()[0]);
    component.surEchap();
    expect(component.appelEnCours()).toBeNull();
  });
});
