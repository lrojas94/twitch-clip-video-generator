import axios from "axios";

import { getAuthToken } from "../services/twitch";
import getConfig from "../util/config";
import getLogger from "../util/logger";

const log = getLogger("init");

const init = async () => {
  log.info("init :: Starting...");

  try {
    const { access_token: accessToken } = await getAuthToken();
    const config = getConfig();

    axios.defaults.headers.common["Client-ID"] = config.TWITCH_CLIENT_ID;
    axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

    log.info("init :: App started properly...");
  } catch (error) {
    log.info("init :: error found", error);
    throw error;
  }
};

export default init;
