package com.serendipity.domain.venue.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "venues")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Venue {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @Column(name = "region", length = 30, nullable = false)
    private String region;

    @Column(name = "address", length = 255, nullable = false)
    private String address;

    @Column(name = "map_url", length = 255)
    private String mapUrl;

    @Column(name = "naver_map_url", length = 255)
    private String naverMapUrl;

    @Column(name = "representative_menu", length = 100)
    private String representativeMenu;

    @Column(name = "avg_price")
    private Integer avgPrice;

    @Column(name = "capacity_tables", nullable = false)
    @Builder.Default
    private Integer capacityTables = 1;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "is_reserved", nullable = false)
    @Builder.Default
    private Boolean isReserved = false;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public void updateReservationStatus(boolean isReserved) {
        this.isReserved = isReserved;
    }
}
