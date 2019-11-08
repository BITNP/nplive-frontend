import "../node_modules/dplayer/dist/DPlayer.min.css";
import DPlayer from "dplayer";

let url = "https://www.moerats.com/usr/dplayer/xx.mp4";
let id = "183f6653124c13ca6b924d021c233f52";

let ws;

const dp = new DPlayer({
  container: document.getElementById("dplayer"),
  video: {
    url: url,
    // pic: "assets/img/cover.png",

    quality: [
      {
        name: "高清",
        url: "https://www.moerats.com/usr/dplayer/xx.mp4"
      },
      {
        name: "不清",
        url: "https://www.moerats.com/usr/dplayer/xx.mp4"
      }
    ],
    defaultQuality: 0
  },
  apiBackend: {
    read: function(options) {
      console.log("Pretend to connect WebSocket");
      console.log(options);
      try {
        ws = new WebSocket("ws://localhost:8888/websocket");
        options.success();
      } catch (e) {
        options.error();
      }
    },
    send: function(options) {
      //   console.log("Pretend to send danamku via WebSocket", options);
      ws.send(options.data.text);
      // callback();
    }
  },
  danmaku: true,
  live: true,
  lang: "zh-cn"
});

ws.onmessage = function(e) {
  const danamku = {
    text: e.data,
    color: "#fff",
    type: "right"
  };
  dp.danmaku.draw(danamku);
};

console.log(dp.danmaku);
// setInterval(() => {
//   dp.danmaku.send(
//     {
//       text: "dplayer is amazing",
//       color: "#b7daff",
//       type: "right" // should be `top` `bottom` or `right`
//     },
//     function() {
//       console.log("success");
//     }
//   );
// }, 3000);
