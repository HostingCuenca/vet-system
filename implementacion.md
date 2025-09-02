# 🏥 Sistema Veterinario - MVP Completo
## Documentación Definitiva y Guía de Desarrollo

> **Base de Datos**: `postgresql://postgres:AgroCursos2025@167.235.20.41:5432/vet_system`  
> **Stack**: Next.js 15 + TypeScript + Prisma + PostgreSQL + Tailwind CSS

---

## 🎯 **VISIÓN DEL PRODUCTO**

### **Problema Central**
Las veterinarias pequeñas pierden tiempo y dinero por:
- Buscar historiales en papel (5-10 min por consulta)
- Medicamentos caducados sin control (pérdidas 15-30% inventario)
- Recordatorios manuales olvidados (clientes perdidos)
- Falta de trazabilidad en productos administrados

### **Solución MVP**
Sistema web que permite:
1. **Búsqueda instantánea** por cédula del dueño → mascotas → historial completo
2. **Historiales digitales** centralizados y accesibles
3. **Recordatorios visuales** para medicación (WhatsApp manual)
4. **Inventario flexible** (básico → avanzado con lotes)
5. **Consultas públicas** sin login para clientes

---

## 🗃️ **ARQUITECTURA DE BASE DE DATOS**

### **Core Tables - Prisma Schema**

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ========================================
// 1. USUARIOS Y AUTENTICACIÓN
// ========================================
model User {
  id           Int      @id @default(autoincrement())
  email        String   @unique
  passwordHash String   @map("password_hash")
  name         String
  role         UserRole
  phone        String?
  active       Boolean  @default(true)
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  // Relaciones
  medicalRecords     MedicalRecord[]
  appointments       Appointment[]   @relation("AppointmentVeterinarian")
  appointmentsCreated Appointment[]  @relation("AppointmentCreatedBy")
  stockMovements     StockMovement[]
  receipts           Receipt[]
  reminders          Reminder[]      @relation("ReminderSentBy")
  remindersCreated   Reminder[]      @relation("ReminderCreatedBy")
  petWeights         PetWeight[]
  vaccinations       Vaccination[]

  @@map("users")
}

enum UserRole {
  ADMIN
  RECEPTIONIST
  VETERINARIAN

  @@map("user_role")
}

// ========================================
// 2. PROPIETARIOS Y MASCOTAS
// ========================================
model Owner {
  id                   Int    @id @default(autoincrement())
  name                 String
  identificationNumber String @unique @map("identification_number") // CÉDULA - BÚSQUEDA PRINCIPAL
  phone                String?
  email                String?
  address              String?
  notes                String?
  createdAt            DateTime @default(now()) @map("created_at")
  updatedAt            DateTime @updatedAt @map("updated_at")

  // Relaciones
  pets         Pet[]
  appointments Appointment[]
  receipts     Receipt[]
  reminders    Reminder[]

  @@index([identificationNumber], name: "idx_identification")
  @@map("owners")
}

model Pet {
  id           Int       @id @default(autoincrement())
  internalId   String    @unique @map("internal_id") // P001, P002... - Búsqueda rápida
  name         String
  species      Species
  breed        String?
  birthDate    DateTime? @map("birth_date")
  gender       Gender    @default(UNKNOWN)
  color        String?
  microchip    String?
  photoUrl     String?   @map("photo_url") // FOTO OPCIONAL
  currentWeight Decimal?  @map("current_weight") @db.Decimal(5, 2)
  ownerId      Int       @map("owner_id")
  qrCode       String?   @unique @map("qr_code") // QR FUTURO - UUID
  notes        String?
  active       Boolean   @default(true)
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  // Relaciones
  owner          Owner           @relation(fields: [ownerId], references: [id], onDelete: Restrict)
  weights        PetWeight[]
  medicalRecords MedicalRecord[]
  appointments   Appointment[]
  vaccinations   Vaccination[]
  receipts       Receipt[]
  reminders      Reminder[]

  @@index([internalId], name: "idx_internal_id")
  @@index([ownerId], name: "idx_owner_id")
  @@index([qrCode], name: "idx_qr_code")
  @@map("pets")
}

enum Species {
  DOG
  CAT
  BIRD
  RABBIT
  HAMSTER
  FISH
  REPTILE
  OTHER

  @@map("species")
}

enum Gender {
  MALE
  FEMALE
  UNKNOWN

  @@map("gender")
}

