--
-- PostgreSQL database dump
--

\restrict 24ALVWRxXwJxa1aSLRdFPlIdAASS93yhlug4s1yoZHdxgmgmSUqShJ328UwsSaW

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: amenity_category; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.amenity_category AS ENUM (
    'ENTERTAINMENT',
    'COMFORT',
    'BATHROOM',
    'TECHNOLOGY',
    'FOOD_BEVERAGE',
    'SAFETY',
    'ACCESSIBILITY'
);


ALTER TYPE public.amenity_category OWNER TO postgres;

--
-- Name: booking_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.booking_status AS ENUM (
    'PENDING',
    'CONFIRMED',
    'CHECKED_IN',
    'CHECKED_OUT',
    'CANCELLED',
    'NO_SHOW',
    'COMPLETED'
);


ALTER TYPE public.booking_status OWNER TO postgres;

--
-- Name: id_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.id_type AS ENUM (
    'PASSPORT',
    'NATIONAL_ID',
    'DRIVING_LICENSE'
);


ALTER TYPE public.id_type OWNER TO postgres;

--
-- Name: payment_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.payment_status AS ENUM (
    'PENDING',
    'PAID',
    'REFUNDED',
    'FAILED'
);


ALTER TYPE public.payment_status OWNER TO postgres;

--
-- Name: room_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.room_status AS ENUM (
    'AVAILABLE',
    'OCCUPIED',
    'CLEANING',
    'MAINTENANCE',
    'OUT_OF_SERVICE'
);


ALTER TYPE public.room_status OWNER TO postgres;

--
-- Name: user_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role AS ENUM (
    'GUEST',
    'STAFF',
    'ADMIN'
);


ALTER TYPE public.user_role OWNER TO postgres;

--
-- Name: user_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_status AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'SUSPENDED'
);


ALTER TYPE public.user_status OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Amenities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Amenities" (
    id text DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    icon text,
    description text,
    category public.amenity_category NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now()
);


ALTER TABLE public."Amenities" OWNER TO postgres;

--
-- Name: Booking; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Booking" (
    id text DEFAULT gen_random_uuid() NOT NULL,
    "bookingReference" text NOT NULL,
    "userId" text,
    "roomId" text,
    "checkInDate" timestamp without time zone NOT NULL,
    "checkOutDate" timestamp without time zone NOT NULL,
    "numberOfGuests" integer NOT NULL,
    "totalPrice" numeric(10,2) NOT NULL,
    status public.booking_status DEFAULT 'PENDING'::public.booking_status,
    "paymentStatus" public.payment_status DEFAULT 'PENDING'::public.payment_status,
    "specialRequests" text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now()
);


ALTER TABLE public."Booking" OWNER TO postgres;

--
-- Name: Branch; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Branch" (
    id text DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    location text,
    address text,
    phone text,
    email text,
    "totalRooms" integer,
    status text DEFAULT 'operational'::text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now()
);


ALTER TABLE public."Branch" OWNER TO postgres;

--
-- Name: GuestProfile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."GuestProfile" (
    id text DEFAULT gen_random_uuid() NOT NULL,
    "userId " text,
    "loyaltyPoints" integer DEFAULT 0,
    "memberSince" timestamp without time zone DEFAULT now(),
    "totalBookings" integer DEFAULT 0,
    "totalSpent" numeric(10,2) DEFAULT 0,
    "preferredRoomType" text,
    "preferredBedType" text,
    "smokingPreference" text DEFAULT 'non-smoking'::text,
    "floorPreference" text,
    "pillowType" text,
    newsletter boolean DEFAULT true,
    "emailNotifications" boolean DEFAULT true,
    "smsNotifications" boolean DEFAULT true,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now()
);


ALTER TABLE public."GuestProfile" OWNER TO postgres;

--
-- Name: PasswordResetToken; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PasswordResetToken" (
    id text DEFAULT gen_random_uuid() NOT NULL,
    token text NOT NULL,
    "userId" text,
    "expiresAt" timestamp without time zone NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now(),
    used boolean DEFAULT false
);


ALTER TABLE public."PasswordResetToken" OWNER TO postgres;

--
-- Name: PaymentInfo; Type: TABLE; Schema: public; Owner: skynest_user
--

CREATE TABLE public."PaymentInfo" (
    id text DEFAULT gen_random_uuid() NOT NULL,
    "bookingId" text NOT NULL,
    "cardNumber" text NOT NULL,
    "cardExpiry" text NOT NULL,
    "cardCvv" text NOT NULL,
    "cardName" text NOT NULL,
    "billingAddress" text NOT NULL,
    "billingCity" text NOT NULL,
    "billingPostalCode" text NOT NULL,
    "billingCountry" text NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now()
);


ALTER TABLE public."PaymentInfo" OWNER TO skynest_user;

