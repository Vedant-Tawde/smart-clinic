import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "../shared/routes";
import { z } from "zod";
import session from "express-session";


declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Setup session
  app.use(session({
    secret: process.env.SESSION_SECRET || 'dev_secret_key_123',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7
    }
  }));

  // Auth Routes
  app.post(api.auth.signup.path, async (req, res) => {
    try {
      const input = api.auth.signup.input.parse(req.body);
      const existing = await storage.getUserByUsername(input.username);

      if (existing) {
        return res.status(400).json({ message: "Username already exists", field: "username" });
      }

      const user = await storage.createUser({ username: input.username, password: input.password });
      req.session.userId = user.id;

      return res.status(201).json({ message: "Account created successfully" });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.auth.login.path, async (req, res) => {
    try {
      const input = api.auth.login.input.parse(req.body);
      const user = await storage.getUserByUsername(input.username);

      if (!user || user.password !== input.password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      return res.status(200).json({ message: "Logged in successfully" });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.session.destroy(() => {
      res.status(200).json({ message: "Logged out" });
    });
  });

  app.get(api.auth.me.path, async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    return res.status(200).json(user);
  });

  // Doctors
  app.get(api.doctors.list.path, async (req, res) => {
    const doctorsList = await storage.getDoctors();
    res.json(doctorsList);
  });

  app.post(api.doctors.create.path, async (req, res) => {
    try {
      const input = api.doctors.create.input.parse(req.body);
      const doctor = await storage.createDoctor(input);
      res.status(201).json(doctor);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put(api.doctors.update.path, async (req, res) => {
    try {
      const input = api.doctors.update.input.parse(req.body);
      const id = Number(req.params.id);
      const updated = await storage.updateDoctor(id, input);
      if (!updated) return res.status(404).json({ message: "Doctor not found" });
      res.json(updated);
    } catch (err) {
      res.status(400).json({ message: "Validation error" });
    }
  });

  app.post(api.doctors.giveBreak.path, async (req, res) => {
    const id = Number(req.params.id);
    const updated = await storage.updateDoctor(id, {
      lastBreakTime: new Date(),
      fatigueScore: 0,
      isOverworked: false
    });
    if (!updated) return res.status(404).json({ message: "Doctor not found" });
    res.json(updated);
  });

  app.get(api.doctors.fatigue.path, async (req, res) => {
    const id = Number(req.params.id);
    const doctor = await storage.getDoctor(id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    // Simulate fatigue logic based on capacity vs last break
    res.json({
      fatigueScore: doctor.fatigueScore,
      breakSuggested: doctor.fatigueScore > 75,
      isOverworked: doctor.isOverworked
    });
  });

  // Patients & Walk-ins
  app.get(api.patients.list.path, async (req, res) => {
    const patientsList = await storage.getPatients();
    res.json(patientsList);
  });

  app.get(api.patients.search.path, async (req, res) => {
    const query = req.query.q as string || "";
    const patientsList = await storage.searchPatients(query);
    res.json(patientsList);
  });

  app.post(api.patients.walkin.path, async (req, res) => {
    try {
      const input = api.patients.walkin.input.parse(req.body);

      // Basic AI Simulation for Severity
      let severityScore = input.isEmergency ? 10 : 3;
      if (input.problemDescription.toLowerCase().includes("pain")) severityScore += 2;
      if (input.visitType === "minor_complaint") severityScore = Math.max(1, severityScore - 1);
      severityScore = Math.min(10, severityScore);

      let urgencyScore = severityScore * 2;

      const patient = await storage.createPatient({
        name: input.name,
        age: input.age,
        visitType: input.visitType,
        problemDescription: input.problemDescription,
        aiSeverityScore: severityScore,
        urgencyScore: urgencyScore,
        noShowProbability: 5, // Simulated low probability for walkins
      });

      // Predict duration bias based on visit_type
      let predictedDuration = 15;
      if (input.visitType === "first_time") predictedDuration += 5;
      if (input.visitType === "minor_complaint") predictedDuration -= 5;
      if (input.visitType === "chronic_management") predictedDuration += 10;

      // Assign to first available doctor or leave in general pool
      const doctorsList = await storage.getDoctors();
      const doctorId = doctorsList.length > 0 ? doctorsList[0].id : null;

      await storage.createAppointment({
        patientId: patient.id,
        doctorId: doctorId,
        predictedDuration,
        bufferAllocated: 5,
        status: "waiting",
      });

      res.status(201).json({
        ...patient,
        severityScore,
        explanation: `Calculated based on problem description and ${input.isEmergency ? 'emergency status' : 'visit type'}.`
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Appointments
  app.get(api.appointments.list.path, async (req, res) => {
    const apps = await storage.getAppointments();
    const pats = await storage.getPatients();
    const docs = await storage.getDoctors();

    // Map to AppointmentWithDetails
    const fullApps = apps.map(app => ({
      ...app,
      patient: pats.find(p => p.id === app.patientId)!,
      doctor: app.doctorId ? docs.find(d => d.id === app.doctorId) || null : null
    }));

    res.json(fullApps);
  });

  app.put(api.appointments.updateStatus.path, async (req, res) => {
    try {
      const input = api.appointments.updateStatus.input.parse(req.body);
      const id = Number(req.params.id);
      const updated = await storage.updateAppointmentStatus(id, input.status);
      if (!updated) return res.status(404).json({ message: "Appointment not found" });

      // Log event
      await storage.createQueueEvent({
        appointmentId: updated.id,
        eventType: `status_changed_to_${input.status}`
      });

      res.json(updated);
    } catch (err) {
      res.status(400).json({ message: "Validation error" });
    }
  });

  // Dashboard Aggregation
  app.get(api.dashboard.data.path, async (req, res) => {
    const docs = await storage.getDoctors();
    const apps = await storage.getAppointments();
    const pats = await storage.getPatients();

    const queue = apps.map(app => ({
      ...app,
      patient: pats.find(p => p.id === app.patientId)!,
      doctor: app.doctorId ? docs.find(d => d.id === app.doctorId) || null : null
    }));

    const activeConsultations = queue.filter(q => q.status === "in_consultation").length;

    res.json({
      doctors: docs,
      queue,
      analytics: {
        activeConsultations,
        avgWaitMinutes: 18,
        dailyThroughput: queue.filter(q => q.status === "completed").length + 15,
        optimizationScore: 92,
        queueEfficiency: "High"
      }
    });
  });

  app.get(api.dashboard.loadBalanceSuggestions.path, async (req, res) => {
    const docs = await storage.getDoctors();
    if (docs.length < 2) return res.json([]);

    // Simple heuristic for demo: if one is overworked and another has low fatigue
    const overworked = docs.find(d => d.isOverworked || d.fatigueScore > 80);
    const underutilized = docs.find(d => !d.isOverworked && d.fatigueScore < 40);

    if (overworked && underutilized) {
      res.json([{
        overloadedDoctorId: overworked.id,
        underutilizedDoctorId: underutilized.id,
        suggestedTransferCount: 2,
        reason: `${overworked.name} is overloaded. Suggesting transfer of 2 non-urgent cases to ${underutilized.name}.`
      }]);
    } else {
      res.json([]);
    }
  });

  // Seed Data
  seedDatabase().catch(console.error);

  return httpServer;
}

async function seedDatabase() {
  const existingDocs = await storage.getDoctors();
  if (existingDocs.length === 0) {
    const d1 = await storage.createDoctor({
      name: "Dr. Amanda Foster",
      specialization: "Internal Medicine",
      workingHoursStart: "09:00",
      workingHoursEnd: "17:00",
      maxDailyCapacity: 20,
      fatigueScore: 82,
      isOverworked: true,
    });

    const d2 = await storage.createDoctor({
      name: "Dr. James Liu",
      specialization: "Family Practice",
      workingHoursStart: "09:00",
      workingHoursEnd: "17:00",
      maxDailyCapacity: 25,
      fatigueScore: 45,
      isOverworked: false,
    });

    const d3 = await storage.createDoctor({
      name: "Dr. Maria Santos",
      specialization: "Pediatrics",
      workingHoursStart: "10:00",
      workingHoursEnd: "18:00",
      maxDailyCapacity: 15,
      fatigueScore: 28,
      isOverworked: false,
    });

    const p1 = await storage.createPatient({
      name: "Sarah Johnson",
      age: 32,
      visitType: "first_time",
      problemDescription: "Severe chest pain",
      aiSeverityScore: 9,
      urgencyScore: 18,
      noShowProbability: 2,
    });

    const p2 = await storage.createPatient({
      name: "Michael Chen",
      age: 45,
      visitType: "chronic_management",
      problemDescription: "Routine diabetes check",
      aiSeverityScore: 4,
      urgencyScore: 8,
      noShowProbability: 10,
    });

    await storage.createAppointment({
      patientId: p1.id,
      doctorId: d1.id,
      predictedDuration: 25,
      bufferAllocated: 5,
      status: "in_consultation"
    });

    await storage.createAppointment({
      patientId: p2.id,
      doctorId: null,
      predictedDuration: 15,
      bufferAllocated: 5,
      status: "waiting"
    });
  }
}
