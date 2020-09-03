import path from "path";

// import init from "./setup/init";
// import { getClipsFromGame } from "./services/twitch";
import { createVideoFileListFromDirectory } from "./services/ffmpeg";

const start = async () => {
  // await init();
  // await getClipsFromGame();
  await createVideoFileListFromDirectory(path.resolve(__dirname, "../tmp"));
};

start();
