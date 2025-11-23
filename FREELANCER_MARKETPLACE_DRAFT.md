# NaijaFreelance - Nigerian Freelancer Marketplace
## Project Draft & Specification

---

## 🎯 Project Overview

A Fiverr-like marketplace platform specifically designed for Nigerian freelancers and clients. The platform will facilitate connections between clients seeking services and Nigerian freelancers offering their skills.

**Target Market:** Nigerian freelancers and businesses/clients (both local and international)

---

## 💰 Monetization Strategy

### **Revenue Models Overview**

The platform will generate revenue through multiple streams to ensure sustainability and growth. Here are the primary and secondary revenue models:

---

### **1. Transaction Commission (Primary Revenue) ⭐**

**Model:** Take a percentage of each completed transaction

**Recommended Structure:**
- **20% commission** on all orders (industry standard: Fiverr takes 20%, Upwork takes 10-20%)
- Applied to the order total before payment to freelancer
- Commission is deducted when payment is released to freelancer

**Example:**
- Client pays: ₦50,000
- Platform commission (20%): ₦10,000
- Freelancer receives: ₦40,000

**Pros:**
- ✅ Aligns platform success with freelancer success
- ✅ No upfront cost barrier for freelancers
- ✅ Scales automatically with platform growth
- ✅ Industry standard (users expect it)

**Cons:**
- ❌ Lower revenue per transaction initially
- ❌ Freelancers may try to take transactions off-platform

**Implementation:**
- Commission calculated automatically on order placement
- Held in escrow with order payment
- Released to platform account when order completes
- Visible to freelancers in earnings breakdown

---

### **2. Freelancer Subscription Tiers (Secondary Revenue) ⭐**

**Model:** Monthly/annual subscription plans for freelancers with premium features

**Tier Structure:**

#### **Free Tier (Basic)**
- Create up to 3 active gigs
- Basic analytics
- Standard support
- 20% commission on orders

#### **Professional Tier - ₦2,999/month (~$4)**
- Unlimited active gigs
- Advanced analytics
- Priority support
- **15% commission** (5% discount)
- Featured gig placement (rotating)
- Custom gig packages (more than 3 tiers)
- Portfolio showcase

#### **Premium Tier - ₦7,999/month (~$10)**
- Everything in Professional
- **10% commission** (10% discount)
- Top placement in search results
- Featured profile badge
- Advanced marketing tools
- API access
- Priority dispute resolution
- Custom domain for profile

**Revenue Projection:**
- 100 Professional subscribers: ₦299,900/month
- 20 Premium subscribers: ₦159,980/month
- Total: ~₦460,000/month from subscriptions

**Pros:**
- ✅ Predictable recurring revenue
- ✅ Incentivizes freelancers to stay active
- ✅ Reduces commission for active users (win-win)
- ✅ Creates platform loyalty

**Cons:**
- ❌ May deter new freelancers initially
- ❌ Need to provide clear value proposition

---

### **3. Featured/Promoted Listings (Secondary Revenue)**

**Model:** Freelancers pay to boost their gigs in search results

**Options:**
- **Gig Promotion:** ₦500-2,000/day per gig
  - Appears in "Featured" section
  - Higher in search results
  - "Promoted" badge
- **Category Promotion:** ₦5,000-10,000/week
  - Featured in category pages
  - Homepage carousel placement

