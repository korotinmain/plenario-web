import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

/**
 * Auth API service — HTTP communication with the auth endpoints.
 * Methods will be implemented in Increment 1.
 */
@Injectable({ providedIn: 'root' })
export class AuthApiService {
  constructor(private readonly http: HttpClient) {}
}
