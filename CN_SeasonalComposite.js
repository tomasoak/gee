//***********************************************************************************************//
//                                      First Glance at Sentinel-1 Data
// Author: Tomás Carvalho
// Date: Aug/2020 
//***********************************************************************************************//

var area_saf = xxx
var area_rsf = xxx
var areas_protec = xxx
var sentinel1 = xxx

// Loading PDS Paraíso boundary //
var selectAP = 'PDS Paraíso';
var pds_paraiso = areas_protec.filterMetadata('nome', 'equals', selectAP);
Map.centerObject(pds_paraiso, 10);

// VH Polarization - RGB Composite //
var ImageCollectionVH = sentinel1
  .filterBounds(pds_paraiso)
  .filter(ee.Filter.eq('instrumentMode', 'IW'))
  .filter(ee.Filter.eq('orbitProperties_pass', 'DESCENDING'))
  .select(['VH'])

// Seasonal Dates //  
var spring_2019 = ee.Filter.date('2019-01-01', '2019-04-30');
var winter_2019 = ee.Filter.date('2019-05-01', '2019-08-31');
var summer_2019 = ee.Filter.date('2019-09-11', '2019-12-31');

var spring_2018 = ee.Filter.date('2018-01-01', '2018-04-30');
var winter_2018 = ee.Filter.date('2018-05-01', '2018-08-31');
var summer_2018 = ee.Filter.date('2018-09-11', '2018-12-31');

var spring_2017 = ee.Filter.date('2017-01-01', '2017-04-30');
var winter_2017 = ee.Filter.date('2017-05-01', '2017-08-31');
var summer_2017 = ee.Filter.date('2017-09-11', '2017-12-31');

// Mosaic VH with PDS Paraíso //
var pds_imageCollectionVH = ImageCollectionVH.map(function(a) {
    return a.clip(pds_paraiso)
});

//***********************************************************************************************//
//          Basic Statistics Composite (mean, min, max, stdev, covariance, quartiles)           *//  
//***********************************************************************************************//

// Mean Composite per quadrimestre //  
var VH_RGB_mean = ee.Image.cat(
  pds_imageCollectionVH.filter(spring_2019).mean(), 
  pds_imageCollectionVH.filter(winter_2019).mean(), 
  pds_imageCollectionVH.filter(summer_2019).mean()
  );
Map.addLayer(VH_RGB_mean, {min: [-25, -30, 0.2], max: [-3, -2, 1], 'gamma': 0.6}, 'VH_RGB_Mean');

// Min Composite per quadrimestre //  
var VH_RGB_min = ee.Image.cat(
  pds_imageCollectionVH.filter(spring_2019).min(), 
  pds_imageCollectionVH.filter(winter_2019).min(), 
  pds_imageCollectionVH.filter(summer_2019).min()
  );

Map.addLayer(VH_RGB_min, {min: [-25, -30, 0.2], max: [-3, -2, 1], 'gamma': 0.6}, 'VH_RGB_Min');

// Max Composite per quadrimestre //  
var VH_RGB_max = ee.Image.cat(
  pds_imageCollectionVH.filter(spring_2019).max(), 
  pds_imageCollectionVH.filter(winter_2019).max(), 
  pds_imageCollectionVH.filter(summer_2019).max()
  );
Map.addLayer(VH_RGB_max,  {min: [-25, -30, 0.2], max: [-3, -2, 1], 'gamma': 0.6}, 'VH_RGB_Max');

// Stdev Composite per quadrimestre //
var VH_RGB_Stdev = ee.Image.cat(
  pds_imageCollectionVH.filter(spring_2019).reduce(ee.Reducer.stdDev()), 
  pds_imageCollectionVH.filter(winter_2019).reduce(ee.Reducer.stdDev()), 
  pds_imageCollectionVH.filter(summer_2019).reduce(ee.Reducer.stdDev())
  );
Map.addLayer(VH_RGB_Stdev,  {min: [-25, -30, 0.2], max: [-3, -2, 1], 'gamma': 0.6}, 'VH_RGB_Stdev');


// Covariance Composite per quadrimestre //
var VH_RGB_Cov = ee.Image.cat(
  pds_imageCollectionVH.filter(spring_2019).reduce(ee.Reducer.covariance()), 
  pds_imageCollectionVH.filter(winter_2019).reduce(ee.Reducer.covariance()), 
  pds_imageCollectionVH.filter(summer_2019).reduce(ee.Reducer.covariance())
  );
Map.addLayer(VH_RGB_Cov,  {min: [-25, -30, 0.2], max: [-3, -2, 1], 'gamma': 0.6}, 'VH_RGB_Cov');


// Different composition - Median //
// 2019
var VHspring_2019 = ee.Image(pds_imageCollectionVH.filter(spring_2019).median());
var VHwinter_2019 = ee.Image(pds_imageCollectionVH.filter(winter_2019).median());
var VHsummer_2019 = ee.Image(pds_imageCollectionVH.filter(summer_2019).median());
Map.addLayer(VHspring_2019.addBands(VHwinter_2019).addBands(VHsummer_2019), {min: -20, max: -7}, 'Median Season 2019');

// 2018
var VHspring_2018 = ee.Image(pds_imageCollectionVH.filter(spring_2018).median());
var VHwinter_2018 = ee.Image(pds_imageCollectionVH.filter(winter_2018).median());
var VHsummer_2018 = ee.Image(pds_imageCollectionVH.filter(summer_2018).median());
Map.addLayer(VHspring_2018.addBands(VHwinter_2018).addBands(VHsummer_2018), {min: -20, max: -7}, 'Median Season 2018');

// 2017
var VHspring_2017 = ee.Image(pds_imageCollectionVH.filter(spring_2017).median());
var VHwinter_2017 = ee.Image(pds_imageCollectionVH.filter(winter_2017).median());
var VHsummer_2017 = ee.Image(pds_imageCollectionVH.filter(summer_2017).median());
Map.addLayer(VHspring_2017.addBands(VHwinter_2017).addBands(VHsummer_2017), {min: -20, max: -7}, 'Median Season 2017');

//***********************************************************************************************//
//                                    Season Residual RGB                                      * //
//***********************************************************************************************//

// Mean - Min
var VH_min = pds_imageCollectionVH.filter(summer_2019).min()
var VH_mean = pds_imageCollectionVH.filter(summer_2019).mean()
var VH_mean_min = VH_mean.subtract(VH_min)
print(VH_mean_min)

// Mean - max
var VH_max = pds_imageCollectionVH.filter(summer_2019).max()
var VH_mean_max = VH_mean.subtract(VH_mean)
print(VH_mean_max)

Map.addLayer(VH_mean_min.addBands(VH_mean).addBands(VH_mean_max), {min: -20, max: -7}, 'Residual RGB');



//***********************************************************************************************//
//                                    Index normalized - RFDI                                  * //
//***********************************************************************************************//




//*********************************************************************************************** //
//                                        Areas of Interest                                     * //
//*********************************************************************************************** //
Map.addLayer(pds_paraiso.draw({color: 'FFFFFF', strokeWidth: 5}), {}, 'PDS Paraíso');
Map.addLayer(area_saf,  {color: 'FF0000'}, 'Area SAF');
Map.addLayer(area_rsf,  {color: 'FFFFFF'},  'Area RSF');
