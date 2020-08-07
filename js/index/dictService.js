/**
 * 字典表业务逻辑类
 * @param {Object} $
 * @param {Object} owner
 */
(function($, owner) {
	owner.getDictInfo = function() {
		return new Promise(function(resolve, reject) {
			//获取字典 http://localhost:8081/getDict getDict
			app.ajax(app.url('getCategoriedDictInfo'), null, function(ret) {
				// console.log("字典数据：" + JSON.stringify(ret));
				// getDictInfoView(ret);
				if (ret.code == 200) {
					resolve(ret);
				} else {
					reject(ret);
				}
			});
		});
	};
}(mui, window.dictService = {}));
