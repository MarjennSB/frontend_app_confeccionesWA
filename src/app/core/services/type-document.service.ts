import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TypeDocument } from '../models/type-document.model';

@Injectable({
  providedIn: 'root',
})
export class TypeDocumentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/type-document`;

  getAll(): Observable<TypeDocument[]> {
    return this.http.get<TypeDocument[]>(`${this.baseUrl}/all`);
  }

  getById(id: number): Observable<TypeDocument> {
    return this.http.get<TypeDocument>(`${this.baseUrl}/${id}`);
  }
}
