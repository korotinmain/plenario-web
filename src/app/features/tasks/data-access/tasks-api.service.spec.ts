import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TasksApiService } from './tasks-api.service';
import { environment } from '../../../../environments/environment';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../models/task.models';

const base = `${environment.apiBaseUrl}/tasks`;

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

describe('TasksApiService', () => {
  let service: TasksApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TasksApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll()', () => {
    it('should GET /tasks and return task array', () => {
      let result: Task[] | undefined;
      service.getAll().subscribe((tasks) => (result = tasks));

      const req = httpMock.expectOne(base);
      expect(req.request.method).toBe('GET');
      req.flush([mockTask]);
      expect(result).toEqual([mockTask]);
    });
  });

  describe('getById()', () => {
    it('should GET /tasks/:id', () => {
      let result: Task | undefined;
      service.getById('t1').subscribe((t) => (result = t));

      const req = httpMock.expectOne(`${base}/t1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTask);
      expect(result).toEqual(mockTask);
    });
  });

  describe('create()', () => {
    it('should POST /tasks with the request body', () => {
      const payload: CreateTaskRequest = { title: 'New task', priority: 'HIGH' };
      let result: Task | undefined;
      service.create(payload).subscribe((t) => (result = t));

      const req = httpMock.expectOne(base);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({ ...mockTask, title: 'New task', priority: 'HIGH' });
      expect(result?.title).toBe('New task');
    });
  });

  describe('update()', () => {
    it('should PATCH /tasks/:id with the update body', () => {
      const patch: UpdateTaskRequest = { status: 'DONE' };
      let result: Task | undefined;
      service.update('t1', patch).subscribe((t) => (result = t));

      const req = httpMock.expectOne(`${base}/t1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(patch);
      req.flush({ ...mockTask, status: 'DONE' });
      expect(result?.status).toBe('DONE');
    });
  });

  describe('delete()', () => {
    it('should DELETE /tasks/:id', () => {
      let completed = false;
      service.delete('t1').subscribe(() => (completed = true));

      const req = httpMock.expectOne(`${base}/t1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
      expect(completed).toBeTrue();
    });
  });
});
