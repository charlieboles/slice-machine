import tmp from "tmp";
import AdmZip from "adm-zip";
import axios from "axios";

import fs from "fs";
import path from "path";
import { getOrElseW } from "fp-ts/Either";
import { PackageManager, Dependencies } from "../utils/PackageManager";
import { PackageJsonHelper } from "@slicemachine/core/build/src/utils/PackageJson";
import { Manifest, ManifestHelper } from "@slicemachine/core/build/src/models";
import { Tracker } from "../utils/tracker";

import { spinner, Files } from "@slicemachine/core/build/src/internals";

const downloadFile = async (reqUrl: string): Promise<string> => {
  const res = await axios({
    method: "GET",
    url: reqUrl,
    responseType: "arraybuffer",
  });

  return new Promise((resolve, reject) => {
    if (res.status == 200) {
      const tmpZipFile = tmp.tmpNameSync();
      const zip = new AdmZip(res.data);
      zip.extractAllTo(tmpZipFile);
      resolve(tmpZipFile);
    } else {
      reject();
    }
  });
};

export async function installLib(
  tracker: Tracker | undefined,
  cwd: string,
  libGithubPath: string,
  branch: string | undefined = "main"
): Promise<string[] | undefined> {
  const spin = spinner(
    `Installing the ${libGithubPath} lib in your project...`
  );

  try {
    spin.start();

    const [githubUserName, githubProjectName] = libGithubPath.split("/");
    const source = `https://codeload.github.com/${libGithubPath}/zip/${branch}`;

    const zipFilePath = await downloadFile(source);
    const outputFolder = `${githubProjectName}-${branch}`;
    const projectPath = path.join(zipFilePath, outputFolder);

    const name = `${githubUserName}-${githubProjectName}`;
    const libDestinationFolder = path.join(cwd, name);

    // We should be able to offer the ability to override or not an existing library
    if (fs.existsSync(libDestinationFolder)) {
      spin.succeed(`Lib "${libGithubPath}" was already installed (skipped)`);
      return;
    }

    // We copy all the slices into the the user project minus the src folder
    fs.renameSync(path.join(projectPath, "src"), libDestinationFolder);

    // handle dependencies
    const pkgManager = PackageManager.get(cwd);
    const pkgJson = PackageJsonHelper.fromPath(
      path.join(projectPath, "package.json")
    );
    if (pkgJson instanceof Error) throw pkgJson;

    const dependencies = Dependencies.fromPkgFormat(pkgJson.dependencies);
    if (dependencies) await pkgManager.install(dependencies);

    // generate meta file
    Files.write(path.join(libDestinationFolder, "meta.json"), {
      name: pkgJson.name,
    });

    // retrieve all slices lib paths
    const manifest = Files.readEntity<Error | Manifest>(
      path.join(projectPath, "sm.json"),
      (payload: unknown) => {
        return getOrElseW(
          () => new Error(`Unable to parse sm.json from lib ${libGithubPath}`)
        )(Manifest.decode(payload));
      }
    );
    if (manifest instanceof Error) throw manifest;

    const localLibs = ManifestHelper.localLibraries(manifest).map(
      ({ path }) => {
        return `~/${name}/${path.replace("src/", "")}`;
      }
    );

    spin.succeed(`Slice library "${libGithubPath}" was installed successfully`);

    tracker?.Track.downloadLibrary(libGithubPath);
    return localLibs;
  } catch {
    spin.fail(`Error installing ${libGithubPath} lib!`);
    process.exit(-1);
  }
}
