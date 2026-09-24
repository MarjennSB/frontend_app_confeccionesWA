import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Production } from '../../../core/models/production.model';
import { ProductionsService } from '../../../core/services/productions.service';
import { ProductionModalComponent } from '../components/production-modal/production-modal';
import ExcelJS from 'exceljs';

@Component({
  selector: 'app-productions-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductionModalComponent],
  templateUrl: './productions-list.html',
  styleUrls: ['./productions-list.scss'],
})
export class ProductionsListComponent implements OnInit {
  private readonly productionsService = inject(ProductionsService);

  readonly productions = signal<Production[]>([]);
  readonly selectedProduction = signal<Production | null>(null);
  readonly isModalOpen = signal<boolean>(false);

  readonly searchTerm = signal<string>('');
  readonly filterDate = signal<string>('');
  readonly currentPage = signal<number>(1);
  readonly totalPages = signal<number>(1);
  readonly totalItems = signal<number>(0);

  // Modales de detalle de colores y guías
  readonly detailModalType = signal<'colors' | 'guides' | null>(null);
  readonly detailModalProduction = signal<Production | null>(null);

  readonly showPrintWarning = signal<boolean>(false);
  readonly isExporting = signal<boolean>(false);

  private searchTimeout: any;

  ngOnInit(): void {
    this.loadProductions();
  }

