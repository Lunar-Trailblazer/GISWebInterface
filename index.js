require([
  'esri/Map',
  'esri/request',
  'esri/views/SceneView',
  'esri/views/MapView',
  'esri/widgets/LayerList',
  'esri/layers/BaseTileLayer',
  'esri/layers/TileLayer',
  'esri/layers/WMSLayer',
], function (
  Map,
  esriRequest,
  SceneView,
  MapView,
  LayerList,
  BaseTileLayer,
  TileLayer,
  WMSLayer,
) {

  /**
   *  Creates an inherited class from BaseTileLayer which
   *  tells the framework how to find the right URL for each tile and
   *  what to do with the result of the fetch.
   */
  const TestTileLayer = BaseTileLayer.createSubclass({
    properties: {
      urlTemplate: null,
    },

    /**
    * each zoom level increases the number of tile needed to 2^(n), where n = level
    */
    getTileUrl: function(level, row, col) {
      return this.urlTemplate
        .replace("{z}", level)
        .replace("{x}", col)
        .replace("{y}", (2**level - 1) - row);
    },

    /**
     * Uses the Canvas JS API to manipulate the image before
     * placing it on the scene
     */
    fetchTile: function(level, row, col, options) {
      const url = this.getTileUrl(level, row, col);
      return esriRequest(url, {
        responseType: "image",
        signal: options && options.signal,
      }).then(res => {
          return res.data;
      });
    }
  });

  const shadedReliefLayer = new TestTileLayer({
    urlTemplate:
      'http://localhost:12321/shaded-relief/{z}/{x}/{y}.png',
    title: 'Shaded Relief Test Layer',
  });

  const lunarClementineLayer = new TestTileLayer({
    urlTemplate:
      'http://localhost:12321/clementine/{z}/{x}/{y}.png',
    title: 'Lunar Clementine Test Layer',
  });

  /**
   * A tile image layer using a tile layer service (some server hosting the tiles)
   * These load faster than the other layer but isn't as pretty.
   */
  const moonTileLayer = new TileLayer({
    url:
      'https://tiles.arcgis.com/tiles/WQ9KVmV6xGGMnCiQ/arcgis/rest/services/Moon_Basemap_Tile0to9/MapServer',
  });

  const map = new Map({
    layers: [moonTileLayer, lunarClementineLayer , shadedReliefLayer],
  });

  /**
   * Renderer for the map object. Change "SceneView" to "MapView" for a 2d environment.
   */
  const sceneView = new SceneView({
    container: "viewDiv",
    map: map,
    center: [0, 30],
    zoom: 0,
    alphaCompositingEnabled: true,
    environment: {
      background: {
        type: "color",
        color: [0, 0, 0, 0],
      },
      starsEnabled: true,
      atmosphereEnabled: false,
    },
  });

  /**
   * UI element that lets you toggle the different layer in top right of screen.
   */
  const layerList = new LayerList({
    view: sceneView,
  });
  sceneView.ui.add(layerList, "top-right");
});
