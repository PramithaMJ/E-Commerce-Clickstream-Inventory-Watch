package com.ecommerce.clickstream.mapper;

import com.ecommerce.clickstream.dto.ProductDTO;
import com.ecommerce.clickstream.model.Product;
import org.springframework.stereotype.Component;

/**
 * Product Mapper for DTO <-> Entity conversion.
 */
@Component
public class ProductMapper {
    
    public ProductDTO toDTO(Product entity) {
        return ProductDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .price(entity.getPrice())
                .category(entity.getCategory())
                .imageUrl(entity.getImageUrl())
                .stock(entity.getStock())
                .rating(entity.getRating())
                .features(entity.getFeatures())
                .inStock(entity.getStock() != null && entity.getStock() > 0)
                .build();
    }
    
    public Product toEntity(ProductDTO dto) {
        return Product.builder()
                .id(dto.getId())
                .name(dto.getName())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .category(dto.getCategory())
                .imageUrl(dto.getImageUrl())
                .stock(dto.getStock())
                .rating(dto.getRating())
                .features(dto.getFeatures())
                .build();
    }
}
