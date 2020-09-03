import axios from "axios";
import moment from "moment";
import fs from "fs";
import path from "path";
import pMap from "p-map";

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
  downloadPath,
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
      .map((clip) => getDownloadDataFromClip({ clip, downloadPath }))
      .filter(Boolean);

    log.info("getClipsFromGame :: Total clips", clips.length);
    log.info("getClipsFromGame :: Starting downloads...");

    await pMap(clipDownloadItems, downloadClip, { concurrency: 2 });
  } catch (error) {
    log.error("getClipsFromGame :: error", error);
    throw error;
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
const getDownloadDataFromClip = ({ clip, downloadPath }) => {
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
    downloadPath,
  };
};

const downloadClip = async ({ url, filename, downloadPath }) => {
  const downlaodPath = path.resolve(downloadPath, filename);
  const fileWriter = fs.createWriteStream(downlaodPath);

  const res = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });

  res.data.pipe(fileWriter);

  return new Promise((resolve, reject) => {
    fileWriter.on("finish", () => {
      resolve(true);
    });
    fileWriter.on("error", (err) => {
      // Delete the file:
      fs.unlinkSync(downlaodPath);
      log.error("downloadClip :: Error while downloading:", err);
      reject(false);
    });
  });
};

export { getAuthToken, getClipsFromGame };
