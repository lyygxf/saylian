const App = getApp();
const Config = require('../../config');
const Utils = require('../../utils');

Page({
  
  data: {
    height: 1206,
    items: [],
    page: 1,
    size: 100,
    loginShow: false,
    showBack: false
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () { 
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          height: res.windowHeight
        });
      }
    })
  },

  onLoad: function (options) {
    this.setData({
      showBack: (options.from === 'share')
    });
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
  * 生命周期函数--监听页面显示
  */
  onShow: function () {
    wx.setNavigationBarTitle({
      title: '资源列表'
    });
    
    const user = App.user || {};
    if (user.uid && user.token && user.openid) {
      this.query();
      this.setData({ loginShow: false });
    } else {
      this.setData({ loginShow: true });
      const copyed = parseInt(wx.getStorageSync('sl-copy'), 10);
      if (copyed && copyed != 0 ) {
        const tmpItems = this.data.items;
        tmpItems[copyed - 1] = Object.assign(tmpItems[copyed - 1], {
          status: 'ok'
        });
        this.setData({items: tmpItems});
        wx.showToast({ title: '已复制', icon: 'none' });
      }
    }
  },
  onHide(){},
  onUnload(){
    wx.setStorage({ key: 'sl-copy', data: '' });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '我在说练英语获取了经典电影资源，让我们一起努力学习吧',
      path: 'pages/resources/index?from=share',
      imageUrl: App.user.avatarUrl || '../../images/sl.png'
    };
  },

  onBindUserInfo(evt) {
    const userInfo = (evt.detail || {});
    this.setData({ loginShow: false });
    this.query();
  },

  shareGet(evt){
    wx.setStorage({ key: 'sl-copy', data: '' });
    const target = evt.currentTarget.dataset.v || {};

    this.querLink(target.id, (data) => {
      wx.setClipboardData({
        data: (data[0] || {}).link,
        success: (res) => {
          wx.setStorage({ key: 'sl-copy', data: target.index });
        }
      })
    })
  },

  backHome() {
    wx.switchTab({
      url: '/pages/home/index'
    })
  },

  query() {
    wx.showLoading({ title: '正在查询...' });

    Utils.request(Config.service.films, {
      page: this.data.page,
      size: this.data.size
    },
    (data) => {
      wx.hideLoading();
      const copyed = parseInt(wx.getStorageSync('sl-copy'), 10);
      if (copyed && copyed != 0) {
        wx.showToast({ title: '已复制', icon: 'none' });
      }

      let len = data.length;
      for(let i = 0; i < len; i++){
        data[i] = Object.assign(data[i], {
          index: i + 1,
          status: (i + 1 === copyed ? 'ok' : false)
        });
      }
      this.setData({ items: data })
    });
  },

  querLink(id, cb) {
    wx.showLoading({ title: '正在查询...' });

    Utils.request(Config.service.filmCode, { id },
      (data) => {
        cb && cb(data);
      });
  }
})