package com.serendipity.domain.user.repository;

import com.serendipity.domain.user.entity.User;
import com.serendipity.domain.user.entity.UserBlacklist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserBlacklistRepository extends JpaRepository<UserBlacklist, UUID> {
    boolean existsByUser(User user);
    Optional<UserBlacklist> findByUser(User user);
}
