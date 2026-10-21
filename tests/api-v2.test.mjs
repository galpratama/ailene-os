import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runInThisContext } from "node:vm";
import test from "node:test";
import ts from "typescript";

const root = fileURLToPath(new URL("../", import.meta.url));
const origin = "https://api.example";
const user = {
  id: "22222222-2222-4222-8222-222222222222",
  full_name: "Test Member", email: "member@example.com", avatar: null,
  role: "member", status: "active", data_scope: "own", team_id: null,
};
const ok = (data) => ({ success: true, code: 200, status: "OK", data });
const denied = { success: false, code: 403, status: "FORBIDDEN", message: "Access denied", data: null };

// Execute real TS modules with isolated fetch, environment, cookies, and React hooks.
// No requests reach the live API and no real credentials are loaded.
function harness({ token = "session-jwt", respond = () => ok(null), env = {}, mocks = {} } = {}) {
  const requests = [], writes = [], deletions = [], modules = new Map();
  const cookieStore = {
    get: () => token ? { value: token } : undefined,
    set: (...args) => writes.push(args),
    delete: (options) => deletions.push(options),
  };
  const stubs = {
    "server-only": {},
    "next/headers": { cookies: async () => cookieStore },
    react: { cache: (fn) => fn },
    "@tanstack/react-query": { useQuery: (options) => options },
    ...mocks,
  };
  const fetch = async (url, options) => {
    const request = { url, ...options, body: options.body === undefined ? undefined : JSON.parse(options.body) };
    requests.push(request);
    const result = await respond(request);
    return { status: result.code ?? 200, json: async () => result };
  };
  function load(filename) {
    const absolute = path.resolve(root, filename);
    if (modules.has(absolute)) return modules.get(absolute).exports;
    const loaded = { exports: {} };
    modules.set(absolute, loaded);
    const require = (name) => {
      if (Object.hasOwn(stubs, name)) return stubs[name];
      const target = name.startsWith("@/") ? path.resolve(root, name.slice(2))
        : name.startsWith(".") ? path.resolve(path.dirname(absolute), name) : null;
      if (!target) throw new Error(`Unmocked dependency: ${name}`);
      return load(`${target}.ts`);
    };
    const { outputText } = ts.transpileModule(readFileSync(absolute, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
    });
    const execute = runInThisContext(`(function(require, module, exports, fetch, process) {\n${outputText}\n})`, { filename: absolute });
    execute(require, loaded, loaded.exports, fetch, { env: { BASE_URL: "https://legacy.example", API_BASE_URL: origin, CLIENT_SECRET: "test-secret", ...env } });
    return loaded.exports;
  }
  return { load, requests, writes, deletions };
}

test("all Go API versions use API_BASE_URL; explicit service origins still work", async () => {
  const h = harness();
  const { callApi } = h.load("apis/api.ts");
  await callApi("/api/v2/users", { token: "session-jwt", body: { status: "active" } });
  await callApi("/api/v1/meetings");
  await callApi("/api/v2/users", { baseUrl: "https://other.example" });
  assert.deepEqual(h.requests.map((r) => r.url), [origin + "/api/v2/users", origin + "/api/v1/meetings", "https://other.example/api/v2/users"]);
  assert.equal(h.requests[0].cache, "no-store");
  assert.equal(h.requests[0].headers.Authorization, "Bearer session-jwt");
  const custom = harness({ env: { API_BASE_URL: "https://preview.example" } });
  await custom.load("apis/users.ts").listUsers();
  assert.equal(custom.requests[0].url, "https://preview.example/api/v2/users");
  const missing = harness({ env: { API_BASE_URL: undefined } });
  await assert.rejects(missing.load("apis/users.ts").listUsers(), /API_BASE_URL is not configured/);
  await assert.rejects(missing.load("apis/api.ts").callApi("/api/v1/meetings"), /API_BASE_URL is not configured/);
  assert.equal(missing.requests.length, 0);
});

