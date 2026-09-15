import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DocumentType } from '../models/document-type.model';

export interface DocumentTypeListResponse {
  document_types: DocumentType[];
}

@Injectable({ providedIn: 'root' })
export class DocumentTypesService {
  private readonly http   = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/document-types`;

  /** GET /api/document-types */
  getDocumentTypes(): Observable<DocumentTypeListResponse> {
    return this.http.get<DocumentTypeListResponse>(this.apiUrl);
  }
}