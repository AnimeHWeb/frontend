import { Component } from '@angular/core';
import { UserListComponent } from '../../components/multi-structure/user-list/user-list.component';

@Component({
  selector: 'app-list-account-management',
  imports: [UserListComponent],
  templateUrl: './list-account-management.component.html',
  styleUrl: './list-account-management.component.scss',
})
export class ListAccountManagementComponent {}