test("sales actions use v2, preserve nested company/contact forms and full pipeline replacement", async () => {
  const h = harness();
  const sales = h.load("lib/actions.ts");
  const company = { name: "Company", lead_source: "inbound", industry_id: null, website_url: null };
  const contact = { full_name: "Client", email: null, primary: false };
  const pipeline = { company_id: 4, sales_owner_id: user.id, stage: "custom_follow_up", estimated_value: 0, expected_close_date: null };
  const calls = [
    ["listCompanies", { page: 2, page_size: 100 }, "/companies"],
    ["getCompanyDetails", 4, "/companies/details"],
    ["createCompany", company, "/companies/create"],
    ["updateCompany", { id: 4, company }, "/companies/update"],
    ["deleteCompany", 4, "/companies/delete"],
    ["createContact", { company_id: 4, contact }, "/contacts/create"],
    ["updateContact", { id: 3, company_id: 4, contact }, "/contacts/update"],
    ["listPipelines", { phase: "sdr", stage: "custom_follow_up", page_size: 100 }, "/pipelines"],
    ["listPipelineWeeks", { phase: "bdr", weeks: 12 }, "/pipelines/weekly"],
    ["getPipelineDetails", 5, "/pipelines/details"],
    ["createPipeline", pipeline, "/pipelines/create"],
    ["updatePipeline", { id: 5, ...pipeline, stage_note: null }, "/pipelines/update"],
    ["deletePipeline", 5, "/pipelines/delete"],
    ["getPipelineHomeSummary", undefined, "/pipelines/home-summary"],
    ["getPipelineAnalytics", undefined, "/pipelines/analytics"],
  ];
  for (const [fn, payload, route] of calls) {
    await sales[fn](payload);
    assert.equal(h.requests.at(-1).url, origin + "/api/v2" + route);
  }
  assert.deepEqual(h.requests[2].body, { company });
  assert.deepEqual(h.requests[5].body, { company_id: 4, contact });
  assert.deepEqual(h.requests[11].body, { id: 5, ...pipeline, stage_note: null });
  assert.ok(h.requests.every((r) => r.headers.Authorization === "Bearer session-jwt" && r.method === "POST"));
  const inbound = { company_name: "Client Company", contact: { full_name: "Client", phone: "08123456789" }, lead_channel: "referral" };
  await h.load("apis/sales.ts").createInboundLead(inbound);
  assert.equal(h.requests.at(-1).url, origin + "/api/v2/pipelines/create-inbound");
  assert.equal(h.requests.at(-1).headers.Authorization, "Bearer test-secret");
  assert.deepEqual(h.requests.at(-1).body, inbound);
});

test("stage catalog returns a bare array; stage management preserves false, ordering, and transfer target", async () => {
  const catalog = [{ code: "on_hold", phase: "bdr", name: "Paused", sort_order: 30, terminal: false, system: false, pipeline_count: 2 }];
  const h = harness({ respond: () => ok(catalog) });
  const sales = h.load("lib/actions.ts");
  assert.deepEqual((await sales.listPipelineStages()).data, catalog);
  const payloads = [
    ["createPipelineStage", { code: "on_hold", phase: "bdr", name: "Paused", terminal: false }, "/create"],
    ["updatePipelineStage", { code: "on_hold", name: "Pending", terminal: false }, "/update"],
    ["reorderPipelineStages", { phase: "bdr", codes: ["on_hold", "closed_won", "closed_lost"] }, "/reorder"],
    ["deletePipelineStage", { code: "on_hold", transfer_to: "closed_lost" }, "/delete"],
  ];
  for (const [fn, payload, route] of payloads) {
    await sales[fn](payload);
    assert.equal(h.requests.at(-1).url, origin + "/api/v2/pipeline-stages" + route);
    assert.deepEqual(h.requests.at(-1).body, payload);
  }
});

