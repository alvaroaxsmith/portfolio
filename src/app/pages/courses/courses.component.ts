import { Component, AfterViewInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CourseService } from '../courses/services/courses.service';
import { Course } from '../courses/interfaces/courses.interface';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from './dialog/dialog.component';

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


  toggleRow(row: Course): void {
    this.expandedRow = this.isRowExpanded(row) ? null : row;
  }

  displayedColumns: string[] = ['field', 'name', 'time', 'school', 'date'];
  dataSource: MatTableDataSource<Course> = new MatTableDataSource();
  isLoading: boolean = true;

  @ViewChild(MatPaginator) paginator: MatPaginator = new MatPaginator(new MatPaginatorIntl(), ChangeDetectorRef.prototype);
  @ViewChild(MatSort)
  sort: MatSort = new MatSort();

  constructor(private courseService: CourseService, private dialog: MatDialog) {}

  openDialog(rowData: any): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: rowData
    });
  }

  ngAfterViewInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.courseService.getCourses().subscribe(courses => {
      this.dataSource = new MatTableDataSource(courses);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.isLoading = false;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

}