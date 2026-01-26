package com.ecommerce.clickstream.controller;

import com.ecommerce.clickstream.dto.ApiResponse;
import com.ecommerce.clickstream.dto.ProductDTO;
import com.ecommerce.clickstream.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Product Controller for Electronics Store.
 * 
 * Presentation layer providing REST API for product operations.
 * Delegates business logic to ProductService.
 */
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Slf4j
public class ProductController {
    
    private final ProductService productService;
    
    /**
     * Get all products.
     * 
     * @return List of all products
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductDTO>>> getAllProducts() {
        log.info("Fetching all products");
        List<ProductDTO> products = productService.getAllProducts();
        return ResponseEntity.ok(ApiResponse.success(products));
    }
    
    /**
     * Get product by ID.
     * 
     * @param id Product ID
     * @return Product details
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDTO>> getProduct(@PathVariable String id) {
        log.info("Fetching product: {}", id);
        ProductDTO product = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success(product));
    }
    
    /**
     * Get products by category.
     * 
     * @param category Product category
     * @return List of products in category
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<List<ProductDTO>>> getByCategory(
            @PathVariable String category) {
        log.info("Fetching products in category: {}", category);
        List<ProductDTO> products = productService.getProductsByCategory(category);
        return ResponseEntity.ok(ApiResponse.success(products));
    }
    
    /**
     * Search products.
     * 
     * @param q Search query
     * @return List of matching products
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ProductDTO>>> searchProducts(
            @RequestParam String q) {
        log.info("Searching products: {}", q);
        List<ProductDTO> results = productService.searchProducts(q);
        return ResponseEntity.ok(ApiResponse.success(results));
    }
}
