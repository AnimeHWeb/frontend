import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideAnimations } from '@angular/platform-browser/animations';
import { authReducer } from './app/store/auth/auth.reducer';
import { formReducer } from './app/store/open-form-state/form.reducer';
import { notificationReducer } from './app/store/notification/notification.reducer';
import { uiReducer } from './app/store/rerender/ui.reducer';
import { tagFilmReducer } from './app/store/tag-film/tag-film.reducer';
import { errorInterceptor } from './app/services/config-service/error.interceptor';
import { ReactiveFormsModule } from '@angular/forms';
import { stringReducer } from './app/store/object-string/strings.reducer';

bootstrapApplication(AppComponent, {
  providers: [
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
}).catch((err) => console.error(err));

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
