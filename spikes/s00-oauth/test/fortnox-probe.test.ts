import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createFortnoxFlow,
  FORTNOX_REDIRECT,
  FORTNOX_SCOPES,
  FortnoxProbeError,
  finishFortnoxFlow,
} from "../src/fortnox-probe.js";

const config = {
  clientId: "synthetic-client",
  clientSecret: "synthetic-secret-not-a-credential",
  testTenantId: "9000001",
};
const json = (value: unknown, status = 200) =>
  new Response(JSON.stringify(value), {
    status,
    headers: { "Content-Type": "application/json" },
  });

function provider(tenant = config.testTenantId) {
  const requests: { path: string; method: string; grant: string | null }[] = [];
  let tokens = 0;
  const implementation: typeof fetch = async (input, init) => {
    const url = new URL(String(input));
    const form = new URLSearchParams(String(init?.body ?? ""));
    const grant = form.get("grant_type");
    requests.push({ path: url.pathname, method: init?.method ?? "GET", grant });
    assert.equal(init?.redirect, "error");
    if (url.hostname === "apps.fortnox.se") {
      assert.equal(url.pathname, "/oauth-v1/token");
      assert.equal(init?.method, "POST");
      assert.match(
        new Headers(init.headers).get("authorization") ?? "",
        /^Basic /,
      );
      if (grant === "authorization_code") {
        assert.ok(form.get("code_verifier"));
        assert.equal(form.get("redirect_uri"), FORTNOX_REDIRECT);
      } else if (grant === "client_credentials") {
        assert.equal(
          new Headers(init.headers).get("tenantid"),
          config.testTenantId,
        );
      } else {
        assert.equal(grant, "refresh_token");
        assert.equal(form.get("refresh_token"), "synthetic-refresh-1");
      }
      tokens++;
      return json({
        access_token: `synthetic-access-${tokens}`,
        refresh_token: `synthetic-refresh-${tokens}`,
        token_type: "bearer",
        expires_in: 3600,
        scope: FORTNOX_SCOPES,
      });
    }
    assert.equal(url.hostname, "api.fortnox.se");
    assert.equal(init?.method, "GET");
    if (url.pathname === "/3/companyinformation") {
      return json({
        CompanyInformation: {
          DatabaseNumber: tenant,
          CompanyName: "SYNTHETIC ONLY",
        },
      });
    }
    assert.equal(url.pathname, "/3/me");
    return json({
      Me: {
        SysAdmin: true,
        UserName: "NEVER EMIT THIS",
        Email: "fixture@example.invalid",
      },
    });
  };
  return { implementation, requests };
}

test("Fortnox probe pins scopes, PKCE, redirect and account mode", async () => {
  const service = await createFortnoxFlow(config, "service", 1000);
  const user = await createFortnoxFlow(config, "user", 1000);
  const url = new URL(service.authorizationUrl);
  assert.equal(url.origin, "https://apps.fortnox.se");
  assert.equal(url.searchParams.get("scope"), FORTNOX_SCOPES);
  assert.equal(url.searchParams.get("redirect_uri"), FORTNOX_REDIRECT);
  assert.equal(url.searchParams.get("code_challenge_method"), "S256");
  assert.equal(url.searchParams.get("account_type"), "service");
  assert.equal(url.searchParams.get("access_type"), "offline");
  assert.equal(
    new URL(user.authorizationUrl).searchParams.has("account_type"),
    false,
  );
  assert.notEqual(service.state, user.state);
  assert.notEqual(service.verifier, user.verifier);
});

test("Fortnox probe rejects wrong state, redirect, expiry and concurrent callback replay", async () => {
  const mock = provider();
  const flow = await createFortnoxFlow(config, "service", 1000);
  const url = new URL(
    `${FORTNOX_REDIRECT}?code=synthetic-code&state=${flow.state}`,
  );
  const bad = new URL(url);
  bad.searchParams.set("state", "wrong");
  await assert.rejects(
    finishFortnoxFlow(config, flow, bad, mock.implementation, 1001),
  );
  const wrongRedirect = new URL(url);
  wrongRedirect.pathname = "/other";
  await assert.rejects(
    finishFortnoxFlow(config, flow, wrongRedirect, mock.implementation, 1001),
  );
  await assert.rejects(
    finishFortnoxFlow(config, flow, url, mock.implementation, flow.expiresAt),
  );
  assert.equal(mock.requests.length, 0);
  const results = await Promise.allSettled([
    finishFortnoxFlow(config, flow, url, mock.implementation, 1001),
    finishFortnoxFlow(config, flow, url, mock.implementation, 1001),
  ]);
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
  assert.equal(
    mock.requests.filter((r) => r.grant === "authorization_code").length,
    1,
  );
});

test("Fortnox probe derives client-credentials evidence only after exact test-tenant match", async () => {
  const flow = await createFortnoxFlow(config, "service");
  const mock = provider("9000002");
  await assert.rejects(
    finishFortnoxFlow(
      config,
      flow,
      new URL(`${FORTNOX_REDIRECT}?code=synthetic&state=${flow.state}`),
      mock.implementation,
    ),
    (error: unknown) =>
      error instanceof FortnoxProbeError &&
      error.stage === "test_tenant_mismatch",
  );
  assert.equal(mock.requests.length, 2);
  assert.equal(
    mock.requests.some((r) => r.path === "/3/me"),
    false,
  );
  assert.equal(
    mock.requests.some((r) => r.grant === "client_credentials"),
    false,
  );
});

test("Fortnox probe exercises service issuance and user refresh without emitting secrets or identities", async () => {
  for (const mode of ["service", "user"] as const) {
    const mock = provider();
    const flow = await createFortnoxFlow(config, mode);
    const evidence = await finishFortnoxFlow(
      config,
      flow,
      new URL(`${FORTNOX_REDIRECT}?code=synthetic&state=${flow.state}`),
      mock.implementation,
    );
    assert.equal(evidence.tenantMatched, true);
    assert.equal(evidence.identity.sysAdmin, true);
    assert.equal(
      mode === "service"
        ? evidence.clientCredentials?.tenantMatched
        : evidence.refresh?.rotated,
      true,
    );
    const output = JSON.stringify(evidence);
    for (const privateValue of [
      config.clientSecret,
      config.testTenantId,
      "synthetic-access",
      "synthetic-refresh",
      "NEVER EMIT",
      "fixture@example.invalid",
      "SYNTHETIC ONLY",
    ]) {
      assert.equal(output.includes(privateValue), false);
    }
  }
});
