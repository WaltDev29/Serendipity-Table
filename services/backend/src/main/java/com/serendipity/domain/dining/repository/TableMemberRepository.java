package com.serendipity.domain.dining.repository;

import com.serendipity.domain.dining.entity.DiningTable;
import com.serendipity.domain.dining.entity.TableMember;
import com.serendipity.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TableMemberRepository extends JpaRepository<TableMember, UUID> {
    List<TableMember> findByDiningTable(DiningTable diningTable);
    Optional<TableMember> findByDiningTableAndUser(DiningTable diningTable, User user);
    boolean existsByDiningTableAndUser(DiningTable diningTable, User user);

    @Query("SELECT tm FROM TableMember tm JOIN FETCH tm.diningTable dt JOIN FETCH dt.eventSlot es WHERE tm.user = :user ORDER BY es.eventDate DESC")
    List<TableMember> findByUserOrderByEventDateDesc(@Param("user") User user);
}
