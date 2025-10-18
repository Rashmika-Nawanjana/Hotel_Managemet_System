-- Add staff role enum for Management vs Front Desk
CREATE TYPE public.staff_role AS ENUM (
    'MANAGEMENT',
    'FRONT_DESK'
);

-- Add staff_role column to StaffProfile table
ALTER TABLE public."StaffProfile" 
ADD COLUMN "staffRole" public.staff_role DEFAULT 'FRONT_DESK'::public.staff_role;

-- Add permissions column to StaffProfile for granular access control
ALTER TABLE public."StaffProfile" 
ADD COLUMN permissions text[] DEFAULT '{}';

-- Add is_active column to StaffProfile
ALTER TABLE public."StaffProfile" 
ADD COLUMN "isActive" boolean DEFAULT true;

-- Add last_login_at column to StaffProfile
ALTER TABLE public."StaffProfile" 
ADD COLUMN "lastLoginAt" timestamp without time zone;

-- Create indexes for better performance
CREATE INDEX idx_staffprofile_branch_id ON public."StaffProfile"("branchId");
CREATE INDEX idx_staffprofile_staff_role ON public."StaffProfile"("staffRole");
CREATE INDEX idx_staffprofile_user_id ON public."StaffProfile"("userId");

-- Add comments for documentation
COMMENT ON COLUMN public."StaffProfile"."staffRole" IS 'MANAGEMENT: Can view all branches, manage staff, access reports. FRONT_DESK: Limited to assigned branch operations';
COMMENT ON COLUMN public."StaffProfile".permissions IS 'Array of specific permissions for granular access control';
COMMENT ON COLUMN public."StaffProfile"."isActive" IS 'Whether the staff member is currently active and can log in';

