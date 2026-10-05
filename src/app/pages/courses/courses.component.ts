import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CourseService } from '../courses/services/courses.service';
import { Course } from '../courses/interfaces/courses.interface';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { DialogComponent } from './dialog/dialog.component';
import { SnackBarComponent } from './snack-bar/snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CoursesStateService } from './services/courses-state.service';

// Carregamento infinito da lista de cards no celular: lote de cards e tempo
// de exibição dos skeletons a cada lote (os dados já estão em memória)
const MOBILE_BATCH_SIZE = 5;
const MOBILE_LOAD_DELAY_MS = 600;
@Component({
    selector: 'app-courses',
    templateUrl: './courses.component.html',
    styleUrls: ['./courses.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CoursesComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

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

  get visibleCourses(): Course[] {
    return this.dataSource.filter ? this.dataSource.filteredData : this.dataSource.data;
  }

  // Celular: só os primeiros cards; o resto chega em lotes ao rolar
  mobileLoadingMore = false;
  private mobileLoadTimer?: ReturnType<typeof setTimeout>;
  private mobileObserver?: IntersectionObserver;
  private mobileTriggerEl?: HTMLElement;

  get mobileCourses(): Course[] {
    return this.visibleCourses.slice(0, this.state.mobileCount);
  }

  get hasMoreMobileCourses(): boolean {
    return this.state.mobileCount < this.visibleCourses.length;
  }

  /** Skeletons do próximo lote: exatamente os cards que vão chegar. */
  get mobileSkeletonCount(): number {
    return Math.min(MOBILE_BATCH_SIZE, this.visibleCourses.length - this.state.mobileCount);
  }

  // O gatilho só existe enquanto há mais cursos; o setter acompanha ele
  // entrando e saindo do DOM. Na tela grande a lista fica com display: none,
  // então o gatilho nunca intersecta e nada carrega
  @ViewChild('mobileLoadTrigger') set mobileLoadTrigger(ref: ElementRef<HTMLElement> | undefined) {
    if (this.mobileTriggerEl) {
      this.mobileObserver?.unobserve(this.mobileTriggerEl);
    }
    this.mobileTriggerEl = ref?.nativeElement;
    if (this.mobileTriggerEl) {
      this.mobileObserver ??= new IntersectionObserver((entries) => {
        if (entries.some(entry => entry.isIntersecting)) {
          this.loadMoreMobileCourses();
        }
      });
      this.mobileObserver.observe(this.mobileTriggerEl);
    }
  }

  // static: true para estarem disponíveis no ngOnInit: com os cursos em cache a
  // tabela é preenchida já na primeira renderização, sem piscar o skeleton
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;

  constructor(
    private courseService: CourseService,
    private bottomSheet: MatBottomSheet,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    readonly state: CoursesStateService
  ) { }

  openDialog = (rowData: Course): void => {
    this.bottomSheet.open(DialogComponent, {
      data: rowData,
      panelClass: 'certificate-sheet',
      ariaLabel: rowData.name
    });
  }

  ngOnInit() {
    // Restaura ordenação e página salvos da última visita. O filtro e a ligação
    // com o dataSource só acontecem com os dados carregados (ver loadData)
    this.sort.active = this.state.sortActive;
    this.sort.direction = this.state.sortDirection;
    this.paginator.pageSize = this.state.pageSize;
    this.paginator.pageIndex = this.state.pageIndex;

    this.sort.sortChange.pipe(takeUntil(this.destroy$)).subscribe(({ active, direction }) => {
      this.state.sortActive = active;
      this.state.sortDirection = direction;
    });
    this.paginator.page.pipe(takeUntil(this.destroy$)).subscribe(({ pageIndex, pageSize }) => {
      this.state.pageIndex = pageIndex;
      this.state.pageSize = pageSize;
    });

    this.loadData();
  }

  ngAfterViewInit() {
    this.showSnackbar();
  }

  ngOnDestroy() {
    clearTimeout(this.mobileLoadTimer);
    this.mobileObserver?.disconnect();
    this.destroy$.next();
    this.destroy$.complete();
  }

  showSnackbar() {
    if (this.state.hintShown) {
      return;
    }
    this.state.hintShown = true;
    // O fechamento é controlado pelo relógio do próprio componente (5s)
    this.snackBar.openFromComponent(SnackBarComponent, {
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: 'course-hint',
    });
  }

  /** Mostra os skeletons no fim da lista e, em seguida, o próximo lote. */
  loadMoreMobileCourses(): void {
    if (this.mobileLoadingMore || !this.hasMoreMobileCourses) {
      return;
    }
    this.mobileLoadingMore = true;
    this.cdr.detectChanges();

    this.mobileLoadTimer = setTimeout(() => {
      this.state.mobileCount += MOBILE_BATCH_SIZE;
      this.mobileLoadingMore = false;
      this.cdr.detectChanges();
      // Se o gatilho continuar visível (lote não preencheu a tela), observar
      // de novo dispara a próxima leva sem depender de rolagem
      const trigger = this.mobileTriggerEl;
      if (trigger && this.mobileObserver) {
        this.mobileObserver.unobserve(trigger);
        this.mobileObserver.observe(trigger);
      }
    }, MOBILE_LOAD_DELAY_MS);
  }

  loadData() {
    this.isLoading = true;
    this.courseService.getCourses().pipe(takeUntil(this.destroy$)).subscribe(courses => {
      // A ordem importa: o MatTableDataSource ajusta o paginator (num microtask)
      // ao tamanho dos dados filtrados. Ligado com a lista ainda vazia, ele
      // recalcularia a página para 0 itens e perderia a página restaurada
      this.dataSource.data = courses;
      this.dataSource.filter = this.state.filter.trim().toLowerCase();
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.isLoading = false;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.state.filter = filterValue;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    // Novo filtro: a lista do celular recomeça do primeiro lote
    clearTimeout(this.mobileLoadTimer);
    this.mobileLoadingMore = false;
    this.state.mobileCount = MOBILE_BATCH_SIZE;
    // firstPage() emite o evento page, que já atualiza o estado salvo
    this.dataSource.paginator?.firstPage();
  }

}