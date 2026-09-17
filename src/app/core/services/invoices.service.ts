import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Invoice,
  InvoiceListResponse,
  CreateInvoiceDto,
  UpdateInvoiceDto,
} from '../models/invoice.model';

@Injectable({ providedIn: 'root' })
export class InvoicesService {
  private readonly http   = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/invoices`;

  /** GET /api/invoices?search=&date=&per_page= */
  getInvoices(search: string = '', date: string = '', page: number = 1, perPage: number = 10): Observable<InvoiceListResponse> {
    const params = new HttpParams()
      .set('search', search)
      .set('date', date)
      .set('page', page.toString())
      .set('per_page', perPage.toString());
    return this.http.get<InvoiceListResponse>(this.apiUrl, { params });
  }

  /** POST /api/invoices (multipart/form-data) */
  createInvoice(data: CreateInvoiceDto): Observable<{ codigo: number; mensaje: string; invoice: Invoice }> {
    return this.http.post<{ codigo: number; mensaje: string; invoice: Invoice }>(
      this.apiUrl,
      this.buildFormData(data)
    );
  }

  /** PUT /api/invoices/{id} (multipart via POST + _method=PUT) */
  updateInvoice(id: number | string, data: UpdateInvoiceDto): Observable<{ mensaje: string; invoice: Invoice }> {
    const fd = this.buildFormData(data);
    fd.append('_method', 'PUT');
    return this.http.post<{ mensaje: string; invoice: Invoice }>(`${this.apiUrl}/${id}`, fd);
  }

  // ─── Helper ───────────────────────────────────────────────
  private buildFormData(data: CreateInvoiceDto | UpdateInvoiceDto): FormData {
    const fd = new FormData();
    (Object.keys(data) as (keyof typeof data)[]).forEach((key) => {
      const val = data[key];
      if (val === null || val === undefined) return;
      if (key === 'attached_file' && val instanceof File) {
        fd.append('attached_file', val, val.name);
      } else if ((key as string) !== '_method') {
        if (typeof val === 'boolean') {
          fd.append(key, val ? '1' : '0');
        } else {
          fd.append(key, String(val));
        }
      }
    });
    return fd;
  }
}
