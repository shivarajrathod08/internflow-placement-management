package com.internflow.modules.offer;

import com.internflow.modules.application.ApplicationStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("local")
@Transactional
@DisplayName("Offer Management Integration Tests")
class OfferIntegrationTest {

    @Autowired
    private OfferService offerService;

    @Autowired
    private OfferRepository offerRepository;

    @Test
    @DisplayName("Should successfully issue an offer and record student acceptance")
    void testOfferLifecycle() {
        CreateOfferRequest request = new CreateOfferRequest();
        request.setApplicationId(3L); // Emily Watson applying to Microsoft (Selected)
        request.setDesignation("AI Research Intern");
        request.setCtcOrStipend(new BigDecimal("150000.00"));
        request.setJoiningDate(LocalDateTime.now().plusMonths(2));
        request.setOfferLetterUrl("https://internflow.edu/docs/offers/msft_emily.pdf");

        OfferDTO offer = offerService.createOffer(request, 4L); // Microsoft recruiter user ID 4

        assertNotNull(offer.getId());
        assertEquals(OfferStatus.OFFERED, offer.getStatus());
        assertEquals("AI Research Intern", offer.getDesignation());

        // Student (user ID 6, Emily Watson) accepts the offer
        UpdateOfferStatusRequest acceptRequest = new UpdateOfferStatusRequest();
        acceptRequest.setStatus(OfferStatus.ACCEPTED);
        acceptRequest.setResponseNotes("Delighted to accept the offer!");

        OfferDTO accepted = offerService.updateOfferStatus(offer.getId(), acceptRequest, 6L);

        assertEquals(OfferStatus.ACCEPTED, accepted.getStatus());
        assertEquals("Delighted to accept the offer!", accepted.getResponseNotes());
    }

    @Test
    @DisplayName("Should prevent cross-company recruiter from issuing offer for competitor application")
    void testCrossCompanyOfferCreationForbidden() {
        CreateOfferRequest request = new CreateOfferRequest();
        request.setApplicationId(3L); // Application to Microsoft
        request.setDesignation("Rogue Offer");
        request.setCtcOrStipend(new BigDecimal("100000.00"));
        request.setJoiningDate(LocalDateTime.now().plusMonths(2));

        // Google recruiter (user 2) attempts to issue offer for Microsoft posting
        assertThrows(com.internflow.exception.ForbiddenException.class, () ->
                offerService.createOffer(request, 2L));
    }

    @Test
    @DisplayName("Should prevent cross-company recruiter from inspecting competitor offers (BOLA/IDOR)")
    void testCrossCompanyOfferQueryingForbidden() {
        // Microsoft is company ID 3. Google recruiter (user 2) tries to query company 3's offers.
        assertThrows(com.internflow.exception.ForbiddenException.class, () ->
                offerService.getOffersByCompanyEntityId(3L, 2L, com.internflow.modules.user.Role.COMPANY));

        // Microsoft recruiter (user 4) or TPO should succeed
        assertDoesNotThrow(() ->
                offerService.getOffersByCompanyEntityId(3L, 4L, com.internflow.modules.user.Role.COMPANY));
        assertDoesNotThrow(() ->
                offerService.getOffersByCompanyEntityId(3L, 8L, com.internflow.modules.user.Role.TPO));
    }

    @Test
    @DisplayName("Should prevent unauthorized student from responding to another candidate's offer")
    void testUnauthorizedStudentCannotAcceptOffer() {
        // Offer 1 belongs to student 1 (Alex Rivera, user 5)
        UpdateOfferStatusRequest acceptRequest = new UpdateOfferStatusRequest();
        acceptRequest.setStatus(OfferStatus.ACCEPTED);

        // David Kim (user 7) tries to accept Alex's offer
        assertThrows(com.internflow.exception.ForbiddenException.class, () ->
                offerService.updateOfferStatus(1L, acceptRequest, 7L));
    }
}
