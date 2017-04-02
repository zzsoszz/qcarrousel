(function($){


		  var defaultoptions={};
		  var plugname = "qcarrousel";
		  $.fn[plugname] = function() {
		    var isMethodCall = arguments.length > 0 && typeof arguments[0] === "string";
		    if (isMethodCall) {

		      var methodname = arguments[0];
		      var args = Array.prototype.slice.call(arguments, 1);
		      this.each(function() {
		        var instance = $.data(this, plugname);
		        if (instance && $.isFunction(instance[methodname])) {
		          var method = instance[methodname];
		          method.apply(instance, args);
		        }
		      });
		    } else {
		      var inputoptions = arguments;
		      $(this).each(
		        function() {
		          var optionsnew = $.extend({}, defaultoptions);
		          if (inputoptions.length > 0) {
		            optionsnew = $.extend(optionsnew, inputoptions[0]);
		          }
		          var instance = $(this).data(plugname);
		          if (instance) {
		            instance.init(optionsnew);
		          } else {
		            var target = $(this);
		            instance = new PluginObject(target);
		            instance.init(optionsnew);
		            $(this).data(plugname, instance);
		          }
		        }
		      );
		      return this;
		    };
		  }

		var startX, startY;

		function GetSlideAngle(dx, dy) {
		    return Math.atan2(dy, dx) * 180 / Math.PI;
		}
		 
		//根据起点和终点返回方向 1：向上，2：向下，3：向左，4：向右,0：未滑动
		function GetSlideDirection(startX, startY, endX, endY) {
		    var dy = startY - endY;
		    var dx = endX - startX;
		    var result = 0;
		 
		    //如果滑动距离太短
		    if (Math.abs(dx) < 2 && Math.abs(dy) < 2) {
		        return result;
		    }
		 
		    var angle = GetSlideAngle(dx, dy);
		    if (angle >= -45 && angle < 45) {
		        result = 4;
		    } else if (angle >= 45 && angle < 135) {
		        result = 1;
		    } else if (angle >= -135 && angle < -45) {
		        result = 2;
		    }
		    else if ((angle >= 135 && angle <= 180) || (angle >= -180 && angle < -135)) {
		        result = 3;
		    }
		 
		    return result;
		}

		function Pager(data,pagesize,infinite){
			var self=this;
			self.values;
			self.pagesize;
			self.pageData=[];
			self.currentPage;
			self.infinite=infinite;
			self.prev=function()
			{
				if(self.currentPage>1)
				{
					self.currentPage--;
				}
				else if(self.infinite && self.currentPage==1){
					 //如果是最后一页,移动到最后
					self.currentPage=self.totalPage;
				}
				return self;
			};
			self.next=function()
			{
				if(self.currentPage<self.totalPage)
				{
					 self.currentPage++;
				}
				else if(self.infinite && self.currentPage==self.totalPage)
				{
					 //如果是最后一页,移动到第一页
					 self.currentPage=1;
				}
				return self;
			};
			self.isHead=function()
			{
				return self.currentPage==1;
			};
			self.goHead=function()
			{
				if(self.havePage())
				{
					self.currentPage=1;
				}
			};
			self.goEnd=function()
			{
				if(self.havePage())
				{
					self.currentPage=self.totalPage;
				}
			};
			self.isEnd=function()
			{
				return self.currentPage==self.totalPage;
			};
			self.getCurrentPageData=function()
			{
				return self.pageData[self.currentPage-1]||[];
			};
			self.havePage=function(){
				return self.totalPage>0;
			};
			self.go=function(page){
				if(self.havePage())
				{
					if(page<1)
					{
						self.goHead();
					}else if(page>self.totalPage){
						self.goEnd();
					}
					self.currentPage=page;
				}
				return self;
			};
			self.init=function(data,pagesize){
				self.pagesize=pagesize;
				self.data=data;
				self.pageData=_.chunk(self.data,self.pagesize);
		  		self.totalPage=self.pageData.length;
		  		self.currentPage=self.havePage()?1:0;
			};
			self.init(data,pagesize);
		};

		 /*
		 *1.定时执行动画
		 *2.鼠标移动到dot上，清除定时器
		 *3.移动开添加定时器
		  */

		  function PluginObject(target) {
		  	var self=this;
		    self.curindex = 0;
		    self.preindex = 0;
		    self.items = [];
		    self.dots =[];
		    self.timeline;
		    self.speed=1;
		    var iterval;
		    self.showIndex=function(index)
		    {
		      var oldele=$(self.items.get(self.preindex)); 
			  var olddotele=$(self.dots.get(self.preindex));
			  olddotele.removeClass("active");
			  oldele.stop().animate({"opacity":"0"},500,function f()
			  {
			  		$(self.dots.get(index)).addClass("active");
		  	  		self.preindex=index;
			  });
			  $(self.items.get(index)).show().stop().animate({"opacity":"1"},500,function f2(){
			  		//setTimeout(self.start, 5000);
		  	  });
		    };
		    self.turnPage=function(pageIndex)
		    {
			   if(!self.timeline.isActive()){
				 	self.timeline.clear();
					var  curPageData=self.pager.getCurrentPageData();
				    var  nextPageData=self.pager.go(pageIndex).getCurrentPageData();
				    for(var i=0;i<curPageData.length;i++){
				    	self.timeline.add(TweenLite.to(curPageData[i],self.speed, {
					            opacity: 0,
					            zIndex:0
					    }), "0");
				    };
				    
				    for(var i=0;i<nextPageData.length;i++){
				    	self.timeline.add(TweenLite.to(nextPageData[i],self.speed, {
					            opacity: 1,
					            zIndex:1
					    }), "0");
				    };
				    self.dots.removeClass("active");
				    $(self.dots.get(pageIndex-1)).addClass("active");
				    self.timeline.play();
			   }
		    };
		    self.turnNext=function(){
				if(!self.timeline.isActive()){
					self.timeline.clear();
					var  curPageData=self.pager.getCurrentPageData();
				    var  nextPageData=self.pager.next().getCurrentPageData();

				    for(var i=0;i<curPageData.length;i++){
				    	self.timeline.add(TweenLite.to(curPageData[i],self.speed, {
					            opacity: 0,
					            zIndex:0
					    }), "0");
				    };
				    for(var i=0;i<nextPageData.length;i++){
				    	self.timeline.add(TweenLite.to(nextPageData[i],self.speed, {
					            opacity: 1,
					            zIndex:1
					    }), "0");
				    };
				    self.timeline.play();
			    }
		    };
		    self.turnPrev=function(){
				if(!self.timeline.isActive()){
					self.timeline.clear();

					//当前页面的往右移动
				    var  curPageData=self.pager.getCurrentPageData();

				    var  prevPageData=self.pager.prev().getCurrentPageData();
				    
				    for(var i=0;i<curPageData.length;i++){
				    	self.timeline.add(TweenLite.to(curPageData[i],self.speed, {
					           opacity: 0
					    }), "0");
				    };
				    //前一页的移动到可视区域
				    for(var i=0;i<prevPageData.length;i++){
				    	self.timeline.add(TweenLite.to(prevPageData[i],self.speed, {
					            x:1
					    }), "0");
				    };
				    self.timeline.play();
				    
			    }
		    };
		    self.startAutoRun=function()
		    {
		    	iterval=setInterval(self.next,2000);	
		    };
 			self.stopAutoRun=function()
		    {
		    	clearInterval(iterval);
		    };
		    self.init = function(options) {
		      
		      self.timeline = new TimelineMax({paused:true});
		      self.items = target.find(".item");
		      self.dots = target.find(".dot");
		      var pager=new Pager(self.items.toArray(),1,true);
		      self.pager=pager;
		      self.dots.on("click",function(event)
			      {
			      	 self.turnPage(self.dots.get().indexOf(event.target)+1);
			      }
		      );
		      // target.on("mouseenter",function(event)
		      // {
		      	 
		      // }).on("mouseleave",function(){
		      	 
		      // });
		    //   if(options.autoRun){
				  // target.on('touchstart', function (ev) {
					 //    startX = ev.originalEvent.touches[0].pageX;
					 //    startY = ev.originalEvent.touches[0].pageY;   

					 //    if(options.autoRun){
					 //   	 self.stopAutoRun();
						// }
				  // });
				  // target.on('touchend', function (ev) {
					 //    var endX, endY;
					 //    endX = ev.originalEvent.changedTouches[0].pageX;
					 //    endY = ev.originalEvent.changedTouches[0].pageY;
					 //    var direction = GetSlideDirection(startX, startY, endX, endY);
					 //    switch (direction) {
					 //        case 0:
					 //            //alert("没滑动");
					 //            break;
					 //        case 1:
					 //            //alert("向上");
					 //            break;
					 //        case 2:
					 //            //alert("向下");
					 //            break;
					 //        case 3:
					 //        	self.next();
					 //            break;
					 //        case 4:
					 //        	self.prev();
					 //            //alert("向右");
					 //            break;
					 //        default:            
					 //    }
					 //    if(options.autoRun){
					 //    	self.startAutoRun(); 
						// }
				  // });
				  // self.startAutoRun();
		    //   }
			  

		    }
		}
	

})(jQuery);