model PetWeight {
  id              Int      @id @default(autoincrement())
  petId           Int      @map("pet_id")
  weight          Decimal  @db.Decimal(5, 2)
  measurementDate DateTime @map("measurement_date") @db.Date
  recordedBy      Int      @map("recorded_by")
  notes           String?

  // Relaciones
  pet      Pet  @relation(fields: [petId], references: [id], onDelete: Cascade)
  recorder User @relation(fields: [recordedBy], references: [id])

  @@index([petId, measurementDate], name: "idx_pet_date")
  @@map("pet_weights")
}

// ========================================
// 3. INVENTARIO (FLEXIBLE - BÁSICO A AVANZADO)
// ========================================
model ProductCategory {
  id          Int      @id @default(autoincrement())
  name        String
  description String?
  createdAt   DateTime @default(now()) @map("created_at")

  // Relaciones
  products Product[]

  @@map("product_categories")
}

model Product {
  id                   Int             @id @default(autoincrement())
  name                 String
  categoryId           Int?            @map("category_id")
  description          String?
  unitType             UnitType        @map("unit_type")
  unitPrice            Decimal?        @map("unit_price") @db.Decimal(10, 2)
  currentStock         Int             @default(0) @map("current_stock")
  minimumStock         Int             @default(5) @map("minimum_stock")
  maximumStock         Int?            @map("maximum_stock")
  requiresPrescription Boolean         @default(false) @map("requires_prescription")
  supplier             String?
  
  // Control de lotes (OPCIONAL - para inventario avanzado)
  trackBatches         Boolean         @default(false) @map("track_batches")
  
  active               Boolean         @default(true)
  createdAt            DateTime        @default(now()) @map("created_at")
  updatedAt            DateTime        @updatedAt @map("updated_at")

  // Relaciones
  category       ProductCategory? @relation(fields: [categoryId], references: [id])
  batches        ProductBatch[]
  stockMovements StockMovement[]
  prescriptions  Prescription[]
  receiptItems   ReceiptItem[]
  vaccinations   Vaccination[]

  @@index([name], name: "idx_product_name")
  @@index([categoryId], name: "idx_category")
  @@map("products")
}

enum UnitType {
  ML
  MG
  TABLETS
  UNITS
  KG
  GRAMS
  CAPSULES

  @@map("unit_type")
}

// Tabla para inventario AVANZADO (lotes con vencimientos)
model ProductBatch {
  id             Int         @id @default(autoincrement())
  productId      Int         @map("product_id")
  batchNumber    String      @map("batch_number")
  expirationDate DateTime?   @map("expiration_date") @db.Date
  quantity       Int
  costPerUnit    Decimal?    @map("cost_per_unit") @db.Decimal(10, 4)
  supplier       String?
  receivedDate   DateTime    @default(now()) @map("received_date") @db.Date
  status         BatchStatus @default(ACTIVE)

  // Relaciones
  product        Product         @relation(fields: [productId], references: [id])
  stockMovements StockMovement[]

  @@index([expirationDate], name: "idx_expiration")
  @@index([productId, status], name: "idx_product_status")
  @@map("product_batches")
}

enum BatchStatus {
  ACTIVE
  EXPIRED
  RECALLED

  @@map("batch_status")
}

model StockMovement {
  id            Int            @id @default(autoincrement())
  productId     Int            @map("product_id")
  batchId       Int?           @map("batch_id") // NULL para productos sin lotes
  movementType  MovementType   @map("movement_type")
  quantity      Int // Positivo para entradas, negativo para salidas
  reason        String?
  referenceType ReferenceType  @map("reference_type")
  referenceId   Int?           @map("reference_id")
  costPerUnit   Decimal?       @map("cost_per_unit") @db.Decimal(10, 4)
  performedBy   Int            @map("performed_by")
  movementDate  DateTime       @default(now()) @map("movement_date")

  // Relaciones
  product   Product       @relation(fields: [productId], references: [id])
  batch     ProductBatch? @relation(fields: [batchId], references: [id])
  performer User          @relation(fields: [performedBy], references: [id])

  @@index([productId, movementDate], name: "idx_product_date")
  @@index([referenceType, referenceId], name: "idx_reference")
  @@map("stock_movements")
}

enum MovementType {
  IN
  OUT
  ADJUSTMENT
  EXPIRED
  LOST

  @@map("movement_type")
}

enum ReferenceType {
  PURCHASE
  SALE
  MEDICAL_RECORD
  ADJUSTMENT
  EXPIRATION

  @@map("reference_type")
}

