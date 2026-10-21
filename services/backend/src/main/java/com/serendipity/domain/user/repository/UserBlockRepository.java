package com.serendipity.domain.user.repository;

import com.serendipity.domain.user.entity.User;
import com.serendipity.domain.user.entity.UserBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserBlockRepository extends JpaRepository<UserBlock, UUID> {
    List<UserBlock> findByUserOrderByCreatedAtDesc(User user);
    boolean existsByUserAndBlockedUser(User user, User blockedUser);
    Optional<UserBlock> findByUserAndBlockedUser(User user, User blockedUser);

    @Query("SELECT b.blockedUser.id FROM UserBlock b WHERE b.user.id = :userId")
    List<UUID> findBlockedUserIdsByUserId(@Param("userId") UUID userId);
}
