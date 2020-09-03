import { promises } from "fs";
import path from "path";

import getLogger from "../util/logger";
import execCmd from "./exec";

const { readdir, unlink, rename } = promises;
const log = getLogger("ffmpeg");

const RES_HD = "1920x1080";

const createVideoFileListFromDirectory = async (dir) => {
  try {
    const files = await readdir(dir);
    const videoFiles = files
      .filter((fileName) => /.*(jpg|png|gif|mp4)/.test(fileName))
      .map((fileName) => path.resolve(dir, fileName));
    const [filename] = videoFiles;

    log.info("createVideoFileListFromDirectory :: Checking for resolution...");
    const res = await execCmd(
      `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 ${filename}`
    );

    if (res !== RES_HD) {
      log.info(
        "createVideoFileListFromDirectory :: Resolution is different, converting to 1080p..."
      );

      const hdFileName = `${filename.split(".mp4")[0]}_hd.mp4`;

      await execCmd(
        `ffmpeg -y -i ${filename} -vf scale=${RES_HD}:flags=lanczos ${hdFileName}`
      );

      await unlink(filename);
      await rename(hdFileName, filename);
    }

    return;
  } catch (error) {
    log.error("createFilesFromVideos :: Error:", error);
  }
};

export { createVideoFileListFromDirectory };
