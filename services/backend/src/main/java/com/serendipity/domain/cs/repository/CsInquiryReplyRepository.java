package com.serendipity.domain.cs.repository;

import com.serendipity.domain.cs.entity.CsInquiry;
import com.serendipity.domain.cs.entity.CsInquiryReply;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CsInquiryReplyRepository extends JpaRepository<CsInquiryReply, Long> {
    List<CsInquiryReply> findByInquiryOrderByCreatedAtAsc(CsInquiry inquiry);
}
