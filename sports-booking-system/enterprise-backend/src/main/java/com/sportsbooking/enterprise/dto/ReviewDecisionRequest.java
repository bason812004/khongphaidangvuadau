package com.sportsbooking.enterprise.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDecisionRequest {
    private boolean approved;
    private String reviewerUsername;
    private String note;
}
