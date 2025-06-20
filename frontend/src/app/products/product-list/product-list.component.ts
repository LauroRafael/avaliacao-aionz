import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/models/product.model';
import { ProductService } from '../product.service';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  produtos: Product[] = [];
  // produtos: any;

  constructor(
    private produtoService: ProductService,
    private titleService: Title,
    private metaService: Meta,
  ) { }

  ngOnInit() {
    this.produtoService.getProdutos().subscribe({
      next: (produtos) => {
        this.produtos = produtos;
        console.log('Produtos recebidos:', produtos);

        // SEO DINÂMICO
        this.titleService.setTitle("Teste Aionz");
        this.metaService.updateTag({ name: 'description', content: "Avaliação para vaga full stack" });
        this.metaService.updateTag({ name: 'og:title', content: "Teste Aionz" });
        this.metaService.updateTag({ name: 'og:description', content: "Avaliação para vaga full stack" });
      },
      error: (err) => {
        console.error('Erro ao carregar produtos:', err);
      }
    });
  }

}
