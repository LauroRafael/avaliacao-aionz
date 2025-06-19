import { IsString, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateProductDto {
    @ApiProperty({ description: 'Nome do produto' })
    @IsString()
    @IsNotEmpty()
    nome: string;

    @ApiProperty({ description: 'Descrição do produto' })
    @IsString()
    @IsNotEmpty()
    descricao: string;

    @ApiProperty({ description: 'Preço do produto' })
    @IsNumber()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value)) // Converte string para número
    preco: number;
}