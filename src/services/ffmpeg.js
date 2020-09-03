import { promises } from "fs";
import path from "path";
import pMap from "p-map";

import getLogger from "../util/logger";
import execCmd from "./exec";

const { readdir, unlink, rename } = promises;
const log = getLogger("ffmpeg");

const RES_HD = "1920x1080";

const upscaleVideoToHD = async (videoPath) => {
  try {
    log.info(`upscaleVideoToHD :: parsing video ${videoPath}`);
    log.info("upscaleVideoToHD :: Checking for resolution...");

    const res = (
      await execCmd(
        `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 ${videoPath}`
      )
    ).split("\n")[0];

    if (res !== RES_HD) {
      log.info(
        "upscaleVideoToHD :: Resolution is different, converting to 1080p..."
      );

      const hdVideoPath = `${videoPath.split(".mp4")[0]}_hd.mp4`;

      await execCmd(
        `ffmpeg -y -i ${videoPath} -vf scale=${RES_HD}:flags=lanczos ${hdVideoPath}`
      );

      await unlink(videoPath);
      await rename(hdVideoPath, videoPath);
    }

    return videoPath;
  } catch (error) {
    return null;
  }
};

const createVideoFileListFromDirectory = async (dir) => {
  try {
    const files = await readdir(dir);
    const videoFiles = files
      .filter((fileName) => /.*(jpg|png|gif|mp4)/.test(fileName))
      .map((fileName) => path.resolve(dir, fileName));

    log.info(
      "createVideoFileListFromDirectory :: Video upscalings will start now..."
    );

    const upscaledVideoFileNames = (
      await pMap(videoFiles, upscaleVideoToHD, {
        concurrency: 2,
      })
    ).filter((filename) => !!filename);

    log.info(
      "createVideoFileListFromDirectory :: videos have been upscaled. Starting to merge them..."
    );

    const mergeCmd = `ffmpeg -y ${upscaledVideoFileNames
      .map((filename) => `-i ${filename}`)
      .join(" ")} -filter_complex "${upscaledVideoFileNames
      .map((_, index) => `[${index}:v] [${index}:a]`)
      .join(" ")} concat=n=${
      upscaledVideoFileNames.length
    }:v=1:a=1 [v] [a]" -map "[v]" -map "[a]" ${path.resolve(
      __dirname,
      "../../tmp",
      "out.mp4"
    )}`;

    execCmd(mergeCmd);

    log.info("createVideoFileListFromDirectory :: Videos have been merged");

    return;
  } catch (error) {
    log.error("createFilesFromVideos :: Error:", error);
  }
};

export { createVideoFileListFromDirectory };
