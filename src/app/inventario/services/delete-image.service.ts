import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DeleteImageService {

  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  deleteImage(directoryPath: string, imageName: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/image`, {
      params: { directoryPath, imageName },
    });
  }
  
}
