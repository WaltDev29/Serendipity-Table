package com.serendipity.domain.dining.repository;

import com.serendipity.domain.dining.entity.DiningFeedback;
import com.serendipity.domain.dining.entity.DiningTable;
import com.serendipity.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DiningFeedbackRepository extends JpaRepository<DiningFeedback, UUID> {
    List<DiningFeedback> findByDiningTableAndReviewer(DiningTable diningTable, User reviewer);
    List<DiningFeedback> findByTargetUser(User targetUser);
}
