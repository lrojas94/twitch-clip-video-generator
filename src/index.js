import path from "path";
import moment from "moment";
import fs from "fs";

import init from "./setup/init";
import { getClipsFromGame } from "./services/twitch";
import { createVideoFileListFromDirectory } from "./services/ffmpeg";

const start = async () => {
  const downloadPathName = moment().format();
  const downloadPath = path.resolve(__dirname, "../tmp", downloadPathName);
  fs.mkdirSync(downloadPath);

  await init();

  await getClipsFromGame({ downloadPath });
  await createVideoFileListFromDirectory(downloadPath);
};

start();
