import {Component, DestroyRef, inject} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { combineLatest, Observable, of } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { AsyncPipe, NgIf } from '@angular/common';
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-signup',
  standalone: true,
  templateUrl: './signup.component.html',
  imports: [
    ReactiveFormsModule,
    NgIf,
    AsyncPipe
  ],
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  signupForm!: FormGroup;
  isSignupDisabled$!: Observable<boolean>;
  errorMessage: string | null = null;

  private readonly fb = inject(FormBuilder)
  private readonly destroyRef = inject(DestroyRef)

  constructor() {
    this.initializeForm();
    this.initializeSignupStatus();
  }

  private initializeForm() {
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  private initializeSignupStatus() {
    const emailControl = this.signupForm.get('email');
    const passwordControl = this.signupForm.get('password');
    const confirmPasswordControl = this.signupForm.get('confirmPassword');

    const email$ = emailControl ? emailControl.valueChanges.pipe(startWith(emailControl.value)) : of('');
    const password$ = passwordControl ? passwordControl.valueChanges.pipe(startWith(passwordControl.value)) : of('');
    const confirmPassword$ = confirmPasswordControl ? confirmPasswordControl.valueChanges.pipe(startWith(confirmPasswordControl.value)) : of('');

    const formStatus$ = this.signupForm.statusChanges.pipe(startWith(this.signupForm.status));

    this.isSignupDisabled$ = combineLatest([email$, password$, confirmPassword$, formStatus$]).pipe(
      takeUntilDestroyed(this.destroyRef),
      map(([email, password, confirmPassword]) => this.validateForm(email, password, confirmPassword))
    );
  }

  private validateForm(email: string, password: string, confirmPassword: string): boolean {
    const isFormValid = this.signupForm.valid && password === confirmPassword;

    if (password && confirmPassword) {
      this.errorMessage = password !== confirmPassword ? 'Passwords do not match' : null;
    } else {
      this.errorMessage = null;
    }

    return !isFormValid;
  }

  onSignup() {
    if (this.signupForm.valid) {
      console.log('Signup successful:', this.signupForm.value);
    } else {
      this.errorMessage = 'Please correct the errors in the form.';
    }
  }

  onReset() {
    this.signupForm.reset();
    this.signupForm.markAsPristine();
    this.signupForm.markAsUntouched();
    this.signupForm.updateValueAndValidity();
  }
}
