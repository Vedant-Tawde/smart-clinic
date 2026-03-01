import { z } from 'zod';
import {
  insertUserSchema,
  insertDoctorSchema,
  insertPatientSchema,
  insertAppointmentSchema,
  doctors,
  patients,
  appointments,
  users
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

// Base inferred Zod objects for response schemas
const doctorSchema = z.custom<typeof doctors.$inferSelect>();
const patientSchema = z.custom<typeof patients.$inferSelect>();
const appointmentSchema = z.custom<typeof appointments.$inferSelect>();

const appointmentWithDetailsSchema = appointmentSchema.and(z.object({
  patient: patientSchema,
  doctor: doctorSchema.nullable(),
}));

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/login' as const,
      input: insertUserSchema,
      responses: {
        200: z.object({ message: z.string() }),
        401: errorSchemas.unauthorized,
      },
    },
    signup: {
      method: 'POST' as const,
      path: '/api/signup' as const,
      input: insertUserSchema,
      responses: {
        201: z.object({ message: z.string() }),
        400: errorSchemas.validation,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout' as const,
      responses: {
        200: z.object({ message: z.string() }),
      }
    },
    me: {
      method: 'GET' as const,
      path: '/api/me' as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      }
    }
  },
  doctors: {
    list: {
      method: 'GET' as const,
      path: '/api/doctors' as const,
      responses: {
        200: z.array(doctorSchema),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/doctors' as const,
      input: insertDoctorSchema,
      responses: {
        201: doctorSchema,
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/doctors/:id' as const,
      input: insertDoctorSchema.partial(),
      responses: {
        200: doctorSchema,
        404: errorSchemas.notFound,
      },
    },
    giveBreak: {
      method: 'POST' as const,
      path: '/api/doctors/:id/break' as const,
      responses: {
        200: doctorSchema,
        404: errorSchemas.notFound,
      }
    },
    fatigue: {
      method: 'GET' as const,
      path: '/api/doctors/:id/fatigue' as const,
      responses: {
        200: z.object({
          fatigueScore: z.number(),
          breakSuggested: z.boolean(),
          isOverworked: z.boolean(),
        }),
        404: errorSchemas.notFound,
      }
    }
  },
  patients: {
    walkin: {
      method: 'POST' as const,
      path: '/api/walkin' as const,
      input: z.object({
        name: z.string(),
        age: z.number(),
        visitType: z.enum(["first_time", "follow_up", "chronic_management", "minor_complaint"]),
        problemDescription: z.string(),
        isEmergency: z.boolean().optional(),
      }),
      responses: {
        201: patientSchema.and(z.object({ severityScore: z.number(), explanation: z.string() })),
        400: errorSchemas.validation,
      }
    },
    list: {
      method: 'GET' as const,
      path: '/api/patients' as const,
      responses: {
        200: z.array(patientSchema),
      }
    },
    search: {
      method: 'GET' as const,
      path: '/api/patients/search' as const,
      input: z.object({ q: z.string() }).optional(),
      responses: {
        200: z.array(patientSchema),
      }
    }
  },
  appointments: {
    list: {
      method: 'GET' as const,
      path: '/api/appointments' as const,
      responses: {
        200: z.array(appointmentWithDetailsSchema),
      }
    },
    updateStatus: {
      method: 'PUT' as const,
      path: '/api/appointments/:id/status' as const,
      input: z.object({ status: z.enum(["waiting", "in_consultation", "completed", "cancelled", "no_show"]) }),
      responses: {
        200: appointmentSchema,
        404: errorSchemas.notFound,
      }
    }
  },
  dashboard: {
    data: {
      method: 'GET' as const,
      path: '/api/dashboard' as const,
      responses: {
        200: z.object({
          doctors: z.array(doctorSchema),
          queue: z.array(appointmentWithDetailsSchema),
          analytics: z.object({
            activeConsultations: z.number(),
            avgWaitMinutes: z.number(),
            dailyThroughput: z.number(),
            optimizationScore: z.number(),
            queueEfficiency: z.string(),
          })
        }),
      }
    },
    loadBalanceSuggestions: {
      method: 'GET' as const,
      path: '/api/load-balance/suggestions' as const,
      responses: {
        200: z.array(z.object({
          overloadedDoctorId: z.number(),
          underutilizedDoctorId: z.number(),
          suggestedTransferCount: z.number(),
          reason: z.string(),
        }))
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
