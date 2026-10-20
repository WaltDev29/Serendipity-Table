package com.serendipity.domain.cs.repository;

import com.serendipity.domain.cs.entity.CsInquiry;
import com.serendipity.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CsInquiryRepository extends JpaRepository<CsInquiry, UUID> {
    List<CsInquiry> findByUserOrderByCreatedAtDesc(User user);
    List<CsInquiry> findAllByOrderByCreatedAtDesc();
}
