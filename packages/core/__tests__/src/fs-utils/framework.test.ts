import * as fs from "fs";
import { mocked } from "ts-jest/utils";
import { describe, expect, test, jest, afterEach } from "@jest/globals";

import { Frameworks } from "../../../src/models";
import { isValidFramework } from "../../../src/utils";
import { detectFramework } from "../../../src/fs-utils";

jest.mock("fs");

describe("framework.detectFramework", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test("it defaults to vanillajs when no framework is found in the package.json", () => {
    const mockedFs = mocked(fs, true);
    mockedFs.lstatSync.mockReturnValue({ dev: 1 } as fs.Stats);
    mockedFs.readFileSync.mockReturnValue(JSON.stringify({ dependencies: {} }));

    const result = detectFramework(__dirname, Object.values(Frameworks));

    expect(mockedFs.lstatSync).toHaveBeenCalled();
    expect(result).toEqual(Frameworks.vanillajs);
  });

  // poor mans property based testing
  const valuesToCheck: string[] = [...Object.values(Frameworks), "", "foo"];

  test("gatsby", () => {
    const mockedFs = mocked(fs, true);
    mockedFs.lstatSync.mockReturnValue({ dev: 1 } as fs.Stats);

    mockedFs.readFileSync.mockReturnValue(
      JSON.stringify({
        dependencies: {
          [Frameworks.gatsby]: "beta",
          [Frameworks.react]: "beta",
        },
      })
    );

    const result = detectFramework(__dirname, Object.values(Frameworks));
    expect(result).toEqual(Frameworks.gatsby);
  });
  valuesToCheck.forEach((value) => {
    test("it will return a support framework when a support framework is found in the package.json", () => {
      const mockedFs = mocked(fs, true);
      mockedFs.lstatSync.mockReturnValue({ dev: 1 } as fs.Stats);

      mockedFs.readFileSync.mockReturnValue(
        JSON.stringify({
          dependencies: {
            [value]: "beta",
          },
        })
      );

      const fallback =
        value === Frameworks.gatsby ? Frameworks.gatsby : Frameworks.vanillajs;

      const wanted = isValidFramework(value as Frameworks) ? value : fallback;

      const result = detectFramework(__dirname, Object.values(Frameworks));
      expect(mockedFs.lstatSync).toHaveBeenCalled();
      expect(result).toEqual(wanted);
    });
  });

  test("it will throw an error when no package.json is found", () => {
    const wanted =
      "[api/env]: Unrecoverable error. Could not find package.json. Exiting..";
    const mockedFs = mocked(fs, true);
    mockedFs.lstatSync.mockReturnValue(undefined);

    const spy = jest
      .spyOn(console, "error")
      .mockImplementationOnce(() => undefined);
    expect(() => detectFramework(__dirname, Object.values(Frameworks))).toThrow(
      wanted
    );
    expect(spy).toHaveBeenCalledWith(wanted);
  });
});
