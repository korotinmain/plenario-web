import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { firstValueFrom } from 'rxjs';
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

const makeApiMock = () => ({
  getAll: vi.fn().mockReturnValue(of([mockTask])),
  create: vi.fn().mockReturnValue(of(mockTask)),
  update: vi.fn().mockReturnValue(of({ ...mockTask, status: 'DONE' })),
  delete: vi.fn().mockReturnValue(of(undefined as unknown as void)),
  getById: vi.fn(),
});

describe('TasksStore', () => {
  let store: TasksStore;
  let apiMock: ReturnType<typeof makeApiMock>;
  let snackBarMock: { open: ReturnType<typeof vi.fn> };

  const setup = (apiOverrides: Partial<ReturnType<typeof makeApiMock>> = {}) => {
    apiMock = { ...makeApiMock(), ...apiOverrides };
    snackBarMock = { open: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        TasksStore,
        { provide: TasksApiService, useValue: apiMock },
        { provide: MatSnackBar, useValue: snackBarMock },
      ],
    });
    store = TestBed.inject(TasksStore);
  };

  it('should start with empty state', async () => {
    setup();
    const s = await firstValueFrom(store.state$);
    expect(s.tasks).toEqual([]);
    expect(s.loading).toBe(false);
    expect(s.error).toBeNull();
  });

  describe('load()', () => {
    it('should populate tasks on success', async () => {
      setup();
      store.load();
      const s = await firstValueFrom(store.state$);
      expect(s.tasks).toEqual([mockTask]);
      expect(s.loading).toBe(false);
      expect(s.error).toBeNull();
    });

    it('should set error on load failure', async () => {
      setup({
        getAll: vi.fn().mockReturnValue(
          throwError(() => ({ error: { message: 'Server error' } })),
        ),
      });
      store.load();
      const s = await firstValueFrom(store.state$);
      expect(s.error).toBe('Server error');
      expect(s.loading).toBe(false);
    });

    it('should use fallback message when error has no message', async () => {
      setup({ getAll: vi.fn().mockReturnValue(throwError(() => ({}))) });
      store.load();
      const s = await firstValueFrom(store.state$);
      expect(s.error).toBe('Failed to load tasks.');
    });
  });

  describe('create()', () => {
    it('should add the new task to state and show snackbar', async () => {
      setup();
      await firstValueFrom(
        store.create({ title: 'Write tests' } as CreateTaskRequest),
      );
      const s = await firstValueFrom(store.state$);
      expect(s.tasks).toContainEqual(mockTask);
      expect(snackBarMock.open).toHaveBeenCalledWith('Task created.', 'Dismiss', { duration: 3000 });
    });

    it('should set saveError on create failure', async () => {
      setup({
        create: vi.fn().mockReturnValue(
          throwError(() => ({ error: { message: 'Create failed' } })),
        ),
      });
      try {
        await firstValueFrom(store.create({ title: 'Bad task' } as CreateTaskRequest));
      } catch {}
      const s = await firstValueFrom(store.state$);
      expect(s.saveError).toBe('Create failed');
    });
  });

  describe('update()', () => {
    it('should replace the updated task in state and show snackbar', async () => {
      setup();
      store.load();
      await firstValueFrom(store.update('t1', { status: 'DONE' } as UpdateTaskRequest));
      const s = await firstValueFrom(store.state$);
      expect(s.tasks.find((t) => t.id === 't1')?.status).toBe('DONE');
      expect(snackBarMock.open).toHaveBeenCalledWith('Task updated.', 'Dismiss', { duration: 3000 });
    });

    it('should set saveError on update failure', async () => {
      setup({
        update: vi.fn().mockReturnValue(
          throwError(() => ({ error: { message: 'Update failed' } })),
        ),
      });
      try {
        await firstValueFrom(store.update('t1', { status: 'DONE' } as UpdateTaskRequest));
      } catch {}
      const s = await firstValueFrom(store.state$);
      expect(s.saveError).toBe('Update failed');
    });
  });

  describe('delete()', () => {
    it('should remove the deleted task from state and show snackbar', async () => {
      setup();
      store.load();
      await firstValueFrom(store.delete('t1'));
      const s = await firstValueFrom(store.state$);
      expect(s.tasks.find((t) => t.id === 't1')).toBeUndefined();
      expect(snackBarMock.open).toHaveBeenCalledWith('Task deleted.', 'Dismiss', { duration: 3000 });
    });

    it('should set saveError on delete failure', async () => {
      setup({
        delete: vi.fn().mockReturnValue(
          throwError(() => ({ error: { message: 'Delete failed' } })),
        ),
      });
      try {
        await firstValueFrom(store.delete('t1'));
      } catch {}
      const s = await firstValueFrom(store.state$);
      expect(s.saveError).toBe('Delete failed');
    });
  });
});
