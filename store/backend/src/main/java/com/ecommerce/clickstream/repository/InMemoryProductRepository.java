package com.ecommerce.clickstream.repository;

import com.ecommerce.clickstream.model.Product;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * In-Memory Product Repository Implementation.
 * 
 * Thread-safe implementation using ConcurrentHashMap.
 * Pre-loaded with sample electronics inventory.
 */
@Repository
public class InMemoryProductRepository implements ProductRepository {
    
    private final Map<String, Product> productStore;
    
    public InMemoryProductRepository() {
        this.productStore = new ConcurrentHashMap<>();
        initializeProducts();
    }
    
    @Override
    public List<Product> findAll() {
        return new ArrayList<>(productStore.values());
    }
    
    @Override
    public Optional<Product> findById(String id) {
        return Optional.ofNullable(productStore.get(id));
    }
    
    @Override
    public List<Product> findByCategory(String category) {
        return productStore.values().stream()
                .filter(p -> p.getCategory().equalsIgnoreCase(category))
                .collect(Collectors.toList());
    }
    
    @Override
    public List<Product> search(String query) {
        String lowerQuery = query.toLowerCase();
        return productStore.values().stream()
                .filter(p -> p.getName().toLowerCase().contains(lowerQuery) ||
                            p.getDescription().toLowerCase().contains(lowerQuery) ||
                            p.getCategory().toLowerCase().contains(lowerQuery))
                .collect(Collectors.toList());
    }
    
    @Override
    public boolean isInStock(String productId) {
        return findById(productId)
                .map(p -> p.getStock() != null && p.getStock() > 0)
                .orElse(false);
    }
    
