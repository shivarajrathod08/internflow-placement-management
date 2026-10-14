package com.internflow.modules.placementdrive;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlacementDriveRepository extends JpaRepository<PlacementDrive, Long> {
    Page<PlacementDrive> findAllByOrderByDriveDateAsc(Pageable pageable);
    List<PlacementDrive> findByStatus(PlacementDriveStatus status);
}
