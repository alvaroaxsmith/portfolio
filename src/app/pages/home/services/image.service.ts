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
    try {
      const response = await lastValueFrom(this.http.get<ImageResponse>('https://json-server-vercel-beta-six.vercel.app/images'));
      const url = response.images[index]?.url;

      if (url) {
        return url;
      } else {
        throw new Error('Image URL not found');
      }
    } catch (error) {
      console.error('Error loading image:', error);
      throw new Error('Failed to load image');
    }
  }
}
