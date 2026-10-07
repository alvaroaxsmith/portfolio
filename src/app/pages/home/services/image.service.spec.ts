import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ImageService } from './image.service';

describe('ImageService', () => {
  const profileUrl = 'https://api.github.com/users/alvaroaxsmith';
  let service: ImageService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ImageService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('resolves with the GitHub avatar of the profile', async () => {
    const image = service.getImage();
    http.expectOne(profileUrl).flush({ avatar_url: 'https://avatars.example/me.png' });

    await expectAsync(image).toBeResolvedTo('https://avatars.example/me.png');
  });

  it('rejects when the profile has no avatar', async () => {
    const image = service.getImage();
    http.expectOne(profileUrl).flush({ avatar_url: '' });

    await expectAsync(image).toBeRejectedWithError('Failed to load image');
  });

  it('rejects when GitHub answers with an error', async () => {
    const image = service.getImage();
    http.expectOne(profileUrl).flush({ message: 'rate limited' }, { status: 403, statusText: 'Forbidden' });

    await expectAsync(image).toBeRejectedWithError('Failed to load image');
  });

  it('keeps the original failure as the cause of the rejection', async () => {
    const image = service.getImage();
    http.expectOne(profileUrl).flush({ message: 'rate limited' }, { status: 403, statusText: 'Forbidden' });

    const error = await image.catch((e: Error) => e);
    expect((error as Error).cause).toEqual(jasmine.objectContaining({ status: 403 }));
  });
});
