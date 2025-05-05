import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-non-layout',
  imports: [RouterOutlet, RouterModule],
  templateUrl: './non-layout.component.html',
  styleUrl: './non-layout.component.scss',
})
export class NonLayoutComponent {}
