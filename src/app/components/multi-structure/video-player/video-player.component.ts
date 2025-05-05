import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  Input,
  SimpleChanges,
  Output,
  EventEmitter,
  OnChanges,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import Hls from 'hls.js';
import { debounceTime, Observable, Subject } from 'rxjs';
import { WarningModalComponent } from '../../regular/popup-warning/warning-modal.component';
import { Store } from '@ngrx/store';
import { selectOpenedForms } from '../../../store/open-form-state/form.selectors';
import {
  closeForm,
  openForm,
} from '../../../store/open-form-state/form.actions';
import { ILocalData } from '../../../models/InterfaceData';
import { MoviesService } from '../../../services/api-service/movies.service';
import { selectIsAuthenticated } from '../../../store/auth/auth.selectors';

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.scss'],
  imports: [CommonModule, FormsModule, WarningModalComponent],
})
export class VideoPlayerComponent
  implements AfterViewInit, OnChanges, OnInit, OnDestroy
{
  @ViewChild('videoElement') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('customControls') customControls!: ElementRef;
  @ViewChild('qualitySelector')
  qualitySelectorRef!: ElementRef<HTMLSelectElement>;
  @Input() videoSrc: string = '';
  @Input() historyDuration: number = 0;
  @Input() historyId: string = '';
  @Input() episodeId: string = '';
  @Input() statusEpisode: string = '';

  @Output() currentTimeUpdated = new EventEmitter<number>();

  hls!: Hls;
  isPlaying = false;
  qualityLevels: {
    index: number;
    label: string;
    bandwidth?: number;
    url: string;
  }[] = [];
  isAuth$: Observable<boolean>;

  playbackSpeeds = [
    { value: 0.5, label: '0.5x' },
    { value: 1.0, label: '1x' },
    { value: 1.5, label: '1.5x' },
    { value: 2.0, label: '2x' },
  ];
  volume: number = 1; // Mặc định là 100%
  showVolumeSlider: boolean = false;
  hideTimeout: any = null;
  currentTime: string = '00:00';
  currentTimeSecond: number = 0;
  totalTime: string = '00:00';
  progress: number = 0;
  hideControlsTimeout: any = null;
  isOpenForm$: Observable<{ [key: string]: boolean }>;
  isloading = false;
  private hasCountedView: boolean = false;

  private currentTimeSubject = new Subject<number>(); // Subject để quản lý sự kiện

  constructor(private store: Store, private movieService: MoviesService) {
    this.isOpenForm$ = this.store.select(selectOpenedForms);
    this.isAuth$ = this.store.select(selectIsAuthenticated);
  }

  //TO IMPROVE: hiện debounce chưa hoạt động đúng cách (Fix sau) lớn hơn 250ms không cập nhật sự kiện.
  ngOnInit() {
    if (this.historyDuration > 0) {
      this.store.dispatch(openForm({ formType: 'return-video-duration' }));
    }
    // Đăng ký một sự kiện debounce, chỉ gửi sau mỗi 200ms khi không có sự thay đổi
    this.currentTimeSubject.pipe(debounceTime(250)).subscribe((currentTime) => {
      this.currentTimeUpdated.emit(currentTime);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['videoSrc'] && !changes['videoSrc'].firstChange) {
      const newUrl = changes['videoSrc'].currentValue;
      // Phải chắc view đã có videoRef
      if (this.videoRef) {
        this.reloadSource(newUrl);
      }
    }
  }

  ngAfterViewInit() {
    const video = this.videoRef.nativeElement;
    const videoContainer = video.closest('.video-container');
    const controls = document.querySelector('.custom-controls') as HTMLElement;
    const overlay = document.querySelector(
      '.overlay-player-episode'
    ) as HTMLElement;
    this.loadM3U8(this.videoSrc);
    this.isPlaying = false;
    overlay.classList.add('paused');

    if (Hls.isSupported()) {
      this.hls = new Hls();
      this.hls.loadSource(this.videoSrc);
      this.hls.attachMedia(video);

      this.hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        this.qualityLevels = [
          { index: -1, label: 'Tự động', url: this.videoSrc }, // "Tự động" sẽ luôn dùng videoSrc gốc
          ...data.levels.map((level, i) => ({
            index: i,
            label: `${level.height}p`,
            bandwidth: level.bitrate, // Hoặc level.bitrate nếu có
            url: this.videoSrc, // HLS sẽ tự động xử lý
          })),
        ];
      });
    } else {
      video.src = this.videoSrc;
    }
    video.addEventListener('timeupdate', () => this.updateProgress());
    video.addEventListener('loadedmetadata', () => this.updateTotalTime());

    // Không ẩn controls khi di chuột vào chính nó
    controls?.addEventListener('mouseenter', () =>
      clearTimeout(this.hideControlsTimeout)
    );
    this.loadM3U8(this.videoSrc);
    this.isPlaying = false;

    // Ẩn controls mặc định ban đầu
    video.controls = false;

    document.addEventListener('fullscreenchange', () => {
      if (document.fullscreenElement === videoContainer) {
        video.controls = true; // Bật controls khi fullscreen
      } else {
        video.controls = false; // Ẩn controls khi thoát fullscreen
      }
    });
    this.reloadSource(this.videoSrc);
  }

  ngOnDestroy(): void {
    if (this.hls) {
      this.hls.destroy(); // Hủy HLS
    }

    const video = this.videoRef?.nativeElement;
    if (video) {
      video.pause();
      video.src = '';
    }
  }

  private reloadSource(url: string): void {
    // 1) Dừng và hủy HLS cũ nếu có
    if (this.hls) {
      this.hls.destroy();
    }
    const video = this.videoRef.nativeElement;
    this.currentTime = '00:00';
    video.pause();
    video.src = '';

    // 2) Nếu HLS hỗ trợ thì dùng
    if (Hls.isSupported()) {
      this.hls = new Hls();
      this.hls.loadSource(url);
      this.hls.attachMedia(video);

      // Sự kiện PARSED => cập nhật qualityLevels
      this.hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        this.qualityLevels = [
          { index: -1, label: 'Tự động', url },
          ...data.levels.map((level, i) => ({
            index: i,
            label: `${level.height}p`,
            bandwidth: level.bitrate,
            url,
          })),
        ];
      });
    } else {
      // 3) Fallback: set trực tiếp src
      video.src = url;
    }

    // 4) Reset trạng thái
    this.isPlaying = false;
    this.progress = 0;
    // ...
  }

  confirmContinue() {
    // Đóng popup
    this.store.dispatch(closeForm({ formType: 'return-video-duration' }));

    // Đặt thời gian bắt đầu video
    const videoEl = this.videoRef.nativeElement;
    videoEl.currentTime = this.historyDuration;

    // Reset giá trị tránh hiển thị popup lại
    this.historyDuration = 0;
    this.togglePlay();
  }

  cancel() {
    this.store.dispatch(closeForm({ formType: 'return-video-duration' }));
    const token = localStorage.getItem('token');
    this.historyDuration = 0;

    const localDataString = localStorage.getItem('viewHistory');

    if (localDataString) {
      const localData = JSON.parse(localDataString) as ILocalData;

      // Loại bỏ các đối tượng có episodeId là chuỗi rỗng
      localData.localData = localData.localData.filter(
        (item) => item.episodeId.trim() !== ''
      );

      if (localData.localData.length > 0) {
        this.deleteLocalViewHistory(this.historyId);
        console.log('Hàm xoá local');
      }
    }

    // Sau đó subscribe để kiểm tra isAuth có thật sự là true không
    this.isAuth$.subscribe((isAuthenticated) => {
      console.log('Trạng thái isAuth$:', isAuthenticated); // Log ra true/false
      if (isAuthenticated && token) {
        // Nếu thật sự đăng nhập
        console.log('Hàm xoá data');
        this.deleteViewHistory(this.historyId);
      }
    });
  }

  deleteViewHistory(episodeId: string) {
    this.movieService.deleteViewHistory(episodeId).subscribe({
      next: (res) => {
        console.log(res);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  //Xoá 1 item trong localStorage
  deleteLocalViewHistory(episodeId: string) {
    // Đọc dữ liệu từ localStorage
    const localDataString = localStorage.getItem('viewHistory');
    let localData: ILocalData | null = null;

    if (localDataString) {
      localData = JSON.parse(localDataString) as ILocalData;

      // Kiểm tra xem localData có tồn tại và có dữ liệu không
      if (localData?.localData) {
        // Lọc bỏ phần tử có episodeId khớp với đối tượng cần xoá
        const updatedLocalData = localData.localData.filter(
          (item) => item.episodeId !== episodeId
        );

        // Cập nhật lại mảng localData với dữ liệu đã xoá phần tử
        localData.localData = updatedLocalData;

        // Ghi đè lại dữ liệu vào localStorage
        localStorage.setItem('viewHistory', JSON.stringify(localData));
      }
    }
  }

  public stopVideo(): void {
    if (this.hls) {
      this.hls.stopLoad();
      this.hls.destroy();
    }
    const video = this.videoRef?.nativeElement;
    if (video) {
      video.pause();
      video.src = '';
    }
    this.isPlaying = false;
  }

  async loadM3U8(url: string) {
    try {
      const response = await fetch(url);
      const data = await response.text();
      this.parseM3U8(data);
    } catch (error) {
      console.error('Lỗi tải file M3U8:', error);
    }
  }

  parseM3U8(data: string) {
    const lines = data.split('\n');
    this.qualityLevels = [{ index: -1, label: 'Tự động', url: this.videoSrc }];

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('#EXT-X-STREAM-INF')) {
        const resolutionMatch = lines[i].match(/RESOLUTION=(\d+x\d+)/);
        const bandwidthMatch = lines[i].match(/BANDWIDTH=(\d+)/);
        const url = lines[i + 1]?.trim();

        if (resolutionMatch && url) {
          this.qualityLevels.push({
            index: this.qualityLevels.length - 1, // Giữ đúng index
            label: resolutionMatch[1],
            bandwidth: bandwidthMatch
              ? parseInt(bandwidthMatch[1], 10)
              : undefined,
            url: new URL(url, this.videoSrc).href, // Đảm bảo URL tuyệt đối
          });
        }
      }
    }
    console.log('Danh sách chất lượng video:', this.qualityLevels);
  }

  changeQuality(event: Event) {
    const selectedIndex = parseInt(
      (event.target as HTMLSelectElement).value,
      10
    );

    if (
      this.hls &&
      selectedIndex >= 0 &&
      selectedIndex < this.qualityLevels.length
    ) {
      this.hls.currentLevel = selectedIndex; // Đổi chất lượng trực tiếp
    } else {
      this.hls.currentLevel = -1; // Chế độ tự động
    }
  }

  onMouseMove(event: MouseEvent) {
    // Mỗi lần di chuột, ta hiện controls
    this.showControls();
    // Rồi sau 3 giây (hideControls() có setTimeout 3000ms) ta ẩn
    this.hideControls();
  }

  showControls() {
    clearTimeout(this.hideControlsTimeout);

    const controls = document.querySelector('.custom-controls') as HTMLElement;
    if (controls) {
      controls.style.opacity = '1';
      controls.style.transform = 'translateY(0px)';
    }
  }

  hideControls() {
    this.hideControlsTimeout = setTimeout(() => {
      const controls = document.querySelector(
        '.custom-controls'
      ) as HTMLElement;
      if (controls && !controls.matches(':hover')) {
        controls.style.opacity = '0';
        controls.style.transform = 'translateY(0px)';
      }
    }, 3000);
  }

  updateProgress() {
    const video = this.videoRef.nativeElement;
    if (video.duration) {
      this.progress = (video.currentTime / video.duration) * 100;
      this.currentTime = this.formatTime(video.currentTime);
      this.currentTimeSecond = Math.floor(video.currentTime);

      // Phát giá trị qua subject
      this.currentTimeSubject.next(this.currentTimeSecond); // Gửi giá trị cho subject

      // this.currentTimeUpdated.emit(this.currentTimeSecond); // Phát sự kiện trực tiếp
    }
  }

  updateTotalTime() {
    const video = this.videoRef.nativeElement;
    this.totalTime = this.formatTime(video.duration);
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  togglePlay() {
    const video = this.videoRef.nativeElement;
    const overlay = document.querySelector(
      '.overlay-player-episode'
    ) as HTMLElement;

    if (this.isPlaying) {
      video.pause();
      this.isPlaying = false;
      overlay.classList.add('paused');
    } else {
      video
        .play()
        .then(() => {
          this.isPlaying = true;
          overlay.classList.remove('paused');
          //đếm countView: bấm play lần đầu tiên, khi trạng thái tập là approved
          if (!this.hasCountedView && this.statusEpisode === 'approved') {
            this.movieService.countView(this.episodeId).subscribe({
              next: (res) => console.log('View đã được đếm:', res),
              error: (err) => console.error('Lỗi khi đếm view:', err),
            });
            this.hasCountedView = true;
          }
        })
        .catch((error) => {
          console.warn('Play request interrupted:', error);
        });
    }
  }

  changePlaybackSpeed(event: Event) {
    const video = this.videoRef.nativeElement;
    const selectedSpeed = parseFloat((event.target as HTMLSelectElement).value);
    video.playbackRate = selectedSpeed;
  }

  seekVideo(event: Event) {
    const video = this.videoRef.nativeElement;
    const progressBar = event.target as HTMLInputElement;

    if (
      !isNaN(video.duration) &&
      isFinite(video.duration) &&
      video.duration > 0
    ) {
      video.currentTime =
        (video.duration * parseFloat(progressBar.value)) / 100;
    } else {
      console.warn('Invalid video duration:', video.duration);
    }
  }

  seekForward() {
    const video = this.videoRef.nativeElement;
    if (!isNaN(video.duration) && isFinite(video.duration)) {
      video.currentTime = Math.min(video.currentTime + 90, video.duration);
    } else {
      console.warn(
        'Không thể tua nhanh vì video chưa tải xong hoặc không hợp lệ.'
      );
    }
  }

  seekBackward() {
    const video = this.videoRef.nativeElement;
    if (!isNaN(video.duration) && isFinite(video.duration)) {
      video.currentTime = Math.max(video.currentTime - 90, 0);
    } else {
      console.warn(
        'Không thể tua lùi vì video chưa tải xong hoặc không hợp lệ.'
      );
    }
  }

  toggleFullscreen() {
    const video = this.videoRef.nativeElement;

    if (!document.fullscreenElement) {
      if (video.requestFullscreen) {
        video.requestFullscreen();
      } else if ((video as any).webkitRequestFullscreen) {
        (video as any).webkitRequestFullscreen();
      } else if ((video as any).msRequestFullscreen) {
        (video as any).msRequestFullscreen();
      }

      video.classList.add('fullscreen-mode'); // Áp dụng CSS khi fullscreen
      video.controls = true; // Hiển thị controls mặc định của trình duyệt
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }

      video.classList.remove('fullscreen-mode'); // Bỏ fullscreen mode
      video.controls = false; // Ẩn controls mặc định nếu cần
    }
  }

  resizeVideo() {
    const video = this.videoRef.nativeElement;
    video.style.width = '100vw';
    video.style.height = '100vh';
    video.style.objectFit = 'contain';
  }

  resetVideoSize() {
    const video = this.videoRef.nativeElement;
    video.style.width = '';
    video.style.height = '';
    video.style.objectFit = '';
  }

  increaseVolume() {
    const video = this.videoRef.nativeElement;
    video.volume = Math.min(1, parseFloat((video.volume + 0.1).toFixed(1)));
    this.volume = video.volume;
  }

  decreaseVolume() {
    const video = this.videoRef.nativeElement;
    video.volume = Math.max(0, parseFloat((video.volume - 0.1).toFixed(1)));
    this.volume = video.volume;
  }

  setVolume() {
    const video = this.videoRef.nativeElement;
    video.volume = this.volume;
  }

  hideVolumeSliderWithDelay() {
    this.hideTimeout = setTimeout(() => {
      this.showVolumeSlider = false;
    }, 300);
  }

  cancelHideVolumeSlider() {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
  }
}
