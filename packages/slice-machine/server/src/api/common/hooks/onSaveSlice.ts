import path from "path";
import { Library } from "@lib/models/common/Library";
import Files from "@lib/utils/files";
import { findIndexFile } from "@lib/utils/lib";
import Environment from "@lib/models/common/Environment";
import { listComponentsByLibrary } from "@lib/queries/listComponents";
import { Framework } from "@lib/models/common/Framework";

const createIndexFile = (lib: Library) => {
  let f = `// This file is generated by Prismic local builder. Update with care!\n\n`;

  for (const c of lib.components) {
    f += `export { default as ${c.infos.sliceName} } from './${c.infos.sliceName}'\n`;
  }
  return f;
};

const createIndexFileForSvelte = (lib: Library) => {
  let f = `// This file is generated by Prismic local builder. Update with care!\n\n`;
  f += "const Slices = {}\n";
  f += "export default Slices\n\n";

  for (const c of lib.components) {
    f += `import ${c.infos.sliceName} from './${c.infos.sliceName}/index.svelte'\n`;
    f += `Slices.${c.infos.sliceName} = ${c.infos.sliceName}\n`;
  }
  return f;
};

const createIndexFileForFrameWork = (env: Environment, lib: Library) => {
  if (env.framework === Framework.svelte) return createIndexFileForSvelte(lib);
  return createIndexFile(lib);
};

export default async function onSaveSlice(env: Environment): Promise<void> {
  const libraries = await listComponentsByLibrary(env);
  const localLibs = libraries.filter((e) => e.isLocal);

  for (const lib of localLibs) {
    if (lib.components.length) {
      const { pathToSlice: relativePathToLib } = lib.components[0];
      const file = createIndexFileForFrameWork(env, lib);

      const pathToLib = path.join(env.cwd, relativePathToLib);

      const indexFilePath =
        findIndexFile(pathToLib) || path.join(pathToLib, "index.js");
      Files.write(indexFilePath, file);
    }
  }
}
