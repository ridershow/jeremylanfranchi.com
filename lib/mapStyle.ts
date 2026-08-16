import type { SkySpecification, StyleSpecification } from "maplibre-gl";

const ESRI =
  "https://server.arcgisonline.com/ArcGIS/rest/services";

export const globeSky: SkySpecification = {
  "sky-color": "#07080c",
  "horizon-color": "#243044",
  "fog-color": "#0b1018",
  "atmosphere-blend": [
    "interpolate",
    ["linear"],
    ["zoom"],
    0,
    0.68,
    1.4,
    0.58,
    4.2,
    0.36,
    5,
    0.2,
    6,
    0.08,
  ],
};

export const satelliteStyle: StyleSpecification = {
  version: 8,
  sources: {
    "imagery-low": {
      type: "raster",
      tiles: [`${ESRI}/World_Imagery/MapServer/tile/{z}/{y}/{x}`],
      tileSize: 256,
      maxzoom: 3,
      attribution: "Tiles © Esri",
    },
    "imagery-high": {
      type: "raster",
      tiles: [`${ESRI}/World_Imagery/MapServer/tile/{z}/{y}/{x}`],
      tileSize: 256,
      minzoom: 3,
      maxzoom: 19,
      attribution: "Tiles © Esri",
    },
    labels: {
      type: "raster",
      tiles: [
        `${ESRI}/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}`,
      ],
      tileSize: 256,
      minzoom: 4,
      maxzoom: 16,
      attribution: "Labels © Esri",
    },
  },
  layers: [
    {
      id: "background",
      type: "background",
      paint: { "background-color": "#07080c" },
    },
    {
      id: "imagery-low",
      type: "raster",
      source: "imagery-low",
      maxzoom: 4.25,
      paint: { "raster-fade-duration": 0 },
    },
    {
      id: "imagery-high",
      type: "raster",
      source: "imagery-high",
      minzoom: 3.5,
      paint: { "raster-fade-duration": 0 },
    },
    {
      id: "labels",
      type: "raster",
      source: "labels",
      minzoom: 4.5,
      paint: { "raster-opacity": 0.88, "raster-fade-duration": 0 },
    },
  ],
  sky: globeSky,
};
