import { 
  Doctor, User, Patient, ConfigAgenda, Slot, Appointment, 
  AppointmentStatus, UserRole, Notification 
} from '../types';
import { addDays, format, parse, addMinutes, isBefore, startOfDay, isSameDay } from 'date-fns';

// Keys for LocalStorage
const STORAGE_KEYS = {
  DOCTOR: 'med_doctor',
  USERS: 'med_users',
  PATIENTS: 'med_patients',
  CONFIG: 'med_config',
  APPOINTMENTS: 'med_appointments',
  NOTIFICATIONS: 'med_notifications'
};

// Seed Data
const DEFAULT_DOCTOR: Doctor = {
  id: 'doc_1',
  name: 'Dra. Ana Silva',
  email: 'ana@med.com',
  specialty: 'Dermatologia',
  confirmationDeadlineHours: 48
};

const DEFAULT_USERS: User[] = [
  {
    id: 'user_1',
    email: 'admin@med.com', // password: admin
    role: UserRole.ADMIN,
    doctorId: 'doc_1',
    name: 'Dra. Ana Silva'
  },
  {
    id: 'user_2',
    email: 'sec@med.com', // password: sec
    role: UserRole.SECRETARY,
    doctorId: 'doc_1',
    name: 'Maria Secretária'
  }
];

const DEFAULT_CONFIG: ConfigAgenda[] = [
  { id: 'cfg_1', doctorId: 'doc_1', dayOfWeek: 1, startTime: '09:00', endTime: '12:00', durationMinutes: 30, active: true }, // Mon
  { id: 'cfg_2', doctorId: 'doc_1', dayOfWeek: 1, startTime: '13:00', endTime: '18:00', durationMinutes: 30, active: true }, // Mon
  { id: 'cfg_3', doctorId: 'doc_1', dayOfWeek: 3, startTime: '09:00', endTime: '12:00', durationMinutes: 30, active: true }, // Wed
  { id: 'cfg_4', doctorId: 'doc_1', dayOfWeek: 3, startTime: '13:00', endTime: '18:00', durationMinutes: 30, active: true }, // Wed
  { id: 'cfg_5', doctorId: 'doc_1', dayOfWeek: 5, startTime: '09:00', endTime: '13:00', durationMinutes: 30, active: true }, // Fri
];

class DatabaseService {
  constructor() {
    this.init();
  }

  private init() {
    if (!localStorage.getItem(STORAGE_KEYS.DOCTOR)) {
      localStorage.setItem(STORAGE_KEYS.DOCTOR, JSON.stringify(DEFAULT_DOCTOR));
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(DEFAULT_CONFIG));
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify([]));
    }
  }

  // --- Getters ---
  getDoctor(): Doctor {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCTOR) || '{}');
  }

  getUsers(): User[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  }

  getConfig(): ConfigAgenda[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CONFIG) || '[]');
  }

  getAppointments(): Appointment[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.APPOINTMENTS) || '[]');
  }

  getPatients(): Patient[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PATIENTS) || '[]');
  }

  // --- Operations ---

  saveConfig(configs: ConfigAgenda[]) {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(configs));
  }

  saveAppointment(appt: Appointment) {
    const appts = this.getAppointments();
    appts.push(appt);
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appts));
  }

  updateAppointment(appt: Appointment) {
    const appts = this.getAppointments();
    const index = appts.findIndex(a => a.id === appt.id);
    if (index !== -1) {
      appts[index] = appt;
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appts));
    }
  }

  findPatientByEmail(email: string): Patient | undefined {
    return this.getPatients().find(p => p.email === email);
  }

  createPatient(patient: Patient) {
    const patients = this.getPatients();
    patients.push(patient);
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
  }

  // --- Logic ---

  // Generate Available Slots for next X days
  generateSlots(days: number = 30): Slot[] {
    const config = this.getConfig();
    const appointments = this.getAppointments().filter(a => 
      a.status !== AppointmentStatus.CANCELED && a.status !== AppointmentStatus.NOT_CONFIRMED
    );
    const slots: Slot[] = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const currentDate = addDays(today, i);
      const dayOfWeek = currentDate.getDay();

      const dayConfigs = config.filter(c => c.dayOfWeek === dayOfWeek && c.active);

      dayConfigs.forEach(cfg => {
        let currentSlotStart = parse(cfg.startTime, 'HH:mm', currentDate);
        const dayEnd = parse(cfg.endTime, 'HH:mm', currentDate);

        while (isBefore(currentSlotStart, dayEnd)) {
            const currentSlotEnd = addMinutes(currentSlotStart, cfg.durationMinutes);
            
            // Don't add if slot exceeds end time
            if (isBefore(dayEnd, currentSlotEnd)) break;

            const isReserved = appointments.some(appt => {
                const apptStart = new Date(appt.start);
                // Check for overlap
                return Math.abs(apptStart.getTime() - currentSlotStart.getTime()) < 60000; // tolerance
            });

            if (!isReserved) {
                slots.push({
                    id: `slot_${currentSlotStart.getTime()}`,
                    doctorId: cfg.doctorId,
                    start: currentSlotStart.toISOString(),
                    end: currentSlotEnd.toISOString(),
                    status: 'FREE'
                });
            }

            currentSlotStart = currentSlotEnd;
        }
      });
    }
    return slots;
  }

  // Background Job Simulation
  checkExpiredAppointments(): number {
    const appts = this.getAppointments();
    let updatedCount = 0;
    const now = new Date();

    const updatedAppts = appts.map(appt => {
      if (appt.status === AppointmentStatus.PENDING) {
        if (isBefore(new Date(appt.confirmationDeadline), now)) {
          updatedCount++;
          // Auto-cancel or mark not confirmed
          return { ...appt, status: AppointmentStatus.NOT_CONFIRMED }; // Releases slot effectively
        }
      }
      return appt;
    });

    if (updatedCount > 0) {
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(updatedAppts));
      console.log(`[JOB] Expired ${updatedCount} appointments.`);
    }
    return updatedCount;
  }
}

export const db = new DatabaseService();
