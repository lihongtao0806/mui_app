/**
 * 地图业务逻辑类
 * @param {Object} $
 * @param {Object} owner
 */
(function($, owner) {
	var tiandi1 = null;
	var tiandi2 = null;
	var tiandi3 = null;
	var qp1 = null;
	var qp2 = null;
	var qp3 = null;
	var map = null;
	var vectorLayer = null;
	var vectorSource = null;
	var reportSerialId = null;
	var mapMoveendListener = null;
	var popuType = null;
	var serialNum = null; //图号
	var lon = null;
	var lat = null;
	var town = null; //所在镇
	var measureArea = null; //占地面积
	var locationDescription = null; //位置描述
	var remark = null;
	owner.initMap = function(dituCenter, getGeoResultInfo) {
		//屏幕中央取点图标样式设置
		var width = document.documentElement.clientWidth;
		var height = document.documentElement.clientHeight;
		var top = "" + (height / 2 - 40) + "px";
		var left = "" + (width / 2 - 20) + "px";
		// console.log(top+" , "+left);
		dituCenter.css({
			"top": top,
			"left": left,
			"position": "absolute",
			"z-index": "999",
			"width": "40px",
			"height": "40px"
		});

		var baoshan = new ol.proj.fromLonLat([121.04148550041, 31.0289920]);
		//天地图底图---基本图层
		tiandi1 = new ol.layer.Tile({
			source: new ol.source.XYZ({
				url: 'http://t{0-7}.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=53ed32eb4b23c6607c2f1d8616ecf217',
			})
		});
		//天地图底图---矢量图
		tiandi2 = new ol.layer.Tile({
			source: new ol.source.XYZ({
				url: 'http://t{0-7}.tianditu.gov.cn/DataServer?T=cta_w&x={x}&y={y}&l={z}&tk=53ed32eb4b23c6607c2f1d8616ecf217',
			})
		});
		tiandi3 = new ol.layer.Tile({
			source: new ol.source.XYZ({
				url: 'http://t{0-7}.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=53ed32eb4b23c6607c2f1d8616ecf217',
			})
		});

		//青浦遥感影像图
		qp1 = new ol.layer.Tile({
			source: new ol.source.TileWMS({
				url: 'http://221.181.88.134:6706/geoserver/sunt/wms?service=WMS',
				params: {
					// 'layers': 'sunt_sh:baoshan_utm',
					'layers': 'sunt:WP_BJ-02_202005_1',
					'singleTile': false
				}
			})
		});
		qp1.setVisible(false)

		//宝山河道图层
		qp2 = new ol.layer.Tile({
			source: new ol.source.TileWMS({
				url: 'http://221.181.88.134:6706/geoserver/sunt/wms?service=WMS',
				params: {
					'layers': 'sunt:syd_cg2',
					// 'layers': 'sunt_sh:baoshan_water_utm',
					'singleTile': false
				}
			})
		});

		//宝山19年排口图层
		qp3 = new ol.layer.Tile({
			source: new ol.source.TileWMS({
				url: 'http://221.181.88.134:6706/geoserver/bs/wms?service=WMS',
				params: {
					'layers': 'bs:baoshanpaikou_2019',
					'singleTile': false
				}
			})
		});
		qp3.setVisible(false)

		map = new ol.Map({
			//这个target对应一个div的id
			target: 'map',
			layers: [
				//天地图底图
				tiandi1,
				tiandi2,
				tiandi3,
				qp1,
				qp2,
				qp3
			],
			controls: ol.control.defaults({
				zoom: false,
			}).extend([
				// new ol.control.LayerSwitcher({ trash: false, extent: true }),
				// new ol.control.ScaleLine(),
				// new ol.control.Zoom({ target: undefined}),
				// new ol.control.Rotate({
				//    autoHide: true,
				//    label: "N"
				// }),
			]),
			view: new ol.View({
				//禁止旋转
				enableRotation: false,
				//地图中心点
				center: baoshan,
				//缩放级别
				zoom: 18,
				//地图缩放最小级别
				minZoom: 1,
				//地图缩放最大级别
				maxZoom: 18
			})
		});

		//数据源
		vectorSource = new ol.source.Vector();
		//图层
		vectorLayer = new ol.layer.Vector({
			visible: true,
			key: 1,
			name: "要素图层",
			source: vectorSource
		});
		//地图添加图层
		map.addLayer(vectorLayer);

		//获取并添加要素
		this.initVectorLayer(map, vectorSource, vectorLayer);

		//点击要素弹出框设置
		this.initPopup(map, vectorSource, reportSerialId);

		//开始定位
		this.nativeLocation();

		//地图移动监听
		this.mapMoveListener(getGeoResultInfo);
	};

	owner.closeMapMoveListener = function() {
		ol.Observable.unByKey(mapMoveendListener);
		map.un("moveend", function(evt) {
			console.log("我执行了关闭地图移动！");
		});
	}

	owner.mapMoveListener = function(getGeoResultInfo) {
		// 地图停止移动监听
		mapMoveendListener = map.on("moveend", function(evt) {
			var extent = evt.frameState.extent;
			var lon = (extent[0] + extent[2]) / 2;
			var lat = (extent[1] + extent[3]) / 2
			// console.log("lon=" + lon + " ,lat=" + lat);

			// EPSG:4326 (WGS84，即GPS)，这里将EPSG:3857坐标转为EPSG:4326，返回数组形式
			var lnglat = ol.proj.transform([lon, lat], 'EPSG:3857', 'EPSG:4326');
			// console.log("天地图坐标--->"+lnglat);

			//WGS-84 to GCJ-02
			var latlngJson = GPS.gcj_encrypt(lnglat[1], lnglat[0]);
			var lnglatArr = [latlngJson.lng, latlngJson.lat];
			// console.log("latlngJson--->"+JSON.stringify(latlngJson));
			// console.log("高德地图坐标--->"+lnglatArr);

			AMap.plugin('AMap.Geocoder', function() {
				var geocoder = new AMap.Geocoder({});
				geocoder.getAddress(lnglatArr, function(status, result) {
					if (status === 'complete' && result.info === 'OK') {
						// result为对应的地理位置详细信息
						// console.log("详细的地理位置信息888888--->"+JSON.stringify(result));
						var geocoderResult = {};
						geocoderResult.lon = lnglat[0];
						geocoderResult.lat = lnglat[1];
						geocoderResult.address = result.regeocode.formattedAddress; //详细地址
						geocoderResult.province = result.regeocode.addressComponent.province; //市
						geocoderResult.district = result.regeocode.addressComponent.district; //区
						geocoderResult.township = result.regeocode.addressComponent.township; //镇
						getGeoResultInfo(geocoderResult);
					}
				})
			}) //end for 经纬度逆向地理编码
		}); //end for 移动监听
	}

	owner.nativeLocation = function() {
		var context = plus.android.importClass("android.content.Context");
		var locationManager = plus.android.importClass("android.location.LocationManager");
		var main = plus.android.runtimeMainActivity();
		var mainSvr = main.getSystemService(context.LOCATION_SERVICE);

		// 定位方式GPS
		var locationListener = plus.android.implements("android.location.LocationListener", {
			"onLocationChanged": function(location) {
				var latitude = plus.android.invoke(location, "getLatitude");
				var longitude = plus.android.invoke(location, "getLongitude");
				var gpsLocation = "lat:" + latitude + ",lng:" + longitude;
				// console.log("gpsLocation--->" + gpsLocation);
				// locationManager.removeGpsStatusListener(this);
				setMapCenter(latitude, longitude);
			},
			"onProviderEnabled": function(res) {},
			"onProviderDisabled": function(res) {
				console.log("无法获取GPS模块，将无法获取经纬度信息！");
				alert("无法获取GPS模块，将无法获取经纬度信息！");
			},
			"onStatusChanged": function(p, s, e) {
				console.log(p);
			}
		});
		// locationManager.GPS_PROVIDER 只使用GPS，locationManager参数可以自己百度  
		// mainSvr.requestLocationUpdates(locationManager.GPS_PROVIDER, 0, 0, locationListener);  
		mainSvr.requestSingleUpdate(locationManager.GPS_PROVIDER, locationListener, null);
	}

	/**
	 * 设置定位后的视图中心
	 * @param {Object} latitude
	 * @param {Object} longitude
	 */
	function setMapCenter(latitude, longitude) {
		var centerLatLng = new ol.proj.fromLonLat([longitude, latitude]);
		map.getView().setCenter(centerLatLng);
		map.getView().setZoom(18);
	}

	/**
	 * 点击要素弹出框设置
	 * @param {Object} map
	 */
	owner.initPopup = function() {
		//弹出框控件
		var container = document.getElementById('popup');
		//显示内容控件
		var content = document.getElementById('popup-content');
		//关闭按钮
		var closer = document.getElementById('popup-closer');
		//覆盖物
		var overlay = new ol.Overlay({
			element: container,
			autoPan: true,
			autoPanAnimation: {
				duration: 250
			}
		});
		//添加覆盖物
		map.addOverlay(overlay)
		//关闭按钮点击监听
		closer.onclick = function() {
			overlay.setPosition(undefined); //关键代码
			closer.blur();
			return false;
		};
		//绑定地图的多边形点击事件
		map.on('singleclick', function(e) {
			var coordinate = e.coordinate;
			var extent = [coordinate[0] - 10, coordinate[1] - 10, coordinate[0] + 10, coordinate[1] + 10];
			var flag = true;
			vectorSource.forEachFeatureIntersectingExtent(extent, function(feature) {
				if (feature.get("serialNum")) {
					content.innerHTML =
						'<code>' + '图号：' + feature.get("serialNum") + '</code> <br>' +
						'<code>' + '位置：' + feature.get("locationDescription") + '</code> <br>' +
						'<code>' + '所在镇：' + feature.get("town") + '</code> <br>' +
						'<code>' + '占地面积：' + feature.get("measureArea") + '</code> <br>' +
						'<code>' + '备注：' + feature.get("remark") + '</code> <br>';
					overlay.setPosition(coordinate);
					/***
					var serialNum=null; //图号
					var lon=null;
					var lat=null; 
					var town=null; //所在镇
					var measureArea=null; //占地面积
					var locationDescription=null; //位置描述
					***/
					serialNum = feature.get("serialNum");
					lon = feature.get("lon");
					lat = feature.get("lat");
					town = feature.get("town");
					remark = feature.get('remark');
					locationDescription = feature.get("locationDescription");
					serialNum = feature.get("serialNum");
					console.log('看看reportSerialId' + JSON.stringify(reportSerialId))
					popuType = feature.get("popuType");
					reportSerialId = feature.get("reportSerialId");
					flag = true;
				} else {
					reportSerialId = null;
					flag = false;
				}
			});
			if (!flag) {
				overlay.setPosition(undefined); //关键代码
				closer.blur();
			}
		});

		//内容体点击监听
		content.addEventListener('click', function() {
			overlay.setPosition(undefined); //关键代码
			closer.blur();

			if (serialNum != null) {
				if (popuType == 1) {
					app.open("mine_Passes_detail.html?reportSerialId=" + reportSerialId);
				}else {
					var params = {
						serialNum: serialNum,
					}
					app.ajax(app.url('waterSource/checkIfReported'), params, function(ret) {
						console.log('参数' + JSON.stringify(params))
						console.log('返回值' + JSON.stringify(ret))
						console.log('类型' + popuType)
						if (ret.code == 200) {
							// 上传
							if (ret.data) {
					
								app.open("mine_Passes_detail.html?reportSerialId=" + reportSerialId);
					
							} else {
								app.open("mine_detail.html?serialNum=" + serialNum + "&lon=" + lon + "&lat=" + lat + "&town=" + town +
									"&measureArea=" + measureArea + "&locationDescription=" + locationDescription + "&remark=" + remark);
							}
						} else {
							mui.toast(ret.msg);
						}
					
					})
				}
				
				
			} else {
				mui.toast("取证图号为空！");
			}





			// if(popuType==1){
			// 	if (serialNum != null) {
			// 		app.open("mine_Passes_detail.html?reportSerialId=" + reportSerialId);
			// 	} else {
			// 		mui.toast("取证图号为空！");
			// 	}
			// }else {
			// 	if (serialNum != null) {
			// 		app.open("mine_detail.html?serialNum=" + serialNum+"&lon="+lon+"&lat="+lat+"&town="+town+"&measureArea="+measureArea+"&locationDescription="+locationDescription+"&remark="+remark);
			// 	} else {
			// 		mui.toast("取证图号为空！");
			// 	}
			// }
		})
	}

	owner.initVectorLayer = function() {
		//重设地图数据源
		vectorSource.clear();
		//清空地图数据源
		var userId = app.getSetting("user_id");
		//获取取证信息
		var mapInfo = {
			userId: userId
		};
		// if (startAndEndTime.startTime != null) {
		// 	mapInfo.startTime = startAndEndTime.startTime;
		// 	mapInfo.endTime = startAndEndTime.endTime;
		// }
		// /waterSource/selectUserWaterPollution
		// app.ajax(app.url('getSimpleInspectReportInfo'), mapInfo, function(ret) {
		console.log('参数' + JSON.stringify(mapInfo))
		app.ajax(app.url('waterSource/selectUserWaterPollution'), mapInfo, function(ret) {
			// console.log("取证数据图号新接口：" + JSON.stringify(ret));
			if (ret.code == 200) {
				var data = ret.data;
				var evidenceData = JSON.stringify(ret.data);
				// app.setSetting("evidenceData", evidenceData);
				//覆盖物样式 
				var style = new ol.style.Style({
					image: new ol.style.Icon(({
						anchor: [0.5, 0.5],
						anchorOrigin: 'top-left',
						// anchorXUnits: 'fraction',
						// anchorYUnits: 'pixels',
						// offsetOrigin: 'top-right',
						//offset:[0,10],
						scale: 0.5,
						opacity: 0.75,
						src: './asset/images/ok.png'
					}))
				});
				var noStyle = new ol.style.Style({
					image: new ol.style.Icon(({
						anchor: [0.5, 0.5],
						anchorOrigin: 'top-left',
						// anchorXUnits: 'fraction',
						// anchorYUnits: 'pixels',
						// offsetOrigin: 'top-right',
						//offset:[0,10],
						scale: 0.5,
						opacity: 0.75,
						src: './asset/images/no.png'
					}))
				});
				var passed = data.Passed; //未完成
				var noPassed = data.noPassed; //完成
				// console.log('passed未完成'+JSON.stringify(passed))
				for (key1 of passed) {

					// console.log("------------------"+JSON.stringify(key1));
					var hengjiang = new ol.proj.fromLonLat([key1.lon, key1.lat]);
					//覆盖物【点】
					var feature = new ol.Feature({
						geometry: new ol.geom.Point(hengjiang),
						serialNum: key1.serialNum,
						town: key1.town,
						measureArea: key1.measureArea,
						locationDescription: key1.locationDescription,
						lon: key1.lon,
						lat: key1.lat,
						remark: key1.remark,
						population: 2115,
						popuType: 1,
						reportSerialId: key1.reportSerialId,
					});
					//要素添加样式
					feature.setStyle(style);
					//数据源添加要素
					vectorSource.addFeature(feature);
				}
				for (key of noPassed) {
					// console.log('key<<<<<<<<<<<<<<<<<'+JSON.stringify(key));
					var hengjiang = new ol.proj.fromLonLat([key.lon, key.lat]);
					//覆盖物【点】
					var feature2 = new ol.Feature({
						geometry: new ol.geom.Point(hengjiang),
						// geometry:new LineString,
						// name: '中恒泾',

						serialNum: key.serialNum,
						town: key.town,
						measureArea: key.measureArea,
						locationDescription: key.locationDescription,
						lon: key.lon,
						lat: key.lat,
						remark: key.remark,
						population: 2115,
						popuType: 0
					});
					//要素添加样式
					feature2.setStyle(noStyle);

					//数据源添加要素
					vectorSource.addFeature(feature2);
				}
			} else {
				mui.toast(ret.msg);
			}
		});

		//获取河道取证信息
		app.ajax(app.url('getInspectWaterQualityInfo'), {
			// "userId": userId
		}, function(ret) {
			// console.log("取证数据：" + JSON.stringify(ret.data.items));
			if (ret.code == 200) {
				var data = ret.data.items;
				var waterEvidenceData = JSON.stringify(ret.data.items);
				app.setSetting("waterEvidenceData", waterEvidenceData);
				// console.log(waterEvidenceData)
			}
		});
	}

	owner.initLayerShowHide = function(switchTiandi1, switchTiandi2, switchTiandi3, switchQp1, switchQp2, switchQp3) {
		switchTiandi1.click(function(event) {
			if (this.classList.contains('mui-active')) {
				tiandi1.setVisible(true)
			} else {
				tiandi1.setVisible(false)
			}
		})
		switchTiandi2.click(function(event) {
			if (this.classList.contains('mui-active')) {
				tiandi2.setVisible(true)
			} else {
				tiandi2.setVisible(false)
			}
		})
		switchTiandi3.click(function(event) {
			if (this.classList.contains('mui-active')) {
				tiandi3.setVisible(true)
			} else {
				tiandi3.setVisible(false)
			}
		})
		switchQp1.click(function(event) {
			if (this.classList.contains('mui-active')) {
				qp1.setVisible(true)
			} else {
				qp1.setVisible(false)
			}
		})
		switchQp2.click(function(event) {
			if (this.classList.contains('mui-active')) {
				qp2.setVisible(true)
			} else {
				qp2.setVisible(false)
			}
		})
		switchQp3.click(function(event) {
			if (this.classList.contains('mui-active')) {
				qp3.setVisible(true)
			} else {
				qp3.setVisible(false)
			}
		})
	}

}(mui, window.mapService = {}));
