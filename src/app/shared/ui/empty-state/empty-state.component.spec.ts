import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { EmptyStateComponent } from './empty-state.component';

describe('EmptyStateComponent', () => {
  let component: EmptyStateComponent;
  let fixture: ComponentFixture<EmptyStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyStateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyStateComponent);
    component = fixture.componentInstance;
    component.title = 'Nothing here';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the title', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.empty-state__title')?.textContent?.trim()).toBe('Nothing here');
  });

  it('should display the message when provided', () => {
    fixture.componentRef.setInput('message', 'Add something to get started.');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.empty-state__message')?.textContent?.trim()).toContain(
      'Add something to get started.',
    );
  });

  it('should use the default icon when none provided', () => {
    expect(component.icon).toBe('inbox');
  });

  it('should use the provided icon', () => {
    fixture.componentRef.setInput('icon', 'folder_open');
    fixture.detectChanges();
    const matIcon = fixture.debugElement.query(By.css('mat-icon'));
    expect(matIcon.nativeElement.textContent?.trim()).toBe('folder_open');
  });
});
