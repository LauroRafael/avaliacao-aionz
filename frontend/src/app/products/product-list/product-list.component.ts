import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/models/product.model';
import { ProductService } from '../product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  produtos: Product[] = [];
  // produtos: any;
  
  constructor(private produtoService: ProductService) { }

  ngOnInit() {
    this.produtoService.getProdutos().subscribe({
      next: (produtos) => {
        this.produtos = produtos;
        console.log('Produtos recebidos:', produtos);
      },
      error: (err) => {
        console.error('Erro ao carregar produtos:', err);
      }
    });
  }

}
