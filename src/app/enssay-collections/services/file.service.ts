import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_URL } from 'src/app/constants/app.constants';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(private http: HttpClient) {}

  getFiles(urlPath: string): Observable<File[]> {
    return this.http.get<File[]>(`${BASE_URL}/arquivos/?urlPath=${encodeURIComponent(urlPath)}`);
  }
}
