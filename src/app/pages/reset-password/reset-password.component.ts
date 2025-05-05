import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/api-service/auth.service';
import { sendNotification } from '../../utils/notification';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent implements OnInit {
  passwordForm: FormGroup;
  password: string = '';
  confirmPassword: string = '';
  token: string = '';
  showPassword = false;
  showConfirmPassword = false;
  passwordStrength = 0;
  hasMinLength = false;
  hasUpperCase = false;
  hasNumber = false;
  hasSpecialChar = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute,
    private store: Store
  ) {
    this.passwordForm = this.fb.group(
      {
        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/),
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      { validator: this.passwordMatchValidator }
    );
  }

  ngOnInit(): void {
    // Lấy token từ route parameter 'id'
    this.token = this.route.snapshot.paramMap.get('id') || '';
  }

  backToHome() {
    this.router.navigate(['/']);
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null
      : { passwordMismatch: true };
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  checkPasswordStrength(): void {
    const password = this.passwordForm.get('newPassword')?.value;

    this.hasMinLength = password.length >= 8;
    this.hasUpperCase = /[A-Z]/.test(password);
    this.hasNumber = /[0-9]/.test(password);
    this.hasSpecialChar = /[!@#$%^&*]/.test(password);

    const validConditions = [
      this.hasMinLength,
      this.hasUpperCase,
      this.hasNumber,
      this.hasSpecialChar,
    ].filter(Boolean).length;

    this.passwordStrength = (validConditions / 4) * 100;
  }

  getStrengthLevel(): string {
    if (this.passwordStrength <= 25) return 'weak';
    if (this.passwordStrength <= 75) return 'medium';
    return 'strong';
  }

  getStrengthText(): string {
    switch (this.getStrengthLevel()) {
      case 'weak':
        return 'Weak Password';
      case 'medium':
        return 'Medium Strength';
      case 'strong':
        return 'Strong Password';
      default:
        return '';
    }
  }

  onSubmit(): void {
    if (this.passwordForm.valid) {
      this.isLoading = true;
      // Lấy mật khẩu mới từ form
      const newPassword = this.passwordForm.get('newPassword')?.value;
      console.log(
        'Reset password with token:',
        this.token,
        'and new password:',
        newPassword
      );

      // Gọi API resetPassword với token và newPassword
      this.authService.resetPassword(this.token, newPassword).subscribe({
        next: (response) => {
          console.log('Password reset successful:', response);
          // Sau khi reset thành công, có thể chuyển hướng về trang đăng nhập hoặc trang chủ
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 2000);
          sendNotification(
            this.store,
            'Đổi mật khẩu thành công',
            response.message,
            'success'
          );
          this.isLoading = false;
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
        },
      });
    }
  }
}
