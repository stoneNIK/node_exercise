var express = require('express');
var router = express.Router();
var ObjectID = require('mongodb').ObjectID;
var MongoClient = require('mongodb').MongoClient;
var DB_CONN_STR = 'mongodb://localhost:27017/runoob';

var insertData = function(db, data, callback) {  
    //连接到表 site
    var collection = db.collection('site');
    data.create_time = Date.now();
    //插入数据
    collection.insert(data, function(err, result) { 
        if(err)
        {
            console.log('Error:'+ err);
            return;
        }     
        callback(result);
    });
};

var selectData = function(db, whereStr, callback) {  
  //连接到表  
  var collection = db.collection('site');
  //查询数据
  collection.find(whereStr).toArray(function(err, result) {
    if(err)
    {
      console.log('Error:'+ err);
      return;
    }     
    callback(result);
  });
};

var delData = function(db, whereStr, callback) {  
  //连接到表  
  var collection = db.collection('site');
  //删除数据
  collection.remove(whereStr, function(err, result) {
    if(err)
    {
      console.log('Error:'+ err);
      return;
    }     
    callback(result);
  });
};

var updateData = function(db, oldQuery, updateQuery, callback){
	//连接到表  
  	var collection = db.collection('site');

  	collection.update(oldQuery, updateQuery, function(err, result) {
        if(err)
        {
            console.log('Error:'+ err);
            return;
        }     
        callback(result);
    });
};
 
// 商品列表页
router.get('/', function(req, res, next) {
	MongoClient.connect(DB_CONN_STR, function(err, db) {
	    db.collection('site').find().sort({hot: -1, name: 1}).toArray(function(err, result){
	    	if(err){
	    		throw err;
	    	}
	    	res.render('lists', { title: '商品列表', type: 'goods', tr_list: result });
	    });
	});
});

// 新增商品页
router.get('/adds', function(req, res, next){
	res.render('adds', { title: '新增商品', type: 'goods'});
});

// 新增商品 - 提交表单接口
router.get('/adds/submit', function(req, res, next){
	MongoClient.connect(DB_CONN_STR, function(err, db) {
	    console.log("连接成功！");
	    insertData(db, req.query, function(result) {
	        // res.send({"status": 200, "message": "Success", "data":  result});
	        res.redirect('//localhost:3000/goods');
	        db.close();
	    });
	});
});

// 查询商品 - 接口
router.get('/search', function(req, res, next){
	if(req.query){
		var _query = req.query, 
			searchQuery = {};
		if(_query.name){
			searchQuery['name'] = new RegExp(_query.name);
			MongoClient.connect(DB_CONN_STR, function(err, db){
				selectData(db, searchQuery, function(result){
					// res.send(result);
					res.render('lists', { title: '商品列表', type: 'goods', searchValue: _query['name'], tr_list: result });
					db.close();
				});
			});
		}
	}
});

// 删除商品 - 接口
router.get('/delete', function(req, res, next){
	var delQuery = req.query;

	MongoClient.connect(DB_CONN_STR, function(err, db) {
		
		delData(db, delQuery, function(result) {
		    // res.send(result);
			// res.render('lists', { title: '商品列表', type: 'goods', tr_list: result });
			res.redirect('//localhost:3000/goods');
		    db.close();
		  });
	});
});

router.get('/update', function(req, res, next){
	var setQuery = req.query;
	if(setQuery.id){
		MongoClient.connect(DB_CONN_STR, function(err, db) {
	    	db.collection('site').findOne({_id: new ObjectID(setQuery.id)}, function(err, result) {
	    		res.render('update', {title: "商品修改", _data: result});
	    	});
	    });
	}
});

// 修改商品信息 - 接口
router.get('/update/submit', function(req, res, next){
	var updateQuery = req.query;
	MongoClient.connect(DB_CONN_STR, function(err, db){
		db.collection('site').findOne({_id: new ObjectID(updateQuery._id)}, function(err, _data) {
			var update_data = {};
			for( var _k in updateQuery){
				if('_id' != _k){
					update_data[_k] = updateQuery[_k];
				}
			}
			updateData(db, _data, update_data, function(result){
				// res.send(result);
				res.redirect('//localhost:3000/goods');
				db.close();
			})
		});
	});
});

module.exports = router;