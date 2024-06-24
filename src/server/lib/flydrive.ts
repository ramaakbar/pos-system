import { Disk } from "flydrive";
import { FSDriver } from "flydrive/drivers/fs";

import { getBaseUrl } from "@/lib/utils";

const fsDriver = new FSDriver({
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
});

export const disk = new Disk(fsDriver);
