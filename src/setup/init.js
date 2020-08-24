import axios from "axios";
import { getAuthToken } from "../services/twitch";
import getConfig from "../util/config";

const init = async () => {
  const { access_token: accessToken } = await getAuthToken();
  const config = getConfig();

  console.log(accessToken);

  axios.defaults.headers.common["Client-ID"] = config.TWITCH_CLIENT_ID;
  axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
};

export default init;
