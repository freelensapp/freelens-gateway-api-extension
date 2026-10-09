// @vitest-environment jsdom

import { Common } from "@freelensapp/extensions";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ErrorPage, withErrorPage } from "./error-page";

import type { Renderer } from "@freelensapp/extensions";

// Only `name` is read by `ErrorPage`.
const extension = { name: "gateway-api-extension" } as Renderer.LensExtension;

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("ErrorPage", () => {
  it("renders the error message and logs the error", () => {
    render(<ErrorPage error={new Error("boom")} extension={extension} />);

    expect(screen.getByText("Error: boom")).toBeDefined();
    expect(Common.logger.error).toHaveBeenCalledWith("[gateway-api-extension]: Error: boom");
  });

  it("renders children and does not log when there is no error", () => {
    render(
      <ErrorPage extension={extension}>
        <span>child content</span>
      </ErrorPage>,
    );

    expect(screen.getByText("child content")).toBeDefined();
    expect(Common.logger.error).not.toHaveBeenCalled();
  });

  describe("withErrorPage", () => {
    it("renders the wrapped component when it does not throw", () => {
      render(withErrorPage({ extension }, () => <span>all good</span>));

      expect(screen.getByText("all good")).toBeDefined();
      expect(Common.logger.error).not.toHaveBeenCalled();
    });

    it("renders an ErrorPage when the wrapped component throws", () => {
      render(
        withErrorPage({ extension }, () => {
          throw new Error("kaboom");
        }),
      );

      expect(screen.getByText("Error: kaboom")).toBeDefined();
      expect(Common.logger.error).toHaveBeenCalledWith("[gateway-api-extension]: Error: kaboom");
    });
  });
});
