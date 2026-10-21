package com.serendipity.domain.user.repository;

import com.serendipity.domain.user.entity.UserReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface UserReportRepository extends JpaRepository<UserReport, UUID> {
    List<UserReport> findByStatusOrderByCreatedAtDesc(String status);
}
