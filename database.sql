-- 1. Create Profiles table (extends Supabase Auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  wallet_balance DECIMAL(12,2) DEFAULT 0.00,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES profiles(id),
  address_line TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2. Create Deals table
CREATE TABLE deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  store_name TEXT NOT NULL,
  category TEXT,
  original_price DECIMAL(12,2),
  discount_percent INTEGER,
  image_url TEXT,
  description TEXT,
  required_members INTEGER DEFAULT 5,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired')),
  vendor_email TEXT,
  expiry_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 3. Create Group Members table (to track who joined which deal)
CREATE TABLE group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(deal_id, user_id)
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- 5. Policies
-- Profiles: Users can view all profiles but only update their own
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Deals: Everyone can view active deals, creators can insert
CREATE POLICY "Deals are viewable by everyone" ON deals FOR SELECT USING (true);
CREATE POLICY "Users can create deals" ON deals FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- Group Members: Everyone can see who joined what, users can join/leave
CREATE POLICY "Group members are viewable by everyone" ON group_members FOR SELECT USING (true);
CREATE POLICY "Users can join deals" ON group_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave deals" ON group_members FOR DELETE USING (auth.uid() = user_id);

-- 6. Create Deal Discussion table (for group buy chats)
CREATE TABLE deal_discussion (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'user' CHECK (type IN ('user', 'system')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE deal_discussion ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Discussion viewable by everyone" ON deal_discussion FOR SELECT USING (true);
CREATE POLICY "Users can post comments" ON deal_discussion FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. Trigger to automatically log a system comment when someone joins a deal
CREATE OR REPLACE FUNCTION notify_group_join()
RETURNS TRIGGER AS $$
DECLARE
  username TEXT;
BEGIN
  SELECT full_name INTO username FROM profiles WHERE id = NEW.user_id;
  INSERT INTO deal_discussion (deal_id, user_id, message, type)
  VALUES (NEW.deal_id, NULL, COALESCE(username, 'A new member') || ' joined the group!', 'system');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_group_member_join
  AFTER INSERT ON group_members
  FOR EACH ROW EXECUTE FUNCTION notify_group_join();

-- 8. Trigger to automatically create a profile for new auth users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, referral_code)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    UPPER(SPLIT_PART(new.email, '@', 1)) || FLOOR(RANDOM() * 900 + 100)::text
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

