import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-warning-modal',
  templateUrl: './warning-modal.component.html',
  styleUrls: ['./warning-modal.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class WarningModalComponent implements OnInit, OnDestroy {
  @Input() message: string = '';
  @Input() type: 'success' | 'warning' | 'error' | 'info' = 'info';
  @Input() title: string = '';
  @Input() confirmText: string = 'Confirm';
  @Input() cancelText: string = 'Cancel';
  @Input() autoCloseTimeout?: number;
  @Input() isLoading: boolean = false; // New input property

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() closeEvent = new EventEmitter<void>();

  isVisible: boolean = false;
  private timeoutId?: number;

  ngOnInit() {
    this.isVisible = true;
    this.setupKeyboardListeners();
    this.setupAutoClose();
  }

  ngOnDestroy() {
    this.removeKeyboardListeners();
    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId);
    }
  }

  private setupKeyboardListeners() {
    document.addEventListener('keydown', this.handleKeyDown);
  }

  private removeKeyboardListeners() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      this.closeModal();
    }
  };

  private setupAutoClose() {
    if (this.autoCloseTimeout) {
      this.timeoutId = window.setTimeout(() => {
        this.closeModal();
      }, this.autoCloseTimeout);
    }
  }

  closeOnBackdrop(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  closeModal() {
    this.closeEvent.emit();
  }

  onConfirm() {
    if (!this.isLoading) {
      this.confirm.emit();
    }
  }

  onCancel() {
    this.cancel.emit();
  }
}
