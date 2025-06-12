import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { errorInterceptor } from './services/config-service/error.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideStore } from '@ngrx/store';
import { authReducer } from './store/auth/auth.reducer';
import { provideEffects } from '@ngrx/effects';
import { ReactiveFormsModule } from '@angular/forms';
import { formReducer } from './store/open-form-state/form.reducer';
import { notificationReducer } from './store/notification/notification.reducer';
import { uiReducer } from './store/rerender/ui.reducer';
import { tagFilmReducer } from './store/tag-film/tag-film.reducer';
import { stringReducer } from './store/object-string/strings.reducer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideRouter(routes),
    provideHttpClient(withInterceptors([errorInterceptor])),
    provideAnimations(),

    // Cấu hình Redux Store
    provideStore({
      auth: authReducer,
      form: formReducer,
      notification: notificationReducer,
      uiState: uiReducer,
      tagFilm: tagFilmReducer,
      stringList: stringReducer,
    }),

    provideEffects(),
    ReactiveFormsModule,
  ],
};

// provideRouter(routes),
// provideHttpClient(),
// provideStore(),
// provideEffects(),
// provideStore({ auth: authReducer }),
// provideState({ name: 'form', reducer: formReducer }),
// provideAnimations(), //Cung cấp Animations cho Angular
// provideStore({ notification: notificationReducer }),
// provideStore({ uiState: uiReducer }),
// provideState({ name: 'notification', reducer: notificationReducer }),
// provideStore({ tagFilm: tagFilmReducer }),
// provideHttpClient(withInterceptors([errorInterceptor])),
