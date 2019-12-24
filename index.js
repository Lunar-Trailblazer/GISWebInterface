require([
  'esri/Map',
  'esri/request',
  'esri/views/SceneView',
  'esri/widgets/LayerList',
  'esri/layers/BaseTileLayer',
  'esri/layers/TileLayer',
  'esri/layers/WMSLayer',
  'esri/views/MapView',
], function (
  Map,
  esriRequest,
  SceneView,
  LayerList,
  BaseTileLayer,
  TileLayer,
  WMSLayer,
  MapView,
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
        .replace("{y}", (2 ** level - 1) - row);
    },

    /**
     * Uses the Canvas JS API to manipulate the image before
     * placing it on the scene with .drawImage
     */
    fetchTile: function(level, row, col, options) {
      const url = this.getTileUrl(level, row, col);
      return esriRequest(url, {
        responseType: "image",
        signal: options && options.signal,
      }).then(res => {
          return res.data;
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
        // ctx.fillText(`(${level}, ${col}, ${row}[${(2**level - 1) - row}])`, 20, 20);
        return canvas;
      });
    }
  });

  const shadedReliefLayer = new TestTileLayer({
    urlTemplate:
      'http://localhost:12321/shaded-relief/{z}/{x}/{y}.png',
    title: 'Shaded Relief Test Layer',
  });

  const clementineTestLayer_2 = new TestTileLayer({
    urlTemplate:
      'http://localhost:12321/clementine/{z}/{x}/{y}.png',
    title: '122319 Clementine Test Layer',  
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
   
  const moonLROCWMSLayer = new WMSLayer({
    url:
    'http://webmap.lroc.asu.edu/',
    sublayers: [
      {
        name: 'luna_clem_ratio',
      },
    ],
    title: 'lunar clemintine base map'
  });
*/
   /* A tile image layer using a tile layer service (some server hosting the tiles)
   * These load faster than the other layer but isn't as pretty. */
   
  const moonTileLayer = new TileLayer({
    url:
      'https://tiles.arcgis.com/tiles/WQ9KVmV6xGGMnCiQ/arcgis/rest/services/Moon_Basemap_Tile0to9/MapServer',
    title: 'moon base tile layer',
    });
    

  const map = new Map({
    layers: [moonTileLayer, /*lunarClementineLayer , /*moonLROCWMSLayer,*/ shadedReliefLayer, clementineTestLayer_2]
  });

  /**
   * Renderer for the map object. Change "SceneView" to "MapView" for a 2d environment.
   */
  const sceneView = new SceneView({
    container: "viewDiv",
    map: map,
    center: [0, -30],
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
