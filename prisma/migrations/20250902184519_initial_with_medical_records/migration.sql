-- CreateEnum
CREATE TYPE "public"."user_role" AS ENUM ('ADMIN', 'RECEPTIONIST', 'VETERINARIAN');

-- CreateEnum
CREATE TYPE "public"."species" AS ENUM ('DOG', 'CAT', 'BIRD', 'RABBIT', 'HAMSTER', 'FISH', 'REPTILE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."gender" AS ENUM ('MALE', 'FEMALE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "public"."unit_type" AS ENUM ('ML', 'MG', 'TABLETS', 'UNITS', 'KG', 'GRAMS', 'CAPSULES');

-- CreateEnum
CREATE TYPE "public"."batch_status" AS ENUM ('ACTIVE', 'EXPIRED', 'RECALLED');

-- CreateEnum
CREATE TYPE "public"."movement_type" AS ENUM ('IN', 'OUT', 'ADJUSTMENT', 'EXPIRED', 'LOST');

-- CreateEnum
CREATE TYPE "public"."reference_type" AS ENUM ('PURCHASE', 'SALE', 'MEDICAL_RECORD', 'ADJUSTMENT', 'EXPIRATION');

-- CreateEnum
CREATE TYPE "public"."appointment_type" AS ENUM ('CONSULTATION', 'VACCINATION', 'SURGERY', 'CHECKUP', 'EMERGENCY', 'GROOMING');

-- CreateEnum
CREATE TYPE "public"."appointment_status" AS ENUM ('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "public"."reminder_type" AS ENUM ('MEDICATION', 'VACCINATION', 'CHECKUP', 'APPOINTMENT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "public"."priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "public"."reminder_status" AS ENUM ('PENDING', 'SENT', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."contact_method" AS ENUM ('WHATSAPP', 'EMAIL', 'PHONE', 'INTERNAL');

-- CreateEnum
CREATE TYPE "public"."payment_method" AS ENUM ('CASH', 'CARD', 'TRANSFER', 'CREDIT');

-- CreateEnum
CREATE TYPE "public"."payment_status" AS ENUM ('PAID', 'PENDING', 'PARTIAL', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."item_type" AS ENUM ('PRODUCT', 'SERVICE', 'MEDICATION');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "public"."user_role" NOT NULL,
    "phone" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."owners" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "identification_number" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "owners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pets" (
    "id" SERIAL NOT NULL,
    "internal_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "species" "public"."species" NOT NULL,
    "breed" TEXT,
    "birth_date" TIMESTAMP(3),
    "gender" "public"."gender" NOT NULL DEFAULT 'UNKNOWN',
    "color" TEXT,
    "microchip" TEXT,
    "photo_url" TEXT,
    "current_weight" DECIMAL(5,2),
    "owner_id" INTEGER NOT NULL,
    "qr_code" TEXT,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pet_weights" (
    "id" SERIAL NOT NULL,
    "pet_id" INTEGER NOT NULL,
    "weight" DECIMAL(5,2) NOT NULL,
    "measurement_date" DATE NOT NULL,
    "recorded_by" INTEGER NOT NULL,
    "notes" TEXT,

    CONSTRAINT "pet_weights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."products" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category_id" INTEGER,
    "description" TEXT,
    "unit_type" "public"."unit_type" NOT NULL,
    "unit_price" DECIMAL(10,2),
    "current_stock" INTEGER NOT NULL DEFAULT 0,
    "minimum_stock" INTEGER NOT NULL DEFAULT 5,
    "maximum_stock" INTEGER,
    "requires_prescription" BOOLEAN NOT NULL DEFAULT false,
    "supplier" TEXT,
    "track_batches" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_batches" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "batch_number" TEXT NOT NULL,
    "expiration_date" DATE,
    "quantity" INTEGER NOT NULL,
    "cost_per_unit" DECIMAL(10,4),
    "supplier" TEXT,
    "received_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "public"."batch_status" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "product_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."stock_movements" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "batch_id" INTEGER,
    "movement_type" "public"."movement_type" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT,
    "reference_type" "public"."reference_type" NOT NULL,
    "reference_id" INTEGER,
    "cost_per_unit" DECIMAL(10,4),
    "performed_by" INTEGER NOT NULL,
    "movement_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."medical_records" (
    "id" SERIAL NOT NULL,
    "pet_id" INTEGER NOT NULL,
    "appointment_id" INTEGER,
    "veterinarian_id" INTEGER NOT NULL,
    "visit_date" DATE NOT NULL,
    "visit_time" TIME,
    "reason_for_visit" TEXT NOT NULL,
    "symptoms" TEXT,
    "diagnosis" TEXT,
    "treatment" TEXT,
    "weight" DECIMAL(5,2),
    "temperature" DECIMAL(4,2),
    "notes" TEXT,
    "follow_up_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medical_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."prescriptions" (
    "id" SERIAL NOT NULL,
    "medical_record_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "quantity" DECIMAL(8,2) NOT NULL,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT,
    "duration" TEXT,
    "instructions" TEXT,
    "start_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" DATE,

    CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."anamnesis" (
    "id" SERIAL NOT NULL,
    "medical_record_id" INTEGER NOT NULL,
    "last_deworming_date" DATE,
    "deworming_frequency" TEXT,
    "deworming_products" TEXT,
    "previous_illnesses" TEXT,
    "chronic_conditions" TEXT,
    "allergies" TEXT,
    "surgical_history" TEXT,
    "previous_treatments" TEXT,
    "current_medications" TEXT,
    "feed_type" TEXT,
    "feed_brand" TEXT,
    "feeding_schedule" TEXT,
    "special_diet" BOOLEAN NOT NULL DEFAULT false,
    "diet_details" TEXT,
    "appetite_changes" TEXT,
    "reproductive_status" TEXT,
    "castration_date" DATE,
    "last_heat_date" DATE,
    "pregnancy_history" INTEGER DEFAULT 0,
    "last_birth_date" DATE,
    "behavior_changes" TEXT,
    "activity_level" TEXT,
    "exercise_routine" TEXT,
    "sleep_patterns" TEXT,
    "housing_type" TEXT,
    "outdoor_access" BOOLEAN NOT NULL DEFAULT false,
    "other_pets" TEXT,
    "last_vet_visit" DATE,
    "reason_last_visit" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "anamnesis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."vital_signs" (
    "id" SERIAL NOT NULL,
    "medical_record_id" INTEGER NOT NULL,
    "heart_rate" INTEGER,
    "respiratory_rate" INTEGER,
    "temperature" DECIMAL(4,2),
    "weight" DECIMAL(5,2),
    "body_condition_score" INTEGER,
    "hydration_status" TEXT,
    "mental_status" TEXT,
    "posture_gait" TEXT,
    "heart_sounds" TEXT,
    "pulse_quality" TEXT,
    "mucous_membranes" TEXT,
    "capillary_refill_time" TEXT,
    "lymph_nodes" TEXT,
    "lymph_node_details" TEXT,
    "alertness" TEXT,
    "temperament" TEXT,
    "pain_level" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vital_signs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."systems_review" (
    "id" SERIAL NOT NULL,
    "medical_record_id" INTEGER NOT NULL,
    "skin_condition" TEXT,
    "skin_findings" TEXT,
    "coat_quality" TEXT,
    "skin_lesions" TEXT,
    "respiratory_system" TEXT,
    "lung_sounds" TEXT,
    "breathing_pattern" TEXT,
    "cough_present" BOOLEAN NOT NULL DEFAULT false,
    "nasal_discharge" TEXT,
    "digestive_system" TEXT,
    "oral_examination" TEXT,
    "abdominal_palpation" TEXT,
    "intestinal_sounds" TEXT,
    "genitourinary_system" TEXT,
    "kidney_palpation" TEXT,
    "bladder_palpation" TEXT,
    "genital_examination" TEXT,
    "urination" TEXT,
    "musculoskeletal_system" TEXT,
    "joint_mobility" TEXT,
    "muscle_condition" TEXT,
    "gait_assessment" TEXT,
    "spinal_palpation" TEXT,
    "nervous_system" TEXT,
    "mental_state" TEXT,
    "reflexes_assessment" TEXT,
    "coordination_test" TEXT,
    "eye_examination" TEXT,
    "ear_examination" TEXT,
    "general_observations" TEXT,
    "additional_findings" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "systems_review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."vaccinations" (
    "id" SERIAL NOT NULL,
    "pet_id" INTEGER NOT NULL,
    "product_id" INTEGER,
    "vaccine_name" TEXT NOT NULL,
    "veterinarian_id" INTEGER NOT NULL,
    "vaccination_date" DATE NOT NULL,
    "next_due_date" DATE,
    "batch_number" TEXT,
    "notes" TEXT,

    CONSTRAINT "vaccinations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."appointments" (
    "id" SERIAL NOT NULL,
    "pet_id" INTEGER NOT NULL,
    "owner_id" INTEGER NOT NULL,
    "veterinarian_id" INTEGER,
    "appointment_date" DATE NOT NULL,
    "appointment_time" TIME NOT NULL,
    "duration_minutes" INTEGER NOT NULL DEFAULT 30,
    "appointment_type" "public"."appointment_type" NOT NULL DEFAULT 'CONSULTATION',
    "status" "public"."appointment_status" NOT NULL DEFAULT 'SCHEDULED',
    "reason" TEXT,
    "notes" TEXT,
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."reminders" (
    "id" SERIAL NOT NULL,
    "pet_id" INTEGER NOT NULL,
    "owner_id" INTEGER NOT NULL,
    "reminder_type" "public"."reminder_type" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "due_date" DATE NOT NULL,
    "due_time" TIME,
    "priority" "public"."priority" NOT NULL DEFAULT 'MEDIUM',
    "status" "public"."reminder_status" NOT NULL DEFAULT 'PENDING',
    "method" "public"."contact_method" NOT NULL DEFAULT 'WHATSAPP',
    "sent_date" TIMESTAMP(3),
    "sent_by" INTEGER,
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."services" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "base_price" DECIMAL(10,2),
    "category" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."receipts" (
    "id" SERIAL NOT NULL,
    "receipt_number" TEXT NOT NULL,
    "pet_id" INTEGER NOT NULL,
    "owner_id" INTEGER NOT NULL,
    "veterinarian_id" INTEGER,
    "issue_date" DATE NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "payment_method" "public"."payment_method" NOT NULL DEFAULT 'CASH',
    "payment_status" "public"."payment_status" NOT NULL DEFAULT 'PAID',
    "notes" TEXT,
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."receipt_items" (
    "id" SERIAL NOT NULL,
    "receipt_id" INTEGER NOT NULL,
    "product_id" INTEGER,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(8,2) NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "total_price" DECIMAL(10,2) NOT NULL,
    "item_type" "public"."item_type" NOT NULL DEFAULT 'SERVICE',

    CONSTRAINT "receipt_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "owners_identification_number_key" ON "public"."owners"("identification_number");

-- CreateIndex
CREATE INDEX "idx_identification" ON "public"."owners"("identification_number");

-- CreateIndex
CREATE UNIQUE INDEX "pets_internal_id_key" ON "public"."pets"("internal_id");

-- CreateIndex
CREATE UNIQUE INDEX "pets_qr_code_key" ON "public"."pets"("qr_code");

-- CreateIndex
CREATE INDEX "idx_internal_id" ON "public"."pets"("internal_id");

-- CreateIndex
CREATE INDEX "idx_owner_id" ON "public"."pets"("owner_id");

-- CreateIndex
CREATE INDEX "idx_qr_code" ON "public"."pets"("qr_code");

-- CreateIndex
CREATE INDEX "idx_pet_date" ON "public"."pet_weights"("pet_id", "measurement_date");

-- CreateIndex
CREATE INDEX "idx_product_name" ON "public"."products"("name");

-- CreateIndex
CREATE INDEX "idx_category" ON "public"."products"("category_id");

-- CreateIndex
CREATE INDEX "idx_expiration" ON "public"."product_batches"("expiration_date");

-- CreateIndex
CREATE INDEX "idx_product_status" ON "public"."product_batches"("product_id", "status");

-- CreateIndex
CREATE INDEX "idx_product_date" ON "public"."stock_movements"("product_id", "movement_date");

-- CreateIndex
CREATE INDEX "idx_reference" ON "public"."stock_movements"("reference_type", "reference_id");

-- CreateIndex
CREATE INDEX "idx_pet_visit_date" ON "public"."medical_records"("pet_id", "visit_date");

-- CreateIndex
CREATE INDEX "idx_vet_visit_date" ON "public"."medical_records"("veterinarian_id", "visit_date");

-- CreateIndex
CREATE INDEX "idx_medical_record" ON "public"."prescriptions"("medical_record_id");

-- CreateIndex
CREATE UNIQUE INDEX "anamnesis_medical_record_id_key" ON "public"."anamnesis"("medical_record_id");

-- CreateIndex
CREATE UNIQUE INDEX "vital_signs_medical_record_id_key" ON "public"."vital_signs"("medical_record_id");

-- CreateIndex
CREATE UNIQUE INDEX "systems_review_medical_record_id_key" ON "public"."systems_review"("medical_record_id");

-- CreateIndex
CREATE INDEX "idx_pet_next_due" ON "public"."vaccinations"("pet_id", "next_due_date");

-- CreateIndex
CREATE INDEX "idx_date_time" ON "public"."appointments"("appointment_date", "appointment_time");

-- CreateIndex
CREATE INDEX "idx_vet_date" ON "public"."appointments"("veterinarian_id", "appointment_date");

-- CreateIndex
CREATE INDEX "idx_due_status" ON "public"."reminders"("due_date", "status");

-- CreateIndex
CREATE INDEX "idx_pet_type" ON "public"."reminders"("pet_id", "reminder_type");

-- CreateIndex
CREATE UNIQUE INDEX "receipts_receipt_number_key" ON "public"."receipts"("receipt_number");

-- CreateIndex
CREATE INDEX "idx_issue_date" ON "public"."receipts"("issue_date");

-- CreateIndex
CREATE INDEX "idx_receipt_number" ON "public"."receipts"("receipt_number");

-- AddForeignKey
ALTER TABLE "public"."pets" ADD CONSTRAINT "pets_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pet_weights" ADD CONSTRAINT "pet_weights_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pet_weights" ADD CONSTRAINT "pet_weights_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_batches" ADD CONSTRAINT "product_batches_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stock_movements" ADD CONSTRAINT "stock_movements_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stock_movements" ADD CONSTRAINT "stock_movements_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "public"."product_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stock_movements" ADD CONSTRAINT "stock_movements_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."medical_records" ADD CONSTRAINT "medical_records_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."medical_records" ADD CONSTRAINT "medical_records_veterinarian_id_fkey" FOREIGN KEY ("veterinarian_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."prescriptions" ADD CONSTRAINT "prescriptions_medical_record_id_fkey" FOREIGN KEY ("medical_record_id") REFERENCES "public"."medical_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."prescriptions" ADD CONSTRAINT "prescriptions_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."anamnesis" ADD CONSTRAINT "anamnesis_medical_record_id_fkey" FOREIGN KEY ("medical_record_id") REFERENCES "public"."medical_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vital_signs" ADD CONSTRAINT "vital_signs_medical_record_id_fkey" FOREIGN KEY ("medical_record_id") REFERENCES "public"."medical_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."systems_review" ADD CONSTRAINT "systems_review_medical_record_id_fkey" FOREIGN KEY ("medical_record_id") REFERENCES "public"."medical_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vaccinations" ADD CONSTRAINT "vaccinations_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vaccinations" ADD CONSTRAINT "vaccinations_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vaccinations" ADD CONSTRAINT "vaccinations_veterinarian_id_fkey" FOREIGN KEY ("veterinarian_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."appointments" ADD CONSTRAINT "appointments_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."appointments" ADD CONSTRAINT "appointments_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."appointments" ADD CONSTRAINT "appointments_veterinarian_id_fkey" FOREIGN KEY ("veterinarian_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."appointments" ADD CONSTRAINT "appointments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reminders" ADD CONSTRAINT "reminders_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reminders" ADD CONSTRAINT "reminders_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reminders" ADD CONSTRAINT "reminders_sent_by_fkey" FOREIGN KEY ("sent_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reminders" ADD CONSTRAINT "reminders_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."receipts" ADD CONSTRAINT "receipts_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."receipts" ADD CONSTRAINT "receipts_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."receipts" ADD CONSTRAINT "receipts_veterinarian_id_fkey" FOREIGN KEY ("veterinarian_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."receipts" ADD CONSTRAINT "receipts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."receipt_items" ADD CONSTRAINT "receipt_items_receipt_id_fkey" FOREIGN KEY ("receipt_id") REFERENCES "public"."receipts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."receipt_items" ADD CONSTRAINT "receipt_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
