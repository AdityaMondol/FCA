# Database Setup

## Running the Schema

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `schema.sql`
4. Click "Run" to execute

## Adding Sample Data

1. After running the schema, copy and paste `seed-data.sql`
2. Click "Run" to add sample data

## Schema Overview

### Tables Created

1. **profiles** - User profile information
2. **teachers** - Teacher-specific data and verification status
3. **notices** - Academy announcements and notices
4. **media** - File uploads and media gallery

### Key Features

- **Automatic timestamps** - `created_at` and `updated_at` fields
- **Foreign key relationships** - Proper data integrity
- **Check constraints** - Data validation at database level
- **Indexes** - Optimized for common queries
- **Triggers** - Automatic profile creation on user registration

### Security

- All tables will have Row Level Security (RLS) enabled in the next step
- Foreign key constraints ensure data integrity
- Check constraints validate enum values

## Next Steps

After running the schema:
1. Configure Row Level Security policies (Task 5)
2. Test database connections from backend
3. Verify data can be inserted and queried properly