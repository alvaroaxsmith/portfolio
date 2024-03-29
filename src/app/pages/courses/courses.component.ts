import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CourseService } from '../courses/services/courses.service';
import { Course } from '../courses/interfaces/courses.interface';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from './dialog/dialog.component';
import { SnackBarComponent } from './snack-bar/snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.scss']
})
export class CoursesComponent implements AfterViewInit {

  showNoDataMessage = false;


  expandedRow: any = null;

  isRowExpanded(row: Course): boolean {
    return this.expandedRow === row;
  }

  isExpanded = (row: any) => row === this.expandedRow;

  onRowClick(row: any) {
    this.expandedRow = this.expandedRow === row ? null : row;
  }

  snackbarShown: boolean = false; // Flag to track whether the snackbar has been shown

  toggleRow(row: Course): void {
    this.expandedRow = this.isRowExpanded(row) ? null : row;
  }

  displayedColumns: string[] = ['field', 'name', 'time', 'school', 'date'];
  dataSource: MatTableDataSource<Course> = new MatTableDataSource();
  isLoading: boolean = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort)
  sort: MatSort = new MatSort();

  constructor(private courseService: CourseService, private dialog: MatDialog, private snackBar: MatSnackBar) { }

  openDialog = (rowData: any): void => {
    this.dialog.open(DialogComponent, {
      data: rowData
    });
  }

  ngAfterViewInit() {
    this.loadData();
    this.showSnackbar();
  }

  showSnackbar() {
    const snackbarShownBefore = localStorage.getItem('snackbarShown');
    if (!snackbarShownBefore) {
      this.snackBar.openFromComponent(SnackBarComponent, {
        duration: 25000,
      });
      localStorage.setItem('snackbarShown', 'true');
    }
  }
  loadData() {
    this.isLoading = true;
    this.courseService.getCourses().subscribe(courses => {
      this.dataSource.data = courses;
      // Assign paginator after data is loaded
      this.dataSource.paginator = this.paginator;

      // Integrate sorting
      this.sort.sortChange.subscribe(() => this.dataSource.sort = this.sort);

      this.isLoading = false;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.dataSource.paginator?.firstPage();
  }

}