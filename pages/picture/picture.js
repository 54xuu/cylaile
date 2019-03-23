const util = require('../../utils/util.js')
const app = getApp()

Page({
    data: {},
    onLoad: function () {
        const screenWidth = app.jonGetSysinfo('screenWidth')
            , screenHeight = app.jonGetSysinfo('screenHeight')
            , picturePath = app.jonGetPicture();
        this.ctxSelect = wx.createCanvasContext('J_canvasSelect');
        this.ctxSelect.strokeStyle = "#ff2121";
        this.ctxSelect.lineWidth = 2;

        this.ctx = wx.createCanvasContext('J_canvasBg');
        this.ctx.drawImage(picturePath, 0, 0, screenWidth, screenHeight);
        this.ctx.draw();
    },
    onShow: function () {
    },

    jonTouchstart(e) {
        this.lastPos = {
            x: e.touches[0].x,
            y: e.touches[0].y
        };
    },
    jonTouchmove(e) {
        this.currentPos = {
            x: e.touches[0].x,
            y: e.touches[0].y
        };
        this.lastPos = this.currentPos;
    },
    jonTouchend(e) {
    },
})
