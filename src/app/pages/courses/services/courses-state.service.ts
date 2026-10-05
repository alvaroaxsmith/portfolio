import { Injectable } from '@angular/core';
import { SortDirection } from '@angular/material/sort';

/**
 * Estado da página de cursos que sobrevive à navegação entre rotas: o
 * componente é destruído ao sair da página, este serviço (root) não.
 */
@Injectable({
  providedIn: 'root'
})
export class CoursesStateService {
  filter = '';
  sortActive = '';
  sortDirection: SortDirection = '';
  pageIndex = 0;
  pageSize = 5;
  // Cards já carregados na lista do celular (carregamento infinito)
  mobileCount = 5;
  // Dica exibida uma vez por carregamento do app: fica só em memória, então
  // recarregar a página mostra de novo (sem localStorage)
  hintShown = false;
}
