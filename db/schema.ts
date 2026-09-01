import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const jobApplications = sqliteTable("job_applications", {
  id: text("id").primaryKey(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  city: text("city").notNull().default(""),
  workArea: text("work_area").notNull(),
  preferredRole: text("preferred_role").notNull().default(""),
  experience: text("experience").notNull(),
  availability: text("availability").notNull(),
  preferredLanguage: text("preferred_language").notNull().default("es"),
  resumeKey: text("resume_key"),
  resumeFilename: text("resume_filename"),
  resumeContentType: text("resume_content_type"),
  resumeSize: integer("resume_size"),
  status: text("status").notNull().default("new"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
