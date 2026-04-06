import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TasksStore } from './tasks.store';
import { TasksApiService } from './tasks-api.service';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../models/task.models';

const mockTask: Task = {
  id: 't1',
  title: 'Write tests',
  description: null,
  status: 'TODO',
  priority: 'MEDIUM',
  dueDate: null,
  projectId: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('TasksStore', () => {
  let store: TasksStore;
  let apiSpy: jasmine.SpyObj<TasksApiService>;
  let snackSpy: jasmine.SpyObj<MatSnackBar>;

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj('TasksApiService', ['getAll', 'create', 'update', 'delete']);
    snackSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    TestBed.configureTestingModule({
      providers: [
        TasksStore,
        { provide: TasksApiService, useValue: apiSpy },
        { provide: MatSnackBar, useValue: snackSpy },
      ],
    });
    store = TestBed.inject(TasksStore);
  });

  it('should start with empty state', () => {
    store.state$.subscribe((s) => {
      expect(s.tasks).toEqual([]);
      expect(s.loading).toBeFalse();
      expect(s.error).toBeNull();
    });
  });

  describe('load()', () => {
    it('should set loading true while fetching and populate tasks on success', () => {
      apiSpy.getAll.and.returnValue(of([mockTask]));
      const states: boolean[] = [];
      store.state$.subscribe((s) => states.push(s.loading));

      store.load();

      let tasks: Task[] = [];
      store.state$.subscribe((s) => (tasks = s.tasks));

      expect(tasks).toEqual([mockTask]);
      expect(states).toContain(true);
      expect(states[states.length - 1]).toBeFalse();
    });

    it('should set error on load failure', () => {
      apiSpy.getAll.and.returnValue(throwError(() => ({ error: { message: 'Server error' } })));
      store.load();

      store.state$.subscribe((s) => {
        expect(s.error).toBe('Server error');
        expect(s.loading).toBeFalse();
      });
    });

    it('should use fallback message when error has no message', () => {
      apiSpy.getAll.and.returnValue(throwError(() => ({})));
      store.load();

      store.state$.subscribe((s) => {
        expect(s.error).toBe('Failed to load tasks.');
      });
    });
  });

  describe('create()', () => {
    it('should add the new task to state and show snackbar', () => {
      apiSpy.create.and.returnValue(of(mockTask));
      let tasks: Task[] = [];
      store.state$.subscribe((s) => (tasks = s.tasks));

      store.create({ title: 'Write tests' } as CreateTaskRequest).subscribe();

      expect(tasks).toContain(mockTask);
      expect(snackSpy.open).toHaveBeenCalledWith('Task created.', 'Dismiss', { duration: 3000 });
    });

    it('should set saveError on create failure', () => {
      apiSpy.create.and.returnValue(throwError(() => ({ error: { message: 'Create failed' } })));
      store.create({ title: 'Bad task' } as CreateTaskRequest).subscribe({
        error: () => {},
      });

      store.state$.subscribe((s) => {
        expect(s.saveError).toBe('Create failed');
      });
    });
  });

  describe('update()', () => {
    it('should replace the updated task in state and show snackbar', () => {
      const updated: Task = { ...mockTask, status: 'DONE' };
      apiSpy.update.and.returnValue(of(updated));

      // Pre-populate with the original task
      apiSpy.getAll.and.returnValue(of([mockTask]));
      store.load();

      store.update('t1', { status: 'DONE' } as UpdateTaskRequest).subscribe();

      store.state$.subscribe((s) => {
        expect(s.tasks.find((t) => t.id === 't1')?.status).toBe('DONE');
      });
      expect(snackSpy.open).toHaveBeenCalledWith('Task updated.', 'Dismiss', { duration: 3000 });
    });

    it('should set saveError on update failure', () => {
      apiSpy.update.and.returnValue(throwError(() => ({ error: { message: 'Update failed' } })));
      store.update('t1', { status: 'DONE' } as UpdateTaskRequest).subscribe({
        error: () => {},
      });

      store.state$.subscribe((s) => {
        expect(s.saveError).toBe('Update failed');
      });
    });
  });

  describe('delete()', () => {
    it('should remove the deleted task from state and show snackbar', () => {
      apiSpy.delete.and.returnValue(of(undefined as unknown as void));

      // Pre-populate
      apiSpy.getAll.and.returnValue(of([mockTask]));
      store.load();

      store.delete('t1').subscribe();

      store.state$.subscribe((s) => {
        expect(s.tasks.find((t) => t.id === 't1')).toBeUndefined();
      });
      expect(snackSpy.open).toHaveBeenCalledWith('Task deleted.', 'Dismiss', { duration: 3000 });
    });

    it('should set saveError on delete failure', () => {
      apiSpy.delete.and.returnValue(throwError(() => ({ error: { message: 'Delete failed' } })));
      store.delete('t1').subscribe({ error: () => {} });

      store.state$.subscribe((s) => {
        expect(s.saveError).toBe('Delete failed');
      });
    });
  });
});
