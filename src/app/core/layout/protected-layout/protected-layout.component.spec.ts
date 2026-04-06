import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ProtectedLayoutComponent } from './protected-layout.component';

describe('ProtectedLayoutComponent', () => {
  let component: ProtectedLayoutComponent;
  let fixture: ComponentFixture<ProtectedLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProtectedLayoutComponent],
      providers: [provideRouter([]), provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProtectedLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the Plenario logo in the sidebar', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.sidebar-logo')?.textContent?.trim()).toBe('Plenario');
  });

  it('should render all nav items', () => {
    const el = fixture.nativeElement as HTMLElement;
    const navItems = el.querySelectorAll('a.nav-item');
    expect(navItems.length).toBe(4);
  });

  it('should include navigation links for core routes', () => {
    const navItems = component.navItems;
    const routes = navItems.map((item) => item.route);
    expect(routes).toContain('/dashboard');
    expect(routes).toContain('/projects');
    expect(routes).toContain('/tasks');
    expect(routes).toContain('/settings');
  });
});
