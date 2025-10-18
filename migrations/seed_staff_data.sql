-- Sample Staff Data for Testing
-- This file contains sample staff members for both Management and Front Desk roles

-- Management Staff (Can access all branches)
INSERT INTO public."StaffProfile" (
    id, "userId", "employeeId", "branchId", department, "position", 
    salary, "hireDate", "staffRole", permissions, "isActive"
) VALUES 
-- Management at Colombo Branch
('mgmt-colombo-001', 'staff-mgmt-001', 'MGMT001', 'colombo-branch-id', 'Management', 'Branch Manager', 
 150000.00, '2023-01-15', 'MANAGEMENT', 
 ARRAY['view_all_branches', 'manage_staff', 'view_reports', 'manage_bookings', 'manage_rooms'], 
 true),

-- Management at Negombo Branch  
('mgmt-negombo-001', 'staff-mgmt-002', 'MGMT002', 'negombo-branch-id', 'Management', 'Branch Manager',
 150000.00, '2023-02-01', 'MANAGEMENT',
 ARRAY['view_all_branches', 'manage_staff', 'view_reports', 'manage_bookings', 'manage_rooms'],
 true),

-- Front Desk Staff (Limited to their assigned branch)
INSERT INTO public."StaffProfile" (
    id, "userId", "employeeId", "branchId", department, "position",
    salary, "hireDate", "staffRole", permissions, "isActive"
) VALUES
-- Front Desk at Colombo Branch
('fd-colombo-001', 'staff-fd-001', 'FD001', 'colombo-branch-id', 'Front Desk', 'Receptionist',
 45000.00, '2023-03-01', 'FRONT_DESK',
 ARRAY['manage_bookings', 'check_in_out', 'manage_services', 'view_room_status'],
 true),

('fd-colombo-002', 'staff-fd-002', 'FD002', 'colombo-branch-id', 'Front Desk', 'Senior Receptionist',
 55000.00, '2023-01-20', 'FRONT_DESK',
 ARRAY['manage_bookings', 'check_in_out', 'manage_services', 'view_room_status', 'process_payments'],
 true),

-- Front Desk at Negombo Branch
('fd-negombo-001', 'staff-fd-003', 'FD003', 'negombo-branch-id', 'Front Desk', 'Receptionist',
 45000.00, '2023-03-15', 'FRONT_DESK',
 ARRAY['manage_bookings', 'check_in_out', 'manage_services', 'view_room_status'],
 true),

('fd-negombo-002', 'staff-fd-004', 'FD004', 'negombo-branch-id', 'Front Desk', 'Senior Receptionist',
 55000.00, '2023-02-10', 'FRONT_DESK',
 ARRAY['manage_bookings', 'check_in_out', 'manage_services', 'view_room_status', 'process_payments'],
 true);

-- Sample User accounts for staff (you'll need to create these in the users table)
-- Note: These are placeholder user IDs - you'll need to create actual user accounts
-- and link them to these staff profiles

-- Example of how to create staff user accounts:
-- INSERT INTO public.users (
--     id, email, password, role, status, emailverified, firstname, lastname,
--     phone, dateofbirth, nationality, idtype, idnumber, address, city, postalcode
-- ) VALUES 
-- ('staff-mgmt-001', 'manager.colombo@skynest.com', 'hashed_password', 'STAFF', 'ACTIVE', true,
--  'John', 'Manager', '+94112345678', '1985-05-15', 'Sri Lankan', 'NATIONAL_ID', '123456789V',
--  '123 Hotel Street', 'Colombo', '00100'),
-- 
-- ('staff-fd-001', 'reception.colombo@skynest.com', 'hashed_password', 'STAFF', 'ACTIVE', true,
--  'Sarah', 'Receptionist', '+94112345679', '1990-08-20', 'Sri Lankan', 'NATIONAL_ID', '987654321V',
--  '456 Front Desk Ave', 'Colombo', '00100');

-- Update existing staff profiles to have the new staffRole column
UPDATE public."StaffProfile" 
SET "staffRole" = 'FRONT_DESK', 
    permissions = ARRAY['manage_bookings', 'check_in_out', 'manage_services', 'view_room_status'],
    "isActive" = true
WHERE "staffRole" IS NULL;

