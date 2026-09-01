"use client";

import { AlertCircle, ArrowRight, CheckCircle2, Mail, UploadCloud } from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";

type Language = "es" | "en";
type SubmitState = "idle" | "submitting" | "success" | "error";

const copy = {
  es: {
    eyebrow: "Solicitud en línea",
    title: "Tu próximo paso puede empezar aquí.",
    body: "Completa tu perfil para que nuestro equipo pueda considerarte para oportunidades actuales y futuras. El currículum es opcional.",
    name: "Nombre completo",
    phone: "Teléfono",
    email: "Correo electrónico",
    city: "Ciudad",
    area: "Área de interés",
    areaPlaceholder: "Selecciona un área",
    areas: ["Administración", "Almacén y logística", "Manufactura y producción", "Calidad y seguridad", "Liderazgo y supervisión", "Restaurantes y servicio", "Otra"],
    role: "Puesto de interés",
    rolePlaceholder: "Ej. montacarguista, traffic clerk, supervisor",
    experience: "Experiencia relevante",
    experiencePlaceholder: "Cuéntanos brevemente sobre tu experiencia, habilidades o certificaciones.",
    availability: "Disponibilidad",
    availabilityPlaceholder: "Ej. inmediata, turno nocturno, lunes a viernes",
    language: "Idioma preferido",
    resume: "Currículum / CV (opcional)",
    resumeHint: "PDF, DOC o DOCX · máximo 5 MB",
    consent: "Autorizo a Multiservices Laredo a contactarme sobre oportunidades de empleo y a conservar esta información para fines de reclutamiento.",
    submit: "Enviar solicitud",
    submitting: "Enviando…",
    successTitle: "Solicitud recibida",
    successBody: "Gracias. Nuestro equipo revisará tu información y te contactará si hay una oportunidad compatible.",
    reference: "Referencia",
    another: "Enviar otra solicitud",
    error: "No pudimos enviar la solicitud. Inténtalo de nuevo o envía tu currículum por correo.",
    emailLead: "¿Prefieres enviarnos tu CV directamente?",
    emailCta: "Enviar por correo",
    required: "Campos marcados con * son obligatorios.",
  },
  en: {
    eyebrow: "Online application",
    title: "Your next step can start here.",
    body: "Complete your profile so our team can consider you for current and future opportunities. A résumé is optional.",
    name: "Full name",
    phone: "Phone",
    email: "Email address",
    city: "City",
    area: "Area of interest",
    areaPlaceholder: "Select an area",
    areas: ["Administration", "Warehouse and logistics", "Manufacturing and production", "Quality and safety", "Leadership and supervision", "Restaurants and service", "Other"],
    role: "Preferred role",
    rolePlaceholder: "E.g. forklift operator, traffic clerk, supervisor",
    experience: "Relevant experience",
    experiencePlaceholder: "Briefly tell us about your experience, skills, or certifications.",
    availability: "Availability",
    availabilityPlaceholder: "E.g. immediate, night shift, Monday–Friday",
    language: "Preferred language",
    resume: "Résumé / CV (optional)",
    resumeHint: "PDF, DOC, or DOCX · 5 MB maximum",
    consent: "I authorize Multiservices Laredo to contact me about job opportunities and retain this information for recruiting purposes.",
    submit: "Submit application",
    submitting: "Sending…",
    successTitle: "Application received",
    successBody: "Thank you. Our team will review your information and contact you if an opportunity is a match.",
    reference: "Reference",
    another: "Submit another application",
    error: "We could not send your application. Try again or email your résumé.",
    emailLead: "Prefer to send your résumé directly?",
    emailCta: "Send by email",
    required: "Fields marked * are required.",
  },
} as const;

const resumeEmail = "mailto:vacantes@multiservicesldo.com?subject=Solicitud%20de%20empleo%20-%20Multiservices%20Laredo";

