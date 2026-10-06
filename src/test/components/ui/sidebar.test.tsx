import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act } from "@testing-library/react";
import React from "react";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";

vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => false,
}));

vi.mock("@/components/ui/sheet", () => ({
  Sheet: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/ui/tooltip", () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

vi.mock("@/components/ui/input", () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));

vi.mock("@/components/ui/separator", () => ({
  Separator: () => <hr />,
}));

vi.mock("@/components/ui/skeleton", () => ({
  Skeleton: (props: React.HTMLAttributes<HTMLDivElement>) => <div {...props} />,
}));

vi.mock("@radix-ui/react-slot", () => ({
  Slot: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("lucide-react", () => ({
  PanelLeft: () => <div data-testid="icon" />,
}));

vi.mock("class-variance-authority", () => ({
  cva: () => () => "",
}));

function SidebarTestConsumer() {
  const { setOpen } = useSidebar();
  return (
    <button data-testid="trigger" onClick={() => setOpen(true)}>
      Set Open
    </button>
  );
}

describe("SidebarProvider cookie security", () => {
  let cookieSetter: ReturnType<typeof vi.spyOn>;
  let lastCookieValue: string;

  beforeEach(() => {
    vi.clearAllMocks();
    lastCookieValue = "";
    cookieSetter = vi.spyOn(document, "cookie", "set").mockImplementation((value: string) => {
      lastCookieValue = value;
      return value;
    });
  });

  afterEach(() => {
    cookieSetter.mockRestore();
  });

  it("sets cookie with Secure flag when sidebar state changes", () => {
    render(
      <SidebarProvider>
        <SidebarTestConsumer />
      </SidebarProvider>
    );

    const trigger = document.querySelector('[data-testid="trigger"]') as HTMLButtonElement;
    act(() => {
      trigger.click();
    });

    expect(lastCookieValue).toContain("Secure");
  });

  it("sets cookie with SameSite=Lax flag", () => {
    render(
      <SidebarProvider>
        <SidebarTestConsumer />
      </SidebarProvider>
    );

    const trigger = document.querySelector('[data-testid="trigger"]') as HTMLButtonElement;
    act(() => {
      trigger.click();
    });

    expect(lastCookieValue).toContain("SameSite=Lax");
  });

  it("sets cookie with correct name and value", () => {
    render(
      <SidebarProvider>
        <SidebarTestConsumer />
      </SidebarProvider>
    );

    const trigger = document.querySelector('[data-testid="trigger"]') as HTMLButtonElement;
    act(() => {
      trigger.click();
    });

    expect(lastCookieValue).toContain("sidebar:state=true");
  });

  it("sets cookie with max-age", () => {
    render(
      <SidebarProvider>
        <SidebarTestConsumer />
      </SidebarProvider>
    );

    const trigger = document.querySelector('[data-testid="trigger"]') as HTMLButtonElement;
    act(() => {
      trigger.click();
    });

    expect(lastCookieValue).toContain("max-age=");
  });
});
