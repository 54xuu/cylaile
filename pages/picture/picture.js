const util = require('../../utils/util.js')
const app = getApp()

Page({
    data: {
        sceneList: [],
    },
    onLoad: function () {
        const screenWidth = app.jonGetSysinfo('screenWidth')
            , screenHeight = app.jonGetSysinfo('screenHeight')
            , pixelRatio = app.jonGetSysinfo('pixelRatio') || 2
            , picturePath = app.jonGetPicture();
        console.log(screenWidth, screenHeight, pixelRatio);
        this.pixelRatio = pixelRatio;

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
        const that = this
            , width = this.screenPos.maxX - this.screenPos.minX
            , height = this.screenPos.maxY - this.screenPos.minY;
        wx.canvasToTempFilePath({
            x: that.screenPos.minX,
            y: that.screenPos.minY,
            width: width, height: height,
            destWidth: width, destHeight: height,
            canvasId: 'J_canvasBg',
            success(res) {
                console.log(res.tempFilePath);
                const sceneList = that.data.sceneList
                    , id = sceneList.length + 1;
                sceneList.push({
                    id: id,
                    path: res.tempFilePath,
                    x: that.screenPos.minX * that.pixelRatio,
                    y: that.screenPos.minY * that.pixelRatio,
                    width: width * that.pixelRatio,
                    height: height * that.pixelRatio,
                    zIndex: 900 + id
                });
                that.setData({
                    sceneList: sceneList
                });
            }
        });

        // this.ctxSelect.restore();
        // // 全局透明度
        // this.ctxSelect.globalAlpha = .5;
        // // 阴影
        // this.ctxSelect.shadowOffsetX = 5;
        // this.ctxSelect.shadowOffsetY = 5;
        // this.ctxSelect.shadowBlur = 5;
        // this.ctxSelect.shadowColor = 'rgba(0, 0, 0, 199)';
        // // 画矩形
        // this.ctxSelect.fillRect(this.screenPos.minX, this.screenPos.minY, width, height);
        // // 画边框线
        // this.ctxSelect.moveTo(this.screenPos.minX, this.screenPos.minY);
        // this.ctxSelect.lineTo(this.screenPos.minX, this.screenPos.maxY);
        // this.ctxSelect.lineTo(this.screenPos.maxX, this.screenPos.maxY);
        // this.ctxSelect.lineTo(this.screenPos.maxX, this.screenPos.minY);
        // this.ctxSelect.lineTo(this.screenPos.minX, this.screenPos.minY);
        // this.ctxSelect.stroke();
        // this.ctxSelect.draw();
    },
})
