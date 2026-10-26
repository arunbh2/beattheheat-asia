import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Legend } from "../../src/components/Controls";
import capitals from "../../src/data/capitals.json";
import type { Capital } from "../../src/lib/contracts";
import { buildProfile } from "../../src/data/profile";

vi.mock("../../src/client/api", async () => {
  const caps = (await import("../../src/data/capitals.json")).default as { capitals: Capital[] };
  return { getProfile: async (id: string) => buildProfile(caps.capitals.find(c => c.id === id)!), getForecast: async () => { throw new Error("offline"); }, getCapitalsWeather: async () => ({ records: [] }) };
});
const { default: Dossier } = await import("../../src/components/Dossier");
afterEach(cleanup);
const KTM = (capitals as { capitals: Capital[] }).capitals.find(c => c.id === "npl-kathmandu")!;
const wrap = (ui: React.ReactNode) => render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>{ui}</QueryClientProvider>);

describe("Legend", () => {
  it("is titled air temperature and says colours are not risk", () => {
    render(<Legend unit="C" metric="air" />);
    expect(screen.getByText("Air temperature (°C)")).toBeTruthy();
    expect(screen.getByText(/not health risk/)).toBeTruthy();
    expect(document.body.textContent).not.toMatch(/danger|risk score/i);
  });
  it("relabels the ticks in °F without changing the bands", () => { render(<Legend unit="F" metric="air" />); expect(screen.getByText("59°F")).toBeTruthy(); expect(screen.getByText("100°F")).toBeTruthy(); });
});

describe("Dossier", () => {
  const props = { capital: KTM, unit: "C" as const, onClose: () => {}, onCompare: () => {}, compared: false, canCompare: true, drawer: false };
  it("says current data is unavailable rather than showing a number", () => {
    wrap(<Dossier {...props} weather={undefined} tab="now" onTab={() => {}} />);
    expect(screen.getAllByText(/Current data unavailable/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Official warning status not integrated/)).toBeTruthy();
    expect(screen.queryByTestId("now-temp")).toBeNull();
  });
  it("shows live values with their source when present", () => {
    const w = { capitalId: KTM.id, temperatureC: 18.4, apparentTemperatureC: 17.1, humidityPct: 71, weatherCode: 2, isDay: true, validAt: "2026-10-26T04:00:00.000Z", fetchedAt: "2026-10-26T04:05:00.000Z", timezone: "Asia/Kathmandu", gridLat: 27.7, gridLon: 85.3, elevationM: 1337, status: "fresh" as const, provenance: {} as never };
    wrap(<Dossier {...props} weather={w} tab="now" onTab={() => {}} />);
    expect(screen.getByTestId("now-temp").textContent).toBe("18°C"); expect(screen.getByTestId("now-apparent").textContent).toBe("17°C");
    expect(screen.getByText(/Modelled current conditions · Open-Meteo/)).toBeTruthy();
  });
  it.each(["preparedness", "solutions", "investment"] as const)("%s shows the honest empty state, never zeros", async tab => {
    wrap(<Dossier {...props} weather={undefined} tab={tab} onTab={() => {}} />);
    expect((await screen.findAllByText(/No verified record in the platform/)).length).toBeGreaterThan(0);
    expect(screen.getByText(/not a finding that none exists/)).toBeTruthy();
    await waitFor(() => expect(document.querySelector("[data-evidence-state]")!.getAttribute("data-evidence-state")).toBe("not_integrated"));
    expect(document.querySelector(".dossier__body")!.textContent).not.toMatch(/\b0\b|score/i);
  });
  it.each(["patterns", "people"] as const)("%s says it is not integrated and names the planned source", async tab => {
    wrap(<Dossier {...props} weather={undefined} tab={tab} onTab={() => {}} />);
    expect(await screen.findByText("Not integrated in this release")).toBeTruthy();
    expect(screen.getAllByRole("link").length).toBeGreaterThan(0);
  });
  it("moves between tabs with the arrow keys", () => {
    const onTab = vi.fn(); wrap(<Dossier {...props} weather={undefined} tab="now" onTab={onTab} />);
    fireEvent.keyDown(screen.getByRole("tab", { name: "Now" }), { key: "ArrowRight" }); expect(onTab).toHaveBeenCalledWith("next");
  });
});
