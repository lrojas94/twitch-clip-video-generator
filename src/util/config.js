import dotenv from "dotenv";

/**
 * Returns base config object.
 *
 * @returns {{
 *  TWITCH_CLIENT_ID: string,
 *  TWITCH_SECRET: string,
 * }}
 */
const getConfig = () => {
  return {
    ...(dotenv.config().parsed ?? {}),
  };
};

export default getConfig;
