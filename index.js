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

    getTileUrl: function(level, row, col) {
      return this.urlTemplate
        .replace("{z}", level)
        .replace("{x}", col)
        .replace("{y}", ( 2 ** level - 1) - row);
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
        const imgElement = res.data;
        const width = this.tileInfo.size[0];
        const height = width;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(imgElement, 0, 0, width, height);
        ctx.font = '28px serif';
        ctx.fillStyle = 'white';
        ctx.fillText(`(${level}, ${col}, ${row}[${(2**level - 1) - row}])`, 20, 20);
        return canvas;
      });
    }
  });

<<<<<<< HEAD
  const shadedReliefLayer = new TestTileLayer({
    urlTemplate:
      'http://localhost:12321/shaded-relief/{z}/{x}/{y}.png',
    title: 'Shaded Relief Layer',
  });

  const lunarClementineLayer = new TestTileLayer({
    urlTemplate:
      'http://localhost:12321/clementine/{z}/{x}/{y}.png',
    title: 'Lunar Clementine Layer',
=======
  /**
   * LC layer which takes images stored in personal server (Raspberry Pi)
   * The framework uses the urlTemplate to find the image files
   * However, the original data doesn't seem to use this tiling format.
   * Instead, the images are georeferenced using a KML file, which
   * isn't supported in ArcGIS's JS API. Adding georeferenced images
   * directly also isn't supported, and must come through a Map Service of
   * some kind.
   *
   * Considerations:
   * - ArcGIS JS doesn't supported KML overlays and other KML functionality
   *   doesn't work in SceneView.
   * - The LC data doesn't follow the layout of tiled images. For example,
   *   zoom 0 should have 1 image, zoom 1 should have 4, and zoom 2 should
   *   have 16 images. However, in the actual data, zoom 0 has 1 image,
   *   zoom 1 has 2, zoom 2 has 8, etc.
   * - Maybe a map service could be implemented (seems to require
   *   ArcGIS software) and each image file and its corresponding KML file
   *   could be processed into georeferened image files.
   * - Is there a way to make ground overlay KML work in ArcGIS? Maybe the
   *   data could be turned into a tiled images somehow.
   */
  const lunarClementineLayer = new TestTileLayer({
    urlTemplate:
      /*'http://spw.us.to:65449/lc/{z}/{x}/{y}.png',*/
      'http://localhost:65449/lc/{z}/{x}/{y}.png',
    title: 'Lunar Clementine Test Layer',
>>>>>>> parent of 827c578... fixed tiling
  });

  /**
   * http://wms.lroc.asu.edu/lroc/
   * Uses a Web Map Service from ASU to load the tiles in.
   * Slower loading but seems higher quality? or not
   * Considerations:
   *   - Slower Loading
   *   - Is it free to use?
   *   - Saving tiles locally for faster loading?
   *   - Seems to load on top of all other layers regardless of order,
   *     a fix has to be found for that one
   */
  const moonLROCWMSLayer = new WMSLayer({
    url:
    'http://webmap.lroc.asu.edu/',
    sublayers: [
      {
        name: 'luna_clem_ratio',
      },
    ],
  });

  /**
   * A tile image layer using a tile layer service (some server hosting the tiles)
   * These load faster than the other layer but isn't as pretty.
   */
  const moonBaseLayer = new TileLayer({
    url:
      'https://tiles.arcgis.com/tiles/WQ9KVmV6xGGMnCiQ/arcgis/rest/services/Moon_Basemap_Tile0to9/MapServer',
    title: 'Moon Base Map',
  });

  const map = new Map({
<<<<<<< HEAD
    layers: [moonBaseLayer, lunarClementineLayer , shadedReliefLayer],
=======
    layers: [moonTileLayer, lunarClementineLayer , moonLROCWMSLayer],
>>>>>>> parent of 827c578... fixed tiling
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
