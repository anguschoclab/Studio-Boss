import {describe, it, expect, vi} from "vitest";
import {render, screen, fireEvent} from "@testing-library/react";
import {Tabs, TabsList, TabsTrigger, TabsContent} from "@/components/ui/tabs";

describe("tabs ref warning repro", () => {
  it("renders and switches tabs without ref warnings", () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
        <TabsContent value="a" forceMount>content-a</TabsContent>
        <TabsContent value="b" forceMount>content-b</TabsContent>
      </Tabs>
    );
    fireEvent.click(screen.getByText("B"));
    const refWarnings = errSpy.mock.calls.filter((c) =>
      String(c[0]).includes("ref") || String(c[0]).includes("findDOMNode")
    );
    expect(refWarnings).toEqual([]);
    errSpy.mockRestore();
  });
});
