import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

interface ImageResponse {
  images: { url: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  constructor(private http: HttpClient) { }

  async getImage(index: number): Promise<string> {
    const response = await lastValueFrom(this.http.get<ImageResponse>('https://json-server-vercel-beta-six.vercel.app/images'));
    const url = response.images[index]?.url;
    if (url) {
      return url;
    }
    throw new Error('Image URL not found');
  }
}
