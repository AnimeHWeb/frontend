import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { NonLayoutComponent } from './layouts/non-layout/non-layout.component';
import { AuthGuard } from './app.router.auth';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent, // Sử dụng layout chính
    children: [
      { path: '', component: HomeComponent }, // Load trước HomeComponent
      {
        path: 'play/:id',
        loadComponent: () =>
          import('./pages/episode-view/episode-view.component').then(
            (m) => m.EpisodeViewComponent
          ),
      },
      {
        path: 'category/:categoryName',
        loadComponent: () =>
          import(
            './pages/recommend-list-film/recommend-list-film.component'
          ).then((m) => m.RecommendListFilmComponent),
      },
      {
        path: 'film-details/:id',
        loadComponent: () =>
          import('./pages/film-details/film-details.component').then(
            (m) => m.FilmDetailsComponent
          ),
      },
      {
        path: 'profile',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./pages/profile-account/profile-account.component').then(
            (m) => m.ProfileAccountComponent
          ),
      },
      {
        path: 'profile-account-management/:id',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import(
            './pages/profile-account-management/profile-account-management.component'
          ).then((m) => m.ProfileAccountManagementComponent),
      },
      {
        path: 'uploaded-film',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./pages/uploaded-film/uploaded-film.component').then(
            (m) => m.UploadedFilmComponent
          ),
      },
      {
        path: 'list-account',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import(
            './pages/list-account-management/list-account-management.component'
          ).then((m) => m.ListAccountManagementComponent),
      },
      {
        path: 'history-watch',
        loadComponent: () =>
          import('./pages/view-history/view-history.component').then(
            (m) => m.ViewHistoryComponent
          ),
      },
      {
        path: 'watchlist',
        loadComponent: () =>
          import('./pages/watchlist/watchlist.component').then(
            (m) => m.WatchlistComponent
          ),
      },
      {
        path: 'quick-search/:type/:name-tag',
        loadComponent: () =>
          import('./pages/quick-search-list/quick-search-list.component').then(
            (m) => m.QuickSearchListComponent
          ),
      },
      {
        path: 'filter-advanced',
        loadComponent: () =>
          import('./pages/filter-advanced/filter-advanced.component').then(
            (m) => m.FilterAdvancedComponent
          ),
      },
      {
        path: 'movie-approval',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./pages/movie-approval/movie-approval.component').then(
            (m) => m.MovieApprovalComponent
          ),
      },
      {
        path: 'upload-schedule',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./pages/upload-schedule/upload-schedule.component').then(
            (m) => m.UploadScheduleComponent
          ),
      },
      {
        path: 'service-and-payment',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import(
            './pages/service-and-payment/service-and-payment.component'
          ).then((m) => m.ServiceAndPaymentComponent),
      },
      {
        path: 'statistic-dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
    ],
  },

  {
    path: '',
    component: NonLayoutComponent, // Layout cho các trang không có header, sidebar, ...
    children: [
      {
        path: 'reset-password/:id',
        loadComponent: () =>
          import('./pages/reset-password/reset-password.component').then(
            (m) => m.ResetPasswordComponent
          ),
      },
      // Thêm các route auth khác nếu cần...
    ],
  },
  {
    path: 'not-found/:status-code',
    loadComponent: () =>
      import('./pages/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
  },
  { path: '**', redirectTo: 'not-found/404', pathMatch: 'full' },
];
