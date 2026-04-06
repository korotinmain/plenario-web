import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../models/task.models';

@Injectable({ providedIn: 'root' })
export class TasksApiService {
  private readonly base = `${environment.apiBaseUrl}/tasks`;

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Task[]> {
    return this.http.get<Task[]>(this.base);
  }

  getById(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.base}/${id}`);
  }

  create(body: CreateTaskRequest): Observable<Task> {
    return this.http.post<Task>(this.base, body);
  }

  update(id: string, body: UpdateTaskRequest): Observable<Task> {
    return this.http.patch<Task>(`${this.base}/${id}`, body);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
