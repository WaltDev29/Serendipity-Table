package com.serendipity.domain.venue.repository;

import com.serendipity.domain.venue.entity.Venue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface VenueRepository extends JpaRepository<Venue, UUID> {
    List<Venue> findByRegion(String region);
}
