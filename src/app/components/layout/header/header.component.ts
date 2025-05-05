import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  ElementRef,
  HostListener,
  SimpleChanges,
} from '@angular/core';
import { DropdownButtonComponent } from '../../regular/dropdown/dropdown.component';
import { DynamicInputComponent } from '../../regular/input/input.component';
import { LucideAngularModule, Bell } from 'lucide-angular';
import { MoviesService } from '../../../services/api-service/movies.service';
import { INotice, IOptionItem, ITagFilm } from '../../../models/InterfaceData';
import { ListCardComponent } from '../list-search/list-search.component';
import { NotificationListComponent } from '../list-notifications/list-notifications.component';
import { ListOptionAvatarComponent } from '../list-option-avatar/list-option-avatar.component';
import { dataAvatarOptions } from '../../../models/DataRoot';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { selectBooleanState } from '../../../store/rerender/ui.selectors';
import { Store } from '@ngrx/store';
import { selectIsAuthenticated } from '../../../store/auth/auth.selectors';
import { ITagFilmResponse } from '../../../models/InterfaceResponse';
import { addTagList } from '../../../store/tag-film/tag-film.actions';
import { buildImageUrl } from '../../../utils/stringProcess';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    DropdownButtonComponent,
    DynamicInputComponent,
    LucideAngularModule,
    ListCardComponent,
    NotificationListComponent,
    ListOptionAvatarComponent,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  optionItemsAvatar: IOptionItem[] = [];
  isReloadOptionMenu$: Observable<boolean>;
  isAuthenticated$: Observable<boolean> | undefined;
  userAvatarUrl: string = '';
  avatarDefault = 'assets/avatar-default.png';
  getAvatarUrl: string;
  token: string;
  activeDropdown: string | null = null;

  private role: 'ROLE_GUEST' | 'ROLE_USER' | 'ROLE_ADMIN' | 'ROLE_MODERATOR' =
    'ROLE_GUEST';

  icons = { Bell };
  tags: ITagFilm[] = [];
  allTags: ITagFilmResponse[] = [];
  genres: { value: string; label: string }[] = [];
  years: { value: string; label: string }[] = [];
  schedules: { value: string; label: string }[] = [];

  notices: INotice[] = [];
  activeDropdownId: string | null = null;
  selectedOptions: { [key: string]: any } = {};
  searchText: string | number = '';
  isListSearchVisible = false;
  isAvatarOptions = false;
  isAuth: boolean = false;

  constructor(
    private moviesService: MoviesService,
    private eRef: ElementRef,
    private router: Router,
    private cookieService: CookieService,
    private store: Store
  ) {
    this.isReloadOptionMenu$ = this.store.select(
      selectBooleanState('isReloadOptionMenu')
    );
    this.token = localStorage.getItem('token') ?? '';
    this.getAvatarUrl = this.cookieService.get('avatarUrl');
  }

  ngOnInit(): void {
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
    this.isAuthenticated$.subscribe((isAuthenticated) => {
      this.isAuth = isAuthenticated;
    });

    this.setUserRole();
    this.filterAvatarOptions();
    this.loadTagsFilm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['getAvatarUrl'] || changes['userAvatarUrl']) {
      this.getAvatarUrl = changes['getAvatarUrl'].currentValue;
      this.userAvatarUrl = changes['userAvatarUrl'].currentValue;
    }
  }

  // TO UPDATE: Thêm type vào đây
  loadTagsFilm() {
    this.moviesService.getAllTypes().subscribe({
      next: (re) => {
        const result = re.result;

        this.genres = result
          .filter((tag) => tag.type === 'Thể loại')
          .map((tag) => ({ value: tag.id, label: tag.name }));

        this.years = result
          .filter((tag) => tag.type === 'Năm phát hành')
          .map((tag) => ({ value: tag.id, label: tag.name }));

        this.schedules = result
          .filter((tag) => tag.type === 'Lịch chiếu phim')
          .map((tag) => ({ value: tag.id, label: tag.name }));

        this.store.dispatch(addTagList({ tags: result }));
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  private setUserRole(): void {
    const storedRole = this.cookieService.get('role') as
      | 'ROLE_GUEST'
      | 'ROLE_USER'
      | 'ROLE_MODERATOR'
      | 'ROLE_ADMIN';
    if (storedRole && this.isAuthenticated$) {
      this.role = storedRole;
    }
  }

  private filterAvatarOptions(): void {
    this.optionItemsAvatar = dataAvatarOptions.filter(
      (option) => option.role[this.role] === true
    );
  }

  buildImgAvatarUrl(url: string, size: 'small' | 'tiny' | 'original'): string {
    if (!url || url.trim() === '' || url === 'null') {
      return this.avatarDefault;
    }
    return buildImageUrl(url, size);
  }

  toggleDropdown(id: string): void {
    // Nếu bạn muốn chỉ mở 1 dropdown tại một thời điểm
    this.activeDropdown = this.activeDropdown === id ? null : id;
  }

  handleSelect(dropdownKey: string, selected: any): void {
    // Reset toàn bộ các lựa chọn trước đó
    this.selectedOptions = {};

    // Lưu lại option vừa chọn
    this.selectedOptions[dropdownKey] = selected;

    this.router.navigate(['/quick-search', dropdownKey, selected.label]);

    console.log(this.selectedOptions);
  }

  handleInputChange(value: string | number): void {
    this.searchText = value;
    this.isListSearchVisible = !!value;
  }

  toggleOpenAvatarList(event: Event): void {
    event.stopPropagation();
    this.isAvatarOptions = !this.isAvatarOptions;
  }

  get unseenNoticesCount(): number {
    return this.notices.filter((notice) => !notice.isRead).length;
  }

  onOptionClick(option: IOptionItem): void {
    this.isAvatarOptions = false;
  }

  onClickLogo(): void {
    this.router.navigate(['/']);
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event): void {
    const avatarControl =
      this.eRef.nativeElement.querySelector('.avatar-control');
    if (avatarControl && !avatarControl.contains(event.target)) {
      this.isAvatarOptions = false;
    }
  }
}
