import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TasksApiService } from './tasks-api.service';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../models/task.models';

export interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  saving: boolean;
  saveError: string | null;
}

const initialState: TasksState = {
  tasks: [],
  loading: false,
  error: null,
  saving: false,
  saveError: null,
};

@Injectable({ providedIn: 'root' })
export class TasksStore {
  private readonly _state$ = new BehaviorSubject<TasksState>(initialState);
  readonly state$ = this._state$.asObservable();

  constructor(
    private readonly api: TasksApiService,
    private readonly snackBar: MatSnackBar,
  ) {}

  private patch(partial: Partial<TasksState>): void {
    this._state$.next({ ...this._state$.value, ...partial });
  }

  load(): void {
    this.patch({ loading: true, error: null });
    this.api
      .getAll()
      .pipe(
        tap((tasks) => this.patch({ tasks })),
        catchError((err) => {
          const msg = err?.error?.message ?? 'Failed to load tasks.';
          this.patch({ error: msg });
          return EMPTY;
        }),
        finalize(() => this.patch({ loading: false })),
      )
      .subscribe();
  }

  create(data: CreateTaskRequest): Observable<Task> {
    this.patch({ saving: true, saveError: null });
    return new Observable<Task>((observer) => {
      this.api
        .create(data)
        .pipe(
          tap((task) => {
            this.patch({ tasks: [...this._state$.value.tasks, task] });
            this.snackBar.open('Task created.', 'Dismiss', { duration: 3000 });
          }),
          catchError((err) => {
            const msg = err?.error?.message ?? 'Failed to create task.';
            this.patch({ saveError: msg });
            observer.error(err);
            return EMPTY;
          }),
          finalize(() => {
            this.patch({ saving: false });
            observer.complete();
          }),
        )
        .subscribe({ next: (t) => observer.next(t) });
    });
  }

  update(id: string, data: UpdateTaskRequest): Observable<Task> {
    this.patch({ saving: true, saveError: null });
    return new Observable<Task>((observer) => {
      this.api
        .update(id, data)
        .pipe(
          tap((updated) => {
            const tasks = this._state$.value.tasks.map((t) => (t.id === id ? updated : t));
            this.patch({ tasks });
            this.snackBar.open('Task updated.', 'Dismiss', { duration: 3000 });
          }),
          catchError((err) => {
            const msg = err?.error?.message ?? 'Failed to update task.';
            this.patch({ saveError: msg });
            observer.error(err);
            return EMPTY;
          }),
          finalize(() => {
            this.patch({ saving: false });
            observer.complete();
          }),
        )
        .subscribe({ next: (t) => observer.next(t) });
    });
  }

  delete(id: string): Observable<void> {
    this.patch({ saving: true, saveError: null });
    return new Observable<void>((observer) => {
      this.api
        .delete(id)
        .pipe(
          tap(() => {
            const tasks = this._state$.value.tasks.filter((t) => t.id !== id);
            this.patch({ tasks });
            this.snackBar.open('Task deleted.', 'Dismiss', { duration: 3000 });
          }),
          catchError((err) => {
            const msg = err?.error?.message ?? 'Failed to delete task.';
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
