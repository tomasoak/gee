/**
 * @name
 *      Sentinel-2 Mosaics Without Clouds
 * 
 * @description
 *      Removing clouds and mosacing Sentinel-2 images
 *  
 * @author
 *      Tomás Carvalho
 *      tomas.jpeg@gmail.com
 *
 * @version
 *    1.0.0 - 
 * 
 */


var selectMunSFX = '1507300'
var munSFX = municipios.filterMetadata('CD_GEOCMU', 'equals', selectMunSFX)

var selectMunTucuma = '1508084'
var munTucuma = municipios.filterMetadata('CD_GEOCMU', 'equals', selectMunTucuma)

// Load Sentinel-2 TOA reflectance data.
var s2 = ee.ImageCollection('COPERNICUS/S2_SR');

var CloudCoverMax = 20

// Function to mask clouds using the Sentinel-2 QA band.
function maskS2clouds(image) {
  var qa = image.select('QA60');

  // Bits 10 and 11 are clouds and cirrus, respectively.
  var cloudBitMask = ee.Number(2).pow(10).int();
  var cirrusBitMask = ee.Number(2).pow(11).int();

  // Both flags should be set to zero, indicating clear conditions.
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0).and(
             qa.bitwiseAnd(cirrusBitMask).eq(0));

  // Return the masked and scaled data.
  return image.updateMask(mask).divide(10000);
}

// Map the cloud masking function over one year of data
var s2filteredSFX = s2.filterDate('2020-08-01', '2020-08-31')
                  // Pre-filter to get less cloudy granules.
                  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', CloudCoverMax))
                  .map(maskS2clouds)
                  .select('B.*')
                  // .filterBounds(munSFX);
var compositeSFX = s2filteredSFX.median();
var compositeClipSFX = compositeSFX.clip(geometry)

var s2filteredTucuma = s2.filterDate('2020-08-01', '2020-08-31')
                  // Pre-filter to get less cloudy granules.
                  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', CloudCoverMax))
                  .map(maskS2clouds)
                  .select('B.*')
                  // .filterBounds(munTucuma);
var compositeTucuma = s2filteredTucuma.median();
var compositeClipTucuma = compositeTucuma.clip(geometry)

var mosaicImages = ee.ImageCollection([
  compositeClipSFX,
  compositeClipTucuma,
]).mosaic();

var clipMosaic = mosaicImages.clip(geometry)
print(clipMosaic.select(['B4','B3', 'B2'],['R','G','B']))

// Create visualization to export.
var visualization = clipMosaic.visualize({
  bands: ['B4', 'B3', 'B2'],
  max: 0.3,
  min: 0,
  gamma: 1.6,
  
});
print(visualization)

// Display the results.
Map.centerObject(geometry, 9)
Map.addLayer(compositeClipSFX, {bands: ['B4', 'B3', 'B2'], min: 0, max: 0.3, gamma: 1.6}, 'sfx', false);
Map.addLayer(compositeClipTucuma, {bands: ['B4', 'B3', 'B2'], min: 0, max: 0.3, gamma: 1.6}, 'tucumã', false);
Map.addLayer(mosaicImages, {bands: ['B4', 'B3', 'B2'], min: 0, max: 0.3, gamma: 1.6}, 'mosaic', false);
Map.addLayer(clipMosaic, {bands: ['B4', 'B3', 'B2'], min: 0, max: 0.194, gamma: 1.6}, 'clipMosaic_cust');

Export.image.toDrive({
    image: visualization,
    folder: 'Earth Engine',
    description: 'sfx_tucuma_sentinel2_082020',
    region: geometry,
    scale: 10,
    fileFormat: 'GeoTIFF',
    maxPixels:1e13
});
