import axios from "axios";
import moment from "moment";

import getConfig from "../util/config";
import getLogger from "../util/logger";

const config = getConfig();
const log = getLogger("Twitch.service");

const getAuthToken = async () => {
  log.info("getAuthToken :: Getting token...");

  try {
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

    log.info("getAuthToken :: Gotten token response", data);
    return data;
  } catch (error) {
    log.error("getAuthToken :: error: ", error);
    throw error;
  }
};

const getClipsFromGame = async ({
  gameId = "497385",
  startDate = moment().startOf("day").format(),
  endDate = moment().endOf("day").format(),
} = {}) => {
  try {
    const params = {
      game_id: gameId,
      started_at: startDate,
      ended_at: endDate,
    };

    log.info("getClipsFromGame :: getting clips with params", params);

    const { data } = await axios.get("https://api.twitch.tv/helix/clips", {
      params,
    });

    const { data: clips } = data;
    const downloadUrls = clips
      .map((clip) => getDownloadUrlFromClip(clip))
      .filter(Boolean);

    console.log(downloadUrls);
  } catch (error) {
    log.error("getClipsFromGame :: error", error);
  }
};

const getDownloadUrlFromClip = (clip) => {
  const { thumbnail_url: thumbnailUrl } = clip ?? {};

  if (!clip || !thumbnailUrl) {
    return null;
  }

  const previewIndex = thumbnailUrl.indexOf("-preview-");

  if (previewIndex === -1) {
    // Url doesn't contain preview and can't be parsed:
    return null;
  }

  const downloadUrl = thumbnailUrl.slice(0, previewIndex);

  return `${downloadUrl}.mp4`;
};

export { getAuthToken, getClipsFromGame };
