package com.serendipity.domain.dining.repository;

import com.serendipity.domain.dining.entity.DiningTable;
import com.serendipity.domain.dining.entity.SecretChemistry;
import com.serendipity.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SecretChemistryRepository extends JpaRepository<SecretChemistry, UUID> {
    Optional<SecretChemistry> findByDiningTableAndSender(DiningTable diningTable, User sender);
    Optional<SecretChemistry> findByDiningTableAndSenderAndTarget(DiningTable diningTable, User sender, User target);
}
