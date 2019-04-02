//app.js
App({
    onLaunch: function () {
        this.globalData.systemInfo = wx.getSystemInfoSync();
        console.log(this.globalData.systemInfo);
    },
    globalData: {
        systemInfo: {},
        picturePath: ''
    },
    jonSetPicture: function (path) {
        this.globalData.picturePath = path;
    },
    jonGetPicture: function () {
        return this.globalData.picturePath;
    },
    jonGetSysinfo: function (key) {
        return this.globalData.systemInfo[key] || 0;
    }
})