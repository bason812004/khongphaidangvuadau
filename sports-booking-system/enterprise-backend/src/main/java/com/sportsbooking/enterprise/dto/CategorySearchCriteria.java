package com.sportsbooking.enterprise.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategorySearchCriteria {
    private String name;
    private Boolean isActive;
    private List<Long> ids;
    private int offset;
    private int limit;
    private String sortColumn;
    private String sortDirection;
}
