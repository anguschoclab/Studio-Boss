import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { readFileSync } from "fs";
import { join } from "path";
import React from "react";

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@/components/ui/breadcrumb";
import { Calendar } from "@/components/ui/calendar";
import { InputOTPSeparator } from "@/components/ui/input-otp";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Menubar,
  MenubarContent,
  MenubarMenu,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";

// Decorative icons inside primitives and composed UI must carry
// aria-hidden="true" so screen readers don't announce empty glyph names.
// NOTE: checkbox/radio/menu indicator icons already conform on main —
// those assertions are regression locks. Calendar, input-otp separator,
// resizable handle, and breadcrumb icons are the new coverage targets.
describe("Decorative icons — aria-hidden coverage", () => {
  it("Breadcrumb separator chevron AND ellipsis icon are aria-hidden", () => {
    const { container } = render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbEllipsis />
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBe(2);
    svgs.forEach((svg) => expect(svg).toHaveAttribute("aria-hidden", "true"));
  });

  it("Calendar navigation icons are aria-hidden", () => {
    const { container } = render(<Calendar />);
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThanOrEqual(2);
    svgs.forEach((svg) => expect(svg).toHaveAttribute("aria-hidden", "true"));
  });

  it("InputOTPSeparator dot icon is aria-hidden", () => {
    const { container } = render(<InputOTPSeparator />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("ResizableHandle grip icon is aria-hidden", () => {
    const { container } = render(
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel />
        <ResizableHandle withHandle />
        <ResizablePanel />
      </ResizablePanelGroup>
    );
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("Checkbox indicator icon is aria-hidden", () => {
    const { container } = render(<Checkbox defaultChecked />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("RadioGroup indicator icon is aria-hidden", () => {
    const { container } = render(
      <RadioGroup defaultValue="a">
        <RadioGroupItem value="a" aria-label="Option A" />
      </RadioGroup>
    );
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("DropdownMenu sub-trigger chevron and item indicators are aria-hidden", () => {
    const { baseElement } = render(
      <DropdownMenu open>
        <DropdownMenuContent>
          <DropdownMenuSub open>
            <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
            <DropdownMenuSubContent />
          </DropdownMenuSub>
          <DropdownMenuCheckboxItem checked>Flag</DropdownMenuCheckboxItem>
          <DropdownMenuRadioGroup value="a">
            <DropdownMenuRadioItem value="a">Choice</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    const svgs = baseElement.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThanOrEqual(3);
    svgs.forEach((svg) => expect(svg).toHaveAttribute("aria-hidden", "true"));
  });

  it("ContextMenu item icons carry aria-hidden in source (jsdom cannot position Radix contextmenu virtual elements)", () => {
    // The live-render test is infeasible: Radix ContextMenu positions its
    // content via a virtual element derived from a real contextmenu event,
    // which jsdom cannot satisfy (floating-ui throws on undefined DOMRect).
    // The DropdownMenu test above exercises the identical icon pattern at
    // runtime; this source assertion locks the three context-menu sites.
    const source = readFileSync(
      join(__dirname, "../../../components/ui/context-menu.tsx"),
      "utf-8"
    );
    const iconLines = source
      .split("\n")
      .filter((l) => /<(ChevronRight|Check|Circle)\b/.test(l));
    expect(iconLines.length).toBeGreaterThanOrEqual(3);
    iconLines.forEach((l) => expect(l).toContain('aria-hidden="true"'));
  });

  it("Menubar sub-trigger chevron and item indicators are aria-hidden", () => {
    const { baseElement } = render(
      <Menubar defaultValue="file">
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent forceMount>
            <MenubarSub open>
              <MenubarSubTrigger>More</MenubarSubTrigger>
              <MenubarSubContent />
            </MenubarSub>
            <MenubarCheckboxItem checked>Flag</MenubarCheckboxItem>
            <MenubarRadioGroup value="a">
              <MenubarRadioItem value="a">Choice</MenubarRadioItem>
            </MenubarRadioGroup>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    );
    const svgs = baseElement.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThanOrEqual(3);
    svgs.forEach((svg) => expect(svg).toHaveAttribute("aria-hidden", "true"));
  });
});
