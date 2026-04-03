import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageHeaderComponent } from './page-header.component';

describe('PageHeaderComponent', () => {
  let component: PageHeaderComponent;
  let fixture: ComponentFixture<PageHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageHeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageHeaderComponent);
    component = fixture.componentInstance;
    component.title = 'Test Page';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the title', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.page-header__title')?.textContent?.trim()).toBe('Test Page');
  });

  it('should not show subtitle when not provided', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.page-header__subtitle')).toBeNull();
  });

  it('should display subtitle when provided', () => {
    fixture.componentRef.setInput('subtitle', 'A helpful subtitle');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.page-header__subtitle')?.textContent?.trim()).toBe(
      'A helpful subtitle',
    );
  });
});
