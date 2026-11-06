import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InformationsPersonnellesComponent } from './informations-personnelles.component';

describe('InformationsPersonnelles', () => {
  let component: InformationsPersonnellesComponent;
  let fixture: ComponentFixture<InformationsPersonnellesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InformationsPersonnellesComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(InformationsPersonnellesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('demarre en lecture seule', () => {
    expect(component.modeEdition()).toBe(false);
  });

  it('annuler restaure les valeurs enregistrees', () => {
    component.activerEdition();
    component.majChamp('nom', 'Autre');
    expect(component.coordonnees().nom).toBe('Autre');
    component.annulerEdition();
    expect(component.coordonnees().nom).toBe('Konan');
    expect(component.modeEdition()).toBe(false);
  });

  it('refuse un email mal forme', () => {
    component.activerEdition();
    component.majChamp('email', 'aya.konan');
    component.enregistrerCoordonnees();
    expect(component.modeEdition()).toBe(true);
    expect(component.erreurCoordonnees()).toBeTruthy();
  });

  it('previent quand le telephone change', () => {
    component.activerEdition();
    component.majChamp('telephone', '+225 01 02 03 04 05');
    component.enregistrerCoordonnees();
    expect(component.modeEdition()).toBe(false);
    expect(component.messageCoordonnees()).toContain('SMS');
  });

  it('ne bascule pas un canal verrouille', () => {
    const inapp = component.canaux().find(c => c.id === 'inapp')!;
    component.basculer(inapp, 'bilans');
    expect(component.canaux().find(c => c.id === 'inapp')!.bilans).toBe(true);
  });

  it('bascule un canal normal', () => {
    const sms = component.canaux().find(c => c.id === 'sms')!;
    component.basculer(sms, 'bilans');
    expect(component.canaux().find(c => c.id === 'sms')!.bilans).toBe(true);
  });

  it('refuse deux mots de passe differents', () => {
    component.motDePasseActuel = 'Ancien123';
    component.nouveauMotDePasse = 'Nouveau123';
    component.confirmation = 'Nouveau124';
    component.modifierMotDePasse();
    expect(component.erreurMotDePasse()).toBeTruthy();
  });

  it('accepte un mot de passe conforme', () => {
    component.motDePasseActuel = 'Ancien123';
    component.nouveauMotDePasse = 'Nouveau123';
    component.confirmation = 'Nouveau123';
    component.modifierMotDePasse();
    expect(component.erreurMotDePasse()).toBeNull();
    expect(component.messageMotDePasse()).toBeTruthy();
  });
});
