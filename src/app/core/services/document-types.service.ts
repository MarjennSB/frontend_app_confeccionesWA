import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DocumentType } from '../models/document-type.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentTypesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/document-types`;

  getDocumentTypes(): Observable<{ data: DocumentType[] }> {
    return this.http.get<{ data: DocumentType[] }>(this.apiUrl);
  }
}