--
-- Name: Room; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Room" (
    id text DEFAULT gen_random_uuid() NOT NULL,
    "roomNumber" text NOT NULL,
    floor integer NOT NULL,
    "roomTypeId" text,
    "branchId" text,
    status public.room_status DEFAULT 'AVAILABLE'::public.room_status,
    notes text,
    "lastCleaned" timestamp without time zone,
    "lastMaintenance" timestamp without time zone,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now()
);


ALTER TABLE public."Room" OWNER TO postgres;

--
-- Name: RoomImage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RoomImage" (
    id text DEFAULT gen_random_uuid() NOT NULL,
    url text NOT NULL,
    caption text,
    "altText" text,
    "isPrimary" boolean DEFAULT false,
    "order" integer DEFAULT 0,
    "roomTypeId" text,
    "createdAt" timestamp without time zone DEFAULT now()
);


ALTER TABLE public."RoomImage" OWNER TO postgres;

--
-- Name: RoomType; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RoomType" (
    id text DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text NOT NULL,
    "shortDescription" character varying(200),
    "basePrice" numeric(10,2) NOT NULL,
    "maxOccupancy" integer NOT NULL,
    "bedType" text NOT NULL,
    "numberOfBeds" integer DEFAULT 1,
    "roomSize" integer NOT NULL,
    "viewType" text,
    "branchId" text,
    status text DEFAULT 'active'::text,
    "isFeatured" boolean DEFAULT false,
    popularity_score integer DEFAULT 0,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now()
);


ALTER TABLE public."RoomType" OWNER TO postgres;

--
-- Name: RoomTypeAmenity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RoomTypeAmenity" (
    id text DEFAULT gen_random_uuid() NOT NULL,
    "roomTypeId" text,
    "amenityId" text,
    "createdAt" timestamp without time zone DEFAULT now()
);


ALTER TABLE public."RoomTypeAmenity" OWNER TO postgres;

--
-- Name: StaffProfile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StaffProfile" (
    id text DEFAULT gen_random_uuid() NOT NULL,
    "userId" text,
    "employeeId" text NOT NULL,
    "branchId" text,
    department text,
    "position" text,
    salary numeric(10,2),
    "hireDate" timestamp without time zone,
    rating numeric(3,2),
    "totalServices" integer DEFAULT 0,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now()
);


ALTER TABLE public."StaffProfile" OWNER TO postgres;

--
-- Name: VerificationToken; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."VerificationToken" (
    id text DEFAULT gen_random_uuid() NOT NULL,
    token text NOT NULL,
    "userId" text,
    "expiresAt" timestamp without time zone NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now(),
    used boolean DEFAULT false
);


ALTER TABLE public."VerificationToken" OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    role public.user_role DEFAULT 'GUEST'::public.user_role,
    status public.user_status DEFAULT 'ACTIVE'::public.user_status,
    emailverified boolean DEFAULT false,
    firstname text NOT NULL,
    lastname text NOT NULL,
    phone text NOT NULL,
    dateofbirth timestamp without time zone NOT NULL,
    nationality text NOT NULL,
    idtype public.id_type NOT NULL,
    idnumber text NOT NULL,
    address text NOT NULL,
    city text NOT NULL,
    postalcode text NOT NULL,
    twofactorenabled boolean DEFAULT false,
    twofactorsecret text,
    createdat timestamp without time zone DEFAULT now(),
    updatedat timestamp without time zone DEFAULT now(),
    lastloginat timestamp without time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: PaymentInfo PaymentInfo_pkey; Type: CONSTRAINT; Schema: public; Owner: skynest_user
--

ALTER TABLE ONLY public."PaymentInfo"
    ADD CONSTRAINT "PaymentInfo_pkey" PRIMARY KEY (id);


--
-- Name: Amenities amenities_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Amenities"
    ADD CONSTRAINT amenities_name_key UNIQUE (name);


--
-- Name: Amenities amenities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Amenities"
    ADD CONSTRAINT amenities_pkey PRIMARY KEY (id);


--
-- Name: Booking bookings_booking_reference_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Booking"
    ADD CONSTRAINT bookings_booking_reference_key UNIQUE ("bookingReference");


--
-- Name: Booking bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Booking"
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: Branch branches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Branch"
    ADD CONSTRAINT branches_pkey PRIMARY KEY (id);


--
-- Name: Branch branches_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Branch"
    ADD CONSTRAINT branches_slug_key UNIQUE (slug);


--
-- Name: GuestProfile guest_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."GuestProfile"
    ADD CONSTRAINT guest_profiles_pkey PRIMARY KEY (id);


--
-- Name: GuestProfile guest_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."GuestProfile"
    ADD CONSTRAINT guest_profiles_user_id_key UNIQUE ("userId ");


--
-- Name: PasswordResetToken password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PasswordResetToken"
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: PasswordResetToken password_reset_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PasswordResetToken"
    ADD CONSTRAINT password_reset_tokens_token_key UNIQUE (token);


--
-- Name: RoomImage room_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RoomImage"
    ADD CONSTRAINT room_images_pkey PRIMARY KEY (id);


--
-- Name: RoomTypeAmenity room_type_amenities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RoomTypeAmenity"
    ADD CONSTRAINT room_type_amenities_pkey PRIMARY KEY (id);


