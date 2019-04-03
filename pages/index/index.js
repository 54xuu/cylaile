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
                const selectImage = {
                    path: res.tempFilePaths[0]
                };
                wx.getImageInfo({
                    src: selectImage.path,
                    success(res) {
                        selectImage.width = res.width;
                        selectImage.height = res.height;
                        app.jonSetPicture(selectImage);
                        wx.navigateTo({
                            url: '../picture/picture'
                        });
                    }
                });
            }
        })
    },
    onLoad: function () {
    },
})