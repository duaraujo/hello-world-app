import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_URL } from 'src/app/constants/app.constants';

@Injectable({
  providedIn: 'root'
})
export class UpdateJsonService {

  constructor(private http: HttpClient) {}

  updateFile(nameFolder: string, name: string, description: string): Observable<any> {
    // O endpoint espera PUT /enssay-collections/:folder_name
    const url = `${BASE_URL}/enssay-collections/${encodeURIComponent(nameFolder)}`;
    const body = { name, description };
    return this.http.put(url, body);
  }
  
}
