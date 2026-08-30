import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleBadge } from './role-badge';

describe('RoleBadge', () => {
  let component: RoleBadge;
  let fixture: ComponentFixture<RoleBadge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleBadge],
    }).compileComponents();

    fixture = TestBed.createComponent(RoleBadge);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
