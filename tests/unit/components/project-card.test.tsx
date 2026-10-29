import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { cv } from "@/content/cv";
import { ProjectCard, ProjectLinkCard, projectAnchor } from "@/components/project-card";

// NavLink reads the current route; the home page is where these cards live.
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn() }),
}));

const project = cv.projects[1];

describe("ProjectCard (projects page)", () => {
  it("is an anchor target with title, period, role and description", () => {
    render(<ProjectCard project={project} />);
    const card = screen.getByRole("article", { name: /Insurance & Real Estate Platforms/ });
    expect(card).toHaveAttribute("id", project.slug);
    expect(within(card).getByRole("heading", { level: 2 })).toHaveTextContent(
      "Insurance & Real Estate Platforms",
    );
    expect(card).toHaveTextContent("03/2026 - 09/2026");
    expect(card).toHaveTextContent(project.role);
    expect(card).toHaveTextContent(project.description);
  });

  it("shows every bullet without a toggle", () => {
    render(<ProjectCard project={project} />);
    for (const bullet of project.bullets) expect(screen.getByText(bullet)).toBeVisible();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders every tech chip as text (no logos)", () => {
    render(<ProjectCard project={project} />);
    const chips = screen.getByRole("list", {
      name: "Insurance & Real Estate Platforms tech stack",
    });
    expect(
      within(chips)
        .getAllByRole("listitem")
        .map((li) => li.textContent),
    ).toEqual(project.stack);
    expect(chips.querySelector("svg, img")).toBeNull();
  });
});

describe("ProjectLinkCard (home page)", () => {
  it("links the whole card to the project's anchor on /projects", () => {
    render(<ProjectLinkCard project={project} />);
    const link = screen.getByRole("link", { name: /Insurance & Real Estate Platforms/ });
    expect(link).toHaveAttribute("href", "/projects#insurance-real-estate");
    expect(within(link).getByRole("heading", { level: 3 })).toHaveTextContent(
      "Insurance & Real Estate Platforms",
    );
  });

  it("names the link by its title and describes it with the summary", () => {
    render(<ProjectLinkCard project={project} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAccessibleName("Insurance & Real Estate Platforms");
    expect(link).toHaveAccessibleDescription(project.description);
  });

  it("hides details on the summary card", () => {
    render(<ProjectLinkCard project={project} />);
    expect(screen.queryByText(project.bullets[0])).not.toBeInTheDocument();
  });
});

describe("projectAnchor", () => {
  it("builds /projects#slug", () => {
    expect(projectAnchor("ecommerce")).toBe("/projects#ecommerce");
  });
});
