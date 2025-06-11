import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

interface GitHubUserResponse {
  avatar_url: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  constructor(private http: HttpClient) { }

  async getImage(index: number): Promise<string> {
    try {
      const username = 'alvaroaxsmith';
      const response = await lastValueFrom(this.http.get<GitHubUserResponse>(`https://api.github.com/users/${username}`));
      const url = response.avatar_url;

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
