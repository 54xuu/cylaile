const util = require('../../utils/util.js')
const app = getApp()

Page({
    data: {},
    onLoad: function () {
        const screenWidth = app.jonGetSysinfo('screenWidth')
            , screenHeight = app.jonGetSysinfo('screenHeight')
            , picturePath = app.jonGetPicture();
        this.ctxSelect = wx.createCanvasContext('J_canvasSelect');
        this.ctxSelect.strokeStyle = "red";
        this.ctxSelect.fillStyle = "white";
        this.ctxSelect.lineWidth = 2;
        this.ctxSelect.save();

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
        this.screenPos = {
            minX: this.lastPos.x,
            minY: this.lastPos.y,
            maxX: this.lastPos.x,
            maxY: this.lastPos.y,
        };
    },
    jonTouchmove(e) {
        this.currentPos = {
            x: e.touches[0].x,
            y: e.touches[0].y
        };
        if (this.currentPos.x < this.screenPos.minX) {
            this.screenPos.minX = this.currentPos.x;
        } else if (this.currentPos.x > this.screenPos.maxX) {
            this.screenPos.maxX = this.currentPos.x;
        }
        if (this.currentPos.y < this.screenPos.minY) {
            this.screenPos.minY = this.currentPos.y;
        } else if (this.currentPos.y > this.screenPos.maxY) {
            this.screenPos.maxY = this.currentPos.y;
        }
        this.ctxSelect.moveTo(this.lastPos.x, this.lastPos.y);
        this.ctxSelect.lineTo(this.currentPos.x, this.currentPos.y);
        this.ctxSelect.stroke();
        this.ctxSelect.draw(true);
        this.lastPos = this.currentPos;
    },
    jonTouchend(e) {
        console.log(this.screenPos);
        const width = this.screenPos.maxX - this.screenPos.minX;
        const height = this.screenPos.maxY - this.screenPos.minY;
        this.ctxSelect.restore();
        this.ctxSelect.globalAlpha = .5;
        // this.ctxSelect.shadowOffsetX = 5;
        // this.ctxSelect.shadowOffsetY = 5;
        // this.ctxSelect.shadowBlur = 5;
        // this.ctxSelect.shadowColor = 'rgba(0, 0, 0, 199)';
        this.ctxSelect.fillRect(this.screenPos.minX, this.screenPos.minY, width, height);
        this.ctxSelect.moveTo(this.screenPos.minX, this.screenPos.minY);
        this.ctxSelect.lineTo(this.screenPos.minX, this.screenPos.maxY);
        this.ctxSelect.lineTo(this.screenPos.maxX, this.screenPos.maxY);
        this.ctxSelect.lineTo(this.screenPos.maxX, this.screenPos.minY);
        this.ctxSelect.lineTo(this.screenPos.minX, this.screenPos.minY);
        this.ctxSelect.stroke();
        this.ctxSelect.draw();
    },
})
