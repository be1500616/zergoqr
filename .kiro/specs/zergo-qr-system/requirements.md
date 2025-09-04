# Requirements Document

## Introduction

ZERGO QR is an India-specific restaurant QR ordering system that enables scan-to-checkout flows with UPI-first payments, digital KOT/KDS workflows, and GST-compliant billing. The system addresses the needs of Indian restaurants transitioning from paper menus and manual processes to digital workflows while ensuring compliance with NPCI, DPDP, CERT-In, and FSSAI regulations.

## Requirements

### Requirement 1: Dynamic QR Menu System

**User Story:** As a restaurant diner, I want to scan a QR code at my table and view an updated digital menu with pricing and availability, so that I can browse items without waiting for physical menus.

#### Acceptance Criteria

1. WHEN a diner scans the ZERGO QR code THEN the system SHALL display a responsive menu within 2 seconds on Indian mobile networks
2. WHEN menu items are updated by restaurant staff THEN the system SHALL reflect changes immediately without requiring QR code reprinting
3. WHEN displaying prices THEN the system SHALL show GST-inclusive pricing with correct slab identification (5% standalone, 18% hotel premises)
4. IF the restaurant has 10+ outlets THEN the system SHALL display caloric information per FSSAI requirements
5. WHEN loading on mid-tier Android devices THEN the system SHALL achieve FCP < 1.5s and TTI < 2.0s

### Requirement 2: UPI-First Payment Processing

**User Story:** As a restaurant diner, I want to pay using UPI with instant confirmation, so that I can complete my order quickly and securely.

#### Acceptance Criteria

1. WHEN proceeding to checkout THEN the system SHALL present NPCI-compliant UPI QR codes and intent flows
2. WHEN displaying UPI payment options THEN the system SHALL show UPI ID near the QR code per NPCI guidelines
3. WHEN processing UPI payments THEN the system SHALL achieve ≥95% success rate across supported PSPs
4. IF UPI payment fails THEN the system SHALL provide fallback to RBI-tokenized card payments
5. WHEN payment is completed THEN the system SHALL provide instant confirmation to the diner
6. WHEN digital payments are processed THEN UPI SHALL represent ≥80% of total digital transactions

### Requirement 3: Digital KOT and KDS Integration

**User Story:** As kitchen staff, I want to receive digital KOTs on the KDS with clear customizations and status tracking, so that I can prepare orders efficiently with fewer errors.

#### Acceptance Criteria

1. WHEN an order is placed THEN the system SHALL automatically generate a digital KOT and route it to appropriate KDS stations
2. WHEN displaying orders on KDS THEN the system SHALL show item customizations, modifications, and special instructions clearly
3. WHEN kitchen staff update order status THEN the system SHALL support progression through New → Preparing → Ready → Completed states
4. WHEN multiple items are ordered THEN the system SHALL batch items by cooking station for efficient preparation
5. WHEN KDS is implemented THEN the system SHALL reduce order error rates by >30% and improve throughput by 20%

### Requirement 4: GST-Compliant Billing

**User Story:** As a restaurant owner, I want accurate GST calculation and compliant billing, so that I meet tax obligations and avoid penalties.

#### Acceptance Criteria

1. WHEN generating bills THEN the system SHALL apply correct GST rates (5% standalone restaurants, 18% specified hotel premises)
2. WHEN processing ECO orders THEN the system SHALL handle Section 9(5) GST treatment appropriately
3. WHEN service charges are applied THEN the system SHALL make them optional with clear disclosure per CCPA guidelines
4. WHEN printing invoices THEN the system SHALL include all required GST details and formatting
5. IF restaurant turnover exceeds ₹500 crore THEN the system SHALL support B2C dynamic QR on invoices

### Requirement 5: Accounting System Integration

**User Story:** As a restaurant manager, I want real-time synchronization with my accounting software, so that I can maintain accurate financial records without manual data entry.

#### Acceptance Criteria

