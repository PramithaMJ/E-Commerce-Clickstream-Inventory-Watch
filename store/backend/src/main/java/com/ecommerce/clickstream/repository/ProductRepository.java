package com.ecommerce.clickstream.repository;

import com.ecommerce.clickstream.model.Product;

import java.util.List;
import java.util.Optional;

/**
 * Product Repository Interface.
 * 
 * Follows Repository Pattern for data access abstraction.
 * Allows easy switching between in-memory, database, or external API implementations.
 */
public interface ProductRepository {
    
    /**
     * Find all products.
     * 
     * @return List of all products
     */
    List<Product> findAll();
    
    /**
     * Find product by ID.
     * 
     * @param id Product ID
     * @return Optional containing the product if found
     */
    Optional<Product> findById(String id);
    
    /**
     * Find products by category.
     * 
     * @param category Product category
     * @return List of products in the category
     */
    List<Product> findByCategory(String category);
    
    /**
     * Search products by name or description.
     * 
     * @param query Search query
     * @return List of matching products
     */
    List<Product> search(String query);
    
    /**
     * Check if product is in stock.
     * 
     * @param productId Product ID
     * @return true if in stock, false otherwise
     */
    boolean isInStock(String productId);
}
