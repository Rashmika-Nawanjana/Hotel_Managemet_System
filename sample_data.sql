-- Sample data for testing the booking system
-- This will add branches, room types, rooms, and amenities

-- Insert sample branches
INSERT INTO "Branch" (id, name, slug, location, address, phone, email, "totalRooms", status) VALUES
('11111111-1111-1111-1111-111111111111', 'Sky Nest Colombo', 'sky-nest-colombo', 'Colombo', '123 Galle Road, Colombo 03', '+94 11 234 5678', 'colombo@skynest.com', 50, 'operational'),
('22222222-2222-2222-2222-222222222222', 'Sky Nest Kandy', 'sky-nest-kandy', 'Kandy', '456 Peradeniya Road, Kandy', '+94 81 234 5678', 'kandy@skynest.com', 30, 'operational');

-- Insert sample amenities
INSERT INTO "Amenities" (id, name, icon, description, category) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Free WiFi', '📶', 'High-speed internet access', 'TECHNOLOGY'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Air Conditioning', '❄️', 'Climate control system', 'COMFORT'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Mini Bar', '🍷', 'In-room refreshments', 'FOOD_BEVERAGE'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Room Service', '🍽️', '24/7 room service', 'FOOD_BEVERAGE'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Safe', '🔒', 'In-room safety deposit box', 'SAFETY'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Balcony', '🌅', 'Private outdoor space', 'COMFORT'),
('gggggggg-gggg-gggg-gggg-gggggggggggg', 'Ocean View', '🌊', 'Stunning ocean views', 'COMFORT'),
('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'Spa Access', '🧘', 'Access to hotel spa facilities', 'COMFORT');

-- Insert sample room types
INSERT INTO "RoomType" (id, name, slug, description, "shortDescription", "basePrice", "maxOccupancy", "bedType", "numberOfBeds", "roomSize", "viewType", "branchId", status, "isFeatured", popularity_score) VALUES
('33333333-3333-3333-3333-333333333333', 'Deluxe Ocean View', 'deluxe-ocean-view', 'Spacious room with stunning ocean views and modern amenities', 'Ocean view with balcony', 150.00, 2, 'King Bed', 1, 35, 'Ocean', '11111111-1111-1111-1111-111111111111', 'active', true, 95),
('44444444-4444-4444-4444-444444444444', 'Executive Suite', 'executive-suite', 'Luxurious suite with separate living area and premium amenities', 'Premium suite experience', 250.00, 4, 'King Bed', 1, 60, 'City', '11111111-1111-1111-1111-111111111111', 'active', true, 90),
('55555555-5555-5555-5555-555555555555', 'Standard Room', 'standard-room', 'Comfortable room with essential amenities', 'Comfortable and affordable', 80.00, 2, 'Queen Bed', 1, 25, 'Garden', '11111111-1111-1111-1111-111111111111', 'active', false, 75),
('66666666-6666-6666-6666-666666666666', 'Family Room', 'family-room', 'Perfect for families with connecting rooms', 'Family-friendly accommodation', 120.00, 6, 'Twin Beds', 2, 45, 'Garden', '22222222-2222-2222-2222-222222222222', 'active', false, 80);

-- Insert room type amenities
INSERT INTO "RoomTypeAmenity" ("roomTypeId", "amenityId") VALUES
-- Deluxe Ocean View amenities
('33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
('33333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
('33333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
('33333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd'),
('33333333-3333-3333-3333-333333333333', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'),
('33333333-3333-3333-3333-333333333333', 'ffffffff-ffff-ffff-ffff-ffffffffffff'),
('33333333-3333-3333-3333-333333333333', 'gggggggg-gggg-gggg-gggg-gggggggggggg'),
-- Executive Suite amenities
('44444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
('44444444-4444-4444-4444-444444444444', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
('44444444-4444-4444-4444-444444444444', 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
('44444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd'),
('44444444-4444-4444-4444-444444444444', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'),
('44444444-4444-4444-4444-444444444444', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh'),
-- Standard Room amenities
('55555555-5555-5555-5555-555555555555', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
('55555555-5555-5555-5555-555555555555', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
('55555555-5555-5555-5555-555555555555', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'),
-- Family Room amenities
('66666666-6666-6666-6666-666666666666', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
('66666666-6666-6666-6666-666666666666', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
('66666666-6666-6666-6666-666666666666', 'dddddddd-dddd-dddd-dddd-dddddddddddd'),
('66666666-6666-6666-6666-666666666666', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee');

-- Insert sample room images
INSERT INTO "RoomImage" (id, url, caption, "altText", "isPrimary", "order", "roomTypeId") VALUES
-- Deluxe Ocean View images
('img111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', 'Deluxe Ocean View Room', 'Luxurious room with ocean view', true, 1, '33333333-3333-3333-3333-333333333333'),
('img222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', 'Ocean View Balcony', 'Private balcony overlooking the ocean', false, 2, '33333333-3333-3333-3333-333333333333'),
-- Executive Suite images
('img333333-3333-3333-3333-333333333333', 'https://images.unsplash.com/photo-1611892440501-80d6ce6665af?w=800', 'Executive Suite Living Area', 'Spacious living area in executive suite', true, 1, '44444444-4444-4444-4444-444444444444'),
('img444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800', 'Executive Suite Bedroom', 'Luxurious bedroom with king bed', false, 2, '44444444-4444-4444-4444-444444444444'),
-- Standard Room images
('img555555-5555-5555-5555-555555555555', 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800', 'Standard Room', 'Comfortable standard room', true, 1, '55555555-5555-5555-5555-555555555555'),
-- Family Room images
('img666666-6666-6666-6666-666666666666', 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800', 'Family Room', 'Spacious family room with twin beds', true, 1, '66666666-6666-6666-6666-666666666666');

-- Insert sample rooms
INSERT INTO "Room" (id, "roomNumber", floor, "roomTypeId", "branchId", status) VALUES
-- Deluxe Ocean View rooms
('room1111-1111-1111-1111-111111111111', '101', 1, '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'AVAILABLE'),
('room2222-2222-2222-2222-222222222222', '102', 1, '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'AVAILABLE'),
('room3333-3333-3333-3333-333333333333', '103', 1, '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'AVAILABLE'),
-- Executive Suite rooms
('room4444-4444-4444-4444-444444444444', '201', 2, '44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'AVAILABLE'),
('room5555-5555-5555-5555-555555555555', '202', 2, '44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'AVAILABLE'),
-- Standard Room rooms
('room6666-6666-6666-6666-666666666666', '301', 3, '55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'AVAILABLE'),
('room7777-7777-7777-7777-777777777777', '302', 3, '55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'AVAILABLE'),
('room8888-8888-8888-8888-888888888888', '303', 3, '55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'AVAILABLE'),
-- Family Room rooms
('room9999-9999-9999-9999-999999999999', '401', 4, '66666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', 'AVAILABLE'),
('roomaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '402', 4, '66666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', 'AVAILABLE');

