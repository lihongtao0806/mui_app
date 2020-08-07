/**
 * 版本升级
 * @param {Object} owner
 * @param {Object} $
 */
(function($, owner) {
	owner.getRiverNameList = function(url, location) {
		console.log('经纬度'+JSON.stringify(location.lon)+ '111111'+JSON.stringify(location.lat))
		return new Promise(function(resolve, reject) {
			app.ajax(app.url(url), {
				"lonStr": location.lon,
				"latStr": location.lat
			}, function(ret) {
				if (ret.code == 200) {
					resolve(ret);
				} else {
					reject(ret);
				}
			});
		});
	}
}(mui, window.inspectOutfalReportInfoService = {}));
