import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Project, CreateProjectRequest, UpdateProjectRequest } from '../models/project.models';

@Injectable({ providedIn: 'root' })
export class ProjectsApiService {
  private readonly base = `${environment.apiBaseUrl}/projects`;

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Project[]> {
    return this.http.get<Project[]>(this.base);
  }

  getById(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.base}/${id}`);
  }

  create(body: CreateProjectRequest): Observable<Project> {
    return this.http.post<Project>(this.base, body);
  }

  update(id: string, body: UpdateProjectRequest): Observable<Project> {
    return this.http.patch<Project>(`${this.base}/${id}`, body);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
