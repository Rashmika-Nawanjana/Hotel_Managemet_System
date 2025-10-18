-- Create PaymentInfo table for storing credit card information
CREATE TABLE IF NOT EXISTS "PaymentInfo" (
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
  "createdAt" timestamp without time zone DEFAULT now(),
  CONSTRAINT "PaymentInfo_pkey" PRIMARY KEY (id),
  CONSTRAINT "PaymentInfo_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"(id) ON DELETE CASCADE
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_payment_info_booking" ON "PaymentInfo"("bookingId");
