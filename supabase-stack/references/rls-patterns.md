# RLS Patterns — Row Level Security

## Why RLS Matters

Without RLS, any request using your `anon` key can read, insert, update, or delete any row in any table — regardless of which user made the request. RLS moves authorization into the database itself, so it cannot be bypassed by client-side code.

Rule: **Enable RLS before you insert any user data into a table.**

```sql
-- Enable on a table (does NOT add policies — blocks all access by default)
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;
```

Once RLS is enabled with no policies, no rows are accessible via the anon or authenticated key. Add policies to grant selective access.

---

## Core Helper Functions

```sql
-- Current authenticated user ID (returns UUID or null for anon requests)
auth.uid()

-- Current user's role ('authenticated', 'anon', 'service_role')
auth.role()

-- JWT claims (useful for custom claims like 'is_admin')
auth.jwt() -> jsonb
```

---

## Pattern 1: Users See Only Their Own Rows

The most common pattern. Users can CRUD only rows they own.

```sql
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Single policy covering all operations
CREATE POLICY "users_own_posts"
  ON posts
  FOR ALL                        -- SELECT, INSERT, UPDATE, DELETE
  USING (auth.uid() = user_id)  -- applied to SELECT, UPDATE, DELETE
  WITH CHECK (auth.uid() = user_id); -- applied to INSERT, UPDATE
```

Split into separate policies for more granular control:

```sql
CREATE POLICY "select_own" ON posts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "insert_own" ON posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own" ON posts
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own" ON posts
  FOR DELETE USING (auth.uid() = user_id);
```

---

## Pattern 2: Public Read, Authenticated Write

Use for public content (blog posts, products) that anyone can read but only authenticated users can create.

```sql
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon) can read
CREATE POLICY "public_read" ON articles
  FOR SELECT USING (true);

-- Only authenticated users can insert
CREATE POLICY "auth_insert" ON articles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Only the author can update/delete
CREATE POLICY "author_update" ON articles
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "author_delete" ON articles
  FOR DELETE USING (auth.uid() = author_id);
```

---

## Pattern 3: Published vs Draft Content

```sql
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Public sees only published posts
CREATE POLICY "public_sees_published" ON posts
  FOR SELECT USING (
    published = true
    OR auth.uid() = user_id  -- author sees their own drafts
  );

CREATE POLICY "author_write" ON posts
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

## Pattern 4: Admin-Only Access

Use a custom claim in the JWT or a lookup table for admin checks.

### Option A: Lookup table (simpler, no JWT config needed)

```sql
-- Create an admins table
CREATE TABLE admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE sensitive_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_only" ON sensitive_data
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );
```

### Option B: Custom JWT claim (faster — no extra query)

Set `app_metadata.role = 'admin'` via service_role, then:

```sql
CREATE POLICY "admins_only" ON sensitive_data
  FOR ALL USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
```

---

## Pattern 5: Multi-Tenant (Organizations)

Users belong to organizations; they see data belonging to their organizations.

```sql
-- Memberships table
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- 'member', 'admin', 'owner'
  UNIQUE(user_id, org_id)
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Users see projects belonging to their orgs
CREATE POLICY "org_members_see_projects" ON projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.user_id = auth.uid()
        AND memberships.org_id = projects.org_id
    )
  );

-- Only org admins can insert/update/delete projects
CREATE POLICY "org_admins_write_projects" ON projects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.user_id = auth.uid()
        AND memberships.org_id = projects.org_id
        AND memberships.role IN ('admin', 'owner')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.user_id = auth.uid()
        AND memberships.org_id = projects.org_id
        AND memberships.role IN ('admin', 'owner')
    )
  );
```

---

## Pattern 6: Storage RLS

Supabase Storage uses its own RLS on `storage.objects`.

```sql
-- Users can upload to their own folder: avatars/{user_id}/*
CREATE POLICY "users_own_avatars_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "users_own_avatars_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "users_own_avatars_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Public read for public bucket
CREATE POLICY "public_read_avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');
```

---

## Pattern 7: Profiles Table (synced with auth.users)

The `profiles` table should be readable by all authenticated users (to display names/avatars) but writable only by the owner.

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read profiles (for showing names, avatars)
CREATE POLICY "authenticated_read_profiles" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Users can only update their own profile
CREATE POLICY "users_update_own_profile" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Insert is handled by trigger, not the user directly
-- If you do allow insert, restrict it:
CREATE POLICY "users_insert_own_profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

---

## Debugging RLS

Test policies as a specific user using `set_config`:

```sql
-- In Supabase SQL editor: simulate a specific user
BEGIN;
SELECT set_config('request.jwt.claims',
  '{"sub": "USER_UUID_HERE", "role": "authenticated"}',
  true
);
-- Now run your query — RLS will apply as that user
SELECT * FROM posts;
ROLLBACK;
```

Check which policies exist on a table:

```sql
SELECT schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'posts';
```

---

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| `USING` only on UPDATE | Add `WITH CHECK` too — `USING` filters rows to update, `WITH CHECK` validates new values |
| Forgetting to enable RLS | `ALTER TABLE t ENABLE ROW LEVEL SECURITY` |
| Using `auth.uid()` when anon key makes the request | Returns `null` — handle with `auth.uid() IS NOT NULL` check |
| Service role bypasses RLS | Intentional — never use service_role in client-facing code |
| Policy on junction table but not main table | Enable RLS and add policies on every table in the query chain |