export function ApplicationForm({ language }: { language: Language }) {
  const t = copy[language];
  const formRef = useRef<HTMLFormElement>(null);
  const [state, setState] = useState<SubmitState>("idle");
  const [reference, setReference] = useState("");

  async function submitApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");

    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      const response = await fetch("/api/applications", { method: "POST", body: data });
      const result = await response.json() as { applicationId?: string; error?: string };
      if (!response.ok || !result.applicationId) throw new Error(result.error ?? "Submission failed");

      setReference(result.applicationId.slice(0, 8).toUpperCase());
      setState("success");
      form.reset();
    } catch {
      setState("error");
    }
  }

  function resetForm() {
    setReference("");
    setState("idle");
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <section className="application-section" id="solicitud" aria-labelledby="application-title">
      <div className="application-intro">
        <p className="eyebrow eyebrow-gold">{t.eyebrow}</p>
        <h2 id="application-title">{t.title}</h2>
        <p>{t.body}</p>
        <div className="application-email">
          <Mail aria-hidden="true" size={20} />
          <div><span>{t.emailLead}</span><a href={resumeEmail}>{t.emailCta}<ArrowRight aria-hidden="true" size={15} /></a></div>
        </div>
      </div>

      <div className="application-panel">
        {state === "success" ? (
          <div className="application-success" role="status">
            <CheckCircle2 aria-hidden="true" size={38} />
            <p className="eyebrow">{t.successTitle}</p>
            <h3>{t.successBody}</h3>
            <p>{t.reference}: <strong>{reference}</strong></p>
            <Button type="button" className="application-submit" onClick={resetForm}>{t.another}<ArrowRight aria-hidden="true" /></Button>
          </div>
        ) : (
          <form ref={formRef} onSubmit={submitApplication} encType="multipart/form-data">
            <p className="application-required">{t.required}</p>
            <div className="application-grid">
              <div className="form-field"><Label htmlFor="full_name">{t.name} *</Label><Input id="full_name" name="full_name" autoComplete="name" required maxLength={180} /></div>
              <div className="form-field"><Label htmlFor="phone">{t.phone} *</Label><Input id="phone" name="phone" type="tel" autoComplete="tel" required maxLength={80} /></div>
              <div className="form-field"><Label htmlFor="email">{t.email} *</Label><Input id="email" name="email" type="email" autoComplete="email" required maxLength={180} /></div>
              <div className="form-field"><Label htmlFor="city">{t.city}</Label><Input id="city" name="city" autoComplete="address-level2" maxLength={180} /></div>
              <div className="form-field"><Label htmlFor="work_area">{t.area} *</Label><NativeSelect id="work_area" name="work_area" required defaultValue=""><NativeSelectOption value="" disabled>{t.areaPlaceholder}</NativeSelectOption>{t.areas.map((area) => <NativeSelectOption key={area} value={area}>{area}</NativeSelectOption>)}</NativeSelect></div>
              <div className="form-field"><Label htmlFor="preferred_role">{t.role}</Label><Input id="preferred_role" name="preferred_role" placeholder={t.rolePlaceholder} maxLength={180} /></div>
              <div className="form-field form-field-wide"><Label htmlFor="experience">{t.experience} *</Label><Textarea id="experience" name="experience" placeholder={t.experiencePlaceholder} required maxLength={2000} rows={5} /></div>
              <div className="form-field"><Label htmlFor="availability">{t.availability} *</Label><Input id="availability" name="availability" placeholder={t.availabilityPlaceholder} required maxLength={180} /></div>
              <div className="form-field"><Label htmlFor="preferred_language">{t.language}</Label><NativeSelect id="preferred_language" name="preferred_language" defaultValue={language} key={language}><NativeSelectOption value="es">Español</NativeSelectOption><NativeSelectOption value="en">English</NativeSelectOption></NativeSelect></div>
              <div className="form-field form-field-wide resume-field"><Label htmlFor="resume"><UploadCloud aria-hidden="true" size={18} />{t.resume}</Label><Input id="resume" name="resume" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" /><small>{t.resumeHint}</small></div>
            </div>

            <div className="honeypot" aria-hidden="true"><Label htmlFor="company_website">Website</Label><Input id="company_website" name="company_website" tabIndex={-1} autoComplete="off" /></div>

            <label className="consent-row"><input type="checkbox" name="consent" value="yes" required /><span>{t.consent}</span></label>

            {state === "error" && <div className="application-error" role="alert"><AlertCircle aria-hidden="true" size={18} />{t.error}</div>}
            <Button type="submit" className="application-submit" disabled={state === "submitting"}>{state === "submitting" ? t.submitting : t.submit}<ArrowRight aria-hidden="true" /></Button>
          </form>
        )}
      </div>
    </section>
  );
}
