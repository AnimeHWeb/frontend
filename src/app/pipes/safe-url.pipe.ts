import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
  name: 'safeUrl',
})
export class SafeUrlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(url: string): SafeResourceUrl {
    if (!url) return '';

    // Chuyển đổi URL thành dạng nhúng nếu là YouTube
    const embedUrl = this.convertToEmbedUrl(url);

    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  private convertToEmbedUrl(url: string): string {
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/;
    const match = url.match(youtubeRegex);

    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }

    return url; // Trả về URL gốc nếu không phải YouTube
  }
}