// ========================================
// 4. HISTORIALES MÉDICOS
// ========================================
model MedicalRecord {
  id             Int      @id @default(autoincrement())
  petId          Int      @map("pet_id")
  appointmentId  Int?     @map("appointment_id")
  veterinarianId Int      @map("veterinarian_id")
  visitDate      DateTime @map("visit_date") @db.Date
  visitTime      DateTime? @map("visit_time") @db.Time
  reasonForVisit String   @map("reason_for_visit")
  symptoms       String?
  diagnosis      String?
  treatment      String?
  weight         Decimal? @db.Decimal(5, 2)
  temperature    Decimal? @db.Decimal(4, 2)
  notes          String?
  followUpDate   DateTime? @map("follow_up_date") @db.Date
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  // Relaciones
  pet           Pet            @relation(fields: [petId], references: [id])
  veterinarian  User           @relation(fields: [veterinarianId], references: [id])
  prescriptions Prescription[]

  @@index([petId, visitDate], name: "idx_pet_visit_date")
  @@index([veterinarianId, visitDate], name: "idx_vet_date")
  @@map("medical_records")
}

model Prescription {
  id               Int    @id @default(autoincrement())
  medicalRecordId  Int    @map("medical_record_id")
  productId        Int    @map("product_id")
  quantity         Decimal @db.Decimal(8, 2)
  dosage           String // "1 tableta cada 8 horas"
  frequency        String? // "Cada 8 horas"
  duration         String? // "7 días"
  instructions     String?
  startDate        DateTime @default(now()) @map("start_date") @db.Date
  endDate          DateTime? @map("end_date") @db.Date

  // Relaciones
  medicalRecord MedicalRecord @relation(fields: [medicalRecordId], references: [id], onDelete: Cascade)
  product       Product       @relation(fields: [productId], references: [id])

  @@index([medicalRecordId], name: "idx_medical_record")
  @@map("prescriptions")
}

model Vaccination {
  id             Int      @id @default(autoincrement())
  petId          Int      @map("pet_id")
  productId      Int?     @map("product_id") // Vacuna del inventario
  vaccineName    String   @map("vaccine_name")
  veterinarianId Int      @map("veterinarian_id")
  vaccinationDate DateTime @map("vaccination_date") @db.Date
  nextDueDate    DateTime? @map("next_due_date") @db.Date
  batchNumber    String?  @map("batch_number")
  notes          String?

  // Relaciones
  pet          Pet      @relation(fields: [petId], references: [id])
  product      Product? @relation(fields: [productId], references: [id])
  veterinarian User     @relation(fields: [veterinarianId], references: [id])

  @@index([petId, nextDueDate], name: "idx_pet_next_due")
  @@map("vaccinations")
}

// ========================================
// 5. SISTEMA DE CITAS
// ========================================
model Appointment {
  id              Int             @id @default(autoincrement())
  petId           Int             @map("pet_id")
  ownerId         Int             @map("owner_id")
  veterinarianId  Int?            @map("veterinarian_id") // NULL = cualquier veterinario
  appointmentDate DateTime        @map("appointment_date") @db.Date
  appointmentTime DateTime        @map("appointment_time") @db.Time
  durationMinutes Int             @default(30) @map("duration_minutes")
  appointmentType AppointmentType @default(CONSULTATION) @map("appointment_type")
  status          AppointmentStatus @default(SCHEDULED)
  reason          String?
  notes           String?
  createdBy       Int             @map("created_by")
  createdAt       DateTime        @default(now()) @map("created_at")
  updatedAt       DateTime        @updatedAt @map("updated_at")

  // Relaciones
  pet          Pet  @relation(fields: [petId], references: [id])
  owner        Owner @relation(fields: [ownerId], references: [id])
  veterinarian User? @relation("AppointmentVeterinarian", fields: [veterinarianId], references: [id])
  creator      User  @relation("AppointmentCreatedBy", fields: [createdBy], references: [id])

  @@index([appointmentDate, appointmentTime], name: "idx_date_time")
  @@index([veterinarianId, appointmentDate], name: "idx_vet_date")
  @@map("appointments")
}

enum AppointmentType {
  CONSULTATION
  VACCINATION
  SURGERY
  CHECKUP
  EMERGENCY
  GROOMING

  @@map("appointment_type")
}

enum AppointmentStatus {
  SCHEDULED
  CONFIRMED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  NO_SHOW

  @@map("appointment_status")
}

