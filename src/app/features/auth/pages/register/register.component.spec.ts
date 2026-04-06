import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { RegisterComponent } from './register.component';
import { AuthStore } from '../../data-access/auth.store';
import { AuthService } from '../../../../core/auth/auth.service';
import { BehaviorSubject } from 'rxjs';
import { AuthStoreState } from '../../data-access/auth.store';

const initialState: AuthStoreState = {
  registerLoading: false,
  registerError: null,
  registerSuccess: false,
  loginLoading: false,
  loginError: null,
  loginErrorType: null,
  unverifiedEmail: null,
  resendLoading: false,
  resendSuccess: false,
  resendError: null,
  forgotPasswordLoading: false,
  forgotPasswordError: null,
  forgotPasswordSuccess: false,
  resetPasswordLoading: false,
  resetPasswordError: null,
  resetPasswordSuccess: false,
};

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let stateSubject: BehaviorSubject<AuthStoreState>;
  let authStoreMock: Partial<AuthStore>;

  beforeEach(async () => {
    stateSubject = new BehaviorSubject<AuthStoreState>(initialState);
    authStoreMock = {
      state$: stateSubject.asObservable(),
      register: vi.fn().mockReturnValue(of(void 0)),
      resetRegisterState: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthStore, useValue: authStoreMock },
        {
          provide: AuthService,
          useValue: { user$: of(null), isAuthenticated$: of(false), initialized$: of(false) },
        },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the registration form', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('form')).toBeTruthy();
    expect(el.querySelector('button[type="submit"]')).toBeTruthy();
  });

  it('should not submit if form is invalid', () => {
    component.submit();
    expect(authStoreMock.register).not.toHaveBeenCalled();
  });

  it('should mark form as touched on invalid submit', () => {
    component.submit();
    expect(component.emailCtrl.touched).toBe(true);
    expect(component.passwordCtrl.touched).toBe(true);
  });

  it('should call register() when form is valid', () => {
    component.emailCtrl.setValue('test@example.com');
    component.passwordCtrl.setValue('password123');
    component.submit();
    expect(authStoreMock.register).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      name: undefined,
    });
  });

  it('should include name when provided', () => {
    component.nameCtrl.setValue('Alice');
    component.emailCtrl.setValue('alice@example.com');
    component.passwordCtrl.setValue('password123');
    component.submit();
    expect(authStoreMock.register).toHaveBeenCalledWith({
      email: 'alice@example.com',
      password: 'password123',
      name: 'Alice',
    });
  });

  it('should show success block when registerSuccess is true', () => {
    stateSubject.next({ ...initialState, registerSuccess: true });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.success-block')).toBeTruthy();
    expect(el.querySelector('form')).toBeNull();
  });

  it('should show error message when registerError is set', () => {
    stateSubject.next({ ...initialState, registerError: 'Email already in use.' });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.field-error-banner')).toBeTruthy();
    expect(el.textContent).toContain('Email already in use.');
  });

  it('should call resetRegisterState() on destroy', () => {
    fixture.destroy();
    expect(authStoreMock.resetRegisterState).toHaveBeenCalled();
  });
});
