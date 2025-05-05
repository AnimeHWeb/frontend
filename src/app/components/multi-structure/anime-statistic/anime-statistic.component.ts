import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { IAnimeStatisticResponse } from '../../../models/InterfaceResponse';

import * as XLSX from 'xlsx'; // Thư viện SheetJS (miễn phí)
import { Workbook } from 'exceljs'; // Thư viện exceljs (để chèn ảnh)
import { saveAs } from 'file-saver'; // Lưu file client
import html2canvas from 'html2canvas'; // Chụp DOM => canvas

@Component({
  selector: 'app-anime-statistic',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  templateUrl: './anime-statistic.component.html',
  styleUrls: ['./anime-statistic.component.scss'],
})
export class AnimeStatisticComponent implements OnChanges {
  @Input() data!: IAnimeStatisticResponse;

  // Dữ liệu chart cho ngx-charts
  single: { name: string; value: number }[] = [];
  view: [number, number] = [700, 400];

  // Màu sắc
  colorScheme: Color = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA', '#ffffff', '#5d5757'],
    group: ScaleType.Ordinal,
    selectable: true,
    name: 'Custom Scheme',
  };
  gradient = true;

  // Tham chiếu phần tử bao quanh chart để chụp ảnh
  @ViewChild('chartContainer') chartContainer!: ElementRef<HTMLElement>;

  ngOnChanges(changes: SimpleChanges): void {
    // Mỗi khi data thay đổi, cập nhật `single` cho biểu đồ
    if (this.data) {
      this.single = [
        { name: 'Tổng Anime', value: this.data.totalAnime },
        { name: 'TV Series', value: this.data.tvSeries },
        { name: 'Movie', value: this.data.movie },
        { name: 'Hoàn thành (Movie)', value: this.data.finishedMovie },
        { name: 'Chưa hoàn thành (Movie)', value: this.data.unfinishedMovie },
        { name: 'Chưa duyệt (Movie)', value: this.data.unapprovedMovie },
      ];
    }
  }

  // ========== 1) Xuất Excel đơn giản (không ảnh) dùng xlsx ==========
  exportExcel(): void {
    if (!this.single) return;

    // Chuyển dữ liệu `single` thành mảng Object
    const dataToExport = this.single.map((item) => ({
      Name: item.name,
      Value: item.value,
    }));

    // Dùng SheetJS để chuyển JSON -> Worksheet
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    // Tạo Workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'AnimeStatistic');

    // Ghi file Excel
    XLSX.writeFile(workbook, 'anime-statistic.xlsx');
  }

  // ========== 2) Xuất CSV (dùng SheetJS) ==========
  exportCSV(): void {
    if (!this.single) return;

    const dataToExport = this.single.map((item) => ({
      Name: item.name,
      Value: item.value,
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'AnimeStatistic');

    // Ghi file dạng .csv
    XLSX.writeFile(workbook, 'anime-statistic.csv', { bookType: 'csv' });
  }

  // ========== 3) Xuất Excel (exceljs) + chèn ảnh biểu đồ ==========
  async exportExcelWithChart() {
    if (!this.single) return;

    // 1) Chụp ảnh chart (SVG -> PNG) qua html2canvas
    const chartElement = this.chartContainer?.nativeElement;
    if (!chartElement) {
      console.error('Chart container not found!');
      return;
    }

    const canvas = await html2canvas(chartElement);
    const chartBase64 = canvas.toDataURL('image/png'); // base64 PNG

    // 2) Tạo workbook & worksheet (exceljs)
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('AnimeStatistic');

    // 3) Ghi dữ liệu (thống kê) vào Excel
    worksheet.addRow(['Name', 'Value']);
    for (const item of this.single) {
      worksheet.addRow([item.name, item.value]);
    }

    // 4) Thêm ảnh vào workbook
    const imageId = workbook.addImage({
      base64: chartBase64,
      extension: 'png',
    });

    // Chèn ảnh vào vị trí B7 (top-left)
    worksheet.addImage(imageId, {
      tl: { col: 1, row: 7 }, // B7
      ext: { width: 600, height: 300 }, // kích thước ảnh
    });

    // 5) Ghi file Excel -> Buffer -> Blob -> Lưu
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    saveAs(blob, 'anime-statistic-with-chart.xlsx');
  }

  // ========== Các event của chart (nếu cần) ==========
  onSelect(data: any): void {
    console.log('Item clicked', data);
  }
  onActivate(data: any): void {
    console.log('Activate', data);
  }
  onDeactivate(data: any): void {
    console.log('Deactivate', data);
  }
}
