import { getApplicationStorage } from "@/db/bindings";

export const runtime = "edge";

const MAX_RESUME_BYTES = 5 * 1024 * 1024;
const allowedExtensions = new Set(["pdf", "doc", "docx"]);
const allowedTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function value(form: FormData, name: string) {
  const entry = form.get(name);
  return typeof entry === "string" ? entry.trim() : "";
}

function cleanFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-").slice(-120);
}

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  const requestOrigin = request.headers.get("origin");
  if (requestOrigin && requestOrigin !== new URL(request.url).origin) {
    return Response.json({ error: "Invalid request origin." }, { status: 403 });
  }

  try {
    const form = await request.formData();
    const honeypot = value(form, "company_website");
    if (honeypot) {
      return Response.json({ ok: true, applicationId: "received" }, { status: 201 });
    }

    const fullName = value(form, "full_name");
    const phone = value(form, "phone");
    const email = value(form, "email").toLowerCase();
    const city = value(form, "city");
    const workArea = value(form, "work_area");
    const preferredRole = value(form, "preferred_role");
    const experience = value(form, "experience");
    const availability = value(form, "availability");
    const preferredLanguage = value(form, "preferred_language") === "en" ? "en" : "es";
    const consent = value(form, "consent");

    if (!fullName || !phone || !email || !workArea || !experience || !availability || consent !== "yes") {
      return Response.json({ error: "Please complete all required fields." }, { status: 400 });
    }

    if (!validEmail(email)) {
      return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    if ([fullName, phone, email, city, workArea, preferredRole, availability].some((item) => item.length > 180) || experience.length > 2000) {
      return Response.json({ error: "One or more fields are too long." }, { status: 400 });
    }

    const resumeEntry = form.get("resume");
    const resume = resumeEntry instanceof File && resumeEntry.size > 0 ? resumeEntry : null;
    let resumeKey: string | null = null;
    let resumeFilename: string | null = null;
    let resumeContentType: string | null = null;
    let resumeSize: number | null = null;

    if (resume) {
      const extension = resume.name.split(".").pop()?.toLowerCase() ?? "";
      if (!allowedExtensions.has(extension) || (resume.type && !allowedTypes.has(resume.type))) {
        return Response.json({ error: "Resume must be a PDF, DOC, or DOCX file." }, { status: 400 });
      }
      if (resume.size > MAX_RESUME_BYTES) {
        return Response.json({ error: "Resume must be 5 MB or smaller." }, { status: 400 });
      }
    }

    const applicationId = crypto.randomUUID();
    const { db, bucket } = getApplicationStorage();

    if (resume) {
      resumeFilename = cleanFilename(resume.name) || `resume-${applicationId}`;
      resumeContentType = resume.type || "application/octet-stream";
      resumeSize = resume.size;
      resumeKey = `applications/${applicationId}/${resumeFilename}`;
      await bucket.put(resumeKey, resume.stream(), {
        httpMetadata: { contentType: resumeContentType },
        customMetadata: { applicationId },
      });
    }

    try {
      await db.prepare(`
        INSERT INTO job_applications (
          id, full_name, phone, email, city, work_area, preferred_role,
          experience, availability, preferred_language, resume_key,
          resume_filename, resume_content_type, resume_size, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        applicationId,
        fullName,
        phone,
        email,
        city,
        workArea,
        preferredRole,
        experience,
        availability,
        preferredLanguage,
        resumeKey,
        resumeFilename,
        resumeContentType,
        resumeSize,
        "new",
      ).run();
    } catch (error) {
      if (resumeKey) await bucket.delete(resumeKey);
      throw error;
    }

    return Response.json({ ok: true, applicationId }, { status: 201 });
  } catch (error) {
    console.error("Application submission failed", error);
    return Response.json(
      { error: "We could not send your application. Please try again or email your resume." },
      { status: 500 },
    );
  }
}