**Pros:**
- ✅ High margin (pure profit)
- ✅ Optional (doesn't affect free users)
- ✅ Self-service (easy to implement)

**Cons:**
- ❌ May create pay-to-win perception
- ❌ Need to balance with organic results

---

### **4. Withdrawal Fees (Tertiary Revenue)**

**Model:** Small fee for processing withdrawals

**Structure:**
- **Bank Transfer:** ₦50-100 per withdrawal
- **Instant Withdrawal:** 2% fee (optional premium feature)
- **Standard Withdrawal:** Free (processed within 2-3 business days)

**Pros:**
- ✅ Covers payment processing costs
- ✅ Encourages freelancers to keep balance on platform
- ✅ Small, acceptable fee

**Cons:**
- ❌ May be seen as nickel-and-diming
- ❌ Should be transparent

---

### **5. Payment Processing Fees (Pass-through)**

**Model:** Pass payment gateway fees to clients (or absorb as cost of doing business)

**Options:**

**Option A: Client Pays Processing Fee**
- Client pays: Order amount + 1.5% processing fee
- Example: ₦50,000 order + ₦750 fee = ₦50,750 total
- Platform absorbs no payment costs

**Option B: Platform Absorbs (Recommended for MVP)**
- Client pays exact order amount
- Platform covers ~1.5% payment gateway fees
- Better user experience
- Cost: ~1.5% of transaction volume

**Recommendation:** Start with Option B, consider Option A later if margins are tight

---

### **6. Premium Client Features (Future)**

**Model:** Subscription for clients who frequently hire

**Features:**
- Unlimited saved freelancers
- Priority customer support
- Bulk order discounts
- Advanced search filters
- Project management tools
- **₦1,999/month** (~$2.50)

---

### **7. Advertising Revenue (Future)**

**Model:** Display ads from third-party businesses

- Banner ads on browse pages
- Sponsored content
- Email newsletter ads
- **Not recommended for MVP** (hurts UX)

---

## 💵 Revenue Projections & Scenarios

### **Scenario 1: Early Stage (Month 1-3)**
- **100 active freelancers**
- **50 orders/month** @ average ₦30,000
- **Total GMV:** ₦1,500,000/month
- **Commission (20%):** ₦300,000/month
- **Subscriptions (10 Pro):** ₦29,990/month
- **Total Revenue:** ~₦330,000/month

### **Scenario 2: Growth Stage (Month 4-12)**
- **500 active freelancers**
- **500 orders/month** @ average ₦40,000
- **Total GMV:** ₦20,000,000/month
- **Commission (20%):** ₦4,000,000/month
- **Subscriptions (50 Pro, 10 Premium):** ₦229,950/month
- **Promoted Listings:** ₦100,000/month
- **Total Revenue:** ~₦4,330,000/month

### **Scenario 3: Mature Stage (Year 2+)**
- **2,000 active freelancers**
- **3,000 orders/month** @ average ₦50,000
- **Total GMV:** ₦150,000,000/month
- **Commission (avg 17% with subscriptions):** ₦25,500,000/month
- **Subscriptions (200 Pro, 50 Premium):** ₦1,099,500/month
- **Promoted Listings:** ₦500,000/month
- **Total Revenue:** ~₦27,100,000/month

---

## 🎯 Recommended Monetization Strategy (MVP Launch)

### **Phase 1: Launch (Months 1-3)**
1. **20% transaction commission** (primary)
2. **Free withdrawals** (build trust)
3. **No subscription tiers yet** (reduce friction)
4. **Absorb payment processing fees** (better UX)

**Focus:** Get users, build trust, prove value

### **Phase 2: Growth (Months 4-6)**
1. Keep 20% commission
2. **Introduce subscription tiers** (Professional & Premium)
3. **Add withdrawal fees** (₦50-100)
4. **Launch promoted listings**

**Focus:** Diversify revenue, improve margins

### **Phase 3: Optimization (Months 7+)**
1. Analyze commission impact (consider 18% if needed)
2. Optimize subscription pricing
3. Add premium client features
4. Consider payment processing fee pass-through

**Focus:** Optimize for profitability and growth

---

## 💡 Key Decisions Needed

1. **Commission Rate:** 20% (recommended) or lower (15-18%)?
   - Lower = more competitive, less revenue
   - Higher = more revenue, may deter users

2. **Subscription Launch:** 
   - Launch with subscriptions? (More complex)
   - Or add after 3-6 months? (Recommended)

3. **Payment Processing:**
   - Client pays fees? (More revenue)
   - Platform absorbs? (Better UX, recommended for MVP)

4. **Withdrawal Fees:**
   - Free withdrawals initially? (Build trust)
   - Or small fee from start? (Cover costs)

5. **Minimum Withdrawal:**
   - ₦1,000? ₦2,000? (Prevent micro-withdrawals)

---

## 📊 Competitive Analysis

| Platform | Commission | Subscription | Notes |
|----------|-----------|--------------|-------|
| **Fiverr** | 20% | Yes (Fiverr Pro) | Industry leader |
| **Upwork** | 10-20% | Yes | Higher for smaller projects |
| **Toptal** | Variable | No | Premium marketplace |
| **PeoplePerHour** | 15-20% | Yes | UK-focused |
| **Guru** | 9-15% | Yes | Lower commission |

**Our Position:** 20% commission is competitive and standard. Subscription tiers provide additional value and recurring revenue.

---

## ✅ Recommended Final Structure

**For MVP Launch:**
- ✅ **20% transaction commission** (primary revenue)
- ✅ **Free withdrawals** (build trust, minimum ₦2,000)
- ✅ **Platform absorbs payment fees** (better UX)
- ✅ **No subscriptions initially** (reduce friction)

**Add After 3-6 Months:**
- ✅ **Freelancer subscription tiers** (Professional & Premium)
- ✅ **Withdrawal fees** (₦50-100 per withdrawal)
- ✅ **Promoted listings** (optional boost)

**This structure:**
- Simple to implement
- Competitive with market
- Builds trust initially
- Scales with growth
- Provides multiple revenue streams

---

## 🛡️ Preventing Off-Platform Transactions & Revenue Protection

### **The Challenge**
Freelancers may attempt to take transactions off-platform to avoid commission fees, which directly impacts platform revenue and growth.

### **Our Solution: Value-First Approach + Smart Safeguards**

Instead of just blocking behavior, we'll make staying on-platform more valuable than going off-platform through transparency, protection, and clear benefits.

---

## 💎 Clear Value Proposition: Why Stay On-Platform?

### **For Freelancers: "We're Your Business Partner, Not Just a Platform"**

#### **1. Payment Protection & Guarantee** 🛡️
- **Escrow Protection:** Payment held securely until work is delivered
- **Payment Guarantee:** You get paid even if client disputes (after review)
- **No Chargebacks:** Platform handles payment disputes
- **Fast Payouts:** Reliable 2-3 day withdrawals vs. waiting for client payments
- **Off-platform risk:** No payment protection, risk of non-payment, chargebacks, delays

**Value:** "Sleep well knowing you'll get paid for your work"

#### **2. Built-in Marketing & Discovery** 📈
- **Automatic Exposure:** Your gigs appear in search results to thousands of potential clients
- **SEO Benefits:** Platform drives organic traffic you can't get alone
- **Category Placement:** Featured in relevant categories
- **Client Trust:** Platform verification builds instant credibility
- **Off-platform risk:** You must find clients yourself, no discovery, no trust signals

**Value:** "We bring clients to you, you focus on delivering great work"

#### **3. Professional Tools & Infrastructure** 🛠️
- **Order Management:** Built-in project tracking and delivery system
- **Communication Hub:** Organized messaging with order context
- **Portfolio Showcase:** Professional profile that builds your brand
- **Analytics Dashboard:** Track views, clicks, conversions, earnings
- **Review System:** Build reputation that attracts more clients
- **Off-platform risk:** Use multiple tools, no integration, manual tracking

**Value:** "Everything you need to run your freelance business in one place"

#### **4. Dispute Resolution & Support** ⚖️
- **Mediation Service:** Platform handles disputes fairly
- **Support Team:** Help when things go wrong
- **Terms Protection:** Clear contracts and terms of service
- **Refund Protection:** Platform manages refunds, not you
- **Off-platform risk:** You handle disputes alone, no support, legal risks

**Value:** "We've got your back when things get complicated"

#### **5. Reputation & Credibility Building** ⭐
- **Verified Badge:** Platform verification = instant trust
- **Review History:** Public reviews build your credibility
- **Success Metrics:** Completed orders, ratings, response time
- **Portfolio Growth:** Every completed order strengthens your profile
- **Off-platform risk:** No reputation system, start from scratch each time

**Value:** "Build a reputation that follows you and attracts clients"

#### **6. Reduced Administrative Burden** 📋
- **Automated Invoicing:** Platform handles all billing
- **Tax Documentation:** Transaction history for tax purposes
- **Payment Processing:** No need to set up payment gateways
- **Contract Management:** Standard terms protect both parties
- **Off-platform risk:** Handle invoicing, contracts, payments yourself

**Value:** "Focus on your craft, we handle the business side"

#### **7. Access to Premium Clients** 👔
- **Verified Clients:** Platform vets and verifies clients
- **Quality Leads:** Clients on platform are serious buyers
- **International Reach:** Access to clients worldwide
- **Bulk Orders:** Clients who order multiple services
- **Off-platform risk:** Unverified clients, time wasters, payment risks

**Value:** "Access to quality clients you can't reach alone"

---

## 🔒 Technical Safeguards to Prevent Off-Platform Transactions

### **1. Communication Monitoring (Transparent & Ethical)**

**Implementation:**
- Monitor for contact information sharing in messages
- Automated detection of:
  - Email addresses
  - Phone numbers
  - External website URLs
  - Social media handles
  - Payment platform mentions (PayPal, direct transfer requests)

**Response (Transparent):**
- **First Warning:** Friendly reminder about platform benefits
- **Second Warning:** Temporary messaging restrictions
- **Third Violation:** Account review, potential suspension

**Transparency:**
- Clear Terms of Service explaining monitoring
- User notification when detection occurs
- Appeal process for false positives

**Code Example:**
```typescript
// Detect off-platform contact attempts
const detectOffPlatformContact = (message: string) => {
  const patterns = [
    /@[\w.-]+\.(com|net|org|io|co)/gi, // Email
    /(\+234|0)[789]\d{9}/g, // Nigerian phone
    /(paypal|skrill|wise|western union)/gi, // Payment platforms
    /(whatsapp|telegram|signal)\s*:?\s*[\d+]/gi, // Messaging apps
  ];
  return patterns.some(pattern => pattern.test(message));
};
```

---

### **2. Order Completion Verification**

**Implementation:**
- Require order completion through platform
- Track delivery and acceptance
- Only release payment after platform completion
- Flag accounts with high cancellation rates

**Transparency:**
- Clear order completion process
- Visible order status to both parties
- Explanation of why completion matters

---

### **3. Repeat Client Detection**

**Implementation:**
- Track client-freelancer relationships
- Flag accounts with multiple orders that cancel
- Monitor for patterns suggesting off-platform migration
- Analytics dashboard showing relationship metrics

**Response:**
- Reach out to understand why orders cancel
- Offer incentives to stay on-platform
- Provide additional value (better support, features)

---

### **4. Smart Pricing & Incentives**

**Implementation:**
- **Loyalty Discounts:** Reduce commission for long-term freelancers
  - 20% → 18% after 50 completed orders
  - 18% → 15% after 200 completed orders
  - 15% → 12% after 500 completed orders
- **Volume Bonuses:** Extra benefits for high-volume sellers
- **Subscription Benefits:** Lower commission for subscribers (already planned)

**Transparency:**
- Clear commission structure visible to all
- Public loyalty program details
- Real-time commission calculator

---

### **5. Educational Content & Onboarding**

**Implementation:**
- **Onboarding:** Explain platform benefits during signup
- **Resource Center:** Articles on why platform benefits freelancers
- **Success Stories:** Showcase freelancers who succeeded on-platform
- **Regular Communication:** Email updates on platform value

**Message:**
> "We take 20% commission, but here's what you get:
> - Payment protection worth more than the commission
> - Marketing that brings you clients
> - Tools that save you time
> - Support when you need it
> 
> Going off-platform means losing all of this. Is saving 20% worth the risk?"

---

### **6. Transparent Commission Breakdown**

**Implementation:**
- Show exactly what commission covers
- Break down platform costs
- Display value received vs. commission paid

**Example Display:**
```
Order Value: ₦50,000
Platform Commission (20%): ₦10,000
Your Earnings: ₦40,000

What Your ₦10,000 Commission Covers:
✓ Payment Protection & Escrow: ₦2,000
✓ Marketing & Discovery: ₦3,000
✓ Platform Infrastructure: ₦2,000
✓ Support & Dispute Resolution: ₦1,500
✓ Payment Processing: ₦1,000
✓ Platform Development: ₦500
```

**Transparency:** Show this breakdown on every order and in earnings dashboard

---

### **7. Client Education**

**Implementation:**
- Educate clients on benefits of staying on-platform
- Show risks of going off-platform
- Highlight platform guarantees and protections

**Client Benefits:**
- Payment protection (escrow)
- Dispute resolution
- Verified freelancers
- Quality guarantee
- Refund protection

---

### **8. Legal & Terms Protection**

**Implementation:**
- Clear Terms of Service prohibiting off-platform transactions
- Consequences clearly stated
- Legal protection for platform
- Regular terms updates

**Transparency:**
- Terms in plain language
- Highlighted during signup
- Regular reminders
- Easy to understand consequences

---

## 📊 Transparency Dashboard Features

### **For Freelancers:**

#### **Earnings Transparency**
- Real-time commission calculator
- Breakdown of what commission covers
- Value received vs. commission paid
- Comparison: "If you went off-platform, you'd lose: [list of benefits]"

#### **Order Transparency**
- Clear order status at every step
- Visible payment escrow status
- Commission calculation visible
- Timeline for payment release

#### **Platform Value Metrics**
- Clients brought to you by platform
- Time saved using platform tools
- Disputes resolved by platform
- Marketing value received

### **For Clients:**

#### **Payment Transparency**
- Clear pricing (no hidden fees)
- Escrow status visible
- Refund policy clearly stated
- Payment protection explained

#### **Freelancer Transparency**
- Verified status visible
- Complete review history
- Response time metrics
- Success rate displayed

---

## 🎯 Revenue Protection Strategy Summary

### **Prevention (Primary Strategy)**
1. ✅ **Make platform more valuable than going off-platform**
2. ✅ **Transparent commission breakdown showing value**
3. ✅ **Loyalty discounts for long-term users**
4. ✅ **Educational content on platform benefits**
5. ✅ **Clear value proposition at every touchpoint**

### **Detection (Secondary Strategy)**
1. ✅ **Monitor communication for contact info sharing**
2. ✅ **Track order patterns and cancellations**
3. ✅ **Identify repeat client relationships**
4. ✅ **Analytics to detect suspicious behavior**

### **Response (Tertiary Strategy)**
1. ✅ **Warnings with education (not punishment)**
2. ✅ **Reach out to understand issues**
3. ✅ **Offer additional value/incentives**
4. ✅ **Account review for repeat violations**
5. ✅ **Transparent consequences in Terms of Service**

---

## 💡 Key Principles

### **1. Transparency First**
- Show everything: commissions, fees, processes
- Explain the "why" behind every decision
- Make value visible and measurable
- No hidden costs or surprises

### **2. Value Over Enforcement**
- Focus on making platform valuable
- Education over punishment
- Incentives over restrictions
- Partnership over transaction

### **3. Trust Building**
- Protect freelancers and clients equally
- Fair dispute resolution
- Reliable payments
- Consistent platform experience

### **4. Continuous Improvement**
- Listen to user feedback
- Adjust commission structure if needed
- Add value continuously
- Stay competitive

---

## 📈 Success Metrics for Revenue Protection

### **Track These Metrics:**
- **Off-platform Transaction Rate:** Target < 5% of orders
- **Repeat Client Retention:** % of clients who return
- **Freelancer Retention:** % of freelancers active after 6 months
- **Commission Acceptance:** % who understand and accept commission
- **Value Perception:** User surveys on platform value

### **Red Flags:**
- High cancellation rate for specific freelancer-client pairs
- Messages with contact information
- Clients who order once then disappear
- Freelancers with declining order volume

---

## ✅ Implementation Checklist

### **MVP Launch:**
- [ ] Clear value proposition on homepage
- [ ] Transparent commission display on orders
- [ ] Basic communication monitoring
- [ ] Terms of Service with off-platform prohibition
- [ ] Educational onboarding content

### **Phase 2 (Months 4-6):**
- [ ] Advanced communication monitoring
- [ ] Loyalty discount program
- [ ] Value breakdown dashboard
- [ ] Success stories and case studies
- [ ] Regular educational emails

### **Phase 3 (Months 7+):**
- [ ] AI-powered pattern detection
- [ ] Advanced analytics dashboard
- [ ] Personalized value recommendations
- [ ] Community features
- [ ] Referral program

---

## 🎯 Final Message to Freelancers

> **"We're not just taking 20% - we're investing it back into your success.**
> 
> Every commission we earn goes toward:
> - Bringing you more clients
> - Protecting your payments
> - Building tools that make you more efficient
> - Providing support when you need it
> - Growing the platform so you grow too
> 
> **Going off-platform might save you 20%, but it costs you:**
> - Payment protection
> - Client discovery
> - Professional tools
> - Support and mediation
> - Reputation building
> - Time and administrative burden
> 
> **We're partners in your success. When you win, we win. That's why we're invested in your growth."**

---

## 👥 User Types

### 1. **Freelancers (Sellers)**
- Create profiles with portfolio
- Create and manage gigs/services
- Set pricing (₦ or $)
- Receive orders and manage projects
- Communicate with clients
- Withdraw earnings
- Build reputation through reviews

### 2. **Clients (Buyers)**
- Browse and search for services
- Place orders
- Communicate with freelancers
- Make payments
- Leave reviews and ratings
- Manage orders/projects

### 3. **Admin**
- Manage users and content
- Handle disputes
- Monitor platform activity
- Manage categories and tags

---

## 🚀 Core Features (MVP)

### **Phase 1: Essential Features**

#### **Authentication & Onboarding**
- [ ] User registration (Email/Phone)
- [ ] Email/Phone verification
- [ ] Login/Logout
- [ ] Password reset
- [ ] Profile creation (Freelancer/Client selection)
- [ ] Profile completion wizard

#### **Freelancer Features**
- [ ] Create/edit/delete gigs
- [ ] Gig packages (Basic, Standard, Premium)
- [ ] Portfolio upload (images, videos, documents)
- [ ] Skills and categories selection
- [ ] Pricing setup (₦ or $)
- [ ] Availability calendar
- [ ] Response time settings

#### **Client Features**
- [ ] Browse gigs with filters (category, price, rating, delivery time)
- [ ] Search functionality
- [ ] View freelancer profiles
- [ ] Place orders
- [ ] Order management dashboard

#### **Order Management**
- [ ] Order placement flow
- [ ] Order status tracking (Pending, In Progress, Delivered, Completed, Cancelled)
- [ ] Delivery system (freelancer uploads deliverables)
- [ ] Revision requests
- [ ] Order completion confirmation

#### **Communication**
- [ ] In-app messaging system
- [ ] Real-time notifications
- [ ] Order-related chat threads

#### **Payment System**
- [ ] Payment gateway integration (Paystack, Flutterwave)
- [ ] Escrow system (hold payment until order completion)
- [ ] Multiple payment methods:
  - Bank transfer
  - Card payments
  - USSD
  - Mobile money
- [ ] Freelancer withdrawal system
- [ ] Transaction history

#### **Reviews & Ratings**
- [ ] Client reviews after order completion
- [ ] Freelancer ratings (5-star system)
- [ ] Review display on profiles
- [ ] Average rating calculation

#### **Basic Admin Panel**
- [ ] User management
- [ ] Gig moderation
- [ ] Dispute resolution
- [ ] Analytics dashboard

---

## 🗄️ Database Schema (Supabase)

### **Core Tables**

#### `profiles`
```sql
- id (UUID, PK, references auth.users)
- user_type (ENUM: 'freelancer', 'client', 'admin')
- full_name
- email
- phone
- avatar_url
- bio
- location (city, state)
- verification_status (verified, pending, unverified)
- created_at
- updated_at
```

#### `freelancer_profiles`
```sql
- id (UUID, PK, references profiles)
- skills (TEXT[])
- hourly_rate
- total_earnings
- completed_orders_count
- average_rating
- response_time
- languages (TEXT[])
- education
- certifications
- portfolio_urls (TEXT[])
- loyalty_tier (bronze, silver, gold, platinum) -- For commission discounts
- total_orders_completed -- For loyalty tier calculation
- off_platform_warnings_count -- Track warnings
- last_warning_at
- subscription_tier (free, professional, premium)
- subscription_expires_at
```

#### `categories`
```sql
- id (UUID, PK)
- name
- slug
- icon
- description
- parent_id (for subcategories)
- created_at
```

#### `gigs`
```sql
- id (UUID, PK)
- freelancer_id (UUID, FK → profiles)
- title
- slug
- description
- category_id (UUID, FK → categories)
- subcategory_id
- tags (TEXT[])
- images (TEXT[])
- video_url
- basic_package_price
- standard_package_price
- premium_package_price
- basic_package_delivery_days
- standard_package_delivery_days
- premium_package_delivery_days
- basic_package_features (TEXT[])
- standard_package_features (TEXT[])
- premium_package_features (TEXT[])
- status (active, paused, deleted)
- views_count
- orders_count
- average_rating
- created_at
- updated_at
```

#### `orders`
```sql
- id (UUID, PK)
- order_number (unique)
- client_id (UUID, FK → profiles)
- freelancer_id (UUID, FK → profiles)
- gig_id (UUID, FK → gigs)
- package_type (basic, standard, premium)
- price
- currency (NGN, USD)
- status (pending, in_progress, delivered, completed, cancelled, disputed)
- requirements (TEXT)
- delivery_date
- delivered_at
- completed_at
- cancelled_at
- cancellation_reason
- commission_rate (DECIMAL) -- Actual commission % applied (e.g., 0.20 for 20%)
- commission_amount (DECIMAL) -- Calculated commission
- freelancer_earnings (DECIMAL) -- Amount freelancer receives
- is_repeat_client (BOOLEAN) -- Track repeat relationships
- cancellation_flagged (BOOLEAN) -- Flag suspicious cancellations
- created_at
- updated_at
```

#### `order_deliverables`
```sql
- id (UUID, PK)
- order_id (UUID, FK → orders)
- file_urls (TEXT[])
- message
- delivered_by (UUID, FK → profiles)
- delivered_at
```

#### `reviews`
```sql
- id (UUID, PK)
- order_id (UUID, FK → orders, UNIQUE)
- reviewer_id (UUID, FK → profiles)
- reviewee_id (UUID, FK → profiles)
- rating (1-5)
- comment
- created_at
```

#### `messages`
```sql
- id (UUID, PK)
- order_id (UUID, FK → orders, nullable)
- sender_id (UUID, FK → profiles)
- receiver_id (UUID, FK → profiles)
- content
- attachments (TEXT[])
- read_at
- flagged_for_review (BOOLEAN) -- Flagged by monitoring system
- off_platform_attempt_detected (BOOLEAN) -- Contact info detected
- detection_reason (TEXT) -- What was detected (email, phone, etc.)
- reviewed_by_admin (BOOLEAN)
- created_at
```

#### `communication_monitoring_logs`
```sql
- id (UUID, PK)
- message_id (UUID, FK → messages)
- user_id (UUID, FK → profiles)
- detection_type (email, phone, url, payment_platform, messaging_app)
- detected_content (TEXT) -- What was detected
- severity (low, medium, high)
- action_taken (none, warning_sent, message_restricted, account_reviewed)
- reviewed_by (UUID, FK → profiles, nullable) -- Admin who reviewed
- reviewed_at (TIMESTAMP, nullable)
- created_at
```

#### `payments`
```sql
- id (UUID, PK)
- order_id (UUID, FK → orders)
- amount -- Total amount paid by client
- currency
- payment_method
- payment_gateway (paystack, flutterwave)
- gateway_reference
- status (pending, completed, failed, refunded)
- commission_amount (DECIMAL) -- Platform commission
- freelancer_payout_amount (DECIMAL) -- Amount to freelancer
- payment_processing_fee (DECIMAL) -- Gateway fee
- commission_breakdown (JSONB) -- Detailed breakdown for transparency
  {
    "payment_protection": amount,
    "marketing": amount,
    "infrastructure": amount,
    "support": amount,
    "payment_processing": amount,
    "development": amount
  }
- paid_at
- created_at
```

#### `withdrawals`
```sql
- id (UUID, PK)
- freelancer_id (UUID, FK → profiles)
- amount
- currency
- bank_account_details (JSONB)
- status (pending, processing, completed, failed)
- processed_at
- created_at
```

#### `notifications`
```sql
- id (UUID, PK)
- user_id (UUID, FK → profiles)
- type (order_received, order_delivered, message, payment, review, off_platform_warning, loyalty_tier_upgrade)
- title
- message
- related_id (UUID, nullable)
- read
- created_at
```

#### `platform_value_metrics`
```sql
- id (UUID, PK)
- freelancer_id (UUID, FK → profiles)
- period_start (DATE)
- period_end (DATE)
- clients_brought_by_platform (INTEGER)
- orders_from_platform_clients (INTEGER)
- estimated_marketing_value (DECIMAL)
- disputes_resolved (INTEGER)
- time_saved_hours (DECIMAL) -- Estimated time saved using platform tools
- total_commission_paid (DECIMAL)
- total_value_received (DECIMAL) -- Calculated value
- value_to_commission_ratio (DECIMAL) -- Value received / commission paid
- created_at
- updated_at
```

#### `loyalty_tier_history`
```sql
- id (UUID, PK)
- freelancer_id (UUID, FK → profiles)
- previous_tier (TEXT)
- new_tier (TEXT)
- previous_commission_rate (DECIMAL)
- new_commission_rate (DECIMAL)
- orders_at_tier_change (INTEGER)
- changed_at (TIMESTAMP)
- created_at
```

---

## 📱 Key Pages/Screens

### **Public Pages**
1. **Homepage**
   - Hero section
   - Popular categories
   - Featured freelancers
   - Top-rated gigs
   - How it works section

2. **Browse Gigs**
   - Search bar
   - Category filters
   - Price range filter
   - Rating filter
   - Delivery time filter
   - Sort options
   - Grid/List view toggle

3. **Gig Detail Page**
   - Gig images/video
   - Description
   - Package options
   - Freelancer profile preview
   - Reviews section
   - FAQ
   - Related gigs

4. **Freelancer Profile**
   - Profile info
   - Portfolio
   - Active gigs
   - Reviews and ratings
   - Response time
   - Contact button

### **Client Dashboard**
1. **Dashboard**
   - Active orders
   - Order history
   - Saved gigs/freelancers
   - Messages

2. **Orders**
   - Order list (all statuses)
   - Order detail page
   - Track order progress
   - Request revisions
   - Accept delivery

3. **Messages**
   - Conversation list
   - Chat interface

### **Freelancer Dashboard**
1. **Dashboard**
   - Earnings overview
   - Active orders
   - Order requests
   - Analytics

2. **Gigs Management**
   - Create new gig
   - Edit gigs
   - View gig performance
   - Pause/Activate gigs

3. **Orders**
   - Incoming orders
   - Active orders
   - Order history
   - Deliver work

4. **Earnings**
   - Earnings overview
   - Pending balance
   - Available balance
   - Withdrawal history
   - Request withdrawal

5. **Messages**
   - Conversation list
   - Chat interface

---

## 💳 Payment Integration

### **Recommended Payment Gateways**
1. **Paystack** (Primary)
   - Bank cards
   - Bank transfer
   - USSD
   - Mobile money

2. **Flutterwave** (Secondary)
   - Similar features to Paystack
   - International cards support

### **Payment Flow**
1. Client places order → Payment held in escrow
2. Freelancer completes work → Delivers
3. Client reviews and accepts → Payment released to freelancer
4. If dispute → Admin intervention → Refund or release

### **Withdrawal Options**
- Bank transfer (Nigerian banks)
- Mobile money
- (Future: Crypto wallets)

---

## 🎨 Design Considerations

### **Nigerian Context**
- Support for ₦ (Naira) and $ (Dollar) pricing
- Nigerian bank integration
- Local payment methods (USSD, mobile money)
- Nigerian time zones
- Local language support (English primary, Pidgin future)

### **UI/UX**
- Mobile-first design (high mobile usage in Nigeria)
- Fast loading times (consider data costs)
- Clear pricing display
- Trust indicators (verified badges, ratings)
- Easy navigation

---

## 🔒 Security & Trust

- [ ] Email/Phone verification
- [ ] KYC verification for freelancers (optional)
- [ ] Escrow payment system
- [ ] Dispute resolution system
- [ ] Content moderation
- [ ] Spam detection
- [ ] Rate limiting
- [ ] SSL/HTTPS

---

## 📊 Analytics & Metrics

### **For Freelancers**
- Views, clicks, orders
- Conversion rates
- Earnings trends
- Response time metrics

### **For Platform**
- Total users (freelancers/clients)
- Active gigs
- Orders completed
- Revenue
- Popular categories

---

## 🚀 Future Features (Post-MVP)

- [ ] Video calls integration
- [ ] Milestone-based payments
- [ ] Subscription plans for freelancers
- [ ] Featured gigs (promoted listings)
- [ ] Freelancer teams
- [ ] Project management tools
- [ ] Time tracking
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Referral program
- [ ] Affiliate system
- [ ] Advanced analytics
- [ ] AI-powered gig recommendations
- [ ] Certification programs
- [ ] Learning resources

---

## 🛠️ Technology Stack

### **Frontend** (Current Stack)
- ✅ React 18 + TypeScript
- ✅ Vite
- ✅ React Router
- ✅ shadcn-ui + Tailwind CSS
- ✅ React Query
- ✅ React Hook Form + Zod
- ✅ Lucide React (icons)

### **Backend**
- ✅ Supabase (PostgreSQL, Auth, Storage, Realtime)
- ✅ Supabase Edge Functions (for payment webhooks)

### **Additional Packages Needed**
- [ ] `@paystack/paystack-sdk` or `flutterwave-node-v3`
- [ ] `socket.io-client` (for real-time messaging)
- [ ] `react-infinite-scroll-component` (for pagination)
- [ ] `react-image-gallery` (for gig images)
- [ ] `react-dropzone` (for file uploads)
- [ ] `date-fns` (already installed)

### **Storage**
- Supabase Storage (for portfolio images, deliverables)

---

## 📋 Development Phases

### **Phase 1: Foundation (Week 1-2)**
- Database schema setup
- Authentication system
- Basic profile creation
- Homepage and navigation

### **Phase 2: Core Features (Week 3-4)**
- Gig creation and management
- Browse and search gigs
- Order placement
- Basic messaging

### **Phase 3: Payments (Week 5)**
- Payment gateway integration
- Escrow system
- Withdrawal system

### **Phase 4: Order Management (Week 6)**
- Order tracking
- Delivery system
- Revision requests
- Order completion

### **Phase 5: Reviews & Polish (Week 7)**
- Review system
- Notifications
- Admin panel basics
- Testing and bug fixes

### **Phase 6: Launch Prep (Week 8)**
- Final testing
- Performance optimization
- Documentation
- Deployment

---

## 🎯 Success Metrics

- Number of registered freelancers
- Number of active gigs
- Number of completed orders
- Average order value
- Freelancer earnings
- Platform revenue (commission)
- User retention rate
- Average rating

---

## 📝 Notes

- Monetization strategy detailed above (20% commission recommended for MVP)
- Implement proper error handling and user feedback
- Ensure responsive design for all screen sizes
- Plan for scalability from the start
- Consider SEO optimization
- Plan for Nigerian regulations (data protection, etc.)

---

## ❓ Questions to Consider

1. ~~What commission percentage should the platform take?~~ ✅ **Recommended: 20%**
2. Minimum withdrawal amount? **Recommended: ₦2,000**
3. Verification requirements for freelancers?
4. Dispute resolution process details?
5. Refund policy?
6. Platform name? (Using "NaijaFreelance" as placeholder)
7. Launch with subscriptions or add later? **Recommended: Add after 3-6 months**

---

**Ready to start building? Let me know which phase you'd like to begin with!**

