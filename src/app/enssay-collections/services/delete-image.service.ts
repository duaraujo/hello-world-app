import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_URL } from 'src/app/constants/app.constants';

@Injectable({
  providedIn: 'root'
})
export class DeleteImageService {

  constructor(private http: HttpClient) {}

  deleteImage(directoryPath: string, imageName: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${BASE_URL}/delete-image`, {
      params: { directoryPath, imageName },
    });
  }

  // promoteImage(directoryPath: string, imageName: string): Observable<{ message: string }> {
  //   return this.http.put<{ message: string }>(`${BASE_URL}/promote-image`, {
  //     params: { directoryPath, imageName },
  //   });
  // }

  // promoteImage(directoryPath: string, imageName: string): Observable<{ message: string }> {
  //   const url = `${BASE_URL}/promote-image`;
  //   const params = new HttpParams()
  //     .set('directoryPath', directoryPath)
  //     .set('imageName', imageName);
  
  //   return this.http.put<{ message: string }>(url, {}, { params });
  // }

  promoteImage(directoryPath: string, imageName: string): Observable<{ message: string }> {
    const url = `${BASE_URL}/promote-image`;
    const params = new HttpParams()
      .set('directoryPath', directoryPath)
      .set('imageName', imageName);
  
    return this.http.put<{ message: string }>(url, { directoryPath, imageName }, { params });
  }
  
}
