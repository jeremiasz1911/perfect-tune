import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uid: text("uid").notNull().unique(), // Firebase UID
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  surname: text("surname").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  postalCode: text("postal_code").notNull(),
  apartmentNumber: text("apartment_number"),
  houseNumber: text("house_number"),
  phoneNumber: text("phone_number").notNull(),
  role: text("role").notNull().default("parent"), // admin or parent
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Child Schema
export const children = pgTable("children", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  surname: text("surname").notNull(),
  age: integer("age").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Class Schema
export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // Regular class or workshop
  capacity: integer("capacity").notNull(),
  price: integer("price").notNull(), // Price in cents
  frequency: text("frequency").notNull(), // weekly, biweekly, monthly, one-time
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  recurringDays: jsonb("recurring_days").notNull(), // Array of days of the week
  location: text("location").notNull(),
  instructor: text("instructor").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Enrollment Schema
export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  childId: integer("child_id").notNull().references(() => children.id),
  classId: integer("class_id").notNull().references(() => classes.id),
  status: text("status").notNull().default("active"), // active, cancelled, completed
  enrollmentDate: timestamp("enrollment_date").notNull().defaultNow(),
});

// Payment Schema
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(), // Amount in cents
  description: text("description").notNull(),
  status: text("status").notNull(), // pending, completed, failed
  paymentMethod: text("payment_method").notNull(), // Tpay, etc.
  transactionId: text("transaction_id"),
  paymentDate: timestamp("payment_date").notNull().defaultNow(),
});

// Attendance Schema
export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  enrollmentId: integer("enrollment_id").notNull().references(() => enrollments.id),
  date: timestamp("date").notNull(),
  status: text("status").notNull(), // present, absent, excused
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true 
});

export const insertChildSchema = createInsertSchema(children).omit({ 
  id: true, 
  createdAt: true 
});

export const insertClassSchema = createInsertSchema(classes).omit({ 
  id: true, 
  createdAt: true 
});

export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({ 
  id: true, 
  enrollmentDate: true 
});

export const insertPaymentSchema = createInsertSchema(payments).omit({ 
  id: true, 
  paymentDate: true 
});

export const insertAttendanceSchema = createInsertSchema(attendance).omit({ 
  id: true 
});

// Export Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertChild = z.infer<typeof insertChildSchema>;
export type Child = typeof children.$inferSelect;

export type InsertClass = z.infer<typeof insertClassSchema>;
export type Class = typeof classes.$inferSelect;

export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type Enrollment = typeof enrollments.$inferSelect;

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Attendance = typeof attendance.$inferSelect;
