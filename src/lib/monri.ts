import { getAuthHeaders } from "./auth";
import { getErrorMessage, parseApiBody, readJsonResponse } from "./api-utils";

export type MonriSessionResponse = {
  action: string;
  fields: Record<string, string>;
  order: {
    orderNumber: string;
    planId: string;
    planName: string;
    billingInterval: string;
    amount: number;
    currency: string;
    testMode: boolean;
  };
};

export async function createMonriSession(input: {
  token: string;
  userId: string;
  planId: string;
  billingInterval: string;
  email: string;
  name?: string;
}): Promise<MonriSessionResponse> {
  let response: Response;
  try {
    response = await fetch("/api/payments/monri/session", {
      method: "POST",
      headers: getAuthHeaders(input.token, input.userId),
      body: JSON.stringify({
        planId: input.planId,
        billingInterval: input.billingInterval,
        email: input.email,
        name: input.name,
      }),
    });
  } catch {
    throw new Error("Povezivanje s platnim servisom nije uspjelo.");
  }

  const raw = await readJsonResponse(response);
  const parsed = parseApiBody(raw) as MonriSessionResponse & { error?: string };

  if (!response.ok) {
    throw new Error(
      getErrorMessage(parsed, "Priprema plaćanja nije uspjela."),
    );
  }

  if (!parsed.action || !parsed.fields) {
    throw new Error("Neispravan odgovor platnog servisa.");
  }

  return parsed;
}

export function submitMonriForm(
  action: string,
  fields: Record<string, string>,
): void {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = action;
  form.acceptCharset = "UTF-8";

  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
}

export async function verifyMonriSuccessUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch("/api/payments/monri/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const raw = await readJsonResponse(response);
    const parsed = parseApiBody(raw) as { valid?: boolean };
    return parsed.valid === true;
  } catch {
    return false;
  }
}
