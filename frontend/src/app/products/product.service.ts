import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';


@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private apiUrl = 'http://localhost:3000/products';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  getProdutos(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getProduto(slug: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${slug}`);
  }

  createProduto(produtoData: FormData): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, produtoData);
  }

  updateProduto(id: number, produtoData: FormData): Observable<Product> {
    console.log(`Atualizando produto com slug: ${id}`, produtoData);
    
    return this.http.put<Product>(`${this.apiUrl}/${id}`, produtoData);
  }

  deleteProduto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getCurrentUrl(): string {
    if (isPlatformBrowser(this.platformId)) {
      return window.location.href;
    }
    return '';
  }
}
