import { Disk } from "flydrive";
import { FSDriver } from "flydrive/drivers/fs";
import { S3Driver } from "flydrive/drivers/s3";

import { serverEnvs } from "@/env/server";
import { getBaseUrl } from "@/lib/utils";

const drivers = {
  fs: () =>
    new FSDriver({
      location: "./public/uploads",
      visibility: "public",
      urlBuilder: {
        async generateURL(key: string, filePath: string) {
          return `${getBaseUrl()}/uploads/${key}`;
        },
        async generateSignedURL(key: string, filePath: string) {
          return `${getBaseUrl()}/uploads/${key}`;
        },
      },
    }),
  r2: () =>
    new S3Driver({
      credentials: {
        accessKeyId: serverEnvs.R2_ACCESS_KEY,
        secretAccessKey: serverEnvs.R2_ACCESS_SECRET,
      },

      endpoint: serverEnvs.R2_ENDPOINT,
      region: "auto",
      supportsACL: false,

      bucket: "pos",
      visibility: "private",
      urlBuilder: {
        async generateURL(key) {
          return `${serverEnvs.R2_SUBDOMAIN}/${key}`;
        },
      },
    }),
};

const driverToUse = drivers[serverEnvs.DRIVE_DISK];

export const disk = new Disk(driverToUse());
