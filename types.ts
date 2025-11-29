export enum UserRole {
  ADMIN = 'ADMIN',
  SECRETARY = 'SECRETARY'
}

export enum AppointmentStatus {
  PENDING = 'AGUARDANDO_CONFIRMACAO',
  CONFIRMED = 'CONFIRMADA',
  NOT_CONFIRMED = 'NAO_CONFIRMADA',
  CANCELED = 'CANCELADA',
  COMPLETED = 'COMPARECEU',
  MISSED = 'NAO_COMPARECEU'
}

export interface Doctor {
  id: string;
  name: string;
  email: string;
  specialty: string;
  confirmationDeadlineHours: number; // e.g., 48
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  doctorId: string;
  name: string;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  document?: string;
}

export interface ConfigAgenda {
  id: string;
  doctorId: string;
  dayOfWeek: number; // 0 (Sun) - 6 (Sat)
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  durationMinutes: number;
  active: boolean;
}

export interface Slot {
  id: string;
  doctorId: string;
  start: string; // ISO Date String
  end: string; // ISO Date String
  status: 'FREE' | 'RESERVED' | 'BLOCKED';
}

export interface Appointment {
  id: string;
  doctorId: string;
  patientId: string;
  slotId: string;
  start: string; // ISO Date String
  end: string;
  status: AppointmentStatus;
  confirmationDeadline: string; // ISO Date String
  confirmationToken: string;
  managementToken: string;
  notes?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  appointmentId: string;
  type: 'CREATED' | 'CONFIRMATION_REMINDER' | 'CANCELED';
  message: string;
  sentAt: string;
}
