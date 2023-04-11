import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { createFFmpeg, fetchFile, FFmpeg } from '@ffmpeg/ffmpeg';
import { BehaviorSubject, map, tap } from 'rxjs';
import { ActionButton } from './table/table.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit {
  srcURlSubject = new BehaviorSubject('')
  srcURl$ = this.srcURlSubject.pipe(
    map(this.sanitize.bypassSecurityTrustResourceUrl),
    tap(() => this.change.detectChanges())
  )
  ffmpeg: FFmpeg;
  videos: any;

  constructor(
    private change: ChangeDetectorRef,
    private sanitize: DomSanitizer,
    private http: HttpClient
  ) {
    this.ffmpeg = createFFmpeg({ log: true });
  }

  actionButton: ActionButton[] = [{
    disable: false,
    displayValue: 'play',
    icon: ''
  }]

  ngOnInit(): void {
    this.http.get(
      'https://gist.githubusercontent.com/jsturgis/3b19447b304616f18657/raw/a8c1f60074542d28fa8da4fe58c3788610803a65/gistfile1.txt',
      {
        responseType: 'arraybuffer'
      }
    ).subscribe((x) => {
      const a = URL.createObjectURL(new Blob([x], { type: 'text/javascript' }))
      let node = document.createElement('script');
      node.src = a;
      node.type = 'text/javascript';
      node.async = true;
      node.defer = true;
      node.charset = 'utf-8';
      node.onload = (e) => console.log('onload ',e)
      node.onloadeddata = () => console.log('onloadeddata ')
      node.onloadedmetadata = () => console.log('onloadedmetadata ')
      document.getElementsByTagName('head')[0].appendChild(node);
      setTimeout(() => {
        this.videos = (window as any)?.mediaJSON?.categories[0]?.videos
        console.log(this.videos, (window as any).mediaJSON)
      }, 5000);
    })
  }

  async transcode(files: FileList | null | undefined) {
    if (!files) return
    const { name } = files[0];
    await this.ffmpeg.load();
    this.ffmpeg.FS('writeFile', name, await fetchFile(files[0]));
    await this.ffmpeg.run('-i', name, '-c:v', 'copy', '-c:a', 'copy', `${name}.mp4`);
    const data = this.ffmpeg.FS('readFile', `${name}.mp4`);
    const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
    this.srcURlSubject.next(url)
  }
}