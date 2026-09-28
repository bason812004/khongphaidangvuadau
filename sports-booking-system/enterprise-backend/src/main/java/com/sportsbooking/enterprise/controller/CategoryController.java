package com.sportsbooking.enterprise.controller;

import com.sportsbooking.enterprise.dto.ApiResponse;
import com.sportsbooking.enterprise.model.Category;
import com.sportsbooking.enterprise.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCategories(
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "isActive", required = false) Boolean isActive,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sortBy", defaultValue = "display_order") String sortBy,
            @RequestParam(value = "direction", defaultValue = "asc") String direction
    ) {
        Map<String, Object> result = categoryService.searchCategories(name, isActive, page, size, sortBy, direction);
        return ResponseEntity.ok(ApiResponse.ok(result, "Categories retrieved with MyBatis successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Category>> getCategoryById(@PathVariable Long id) {
        Category category = categoryService.getCategoryById(id);
        if (category == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Category not found"));
        }
        return ResponseEntity.ok(ApiResponse.ok(category));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Category>> createCategory(@RequestBody Category category) {
        Category created = categoryService.createCategory(category);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(created, "Category created successfully via MyBatis"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Category>> updateCategory(@PathVariable Long id, @RequestBody Category category) {
        Category updated = categoryService.updateCategory(id, category);
        return ResponseEntity.ok(ApiResponse.ok(updated, "Category updated successfully via MyBatis"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Category deleted successfully via MyBatis"));
    }

    @PostMapping("/batch-delete")
    public ResponseEntity<ApiResponse<Void>> batchDelete(@RequestBody List<Long> ids) {
        categoryService.batchDelete(ids);
        return ResponseEntity.ok(ApiResponse.ok(null, "Categories batch-deleted successfully via MyBatis"));
    }
}
