import "../node_modules/dplayer/dist/DPlayer.min.css";
import flvjs from "flv.js";
import DPlayer from "dplayer";
import Hls from "hls.js";

const WS_URL = "ws://localhost:8888/websocket";
let ws;

let _flvPlayer = null;
let last_send_time = new Date().getTime();

const dp = new DPlayer({
  container: document.getElementById("dplayer"),
  autoplay: true,
  // screenshot: true,
  // hotkey: true,
  video: {
    // url: url,
    type: "customFlv",
    customType: {
      customFlv: function(video, player) {
        if (_flvPlayer) {
          console.log("destroy flvPlayer");
          _flvPlayer.destroy();
        }
        const flvPlayer = flvjs.createPlayer({
          type: "flv",
          url: video.src
        });
        _flvPlayer = flvPlayer;
        flvPlayer.attachMediaElement(video);
        flvPlayer.load();
        console.log("create flvPlayer");
        console.log(flvPlayer);
      },
      customHls: function(video, player) {
        const hls = new Hls();
        hls.loadSource(video.src);
        hls.attachMedia(video);
      }
    },
    quality: [
      {
        name: "720P",
        url: "http://live.bitnp.net/nplive/livestream_720.flv",
        type: "customFlv"
      },
      {
        name: "1080P",
        url: "http://live.bitnp.net/nplive/livestream_1080.flv",
        type: "customFlv"
      }
      // {
      //   name: "手机备用",
      //   url: "http://live.bitnp.net/nplive/livestream_720-86.ts",
      //   type: "customHls"
      // }
    ],
    defaultQuality: 0
  },
  apiBackend: {
    read: function(options) {
      try {
        ws = new WebSocket(WS_URL);
        options.success();
      } catch (e) {
        options.error();
      }
    },
    send: function(options) {
      //   console.log("Pretend to send danamku via WebSocket", options);
      if (last_send_time + 3000 > new Date().getTime()) {
        dp.notice("弹幕发送间隔要大于 3s 哦");
        return;
      }
      const data = {
        type: "danmaku",
        data: {
          text: options.data.text,
          color: options.data.color,
          type: options.data.type
        }
      };
      last_send_time = new Date().getTime();
      ws.send(JSON.stringify(data));
      dp.notice("弹幕发送成功");
    }
  },
  danmaku: {
    maximum: 100,
    bottom: "15%",
    unlimited: true
  },
  live: true
});

ws.onmessage = function(e) {
  const data = JSON.parse(e.data);
  if (data.type === "danmaku") {
    dp.danmaku.draw(data.data);
  }
};
dp.danmaku.dan = dp.danmaku.dan.filter(v => v);
