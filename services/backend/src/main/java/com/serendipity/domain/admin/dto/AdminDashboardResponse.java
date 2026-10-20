package com.serendipity.domain.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse {
    private long totalUsers;
    private long currentApplications;
    private long activeTables;
    private long totalVenues;
    private long pendingInquiries;
}
