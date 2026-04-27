# Database Schema — SaaS Multi-Tenant (Supabase)

Stack: Supabase (PostgreSQL), Row Level Security, pgcrypto

---

## 1. Extensions

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

## 2. Enums

```sql
CREATE TYPE org_role AS ENUM ('owner', 'admin', 'member');
CREATE TYPE subscription_status AS ENUM ('trialing', 'active', 'past_due', 'canceled', 'unpaid');
CREATE TYPE subscription_plan AS ENUM ('free', 'pro', 'enterprise');
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'expired');
```

---

## 3. Tables

### organizations

```sql
CREATE TABLE organizations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  logo_url      TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### organization_members

```sql
CREATE TABLE organization_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role            org_role NOT NULL DEFAULT 'member',
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);
```

### subscriptions

```sql
CREATE TABLE subscriptions (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
  status                 subscription_status NOT NULL DEFAULT 'trialing',
  plan                   subscription_plan NOT NULL DEFAULT 'free',
  stripe_customer_id     TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  trial_ends_at          TIMESTAMPTZ,
  current_period_end     TIMESTAMPTZ,
  cancel_at_period_end   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### invitations

```sql
CREATE TABLE invitations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  role            org_role NOT NULL DEFAULT 'member',
  token           TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  status          invitation_status NOT NULL DEFAULT 'pending',
  invited_by      UUID NOT NULL REFERENCES auth.users(id),
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, email)
);
```

### onboarding_progress

```sql
CREATE TABLE onboarding_progress (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  current_step    INT NOT NULL DEFAULT 0,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 4. Helper Functions

```sql
-- Check if current user is member of an org
CREATE OR REPLACE FUNCTION is_org_member(org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = org_id
      AND user_id = auth.uid()
  );
$$;

-- Check if current user is admin or owner of an org
CREATE OR REPLACE FUNCTION is_org_admin(org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = org_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
  );
$$;

-- Get current plan for an org
CREATE OR REPLACE FUNCTION get_user_plan(org_id UUID)
RETURNS subscription_plan
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (SELECT plan FROM subscriptions
     WHERE organization_id = org_id
       AND status IN ('active', 'trialing')),
    'free'
  );
$$;
```

---

## 5. Triggers

### update_updated_at (generic)

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_onboarding_updated_at
  BEFORE UPDATE ON onboarding_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### handle_new_user — auto-create org on signup

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_org_id UUID;
  base_slug  TEXT;
  final_slug TEXT;
  counter    INT := 0;
BEGIN
  -- Build slug from email prefix
  base_slug := lower(regexp_replace(split_part(NEW.email, '@', 1), '[^a-z0-9]', '-', 'g'));
  final_slug := base_slug;

  -- Ensure slug uniqueness
  WHILE EXISTS (SELECT 1 FROM organizations WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;

  -- Create org
  INSERT INTO organizations (name, slug)
  VALUES (split_part(NEW.email, '@', 1), final_slug)
  RETURNING id INTO new_org_id;

  -- Add user as owner
  INSERT INTO organization_members (organization_id, user_id, role)
  VALUES (new_org_id, NEW.id, 'owner');

  -- Create free subscription
  INSERT INTO subscriptions (organization_id, plan, status)
  VALUES (new_org_id, 'free', 'trialing');

  -- Init onboarding
  INSERT INTO onboarding_progress (user_id, organization_id)
  VALUES (NEW.id, new_org_id);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## 6. Row Level Security (RLS)

```sql
ALTER TABLE organizations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations          ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_progress  ENABLE ROW LEVEL SECURITY;
```

### organizations policies

```sql
CREATE POLICY "org_select" ON organizations
  FOR SELECT USING (is_org_member(id));

CREATE POLICY "org_insert" ON organizations
  FOR INSERT WITH CHECK (TRUE); -- handled by trigger only; lock down in prod via service role

CREATE POLICY "org_update" ON organizations
  FOR UPDATE USING (is_org_admin(id));

CREATE POLICY "org_delete" ON organizations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = id
        AND user_id = auth.uid()
        AND role = 'owner'
    )
  );
```

### organization_members policies

```sql
CREATE POLICY "members_select" ON organization_members
  FOR SELECT USING (is_org_member(organization_id));

CREATE POLICY "members_insert" ON organization_members
  FOR INSERT WITH CHECK (is_org_admin(organization_id));

CREATE POLICY "members_update" ON organization_members
  FOR UPDATE USING (is_org_admin(organization_id));

CREATE POLICY "members_delete" ON organization_members
  FOR DELETE USING (
    -- admins can remove others; members can remove themselves
    is_org_admin(organization_id) OR user_id = auth.uid()
  );
```

### subscriptions policies

```sql
CREATE POLICY "sub_select" ON subscriptions
  FOR SELECT USING (is_org_member(organization_id));

-- Only service role writes subscriptions (via webhook)
CREATE POLICY "sub_insert" ON subscriptions
  FOR INSERT WITH CHECK (FALSE);

CREATE POLICY "sub_update" ON subscriptions
  FOR UPDATE USING (FALSE);
```

### invitations policies

```sql
CREATE POLICY "inv_select" ON invitations
  FOR SELECT USING (
    is_org_member(organization_id)
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "inv_insert" ON invitations
  FOR INSERT WITH CHECK (is_org_admin(organization_id));

CREATE POLICY "inv_update" ON invitations
  FOR UPDATE USING (
    is_org_admin(organization_id)
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "inv_delete" ON invitations
  FOR DELETE USING (is_org_admin(organization_id));
```

### onboarding_progress policies

```sql
CREATE POLICY "onboarding_select" ON onboarding_progress
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "onboarding_insert" ON onboarding_progress
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "onboarding_update" ON onboarding_progress
  FOR UPDATE USING (user_id = auth.uid());
```

---

## 7. Indexes

```sql
CREATE INDEX idx_org_members_user_id   ON organization_members(user_id);
CREATE INDEX idx_org_members_org_id    ON organization_members(organization_id);
CREATE INDEX idx_subscriptions_org_id  ON subscriptions(organization_id);
CREATE INDEX idx_subscriptions_stripe  ON subscriptions(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;
CREATE INDEX idx_invitations_token     ON invitations(token);
CREATE INDEX idx_invitations_email     ON invitations(email);
CREATE INDEX idx_invitations_org_id    ON invitations(organization_id);
CREATE INDEX idx_onboarding_user_id    ON onboarding_progress(user_id);
```

---

## 8. Test Data

```sql
-- Run ONLY in development / staging
DO $$
DECLARE
  org1_id UUID := gen_random_uuid();
  org2_id UUID := gen_random_uuid();
  user1_id UUID := gen_random_uuid();
  user2_id UUID := gen_random_uuid();
BEGIN
  INSERT INTO organizations (id, name, slug) VALUES
    (org1_id, 'Acme Corp',    'acme-corp'),
    (org2_id, 'Globex Inc',   'globex-inc');

  -- Members (assumes auth.users rows already exist with these IDs)
  INSERT INTO organization_members (organization_id, user_id, role) VALUES
    (org1_id, user1_id, 'owner'),
    (org1_id, user2_id, 'member'),
    (org2_id, user2_id, 'owner');

  INSERT INTO subscriptions (organization_id, plan, status, trial_ends_at) VALUES
    (org1_id, 'pro',  'active',   NULL),
    (org2_id, 'free', 'trialing', now() + INTERVAL '14 days');

  INSERT INTO invitations (organization_id, email, role, invited_by) VALUES
    (org1_id, 'newbie@example.com', 'member', user1_id);
END $$;
```
