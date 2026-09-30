import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setCodec("h264");
Config.setCrf(18);
// Use a locally installed Chrome if provided (e.g. offline / sandboxed machines).
if (process.env.REMOTION_BROWSER) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
}
