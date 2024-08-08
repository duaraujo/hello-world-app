import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GetFoldersService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getFolders(directoryPath: string): Observable<string[]> {
    const params = new HttpParams().set('directoryPath', directoryPath);
    return this.http.get<string[]>(`${this.baseUrl}/folders`, { params });
  }

  getImages(folderName: string): Observable<{ name: string; base64: string }[]> {
    return this.http.get<{ name: string; base64: string }[]>(`${this.baseUrl}/images`, {
      params: { directoryPath: folderName },
    });
  }
}
