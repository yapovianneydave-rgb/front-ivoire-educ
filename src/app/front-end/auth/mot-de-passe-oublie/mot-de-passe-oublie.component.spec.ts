import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { MotDePasseOublieComponent } from './mot-de-passe-oublie.component';

describe('MotDePasseOublie', () => {
  let component: MotDePasseOublieComponent;
  let fixture: ComponentFixture<MotDePasseOublieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MotDePasseOublieComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(MotDePasseOublieComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('reste à l\'étape 1 tant que l\'identifiant est vide', () => {
    component.envoyerLeCode();
    expect(component.etape()).toBe(1);
    expect(component.erreur()).toBeTruthy();
  });

  it('passe à l\'étape 2 avec un numéro valide', () => {
    component.choisirCanal('sms');
    component.identifiant = '07 08 12 34 56';
    component.envoyerLeCode();
    expect(component.etape()).toBe(2);
  });

  it('refuse un email mal formé', () => {
    component.choisirCanal('email');
    component.identifiant = 'aya.konan';
    component.envoyerLeCode();
    expect(component.etape()).toBe(1);
  });
});
