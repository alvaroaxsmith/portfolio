// skill-chip.component.ts
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-skill-chip',
    templateUrl: './skill-chip.component.html',
    styleUrls: ['./skill-chip.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class SkillChipComponent {
  @Input() skill: string = '';
}