--
-- Name: RoomTypeAmenity room_type_amenities_room_type_id_amenity_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RoomTypeAmenity"
    ADD CONSTRAINT room_type_amenities_room_type_id_amenity_id_key UNIQUE ("roomTypeId", "amenityId");


--
-- Name: RoomType room_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RoomType"
    ADD CONSTRAINT room_types_pkey PRIMARY KEY (id);


--
-- Name: RoomType room_types_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RoomType"
    ADD CONSTRAINT room_types_slug_key UNIQUE (slug);


--
-- Name: Room rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Room"
    ADD CONSTRAINT rooms_pkey PRIMARY KEY (id);


--
-- Name: Room rooms_room_number_branch_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Room"
    ADD CONSTRAINT rooms_room_number_branch_id_key UNIQUE ("roomNumber", "branchId");


--
-- Name: StaffProfile staff_profiles_employee_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StaffProfile"
    ADD CONSTRAINT staff_profiles_employee_id_key UNIQUE ("employeeId");


--
-- Name: StaffProfile staff_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StaffProfile"
    ADD CONSTRAINT staff_profiles_pkey PRIMARY KEY (id);


--
-- Name: StaffProfile staff_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StaffProfile"
    ADD CONSTRAINT staff_profiles_user_id_key UNIQUE ("userId");


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: VerificationToken verification_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."VerificationToken"
    ADD CONSTRAINT verification_tokens_pkey PRIMARY KEY (id);


--
-- Name: VerificationToken verification_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."VerificationToken"
    ADD CONSTRAINT verification_tokens_token_key UNIQUE (token);


--
-- Name: idx_booking_checkin; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_booking_checkin ON public."Booking" USING btree ("checkInDate");


--
-- Name: idx_booking_checkout; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_booking_checkout ON public."Booking" USING btree ("checkOutDate");


--
-- Name: idx_booking_room; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_booking_room ON public."Booking" USING btree ("roomId");


--
-- Name: idx_booking_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_booking_status ON public."Booking" USING btree (status);


--
-- Name: idx_booking_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_booking_user ON public."Booking" USING btree ("userId");


--
-- Name: PaymentInfo PaymentInfo_bookingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: skynest_user
--

ALTER TABLE ONLY public."PaymentInfo"
    ADD CONSTRAINT "PaymentInfo_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES public."Booking"(id) ON DELETE CASCADE;


--
-- Name: Booking bookings_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Booking"
    ADD CONSTRAINT bookings_room_id_fkey FOREIGN KEY ("roomId") REFERENCES public."Room"(id);


--
-- Name: Booking bookings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Booking"
    ADD CONSTRAINT bookings_user_id_fkey FOREIGN KEY ("userId") REFERENCES public.users(id);


--
-- Name: GuestProfile guest_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."GuestProfile"
    ADD CONSTRAINT guest_profiles_user_id_fkey FOREIGN KEY ("userId ") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: PasswordResetToken password_reset_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PasswordResetToken"
    ADD CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: RoomImage room_images_room_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RoomImage"
    ADD CONSTRAINT room_images_room_type_id_fkey FOREIGN KEY ("roomTypeId") REFERENCES public."RoomType"(id) ON DELETE CASCADE;


--
-- Name: RoomTypeAmenity room_type_amenities_amenity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RoomTypeAmenity"
    ADD CONSTRAINT room_type_amenities_amenity_id_fkey FOREIGN KEY ("amenityId") REFERENCES public."Amenities"(id) ON DELETE CASCADE;


--
-- Name: RoomTypeAmenity room_type_amenities_room_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RoomTypeAmenity"
    ADD CONSTRAINT room_type_amenities_room_type_id_fkey FOREIGN KEY ("roomTypeId") REFERENCES public."RoomType"(id) ON DELETE CASCADE;


--
-- Name: RoomType room_types_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RoomType"
    ADD CONSTRAINT room_types_branch_id_fkey FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON DELETE CASCADE;


--
-- Name: Room rooms_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Room"
    ADD CONSTRAINT rooms_branch_id_fkey FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON DELETE CASCADE;


--
-- Name: Room rooms_room_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Room"
    ADD CONSTRAINT rooms_room_type_id_fkey FOREIGN KEY ("roomTypeId") REFERENCES public."RoomType"(id) ON DELETE CASCADE;


--
-- Name: StaffProfile staff_profiles_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StaffProfile"
    ADD CONSTRAINT staff_profiles_branch_id_fkey FOREIGN KEY ("branchId") REFERENCES public."Branch"(id);


--
-- Name: StaffProfile staff_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StaffProfile"
    ADD CONSTRAINT staff_profiles_user_id_fkey FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: VerificationToken verification_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."VerificationToken"
    ADD CONSTRAINT verification_tokens_user_id_fkey FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 24ALVWRxXwJxa1aSLRdFPlIdAASS93yhlug4s1yoZHdxgmgmSUqShJ328UwsSaW

