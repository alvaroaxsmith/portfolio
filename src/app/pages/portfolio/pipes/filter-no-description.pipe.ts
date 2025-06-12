import { Pipe, PipeTransform } from '@angular/core';
import { Project } from '../Project';

@Pipe({
  name: 'filterNoDescription'
})
export class FilterNoDescriptionPipe implements PipeTransform {

  transform(projects: Project[]): Project[] {
    if (!projects) {
      return [];
    }
    return projects.filter(project => {
      const hasValidDescription = project.description !== 'No description';
      const hasValidTech = project.tech && project.tech !== 'N/A' && project.tech.trim() !== '';
      return hasValidDescription && hasValidTech;
    });
  }

}