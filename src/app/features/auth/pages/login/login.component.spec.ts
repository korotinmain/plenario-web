import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, BehaviorSubject } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthStore, AuthStoreState } from '../../data-access/auth.store';
import { AuthService } from '../../../../core/auth/auth.service';
import { AuthApiService } from '../../data-access/auth-api.service';

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
};

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let stateSubject: BehaviorSubject<AuthStoreState>;
  let authStoreMock: Partial<AuthStore>;
  let authApiMock: Partial<AuthApiService>;

  beforeEach(async () => {
    stateSubject = new BehaviorSubject<AuthStoreState>(initialState);
    authStoreMock = {
      state$: stateSubject.asObservable(),
      login: vi.fn().mockReturnValue(of(void 0)),
      resendConfirmation: vi.fn().mockReturnValue(of(void 0)),
      resetLoginState: vi.fn(),
    };
    authApiMock = {
      googleLogin: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthStore, useValue: authStoreMock },
        { provide: AuthApiService, useValue: authApiMock },
        {
          provide: AuthService,
          useValue: { user$: of(null), isAuthenticated$: of(false), initialized$: of(false) },
        },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the login form', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('form')).toBeTruthy();
    expect(el.querySelector('button[type="submit"]')).toBeTruthy();
  });

  it('should not submit if form is invalid', () => {
    component.submit();
    expect(authStoreMock.login).not.toHaveBeenCalled();
  });

  it('should mark form controls as touched on invalid submit', () => {
    component.submit();
    expect(component.emailCtrl.touched).toBe(true);
    expect(component.passwordCtrl.touched).toBe(true);
  });

  it('should call login() when form is valid', () => {
    component.emailCtrl.setValue('test@example.com');
    component.passwordCtrl.setValue('password123');
    component.submit();
    expect(authStoreMock.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('should show unverified email banner when loginErrorType is unverified_email', () => {
    stateSubject.next({
      ...initialState,
      loginErrorType: 'unverified_email',
      loginError: 'Email not verified.',
      unverifiedEmail: 'test@example.com',
    });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.unverified-banner')).toBeTruthy();
  });

  it('should not show generic error when error type is unverified_email', () => {
    stateSubject.next({
      ...initialState,
      loginErrorType: 'unverified_email',
      loginError: 'Email not verified.',
      unverifiedEmail: 'test@example.com',
    });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.field-error-banner')).toBeNull();
  });

  it('should show generic error for invalid_credentials', () => {
    stateSubject.next({
      ...initialState,
      loginErrorType: 'invalid_credentials',
      loginError: 'Invalid email or password.',
    });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.field-error-banner')).toBeTruthy();
    expect(el.textContent).toContain('Invalid email or password.');
  });

  it('should call resendConfirmation() when resend button is clicked', () => {
    stateSubject.next({
      ...initialState,
      loginErrorType: 'unverified_email',
      unverifiedEmail: 'test@example.com',
    });
    fixture.detectChanges();

    const resendBtn = (fixture.nativeElement as HTMLElement).querySelector(
      '.resend-btn',
    ) as HTMLButtonElement;
    resendBtn?.click();

    expect(authStoreMock.resendConfirmation).toHaveBeenCalledWith('test@example.com');
  });

  it('should call googleLogin() when Google button is clicked', () => {
    const googleBtn = (fixture.nativeElement as HTMLElement).querySelector(
      '.google-btn',
    ) as HTMLButtonElement;
    googleBtn?.click();
    expect(authApiMock.googleLogin).toHaveBeenCalled();
  });

  it('should call resetLoginState() on destroy', () => {
    fixture.destroy();
    expect(authStoreMock.resetLoginState).toHaveBeenCalled();
  });
});
