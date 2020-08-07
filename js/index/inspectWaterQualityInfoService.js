/**
 * 水质信息业务逻辑类
 * @param {Object} $
 * @param {Object} owner
 */
(function($, owner) {
	owner.getInspectWaterQualityInfo = function() {
		return new Promise(function(resolve, reject) {
			app.ajax(app.url('getInspectWaterQualityInfo'), null, function(ret) {
				if (ret.code == 200) {
					resolve(ret);
				} else {
					reject(ret);
				}
			});
		});
	};
}(mui, window.inspectWaterQualityInfoService = {}));
