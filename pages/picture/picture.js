const util = require('../../utils/util.js')
const app = getApp()

Page({
    data: {
        spiritList: [],
        spiritListOld: [],
        toolbar: {
            height: 50
        },
        sceneCanvas: {
            width: 100,
            height: 100,
        },
    },
    onLoad: function () {
        const screenWidth = app.jonGetSysinfo('screenWidth')
            , screenHeight = app.jonGetSysinfo('screenHeight')
            , pixelRatio = app.jonGetSysinfo('pixelRatio') || 2
            , picturePath = app.jonGetPicture()
            , sceneWidth = screenWidth
            , sceneHeight = screenHeight - this.data.toolbar.height;
        console.log(screenWidth, screenHeight, pixelRatio);
        this.setData({
            ['sceneCanvas.width']: sceneWidth * pixelRatio,
            ['sceneCanvas.height']: sceneHeight * pixelRatio,
        });
        this.pixelRatio = pixelRatio;
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        this.selectSpiritList = [];

        this.ctxSelect = wx.createCanvasContext('J_canvasSelect');
        this.ctxSelect.lineWidth = 2;
        this.ctxSelect.strokeStyle = "red";

        this.ctx = wx.createCanvasContext('J_canvasBg');
        this.ctx.drawImage(picturePath, 0, 0, sceneWidth, sceneHeight);
        this.ctx.draw();
    },
    onResize(res) {
        // 新的显示区域宽度
        const screenWidth = res.size.windowWidth
            // 新的显示区域高度
            , screenHeight = res.size.windowHeight
            , sceneWidth = screenWidth
            , sceneHeight = screenHeight - this.data.toolbar.height
            , picturePath = app.jonGetPicture()
            , pixelRatio = app.jonGetSysinfo('pixelRatio') || 2;
        this.setData({
            ['sceneCanvas.width']: sceneWidth * pixelRatio,
            ['sceneCanvas.height']: sceneHeight * pixelRatio,
        });
        this.ctx.drawImage(picturePath, 0, 0, sceneWidth, sceneHeight);
        this.ctx.draw();
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
        this.ctxSelect.lineWidth = 2;
        this.ctxSelect.globalAlpha = 1;
        this.ctxSelect.strokeStyle = "red";
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
                const spiritList = that.data.spiritList
                    , spiritListOld = that.data.spiritListOld
                    , id = spiritList.length + 1
                    , spirit = {
                        id: id,
                        path: res.tempFilePath,
                        x: that.screenPos.minX * that.pixelRatio,
                        y: (that.screenPos.minY + that.data.toolbar.height) * that.pixelRatio,
                        width: width * that.pixelRatio,
                        height: height * that.pixelRatio,
                        zIndex: 500 + id,
                    };
                spiritListOld.push(spirit);
                spiritList.push(Object.assign({
                    active: false,
                    scale: 1,
                    rotate: 0,
                    zIndex: 700 + id
                }, spirit));
                that.setData({
                    spiritList: spiritList,
                    spiritListOld: spiritListOld,
                });
                that.spiritSelectIndex = spiritList.length;
            }
        });

        // // 全局透明度
        // this.ctxSelect.globalAlpha = .6;
        // // 白色填充
        // this.ctxSelect.fillStyle = "white";
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
        // 清空
        this.ctxSelect.clearRect(0, 0, that.screenWidth, that.screenHeight);
        this.ctxSelect.draw();

    },
    jonSpiritTouchstart(e) {
        const index = (e.currentTarget.dataset.id || 0) - 1;
        if (index < 0) {
            return;
        }
        const that = this;
        that.spiritSelectIndex = index + 1;
        // if (e.touches.length < 2) {
            this.selectSpiritList[index] = {
                x: e.touches[0].pageX * that.pixelRatio,
                y: e.touches[0].pageY * that.pixelRatio,
            };
        // } else {
        //     this.spiritPoint = {
        //         x1: e.touches[0].pageX * that.pixelRatio,
        //         y1: e.touches[0].pageY * that.pixelRatio,
        //         x2: e.touches[1].pageX * that.pixelRatio,
        //         y2: e.touches[1].pageY * that.pixelRatio,
        //     };
        // }
        this.setData({
            [`spiritList[${index}].active`]: true
        });
    },
    jonSpiritTouchmove(e) {
        const index = (e.currentTarget.dataset.id || 0) - 1;
        if (index < 0) {
            return;
        }
        const that = this
            , touchX = e.touches[0].pageX * that.pixelRatio
            , touchY = e.touches[0].pageY * that.pixelRatio;
        // if (e.touches.length < 2 && that.spiritPoint.hasOwnProperty('x')) {
            // 移动
            const diffx = touchX - that.selectSpiritList[index].x
                , diffy = touchY - that.selectSpiritList[index].y
                , left = that.data.spiritList[index].x + diffx
                , top = that.data.spiritList[index].y + diffy;
            that.selectSpiritList[index] = {
                x: touchX,
                y: touchY,
            };
            that.setData({
                [`spiritList[${index}].x`]: left,
                [`spiritList[${index}].y`]: top,
            });
        // }  else if (e.touches.length > 1) {
        //     const preSpiritPoint = Object.assign({}, that.spiritPoint);
        //     that.spiritPoint = {
        //         x1: e.touches[0].pageX * that.pixelRatio,
        //         y1: e.touches[0].pageY * that.pixelRatio,
        //         x2: e.touches[1].pageX * that.pixelRatio,
        //         y2: e.touches[1].pageY * that.pixelRatio,
        //     };
        //     // 计算角度，旋转(优先)
        //     const perAngle = Math.atan((preSpiritPoint.y1 - preSpiritPoint.y2) / (preSpiritPoint.x1 - preSpiritPoint.x2)) * 180 / Math.PI;
        //     const curAngle = Math.atan((that.spiritPoint.y1 - that.spiritPoint.y2)/(that.spiritPoint.x1 - that.spiritPoint.x2))*180/Math.PI;
        //     if (Math.abs(perAngle - curAngle) > 1) {
        //         that.setData({
        //             [`spiritList[${index}].rotate`]: that.data.rotate + (curAngle - perAngle)
        //         })
        //     }else {
        //         // 计算距离，缩放
        //         const preDistance = Math.sqrt(Math.pow((preSpiritPoint.x1 - preSpiritPoint.x2), 2) + Math.pow((preSpiritPoint.y1 - preSpiritPoint.y2), 2));
        //         const curDistance = Math.sqrt(Math.pow((that.spiritPoint.x1 - that.spiritPoint.x2), 2) + Math.pow((that.spiritPoint.y1 - that.spiritPoint.y2), 2));
        //         that.setData({
        //             [`spiritList[${index}].scale`]: that.data.scale + (curDistance - preDistance) * 0.005
        //         })
        //     }
        // }
    },
    jonSpiritTouchend(e) {
        const index = (e.currentTarget.dataset.id || 0) - 1;
        if (index < 0) {
            return;
        }
        this.setData({
            [`spiritList[${index}].active`]: false
        });
    },
    jonScaleChange(e) {
        const spiritSelectIndex = (this.spiritSelectIndex || 0) - 1;
        let val = e.detail.value / 50;
        if (val < .4) {
            val = .4;
        }
        this.setData({
            [`spiritList[${spiritSelectIndex}].scale`]: val,
        });
    },
    jonRotateChange(e) {
        const spiritSelectIndex = (this.spiritSelectIndex || 0) - 1;
        const val = (e.detail.value - 50) * (180 / 50);
        this.setData({
            [`spiritList[${spiritSelectIndex}].rotate`]: val,
        });
    }
})
