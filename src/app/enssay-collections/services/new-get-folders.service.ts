import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL, NEW_BASE_URL } from 'src/app/constants/app.constants';

interface ExtraFile {
  base64: string;
  namePath: string;
}

interface ParsedJsonResult {
  analystName: string;
  assaysCollection: string;
  analyte: string;
  analyticalParameter: string;
  captureTechnique: string;
  sample: string;
  extraFileNames: ExtraFile[];
}

@Injectable({
  providedIn: 'root',
})
export class NewGetFoldersService {

  constructor(private http: HttpClient) {}
  

  getCapturesTaken(folder_name: string): Observable<string[]> {
    const params = new HttpParams().set('folder_name', folder_name);
    return this.http.get<string[]>(`${NEW_BASE_URL}captures-taken`, {params});
  }
  
  parseJsons(path: string, inference: boolean): Observable<ParsedJsonResult[]> {
    const params = new HttpParams()
      .set('path', path)
      .set('use_training', inference.toString());
  
    return this.http.get<ParsedJsonResult[]>(`${NEW_BASE_URL}parse-jsons`, { params });
  }

  getImageNewApi(directoryPath: string): Observable<string[]> {
    //const params = new HttpParams().set('directoryPath', directoryPath);
    return this.http.get<string[]>(`${NEW_BASE_URL}api/get-inference-training`);
  }
  
  getFolders(directoryPath: string): Observable<string[]> {
    //const params = new HttpParams().set('directoryPath', directoryPath);, { params }
    return this.http.get<string[]>(`${NEW_BASE_URL}enssay-collections`);
  }

  getImages(folderName: string): Observable<{ name: string; base64: string }[]> {
    return this.http.get<{ name: string; base64: string }[]>(`${BASE_URL}/images`, {
      params: { directoryPath: folderName },
    });
  }

  download(directoryPath: string): Observable<Blob> {
    const params = new HttpParams().set('directoryPath', directoryPath);
    return this.http.get<Blob>(`${BASE_URL}/download`, {
      params,
      responseType: 'blob' as 'json',
    });
  }


}