1. WHEN orders are completed THEN the system SHALL sync transaction data to Tally/Zoho Books within 60 seconds
2. WHEN refunds are processed THEN the system SHALL update accounting records with proper GST adjustments
3. WHEN generating reports THEN the system SHALL provide outlet-wise GST splits and reconciliation data
4. WHEN integrating with POS systems THEN the system SHALL support Petpooja, Posist, and other major Indian POS platforms
5. WHEN end-of-day reconciliation occurs THEN the system SHALL eliminate manual re-keying requirements

### Requirement 6: Customer Review System with DPDP Compliance

**User Story:** As a restaurant diner, I want to leave reviews for items I've purchased while having my privacy protected, so that I can share feedback and help other customers make informed choices.

#### Acceptance Criteria

1. WHEN a customer completes a purchase THEN the system SHALL enable authenticated reviews for purchased items only
2. WHEN collecting review data THEN the system SHALL obtain explicit DPDP-compliant consent
3. WHEN customers request data access THEN the system SHALL provide mechanisms to exercise DPDP rights
4. IF a reviewer is a minor THEN the system SHALL obtain parental consent per DPDP requirements
5. WHEN storing review data THEN the system SHALL implement appropriate retention and deletion policies

### Requirement 7: Compliance and Security Framework

**User Story:** As a restaurant owner, I want the system to maintain compliance with Indian regulations, so that I can operate without regulatory risks.

#### Acceptance Criteria

1. WHEN logging system events THEN the system SHALL retain logs for 180 days in India per CERT-In directives
2. WHEN security incidents occur THEN the system SHALL have breach reporting readiness per CERT-In requirements
3. WHEN collecting personal data THEN the system SHALL provide clear privacy notices aligned with DPDP
4. WHEN processing payments THEN the system SHALL comply with current NPCI circulars and RBI tokenization guidelines
5. WHEN handling customer data THEN the system SHALL implement data localization requirements

### Requirement 8: Performance and Scalability

**User Story:** As a restaurant operating during peak hours, I want the system to handle high order volumes reliably, so that customer service remains smooth during busy periods.

#### Acceptance Criteria

1. WHEN experiencing peak traffic THEN the system SHALL maintain median menu load times <2s
2. WHEN processing orders THEN the system SHALL achieve ≥35% QR scan to cart conversion rate
3. WHEN customers proceed to checkout THEN the system SHALL achieve ≥60% checkout conversion rate
4. WHEN syncing with accounting systems THEN the system SHALL maintain ≤60s average latency
5. WHEN scaling across multiple outlets THEN the system SHALL support centralized menu management

### Requirement 9: Multi-language and Regional Support

**User Story:** As a restaurant serving diverse customers, I want menu content in regional languages, so that all customers can understand and order comfortably.

#### Acceptance Criteria

1. WHEN displaying menus THEN the system SHALL support multiple Indian regional languages
2. WHEN loading images THEN the system SHALL optimize for Indian network conditions
3. WHEN serving different regions THEN the system SHALL adapt to local preferences and regulations
4. WHEN customers access menus THEN the system SHALL detect and suggest appropriate language options
5. WHEN restaurant chains operate across states THEN the system SHALL handle regional GST variations

### Requirement 10: Coupon and Promotion Management

**User Story:** As a restaurant manager, I want to offer and manage coupons and promotions, so that I can attract customers and increase sales during specific periods.

#### Acceptance Criteria

1. WHEN customers apply coupons THEN the system SHALL validate coupon codes and apply appropriate discounts
2. WHEN calculating discounted bills THEN the system SHALL maintain correct GST treatment on net amounts
3. WHEN managing promotions THEN the system SHALL allow time-based and quantity-based restrictions
4. WHEN coupons are redeemed THEN the system SHALL update inventory and accounting records appropriately
5. WHEN displaying final bills THEN the system SHALL clearly show original price, discount, and final amount with GST breakdown