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
}