test("quotation lifecycle actions use v2, including outcome and draft deletion", async () => {
  const details = { id: 2, status: "approved", margin_pct: null, trainer_cost: null, net_value: 35000000, invoice_amount: 35175879.4, line_items: [], approvals: [] };
  const h = harness({ respond: () => ok(details) });
  const quotations = h.load("lib/actions.ts");
  const pricing = { source_type: "custom", package_type: null, materi: "std", bd_pct: 0, dc_pct: 0, addon_klinik_sesi: 1,
    days: [{ format: "online", sesi: 0.5, peserta: 15, trainer: "certified" }] };
  const calls = [
    ["listQuotations", { pipeline_id: 5, status: "draft" }, "/quotations"],
    ["getQuotationSummary", undefined, "/quotations/summary"],
    ["getQuotationDetails", 2, "/quotations/details"],
    ["createQuotation", { pipeline_id: 5, ...pricing }, "/quotations/create"],
    ["updateQuotation", { id: 2, ...pricing }, "/quotations/update"],
    ["submitQuotation", 2, "/quotations/submit"],
    ["decideQuotation", { id: 2, decision: "needs_revision", reason: "Revise scope" }, "/quotations/decide"],
    ["updateQuotationOutcome", { id: 2, status: "sent" }, "/quotations/update-outcome"],
    ["deleteQuotation", 2, "/quotations/delete"],
  ];
  for (const [fn, payload, route] of calls) {
    assert.deepEqual((await quotations[fn](payload)).data, details);
    assert.equal(h.requests.at(-1).url, origin + "/api/v2" + route);
  }
  assert.deepEqual(h.requests[3].body, { pipeline_id: 5, ...pricing });
  assert.deepEqual(h.requests[4].body, { id: 2, ...pricing });
  assert.deepEqual(h.requests[7].body, { id: 2, status: "sent" });
  assert.deepEqual(h.requests[8].body, { id: 2 });
  assert.ok(h.requests.every((r) => r.headers.Authorization === "Bearer session-jwt"));
});

test("custom and renamed stages drive options, phase assignment, handoff columns, and chart fallback", () => {
  const h = harness();
  const sales = h.load("lib/sales.ts");
  const catalog = [
    { code: "on_hold", phase: "bdr", name: "Waiting for Budget", sort_order: 20 },
    { code: "meeting_booked", phase: "sdr", name: "Discovery Booked", sort_order: 30 },
    { code: "custom_follow_up", phase: "sdr", name: "Follow Up", sort_order: 20 },
    { code: "lead_identified", phase: "sdr", name: "New Lead", sort_order: 10 },
    { code: "closed_won", phase: "bdr", name: "Won", sort_order: 10 },
  ];
  assert.deepEqual(sales.pipelineStageOptions(catalog, "sdr"), [
    { value: "lead_identified", label: "New Lead" }, { value: "custom_follow_up", label: "Follow Up" }, { value: "meeting_booked", label: "Discovery Booked" },
  ]);
  assert.equal(sales.pipelinePhaseOf("custom_follow_up", catalog), "sdr");
  assert.equal(sales.pipelinePhaseOf("on_hold", catalog), "bdr");
  assert.deepEqual(sales.leadsPageStages(catalog, "bdr"), ["meeting_booked", "closed_won", "on_hold"]);
  assert.equal(sales.pipelineStageName("deleted_stage", catalog), "deleted_stage");
  assert.deepEqual(sales.pipelineStageOptions([]), []);
  assert.equal(h.load("lib/stage-chart-colors.ts").stageChartColor("custom_follow_up"), "var(--claude)");
});

test("pipeline picker walks every page in both phases and surfaces failed pages", async () => {
  let fail = false;
  const calls = [];
  const h = harness({ mocks: {
    "@/lib/actions": { listPipelines: async (options) => {
      calls.push(options);
      return fail && options.page === 2 ? denied : ok({ list: [{ id: `${options.phase}-${options.page}` }], metapaging: { total_page: 2 } });
    } },
  } });
  const query = h.load("hooks/useSalesPipelineList.ts").useSalesPipelineList(true);
  assert.deepEqual(await query.queryFn(), [{ id: "sdr-1" }, { id: "sdr-2" }, { id: "bdr-1" }, { id: "bdr-2" }]);
  assert.ok(calls.every((c) => c.page_size === 100));
  assert.equal(calls.length, 4);
  fail = true;
  await assert.rejects(query.queryFn(), /Access denied/);
});

