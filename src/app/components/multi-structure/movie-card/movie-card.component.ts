import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { IThumbnailCard } from '../../../models/InterfaceData'; // Import kiểu dữ liệu Video
import { CommonModule } from '@angular/common';
import { FormatViewPipe } from '../../../pipes/format-view.pipe';
import { API_CONFIG } from '../../../services/config-service/config';
import { sizeImg } from '../../../models/DataRoot';
import { buildImageUrl } from '../../../utils/stringProcess';

@Component({
  selector: 'app-movie-card',
  templateUrl: './movie-card.component.html',
  styleUrls: ['./movie-card.component.scss'],
  imports: [CommonModule, FormatViewPipe],
})
export class MovieCardComponent {
  @Input() video!: IThumbnailCard;
  @Input() isList: boolean = false;
  thumbnailUrlDefault: string = 'assets/thumbnail-default.jpg';
  thumbnail: string = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    if (this.video.thumbnail) {
      this.thumbnail = buildImageUrl(this.video.thumbnail, 'small');
    }
  }

  goToPlayPage() {
    this.router.navigate(['/play', this.video.id]);
  }

  goToFilmDetails() {
    this.router.navigate(['/film-details', this.video.id]);
  }

  truncateTitle(title: string): string {
    return title.length > 20 ? title.substring(0, 20) + '...' : title;
  }
}
