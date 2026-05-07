# 3D Print Quote Portal

A full-stack web application that streamlines the 3D printing quote request lifecycle. Customers can submit structured quote requests with file uploads and specifications, while administrators can review, price, and manage requests through a centralized dashboard.

## Project Overview

The 3D Print Quote Portal replaces informal quote processes (email/chat) with a trackable workflow. It enables customers to request quotes for 3D printing services by uploading model files and specifying materials, colors, and delivery preferences. Admin staff can then review submissions, set pricing, and communicate with customers through status updates and notes.

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.2.4 | React framework (App Router) |
| React | 19.2.4 | UI library |
| TypeScript | ^5 | Type safety |
| Tailwind CSS | ^4 | Styling |
| Supabase | ^2.105.1 | Backend (database, auth, storage) |
| @supabase/ssr | ^0.10.2 | Server-side auth handling |

## Main Features

- **Authentication System** - Email/password registration with email verification
- **Quote Request Management** - Customers submit detailed requests with file uploads
- **Admin Dashboard** - Centralized interface to manage all quote requests
- **Status Tracking** - Track quotes through Pending, Approved, Rejected, Completed
- **File Upload Support** - Upload 3D models (STL, OBJ, 3MF) and reference images
- **Role-Based Access** - Customer and Admin roles with appropriate permissions

## Customer Features

- **User Registration & Login** - Secure authentication with email confirmation
- **Quote Request Form** - Submit requests with the following fields:
  - Project Title (required)
  - Description (required)
  - Material Selection (PLA, ABS, PETG, TPU, Resin, Nylon, Other)
  - Color Selection (White, Black, Gray, Red, Blue, Green, Yellow, Orange, Other)
  - Quantity (minimum 1)
  - Deadline (optional date picker)
  - Delivery Method (Pickup, Standard Shipping, Express Shipping)
  - Phone Number (required)
  - File Upload (STL, OBJ, 3MF, PNG, JPG, PDF - max 25MB)
- **Customer Dashboard** - View all personal quote requests with status badges
- **Quote Details** - View admin responses, pricing, and notes
- **Status Tracking** - Monitor where quotes are in the pipeline

## Admin Features

- **Admin Dashboard** - View all quote requests in a table format
- **Quote Management** - Update status, add pricing, and notes for each request
- **Status Updates** - Change quote status (Pending, Approved, Rejected, Completed)
- **Pricing Control** - Set quote amounts for customer review
- **Customer Communication** - Add notes visible to customers
- **File Access** - View customer-uploaded files via secure links

## Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)

2. Run the following SQL scripts in your Supabase SQL Editor:

   **Create quote_requests table** (`supabase_quote_requests.sql`):
   ```sql
   CREATE TABLE quote_requests (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users NOT NULL,
     project_title TEXT NOT NULL,
     description TEXT NOT NULL,
     material TEXT,
     color TEXT,
     quantity INTEGER DEFAULT 1,
     deadline DATE,
     delivery_method TEXT NOT NULL,
     phone TEXT NOT NULL,
     status TEXT DEFAULT 'Pending',
     file_url TEXT,
     admin_notes TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );

   ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "Users can view own quote requests"
     ON quote_requests FOR SELECT
     USING (auth.uid() = user_id);

   CREATE POLICY "Users can insert own requests"
     ON quote_requests FOR INSERT
     WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Authenticated users can update requests"
     ON quote_requests FOR UPDATE
     USING (auth.role() = 'authenticated');
   ```

   **Create profiles table and storage** (`supabase-setup.sql`):
   ```sql
   CREATE TABLE profiles (
     id UUID REFERENCES auth.users PRIMARY KEY,
     full_name TEXT,
     email TEXT,
     role TEXT DEFAULT 'customer',
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );

   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "Users can view own profile"
     ON profiles FOR SELECT
     USING (auth.uid() = id);

   CREATE POLICY "Users can update own profile"
     ON profiles FOR UPDATE
     USING (auth.uid() = id);

   CREATE OR REPLACE FUNCTION handle_new_user()
   RETURNS TRIGGER AS $$
   BEGIN
     INSERT INTO public.profiles (id, full_name, email)
     VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;

   CREATE TRIGGER on_auth_user_created
     AFTER INSERT ON auth.users
     FOR EACH ROW EXECUTE FUNCTION handle_new_user();

   INSERT INTO storage.buckets (id, name, public)
   VALUES ('quote-files', 'quote-files', false);

   CREATE POLICY "Authenticated users can upload files"
     ON storage.objects FOR INSERT
     WITH CHECK (bucket_id = 'quote-files' AND auth.role() = 'authenticated');

   CREATE POLICY "Authenticated users can view their own files"
     ON storage.objects FOR SELECT
     USING (bucket_id = 'quote-files' AND auth.role() = 'authenticated');

   CREATE POLICY "Authenticated users can delete their own files"
     ON storage.objects FOR DELETE
     USING (bucket_id = 'quote-files' AND auth.role() = 'authenticated');
   ```

## Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Find these values in your Supabase project settings under Project Settings > API.

## How to Run Locally

### Prerequisites
- Node.js installed
- Supabase account with project created
- Database tables and storage bucket configured (see Supabase Setup)

### Steps

1. Navigate to the project directory:
   ```bash
   cd temp-next-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.local.example` to `.env.local` (or create it)
   - Add your Supabase URL and anon key

4. Set up the database:
   - Run the SQL scripts in your Supabase SQL Editor (see Supabase Setup)

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Database Tables Used

### `profiles`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key, references auth.users |
| full_name | TEXT | User's full name |
| email | TEXT | User's email |
| role | TEXT | Default: 'customer' (can be 'admin') |
| created_at | TIMESTAMPTZ | Profile creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### `quote_requests`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key, default gen_random_uuid() |
| user_id | UUID | References auth.users |
| project_title | TEXT | Required |
| description | TEXT | Required |
| material | TEXT | Nullable |
| color | TEXT | Nullable |
| quantity | INTEGER | Default: 1 |
| deadline | DATE | Nullable |
| delivery_method | TEXT | Required |
| phone | TEXT | Required |
| status | TEXT | Default: 'Pending' |
| file_url | TEXT | Nullable |
| admin_notes | TEXT | Nullable |
| created_at | TIMESTAMPTZ | Default: NOW() |
| updated_at | TIMESTAMPTZ | Default: NOW() |

## Storage Bucket Used

**Bucket Name:** `quote-files`

- **Public:** No (private bucket)
- **Purpose:** Store customer-uploaded files (3D models, reference images)
- **Allowed File Types:** STL, OBJ, 3MF, PNG, JPG, PDF
- **Max File Size:** 25MB
- **Access:** Authenticated users can upload, view, and delete their own files

## Future Improvements

- **3D File Viewer** - Browser-based STL/OBJ file preview before submission
- **Automated Pricing Calculator** - Calculate quotes based on file volume and material cost per gram
- **Material Library** - Comprehensive material database with specs and pricing
- **Multi-language Support** - Internationalization for broader accessibility
- **Payment Gateway Integration** - Accept payments directly through the portal
- **Production Scheduling** - Integrate with production calendar for realistic deadlines
- **Analytics Dashboard** - Insights on quote volume, conversion rates, and popular materials
- **Email Notifications** - Automated emails when quote status changes
- **Quote Templates** - Save and reuse common project configurations
- **Admin Role Hierarchy** - Different permission levels for admin staff

---

## Project Structure

```
temp-next-app/
├── app/
│   ├── api/
│   │   ├── auth/callback/route.ts    # Supabase auth callback
│   │   └── quote-requests/
│   │       ├── route.ts               # GET all, POST new
│   │       └── [id]/route.ts          # PATCH update
│   ├── components/
│   │   ├── Navbar.tsx                 # Navigation bar
│   │   └── LogoutButton.tsx          # Logout component
│   ├── dashboard/
│   │   ├── page.tsx                   # Dashboard page
│   │   └── components/
│   │       ├── DashboardTabs.tsx      # Customer view
│   │       └── AdminPanel.tsx         # Admin view
│   ├── login/page.tsx                 # Login page
│   ├── signup/page.tsx                # Registration page
│   ├── request/page.tsx               # Quote request form
│   ├── page.tsx                       # Home page
│   ├── layout.tsx                     # Root layout
│   └── globals.css                    # Global styles
├── lib/
│   └── supabase/
│       ├── client.ts                  # Browser Supabase client
│       ├── server.ts                  # Server Supabase client
│       └── middleware.ts              # Session middleware
├── middleware.ts                       # Next.js middleware
├── package.json
└── README.md
```
