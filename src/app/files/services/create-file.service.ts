import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CreateFileService {

  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  createFile(fileName: string, fileContent: any, urlPath: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/create-file`, {
      fileName,
      fileContent,
      urlPath
    });
  }
}
