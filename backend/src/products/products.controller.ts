import { Controller, Get, Post, Body, Param, UploadedFile, UseInterceptors, BadRequestException, UsePipes, Put, Delete, NotFoundException } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('products')
@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Post()
    @UsePipes(new ValidationPipe({ transform: true })) // Adicione esta linha
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                nome: { type: 'string' },
                descricao: { type: 'string' },
                preco: { type: 'number' },
                imagem: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @UseInterceptors(
        FileInterceptor('imagem', {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, cb) => {
                    const randomName = Array(32)
                        .fill(null)
                        .map(() => Math.round(Math.random() * 16).toString(16))
                        .join('');
                    return cb(null, `${randomName}${extname(file.originalname)}`);
                },
            }),
        }),
    )
    async create(
        @Body() createProductDto: CreateProductDto,
        @UploadedFile() file: Express.Multer.File,
    ) {
        if (!file) {
            throw new BadRequestException('Image is required');
        }
        // Converter preço para número se necessário
        if (typeof createProductDto.preco === 'string') {
            createProductDto.preco = Number(createProductDto.preco);
        }
        console.log('Recebido:', createProductDto);
        return this.productsService.create(createProductDto, file.path);
    }

    @Get()
    @ApiResponse({ status: 200, description: 'List of all products' })
    findAll() {
        // return ['Produto 1', 'Produto 2'];
        return this.productsService.findAll();
    }

    @Get(':slug')
    @ApiResponse({ status: 200, description: 'Product details' })
    @ApiResponse({ status: 404, description: 'Product not found' })
    findOne(@Param('slug') slug: string) {
        return this.productsService.findOneBySlug(slug);
    }


    @Put(':id')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                nome: { type: 'string' },
                descricao: { type: 'string' },
                preco: { type: 'number' },
                imagem: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @UseInterceptors(
        FileInterceptor('imagem', {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, cb) => {
                    const randomName = Array(32)
                        .fill(null)
                        .map(() => Math.round(Math.random() * 16).toString(16))
                        .join('');
                    return cb(null, `${randomName}${extname(file.originalname)}`);
                },
            }),
        }),
    )
    async update(
        @Param('id') id: string,
        @Body() updateProductDto: CreateProductDto,
        @UploadedFile() file?: Express.Multer.File, // Tornamos opcional
    ) {
        const productId = parseInt(id, 10);
        if (isNaN(productId)) {
            throw new BadRequestException('Invalid product ID');
        }

        // Converter preço para número se necessário
        if (typeof updateProductDto.preco === 'string') {
            updateProductDto.preco = Number(updateProductDto.preco);
        }

        // Passa o caminho do arquivo apenas se uma nova imagem foi enviada
        const imagePath = file ? file.path : undefined;

        return this.productsService.update(productId, updateProductDto, imagePath);
    }
    /*  @Put(':id')
     @ApiConsumes('multipart/form-data')
     @ApiBody({
         schema: {
             type: 'object',
             properties: {
                 nome: { type: 'string' },
                 descricao: { type: 'string' },
                 preco: { type: 'number' },
                 imagem: {
                     type: 'string',
                     format: 'binary',
                 },
             },
         },
     })
     @UseInterceptors(FileInterceptor('imagem'))
     async update(
         @Param('id') id: string,
         @Body() updateProductDto: CreateProductDto,
         @UploadedFile() file?: Express.Multer.File,
     ) {
         const productId = parseInt(id, 10);
         if (isNaN(productId)) {
             throw new BadRequestException('Invalid product ID');
         }
 
         // Adicione logs para depuração
         console.log('Dados recebidos:', {
             id: productId,
             body: updateProductDto,
             hasFile: !!file
         });
 
         try {
             const imagePath = file ? file.path : undefined;
 
             if (typeof updateProductDto.preco === 'string') {
                 updateProductDto.preco = Number(updateProductDto.preco);
             }
 
             return await this.productsService.update(productId, updateProductDto, imagePath);
         } catch (error) {
             console.error('Erro ao atualizar produto:', error);
             throw error; // NestJS vai converter para a resposta HTTP apropriada
         }
     } */

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a product by ID' })
    @ApiParam({ name: 'id', type: Number, description: 'Product ID' })
    @ApiResponse({ status: 200, description: 'Product deleted successfully' })
    @ApiResponse({ status: 400, description: 'Invalid ID or product is referenced elsewhere' })
    @ApiResponse({ status: 404, description: 'Product not found' })
    async remove(@Param('id') id: string) {
        const productId = parseInt(id, 10);
        if (isNaN(productId)) {
            throw new BadRequestException('Invalid product ID');
        }

        try {
            await this.productsService.remove(productId);
            return { message: 'Product deleted successfully' };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            console.error('Error deleting product:', error);
            throw new BadRequestException(error.message || 'Error deleting product');
        }
    }
}