import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dynamic-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class DynamicInputComponent implements OnChanges {
  @Input() type: 'text' | 'password' | 'number' = 'text';
  @Input() label = '';
  @Input() placeholder = '';
  @Input() required = false;
  @Input() minLength: number | null = null;
  @Input() maxLength: number | null = null;
  @Input() min: number | null = null;
  @Input() max: number | null = null;
  @Input() value: string | number = '';
  @Input() icon: string | null = null;
  @Input() isSvg: boolean = false;
  @Input() variant: 'primary' | 'secondary' | 'other' = 'primary';

  @Input() shouldValidate = false; // Khi true, component cha sẽ trigger validation
  @Output() valueChange = new EventEmitter<string | number>();
  @Output() focus = new EventEmitter<void>();
  @Output() blur = new EventEmitter<void>();
  @Output() validationResult = new EventEmitter<boolean>(); // Emit kết quả validation
  @Output() enterPress = new EventEmitter<void>(); // Sự kiện khi nhấn Enter

  inputId = `dynamic-input-${Math.random().toString(36).substr(2, 9)}`;
  errorId = `error-${this.inputId}`;
  hasError = false;
  errorMessage = '';

  ngOnChanges(changes: SimpleChanges) {
    // Nếu cha thay đổi shouldValidate thành true => kích hoạt validation
    if (changes['shouldValidate'] && this.shouldValidate) {
      this.triggerValidation();
    }
  }

  onInputChange(value: string | number) {
    this.value = value;
    this.valueChange.emit(value);
  }

  onFocusHandler() {
    this.focus.emit();
  }

  onBlurHandler() {
    this.blur.emit();
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.enterPress.emit(); // Gửi sự kiện lên component cha
    }
  }

  triggerValidation(): boolean {
    this.hasError = false;
    this.errorMessage = '';

    if (this.required && !this.value) {
      this.hasError = true;
      this.errorMessage = 'Không được để trống giá trị này';
    } else if (this.type === 'text' && typeof this.value === 'string') {
      if (this.minLength !== null && this.value.length < this.minLength) {
        this.hasError = true;
        this.errorMessage = `Yêu cầu tối thiểu ${this.minLength} ký tự`;
      } else if (
        this.maxLength !== null &&
        this.value.length > this.maxLength
      ) {
        this.hasError = true;
        this.errorMessage = `Cho phép tối đa ${this.maxLength} ký tự`;
      }
    } else if (this.type === 'number' && typeof this.value === 'number') {
      if (this.min !== null && this.value < this.min) {
        this.hasError = true;
        this.errorMessage = `Giá trị yêu cầu lớn hơn hoặc bằng ${this.min}`;
      } else if (this.max !== null && this.value > this.max) {
        this.hasError = true;
        this.errorMessage = `Giá trị yêu cầu bé hơn hoặc bằng ${this.max}`;
      }
    }
    setTimeout(() => {
      this.hasError = false;
    }, 3000);

    // Emit kết quả validation lên cha
    this.validationResult.emit(!this.hasError);
    return !this.hasError;
  }
}

/*--
<input
  label = "Tên input"
  [type]="type"
  [placeholder]="placeholder"
  [required]="required"
  [minLength]="minLength"
  [maxLength]="maxLength"
  [min]="min"
  [max]="max"
  [(ngModel)]="value"
  (input)="onInputChange(value)"
  (focus)="onFocusHandler()"
  (blur)="onBlurHandler()" 
  (keydown)="onKeyDown($event)" 
/>
--*/
