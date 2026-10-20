package com.serendipity.domain.user.entity;

import com.serendipity.global.common.BaseTimeEntity;
import io.hypersistence.utils.hibernate.type.array.ListArrayType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class User extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "phone", length = 20, nullable = false, unique = true)
    private String phone;

    @Column(name = "password_hash", length = 255, nullable = false)
    private String passwordHash;

    @Column(name = "name", length = 50, nullable = false)
    private String name;

    @Column(name = "nickname", length = 50, nullable = false)
    private String nickname;

    @Column(name = "birth_year", nullable = false)
    private Integer birthYear;

    @Column(name = "gender", length = 1, nullable = false)
    private String gender;

    @Column(name = "job", length = 100, nullable = false)
    private String job;

    @Column(name = "instagram_id", length = 50)
    private String instagramId;

    @Column(name = "mbti", length = 4)
    private String mbti;

    @Type(ListArrayType.class)
    @Column(name = "interests", columnDefinition = "text[]")
    @Builder.Default
    private List<String> interests = new ArrayList<>();

    @Type(ListArrayType.class)
    @Column(name = "my_tendencies", columnDefinition = "text[]")
    @Builder.Default
    private List<String> myTendencies = new ArrayList<>();

    @Type(ListArrayType.class)
    @Column(name = "preferred_tendencies", columnDefinition = "text[]")
    @Builder.Default
    private List<String> preferredTendencies = new ArrayList<>();

    @Type(ListArrayType.class)
    @Column(name = "budget_ranges", columnDefinition = "text[]")
    @Builder.Default
    private List<String> budgetRanges = new ArrayList<>();

    @Column(name = "food_restrictions", columnDefinition = "TEXT")
    private String foodRestrictions;

    @Column(name = "manner_temp", precision = 3, scale = 1)
    @Builder.Default
    private BigDecimal mannerTemp = new BigDecimal("36.5");

    @Column(name = "strike_count")
    @Builder.Default
    private Integer strikeCount = 0;

    @Column(name = "role", length = 20, nullable = false)
    @Builder.Default
    private String role = "ROLE_USER";

    public void updateProfile(String nickname, String job, String instagramId, String mbti,
                              List<String> interests, List<String> myTendencies,
                              List<String> preferredTendencies, List<String> budgetRanges,
                              String foodRestrictions) {
        if (nickname != null) this.nickname = nickname;
        if (job != null) this.job = job;
        if (instagramId != null) this.instagramId = instagramId;
        if (mbti != null) this.mbti = mbti;
        if (interests != null) this.interests = interests;
        if (myTendencies != null) this.myTendencies = myTendencies;
        if (preferredTendencies != null) this.preferredTendencies = preferredTendencies;
        if (budgetRanges != null) this.budgetRanges = budgetRanges;
        if (foodRestrictions != null) this.foodRestrictions = foodRestrictions;
    }

    public void updatePassword(String newPasswordHash) {
        this.passwordHash = newPasswordHash;
    }

    public void increaseStrike() {
        this.strikeCount = (this.strikeCount == null ? 0 : this.strikeCount) + 1;
    }

    public void updateMannerTemp(BigDecimal delta) {
        if (this.mannerTemp == null) {
            this.mannerTemp = new BigDecimal("36.5");
        }
        this.mannerTemp = this.mannerTemp.add(delta);
    }
}
