import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_URL } from 'src/app/constants/app.constants';

@Injectable({
  providedIn: 'root'
})
export class DeleteImageService {

  constructor(private http: HttpClient) {}

  deleteImage(directoryPath: string, imageName: string, fileJson: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${BASE_URL}/image`, {
      params: { directoryPath, imageName, fileJson },
    });
  }
  
}
