import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from 'src/app/models/product.model';
import { ProductService } from '../product.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
  produto: Product | undefined;
  currentUrl: string = '';

  constructor(
    private route: ActivatedRoute,
    private produtoService: ProductService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.produtoService.getProduto(slug).subscribe(produto => {
        this.produto = produto;
      });
    }
    this.currentUrl = this.produtoService.getCurrentUrl();
  }

  onDelete(): void {
    if (this.produto && confirm('Tem certeza que deseja excluir este produto?')) {
      this.produtoService.deleteProduto(this.produto.id).subscribe({
        next: () => this.router.navigate(['/products']),
        error: (err) => console.error('Erro ao excluir produto:', err)
      });
    }
  }
}
