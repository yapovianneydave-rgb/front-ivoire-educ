import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InformationsElevesComponent } from './informations-eleves.component';

describe('InformationsEleves', () => {
  let component: InformationsElevesComponent;
  let fixture: ComponentFixture<InformationsElevesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InformationsElevesComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(InformationsElevesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('aucune modale a l ouverture', () => {
    expect(component.eleveDetaille()).toBeNull();
    expect(component.eleveARetirer()).toBeNull();
  });

  it('ouvre le detail de l eleve choisi', () => {
    const junior = component.eleves()[0];
    component.ouvrirDetail(junior);
    expect(component.eleveDetaille()?.prenom).toBe('Junior');
  });

  it('echap ferme la modale', () => {
    component.ouvrirDetail(component.eleves()[0]);
    component.surEchap();
    expect(component.eleveDetaille()).toBeNull();
  });

  it('ne retire rien sans confirmation', () => {
    component.demanderRetrait(component.eleves()[0]);
    expect(component.eleves().length).toBe(2);
    component.fermer();
    expect(component.eleves().length).toBe(2);
  });

  it('retire l eleve apres confirmation', () => {
    component.demanderRetrait(component.eleves()[0]);
    component.confirmerRetrait();
    expect(component.eleves().length).toBe(1);
    expect(component.eleves()[0].prenom).toBe('Grace');
    expect(component.message()).toContain('Junior');
  });

  it('ne liste qu une fois un repetiteur couvrant deux matieres', () => {
    const junior = component.eleves()[0];
    expect(junior.repetiteurs.length).toBe(2);
    const uniques = component.repetiteursUniques(junior);
    expect(uniques.length).toBe(1);
    expect(uniques[0].matiere).toBe('Mathématiques, Physique-Chimie');
  });

  it('calcule les initiales', () => {
    expect(component.initiales(component.eleves()[0])).toBe('JK');
  });
});
