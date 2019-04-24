window.onload=function(){
    /*初始化页面功能*/
    /*搜索*/
    search()
    /*轮播图*/
    banner()
    /*倒计时*/
    downTime()
}
var search=function(){
    /*
    1.页面初始化的时候 距离底部是0的距离的时候 透明度是0
        改变index.css中搜索框整体的背景色为rgba形式且透明度为0
    2.当页面滚动的时候 随着页面距离底部的距离变大 透明度变大
    3.当滚动的距离超过了轮播图的距离的时候 保持不变
     */
    /*获取dom元素*/
    var oSearch=document.querySelector('.jd_search_box')
    var oBanner=document.querySelector('.jd_banner')
    /*距离范围*/
    var height =oBanner.offsetHeight
    /*监听滚动事件*/
    window.onscroll=function(){
        /*当前页面滚动的距离*/
        var top=document.body.scrollTop ||document.documentElement.scrollTop;
        var opacity=0
        if(top > height){
            //3.当滚动的距离超过了轮播图的距离的时候 保持不变
            opacity=0.85
        }else{
            //2.当页面滚动的时候 随着页面距离底部的距离变大 透明度变大
            opacity=0.85*(top/height)
        }
        /*设置透明度给搜索盒子*/
        oSearch.style.background= 'rgba(216,80,92,'+opacity+')'
    }
}
var banner=function(){
    /*
    滑动效果分析：
    移动端依靠touch相关事件,根据触发位置的改变，改变对应元素的位移translate
    1.怎么监听到位置的改变？
    2.怎么获取当前的坐标
    3.计算位移再设置滑动
触摸点的集合：记录触摸点的
changedTouches
  记录当前页面最新改变的触摸点集合 整个事件都会有changedTouches记录
targetTouches
  记录当前元素上面的所有触摸点集合  touchend没有记录
touches
  记录页面上所有的触摸点集合       touchend没有记录

获取坐标：
基于当前视口触摸点的坐标：
clientX
clientY

基于当前页面触摸点的坐标
pageX
pageY

基于当前屏幕触摸点的坐标
screenX
screenY
     */
    /*
    轮播图需求分析：
    1.无缝滚动和无缝滑动(定时器 过渡位移)
    2.点盒子对应改变(改变当前样式)
    3.可以滑动(touch事件 监听触摸点坐标改变距离 位移)
    4.当滑动距离不够的时候 吸附回去(过渡位移)
    5.当滑动距离够了的时候 跳转(上一张/下一张)(判断方向 过渡位移)
    */
    /*获取需要操作的dom元素*/
        /*大容器*/
    var oBanner=document.querySelector('.jd_banner')
    var width=oBanner.offsetWidth  //轮播图的宽度
        /*图片容器*/
    var imageBox=oBanner.querySelector('ul:first-child')
        /*点容器*/
    var pointBox=oBanner.querySelector('ul:last-child')
        /*所有的点*/
    var points=pointBox.children;
    //提取几个公用的方法
        //加过渡
    var addTransition=function(){
        imageBox.style.transition='all 0.2s'
        imageBox.style.webkitTransition='all 0.2s'
    }
        //清过渡
    var removeTransition=function(){
        imageBox.style.transition='none'
        imageBox.style.webkitTransition='none'
    }
        //设置位移
    var setTransitionX=function(translateX){
        imageBox.style.transform='translateX('+translateX+'px)' //移当前屏幕的宽度=>轮播图的宽度
        imageBox.style.webkitTransition='translateX('+translateX+'px)' //移当前屏幕的宽度=>轮播图的宽度
    }
    /*1.无缝滚动和无缝滑动(定时器 过渡位移)*/
    var index=1; /*默认索引*/
    var timer=setInterval(function(){
        index++;
        /*过渡*/
        addTransition()
        /*位移*/
        setTransitionX(-index*width)
    },1000)
    /*怎么监听过渡结束这个时间点：过渡结束事件*/
    imageBox.addEventListener('transitionend',function(){
        //无缝滚动
        if(index>=9){
            /*瞬间定位到第一张*/
            index=1
                /*清除过渡*/
            removeTransition()
                /*再来定位*/
            setTransitionX(-index*width)
        }else if(index<=0){  //无缝滑动
            //瞬间定位到第八张
            index=8
            removeTransition()
            setTransitionX(-index*width)
        }
        /*正常 index取值范围只能在1-8，对应点的0-7*/
        setPoint()
    })
    /*2.点盒子对应改变(改变当前样式)*/
    var setPoint=function(){
        /*index:1-8*/
        /*去除所有的now样式*/
        for(var i=0;i<points.length;i++){
            points[i].classList.remove('now')
        }
        /*给对应的加上*/
        points[index-1].classList.add('now')
    }
    /*3.可以滑动(touch事件 监听触摸点坐标改变距离 位移)*/
    var startX=0 /*记录开始的x坐标*/
    var distanceX=0 /*记录坐标轴的改变的*/
    //严谨判断
    var isMove=false;
    imageBox.addEventListener('touchstart',function(e){
        //清除定时器
        clearInterval(timer)
        //记录开始的位置
        startX=e.touches[0].clientX
    })
    imageBox.addEventListener('touchmove',function(e){
        var moveX=e.touches[0].clientX
        distanceX=moveX-startX
        //distanceX大于0的时候是向右滑动;小于0的时候是向左滑动
        /*滑动*/
            //基于当前的位置
        //计算将要去做定位
        tanslateX=-index*width+distanceX
        //清除过渡
        removeTransition()
        //做定位
        setTransitionX(tanslateX)
        isMove=true
    })
    imageBox.addEventListener('touchend',function(e){
        /*滑动事件结束之后判断当前滑动的距离*/
        /*有一个范围：如果大于三分之一切换图片，反之吸附回去(定位回去)*/
        if(isMove){
            if(Math.abs(distanceX)<width/3){ //4.当滑动距离不够的时候 吸附回去(过渡位移)
                //过渡效果
                addTransition()
                //位移
                setTransitionX(-index*width)
            }else{  //5.当滑动距离够了的时候 跳转(上一张/下一张)(判断方向 过渡位移)
                if(distanceX>0){
                    //说明是向右滑,切换到上一张
                    index--;
                }else{
                    //说明是向左滑，切换到下一张
                    index++;
                }
                //index自增1或者自减1后，都要做同样的一件事：
                    //加过渡
                addTransition()
                    //位移
                setTransitionX(-index*width)
            }
        }
        /*滑动效果结束之后，加上定时器重新实现自动轮播*/
        clearInterval(timer) //严谨做法，保证只加一次
        timer=setInterval(function(){
            index++;
            /*过渡*/
            addTransition()
            /*位移*/
            setTransitionX(-index*width)
        },1000)
        //加上定时器之后，还要重置全局参数
        startX=0;
        distanceX=0;
        isMove=false
    })
}
var downTime=function(){
    /*
    1.模拟倒计时的时间 是11个小时
    2.利用定时器 1秒一次 重新展示时间
     */
    var time=60*60*11
    var skTime=document.querySelector('.sk_time')
    var spans=skTime.querySelectorAll('span')
    var timer=setInterval(function(){
        time--;
        /*格式化时间*/
        var h=Math.floor(time/3600)
        var m=Math.floor(time%3600/60)
        var s=time%60
        /*设置时间*/
        spans[0].innerHTML=Math.floor(h/10)
        spans[1].innerHTML=h%10

        spans[3].innerHTML=Math.floor(m/10)
        spans[4].innerHTML=m%10

        spans[6].innerHTML=Math.floor(s/10)
        spans[7].innerHTML=s%10
        if(time<=0){
            clearInterval(timer)
        }
    },1000)
}