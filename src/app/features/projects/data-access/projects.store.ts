import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProjectsApiService } from './projects-api.service';
import { Project, CreateProjectRequest, UpdateProjectRequest } from '../models/project.models';

export interface ProjectsState {
  projects: Project[];
  loading: boolean;
  error: string | null;
  saving: boolean;
  saveError: string | null;
}

const initialState: ProjectsState = {
  projects: [],
  loading: false,
  error: null,
  saving: false,
  saveError: null,
};

@Injectable({ providedIn: 'root' })
export class ProjectsStore {
  private readonly _state$ = new BehaviorSubject<ProjectsState>(initialState);
  readonly state$ = this._state$.asObservable();

  constructor(
    private readonly api: ProjectsApiService,
    private readonly snackBar: MatSnackBar,
  ) {}

  private patch(partial: Partial<ProjectsState>): void {
    this._state$.next({ ...this._state$.value, ...partial });
  }

  load(): void {
    this.patch({ loading: true, error: null });
    this.api
      .getAll()
      .pipe(
        tap((projects) => this.patch({ projects })),
        catchError((err) => {
          const msg = err?.error?.message ?? 'Failed to load projects.';
          this.patch({ error: msg });
          return EMPTY;
        }),
        finalize(() => this.patch({ loading: false })),
      )
      .subscribe();
  }

  create(data: CreateProjectRequest): Observable<Project> {
    this.patch({ saving: true, saveError: null });
    return new Observable<Project>((observer) => {
      this.api
        .create(data)
        .pipe(
          tap((project) => {
            this.patch({ projects: [...this._state$.value.projects, project] });
            this.snackBar.open('Project created.', 'Dismiss', { duration: 3000 });
          }),
          catchError((err) => {
            const msg = err?.error?.message ?? 'Failed to create project.';
            this.patch({ saveError: msg });
            observer.error(err);
            return EMPTY;
          }),
          finalize(() => {
            this.patch({ saving: false });
            observer.complete();
          }),
        )
        .subscribe({ next: (p) => observer.next(p) });
    });
  }

  update(id: string, data: UpdateProjectRequest): Observable<Project> {
    this.patch({ saving: true, saveError: null });
    return new Observable<Project>((observer) => {
      this.api
        .update(id, data)
        .pipe(
          tap((updated) => {
            const projects = this._state$.value.projects.map((p) => (p.id === id ? updated : p));
            this.patch({ projects });
            this.snackBar.open('Project updated.', 'Dismiss', { duration: 3000 });
          }),
          catchError((err) => {
            const msg = err?.error?.message ?? 'Failed to update project.';
            this.patch({ saveError: msg });
            observer.error(err);
            return EMPTY;
          }),
          finalize(() => {
            this.patch({ saving: false });
            observer.complete();
          }),
        )
        .subscribe({ next: (p) => observer.next(p) });
    });
  }

  delete(id: string): Observable<void> {
    this.patch({ saving: true, saveError: null });
    return new Observable<void>((observer) => {
      this.api
        .delete(id)
        .pipe(
          tap(() => {
            const projects = this._state$.value.projects.filter((p) => p.id !== id);
            this.patch({ projects });
            this.snackBar.open('Project deleted.', 'Dismiss', { duration: 3000 });
          }),
          catchError((err) => {
            const msg = err?.error?.message ?? 'Failed to delete project.';
            this.patch({ saveError: msg });
            observer.error(err);
            return EMPTY;
          }),
          finalize(() => {
            this.patch({ saving: false });
            observer.complete();
          }),
        )
        .subscribe({ next: () => observer.next() });
    });
  }
}
