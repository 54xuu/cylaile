//app.js
App({
    onLaunch: function () {
        this.globalData.systemInfo = wx.getSystemInfoSync();
        console.log(this.globalData.systemInfo);
    },
    globalData: {
        systemInfo: {},
        selectImage: {}
    },
    jonSetPicture: function (img) {
        this.globalData.selectImage = img;
    },
    jonGetPicture: function () {
        return this.globalData.selectImage;
    },
    jonGetSysinfo: function (key) {
        return this.globalData.systemInfo[key] || 0;
    }
})