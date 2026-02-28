import { db } from "./db";
import { 
  users, doctors, patients, appointments, queueEvents,
  type User, type InsertUser,
  type Doctor, type InsertDoctor,
  type Patient, type InsertPatient,
  type Appointment, type InsertAppointment,
  type QueueEvent, type InsertQueueEvent
} from "@shared/schema";
import { eq, ilike } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Doctors
  getDoctors(): Promise<Doctor[]>;
  getDoctor(id: number): Promise<Doctor | undefined>;
  createDoctor(doctor: InsertDoctor): Promise<Doctor>;
  updateDoctor(id: number, updates: Partial<InsertDoctor>): Promise<Doctor | undefined>;

  // Patients
  getPatients(): Promise<Patient[]>;
  getPatient(id: number): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  searchPatients(query: string): Promise<Patient[]>;

  // Appointments
  getAppointments(): Promise<Appointment[]>;
  getAppointment(id: number): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined>;

  // Queue Events
  createQueueEvent(event: InsertQueueEvent): Promise<QueueEvent>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Doctors
  async getDoctors(): Promise<Doctor[]> {
    return await db.select().from(doctors);
  }

  async getDoctor(id: number): Promise<Doctor | undefined> {
    const [doctor] = await db.select().from(doctors).where(eq(doctors.id, id));
    return doctor;
  }

  async createDoctor(doctor: InsertDoctor): Promise<Doctor> {
    const [created] = await db.insert(doctors).values(doctor).returning();
    return created;
  }

  async updateDoctor(id: number, updates: Partial<InsertDoctor>): Promise<Doctor | undefined> {
    const [updated] = await db.update(doctors)
      .set(updates)
      .where(eq(doctors.id, id))
      .returning();
    return updated;
  }

  // Patients
  async getPatients(): Promise<Patient[]> {
    return await db.select().from(patients);
  }

  async getPatient(id: number): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient;
  }

  async createPatient(patient: InsertPatient): Promise<Patient> {
    const [created] = await db.insert(patients).values(patient).returning();
    return created;
  }

  async searchPatients(query: string): Promise<Patient[]> {
    return await db.select().from(patients).where(ilike(patients.name, `%${query}%`));
  }

  // Appointments
  async getAppointments(): Promise<Appointment[]> {
    return await db.select().from(appointments);
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    const [app] = await db.select().from(appointments).where(eq(appointments.id, id));
    return app;
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const [created] = await db.insert(appointments).values(appointment).returning();
    return created;
  }

  async updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined> {
    const [updated] = await db.update(appointments)
      .set({ status })
      .where(eq(appointments.id, id))
      .returning();
    return updated;
  }

  // Queue Events
  async createQueueEvent(event: InsertQueueEvent): Promise<QueueEvent> {
    const [created] = await db.insert(queueEvents).values(event).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
