import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { RegisterComponent } from './register.component';

describe('Register', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  /** Remplit l'étape 1 avec des valeurs valables. */
  function remplirIdentite(): void {
    component.form.nom = 'Konan';
    component.form.prenom = 'Aya';
    component.form.role = 'parent';
  }

  /** Remplit l'étape 2 avec des valeurs valables. */
  function remplirCoordonnees(): void {
    component.form.telephone = '07 08 12 34 56';
    component.form.email = 'aya.konan@email.com';
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('demarre a l etape 1 sans erreur', () => {
    expect(component.currentStep).toBe(1);
    expect(component.errorMessage).toBe('');
  });

  // ===== Étape 1 =====

  it('exige le nom et le prenom', () => {
    component.nextStep();
    expect(component.currentStep).toBe(1);
    expect(component.errorMessage).toContain('nom et le prénom');
  });

  it('exige le choix du role', () => {
    component.form.nom = 'Konan';
    component.form.prenom = 'Aya';
    component.nextStep();
    expect(component.currentStep).toBe(1);
    expect(component.errorMessage).toContain('Répétiteur ou Parent');
  });

  it('passe a l etape 2 et efface l erreur precedente', () => {
    component.nextStep();                       // echec : pose une erreur
    expect(component.errorMessage).not.toBe('');

    remplirIdentite();
    component.nextStep();                       // succes : doit effacer l'erreur
    expect(component.currentStep).toBe(2);
    expect(component.errorMessage).toBe('');
  });

  // ===== Étape 2 =====

  it('exige le telephone puis l email', () => {
    remplirIdentite();
    component.nextStep();

    component.nextStep();
    expect(component.errorMessage).toContain('téléphone');

    component.form.telephone = '07 08 12 34 56';
    component.nextStep();
    expect(component.errorMessage).toContain('email');
    expect(component.currentStep).toBe(2);
  });

  it('refuse un email mal forme', () => {
    remplirIdentite();
    component.nextStep();
    component.form.telephone = '07 08 12 34 56';
    component.form.email = 'aya.konan';
    component.nextStep();
    expect(component.currentStep).toBe(2);
    expect(component.errorMessage).toContain('format');
  });

  it('atteint l etape 3 avec des coordonnees valables', () => {
    remplirIdentite();
    component.nextStep();
    remplirCoordonnees();
    component.nextStep();
    expect(component.currentStep).toBe(3);
    expect(component.errorMessage).toBe('');
  });

  it('ne depasse pas l etape 3', () => {
    remplirIdentite();
    component.nextStep();
    remplirCoordonnees();
    component.nextStep();
    component.nextStep();
    expect(component.currentStep).toBe(3);
  });

  // ===== Retour arrière =====

  it('revient en arriere sans descendre sous 1', () => {
    remplirIdentite();
    component.nextStep();
    expect(component.currentStep).toBe(2);

    component.prevStep();
    expect(component.currentStep).toBe(1);

    component.prevStep();
    expect(component.currentStep).toBe(1);
  });

  // ===== Soumission =====

  it('exige les deux mots de passe', () => {
    component.onSubmit();
    expect(component.errorMessage).toContain('confirmer votre mot de passe');
  });

  it('refuse deux mots de passe differents', () => {
    component.form.password = 'Ivoire2026';
    component.form.confirm = 'Ivoire2027';
    component.onSubmit();
    expect(component.errorMessage).toContain('ne correspondent pas');
  });

  it('refuse un mot de passe trop court', () => {
    component.form.password = 'abc';
    component.form.confirm = 'abc';
    component.onSubmit();
    expect(component.errorMessage).toContain('6 caractères');
  });

  it('exige l acceptation des conditions', () => {
    component.form.password = 'Ivoire2026';
    component.form.confirm = 'Ivoire2026';
    component.onSubmit();
    expect(component.errorMessage).toContain('conditions générales');
  });

  it('redirige vers la connexion une fois le formulaire valable', () => {
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate');

    remplirIdentite();
    remplirCoordonnees();
    component.form.password = 'Ivoire2026';
    component.form.confirm = 'Ivoire2026';
    component.form.acceptConditions = true;
    component.onSubmit();

    expect(component.errorMessage).toBe('');
    expect(navigate).toHaveBeenCalledWith(['/auth/login']);
  });
});
