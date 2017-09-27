/**
 * Created by clearboy on 2017/9/22.
 */
var utils = (function () {
    var flag = "getComputedStyle" in window;

    function listToArray(similarArray) {
        if (flag) {
            return Array.prototype.slice.call(similarArray);
        }
        var ary = [];
        for (var i = 0; i < similarArray.length; i++) {
            ary[ary.length] = similarArray[i];
        }
        return ary;
    }

    function jsonParse(jsonStr) {
        return 'JSON' in window ? JSON.parse(jsonStr) : eval("(" + jsonStr + ")");
    }

    function offset(ele) {
        var eleLeft = ele.offsetLeft;
        var eleTop = ele.offsetTop;
        var eleParent = ele.offsetParent;
        var left = null;
        var top = null;
        left += eleLeft;
        top += eleTop;
        while (eleParent) {
            //console.log(eleParent);
            /*
             *  ps: ie8中会有一个问题如果在ie8中就不加父级的边框了。因为已经加过了。
             *  判断我的当前浏览器是不是ie8   1 可以用正则 test MSIE 8.0   2 字符串
             *  中的indexOf MSIE 8.0 判断 -1. window.navigator.userAgent
             * */
            if (window.navigator.userAgent.indexOf('MSIE 8.0') !== -1) { //ie8
                left += eleParent.offsetLeft;
                top += eleParent.offsetTop;
            } else {
                left += eleParent.clientLeft + eleParent.offsetLeft;
                top += eleParent.clientTop + eleParent.offsetTop;
            }
            eleParent = eleParent.offsetParent;
        }
        return {left: left, top: top};
    }

    function getWin(attr, val) { //一个参数的时候是读取，两个参数可以赋值
        if (val !== undefined) {
            document.documentElement[attr] = val;
            document.body[attr] = val;
        }
        return document.documentElement[attr] || document.body[attr];
    }

    function getCss(curEle, attr) {
        //
        var reg = /^(-?\d+(\.\d+)?)(?:px|em|pt|deg|rem)$/;
        var val = null;
        if (!flag) {
            //这里处理filter的滤镜问题  alpha(opacity=40);
            if (attr === 'opacity') {
                //alpha(opacity=40)
                val = curEle.currentStyle['filter'];
                var reg1 = /^alpha\(opacity=(\d+(\.\d+)?)\)/;
                return reg1.test(val) ? RegExp.$1 / 100 : 1;
            }
            val = curEle.currentStyle[attr];
        } else {
            val = attr === 'opacity' ? window.getComputedStyle(curEle, null)[attr] / 1 : window.getComputedStyle(curEle, null)[attr];
        }
        return reg.test(val) ? parseFloat(val) : val; //如果正则验证通过，说明返回值是带单位的，那么我们就要人为去掉这个单位。否则不变
    }

    function children(curEle, tagName) {
        var ary = [];
        if (!flag) {
            var childsNode = curEle.childNodes;
            for (var i = 0; i < childsNode.length; i++) {
                var curEleNode = childsNode[i];
                curEleNode.nodeType === 1 ? ary[ary.length] = curEleNode : null;
            }
            childsNode = null;
        } else {
            ary = Array.prototype.slice.call(curEle.children);
        }
        if (typeof tagName === "string") {
            for (var k = 0; k < ary.length; k++) {
                var curEle = ary[k];
                if (curEle.nodeName.toLowerCase() !== tagName.toLowerCase()) {
                    ary.splice(k, 1);
                    k--;
                }
            }
        }
        return ary;
    }

    function prev(curEle) {
        if (flag) {
            return curEle.previousElementSibling;
        } else {
            var pre = curEle.previousSibling;
            while (pre && pre.nodeType != 1) {
                pre = pre.previousSibling;
            }
            return pre;
        }
    }

    function next(curEle) {
        if (flag) {
            return curEle.nextElementSibling;
        } else {
            var nex = curEle.nextSibling;
            while (nex && nex.nodeType !== 1) {
                nex = nex.nextSibling;
            }
            return nex;
        }
    }

    function prevAll(curEle) {
        var ary = [];
        var pre = this.prev(curEle);
        while (pre) {
            ary.unshift(pre);
            pre = this.prev(pre);
        }
        return ary;
    }

    function nextAll(curEle) {
        var ary = [];
        var nex = this.next(curEle);
        while (nex) {
            ary.push(nex);
            nex = this.next(nex);
        }
        return ary;
    }

    function sibling(curEle) {
        var pre = this.prev(curEle);
        var nex = this.next(curEle);
        var ary = [];
        pre ? ary.push(pre) : null;
        nex ? ary.push(nex) : null;
        return ary;
    }

    function siblings(curEle) {
        return this.prevAll(curEle).concat(this.nextAll(curEle));
    }

    function index(curEle) {
        return this.prevAll(curEle).length;
    }

    function firstChild(curEle) {
        var chs = this.children(curEle);
        return chs.length > 0 ? chs[0] : null;
    }

    function lastChild(curEle) {
        var chs = this.children(curEle);
        return chs.length > 0 ? chs[chs.length - 1] : null;
    }

    function append(newEle, container) {
        return container.appendChild(newEle);
    }

    // 容器前面增加元素
    function prepend(newEle, container) {
        var fir = this.firstChild(container);
        if (fir) {
            container.insertBefore(newEle, fir);
            return;
        }
        container.appendChild(newEle);
    }

    function insertBefore(newEle, oldEle) {
        return oldEle.parentNode.insertBefore(newEle, oldEle);
    }

    function insertAfter(newEle, oldEle) {
        var nex = this.next(oldEle);
        if (nex) {
            oldEle.parentNode.insertBefore(newEle, nex);
            return;
        }
        oldEle.parentNode.appendChild(newEle);
    }

    function hasClass(curEle, className) {
        var reg = new RegExp("(^| +)" + className + "( +|$)");
        return reg.test(curEle.className);
    }

    function addClass(cuEle, className) {
        var ary = className.replace(/(^ +| +$)/g, "").split(/ +/g);
        for (var i = 0; i < ary.length; i++) {
            var curName = ary[i];
            if (!this.hasClass(cuEle, curName)) {
                cuEle.className += " " + curName;
            }
        }
    }

    function removeClass(cuEle, className) {
        var ary = className.replace(/(^ +| +$)/g, "").split(/ +/g);
        for (var i = 0; i < ary.length; i++) {
            var curName = ary[i];
            if (this.hasClass(cuEle, curName)) {
                var reg = new RegExp("(^| +)" + curName + "( +|$)", "g");
                cuEle.className = cuEle.className.replace(reg, " ");
            }
        }
    }

    function getElementsByClassName(strclass, context) {
        context = context || document;
        if (flag) {
            return this.listToArray(context.getElementsByClassName(strclass));
        }
        var strClassAry = strclass.replace(/(^ +)|( +$)/g, "").split(/ +/g);
        var ary = [];
        var NodeList = context.getElementsByTagName("*");
        for (var i = 0; i < NodeList.length; i++) {
            var curNode = NodeList[i];
            var isFine = true;
            for (var k = 0; k < strClassAry.length; k++) {
                var reg = new RegExp("(^| +)" + strClassAry[k] + "( +|$)");
                if (!reg.test(curNode.className)) {
                    isFine = false;
                    break;
                }
            }
            if (isFine) {
                ary.push(curNode);
            }
        }
        return ary;
    }

    function setCss(curEle, attr, value) {
        if (attr === "float") {
            curEle["style"]["cssFloat"] = value;
            curEle["style"]["styleFloat"] = value;
            return;
        }
        if (attr === "opacity") {
            curEle["style"]["opacity"] = value;
            curEle["style"]["filter"] = "alpha(opacity=" + value * 100 + ")";
            return;
        }
        var reg = /^(width|height|top|bottom|left|right|((margin|padding)(Top|Bottom|Left|Right)?))$/;
        if (reg.test(attr)) {
            if (!isNaN(value)) {
                value += "px";
            }
        }
        curEle["style"][attr] = value;
    }

    function setGroupCss(curEle, options) {
        if (Object.prototype.toString.call(options) !== "[object Object]") {
            return;
        }
        for (var key in options) {
            if (options.hasOwnProperty(key)) {
                this.setCss(curEle, key, options[key]);
            }
        }
    }

    function css(curEle) {
        var argTwo = arguments[1];
        if (typeof argTwo === "string") {
            if (!arguments[2]) {
                return this.getCss.apply(this, arguments);
            }
            this.setCss.apply(this, arguments);
            return;
        }
        argTwo = argTwo || 0;
        if (argTwo.toString() === "[object Object]") {
            this.setGroupCss.apply(this, arguments);
        }

    }

    return {
        listToArray: listToArray,
        jsonParse: jsonParse,
        offset: offset,
        getWin: getWin,
        children: children,
        prev: prev,
        next: next,
        prevAll: prevAll,
        nextAll: nextAll,
        sibling: sibling,
        siblings: siblings,
        index: index,
        firstChild: firstChild,
        lastChild: lastChild,
        append: append,
        prepend: prepend,
        insertBefore: insertBefore,
        insertAfter: insertAfter,
        hasClass: hasClass,
        addClass: addClass,
        removeClass: removeClass,
        getElementsByClassName: getElementsByClassName,
        getCss: getCss,
        setCss: setCss,
        setGroupCss: setGroupCss,
        css: css
    }
})();

