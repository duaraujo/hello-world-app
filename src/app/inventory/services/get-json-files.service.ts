import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_URL } from 'src/app/constants/app.constants';

@Injectable({
  providedIn: 'root'
})
export class GetJsonFilesService {

  constructor(private http: HttpClient) {}

  // getFiles(directoryPath: string, analystName?: string): Observable<File[]> {
  //   const url = `${BASE_URL}/json-files/?directoryPath=${encodeURIComponent(directoryPath)}`;
  //   const urlWithAnalyst = analystName ? `${url}&analystName=${encodeURIComponent(analystName)}` : url;
  //   return this.http.get<File[]>(urlWithAnalyst);
  // }

  getFiles(directoryPath: string, analystName?: string, startDate?: string, endDate?: string): Observable<File[]> {
    let url = `${BASE_URL}/json-files/?directoryPath=${encodeURIComponent(directoryPath)}`;
    
    if (analystName) {
      url += `&analystName=${encodeURIComponent(analystName)}`;
    }
    
    if (startDate) {
      url += `&startDate=${encodeURIComponent(startDate)}`;
    }
    
    if (endDate) {
      url += `&endDate=${encodeURIComponent(endDate)}`;
    }
    
    return this.http.get<File[]>(url);
  }
}