  onSearchChange(term: string): void {
    this.searchTerm.set(term);
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(1);
      this.loadProductions();
    }, 400);
  }

  onDateChange(date: string): void {
    this.filterDate.set(date);
    this.currentPage.set(1);
    this.loadProductions();
  }

  loadProductions(): void {
    // If they want ALL productions for printing when date is set, we could pass per_page=1000, 
    // but the API is paginated. For now we use the default or a large number for printing?
    // Wait, let's keep the standard pagination. If they want to print, they print what's on screen,
    // or we fetch all. Let's pass a large perPage if we want to print everything for that day.
    // The user said "el filtro por fecha ya que esto normalmente las hago los martes".
    // I'll leave perPage default for the view, but let's change getProductions to allow overriding perPage if needed later.
    this.productionsService.getProductions(this.searchTerm(), this.currentPage(), 10, this.filterDate()).subscribe({
      next: (res) => {
        this.productions.set(res.productions.data);
        if (res.pagination) {
          this.currentPage.set(res.pagination.current_page);
          this.totalPages.set(res.pagination.last_page);
          this.totalItems.set(res.pagination.total);
        }
      },
      error: (err: any) => console.error('Error cargando producciones', err)
    });
  }

  printReport(): void {
    if (!this.filterDate()) {
      this.showPrintWarning.set(true);
      return;
    }
    window.print();
  }

  closePrintWarning(): void {
    this.showPrintWarning.set(false);
  }

  exportToExcel(): void {
    if (!this.filterDate()) {
      this.showPrintWarning.set(true);
      return;
    }

    this.isExporting.set(true);

    this.productionsService.getProductions(this.searchTerm(), 1, 1000, this.filterDate()).subscribe({
      next: async (res) => {
        const data = res.productions.data;
        const dateLabel = this.filterDate();
        const dateFormatted = this.formatDateLabel(dateLabel);

        // ── Columnas: igual que la Hoja de Resumen impresa ──────────────
        const COLS = [
          { header: '#',          key: 'num',     width: 5  },
          { header: 'CANTIDAD',   key: 'qty',     width: 12 },
          { header: 'Nro. O/P',  key: 'op',      width: 14 },
          { header: 'Nro. O/C',  key: 'oc',      width: 14 },
          { header: 'COLOR',      key: 'color',   width: 30 },
          { header: 'P.U',        key: 'pu',      width: 12 },
          { header: 'GUÍAS',      key: 'guides',  width: 45 },
        ];
        const TOTAL_COLS = COLS.length; // 7

        const wb = new ExcelJS.Workbook();
        wb.creator = 'Confecciones WA';
        wb.created = new Date();

        const ws = wb.addWorksheet('Producción', {
          pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1 },
        });

        // Anchos de columna
        ws.columns = COLS.map(c => ({ width: c.width }));

        // ── FILA 1: Título principal ────────────────────────────────────
        ws.mergeCells(1, 1, 1, TOTAL_COLS);
        const titleCell = ws.getCell('A1');
        titleCell.value = 'HOJA DE RESUMEN';
        titleCell.font  = { name: 'Calibri', bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
        ws.getRow(1).height = 32;

        // ── FILA 2: Sub-encabezado (empresa / fecha) ───────────────────
        ws.mergeCells(2, 1, 2, TOTAL_COLS);
        const subCell = ws.getCell('A2');
        subCell.value = `CONFECCIONES WA — Reporte de Producción | Fecha: ${dateFormatted} | Generado: ${new Date().toLocaleString('es-PE')}`;
        subCell.font  = { name: 'Calibri', italic: true, size: 10, color: { argb: 'FF444444' } };
        subCell.alignment = { horizontal: 'center', vertical: 'middle' };
        subCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8EFF7' } };
        ws.getRow(2).height = 18;

        // ── FILA 3: vacía ──────────────────────────────────────────────
        ws.addRow([]);

        // ── FILA 4: Encabezados de columna ─────────────────────────────
        const headerStyle: Partial<ExcelJS.Style> = {
          font:      { name: 'Calibri', bold: true, size: 11, color: { argb: 'FFFFFFFF' } },
          fill:      { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } },
          alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
          border: {
            top:    { style: 'thin', color: { argb: 'FFFFFFFF' } },
            left:   { style: 'thin', color: { argb: 'FFFFFFFF' } },
            bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } },
            right:  { style: 'thin', color: { argb: 'FFFFFFFF' } },
          },
        };
        const hRow = ws.addRow(COLS.map(c => c.header));
        hRow.height = 22;
        hRow.eachCell(cell => Object.assign(cell, headerStyle));

        // ── FILAS DE DATOS ─────────────────────────────────────────────
        const borderThin: Partial<ExcelJS.Borders> = {
          top:    { style: 'thin', color: { argb: 'FFCCCCCC' } },
          left:   { style: 'thin', color: { argb: 'FFCCCCCC' } },
          bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          right:  { style: 'thin', color: { argb: 'FFCCCCCC' } },
        };

        let totalQty = 0;
        data.forEach((prod, i) => {
          totalQty += prod.quantity;
          const isEven = i % 2 === 0;
          const rowBg  = isEven ? 'FFFFFFFF' : 'FFF1F5FB';

          const colores = prod.colors?.map(c => c.name).join(', ') ?? '—';
          const guias   = prod.guides?.map(g => (g as any).guide_number).join(', ') ?? '—';

          const dataRow = ws.addRow([
            i + 1,
            prod.quantity,
            prod.production_order_number,
            prod.purchase_order_number,
            colores,
            prod.unit_price,
            guias,
          ]);
          dataRow.height = 18;

          dataRow.eachCell({ includeEmpty: true }, (cell, colNum) => {
            cell.border    = borderThin;
            cell.font      = { name: 'Calibri', size: 10 };
            cell.alignment = { vertical: 'middle', wrapText: true };
            cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBg } };

            // Columna # → centrado
            if (colNum === 1) cell.alignment = { ...cell.alignment, horizontal: 'center' };
            // Columna CANTIDAD → negrita + centrado
            if (colNum === 2) { cell.font = { ...cell.font, bold: true }; cell.alignment = { ...cell.alignment, horizontal: 'center' }; }
            // Columna P.U → número con 2 decimales
            if (colNum === 6) {
              cell.numFmt = '#,##0.00';
              cell.alignment = { ...cell.alignment, horizontal: 'center' };
            }
          });
        });

        // ── FILA DE TOTAL ──────────────────────────────────────────────
        ws.addRow([]);
        const totalRow = ws.addRow(['', totalQty, '', '', '', '', `Total registros: ${data.length}`]);
        totalRow.height = 20;
        totalRow.eachCell({ includeEmpty: true }, (cell, colNum) => {
          cell.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
          cell.font   = { name: 'Calibri', bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
          cell.border = borderThin;
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          if (colNum === 7) cell.alignment = { horizontal: 'right', vertical: 'middle' };
        });

        // ── GENERAR Y DESCARGAR ────────────────────────────────────────
        const buffer = await wb.xlsx.writeBuffer();
        const blob   = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url    = URL.createObjectURL(blob);
        const a      = document.createElement('a');
        a.href       = url;
        a.download   = `Reporte_Produccion_${dateLabel}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);

        this.isExporting.set(false);
      },
      error: (err) => {
        console.error('Error exportando a Excel', err);
        this.isExporting.set(false);
      }
    });
  }

  private formatDateLabel(isoDate: string): string {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadProductions();
    }
  }

  openModal(production?: Production): void {
    this.selectedProduction.set(production || null);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedProduction.set(null);
  }

  deleteProduction(id: string | number): void {
    alert('Funcionalidad de eliminación dura no disponible. Recomendado desactivar.');
  }

  openDetailModal(prod: Production, type: 'colors' | 'guides'): void {
    this.detailModalProduction.set(prod);
    this.detailModalType.set(type);
  }

  closeDetailModal(): void {
    this.detailModalType.set(null);
    this.detailModalProduction.set(null);
  }
}
