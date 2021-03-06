/*  @preserve
 *  Project: jQuery plugin Watermark
 *  Description: Add watermark on images use HTML5 and Javascript.
 *  Author: Zzbaivong (devs.forumvi.com)
 *  Version: 0.2
 *  License: MIT
 */

/*
 *  jquery-boilerplate - v3.4.0
 *  A jump-start for jQuery plugins development.
 *  http://jqueryboilerplate.com
 *
 *  Made by Zeno Rocha
 *  Under MIT License
 */
;(function ($, window, document, undefined) {

    'use strict';

    var pluginName = 'watermark',
        defaults = {
            path: 'watermark.png',

            text: '',
            textWidth: 130,
            textSize: 13,
            textColor: 'white',
            textBg: 'rgba(0, 0, 0, 0.4)',

            gravity: 'se', // nw | n | ne | w | e | sw | s | se
            opacity: 0.7,
            margin: 10,

            outputWidth: 'auto',
            outputHeight: 'auto',
            outputType: 'jpeg', // jpeg | png | webp

            done: function (imgURL) {
                this.src = imgURL;
            },
            fail: function ( /*imgURL*/ ) {
                // console.error(imgURL, 'image error!');
            },
            always: function ( /*imgURL*/ ) {
                // console.log(imgURL, 'image URL!');
            }
        };

    function Plugin(element, options) {
        this.element = element;
        this.settings = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    $.extend(Plugin.prototype, {
        init: function () {
            

            var _this = this,
                ele = _this.element,
                set = _this.settings,

                wmData = {
                    imgurl: set.path,
                    type: 'png',
                    cross: true
                },

                imageData = {
                    imgurl: ele.src,
                    cross: true,
                    type: set.outputType,
                    width: set.outputWidth,
                    height: set.outputHeight
                };

            // Watermark dạng base64
            if (set.path.search(/data:image\/(png|jpg|jpeg|gif);base64,/) === 0) {
                wmData.cross = false;
            }

            // Ảnh đang duyệt dạng base64
            if (ele.src.search(/data:image\/(png|jpg|jpeg|gif);base64,/) === 0) {
                imageData.cross = false;
            }

            var defer = $.Deferred();

            $.when(defer).done(function (imgObj) {
                imageData.wmObj = imgObj;
                imageData.imgurl = ele.src;
                //console.log("EN EL WHEN:", imageData);
                _this.imgurltodata(imageData, function (dataURL) {
                    //console.log("DATAURL EN WHEN", dataURL);
                    set.done.call(ele, dataURL);
                    set.always.call(ele, dataURL);
                });
            });
            if (set.text !== '') {
                console.log("wmData ANTES textwater:", wmData);
                wmData.imgurl = _this.textwatermark();
                console.log("wmData tras textwater:", wmData);
                wmData.cross = false;
            }
            
            _this.imgurltodata(wmData, function (imgObj) {
                //console.log("imbObj en IMGURLTODATA:",imgObj);
                defer.resolve(imgObj);
            });
        },

        /**
         * Chuyển text sang ảnh để làm watermark
         * @returns {String} URL ảnh dạng base64
         */
        textwatermark: function () {
            var _this = this,
                set = _this.settings,

                canvas = document.createElement('CANVAS'),
                ctx = canvas.getContext('2d'),

                w = set.textWidth,
                h = set.textSize + 8;

            canvas.width = w;
            canvas.height = h;

            ctx.fillStyle = set.textBg;
            ctx.fillRect(0, 0, w, h);

            ctx.fillStyle = set.textColor;
            ctx.textAlign = 'center';
            ctx.font = '500 ' + set.textSize + 'px Sans-serif';

            ctx.fillText(set.text, (w / 2), (set.textSize + 2));

            return canvas.toDataURL();
        },

        /**
         * Chuyển ảnh sang dạng base64
         * @param   {Object}  data     Các thông số thiết lập để phân biệt loại ảnh và với watermark
         * @param   {String}  callback URL ảnh dạng base64
         */
        imgurltodata: function (data, callback) {

            var _this = this,
                set = _this.settings,
                ele = _this.element;

            var img = new Image();

            if (data.cross) {
                img.crossOrigin = 'Anonymous';
            }

            img.onload = function () {
                var canvas = document.createElement('CANVAS');
                var ctx = canvas.getContext('2d');

                var w = this.width, // image height
                    h = this.height, // image width
                    ctxH;

                if (data.wmObj) {

                    if (data.width !== 'auto' && data.height === 'auto' && data.width < w) {
                        h = h / w * data.width;
                        w = data.width;
                    } else if (data.width === 'auto' && data.height !== 'auto' && data.height < h) {
                        w = w / h * data.height;
                        h = data.height;
                    } else if (data.width !== 'auto' && data.height !== 'auto' && data.width < w && data.height < h) {
                        w = data.width;
                        h = data.height;
                    }

                }

                // Xoay dọc watermark sử dụng text, khi ở vị trí giữa mép dọc
                if ((set.gravity === 'w' || set.gravity === 'e') && !data.wmObj) {
                    canvas.width = h;
                    canvas.height = w;
                    ctxH = -h;
                    ctx.rotate(90 * Math.PI / 180);
                } else {
                    canvas.width = w;
                    canvas.height = h;
                    ctxH = 0;
                }

                // Tô nền trắng cho ảnh xuất ra dạng jpeg
                if (data.type === 'jpeg') {
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, w, h);
                }

                ctx.drawImage(this, 0, ctxH, w, h);

                // Xử lý watermark được chèn vào
                if (data.wmObj) {

                    // Độ trong suốt
                    var op = set.opacity;
                    if (op > 0 && op < 1) {
                        ctx.globalAlpha = set.opacity;
                    }

                    // Vị trí chèn, gọi theo hướng trên bản đồ
                    var wmW = data.wmObj.width,
                        wmH = data.wmObj.height,
                        pos = set.margin,
                        gLeft, gTop;

                    switch (set.gravity) { // nw | n | ne | w | e | sw | s | se
                        case 'nw': // Tây bắc
                            gLeft = pos;
                            gTop = pos;
                            break;
                        case 'n': // Bắc
                            gLeft = w / 2 - wmW / 2;
                            gTop = pos;
                            break;
                        case 'ne': // Đông Bắc
                            gLeft = w - wmW - pos;
                            gTop = pos;
                            break;
                        case 'w': // Tây
                            gLeft = pos;
                            gTop = h / 2 - wmH / 2;
                            break;
                        case 'e': // Đông
                            gLeft = w - wmW - pos;
                            gTop = h / 2 - wmH / 2;
                            break;
                        case 'sw': // Tây Nam
                            gLeft = pos;
                            gTop = h - wmH - pos;
                            break;
                        case 's': // Nam
                            gLeft = w / 2 - wmW / 2;
                            gTop = h - wmH - pos;
                            break;
                        default: // Đông Nam
                            gLeft = w - wmW - pos;
                            gTop = h - wmH - pos;
                    }
                    ctx.drawImage(data.wmObj, gLeft, gTop, wmW, wmH);
                }

                // Xuất ra url ảnh dạng base64
                var dataURL = canvas.toDataURL('image/' + data.type);
                //console.log("DATAURL EN FUNCIONTO IMGTOURL", dataURL);
                if (typeof callback === 'function') {

                    if (data.wmObj) { // Đã có watermark
                        //console.log("callbacl con dataURL:", dataURL);
                        callback(dataURL);

                    } else { // watermark
                        var wmNew = new Image();
                        wmNew.src =dataURL;                        
                        //console.log("Asignando dataURL y wmNew queda:", wmNew);
                        callback(wmNew);                        
                    }
                }

                canvas = null;
            };

            // Xử lý ảnh tải lỗi hoặc có thể do từ chối CORS headers
            img.onerror = function () {
                set.fail.call(this, this.src);
                set.always.call(ele, this.src);
                return false;
            }; 
            /*if (data.wmObj) {
                img.src =data.wmObj.src;
            }
            else  {
                img.src = data.imgurl;
            }*/
            img.src = data.imgurl;
            //console.log("IMG:", img);
        }
    });

    $.fn[pluginName] = function (options) {        
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, new Plugin(this, options));
            }
        });
    };

}(jQuery, window, document));
