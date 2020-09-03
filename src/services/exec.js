import { exec } from "child_process";
/**
 * Executes a shell command and return it as a Promise.
 * @param cmd {string}
 * @return {Promise<string>}
 */
const execCmd = (cmd) => {
  return new Promise((resolve, reject) => {
    const process = exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout ? stdout : stderr);
      }
    });

    process.stdout.on("data", function (data) {
      console.log(data);
    });
    process.stdout.on("error", function (data) {
      console.log(data);
    });
  });
};

export default execCmd;
