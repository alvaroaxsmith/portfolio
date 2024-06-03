// skill-chip.component.ts
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skill-chip',
  templateUrl: './skill-chip.component.html',
  styleUrls: ['./skill-chip.component.scss']
})
export class SkillChipComponent {
  @Input() skill: string = '';
}