test("Google login stores a shared, secure httpOnly cookie and the action keeps the JWT server-side", async () => {
  const h = harness({ respond: () => ok({ token: "new-jwt", user }) });
  const result = await h.load("lib/actions.ts").loginWithGoogle("google-access-token");
  assert.deepEqual(result, { success: true, message: undefined });
  assert.equal(h.requests[0].url, origin + "/api/v2/auth/login/google");
  assert.equal(h.requests[0].headers.Authorization, "Bearer test-secret");
  assert.deepEqual(h.requests[0].body, { access_token: "google-access-token" });
  assert.deepEqual(h.writes, [["session_token_ailene", "new-jwt", {
    domain: "ailene.id", httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 365 * 86400,
  }]]);
});

test("failed Google login never writes a session cookie", async () => {
  const h = harness({ respond: () => denied });
  assert.equal((await h.load("lib/actions.ts").loginWithGoogle("bad-token")).success, false);
  assert.equal(h.writes.length, 0);
});

test("session check preserves lowercase enums; absent/invalid sessions are unauthenticated", async () => {
  const h = harness({ respond: () => ok({ user }) });
  assert.deepEqual(await h.load("apis/session.ts").getSession(), { sessionToken: "session-jwt", user });
  assert.equal(h.requests[0].url, origin + "/api/v2/auth/check-session");
  assert.equal(h.requests[0].body, undefined);
  const empty = harness({ token: "" });
  assert.deepEqual(await empty.load("apis/session.ts").getSession(), { sessionToken: undefined, user: null });
  assert.equal(empty.requests.length, 0);
  const invalid = harness({ respond: () => denied });
  assert.equal((await invalid.load("apis/session.ts").getSession()).user, null);
});

test("logout clears the shared cookie on success, API rejection, and network failure", async () => {
  for (const respond of [() => ok(null), () => denied, () => { throw new Error("offline"); }]) {
    const h = harness({ respond });
    await h.load("apis/session.ts").logoutUser().catch((error) => assert.equal(error.message, "offline"));
    assert.equal(h.requests[0].url, origin + "/api/v2/auth/logout");
    assert.deepEqual(h.deletions, [{ name: "session_token_ailene", domain: "ailene.id", path: "/" }]);
  }
});

test("user/team operations use v2 and preserve lowercase values, omission, and explicit null", async () => {
  const h = harness({ respond: () => ok(user) });
  const users = h.load("apis/users.ts"), teams = h.load("apis/teams.ts");
  const invite = { full_name: "Invited Member", email: "invite@example.com", role: "member", data_scope: "team", team_id: 1, job_function: "sales" };
  const update = { id: user.id, team_id: null, job_function: null };
  const handover = { from_user_id: user.id, to_user_id: "44444444-4444-4444-8444-444444444444", reason: "Handover" };
  await users.listUsers({ roles: ["administrator"], status: "active", page_size: 100 });
  assert.equal((await users.getUserDetails(user.id)).data.role, "member");
  await users.inviteUser(invite);
  await users.updateUser(update);
  await users.updateUserStatus({ id: user.id, status: "archived" });
  await users.reassignOwnership(handover);
  await teams.listTeams({ page: 2, page_size: 100 });
  await teams.createTeam("Operations");
  assert.deepEqual(h.requests.map((r) => r.url.slice(origin.length)), [
    "/api/v2/users", "/api/v2/users/details", "/api/v2/users/invite", "/api/v2/users/update",
    "/api/v2/users/update/status", "/api/v2/users/update/reassign-ownership", "/api/v2/teams", "/api/v2/teams/create",
  ]);
  assert.deepEqual(h.requests[2].body, invite);
  assert.deepEqual(h.requests[3].body, update);
  assert.deepEqual(h.requests[5].body, handover);
  assert.ok(h.requests.every((r) => r.method === "POST" && r.headers.Authorization === "Bearer session-jwt"));
});

