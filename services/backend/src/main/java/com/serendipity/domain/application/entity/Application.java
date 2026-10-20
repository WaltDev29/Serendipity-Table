package com.serendipity.domain.application.entity;

import com.serendipity.domain.slot.entity.EventSlot;
import com.serendipity.domain.user.entity.User;
import com.serendipity.domain.user.entity.UserTicket;
import com.serendipity.global.common.BaseTimeEntity;
import io.hypersistence.utils.hibernate.type.array.ListArrayType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "applications", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "event_slot_id"})
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Application extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_slot_id", nullable = false)
    private EventSlot eventSlot;

    @Type(ListArrayType.class)
    @Column(name = "preferred_regions", columnDefinition = "text[]", nullable = false)
    @Builder.Default
    private List<String> preferredRegions = new ArrayList<>();

    @Column(name = "status", length = 20, nullable = false)
    @Builder.Default
    private String status = "APPLIED"; // APPLIED, MATCHED, CANCELLED, NOSHOW

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id")
    private UserTicket ticket;

    public void cancel() {
        this.status = "CANCELLED";
    }

    public void matched() {
        this.status = "MATCHED";
    }
}
