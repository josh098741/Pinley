import Mapbox from "@rnmapbox/maps";

const MAPBOX_ACCESS_TOKEN =
  process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ||
  process.env.EXPO_MAPBOX_ACCESS_TOKEN;

if (MAPBOX_ACCESS_TOKEN) {
  Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);
} else {
  console.warn(
    "[Mapbox] Access token is missing. Please set EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN in your mobile .env file."
  );
}

export { MAPBOX_ACCESS_TOKEN };
export default Mapbox;
