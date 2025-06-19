import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import slugify from 'slugify';
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private productsRepository: Repository<Product>,
    ) { }

    async create(createProductDto: CreateProductDto, imagemPath: string): Promise<Product> {
        const slug = slugify(createProductDto.nome, { lower: true });
        const product = this.productsRepository.create({
            ...createProductDto,
            imagemPath,
            slug,
        });
        return this.productsRepository.save(product);
    }

    async findAll(): Promise<Product[]> {
        return this.productsRepository.find();
    }

    async findOneBySlug(slug: string): Promise<Product> {
        const product = await this.productsRepository.findOne({ where: { slug } });
        if (!product) {
            throw new NotFoundException(`Product with slug ${slug} not found`);
        }
        return product;
    }


    async update(id: number, updateProductDto: CreateProductDto, imagemPath?: string): Promise<Product> {
        const product = await this.productsRepository.findOne({
            where: { id }
        });

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        // Guarda o caminho da imagem antiga para possível remoção
        const oldImagePath = product.imagemPath;

        // Gera o novo slug
        const newSlug = slugify(updateProductDto.nome, { lower: true });

        // Verifica se o novo slug já existe para outro produto
        if (newSlug !== product.slug) {
            const existingProduct = await this.productsRepository.findOne({
                where: { slug: newSlug }
            });

            if (existingProduct && existingProduct.id !== id) {
                throw new BadRequestException(`Slug '${newSlug}' is already in use by another product`);
            }
        }

        // Atualiza os campos
        product.nome = updateProductDto.nome;
        product.descricao = updateProductDto.descricao;
        product.preco = updateProductDto.preco;
        product.slug = newSlug;

        // Atualiza a imagem apenas se uma nova foi fornecida
        if (imagemPath) {
            product.imagemPath = imagemPath;

            // Remove a imagem antiga se existir
            if (oldImagePath) {
                try {
                    await unlink(join(process.cwd(), oldImagePath));
                } catch (err) {
                    console.error('Failed to delete old image:', err);
                }
            }
        }

        return this.productsRepository.save(product);
    }
    /* async update(id: number, updateProductDto: CreateProductDto, imagemPath?: string): Promise<Product> {
        // Primeiro verifica se o produto existe
        const product = await this.productsRepository.findOne({
            where: { id }
        });

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        // Gera o novo slug baseado no novo nome
        const newSlug = slugify(updateProductDto.nome, { lower: true });

        // Verifica se o novo slug já existe para outro produto
        if (newSlug !== product.slug) {
            const existingProduct = await this.productsRepository.findOne({
                where: { slug: newSlug }
            });

            if (existingProduct && existingProduct.id !== id) {
                throw new BadRequestException(`Slug '${newSlug}' is already in use by another product`);
            }
        }

        // Atualiza os campos
        product.nome = updateProductDto.nome;
        product.descricao = updateProductDto.descricao;
        product.preco = updateProductDto.preco;
        product.slug = newSlug;

        // Atualiza a imagem apenas se uma nova foi fornecida
        if (imagemPath) {
            product.imagemPath = imagemPath;
        }

        return this.productsRepository.save(product);
    } */

    async remove(id: number): Promise<void> {
        const product = await this.productsRepository.findOne({ where: { id } });
        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        // Deleta o arquivo de imagem se existir
        if (product.imagemPath) {
            try {
                await unlink(join(process.cwd(), product.imagemPath));
            } catch (err) {
                console.error('Failed to delete image file:', err);
            }
        }

        await this.productsRepository.delete(id);
    }
}
