import axios from "axios";

import getConfig from "../util/config";
const config = getConfig();

const getAuthToken = async () => {
  const { data } = await axios.post(
    "https://id.twitch.tv/oauth2/token",
    {},
    {
      params: {
        client_id: config.TWITCH_CLIENT_ID,
        client_secret: config.TWITCH_SECRET,
        grant_type: "client_credentials",
      },
    }
  );

  return data;
};

const getClipsFromGame = async ({ gameId = "497385" } = {}) => {
  const res = await axios.get("https://api.twitch.tv/helix/clips", {
    params: {
      game_id: gameId,
    },
  });

  console.log(res);
};

export { getAuthToken, getClipsFromGame };
