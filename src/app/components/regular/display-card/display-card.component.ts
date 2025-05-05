import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Field {
  label: string;
  value: string;
}

@Component({
  selector: 'app-display-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './display-card.component.html',
  styleUrls: ['./display-card.component.scss'],
})
export class DisplayCardComponent {
  @Input() imageUrl: string = '';
  @Input() title: string = '';
  @Input() animeId: string = '';
  @Input() fields: Field[] = [];
  @Input() maxWidth: string = '400px';
  @Input() variant: 'primary' | 'secondary' | 'third' | 'primary' = 'primary';

  @Output() cardClick = new EventEmitter<void>();

  constructor(private router: Router) {}

  showFallback: boolean = false;

  handleImageError(event: Event): void {
    this.showFallback = true;
  }

  handleClick(animeId: string): void {
    this.cardClick.emit();
    this.router.navigate(['/film-details', animeId]);
  }

  ngOnInit(): void {
    if (this.fields.length > 3) {
      console.warn(
        'Maximum 3 fields are allowed. Extra fields will be ignored.'
      );
      this.fields = this.fields.slice(0, 3);
    }
  }
}
