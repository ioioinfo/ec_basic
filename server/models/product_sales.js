var _ = require('lodash');
var EventProxy = require('eventproxy');

var product_sales = function(server) {
	return {
		findNumber_by_productId : function(product_id, callback) {
			var query = `select total_number from product_sales where product_id = ? order by total_number desc` ;
			server.plugins['mysql'].pool.getConnection(function(err, connection) {
				connection.query(query, product_id, function(err, results) {
					if (err) {
						throw err;
					}
					connection.release();
					callback(results);
				});
			});
		},

	};
};

module.exports = product_sales;
