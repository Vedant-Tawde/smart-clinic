import { pgTable, text, serial, integer, boolean, timestamp, numeric } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// --- Tables ---

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const doctors = pgTable("doctors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  specialization: text("specialization").notNull(),
  workingHoursStart: text("working_hours_start").notNull(), // e.g., "09:00"
  workingHoursEnd: text("working_hours_end").notNull(), // e.g., "17:00"
  maxDailyCapacity: integer("max_daily_capacity").notNull(),
  fatigueScore: integer("fatigue_score").default(0).notNull(), // 0 - 100
  lastBreakTime: timestamp("last_break_time"),
  isOverworked: boolean("is_overworked").default(false),
});

export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  visitType: text("visit_type").notNull(), // first_time, follow_up, chronic_management, minor_complaint
  problemDescription: text("problem_description").notNull(),
  aiSeverityScore: integer("ai_severity_score").default(0).notNull(), // 0 - 10
  urgencyScore: integer("urgency_score").default(0).notNull(),
  noShowProbability: integer("no_show_probability").default(0).notNull(), // 0 - 100
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  doctorId: integer("doctor_id").references(() => doctors.id), // Can be null initially before assigning
  predictedDuration: integer("predicted_duration").notNull(), // in minutes
  scheduledStart: timestamp("scheduled_start"),
  predictedStart: timestamp("predicted_start"),
  bufferAllocated: integer("buffer_allocated").default(0).notNull(), // in minutes
  status: text("status").notNull(), // waiting, in_consultation, completed, cancelled, no_show
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const queueEvents = pgTable("queue_events", {
  id: serial("id").primaryKey(),
  eventType: text("event_type").notNull(),
  appointmentId: integer("appointment_id").notNull().references(() => appointments.id),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// --- Relations ---

export const doctorsRelations = relations(doctors, ({ many }) => ({
  appointments: many(appointments),
}));

export const patientsRelations = relations(patients, ({ many }) => ({
  appointments: many(appointments),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  doctor: one(doctors, {
    fields: [appointments.doctorId],
    references: [doctors.id],
  }),
  patient: one(patients, {
    fields: [appointments.patientId],
    references: [patients.id],
  }),
}));

export const queueEventsRelations = relations(queueEvents, ({ one }) => ({
  appointment: one(appointments, {
    fields: [queueEvents.appointmentId],
    references: [appointments.id],
  }),
}));

// --- Schemas & Types ---

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const insertDoctorSchema = createInsertSchema(doctors).omit({ id: true });
export type InsertDoctor = z.infer<typeof insertDoctorSchema>;
export type Doctor = typeof doctors.$inferSelect;

export const insertPatientSchema = createInsertSchema(patients).omit({ id: true, createdAt: true });
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Patient = typeof patients.$inferSelect;

export const insertAppointmentSchema = createInsertSchema(appointments).omit({ id: true, createdAt: true });
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;

export const insertQueueEventSchema = createInsertSchema(queueEvents).omit({ id: true, timestamp: true });
export type InsertQueueEvent = z.infer<typeof insertQueueEventSchema>;
export type QueueEvent = typeof queueEvents.$inferSelect;

// --- API Request/Response Types ---

// User (Admin)
export type LoginRequest = InsertUser;

// Patients
export type CreatePatientRequest = InsertPatient;
export type UpdatePatientRequest = Partial<InsertPatient>;

// Walk-in / Emergency Request
export interface WalkInRequest {
  name: string;
  age: number;
  visitType: "first_time" | "follow_up" | "chronic_management" | "minor_complaint";
  problemDescription: string;
  isEmergency?: boolean;
}

export type WalkInResponse = Patient & { severityScore: number, explanation: string };

// Doctors
export type CreateDoctorRequest = InsertDoctor;
export type UpdateDoctorRequest = Partial<InsertDoctor>;
export type FatigueResponse = { fatigueScore: number, breakSuggested: boolean, isOverworked: boolean };

// Appointments
export type CreateAppointmentRequest = InsertAppointment;
export type UpdateAppointmentRequest = Partial<InsertAppointment>;
export type AppointmentWithDetails = Appointment & { patient: Patient, doctor: Doctor | null };

// Analytics & Dashboard
export type AnalyticsSummary = {
  activeConsultations: number;
  avgWaitMinutes: number;
  dailyThroughput: number;
  optimizationScore: number;
  queueEfficiency: string;
};

export type DashboardDataResponse = {
  doctors: Doctor[];
  queue: AppointmentWithDetails[];
  analytics: AnalyticsSummary;
};
