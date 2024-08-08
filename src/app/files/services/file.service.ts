import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  private baseUrl = 'http://localhost:3000/arquivos';

  constructor(private http: HttpClient) {}

  getFiles(urlPath: string): Observable<File[]> {
    return this.http.get<File[]>(`${this.baseUrl}/?urlPath=${encodeURIComponent(urlPath)}`);
  }
}
