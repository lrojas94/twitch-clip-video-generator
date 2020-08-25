import winston from "winston";

const getLogger = (name) => {
  const log = winston.createLogger({
    level: "info",
    format: winston.format.json(),
    defaultMeta: { name },
    transports: [
      new winston.transports.File({ filename: "error.log", level: "error" }),
      new winston.transports.File({ filename: "combined.log" }),
    ],
  });

  log.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );

  return log;
};

export default getLogger;