// ========================================
// 6. RECORDATORIOS (MANUAL/VISUAL)
// ========================================
model Reminder {
  id           Int           @id @default(autoincrement())
  petId        Int           @map("pet_id")
  ownerId      Int           @map("owner_id")
  reminderType ReminderType  @map("reminder_type")
  title        String
  message      String
  dueDate      DateTime      @map("due_date") @db.Date
  dueTime      DateTime?     @map("due_time") @db.Time
  priority     Priority      @default(MEDIUM)
  status       ReminderStatus @default(PENDING)
  method       ContactMethod @default(WHATSAPP)
  sentDate     DateTime?     @map("sent_date")
  sentBy       Int?          @map("sent_by")
  createdBy    Int           @map("created_by")
  createdAt    DateTime      @default(now()) @map("created_at")

  // Relaciones
  pet     Pet   @relation(fields: [petId], references: [id])
  owner   Owner @relation(fields: [ownerId], references: [id])
  sender  User? @relation("ReminderSentBy", fields: [sentBy], references: [id])
  creator User  @relation("ReminderCreatedBy", fields: [createdBy], references: [id])

  @@index([dueDate, status], name: "idx_due_status")
  @@index([petId, reminderType], name: "idx_pet_type")
  @@map("reminders")
}

enum ReminderType {
  MEDICATION
  VACCINATION
  CHECKUP
  APPOINTMENT
  CUSTOM

  @@map("reminder_type")
}

enum Priority {
  LOW
  MEDIUM
  HIGH

  @@map("priority")
}

enum ReminderStatus {
  PENDING
  SENT
  COMPLETED
  CANCELLED

  @@map("reminder_status")
}

enum ContactMethod {
  WHATSAPP
  EMAIL
  PHONE
  INTERNAL

  @@map("contact_method")
}

// ========================================
// 7. SERVICIOS Y COMPROBANTES
// ========================================
model Service {
  id          Int      @id @default(autoincrement())
  name        String
  description String?
  basePrice   Decimal? @map("base_price") @db.Decimal(10, 2)
  category    String?
  active      Boolean  @default(true)
  createdAt   DateTime @default(now()) @map("created_at")

  @@map("services")
}

model Receipt {
  id             Int           @id @default(autoincrement())
  receiptNumber  String        @unique @map("receipt_number") // VET001, VET002...
  petId          Int           @map("pet_id")
  ownerId        Int           @map("owner_id")
  veterinarianId Int?          @map("veterinarian_id")
  issueDate      DateTime      @map("issue_date") @db.Date
  totalAmount    Decimal       @map("total_amount") @db.Decimal(10, 2)
  paymentMethod  PaymentMethod @default(CASH) @map("payment_method")
  paymentStatus  PaymentStatus @default(PAID) @map("payment_status")
  notes          String?
  createdBy      Int           @map("created_by")
  createdAt      DateTime      @default(now()) @map("created_at")

  // Relaciones
  pet          Pet           @relation(fields: [petId], references: [id])
  owner        Owner         @relation(fields: [ownerId], references: [id])
  veterinarian User?         @relation(fields: [veterinarianId], references: [id])
  creator      User          @relation(fields: [createdBy], references: [id])
  items        ReceiptItem[]

  @@index([issueDate], name: "idx_issue_date")
  @@index([receiptNumber], name: "idx_receipt_number")
  @@map("receipts")
}

enum PaymentMethod {
  CASH
  CARD
  TRANSFER
  CREDIT

  @@map("payment_method")
}

enum PaymentStatus {
  PAID
  PENDING
  PARTIAL
  CANCELLED

  @@map("payment_status")
}

model ReceiptItem {
  id          Int      @id @default(autoincrement())
  receiptId   Int      @map("receipt_id")
  productId   Int?     @map("product_id") // NULL para servicios
  description String
  quantity    Decimal  @db.Decimal(8, 2)
  unitPrice   Decimal  @map("unit_price") @db.Decimal(10, 2)
  totalPrice  Decimal  @map("total_price") @db.Decimal(10, 2)
  itemType    ItemType @default(SERVICE) @map("item_type")

  // Relaciones
  receipt Receipt  @relation(fields: [receiptId], references: [id], onDelete: Cascade)
  product Product? @relation(fields: [productId], references: [id])

  @@map("receipt_items")
}

enum ItemType {
  PRODUCT
  SERVICE
  MEDICATION

