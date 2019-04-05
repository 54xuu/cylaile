const util = require('../../utils/util.js');
const app = getApp();

/**
 * 追加精灵
 * @param res 图片数据对象
 * @param isCySpirit 是否是选择CY精灵
 */
const spiritAppendFun = function (res, isCySpirit = false) {
    const spiritList = this.data.spiritList
        , spiritListOld = this.data.spiritListOld
        , id = spiritList.length + 1
        , spirit = {
            id: id,
            path: res.tempFilePath,
            x: isCySpirit ? this.screenWidth * 0.5 : this.screenPos.minX * this.pixelRatio,
            y: isCySpirit ? this.screenHeight * 0.5 : (this.screenPos.minY + this.data.toolbar.height) * this.pixelRatio,
            width: isCySpirit ? 100 : (this.screenPos.maxX - this.screenPos.minX) * this.pixelRatio,
            height: isCySpirit ? 100 : (this.screenPos.maxY - this.screenPos.minY) * this.pixelRatio,
            zIndex: 500 + id,
            isCySpirit: isCySpirit
        };
    spiritListOld.push(spirit);
    if (this.spiritSelectIndex > 0) {
        spiritList[this.spiritSelectIndex - 1].active = false;
    }
    spiritList.push(Object.assign({
        active: true,
        scale: 1,
        rotate: 0,
        zIndex: 700 + id
    }, spirit));
    this.setData({
        spiritList: spiritList,
        spiritListOld: spiritListOld,
    });
    this.spiritSelectIndex = spiritList.length;
};

