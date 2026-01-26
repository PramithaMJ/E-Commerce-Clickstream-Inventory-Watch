package com.ecommerce.clickstream.service.impl;

import com.ecommerce.clickstream.dto.ProductDTO;
import com.ecommerce.clickstream.exception.ResourceNotFoundException;
import com.ecommerce.clickstream.mapper.ProductMapper;
import com.ecommerce.clickstream.repository.ProductRepository;
import com.ecommerce.clickstream.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Product Service Implementation.
 * 
 * Implements business logic for product operations.
 * Uses Repository Pattern for data access.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProductServiceImpl implements ProductService {
    
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    
    @Override
    @Cacheable("products")
    public List<ProductDTO> getAllProducts() {
        log.debug("Fetching all products");
        return productRepository.findAll().stream()
                .map(productMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public ProductDTO getProductById(String id) {
        log.debug("Fetching product by id: {}", id);
        return productRepository.findById(id)
                .map(productMapper::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }
    
    @Override
    public List<ProductDTO> getProductsByCategory(String category) {
        log.debug("Fetching products by category: {}", category);
        return productRepository.findByCategory(category).stream()
                .map(productMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<ProductDTO> searchProducts(String query) {
        log.debug("Searching products with query: {}", query);
        return productRepository.search(query).stream()
                .map(productMapper::toDTO)
                .collect(Collectors.toList());
    }
}
