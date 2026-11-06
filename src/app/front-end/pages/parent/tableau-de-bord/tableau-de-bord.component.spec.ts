import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { TableauDeBordParentComponent } from './tableau-de-bord.component';

describe('TableauDeBordParent', () => {
  let component: TableauDeBordParentComponent;
  let fixture: ComponentFixture<TableauDeBordParentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableauDeBordParentComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(TableauDeBordParentComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('affiche toute l activite sans filtre', () => {
    expect(component.enfantAffiche()).toBeNull();
    expect(component.activiteFiltree().length).toBe(3);
  });

  it('filtre l activite sur l enfant choisi', () => {
    component.choisirEnfant(2);
    expect(component.activiteFiltree().length).toBe(1);
    expect(component.activiteFiltree()[0].enfantId).toBe(2);
  });

  it('adapte le prochain cours a l enfant choisi', () => {
    component.choisirEnfant(1);
    expect(component.prochainCours().detail).toContain('Junior');
    component.choisirEnfant(null);
    expect(component.prochainCours().detail).toContain('Grace');
  });
});
