import { Component } from '@angular/core';
import { UserProfileComponent } from '../../components/multi-structure/user-profile/user-profile.component';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { openForm } from '../../store/open-form-state/form.actions';

@Component({
  selector: 'app-profile-account',
  templateUrl: `./profile-account.component.html`,
  styleUrls: ['./profile-account.component.scss'],
  imports: [CommonModule, UserProfileComponent],
})
export class ProfileAccountComponent {
  constructor(private store: Store) {}

  handleOpenEditProfile() {
    this.store.dispatch(openForm({ formType: 'modal-update-info-account' }));
  }
}
