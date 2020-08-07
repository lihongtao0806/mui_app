/**
 * 上传固废业务逻辑类
 * @param {Object} $
 * @param {Object} owner
 */
(function($, owner) {
	owner.upload = function(uploadInterval, getUploadCode) {
		if (uploadInterval == null) {
			uploadInterval = setInterval(function() {
				// console.log("定时上传轮询");
				var intervalFlag = app.getSetting("intervalFlag");
				if (intervalFlag == 'true') {
					app.setSetting("intervalFlag", false); //先停止上传，等一组数据上传完成以后再设置为true.

					var tmpUploadDatas = JSON.parse(app.getSetting("uploadDatas"));
					var uploadDatas = tmpUploadDatas.data;
					
					if (uploadDatas == null || uploadDatas == undefined) {
						return;
					}
					console.log(JSON.stringify(uploadDatas))
					
					var uploadIndex = 0; //待上传记录在所有记录中的下标
					var uploadFlag = false; //是否有待上传的记录
					for (var uploadData of uploadDatas) {
						if (uploadData.toUpload == 1) {
							uploadFlag = true;
							break;
						} else {
							uploadIndex++;
						}
					}

					//执行上传逻辑
					if (uploadFlag) {
						console.log("待上传下标--->" + uploadIndex);
						console.log("待上传记录--->" + JSON.stringify(uploadDatas[uploadIndex]));

						var count = 0;
						var file_data_arr = [];
						var arr = [];
						for (file of uploadDatas[uploadIndex].images) {
							arr.push(file);
						}
						// for (file of uploadDatas[uploadIndex].arrWaterImgs) {
						// 	arr.push(file);
						// }
						getImgToBase64(arr, file_data_arr, count, uploadIndex, uploadDatas, getUploadCode);
					}
				}
			}, 3000);
		}
	};

	//将图片转换为Base64
	function getImgToBase64(arr, file_data_arr, count, uploadIndex, uploadDatas, getUploadCode) {
		var canvas = document.createElement('canvas'),
			ctx = canvas.getContext('2d'),
			img = new Image;
		img.crossOrigin = 'Anonymous';

		img.onload = function() {
			var originWidth = img.width;
			var originHeight = img.height;
			// 最大尺寸限制
			var maxWidth = app.maxWidth(),
				maxHeight = app.maxWidth();
			// 目标尺寸
			var targetWidth = originWidth,
				targetHeight = originHeight;
			// 图片尺寸超过1000x1000的限制
			if (originWidth > maxWidth || originHeight > maxHeight) {
				if (originWidth / originHeight > maxWidth / maxHeight) {
					targetWidth = maxWidth;
					targetHeight = Math.round(maxWidth * (originHeight / originWidth));
				} else {
					targetHeight = maxHeight;
					targetWidth = Math.round(maxHeight * (originWidth / originHeight));
				}
			}

			// canvas对图片进行缩放
			canvas.width = targetWidth;
			canvas.height = targetHeight;

			// 清除画布
			ctx.clearRect(0, 0, targetWidth, targetHeight);
			// 图片压缩
			ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

			// console.log(targetWidth, targetHeight)
			var dataURL = canvas.toDataURL('image/jpeg');

			file_data_arr.push(dataURLtoFile(dataURL, 'img' + count + '.jpg'))
			//						console.log("====")
			count++;
			getImgToBase64(arr, file_data_arr, count, uploadIndex, uploadDatas, getUploadCode);

			canvas = null;
		};
		img.src = arr[count];
		if (file_data_arr.length == arr.length) {
			// console.log(JSON.stringify(file_data_arr));
			uploadImg(file_data_arr, uploadIndex, uploadDatas, getUploadCode);
		}
	}

	/**
	 * 上传操作
	 * @param {Object} file_data_arr 待上传的文件数组
	 * @param {Object} uploadIndex 待上传的记录在uploadDatas数组中的下标
	 */
	function uploadImg(file_data_arr, uploadIndex, uploadDatas, getUploadCode) {
		var xhr = new XMLHttpRequest();
		xhr.timeout = 120000;
		xhr.ontimeout = function(e) {
			mui.toast('请求超时，请再网络状态良好的地方重试');
		};

		var formData = new FormData();
		var uploadData = uploadDatas[uploadIndex];

		console.log("uploadData这是要传的值--->" + JSON.stringify(uploadData));

		var arrImgsSize = uploadData.images.length;
		// var arrWaterImgsSize = uploadData.arrWaterImgs.length;
		for (var i = 0; i < arrImgsSize; i++) {
			// console.log("图片大小--->"+file_data_arr[i].size)
			formData.append('images', file_data_arr[i]);
		}
		// for (var i = arrImgsSize; i < file_data_arr.length; i++) {
		// 	// console.log("图片大小--->"+file_data_arr[i].size)
		// 	formData.append('arrWaterImgs', file_data_arr[i]);
		// }

		var dictionaryKey = JSON.parse(app.getSetting("dictionaryKey"));
		uploadData.areaType = dictionaryKey[uploadData.areaType]; //区域类型
		uploadData.riskSourcesType = dictionaryKey[uploadData.riskSourcesType]; //风险源类别

		for (item in uploadData) {
			// console.log(uploadData[item]);
			// console.log(JSON.stringify(item));
			if (!uploadData[item]) {
				uploadData[item] = '0';
			}
			if (item != 'images' && item != 'arrWaterImgs') {
				formData.append(item, uploadData[item]);
			}
		}
		var userId = app.getSetting("user_id");
		// console.log("userId--->" + userId);
		 formData.append("userId", userId);
		// formData.append("reportType", 1701); //"上报类型"
		// formData.append("reportProcessState", 1601); //"单子状态"

		xhr.onreadystatechange = function(e) {
			// console.log(JSON.stringify(xhr.readyState))
			// console.log(xhr.responseText);
			if (xhr.readyState == 4) {
				var ret = JSON.parse(xhr.responseText);
				// console.log("--->"+JSON.stringify(xhr.status));
				if (xhr.status == 200) {
					// console.log(JSON.stringify(ret));
					if (ret.code == 200) {
						getUploadCode(200);
						mui.toast('上传成功');
						//1 删除缓存中的数据
						uploadDatas.splice(uploadIndex, 1);
						// console.log("删减后的uploadDatas--->" + JSON.stringify(uploadDatas));
						var d = {}; 
						d.data = uploadDatas;
						app.setSetting("uploadDatas", JSON.stringify(d));

						//3 重开始上传逻辑
						if (uploadDatas.length == 0) {
							app.setSetting("intervalFlag", false); 
							// clearInterval(uploadInterval);
						} else {
							app.setSetting("intervalFlag", true);
						}
					} else {
						getUploadCode(500);
						uploadDatas.splice(uploadIndex, 1);
						// console.log("删减后的uploadDatas--->" + JSON.stringify(uploadDatas));
						var d = {}; 
						d.data = uploadDatas;
						app.setSetting("uploadDatas", JSON.stringify(d));
						
						//3 重开始上传逻辑
						if (uploadDatas.length == 0) {
							app.setSetting("intervalFlag", false); 
							// clearInterval(uploadInterval);
						} else {
							app.setSetting("intervalFlag", true);
						}
						// uploadDatas.splice(uploadIndex, 1);
						// console.log('44444444444444444')
						mui.toast("上报失败" + ret.msg);
					}
				} else {
					getUploadCode(500);
					mui.toast("xhr.status != 200");
				}
				//断点测试一下
				return;
			}
		}
		xhr.open('POST', app.url('/waterSource/saveReportInfo'), true);
		// if (uploadData.eventType == 1) {
		// 	xhr.open('POST', app.url('saveEvidence'), true);
		// } else if (uploadData.eventType == 2) {
		// 	xhr.open('POST', app.url('saveWaterPollutionReportInfo'), true);
		// }

		xhr.send(formData);
	} //end for uploadImg


	//将base64转换为文件
	function dataURLtoFile(dataurl, filename) {
		var arr = dataurl.split(','),
			mime = arr[0].match(/:(.*?);/)[1],

			bstr = atob(arr[1]),
			n = bstr.length,
			u8arr = new Uint8Array(n);
		while (n--) {
			u8arr[n] = bstr.charCodeAt(n);
		}
		return new File([u8arr], filename, {
			type: mime
		});
	} // end for dataURLtoFile

}(mui, window.uploadService = {}));
