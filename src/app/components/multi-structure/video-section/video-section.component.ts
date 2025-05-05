import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import {
  IListThumbnails,
  IMovieQuery,
  IQueries,
} from '../../../models/InterfaceData';
import { MovieCardComponent } from '../movie-card/movie-card.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-video-section',
  templateUrl: './video-section.component.html',
  styleUrls: ['./video-section.component.scss'],
  imports: [MovieCardComponent, CommonModule],
})
export class VideoSectionComponent implements OnChanges {
  @Input() category!: IListThumbnails; // Lược bỏ | undefined và dùng "!" để TypeScript không báo lỗi

  constructor(private router: Router) {}

  ngOnChanges(changes: SimpleChanges) {
    // Kiểm tra xem category đã thay đổi chưa
    if (changes['category'] && !this.category) {
      console.log('category is undefined or null');
    }
  }

  onClickShowMore(
    categoryName: string,
    dataQuery: IQueries,
    useApi: 'FAA' | 'FAE' | 'FAS' | 'FES'
  ) {
    this.router.navigate(['/category', categoryName], {
      state: { dataQuery, useApi },
    });
  }
}
