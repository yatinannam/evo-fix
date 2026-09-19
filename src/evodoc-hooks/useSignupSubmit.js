import { useState } from "react";

export function useSignupSubmit({ source, onSuccess }) {
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(dataObjectOrEvent) {
    let data;

    // Support both direct object pass (from PreRegisterCard) and native form submit event (from SignupForm)
    if (dataObjectOrEvent && dataObjectOrEvent.preventDefault) {
      dataObjectOrEvent.preventDefault();
      const form = dataObjectOrEvent.currentTarget;
      
      data = {
        firstName: form.firstName?.value.trim(),
        lastName:  form.lastName?.value.trim(),
        email:     form.email?.value.trim(),
        phone:     form.phone?.value.trim() || "",
        designation:  form.designation?.value.trim() || "",
        organization: form.organization?.value.trim() || "",
        feedback:  form.feedback?.value.trim() || "",
        earlyAccess:   form.earlyAccess?.checked ?? true,
        termsAccepted: form.terms?.checked ?? false,
        source,
        website:   form.website?.value || "",
      };
    } else {
      data = { ...dataObjectOrEvent, source };
    }

    if (!data.firstName) { setErrorMsg("First name is required."); return; }
    if (!data.lastName)  { setErrorMsg("Last name is required."); return; }
    if (!data.email)     { setErrorMsg("Email is required."); return; }
    if (!data.termsAccepted) { setErrorMsg("Please accept the Terms & Privacy Policy to continue."); return; }

    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      setStatus("success");
      if (typeof onSuccess === "function") onSuccess();
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  }

  return { status, errorMsg, handleSubmit };
}
