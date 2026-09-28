package com.sportsbooking.enterprise.service.impl;

import com.sportsbooking.enterprise.dto.CategorySearchCriteria;
import com.sportsbooking.enterprise.mapper.CategoryMapper;
import com.sportsbooking.enterprise.model.Category;
import com.sportsbooking.enterprise.service.CategoryService;
import com.sportsbooking.enterprise.service.RedisCacheService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryMapper categoryMapper;
    private final RedisCacheService cacheService;

    private static final String CACHE_KEY_PREFIX = "sports:category:";
    private static final String ALL_CATEGORIES_CACHE = "sports:categories:all";

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> searchCategories(String name, Boolean isActive, int page, int size, String sortBy, String direction) {
        int offset = page * size;
        CategorySearchCriteria criteria = CategorySearchCriteria.builder()
                .name(name)
                .isActive(isActive)
                .offset(offset)
                .limit(size)
                .sortColumn(sortBy != null && !sortBy.isBlank() ? sortBy : "display_order")
                .sortDirection(direction != null && direction.equalsIgnoreCase("desc") ? "DESC" : "ASC")
                .build();

        List<Category> list = categoryMapper.findByCriteria(criteria);
        long total = categoryMapper.countByCriteria(criteria);

        Map<String, Object> response = new HashMap<>();
        response.put("content", list);
        response.put("totalElements", total);
        response.put("totalPages", (int) Math.ceil((double) total / size));
        response.put("currentPage", page);
        response.put("pageSize", size);

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public Category getCategoryById(Long id) {
        String cacheKey = CACHE_KEY_PREFIX + id;
        Object cached = cacheService.get(cacheKey);
        if (cached instanceof Category) {
            log.info("Cache-Aside Hit for category id: {}", id);
            return (Category) cached;
        }

        log.info("Cache-Aside Miss for category id: {}. Querying via MyBatis...", id);
        Category category = categoryMapper.findById(id);
        if (category != null) {
            cacheService.set(cacheKey, category, 1, TimeUnit.HOURS);
        }
        return category;
    }

    @Override
    public Category createCategory(Category category) {
        if (category.getSlug() == null || category.getSlug().isBlank()) {
            category.setSlug(category.getName().toLowerCase().replaceAll("[^a-z0-9]", "-"));
        }
        if (category.getIsActive() == null) {
            category.setIsActive(true);
        }
        if (category.getDisplayOrder() == null) {
            category.setDisplayOrder(0);
        }
        categoryMapper.insert(category);
        cacheService.delete(ALL_CATEGORIES_CACHE);
        return category;
    }

    @Override
    public Category updateCategory(Long id, Category category) {
        category.setId(id);
        categoryMapper.update(category);
        cacheService.delete(CACHE_KEY_PREFIX + id);
        cacheService.delete(ALL_CATEGORIES_CACHE);
        return categoryMapper.findById(id);
    }

    @Override
    public void deleteCategory(Long id) {
        categoryMapper.deleteById(id);
        cacheService.delete(CACHE_KEY_PREFIX + id);
        cacheService.delete(ALL_CATEGORIES_CACHE);
    }

    @Override
    public void batchDelete(List<Long> ids) {
        if (ids != null && !ids.isEmpty()) {
            categoryMapper.batchDelete(ids);
            for (Long id : ids) {
                cacheService.delete(CACHE_KEY_PREFIX + id);
            }
            cacheService.delete(ALL_CATEGORIES_CACHE);
        }
    }

    @Override
    public int batchInsert(List<Category> categories) {
        if (categories == null || categories.isEmpty()) return 0;
        int count = categoryMapper.batchInsert(categories);
        cacheService.delete(ALL_CATEGORIES_CACHE);
        return count;
    }
}
