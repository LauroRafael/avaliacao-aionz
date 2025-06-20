import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from 'src/app/models/product.model';
import { ProductService } from '../product.service';
import { Title, Meta } from '@angular/platform-browser';

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
    private router: Router,
    private titleService: Title,
    private metaService: Meta,
  ) { }

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.produtoService.getProduto(slug).subscribe(produto => {
        this.produto = produto;
        // SEO DINÂMICO
        this.titleService.setTitle(this.produto.nome);
        this.metaService.updateTag({ name: 'description', content: this.produto.descricao });
        this.metaService.updateTag({ name: 'og:title', content: this.produto.nome });
        this.metaService.updateTag({ name: 'og:description', content: this.produto.descricao });
        this.metaService.updateTag({ name: 'og:image', content: this.produto.imagemPath });
        this.metaService.updateTag({ name: 'og:url', content: this.currentUrl });
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
