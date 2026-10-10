import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-not-found',
    templateUrl: './not-found.component.html',
    styleUrl: './not-found.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink, MatButton, TranslatePipe]
})
export class NotFoundComponent {}
