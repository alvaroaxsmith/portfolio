import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';

interface GitHubUserResponse {
  avatar_url: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private http = inject(HttpClient);


  async getImage(): Promise<string> {
    try {
      const response = await lastValueFrom(
        this.http.get<GitHubUserResponse>(`${environment.githubApiUrl}/users/${environment.githubUser}`)
      );
      const url = response.avatar_url;

      if (url) {
        return url;
      } else {
        throw new Error('Image URL not found');
      }
    } catch (error) {
      throw new Error('Failed to load image', { cause: error });
    }
  }
}
