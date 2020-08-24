import init from "./setup/init";
import { getClipsFromGame } from "./services/twitch";

const start = async () => {
  await init();
  await getClipsFromGame();
};

start();