    private void initializeProducts() {
        // Smartphones
        addProduct(Product.builder()
                .id("PROD_001")
                .name("iPhone 15 Pro Max")
                .description("Latest Apple flagship with A17 Pro chip, titanium design, and advanced camera system")
                .price(new BigDecimal("1199.99"))
                .category("smartphones")
                .imageUrl("https://images.unsplash.com/photo-1696446702061-cbd2e6bda458?w=500")
                .stock(45)
                .rating(4.8)
                .features(Arrays.asList("A17 Pro Chip", "48MP Camera", "Titanium Design", "USB-C"))
                .build());
        
        addProduct(Product.builder()
                .id("PROD_002")
                .name("Samsung Galaxy S24 Ultra")
                .description("Premium Android flagship with AI features, S Pen, and incredible 200MP camera")
                .price(new BigDecimal("1299.99"))
                .category("smartphones")
                .imageUrl("https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500")
                .stock(38)
                .rating(4.7)
                .features(Arrays.asList("200MP Camera", "S Pen", "AI Features", "5000mAh Battery"))
                .build());
        
        addProduct(Product.builder()
                .id("PROD_003")
                .name("Google Pixel 8 Pro")
                .description("Pure Android experience with best-in-class AI photography and Google integration")
                .price(new BigDecimal("999.99"))
                .category("smartphones")
                .imageUrl("https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500")
                .stock(52)
                .rating(4.6)
                .features(Arrays.asList("Google Tensor G3", "Magic Eraser", "7 Years Updates", "AI Assistant"))
                .build());
        
        // Laptops
        addProduct(Product.builder()
                .id("PROD_004")
                .name("MacBook Pro 16\" M3 Max")
                .description("Ultimate performance laptop for professionals with M3 Max chip and stunning display")
                .price(new BigDecimal("3499.99"))
                .category("laptops")
                .imageUrl("https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500")
                .stock(28)
                .rating(4.9)
                .features(Arrays.asList("M3 Max Chip", "36GB RAM", "1TB SSD", "Liquid Retina XDR"))
                .build());
        
        addProduct(Product.builder()
                .id("PROD_005")
                .name("Dell XPS 15")
                .description("Premium Windows laptop with gorgeous OLED display and powerful Intel Core i9")
                .price(new BigDecimal("2299.99"))
                .category("laptops")
                .imageUrl("https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500")
                .stock(35)
                .rating(4.7)
                .features(Arrays.asList("Intel Core i9", "32GB RAM", "1TB SSD", "OLED Display"))
                .build());
        
        addProduct(Product.builder()
                .id("PROD_006")
                .name("Lenovo ThinkPad X1 Carbon")
                .description("Business ultrabook with legendary keyboard and enterprise security features")
                .price(new BigDecimal("1899.99"))
                .category("laptops")
                .imageUrl("https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500")
                .stock(42)
                .rating(4.5)
                .features(Arrays.asList("Intel Core i7", "16GB RAM", "512GB SSD", "14\" Display"))
                .build());
        
        // Tablets
        addProduct(Product.builder()
                .id("PROD_007")
                .name("iPad Pro 12.9\" M2")
                .description("Most powerful tablet with M2 chip, ProMotion display, and Apple Pencil support")
                .price(new BigDecimal("1099.99"))
                .category("tablets")
                .imageUrl("https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500")
                .stock(31)
                .rating(4.8)
                .features(Arrays.asList("M2 Chip", "12.9\" Display", "Apple Pencil", "Face ID"))
                .build());
        
        addProduct(Product.builder()
                .id("PROD_008")
                .name("Samsung Galaxy Tab S9 Ultra")
                .description("Premium Android tablet with massive display and included S Pen")
                .price(new BigDecimal("1199.99"))
                .category("tablets")
                .imageUrl("https://images.unsplash.com/photo-1561154464-82e9adf32764?w=500")
                .stock(25)
                .rating(4.6)
                .features(Arrays.asList("14.6\" Display", "S Pen Included", "IP68 Rating", "Snapdragon 8 Gen 2"))
                .build());
        
        // Audio
        addProduct(Product.builder()
                .id("PROD_009")
                .name("Sony WH-1000XM5")
                .description("Industry-leading noise cancellation with exceptional sound quality")
                .price(new BigDecimal("399.99"))
                .category("audio")
                .imageUrl("https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500")
                .stock(67)
                .rating(4.9)
                .features(Arrays.asList("Noise Cancellation", "30hr Battery", "LDAC Support", "Multipoint"))
                .build());
        
        addProduct(Product.builder()
                .id("PROD_010")
                .name("AirPods Pro (2nd Gen)")
                .description("Apple's premium earbuds with adaptive audio and lossless sound")
                .price(new BigDecimal("249.99"))
                .category("audio")
                .imageUrl("https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=500")
                .stock(89)
                .rating(4.7)
                .features(Arrays.asList("Adaptive Audio", "Transparency Mode", "Find My", "USB-C"))
                .build());
        
        addProduct(Product.builder()
                .id("PROD_011")
                .name("Bose QuietComfort Ultra")
                .description("Premium comfort with world-class noise cancellation and spatial audio")
                .price(new BigDecimal("429.99"))
                .category("audio")
                .imageUrl("https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500")
                .stock(45)
                .rating(4.6)
                .features(Arrays.asList("Spatial Audio", "24hr Battery", "Comfortable Fit", "CustomTune"))
                .build());
        
        // Gaming
        addProduct(Product.builder()
                .id("PROD_012")
                .name("PlayStation 5")
                .description("Next-gen gaming console with stunning graphics and exclusive titles")
                .price(new BigDecimal("499.99"))
                .category("gaming")
                .imageUrl("https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500")
                .stock(23)
                .rating(4.8)
                .features(Arrays.asList("4K Gaming", "Ray Tracing", "825GB SSD", "DualSense Controller"))
                .build());
        
        addProduct(Product.builder()
                .id("PROD_013")
                .name("Xbox Series X")
                .description("Most powerful Xbox with Game Pass and backward compatibility")
                .price(new BigDecimal("499.99"))
                .category("gaming")
                .imageUrl("https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=500")
                .stock(28)
                .rating(4.7)
                .features(Arrays.asList("12 TFLOPS GPU", "1TB SSD", "Game Pass", "Quick Resume"))
                .build());
        
        addProduct(Product.builder()
                .id("PROD_014")
                .name("Nintendo Switch OLED")
                .description("Versatile gaming with vibrant OLED screen for home and portable play")
                .price(new BigDecimal("349.99"))
                .category("gaming")
                .imageUrl("https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=500")
                .stock(56)
                .rating(4.6)
                .features(Arrays.asList("7\" OLED Screen", "Portable/Docked", "64GB Storage", "Joy-Cons"))
                .build());
        
        // Accessories
        addProduct(Product.builder()
                .id("PROD_015")
                .name("Logitech MX Master 3S")
                .description("Premium wireless mouse for productivity with customizable buttons")
                .price(new BigDecimal("99.99"))
                .category("accessories")
                .imageUrl("https://images.unsplash.com/photo-1527814050087-3793815479db?w=500")
                .stock(124)
                .rating(4.8)
                .features(Arrays.asList("8K DPI", "Quiet Clicks", "Multi-Device", "70-day Battery"))
                .build());
        
        addProduct(Product.builder()
                .id("PROD_016")
                .name("Keychron K8 Pro")
                .description("Wireless mechanical keyboard with hot-swappable switches")
                .price(new BigDecimal("109.99"))
                .category("accessories")
                .imageUrl("https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500")
                .stock(78)
                .rating(4.7)
                .features(Arrays.asList("Hot-Swappable", "RGB Backlight", "Wireless", "Mac/Windows"))
                .build());
        
        addProduct(Product.builder()
                .id("PROD_017")
                .name("Anker PowerCore 20000")
                .description("High-capacity power bank for all your devices")
                .price(new BigDecimal("49.99"))
                .category("accessories")
                .imageUrl("https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500")
                .stock(156)
                .rating(4.6)
                .features(Arrays.asList("20000mAh", "Fast Charging", "2 USB Ports", "Compact Design"))
                .build());
        
        addProduct(Product.builder()
                .id("PROD_018")
                .name("Apple USB-C Cable 2m")
                .description("Fast charging cable with MFi certification")
                .price(new BigDecimal("29.99"))
                .category("accessories")
                .imageUrl("https://images.unsplash.com/photo-1592059729417-a6229c3f3e4e?w=500")
                .stock(234)
                .rating(4.4)
                .features(Arrays.asList("USB-C", "2m Length", "Fast Charge", "Durable"))
                .build());
    }
    
    private void addProduct(Product product) {
        productStore.put(product.getId(), product);
    }
}
