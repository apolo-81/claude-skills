# Schema Patterns — Supabase + PostgreSQL

## Pattern 1: Profiles (synced with auth.users)

The `auth.users` table is internal to Supabase and cannot be directly joined in queries. Create a `profiles` table in the public schema and sync it via a trigger.

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "own_update" ON profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Trigger: runs after every new user in auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

### TypeScript usage

```typescript
// Get profile with posts count
const { data: profile } = await supabase
  .from('profiles')
  .select('*, posts(count)')
  .eq('username', username)
  .single()

// Update own profile
const { error } = await supabase
  .from('profiles')
  .update({ full_name: 'Jane Doe', bio: 'Developer' })
  .eq('id', user.id)
```

---

## Pattern 2: Posts / Content

General-purpose content table with support for drafts, slugs, and rich text.

```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,          -- markdown or HTML
  excerpt TEXT,
  cover_image_url TEXT,
  published BOOLEAN DEFAULT false NOT NULL,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Index for slug lookups and user queries
CREATE INDEX posts_slug_idx ON posts(slug);
CREATE INDEX posts_user_id_idx ON posts(user_id);
CREATE INDEX posts_published_idx ON posts(published, published_at DESC);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Public sees published posts
CREATE POLICY "public_read_published" ON posts
  FOR SELECT USING (published = true OR auth.uid() = user_id);

-- Authors manage their own posts
CREATE POLICY "authors_write" ON posts
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Auto-update slug and timestamps
CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

### Generate unique slug (TypeScript utility)

```typescript
function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

async function createPost(title: string, content: string, userId: string) {
  const supabase = createClient()
  const baseSlug = toSlug(title)

  // Check for slug collision and append suffix if needed
  let slug = baseSlug
  let attempt = 0
  while (true) {
    const { data } = await supabase.from('posts').select('id').eq('slug', slug).maybeSingle()
    if (!data) break
    slug = `${baseSlug}-${++attempt}`
  }

  return supabase.from('posts')
    .insert({ title, content, slug, user_id: userId })
    .select().single()
}
```

---

## Pattern 3: Files / Documents

Track uploaded files in the database alongside their Storage path.

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,              -- original filename
  storage_path TEXT NOT NULL,      -- path in Supabase Storage bucket
  bucket TEXT NOT NULL DEFAULT 'documents',
  mime_type TEXT,
  size_bytes BIGINT,
  is_public BOOLEAN DEFAULT false NOT NULL,
  metadata JSONB DEFAULT '{}',     -- extensible: tags, dimensions, etc.
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX documents_user_id_idx ON documents(user_id);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_documents" ON documents
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Public documents readable by anyone
CREATE POLICY "public_documents_read" ON documents
  FOR SELECT USING (is_public = true);
```

### Avatar upload pattern (complete flow)

```typescript
// components/AvatarUpload.tsx
'use client'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { useState } from 'react'

export function AvatarUpload() {
  const { user } = useUser()
  const [uploading, setUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const supabase = createClient()

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file || !user) return

    setUploading(true)

    try {
      const ext = file.name.split('.').pop()
      const path = `${user.id}/avatar.${ext}`

      // Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(path)

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      setAvatarUrl(publicUrl)
    } catch (error) {
      console.error('Avatar upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {avatarUrl && (
        <img src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
      )}
      <label className="cursor-pointer bg-gray-100 px-4 py-2 rounded text-sm hover:bg-gray-200">
        {uploading ? 'Uploading...' : 'Upload avatar'}
        <input type="file" accept="image/*" onChange={uploadAvatar}
          disabled={uploading} className="hidden" />
      </label>
    </div>
  )
}
```

---

## Pattern 4: Notifications

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,            -- 'mention', 'like', 'follow', 'system'
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,                     -- optional deep link in app
  read_at TIMESTAMPTZ,           -- null = unread
  data JSONB DEFAULT '{}',       -- extensible payload
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX notifications_user_id_unread ON notifications(user_id, created_at DESC)
  WHERE read_at IS NULL;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_notifications" ON notifications
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### Real-time notification listener

```typescript
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'

export function NotificationBell() {
  const { user } = useUser()
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    if (!user) return

    // Load initial count
    supabase.from('notifications')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id)
      .is('read_at', null)
      .then(({ count }) => setUnreadCount(count ?? 0))

    // Subscribe to new notifications
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        setUnreadCount(prev => prev + 1)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user])

  return (
    <button className="relative">
      Bell
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  )
}
```

---

## Pattern 5: Multi-Tenant SaaS

Full schema for an app where users belong to organizations and work on shared resources.

```sql
-- Organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'free' NOT NULL,  -- 'free', 'pro', 'enterprise'
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Memberships (junction table)
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',  -- 'owner', 'admin', 'member'
  invited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, org_id)
);

-- Projects (org-scoped resources)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX memberships_user_id_idx ON memberships(user_id);
CREATE INDEX memberships_org_id_idx ON memberships(org_id);
CREATE INDEX projects_org_id_idx ON projects(org_id);

-- RLS on organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members_see_their_orgs" ON organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.user_id = auth.uid()
        AND memberships.org_id = organizations.id
    )
  );

-- RLS on memberships
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members_see_org_members" ON memberships
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM memberships m2
      WHERE m2.user_id = auth.uid() AND m2.org_id = memberships.org_id
    )
  );

CREATE POLICY "admins_manage_members" ON memberships
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM memberships m2
      WHERE m2.user_id = auth.uid()
        AND m2.org_id = memberships.org_id
        AND m2.role IN ('owner', 'admin')
    )
  );

-- RLS on projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members_see_projects" ON projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.user_id = auth.uid()
        AND memberships.org_id = projects.org_id
    )
  );

CREATE POLICY "admins_write_projects" ON projects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.user_id = auth.uid()
        AND memberships.org_id = projects.org_id
        AND memberships.role IN ('owner', 'admin')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.user_id = auth.uid()
        AND memberships.org_id = projects.org_id
        AND memberships.role IN ('owner', 'admin')
    )
  );

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

### TypeScript: Get user's organizations with projects

```typescript
const { data: orgs } = await supabase
  .from('organizations')
  .select(`
    id,
    name,
    slug,
    plan,
    memberships!inner(role),
    projects(id, name, status)
  `)
  .order('created_at')

// memberships!inner ensures only orgs where the user is a member are returned
```

---

## Useful SQL Utilities

```sql
-- Auto-generate slugs from name
CREATE OR REPLACE FUNCTION generate_slug(input TEXT)
RETURNS TEXT LANGUAGE plpgsql AS $$
BEGIN
  RETURN regexp_replace(
    lower(trim(input)),
    '[^a-z0-9]+', '-', 'g'
  );
END;
$$;

-- Soft delete pattern
ALTER TABLE posts ADD COLUMN deleted_at TIMESTAMPTZ;

-- RLS addition for soft delete: exclude deleted rows
CREATE POLICY "hide_deleted" ON posts
  FOR SELECT USING (deleted_at IS NULL AND (published = true OR auth.uid() = user_id));

-- Soft delete function
CREATE OR REPLACE FUNCTION soft_delete_post(post_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE posts SET deleted_at = now()
  WHERE id = post_id AND user_id = auth.uid();
END;
$$;
```
