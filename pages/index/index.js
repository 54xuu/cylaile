//index.js
//获取应用实例
const app = getApp()

Page({
    data: {
    },
    // 选择图片
    jonGetPicture: function () {
        const that = this;
        wx.chooseImage({
            count: 1,
            success(res) {
                app.jonSetPicture(res.tempFilePaths[0]);
                wx.navigateTo({
                    url: '../picture/picture'
                });
            }
        })
    },
    onLoad: function () {
    },
})