test("tasks use v2 and retain all fields for full replacement, including nullable fields", async () => {
  const summary = { today: "2026-10-21", my_tasks_today: 0, approvals: { total: 0, list: [] }, overdue_tasks: { total: 0, list: [] }, due_today_tasks: { total: 0, list: [] } };
  const h = harness({ respond: (r) => ok(r.url.endsWith("/summary") ? summary : null) });
  const tasks = h.load("apis/tasks.ts");
  const create = { name: "Follow up", status: "to_do", priority: "high", source_meeting_id: 4 };
  const update = { id: 12, name: "Follow up", status: "review", priority: "urgent", summary: null, due_date: null, assignee_id: null };
  await tasks.listTasks({ due_from: "2026-10-01", due_to: "2026-10-31" });
  assert.deepEqual((await tasks.getTaskSummary()).data, summary);
  await tasks.getTaskDetails(12);
  await tasks.createTask(create);
  await tasks.updateTask(update);
  await tasks.deleteTask(12);
  assert.deepEqual(h.requests.map((r) => r.url.slice(origin.length)), ["/api/v2/tasks", "/api/v2/tasks/summary", "/api/v2/tasks/details", "/api/v2/tasks/create", "/api/v2/tasks/update", "/api/v2/tasks/delete"]);
  assert.deepEqual(h.requests[3].body, create);
  assert.deepEqual(h.requests[4].body, update);
  assert.deepEqual(h.requests[5].body, { id: 12 });
});

test("quotation links preserve a valid pipeline ID for pricing", () => {
  const { parsePricingPipelineId, pricingUrlForPipeline } = harness().load("lib/quotation-navigation.ts");
  const url = new URL(pricingUrlForPipeline(42), "https://os.example");
  assert.equal(url.pathname, "/pricing");
  assert.equal(parsePricingPipelineId(url.searchParams.get("pipeline_id")), 42);
  assert.equal(parsePricingPipelineId("2147483647"), 2147483647);
  for (const value of [undefined, null, [], ["42", "43"], "", "0", "-1", "1.5", "1e2", "NaN", "Infinity", "2147483648"]) {
    assert.equal(parsePricingPipelineId(value), null);
  }
});

test("task boards, user pickers, and linked quotations load every filtered page and reject failed pages", async () => {
  for (const [file, hook, method, filters] of [
    ["hooks/useTaskList.ts", "useTaskList", "listTasks", { status: "to_do" }],
    ["hooks/useUserList.ts", "useUserList", "listUsers", "active"],
    ["hooks/useQuotationList.ts", "useQuotationList", "listQuotations", { pipeline_id: 5 }],
  ]) {
    const pages = [];
    let fail = false, query;
    const h = harness({ mocks: {
      "@/lib/actions": { [method]: async (options) => {
        pages.push(options);
        return fail && options.page === 2 ? denied : ok({ list: [{ id: options.page }], metapaging: { total_page: 3 } });
      } },
      "@tanstack/react-query": { useQuery: (options) => { query = options; return {}; } },
    } });
    const fn = h.load(file)[hook];
    if (method === "listUsers") fn(true, filters); else fn(filters, true);
    assert.equal(query.enabled, true);
    assert.deepEqual(await query.queryFn(), [{ id: 1 }, { id: 2 }, { id: 3 }]);
    assert.deepEqual(pages.map((p) => [p.page, p.page_size]), [[1, 100], [2, 100], [3, 100]]);
    if (method === "listQuotations") {
      assert.ok(pages.every((page) => page.pipeline_id === filters.pipeline_id));
      assert.deepEqual(query.queryKey, ["quotations", "list", filters]);
    }
    fail = true;
    await assert.rejects(query.queryFn(), /Access denied/);
  }
});
