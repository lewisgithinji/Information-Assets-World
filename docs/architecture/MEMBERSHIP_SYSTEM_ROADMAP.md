# Membership System Roadmap

## Current State (As of 2025-11-19)

### Existing Infrastructure
- ✅ Lead management system (inquiry → conversion workflow)
- ✅ Event registration with automated emails
- ✅ Static membership page with 3 tiers (Individual $99, Professional $299, Corporate $999)
- ✅ Authentication system with role-based access
- ✅ Admin dashboard for managing leads
- ✅ Automated email system with Resend API

### Missing Components
- ❌ No membership database tables
- ❌ No payment processing
- ❌ No subscription management
- ❌ No member dashboard
- ❌ No automated membership creation

## Future Development Phases

### Phase 1: Quick Win - Enhanced Lead Integration (1-2 days)
**Goal:** Build on existing lead system to start accepting membership inquiries

**Implementation:**
1. Add new inquiry types:
   - `membership_individual`
   - `membership_professional`
   - `membership_corporate`

2. Enhance Membership.tsx with dynamic CTAs:
   - Route to RegisterInterest form with appropriate inquiry type
   - Pre-populate tier selection

3. Create membership-specific email templates:
   - Membership inquiry confirmation
   - Welcome email with login credentials
   - Membership benefits overview

4. Add admin workflow for manual membership activation:
   - Review membership inquiry in AdminLeads
   - Create user account if needed
   - Mark lead as "confirmed"
   - Send welcome kit

**User Journey:**
```
Membership Page → "Join Now" → RegisterInterest Form →
Lead Created → Admin Review → Manual Activation →
Email Welcome Kit with Login Details
```

**Benefits:**
- Works with existing infrastructure
- No payment gateway needed yet
- Can start accepting membership inquiries immediately
- Validates demand before building full system

---

### Phase 2: Database Foundation (2-3 days)
**Goal:** Create proper membership data structure

**Database Schema:**

