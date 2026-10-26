import { render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cv } from "@/content/cv";
import { EducationList, ExperienceList } from "@/components/experience-list";

describe("ExperienceList (LinkedIn-style timeline)", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("groups roles under their company with location", () => {
    render(<ExperienceList experience={cv.experience} />);
    const company = screen.getByRole("article", { name: "Golden Owl Solutions" });
    expect(company).toHaveTextContent("Ho Chi Minh City");
    const roles = within(company).getAllByRole("listitem");
    expect(roles.map((li) => within(li).getByRole("heading", { level: 4 }).textContent)).toEqual([
      "Software Engineer",
      "Software Engineer Intern",
    ]);
  });

  it("shows employment type, LinkedIn dates and durations", () => {
    vi.useFakeTimers({ now: new Date(2026, 9, 26) }); // Oct 2026
    render(<ExperienceList experience={cv.experience} />);
    const [current, intern] = screen.getAllByRole("listitem");
    expect(current).toHaveTextContent("Full-time");
    expect(current).toHaveTextContent("Sep 2025 – Present · 1 yr 2 mos");
    expect(intern).toHaveTextContent("Internship");
    expect(intern).toHaveTextContent("Mar 2025 – Aug 2025 · 6 mos");
    // Company total: Mar 2025 → Oct 2026
    expect(screen.getByRole("article")).toHaveTextContent("Ho Chi Minh City · 1 yr 8 mos");
  });

  it("puts every role's bullets behind a details toggle", () => {
    render(<ExperienceList experience={cv.experience} />);
    expect(screen.getAllByRole("button", { name: /show details/i })).toHaveLength(2);
  });
});

describe("EducationList", () => {
  const [school] = cv.education;

  it("shows the school logo when one is set", () => {
    const { container } = render(<EducationList education={[school]} />);
    const img = container.querySelector("img");
    expect(school.logo).toBe("/logos/sgu.png");
    expect(img?.getAttribute("src")).toContain(encodeURIComponent("/logos/sgu.png"));
    expect(img).toHaveAttribute("alt", "");
    expect(screen.queryByText("SG")).not.toBeInTheDocument();
  });

  it("falls back to a monogram without a logo", () => {
    const { container } = render(<EducationList education={[{ ...school, logo: undefined }]} />);
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText("SG")).toBeInTheDocument();
  });

  it("lists degree, GPA, period and location", () => {
    render(<EducationList education={[school]} />);
    const item = screen.getByRole("heading", { name: school.school }).closest("article");
    expect(item).toHaveTextContent(`${school.degree} · GPA ${school.gpa}`);
    expect(item).toHaveTextContent("2021 - 2025 · Ho Chi Minh City");
  });
});