  @@map("item_type")
}
```

---

## 🔄 **FLUJOS DE TRABAJO PRINCIPALES**

### **1. Consulta Rápida por Cédula**
```mermaid
graph TD
    A[Ingresa Cédula] --> B{¿Existe Owner?}
    B -->|Sí| C[Mostrar Mascotas del Owner]
    B -->|No| D[Crear Nuevo Owner]
    C --> E[Seleccionar Mascota]
    E --> F[Mostrar Historial Completo]
    F --> G[Peso actual, Vacunas, Medicamentos]
```

### **2. Búsqueda Alternativa por QR/ID**
```mermaid
graph TD
    A[Escanear QR o ID interno] --> B[Pet encontrada]
    B --> C[Mostrar Owner + Pet Info]
    C --> D[Historial Médico Completo]
```

### **3. Control de Inventario Inteligente**
```mermaid
graph TD
    A[Prescribir Medicamento] --> B{¿Track Batches?}
    B -->|Sí| C[Seleccionar Lote más próximo a vencer]
    B -->|No| D[Descontar Stock General]
    C --> E[Registrar Stock Movement]
    D --> E
    E --> F{¿Stock < Mínimo?}
    F -->|Sí| G[Alerta de Restock]
```

---

## 🚀 **GUÍA DE DESARROLLO PARA AGENTES**

### **Fase 1: Setup Inicial (Día 1-2)**
```bash
# 1. Configurar Prisma
npm install prisma @prisma/client
npx prisma init

# 2. Configurar DATABASE_URL en .env
DATABASE_URL="postgresql://postgres:AgroCursos2025@167.235.20.41:5432/vet_system"

# 3. Aplicar schema
npx prisma db push
npx prisma generate

# 4. Seed básico
npx prisma db seed
```

### **Estructura de Carpetas Sugerida**
```
src/
├── app/                    # Next.js 15 App Router
│   ├── (auth)/            # Rutas autenticadas
│   ├── consulta/          # Consulta pública (sin auth)
│   ├── dashboard/         # Panel principal
│   └── api/               # API Routes
├── components/
│   ├── ui/                # Componentes base (shadcn/ui)
│   ├── forms/             # Formularios específicos
│   └── layout/            # Layout components
├── lib/
│   ├── prisma.ts          # Cliente Prisma
│   ├── auth.ts            # Autenticación
│   └── utils.ts           # Utilidades
├── types/                 # Types TypeScript
└── hooks/                 # Custom hooks
```

### **Prioridades de Desarrollo**

#### **🥇 CRÍTICO (Semana 1-2)**
1. **Autenticación básica** (email/password)
2. **CRUD Owners** (búsqueda por cédula)
3. **CRUD Pets** (con ID interno auto-generado)
4. **Historial médico básico**
5. **Dashboard con búsqueda principal**

#### **🥈 IMPORTANTE (Semana 3-4)**
1. **Sistema de citas**
2. **Recordatorios visuales**
3. **Inventario básico (sin lotes)**
4. **Comprobantes simples**

#### **🥉 DESEABLE (Fase 2)**
1. **Control de lotes avanzado**
2. **Reportes y analytics**
3. **Consulta pública optimizada**
4. **QR Code generation**

---

## ⚠️ **ANÁLISIS CRÍTICO FINAL**

### ✅ **MUY FACTIBLE**
- **Problema real y urgente** → ROI claro
- **MVP bien delimitado** → Alcanzable en 4-6 semanas
- **Búsqueda por cédula** → UX superior a ID interno
- **Inventario flexible** → Crece con el negocio

### ⚠️ **RIESGOS CONTROLABLES**
1. **Complejidad de lotes FIFO** → Implementar en Fase 2
2. **Integraciones WhatsApp** → Manual primero, API después
3. **Backup crítico** → Configurar desde día 1

### 🎯 **DIFERENCIADORES CLAVE**
- **Búsqueda por cédula del dueño** (ningún sistema veterinario hace esto bien)
- **QR codes para mascotas** (futuro brillante)
- **Recordatorios visuales** (mejor que automático para clínicas pequeñas)
- **Inventario que crece** (básico → lotes → análisis predictivo)

### 💡 **RECOMENDACIÓN DE AGENTE**
1. **Empezar con lo básico** (CRUD + búsquedas)
2. **Pulir UX antes que features** (velocidad > funcionalidades)
3. **Validar con veterinaria real** cada 2 semanas
4. **Logs detallados desde día 1** (debugging + auditoría)

**¿Procedemos con la implementación? El sistema está muy bien fundamentado y el schema es sólido.**