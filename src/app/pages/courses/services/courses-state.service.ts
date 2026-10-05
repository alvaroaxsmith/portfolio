import { Injectable } from '@angular/core';
import { SortDirection } from '@angular/material/sort';

@Injectable({
  providedIn: 'root'
})
export class CoursesStateService {
  filter = '';
  sortActive = '';
  sortDirection: SortDirection = '';
  pageIndex = 0;
  pageSize = 5;
  mobileCount = 5;
  hintShown = false;
}
