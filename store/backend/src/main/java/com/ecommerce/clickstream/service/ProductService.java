package com.ecommerce.clickstream.service;

import com.ecommerce.clickstream.dto.ProductDTO;

import java.util.List;

/**
 * Product Service Interface.
 * 
 * Defines business logic contract for product operations.
 */
public interface ProductService {
    
    /**
     * Get all products.
     * 
     * @return List of product DTOs
     */
    List<ProductDTO> getAllProducts();
    
    /**
     * Get product by ID.
     * 
     * @param id Product ID
     * @return Product DTO
     */
    ProductDTO getProductById(String id);
    
    /**
     * Get products by category.
     * 
     * @param category Category name
     * @return List of product DTOs
     */
    List<ProductDTO> getProductsByCategory(String category);
    
    /**
     * Search products.
     * 
     * @param query Search query
     * @return List of matching product DTOs
     */
    List<ProductDTO> searchProducts(String query);
}
