import { Component } from '@angular/core';
import { IAnimeStatisticResponse } from '../../models/InterfaceResponse';
import { StatisticService } from '../../services/api-service/statistic.service';
import { AnimeStatisticComponent } from '../../components/multi-structure/anime-statistic/anime-statistic.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true, // <-- Phải khai báo standalone: true
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'], // <-- Phải là styleUrls (có 's'), không phải styleUrl
  imports: [
    CommonModule, // <-- Nếu template này dùng *ngIf, *ngFor, v.v.
    AnimeStatisticComponent,
  ],
})
export class DashboardComponent {
  data: IAnimeStatisticResponse = {
    totalAnime: 0,
    tvSeries: 0,
    movie: 0,
    finishedMovie: 0,
    unfinishedMovie: 0,
    unapprovedMovie: 0,
  };

  constructor(private statisticService: StatisticService) {}

  ngOnInit(): void {
    this.statisticService.getStatisticAnimes().subscribe({
      next: (res) => {
        this.data = res.result; // Gán dữ liệu trả về
        console.log(this.data);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