#### 1. `memberships` Table
```sql
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  tier_id UUID REFERENCES membership_tiers(id),
  status TEXT CHECK (status IN ('pending', 'active', 'expired', 'cancelled', 'suspended')),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  renewal_date TIMESTAMPTZ,
  auto_renew BOOLEAN DEFAULT true,
  payment_method TEXT,
  lead_id UUID REFERENCES leads(id), -- Link to original inquiry
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### 2. `membership_tiers` Table
```sql
CREATE TABLE membership_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL, -- 'individual', 'professional', 'corporate'
  display_name TEXT NOT NULL, -- 'Individual Membership'
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  billing_period TEXT DEFAULT 'yearly', -- 'monthly', 'yearly'
  features JSONB, -- Array of feature descriptions
  event_discount_percent INTEGER DEFAULT 0,
  max_team_members INTEGER, -- NULL for individual/professional, number for corporate
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### 3. `payments` Table
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id UUID REFERENCES memberships(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT, -- 'stripe', 'paypal', 'bank_transfer', 'manual'
  transaction_id TEXT, -- External payment provider ID
  invoice_number TEXT UNIQUE,
  payment_date TIMESTAMPTZ,
  metadata JSONB, -- Store additional payment details
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### 4. Update `leads` Table
```sql
ALTER TABLE leads ADD COLUMN membership_id UUID REFERENCES memberships(id);
```

**Automated Conversion Logic:**
- Trigger function: When lead status changes to 'confirmed' AND inquiry_type starts with 'membership_'
- Automatically create membership record with status='pending'
- Send notification to admin for payment processing

**Benefits:**
- Proper data structure for membership lifecycle
- Track membership history and status
- Foundation for automated workflows
- Support member-only features

---

### Phase 3: Payment Integration (3-5 days)
**Goal:** Automate payment processing with Stripe

**Implementation:**

1. **Stripe Setup:**
   - Create Stripe account
   - Set up Products and Prices for each tier
   - Configure webhooks for subscription events

2. **Payment Flow:**
   ```
   Membership Page → Select Tier → Stripe Checkout →
   Payment Success → Auto-create Membership →
   Welcome Email with Credentials
   ```

3. **Subscription Management:**
   - Create Stripe subscription on signup
   - Handle subscription lifecycle events (created, updated, cancelled, renewed)
   - Automatic invoice generation
   - Failed payment handling and retries

4. **Edge Functions:**
   - `create-checkout-session` - Generate Stripe checkout URL
   - `handle-stripe-webhook` - Process Stripe events
   - `create-membership` - Create membership record after payment
   - `generate-invoice` - Create PDF invoices

5. **Email Automations:**
   - Payment confirmation
   - Welcome email with login details
   - Renewal reminders (30, 7, 1 day before)
   - Payment failure notifications
   - Subscription cancellation confirmation

**Stripe Event Handling:**
- `checkout.session.completed` → Create membership
- `customer.subscription.created` → Activate membership
- `customer.subscription.updated` → Update membership status
- `customer.subscription.deleted` → Cancel membership
- `invoice.payment_succeeded` → Record payment, extend membership
- `invoice.payment_failed` → Send failure notification, retry

**Benefits:**
- Fully automated signup flow
- Recurring revenue with subscriptions
- Professional payment experience
- Reduced manual admin work
- Automatic invoicing and receipts

---

### Phase 4: Member Portal (3-5 days)
**Goal:** Self-service member dashboard and benefits

**Implementation:**

#### 1. Member Dashboard (`/member/dashboard`)
Display:
- Current membership tier and status
- Membership card/badge
- Renewal date and auto-renew status
- Payment history
- Quick stats (events attended, resources accessed)
- Member-since date

#### 2. Subscription Management (`/member/subscription`)
Features:
- View current plan details
- Upgrade/downgrade tier
- Update payment method
- Toggle auto-renewal
- Cancel subscription
- Download invoices
- View payment history

#### 3. Member Benefits (`/member/benefits`)
Features:
- List of tier-specific benefits
- Event discount codes
- Early registration access
- Member-only resources
- Exclusive content library

#### 4. Member-Only Content Access
Implementations:
- Gated papers/resources based on membership tier
- Event registration with automatic member discounts
- Exclusive webinars and recordings
- Member directory (if applicable)

#### 5. Team Management (Corporate Tier Only)
Features:
- Add/remove team members
- Assign seats
- View team member activity
- Bulk event registration

**Access Control Logic:**
```typescript
// Middleware/hooks to check membership access
const useMembershipAccess = () => {
  const { user } = useAuth();
  const { data: membership } = useMembership(user?.id);

  return {
    hasAccess: membership?.status === 'active',
    tier: membership?.tier,
    canAccessResource: (requiredTier) => checkTierAccess(membership?.tier, requiredTier)
  };
};
```

**Benefits:**
- Member self-service reduces support load
- Better member experience
- Increased retention through engagement
- Upsell opportunities (tier upgrades)
- Community building features

---

## Integration Points with Existing Systems

### Lead System Integration
```
Lead (membership inquiry) → Manual Review → Payment → Membership Created → Benefits Activated
                                                          ↓
                                              Link back to original lead
```

### Event System Integration
- Check membership status during event registration
- Apply tier-based discounts automatically
- Track member event participation
- Offer early registration to members

### Email System Integration
- Extend existing email templates for membership lifecycle
- Automated welcome series
- Renewal reminders
- Engagement campaigns

### Authentication Integration
- Link memberships to existing profiles table
- Add membership tier to user context
- Update role-based access control to include membership status

---

## Technical Considerations

### Stripe vs. PayPal vs. Manual
**Recommendation: Stripe**
- Better developer experience
- Built-in subscription management
- Excellent webhooks and APIs
- Supports multiple payment methods
- Strong fraud protection

### Subscription Billing Models
**Options:**
1. **Annual Only** (Recommended initially)
   - Simpler to manage
   - Better cash flow
   - Lower transaction fees
   - Current pricing model ($99, $299, $999/year)

2. **Monthly + Annual**
   - More flexibility for users
   - Lower barrier to entry
   - More complex to manage
   - More transaction fees

### Member Data Privacy
- GDPR/data protection compliance
- Allow members to export their data
- Provide data deletion on request
- Secure storage of payment information (handled by Stripe)

### Testing Strategy
1. **Stripe Test Mode**
   - Use test API keys
   - Test card numbers
   - Simulate webhooks

2. **Manual Testing Checklist**
   - Signup flow
   - Payment success/failure
   - Subscription renewal
   - Tier upgrades/downgrades
   - Cancellation flow
   - Invoice generation

3. **Edge Cases**
   - Expired memberships
   - Failed payments
   - Multiple subscriptions (prevent)
   - Refund requests

---

## Future Enhancements (Post Phase 4)

### Phase 5: Advanced Features
- Member referral program
- Gift memberships
- Corporate bulk purchasing
- Member-to-member networking
- Certification tracking (if applicable)
- CPD/CEU credits tracking
- Member directory with profiles
- Private member forums/community
- Member-only events and webinars
- Loyalty/rewards program

### Phase 6: Analytics & Reporting
- Membership growth metrics
- Churn analysis
- Revenue forecasting
- Member engagement scoring
- Tier conversion rates
- Lifetime value calculations
- Cohort analysis

### Phase 7: Marketing Automation
- Drip campaigns for trial members
- Win-back campaigns for expired members
- Upsell campaigns (individual → professional)
- Corporate membership outreach
- Member testimonials and case studies

---

## Recommended Implementation Order

**Immediate Priority:**
- Media section (current focus)

**Next Steps (After Media Section):**
1. Phase 1: Enhanced Lead Integration (quick win)
2. Phase 2: Database Foundation (proper structure)
3. Phase 3: Payment Integration (automation)
4. Phase 4: Member Portal (self-service)

**Long-term Roadmap:**
- Phase 5+: Based on user feedback and growth metrics

---

## Resources Needed

### For Phase 3 (Payment Integration)
- Stripe account (business verification required)
- SSL certificate (already have if using Supabase/Vercel)
- Legal: Terms of Service, Privacy Policy updates
- Refund policy documentation

### For All Phases
- Email templates design
- Member welcome kit materials
- Membership benefits documentation
- Admin training on new workflows

---

## Success Metrics

### Phase 1
- Number of membership inquiries received
- Inquiry-to-conversion rate
- Average time from inquiry to activation

### Phase 2-3
- Signup completion rate
- Payment success rate
- Time to first payment

### Phase 4
- Member engagement (dashboard usage)
- Self-service adoption rate
- Support ticket reduction
- Member satisfaction score

### Overall
- Monthly Recurring Revenue (MRR)
- Annual Recurring Revenue (ARR)
- Churn rate
- Customer Lifetime Value (LTV)
- Member retention rate

---

## Notes

- This roadmap builds incrementally on existing systems
- Each phase delivers standalone value
- Can pause/adjust based on business priorities
- Database migrations should be versioned and reversible
- Always test in staging before production deployment

**Document Created:** 2025-11-19
**Next Review:** After media section completion
