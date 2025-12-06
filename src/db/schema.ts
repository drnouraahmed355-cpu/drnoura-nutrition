import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';



// Auth tables for better-auth
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

// Staff table
export const staff = sqliteTable('staff', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  fullName: text('full_name').notNull(),
  role: text('role').notNull(), // doctor, nutritionist, assistant, admin
  permissions: text('permissions', { mode: 'json' }),
  phone: text('phone'),
  status: text('status').notNull().default('active'), // active, inactive
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Patients table
export const patients = sqliteTable('patients', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  nationalId: text('national_id').notNull().unique(),
  fullName: text('full_name').notNull(),
  age: integer('age'),
  gender: text('gender'),
  phone: text('phone'),
  email: text('email'),
  weightCurrent: real('weight_current'),
  height: real('height'),
  bmi: real('bmi'),
  bodyFatPercentage: real('body_fat_percentage'),
  metabolismRate: real('metabolism_rate'),
  medicalConditions: text('medical_conditions', { mode: 'json' }),
  allergies: text('allergies', { mode: 'json' }),
  emergencyContact: text('emergency_contact'),
  profilePhoto: text('profile_photo'),
  status: text('status').notNull().default('active'), // active, inactive, completed
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Patient Measurements table
export const patientMeasurements = sqliteTable('patient_measurements', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  patientId: integer('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  weight: real('weight'),
  chest: real('chest'),
  waist: real('waist'),
  hips: real('hips'),
  arms: real('arms'),
  thighs: real('thighs'),
  bodyFat: real('body_fat'),
  muscleMass: real('muscle_mass'),
  notes: text('notes'),
  measuredAt: text('measured_at').notNull(),
  createdAt: text('created_at').notNull(),
});

// Diet Plans table
export const dietPlans = sqliteTable('diet_plans', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  patientId: integer('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  createdByStaffId: integer('created_by_staff_id').references(() => staff.id),
  planName: text('plan_name').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date'),
  dailyCalories: integer('daily_calories'),
  mealPlan: text('meal_plan', { mode: 'json' }),
  instructions: text('instructions'),
  status: text('status').notNull().default('active'), // active, completed, discontinued
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Medications table
export const medications = sqliteTable('medications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  patientId: integer('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  medicationName: text('medication_name').notNull(),
  dosage: text('dosage'),
  frequency: text('frequency'),
  startDate: text('start_date').notNull(),
  endDate: text('end_date'),
  prescribedBy: text('prescribed_by'),
  notes: text('notes'),
  status: text('status').notNull().default('active'), // active, completed, discontinued
  createdAt: text('created_at').notNull(),
});

// Appointments table
export const appointments = sqliteTable('appointments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  patientId: integer('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  staffId: integer('staff_id').references(() => staff.id),
  appointmentDate: text('appointment_date').notNull(),
  appointmentTime: text('appointment_time').notNull(),
  durationMinutes: integer('duration_minutes').default(30),
  type: text('type').notNull(), // initial, follow-up, consultation
  status: text('status').notNull().default('scheduled'), // scheduled, completed, cancelled, no-show
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Visit Records table
export const visitRecords = sqliteTable('visit_records', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  patientId: integer('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  appointmentId: integer('appointment_id').references(() => appointments.id),
  visitDate: text('visit_date').notNull(),
  weight: real('weight'),
  bloodPressure: text('blood_pressure'),
  notes: text('notes'),
  progressAssessment: text('progress_assessment'),
  nextVisitDate: text('next_visit_date'),
  createdAt: text('created_at').notNull(),
});

// Progress Photos table
export const progressPhotos = sqliteTable('progress_photos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  patientId: integer('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  photoType: text('photo_type').notNull(), // front, side, back
  photoUrl: text('photo_url').notNull(),
  takenAt: text('taken_at').notNull(),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
});

// Weekly Progress table
export const weeklyProgress = sqliteTable('weekly_progress', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  patientId: integer('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  weekNumber: integer('week_number').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  weightChange: real('weight_change'),
  complianceRate: integer('compliance_rate'), // 0-100
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
});

// Messages table
export const messages = sqliteTable('messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  senderId: text('sender_id').notNull().references(() => user.id),
  receiverId: text('receiver_id').notNull().references(() => user.id),
  subject: text('subject'),
  message: text('message').notNull(),
  read: integer('read', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').notNull(),
});

// Notifications table
export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull(), // appointment, diet_update, progress, message
  read: integer('read', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').notNull(),
});

// CMS Tables for Dr. Noura Ahmed website
export const siteContent = sqliteTable('site_content', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  section: text('section').notNull(),
  key: text('key').notNull(),
  valueAr: text('value_ar').notNull(),
  valueEn: text('value_en').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const credentials = sqliteTable('credentials', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  titleAr: text('title_ar').notNull(),
  titleEn: text('title_en').notNull(),
  institutionAr: text('institution_ar').notNull(),
  institutionEn: text('institution_en').notNull(),
  displayOrder: integer('display_order').notNull().default(0),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const expertiseAreas = sqliteTable('expertise_areas', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  titleAr: text('title_ar').notNull(),
  titleEn: text('title_en').notNull(),
  descriptionAr: text('description_ar').notNull(),
  descriptionEn: text('description_en').notNull(),
  icon: text('icon').notNull(),
  displayOrder: integer('display_order').notNull().default(0),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const testimonials = sqliteTable('testimonials', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nameAr: text('name_ar').notNull(),
  nameEn: text('name_en').notNull(),
  textAr: text('text_ar').notNull(),
  textEn: text('text_en').notNull(),
  rating: integer('rating').notNull().default(5),
  displayOrder: integer('display_order').notNull().default(0),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});