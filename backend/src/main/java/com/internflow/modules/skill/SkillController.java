package com.internflow.modules.skill;

import com.internflow.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skills")
@RequiredArgsConstructor
@Tag(name = "Skills", description = "Endpoints for discovering canonical skills and managing skill aliases")
public class SkillController {

    private final SkillService skillService;

    @GetMapping("/public")
    @Operation(summary = "Get all canonical skills")
    public ResponseEntity<ApiResponse<List<SkillDTO>>> getAllSkills() {
        return ResponseEntity.ok(ApiResponse.ok(skillService.getAllSkills()));
    }

    @GetMapping("/public/search")
    @Operation(summary = "Search skills by keyword")
    public ResponseEntity<ApiResponse<List<SkillDTO>>> searchSkills(@RequestParam(required = false) String query) {
        return ResponseEntity.ok(ApiResponse.ok(skillService.searchSkills(query)));
    }

    @PostMapping("/admin")
    @PreAuthorize("hasAnyRole('ADMIN', 'TPO')")
    @Operation(summary = "Create a new canonical skill with optional aliases (Admin/TPO)")
    public ResponseEntity<ApiResponse<SkillDTO>> createSkill(@Valid @RequestBody CreateSkillRequest request) {
        SkillDTO created = skillService.createSkill(request);
        return new ResponseEntity<>(ApiResponse.ok("Skill created successfully", created), HttpStatus.CREATED);
    }

    @PostMapping("/admin/{id}/aliases")
    @PreAuthorize("hasAnyRole('ADMIN', 'TPO')")
    @Operation(summary = "Add an alias mapping to a canonical skill (Admin)")
    public ResponseEntity<ApiResponse<Void>> addAlias(@PathVariable Long id, @Valid @RequestBody AddAliasRequest request) {
        skillService.addAlias(id, request.getAlias());
        return ResponseEntity.ok(ApiResponse.ok("Alias added successfully", null));
    }

    @Data
    public static class AddAliasRequest {
        private String alias;
    }
}
