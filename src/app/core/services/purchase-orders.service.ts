import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  PurchaseOrder,
  PurchaseOrderListResponse,
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
} from '../models/purchase-order.model';

@Injectable({ providedIn: 'root' })
export class PurchaseOrdersService {
  private readonly http   = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/purchase-orders`;

  /** GET /api/purchase-orders?search=&per_page= */
  getPurchaseOrders(search: string = '', page: number = 1, perPage: number = 10): Observable<PurchaseOrderListResponse> {
    const params = new HttpParams()
      .set('search', search)
      .set('page', page.toString())
      .set('per_page', perPage.toString());
    return this.http.get<PurchaseOrderListResponse>(this.apiUrl, { params });
  }

  /** POST /api/purchase-orders (multipart/form-data) */
  createPurchaseOrder(data: CreatePurchaseOrderDto): Observable<{ codigo: number; mensaje: string; purchase_order: PurchaseOrder }> {
    return this.http.post<{ codigo: number; mensaje: string; purchase_order: PurchaseOrder }>(
      this.apiUrl,
      this.buildFormData(data)
    );
  }

  /** PUT /api/purchase-orders/{id} (multipart via POST + _method=PUT) */
  updatePurchaseOrder(id: number | string, data: UpdatePurchaseOrderDto): Observable<{ mensaje: string; purchase_order: PurchaseOrder }> {
    const fd = this.buildFormData(data);
    fd.append('_method', 'PUT');
    return this.http.post<{ mensaje: string; purchase_order: PurchaseOrder }>(`${this.apiUrl}/${id}`, fd);
  }

  // ─── Helper ───────────────────────────────────────────────
  private buildFormData(data: CreatePurchaseOrderDto | UpdatePurchaseOrderDto): FormData {
    const fd = new FormData();
    (Object.keys(data) as (keyof typeof data)[]).forEach((key) => {
      const val = data[key];
      if (val === null || val === undefined) return;
      if (key === 'attached_file' && val instanceof File) {
        fd.append('attached_file', val, val.name);
      } else if ((key as string) !== '_method') {
        fd.append(key, String(val));
      }
    });
    return fd;
  }
}