Page({
    data: {
        // 精灵集合
        spiritList: [],
        // 历史精灵集合（用做切图白色背景）
        spiritListOld: [],
        // 缩放/选择 工具条
        toolbar: {
            height: 40,
            defaultValue: 50
        },
        // 场景Canvas
        sceneCanvas: {
            width: 100,
            height: 100,
        },
        // cy精灵是否异常
        cySpiritHide: true,
        // cy精灵集合
        cySpiritList: [{
            id: 1,
            tempFilePath: '/assets/images/spirit_1.jpg'
        }, {
            id: 2,
            tempFilePath: '/assets/images/spirit_2.jpg'
        }, {
            id: 3,
            tempFilePath: '/assets/images/spirit_3.png'
        }]
    },
    onLoad: function () {
        const screenWidth = app.jonGetSysinfo('screenWidth')
            , screenHeight = app.jonGetSysinfo('screenHeight')
            , pixelRatio = 1
            , selectImage = app.jonGetPicture()
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
        this.spiritSelectIndex = 0;
        this.selectSpiritList = [];

        this.ctxSelect = wx.createCanvasContext('J_canvasSelect');
        this.ctxSelect.lineWidth = 2;
        this.ctxSelect.strokeStyle = "red";

        this.ctx = wx.createCanvasContext('J_canvasBg');
        if (selectImage) {
            this.ctx.drawImage(selectImage.path, 0, 0, screenWidth, screenWidth / selectImage.width * selectImage.height);
        }
        this.ctx.draw();
    },
    onResize(res) {
        // 新的显示区域宽度
        const screenWidth = res.size.windowWidth
            // 新的显示区域高度
            , screenHeight = res.size.windowHeight
            , isPortrait = screenWidth < screenHeight
            , sceneWidth = screenWidth
            , sceneHeight = screenHeight - this.data.toolbar.height
            , selectImage = app.jonGetPicture()
            , pixelRatio = 1;
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        this.setData({
            ['sceneCanvas.width']: sceneWidth * pixelRatio,
            ['sceneCanvas.height']: sceneHeight * pixelRatio,
        });
        this.ctx.drawImage(selectImage.path,
            0, isPortrait ? 0 : this.data.toolbar.height * 2,
            selectImage.width, selectImage.height,
            0, 0,
            screenWidth, isPortrait ? screenWidth / selectImage.width * selectImage.height
                : screenHeight);
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
            x: this.screenPos.minX,
            y: this.screenPos.minY,
            width: width, height: height,
            destWidth: width, destHeight: height,
            canvasId: 'J_canvasBg',
            success(res) {
                spiritAppendFun.call(that, res);
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
        this.ctxSelect.clearRect(0, 0, this.screenWidth, this.screenHeight);
        this.ctxSelect.draw();

    },
    jonSpiritTouchstart(e) {
        const index = (e.currentTarget.dataset.id || 0) - 1;
        if (index < 0) {
            return;
        }
        const that = this;
        if (this.spiritSelectIndex > 0) {
            this.setData({
                [`spiritList[${this.spiritSelectIndex - 1}].active`]: false
            });
        }
        this.spiritSelectIndex = index + 1;
        // if (e.touches.length < 2) {
        this.selectSpiritList[index] = {
            x: e.touches[0].pageX * this.pixelRatio,
            y: e.touches[0].pageY * this.pixelRatio,
        };
        // } else {
        //     this.spiritPoint = {
        //         x1: e.touches[0].pageX * this.pixelRatio,
        //         y1: e.touches[0].pageY * this.pixelRatio,
        //         x2: e.touches[1].pageX * this.pixelRatio,
        //         y2: e.touches[1].pageY * this.pixelRatio,
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
            , touchX = e.touches[0].pageX * this.pixelRatio
            , touchY = e.touches[0].pageY * this.pixelRatio;
        // if (e.touches.length < 2 && this.spiritPoint.hasOwnProperty('x')) {
        // 移动
        const diffx = touchX - this.selectSpiritList[index].x
            , diffy = touchY - this.selectSpiritList[index].y
            , left = this.data.spiritList[index].x + diffx
            , top = this.data.spiritList[index].y + diffy;
        this.selectSpiritList[index] = {
            x: touchX,
            y: touchY,
        };
        this.setData({
            [`spiritList[${index}].x`]: left,
            [`spiritList[${index}].y`]: top,
        });
        // }  else if (e.touches.length > 1) {
        //     const preSpiritPoint = Object.assign({}, this.spiritPoint);
        //     this.spiritPoint = {
        //         x1: e.touches[0].pageX * this.pixelRatio,
        //         y1: e.touches[0].pageY * this.pixelRatio,
        //         x2: e.touches[1].pageX * this.pixelRatio,
        //         y2: e.touches[1].pageY * this.pixelRatio,
        //     };
        //     // 计算角度，旋转(优先)
        //     const perAngle = Math.atan((preSpiritPoint.y1 - preSpiritPoint.y2) / (preSpiritPoint.x1 - preSpiritPoint.x2)) * 180 / Math.PI;
        //     const curAngle = Math.atan((this.spiritPoint.y1 - this.spiritPoint.y2)/(this.spiritPoint.x1 - this.spiritPoint.x2))*180/Math.PI;
        //     if (Math.abs(perAngle - curAngle) > 1) {
        //         this.setData({
        //             [`spiritList[${index}].rotate`]: this.data.rotate + (curAngle - perAngle)
        //         })
        //     }else {
        //         // 计算距离，缩放
        //         const preDistance = Math.sqrt(Math.pow((preSpiritPoint.x1 - preSpiritPoint.x2), 2) + Math.pow((preSpiritPoint.y1 - preSpiritPoint.y2), 2));
        //         const curDistance = Math.sqrt(Math.pow((this.spiritPoint.x1 - this.spiritPoint.x2), 2) + Math.pow((this.spiritPoint.y1 - this.spiritPoint.y2), 2));
        //         this.setData({
        //             [`spiritList[${index}].scale`]: this.data.scale + (curDistance - preDistance) * 0.005
        //         })
        //     }
        // }
    },
    jonSpiritTouchend(e) {
        const index = (e.currentTarget.dataset.id || 0) - 1;
        if (index < 0) {
            return;
        }
        // this.setData({
        //     [`spiritList[${index}].active`]: false
        // });
    },
    jonScaleChange(e) {
        const spiritSelectIndex = (this.spiritSelectIndex || 0) - 1;
        let val = e.detail.value / 50;
        if (val < .6) {
            val = .6;
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
    },
    jonCySpiritTap(e) {
        const index = (e.currentTarget.dataset.id || 0) - 1
            , cySpirit = this.data.cySpiritList[index];
        if (index < 0) {
            return;
        }
        spiritAppendFun.call(this, cySpirit, true);
        this.setData({
            cySpiritHide: true
        });
    },
    jonCySpiritClearTap(e) {
        this.setData({
            cySpiritHide: true,
            spiritList: [],
            spiritListOld: [],
            'toolbar.defaultValue': 50
        });
        this.spiritSelectIndex = 0;
        this.selectSpiritList = [];
    },
    jonCySpiritCloseTap(e) {
        this.setData({
            cySpiritHide: true
        });
    },
    jonSpiritMoreTap(e) {
        this.setData({
            cySpiritHide: false
        });
    }
})
