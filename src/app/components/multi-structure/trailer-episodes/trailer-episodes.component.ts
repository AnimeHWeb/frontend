import { Component, Input, OnInit } from '@angular/core';
import { SafeUrlPipe } from '../../../pipes/safe-url.pipe';
import { CommonModule } from '@angular/common';
import { IEpisodeInAnimeResponse } from '../../../models/InterfaceResponse';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { openForm } from '../../../store/open-form-state/form.actions';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-trailer-episodes',
  templateUrl: './trailer-episodes.component.html',
  styleUrls: ['./trailer-episodes.component.scss'],
  imports: [CommonModule, SafeUrlPipe],
})
export class TrailerEpisodesComponent implements OnInit {
  @Input() videoTrailer!: string;
  @Input() releaseDate!: string;
  @Input() episodes!: IEpisodeInAnimeResponse[];
  @Input() approved!: string;
  @Input() submittedBy!: string;
  role: string;
  token: string = '';
  username: string = '';
  addable: boolean = false;
  private urlRegex = /^https?:\/\//i;
  constructor(
    private router: Router,
    private store: Store,
    private cookieService: CookieService
  ) {
    this.role = this.cookieService.get('role');
    this.token = localStorage.getItem('token') ?? '';
    this.username = this.cookieService.get('username');
    console.log(this.role);
  }

  isValidVideoUrl(url: string): boolean {
    // Kiểm tra trống hoặc regex, v.v.
    if (!url) return false;
    return this.urlRegex.test(url);
  }

  ngOnInit(): void {
    this.addable =
      this.approved === 'approved' &&
      (this.role === 'ROLE_ADMIN' || this.role === 'ROLE_MODERATOR') &&
      !!this.token &&
      this.username === this.submittedBy;
  }

  onClickEpisode(episodeId: string): void {
    this.router.navigate(['/play', episodeId]);
  }

  createEpisode() {
    this.store.dispatch(openForm({ formType: 'create-episode' }));
  }
}
