import { Disk } from "flydrive";
import { FSDriver } from "flydrive/drivers/fs";
import { S3Driver } from "flydrive/drivers/s3";

import { env } from "../env";
import { getBaseUrl } from "./utils";

const drivers = {
  fs: () =>
    new FSDriver({
      location: "./static/uploads",
      visibility: "public",
      urlBuilder: {
        async generateURL(key: string, filePath: string) {
          return `${getBaseUrl()}/static/uploads/${key}`;
        },
        async generateSignedURL(key: string, filePath: string) {
          return `${getBaseUrl()}/static/uploads/${key}`;
        },
      },
    }),
  r2: () =>
    new S3Driver({
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY as string,
        secretAccessKey: env.R2_ACCESS_SECRET as string,
      },

      endpoint: env.R2_ENDPOINT,
      region: "auto",
      supportsACL: false,

      bucket: "pos",
      visibility: "private",
      urlBuilder: {
        async generateURL(key) {
          return `${env.R2_SUBDOMAIN}/${key}`;
        },
      },
    }),
};

const driverToUse = drivers[env.DRIVE_DISK];

export const disk = new Disk(driverToUse());
