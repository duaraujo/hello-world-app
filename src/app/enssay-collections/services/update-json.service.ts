import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_URL } from 'src/app/constants/app.constants';

@Injectable({
  providedIn: 'root'
})
export class UpdateJsonService {

  constructor(private http: HttpClient) {}

  updateFile(fileName: string, fileContent: any, urlPath: string): Observable<any> {
    return this.http.post(`${BASE_URL}/update-file`, {
      fileName,
      fileContent,
      urlPath
    });
  }
}
