import path from 'path'
import util from 'util'
import ora from 'ora'
import { exec } from 'child_process'
import { Utils, FileSystem } from 'slicemachine-core'
import { writeCheck, writeWarning } from 'slicemachine-core/utils'

const execPromise = util.promisify(exec)

export async function installSm(cwd: string): Promise<void> {
  const yarnLock = Utils.Files.exists(FileSystem.YarnLockPath(cwd));
  const command = yarnLock ? 'yarn add -D' : 'npm install --save-dev';

  const spinner = ora('Downloading Prismic Visual Builder');
  spinner.start();

  const { stderr } = await execPromise(`${command} ${Utils.CONSTS.SM_PACKAGE_NAME}`);

  const pathToPkg = path.join(FileSystem.PackagePaths(cwd).value(), Utils.CONSTS.SM_PACKAGE_NAME);
  const isPackageInstalled = Utils.Files.exists(pathToPkg);

  if (isPackageInstalled || !stderr.length) {
    spinner.succeed();
    writeCheck("The Prismic Visual Builder was installed successfully")
    return
  }

  spinner.fail();
  writeWarning(`could not install ${Utils.CONSTS.SM_PACKAGE_NAME}. Please do it manually!`);
}