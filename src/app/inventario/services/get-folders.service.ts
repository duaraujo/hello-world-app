import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL } from 'src/app/constants/app.constants';

@Injectable({
  providedIn: 'root',
})
export class GetFoldersService {

  constructor(private http: HttpClient) {}

  getFolders(directoryPath: string): Observable<string[]> {
    const params = new HttpParams().set('directoryPath', directoryPath);
    return this.http.get<string[]>(`${BASE_URL}/folders`, { params });
  }

  getImages(folderName: string): Observable<{ name: string; base64: string }[]> {
    return this.http.get<{ name: string; base64: string }[]>(`${BASE_URL}/images`, {
      params: { directoryPath: folderName },
    });
  }
}
