import axios from "axios";
import moment from "moment";
import fs from "fs";
import path from "path";

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
    const clipDownloadItems = clips
      .map((clip) => getDownloadDataFromClip(clip))
      .filter(Boolean);

    const [clipDownloadItem] = clipDownloadItems;

    // Test, download single clip:
    console.log("Download start...");
    await downloadClip(clipDownloadItem);
    console.log("Download end");
  } catch (error) {
    log.error("getClipsFromGame :: error", error);
  }
};

/**
 * Gets download url info for a twitch clip.
 *
 * @param {Object} clip Twitch clip object
 * @returns {{
 *  url: String
 *  filename: String
 * }}
 */
const getDownloadDataFromClip = (clip) => {
  const { thumbnail_url: thumbnailUrl } = clip ?? {};

  if (!clip || !thumbnailUrl) {
    return null;
  }

  const lastSlash = thumbnailUrl.lastIndexOf("/");
  const previewIndex = thumbnailUrl.indexOf("-preview-");

  if (previewIndex === -1) {
    // Url doesn't contain preview and can't be parsed:
    return null;
  }

  const downloadUrlRaw = thumbnailUrl.slice(0, previewIndex);
  const filenameRaw = thumbnailUrl.slice(lastSlash + 1, previewIndex);

  return {
    url: `${downloadUrlRaw}.mp4`,
    filename: `${filenameRaw}.mp4`,
  };
};

const downloadClip = async ({ url, filename }) => {
  const downlaodPath = path.resolve(__dirname, "../../tmp", filename);
  const fileWriter = fs.createWriteStream(downlaodPath);

  const res = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });

  res.data.pipe(fileWriter);

  return new Promise((resolve, reject) => {
    fileWriter.on("finish", resolve);
    fileWriter.on("error", reject);
  });
};

export { getAuthToken, getClipsFromGame };
