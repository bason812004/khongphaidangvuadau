package com.sportsbooking.enterprise.mapper;

import com.sportsbooking.enterprise.dto.CategorySearchCriteria;
import com.sportsbooking.enterprise.model.Category;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface CategoryMapper {
    List<Category> findByCriteria(CategorySearchCriteria criteria);
    long countByCriteria(CategorySearchCriteria criteria);
    Category findById(@Param("id") Long id);
    Category findBySlug(@Param("slug") String slug);
    int insert(Category category);
    int update(Category category);
    int deleteById(@Param("id") Long id);
    int batchInsert(@Param("categories") List<Category> categories);
    int batchDelete(@Param("ids") List<Long> ids);
}
