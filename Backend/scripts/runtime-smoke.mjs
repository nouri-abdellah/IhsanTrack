import dotenv from "dotenv";

dotenv.config({ path: "d:/ihsanTrack/server/.env" });

const baseUrl = "http://localhost:5000/api";

class CookieJar {
  constructor() {
    this.cookie = "";
  }

  apply(headers = {}) {
    if (!this.cookie) return headers;
    return { ...headers, Cookie: this.cookie };
  }

  update(setCookieHeader) {
    if (!setCookieHeader) return;
    const source = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
    const parts = source
      .map((value) => value.split(";")[0].trim())
      .filter(Boolean);

    if (!parts.length) return;

    const map = new Map();
    for (const item of this.cookie.split(";")) {
      const pair = item.trim();
      if (!pair) continue;
      const idx = pair.indexOf("=");
      if (idx === -1) continue;
      map.set(pair.slice(0, idx), pair.slice(idx + 1));
    }
    for (const item of parts) {
      const idx = item.indexOf("=");
      if (idx === -1) continue;
      map.set(item.slice(0, idx), item.slice(idx + 1));
    }
    this.cookie = Array.from(map.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join("; ");
  }
}

const parseBody = async (res) => {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const req = async ({ path, method = "GET", body, jar }) => {
  const headers = { "Content-Type": "application/json" };
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: jar ? jar.apply(headers) : headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (jar) {
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) jar.update(setCookie);
  }

  const parsedBody = await parseBody(res);
  return { status: res.status, body: parsedBody };
};

const assertStatus = (label, response, expected) => {
  if (response.status !== expected) {
    throw new Error(`${label} expected ${expected}, got ${response.status}. Body: ${JSON.stringify(response.body)}`);
  }
};

const run = async () => {
  const { User } = await import("../src/models/index.js");

  const ts = Date.now();
  const assocEmail = `assoc${ts}@smoke.local`;
  const volunteerEmail = `vol${ts}@smoke.local`;

  const assocJar = new CookieJar();
  const volunteerJar = new CookieJar();

  console.log("[1] registerAssociation");
  const associationRegistration = await req({
    path: "/auth/register-association",
    method: "POST",
    jar: assocJar,
    body: {
      full_name: "Assoc Owner",
      email: assocEmail,
      password: "Password123!",
      phone: "0555000001",
      social_number: `SN-${ts}`,
      name: "Ihsan Assoc Smoke",
      description: "Association profile for backend smoke testing flow validation.",
      logo_url: "https://example.com/logo.png",
      wilaya: "Algiers",
      Maps_link: "https://maps.google.com/?q=36.7538,3.0588",
      phone_number: "0555000002",
      opening_hours: "09:00-17:00",
      agreed_to_tos: true,
    },
  });
  assertStatus("registerAssociation", associationRegistration, 201);

  console.log("[2] verify association code");
  const assocUser = await User.findOne({ where: { email: assocEmail } });
  if (!assocUser?.email_verification_code) {
    throw new Error("association verify setup failed: verification code missing");
  }

  const verifyEmailResponse = await req({
    path: "/auth/verify-registration-code",
    method: "POST",
    jar: assocJar,
    body: {
      email: assocEmail,
      code: assocUser.email_verification_code,
    },
  });
  assertStatus("verify association code", verifyEmailResponse, 200);

  console.log("[3] register volunteer");
  const volunteerRegistration = await req({
    path: "/auth/register",
    method: "POST",
    jar: volunteerJar,
    body: {
      full_name: "Volunteer User",
      email: volunteerEmail,
      password: "Password123!",
      role: "volunteer",
      phone: "0555000003",
    },
  });
  assertStatus("register volunteer", volunteerRegistration, 201);

  console.log("[3.1] verify volunteer code");
  const volunteerUserUnverified = await User.findOne({ where: { email: volunteerEmail } });
  if (!volunteerUserUnverified?.email_verification_code) {
    throw new Error("volunteer verify setup failed: verification code missing");
  }

  const volunteerVerify = await req({
    path: "/auth/verify-registration-code",
    method: "POST",
    jar: volunteerJar,
    body: {
      email: volunteerEmail,
      code: volunteerUserUnverified.email_verification_code,
    },
  });
  assertStatus("verify volunteer code", volunteerVerify, 200);

  console.log("[4] createDonation strict auth check");
  const donationUnauthorized = await req({
    path: "/donations",
    method: "POST",
    body: {
      donation_project_id: 99999999,
      amount: 100,
      payment_method: "CCP",
    },
  });
  assertStatus("createDonation unauthenticated", donationUnauthorized, 401);

  console.log("[5] create donation project");
  const donationProject = await req({
    path: "/donation-projects",
    method: "POST",
    jar: assocJar,
    body: {
      title: "Smoke Donation Project",
      description: "Donation project created by smoke script",
      image_url: "https://example.com/project.png",
      goal_amount: 10000,
      max_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
  });
  assertStatus("create donation project", donationProject, 201);

  console.log("[6] createDonation authenticated");
  const createDonation = await req({
    path: "/donations",
    method: "POST",
    jar: volunteerJar,
    body: {
      donation_project_id: donationProject.body.id,
      amount: 150,
      payment_method: "CCP",
    },
  });
  assertStatus("createDonation authenticated", createDonation, 201);

  console.log("[7] create Event");
  const createEvent = await req({
    path: "/events",
    method: "POST",
    jar: assocJar,
    body: {
      title: "Smoke Event",
      description: "Event created for smoke application checks",
      image_url: "https://example.com/event.png",
      start_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
      location_wilaya: "Algiers",
      location_maps_link: "https://maps.google.com/?q=36.75,3.05",
      max_participants: 50,
      age_range: "18-55",
    },
  });
  assertStatus("createEvent", createEvent, 201);

  console.log("[8] registerForEvent");
  const registerForEvent = await req({
    path: `/events/${createEvent.body.id}/register`,
    method: "POST",
    jar: volunteerJar,
  });
  assertStatus("registerForEvent", registerForEvent, 201);

  const volunteerUser = await User.findOne({ where: { email: volunteerEmail } });
  if (!volunteerUser) {
    throw new Error("volunteer user lookup failed");
  }

  console.log("[9] acceptApplication");
  const acceptApplication = await req({
    path: `/events/${createEvent.body.id}/applications/${volunteerUser.id}/accept`,
    method: "PATCH",
    jar: assocJar,
  });
  assertStatus("acceptApplication", acceptApplication, 200);

  console.log("[10] rejectApplication");
  const rejectApplication = await req({
    path: `/events/${createEvent.body.id}/applications/${volunteerUser.id}/reject`,
    method: "PATCH",
    jar: assocJar,
  });
  assertStatus("rejectApplication", rejectApplication, 200);

  console.log("SMOKE_OK");
};

run().catch((err) => {
  console.error("SMOKE_FAILED", err.message);
  process.exit(1);
});
