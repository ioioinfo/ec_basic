// Base routes for item..
﻿var industries = require('../utils/industries.js');
var eventproxy = require('eventproxy');
var callball_one = function(data,cb){
	if (data[0]) {
		cb("success",data[0]);
	}else {
		cb("fail","信息不存在！");
	}
}
var callball_many = function(data,cb){
	if (data.length > 0) {
		cb("success",data);
	}else {
		cb("fail","信息不存在！");
	}
}
exports.register = function(server, options, next){
	//通过商品id找到商品
	var get_productById = function(product_id, cb){
		server.plugins['models'].products.find_by_id(product_id,function(rows){
			callball_one(rows,cb);
		});
	};
	//通过商品id，行业id找到行业表及信息
	var get_product_industry = function(industry_id, product_id, cb){
		server.plugins['models'].industries_configures.find_by_industry_id(industry_id, product_id, function(rows){
			callball_one(rows,cb);
		});
	};
	//通过商品id找到图片
	var get_picturesById = function(product_id, cb){
		server.plugins['models'].products_pictures.find_by_product_id(product_id,function(rows){
			callball_many(rows,cb);
		});
	}
	//通过商品id查找销售量
	var get_salesNumber = function(product_id, cb){
		server.plugins['models'].product_sales.findNumber_by_productId(product_id,function(rows){
			callball_one(rows,cb);
		});
	};
	server.route([
		{
			method: 'GET',
			path: '/product_info',
			handler: function(request, reply){
				get_productById(1, function(status, data){
					if (status == "success") {
						var industry_id = data.industry_id;
						var product_id = data.id;
						var industry = industries[industry_id];
						var ep = eventproxy.create("product", "industry_info","industry", "pictures", "salesNumber",
							function (product,industry_info,industry,pictures,salesNumber) {
							return reply.view('product_show',{"product":product,"industry_info":industry_info,"industry":industry,"pictures":pictures,"salesNumber":salesNumber});
						});
						ep.emit("industry", industry);
						ep.emit("product", data);
						get_product_industry(industry_id, product_id,function(status, content){
							if (status == "success") {
								var industry_info = content;
								ep.emit("industry_info", industry_info);
							}
						});
						get_picturesById(product_id,function(status, content){
							if (status == "success") {
								var pictures = content;
								ep.emit("pictures", pictures);
							}
						});
						get_salesNumber(product_id,function(status, content){
							if (status == "success") {
								var salesNumber = content;
								ep.emit("salesNumber", salesNumber);
							}
						});

					}else {
						return reply.view('product_show',{"error":data});
					}
				});
			}
		},

    ]);

    next();
};

exports.register.attributes = {
    name: 'products_base'
};
