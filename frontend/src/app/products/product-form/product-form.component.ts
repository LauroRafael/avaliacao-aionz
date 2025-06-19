import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../product.service';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {
  produtoForm: FormGroup;
  isEditMode = false;
  currentId: number | null = null;
  currentSlug: string | null = null;
  imagemPreview: string | ArrayBuffer | null = null;
  selectedImageFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private produtoService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.produtoForm = this.fb.group({
      id: [null], // O ID não é necessário para o formulário, mas pode ser útil para edição
      nome: ['', Validators.required],
      descricao: [''],
      preco: ['', [Validators.required, Validators.min(0)]],
      imagem: [null]
    });
  }

  ngOnInit(): void {
    this.currentSlug = this.route.snapshot.paramMap.get('slug');
    
    if (this.currentSlug) {
      this.isEditMode = true;
      this.produtoService.getProduto(this.currentSlug).subscribe(produto => {
        this.produtoForm.patchValue({
          id: produto.id,
          nome: produto.nome,
          descricao: produto.descricao,
          preco: produto.preco
        });
        this.imagemPreview = `http://localhost:3000/${produto.imagemPath}`;
        this.currentId = Number(produto.id);
      });
    }
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.produtoForm.patchValue({ imagem: file });
      this.produtoForm.get('imagem')?.updateValueAndValidity();
      this.selectedImageFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagemPreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // product-form.component.ts
  onSubmit(): void {
    if (this.produtoForm.invalid) return;

    const formData = new FormData();

    // Adicione todos os campos como strings
    formData.append('nome', String(this.produtoForm.get('nome')?.value));
    formData.append('descricao', String(this.produtoForm.get('descricao')?.value));

    // Converter preço para número
    const preco = Number(this.produtoForm.get('preco')?.value);
    formData.append('preco', preco.toString()); // Ainda como string, mas garantindo que é um número válido

    // Adicione a imagem se existir
    if (this.selectedImageFile) {
      formData.append('imagem', this.selectedImageFile);
    } else if (!this.isEditMode) {
      alert('Imagem é obrigatória para novos produtos');
      return;
    }

    console.log('Enviando dados do formulário:', formData);
    

    if (this.isEditMode && this.currentSlug) {
      const id = Number(this.currentId);
      console.log(`Atualizando produto com id: ${this.currentId}`, formData);
      
      this.produtoService.updateProduto(id, formData).subscribe({
        next: () => this.router.navigate(['/products']),
        error: (err) => console.error('Erro ao atualizar produto:', err)
      });
    } else {
      // Envie a requisição
      this.produtoService.createProduto(formData).subscribe({
        next: () => this.router.navigate(['/products']),
        error: (err) => {
          console.error('Erro completo:', err);
          if (err.error) {
            console.error('Detalhes do erro:', err.error);
          }
        }
      });
    }

  }

  onDelete(): void {
    if (this.currentSlug) {
      const id = Number(this.currentId);
      if (confirm('Tem certeza que deseja excluir este produto?')) {
        this.produtoService.deleteProduto(id).subscribe({
          next: () => this.router.navigate(['/products']),
          error: (err) => console.error('Erro ao excluir produto:', err)
        });
      }
    }
  }
}
