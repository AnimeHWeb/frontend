import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MoviesService } from '../../../services/api-service/movies.service';

import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ITagFilmResponse } from '../../../models/InterfaceResponse';
import { SERVER_RESPONSE } from '../../../models/ApiResponse';

@Component({
  selector: 'app-tag-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tag-list.component.html',
  styleUrls: ['./tag-list.component.scss'],
})
export class TagListComponent implements OnInit {
  tagGroups$: Observable<{ type: string; tags: ITagFilmResponse[] }[]> = of([]);

  constructor(private movieService: MoviesService) {}

  ngOnInit() {
    this.tagGroups$ = this.movieService.getAllTypes().pipe(
      map((response: SERVER_RESPONSE<ITagFilmResponse[]>) => {
        const groupedTags: { [key: string]: ITagFilmResponse[] } = {};

        response.result.forEach((tag) => {
          if (!groupedTags[tag.type]) {
            groupedTags[tag.type] = [];
          }
          groupedTags[tag.type].push(tag);
        });

        return Object.keys(groupedTags).map((type) => ({
          type,
          tags: groupedTags[type],
        }));
      })
    );
  }
}
