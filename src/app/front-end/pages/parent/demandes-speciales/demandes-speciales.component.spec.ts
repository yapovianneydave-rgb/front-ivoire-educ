import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemandesSpecialesComponent } from './demandes-speciales.component';

describe('DemandesSpeciales', () => {
  let component: DemandesSpecialesComponent;
  let fixture: ComponentFixture<DemandesSpecialesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemandesSpecialesComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DemandesSpecialesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('le delai suit le type choisi', () => {
    expect(component.typeChoisi().delaiHeures).toBe(72);
    expect(component.typeChoisi().equipe).toBe('Affectations');

    component.changerType('reclamation');
    expect(component.typeChoisi().delaiHeures).toBe(24);
    expect(component.typeChoisi().equipe).toBe('Support');

    component.changerType('planning');
    expect(component.typeChoisi().delaiHeures).toBe(48);
    expect(component.typeChoisi().equipe).toBe('Plannings');
  });

  it('construit le resume des delais depuis le parametrage', () => {
    const resume = component.resumeDelais();
    expect(resume).toContain('Réclamation / préoccupation 24 h');
    expect(resume).toContain('Changement de répétiteur 72 h');
    // Trie du plus court au plus long
    expect(resume.indexOf('24 h')).toBeLessThan(resume.indexOf('72 h'));
  });

  it('refuse un message trop court', () => {
    component.message = 'court';
    component.envoyer();
    expect(component.demandes().length).toBe(3);
    expect(component.erreur()).toBeTruthy();
  });

  it('ajoute la demande en tete de liste', () => {
    component.changerType('reclamation');
    component.eleveChoisi = 'Grace Konan';
    component.message = 'Le cours de mardi a été écourté sans explication.';
    component.envoyer();

    expect(component.demandes().length).toBe(4);
    const premiere = component.demandes()[0];
    expect(premiere.type).toBe('Réclamation / préoccupation');
    expect(premiere.eleve).toBe('Grace Konan');
    expect(premiere.delaiHeures).toBe(24);
    expect(premiere.statut).toBe('en-cours');
  });

  it('nomme l equipe et le delai dans la confirmation', () => {
    component.message = 'Je souhaite ajouter la SVT au suivi de Junior.';
    component.changerType('matiere');
    component.envoyer();
    expect(component.confirmation()).toContain('Affectations');
    expect(component.confirmation()).toContain('48 h');
  });

  it('vide le message apres envoi', () => {
    component.message = 'Un message suffisamment long pour passer.';
    component.envoyer();
    expect(component.message).toBe('');
  });

  it('affiche l anciennete des demandes ouvertes', () => {
    const ouverte = component.demandes().find(d => d.statut === 'en-cours')!;
    expect(component.libelleStatut(ouverte)).toBe('En cours · J+1');
  });

  it('signale une demande hors delai', () => {
    const ouverte = component.demandes().find(d => d.statut === 'en-cours')!;
    expect(component.horsDelai(ouverte)).toBe(false);   // 24 h < 48 h
    expect(component.horsDelai({ ...ouverte, jours: 4 })).toBe(true);
  });

  it('expose le motif de la demande rejetee', () => {
    expect(component.derniereRejetee()?.motifRejet).toContain('Cocody');
  });
});
