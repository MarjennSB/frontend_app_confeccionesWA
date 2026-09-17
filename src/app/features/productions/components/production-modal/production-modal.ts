import { Component, EventEmitter, inject, input, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray, FormControl } from '@angular/forms';
import { Production } from '../../../../core/models/production.model';
import { ProductionsService } from '../../../../core/services/productions.service';
import { TokenService } from '../../../../core/services/token.service';
import { PurchaseOrder } from '../../../../core/models/purchase-order.model';
import { PoSelectorModalComponent } from '../po-selector-modal/po-selector-modal.component';
import { PurchaseOrderModalComponent } from '../../../purchase-orders/components/purchase-order-modal/purchase-order-modal';
import { ColorModalComponent } from '../../../colores/components/color-modal/color-modal';
import { GuideModalComponent } from '../../../guides/components/guide-modal/guide-modal';
import { ColorSelectorModalComponent } from '../color-selector-modal/color-selector-modal.component';
import { GuideManagerModalComponent } from '../guide-manager-modal/guide-manager-modal.component';
import { ColorsService } from '../../../../core/services/colors.service';
import { GuidesService } from '../../../../core/services/guides.service';

@Component({
  selector: 'app-production-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PoSelectorModalComponent, PurchaseOrderModalComponent, ColorModalComponent, GuideModalComponent, ColorSelectorModalComponent, GuideManagerModalComponent],
  templateUrl: './production-modal.html'
})
export class ProductionModalComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly productionsService = inject(ProductionsService);
  private readonly tokenService = inject(TokenService);
  private readonly colorsService = inject(ColorsService);
  private readonly guidesService = inject(GuidesService);

  isOpen = input.required<boolean>();
  production = input<Production | null>(null);

  @Output() closeModal = new EventEmitter<void>();
  @Output() productionSaved = new EventEmitter<void>();

  readonly isEditMode = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);
  
  // Para el modal selector
  readonly isPoSelectorOpen = signal<boolean>(false);
  readonly selectedPoDisplay = signal<string>('');

  // Para el modal de crear nueva PO
  readonly isCreatePoOpen = signal<boolean>(false);

  // Para modales anidados de dependencias
  readonly isCreateColorOpen = signal<boolean>(false);
  readonly isCreateGuideOpen = signal<boolean>(false);

  // Para los nuevos modales selectores
  readonly isColorSelectorOpen = signal<boolean>(false);
  readonly isGuideManagerOpen = signal<boolean>(false);

  prodForm: FormGroup = this.fb.group({
    production_order_number: ['', Validators.required],
    purchase_order_id: ['', Validators.required],
    production_date: ['', Validators.required],
    quantity: [0, [Validators.required, Validators.min(1)]],
    unit_price: [0, [Validators.required, Validators.min(0)]],
    colors: [[] as number[], Validators.required],
    guides: [[] as number[], Validators.required],
    is_active: [true]
  });

  ngOnInit() {
    this.loadDependencies();

    const currentProd = this.production();
    if (currentProd) {
      this.isEditMode.set(true);
      this.selectedPoDisplay.set(currentProd.purchase_order_number);
      
      const selectedColorIds = currentProd.colors?.map(c => typeof c === 'object' ? c.id as number : c) || [];
      const selectedGuideIds = currentProd.guides?.map(g => typeof g === 'object' ? g.id as number : g) || [];

      this.prodForm.patchValue({
        production_order_number: currentProd.production_order_number,
        purchase_order_id: currentProd.purchase_order_id,
        production_date: currentProd.production_date ? currentProd.production_date.split('T')[0] : '',
        quantity: currentProd.quantity,
        unit_price: Number(currentProd.unit_price).toFixed(2),
        colors: selectedColorIds,
        guides: selectedGuideIds,
        is_active: currentProd.is_active,
      });
    } else {
      this.isEditMode.set(false);
      this.selectedPoDisplay.set('');
      this.prodForm.reset({ quantity: 0, unit_price: 0, colors: [], guides: [], is_active: true, production_date: '' });
    }
  }

  loadDependencies(): void {
    // Si necesitas precargar algo al abrir. Para los selectores ya no es
    // estrictamente necesario cargarlos todos aquí, los modales se encargan,
    // pero puedes dejarlo vacío o cargar algo mínimo si quieres.
  }

  openPoSelector(): void {
    this.isPoSelectorOpen.set(true);
  }

  onPoSelected(po: PurchaseOrder): void {
    this.selectedPoDisplay.set(po.order_number);
    this.prodForm.patchValue({ 
      purchase_order_id: po.id,
      unit_price: Number(po.unit_price || 0).toFixed(2) 
    });
  }

  openCreatePoModal() {
    this.isPoSelectorOpen.set(false);
    this.isCreatePoOpen.set(true);
  }

  closeCreatePoModal() {
    this.isCreatePoOpen.set(false);
    this.isPoSelectorOpen.set(true);
  }

  onPurchaseOrderCreated() {
    // Si se creó exitosamente, no necesitamos hacer más nada,
    // el usuario puede volver a abrir la lupita y buscarlo.
  }

  openCreateColorModal() {
    this.isColorSelectorOpen.set(false);
    this.isCreateColorOpen.set(true);
  }

  onColorCreated(newColorId?: number | null) {
    if (newColorId) {
      const currentColors: number[] = this.prodForm.get('colors')?.value || [];
      if (!currentColors.includes(newColorId)) {
        this.prodForm.get('colors')?.setValue([...currentColors, newColorId]);
      }
    }
    this.isCreateColorOpen.set(false);
    this.isColorSelectorOpen.set(true);
  }

  openCreateGuideModal() {
    this.isGuideManagerOpen.set(false);
    this.isCreateGuideOpen.set(true);
  }

  onGuideCreated(newGuideId?: number | null) {
    // Añadir automáticamente la guia creada al formulario y reabrir el manager
    if (newGuideId) {
      const currentGuides: number[] = this.prodForm.get('guides')?.value || [];
      if (!currentGuides.includes(newGuideId)) {
        this.prodForm.get('guides')?.setValue([...currentGuides, newGuideId]);
      }
    }
    this.isCreateGuideOpen.set(false);
    this.isGuideManagerOpen.set(true);
  }

  openColorSelector() {
    this.isColorSelectorOpen.set(true);
  }

  onColorsSelected(colorIds: number[]) {
    this.prodForm.get('colors')?.setValue(colorIds);
  }

  openGuideManager() {
    this.isGuideManagerOpen.set(true);
  }

  onGuidesSelected(guideIds: number[]) {
    this.prodForm.get('guides')?.setValue(guideIds);
  }

  get selectedColorsCount(): number {
    return (this.prodForm.get('colors')?.value || []).length;
  }

  get selectedGuidesCount(): number {
    return (this.prodForm.get('guides')?.value || []).length;
  }

  save() {
    if (this.prodForm.invalid) {
      this.prodForm.markAllAsTouched();
      return;
    }
    
    const currentGuides = this.prodForm.get('guides')?.value || [];
    if (currentGuides.length > 10) {
      alert('Solo se permite un máximo de 10 guías por producción.');
      return;
    }
    
    this.isSubmitting.set(true);
    const formValue = this.prodForm.value;
    
    const poNumber = this.selectedPoDisplay();
    
    let dateToSave = formValue.production_date;
    if (dateToSave && dateToSave.length === 10) {
      const timeStr = new Date().toTimeString().split(' ')[0];
      dateToSave = `${dateToSave} ${timeStr}`;
    }
    
    const assignedUserId = this.isEditMode() && this.production() 
        ? this.production()!.user_id 
        : this.tokenService.currentUser()?.id;

    const data: any = {
      production_order_number: formValue.production_order_number,
      purchase_order_id: formValue.purchase_order_id,
      production_date: dateToSave,
      purchase_order_number: poNumber,
      user_id: assignedUserId,
      quantity: formValue.quantity,
      unit_price: formValue.unit_price,
      colors: formValue.colors,
      guides: formValue.guides,
      is_active: formValue.is_active
    };

    if (this.isEditMode() && this.production()) {
      this.productionsService.updateProduction(this.production()!.id, data).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.productionSaved.emit();
          this.close();
        },
        error: (err) => {
          console.error('Error actualizando producción', err);
          this.isSubmitting.set(false);
        }
      });
    } else {
      this.productionsService.createProduction(data).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.productionSaved.emit();
          this.close();
        },
        error: (err) => {
          console.error('Error creando producción', err);
          this.isSubmitting.set(false);
        }
      });
    }
  }

  close() {
    this.closeModal.emit();
  }
}
