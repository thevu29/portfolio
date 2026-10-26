import { describe, expect, it } from "vitest";
import { isActive, NAV_ITEMS, navTransitionTypes } from "@/lib/nav";

describe("isActive", () => {
  it("matches home only on exactly /", () => {
    expect(isActive("/", "/")).toBe(true);
    expect(isActive("/projects", "/")).toBe(false);
  });

  it("matches a section and its nested routes", () => {
    expect(isActive("/projects", "/projects")).toBe(true);
    expect(isActive("/projects/ecommerce", "/projects")).toBe(true);
  });

  it("does not match routes that only share a prefix", () => {
    expect(isActive("/cvs", "/cv")).toBe(false);
  });
});

describe("NAV_ITEMS", () => {
  it("lists the four pages in order", () => {
    expect(NAV_ITEMS.map((i) => i.href)).toEqual(["/", "/projects", "/about", "/cv"]);
  });
});

describe("navTransitionTypes (page order Home → Projects → About → CV)", () => {
  it("goes forward to a later page, one slide whatever the distance", () => {
    expect(navTransitionTypes("/", "/projects")).toEqual(["nav-forward"]);
    expect(navTransitionTypes("/", "/about")).toEqual(["nav-forward"]);
    expect(navTransitionTypes("/projects", "/cv")).toEqual(["nav-forward"]);
  });

  it("goes back to an earlier page", () => {
    expect(navTransitionTypes("/projects", "/")).toEqual(["nav-back"]);
    expect(navTransitionTypes("/cv", "/")).toEqual(["nav-back"]);
    expect(navTransitionTypes("/about", "/projects")).toEqual(["nav-back"]);
  });

  it("ignores the hash and query of the target", () => {
    expect(navTransitionTypes("/", "/projects#ecommerce")).toEqual(["nav-forward"]);
    expect(navTransitionTypes("/cv", "/?ref=cv")).toEqual(["nav-back"]);
  });

  it("does not slide within the same page", () => {
    expect(navTransitionTypes("/projects", "/projects")).toEqual([]);
    expect(navTransitionTypes("/projects", "/projects#wms")).toEqual([]);
  });

  it("does not slide to or from pages outside the order", () => {
    expect(navTransitionTypes("/does-not-exist", "/")).toEqual([]);
    expect(navTransitionTypes("/", "/CV_NguyenTheVu.pdf")).toEqual([]);
    expect(navTransitionTypes("/", "https://github.com/x")).toEqual([]);
  });
});
