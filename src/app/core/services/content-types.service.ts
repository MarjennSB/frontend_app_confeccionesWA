import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ContentType } from '../models/content-types.model';

export interface ContentTypesResponse {
  data: ContentType[];
}

@Injectable({
  providedIn: 'root'
})
export class ContentTypesService {
  private apiUrl = `${environment.apiUrl}/content-types`;
  private http = inject(HttpClient);

  getContentTypes(): Observable<ContentTypesResponse | ContentType[]> {
    return this.http.get<ContentTypesResponse | ContentType[]>(this.apiUrl);
  }
}
