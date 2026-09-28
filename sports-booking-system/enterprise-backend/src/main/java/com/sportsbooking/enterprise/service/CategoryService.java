package com.sportsbooking.enterprise.service;

import com.sportsbooking.enterprise.dto.CategorySearchCriteria;
import com.sportsbooking.enterprise.model.Category;

import java.util.List;
import java.util.Map;

public interface CategoryService {
    Map<String, Object> searchCategories(String name, Boolean isActive, int page, int size, String sortBy, String direction);
    Category getCategoryById(Long id);
    Category createCategory(Category category);
    Category updateCategory(Long id, Category category);
    void deleteCategory(Long id);
    void batchDelete(List<Long> ids);
    int batchInsert(List<Category> categories);
}
