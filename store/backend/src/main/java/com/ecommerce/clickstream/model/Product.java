package com.ecommerce.clickstream.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * Product Model for the Electronics Store.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    
    private String id;
    private String name;
    private String description;
    private BigDecimal price;
    private String category;
    private String imageUrl;
    private Integer stock;
    private Double rating;
    private List<String> features;
    
    /**
     * Get sample products for the electronics store.
     */
    public static List<Product> getSampleProducts() {
        return List.of(
            // Smartphones
            Product.builder()
                .id("PROD_001")
                .name("iPhone 15 Pro Max")
                .description("Latest Apple flagship with A17 Pro chip")
                .price(new BigDecimal("1199.99"))
                .category("smartphones")
                .imageUrl("/images/iphone15.png")
                .stock(50)
                .rating(4.8)
                .features(List.of("A17 Pro Chip", "48MP Camera", "Titanium Design"))
                .build(),
            Product.builder()
                .id("PROD_002")
                .name("Samsung Galaxy S24 Ultra")
                .description("Premium Android with AI features")
                .price(new BigDecimal("1299.99"))
                .category("smartphones")
                .imageUrl("/images/galaxy-s24.png")
                .stock(45)
                .rating(4.7)
                .features(List.of("Snapdragon 8 Gen 3", "200MP Camera", "S Pen"))
                .build(),
            Product.builder()
                .id("PROD_003")
                .name("Google Pixel 8 Pro")
                .description("Pure Android experience with AI magic")
                .price(new BigDecimal("999.99"))
                .category("smartphones")
                .imageUrl("/images/pixel8.png")
                .stock(30)
                .rating(4.6)
                .features(List.of("Tensor G3", "AI Photo Editing", "7 Years Updates"))
                .build(),
                
            // Laptops
            Product.builder()
                .id("PROD_010")
                .name("MacBook Pro 16\"")
                .description("M3 Max chip for professionals")
                .price(new BigDecimal("3499.99"))
                .category("laptops")
                .imageUrl("/images/macbook-pro.png")
                .stock(20)
                .rating(4.9)
                .features(List.of("M3 Max", "36GB RAM", "1TB SSD"))
                .build(),
            Product.builder()
                .id("PROD_011")
                .name("Dell XPS 15")
                .description("Premium Windows ultrabook")
                .price(new BigDecimal("1899.99"))
                .category("laptops")
                .imageUrl("/images/dell-xps.png")
                .stock(25)
                .rating(4.5)
                .features(List.of("Intel i9", "OLED Display", "32GB RAM"))
                .build(),
                
            // Tablets
            Product.builder()
                .id("PROD_020")
                .name("iPad Pro 12.9\"")
                .description("M2 chip tablet for creatives")
                .price(new BigDecimal("1099.99"))
                .category("tablets")
                .imageUrl("/images/ipad-pro.png")
                .stock(35)
                .rating(4.8)
                .features(List.of("M2 Chip", "Liquid Retina XDR", "Face ID"))
                .build(),
                
            // Gaming
            Product.builder()
                .id("PROD_030")
                .name("PlayStation 5")
                .description("Next-gen gaming console")
                .price(new BigDecimal("499.99"))
                .category("gaming")
                .imageUrl("/images/ps5.png")
                .stock(15)
                .rating(4.9)
                .features(List.of("4K 120fps", "DualSense", "825GB SSD"))
                .build(),
            Product.builder()
                .id("PROD_031")
                .name("Nintendo Switch OLED")
                .description("Portable gaming hybrid")
                .price(new BigDecimal("349.99"))
                .category("gaming")
                .imageUrl("/images/switch.png")
                .stock(40)
                .rating(4.7)
                .features(List.of("7\" OLED Screen", "64GB Storage", "Handheld Mode"))
                .build(),
                
            // Audio
            Product.builder()
                .id("PROD_040")
                .name("AirPods Pro 2")
                .description("Active noise cancellation earbuds")
                .price(new BigDecimal("249.99"))
                .category("audio")
                .imageUrl("/images/airpods.png")
                .stock(100)
                .rating(4.8)
                .features(List.of("ANC", "Adaptive Audio", "USB-C"))
                .build(),
            Product.builder()
                .id("PROD_041")
                .name("Sony WH-1000XM5")
                .description("Premium noise cancelling headphones")
                .price(new BigDecimal("399.99"))
                .category("audio")
                .imageUrl("/images/sony-xm5.png")
                .stock(30)
                .rating(4.9)
                .features(List.of("30hr Battery", "LDAC", "Multipoint"))
                .build(),
                
            // Accessories
            Product.builder()
                .id("PROD_050")
                .name("Apple Watch Ultra 2")
                .description("Rugged smartwatch for adventure")
                .price(new BigDecimal("799.99"))
                .category("accessories")
                .imageUrl("/images/watch-ultra.png")
                .stock(25)
                .rating(4.7)
                .features(List.of("49mm Titanium", "Dual GPS", "100m Water"))
                .build(),
            Product.builder()
                .id("PROD_051")
                .name("MagSafe Charger")
                .description("Wireless charging for iPhone")
                .price(new BigDecimal("39.99"))
                .category("accessories")
                .imageUrl("/images/magsafe.png")
                .stock(200)
                .rating(4.5)
                .features(List.of("15W Fast Charge", "Magnetic Align"))
                .build()
        );
    }
}
