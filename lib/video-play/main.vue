/*
 * @Author: web.Wang Xiaodong
 * @Date: 2020-11-03 16:29:47
 * @LastEditors: web. Wang Xiaodong
 * @LastEditTime: 2021-09-01 12:03:22
 * @Description: file content
*/

<template>
  <div
    ref="refPlayerWrap"
    id="refPlayerWrap"
    class="d-player-wrap"
    @mousemove="mouseMovewWarp"
    :class="{
      'web-full-screen': state.webFullScreen,
      'is-lightoff': state.lightOff,
      'd-player-wrap-hover':
        state.playBtnState == 'play' || state.isVideoHovering,
    }"
  >
    <!-- If it is a mobile terminal and supports double speed controls=true, otherwise it is flase -->
    <div class="d-player-video" id="dPlayerVideo">
      <!-- <div
        class="d-player-video-poster"
        v-show="props.poster && state.playBtnState == 'play' && state.currentTime == '00:00:00'"
      >
        <img :src="props.poster" :alt="props.title" />
      </div>-->
      <video
        ref="refdVideo"
        class="d-player-video-main"
        id="dPlayerVideoMain"
        :controls="isMobile && state.speed ? true : false"
        :class="{ 'video-mirror': state.mirror }"
        :webkit-playsinline="props.playsinline"
        :playsinline="props.playsinline"
        v-bind="videoEvents"
        :volume="state.volume"
        :muted="state.muted"
        :loop="state.loop"
        :preload="preload"
        width="100%"
        height="100%"
        :src="props.src"
        :poster="props.poster"
      > Your browser does not support the Video tag. </video>
    </div>
    <!-- Buffer animation -->
    <!-- <d-waitingloading text="Buffering..." v-show="state.waitingLoading" /> -->

    <transition name="d-fade-in">
      <div class="d-player-lightoff" v-show="state.lightOff"></div>
    </transition>
    <!-- Full screen mode && mouse over the top display-->
    <d-player-top :title="props.title" v-if="state.fullScreen"></d-player-top>
    <!-- The mobile terminal of the status bar is not displayed-->
    <div class="d-player-state" v-if="!isMobile">
      <transition name="d-scale-out">
        <!-- play button -->
        <div class="d-play-btn" v-show="state.playBtnState == 'play'">
          <d-icon icon="icon-play" :size="40"></d-icon>
        </div>
      </transition>
      <!-- Operation information notification-->
      <d-status :state="state"></d-status>
    </div>
    <!-- Mobile does not display -->
    <input
      v-if="!isMobile"
      type="input"
      readonly="readonly"
      ref="refInput"
      @dblclick="toggleFullScreenHandle"
      @keyup.f="toggleFullScreenHandle"
      @keyup.esc="state.webFullScreen = false"
      @click="togglePlay"
      @keydown.space="togglePlay"
      @keyup="keypress"
      @keydown.arrow-left="keydownLeft"
      @keydown.arrow-up.arrow-down="volumeKeydown"
      @keydown="keypress"
      class="d-player-input"
      maxlength="0"
    />
    <!-- preload animation -->
    <d-loading :loadType="state.loadStateType" />
    <d-contextmenu />
    <!-- PC-side play button controller mobile terminal calls its own controller-->
    <div class="d-player-control" ref="refPlayerControl" v-if="!isMobile && state.control">
      <div class="d-control-progress">
        <d-slider
          class="d-progress-bar"
          @onMousemove="onProgressMove"
          @change="progressBarChange"
          :disabled="!state.speed"
          :hoverText="state.progressCursorTime"
          v-model="state.playProgress"
          :preload="state.preloadBar"
        ></d-slider>
      </div>

      <div class="d-control-tool" @click="inputFocusHandle">
        <div class="d-tool-bar">
          <div class="d-tool-item" @click="togglePlay">
            <d-icon size="24" :icon="`icon-${state.playBtnState}`"></d-icon>
          </div>
          <div
            class="d-tool-item d-tool-time audioTrack-btn"
            v-if="props.controlBtns.includes('audioTrack')"
          >
            <span>{{ state.currentTime }}</span>
            <span style="margin: 0 3px">/</span>
            <span class="total-time">{{ state.totalTime }}</span>
          </div>
        </div>
        <div class="d-tool-bar">
          <!-- Clarity-->
          <div
            class="d-tool-item quality-btn"
            v-if="state.qualityLevels.length && props.controlBtns.includes('quality')"
          >
            {{ state.qualityLevels.length && (state.qualityLevels[state.currentLevel] || {}).height }}P
            <div class="d-tool-item-main">
              <ul class="speed-main" style="text-align:center">
                <li
                  :class="{ 'speed-active': state.currentLevel == index }"
                  @click="qualityLevelsHandle(row, index)"
                  v-for="(row,index) of state.qualityLevels"
                  :key="row"
                >{{ row.height }}P</li>
                <!-- <li @click="qualityLevelsHandle({}, -1)">Auto</li> -->
              </ul>
            </div>
          </div>
          <!-- Double speed playback -->
          <div class="d-tool-item speedRate-btn" v-if="props.controlBtns.includes('speedRate')">
            {{ state.speedActive == "1.0" ? "double speed" : state.speedActive + "x" }}
            <div class="d-tool-item-main">
              <ul class="speed-main">
                <li
                  :class="{ 'speed-active': state.speedActive == row }"
                  @click="playbackRate(row)"
                  v-for="row of state.speedRate"
                  :key="row"
                >{{ row }}x</li>
              </ul>
            </div>
          </div>
          <!-- volume -->
          <div class="d-tool-item volume-btn" v-if="props.controlBtns.includes('volume')">
            <div class="d-tool-item-main volume-box" style="width: 52px">
              <div class="volume-main" :class="{ 'is-muted': state.muted }">
                <span class="volume-text-size">{{ state.muted ? 0 : ~~(state.volume * 100) }}%</span>
                <!-- @change unmute if volume is changed -->
                <d-slider
                  @change="state.muted = false"
                  :hover="false"
                  size="5px"
                  :vertical="true"
                  v-model="state.volume"
                ></d-slider>
              </div>
            </div>
            <span @click="mutedHandler" style="display: flex">
              <d-icon
                size="20"
                :icon="`icon-volume-${state.volume == 0 || state.muted
                ? 'mute'
                : state.volume > 0.5
                  ? 'up'
                  : 'down'
                }`"
              ></d-icon>
            </span>
          </div>
          <!-- Settings-->
          <div class="d-tool-item setting-btn" v-if="props.controlBtns.includes('setting')">
            <d-icon size="20" class="rotateHover" icon="icon-settings"></d-icon>
            <div class="d-tool-item-main">
              <ul class="speed-main">
                <li>
                  mirror image
                  <d-switch @change="mirrorChange" v-model="state.mirror" />
                </li>
                <li>
                  Loop
                  <d-switch @change="loopChange" v-model="state.loop" />
                </li>
                <li>
                  light off mode
                  <d-switch @change="lightOffChange" v-model="state.lightOff" />
                </li>
              </ul>
            </div>
          </div>
          <!-- PIP-->
          <div
            class="d-tool-item pip-btn"
            v-if="props.controlBtns.includes('pip')"
            @click="requestPictureInPictureHandle"
          >
            <d-icon size="20" icon="icon-pip"></d-icon>
            <div class="d-tool-item-main">Picture in Picture</div>
          </div>
          <!-- web page full screen -->
          <div
            class="d-tool-item pip-btn"
            v-if="props.controlBtns.includes('pageFullScreen')"
            @click="state.webFullScreen = !state.webFullScreen"
          >
            <d-icon size="20" icon="icon-web-screen"></d-icon>
            <div class="d-tool-item-main">Webpage fullscreen</div>
          </div>
          <!-- full screen -->
          <div
            class="d-tool-item fullScreen-btn"
            v-if="props.controlBtns.includes('fullScreen')"
            @click="toggleFullScreenHandle"
          >
            <div class="d-tool-item-main">full screen</div>
            <d-icon size="20" icon="icon-screen"></d-icon>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
export default {
  name: "vue3VideoPlay",
  inheritAttrs: false,
};
</script>
<script setup lang="ts">
import {
  reactive,
  ref,
  Ref,
  onMounted,
  useAttrs,
  watch,
  nextTick
} from "vue";
import { debounce } from "throttle-debounce";
import Hls2 from "hls.js";
import DIcon from "../components/d-icon.vue";
import DPlayerTop from "../components/d-player-top.vue";
import DStatus from "../components/d-status.vue"; //Double speed playback status
import DSwitch from "../components/d-switch.vue"; //switch
import DLoading from "../components/d-loading.vue"; //loading
import DSlider from "../components/d-slider.vue"; // slider
import DContextmenu from "../components/d-contextmenu.vue"; // slider
import {
  hexToRgba,
  timeFormat,
  requestPictureInPicture,
  toggleFullScreen,
  isMobile,
  firstUpperCase,
} from "../utils/util";
import { videoEmits, defineProps } from "./plugins/index";
const props = defineProps(defineProps); //props
const emits = defineEmits([
  ... videoEmits,
  "mirrorChange",
  "loopChange",
  "lightOffChange",
]); //emits

const refPlayerWrap: Ref<HTMLElement> = ref(null); //wrap
const refdVideo: Ref<HTMLElement> = ref(null); // video player
const refPlayerControl: Ref<HTMLElement> = ref(null); //Player controller
const refInput: Ref<HTMLElement> = ref(null); //Shortcut key operation
const state = reactive({
  dVideo: null,
  ...props, //If there is a custom configuration, it will replace the default configuration
  muted: props.muted,
  playBtnState: props.autoPlay ? "pause" : "play", // play button state
  loadStateType: "loadstart", // load state type // loadstart initializes waiting buffer ended playback ends
  fullScreen: false,
  handleType: "", //current operation type
  //current playback time
  currentTime: "00:00:00",
  // current buffer progress
  preloadBar: 0,
  //total duration
  totalTime: "00:00:00",
  isVideoHovering: true,
  speedActive: "1.0", // Double speed
  playProgress: 0, //Play progress
  isMultiplesPlay: false, //Whether to play at double speed
  longPressTimeout: null,
  progressCursorTime: "00:00:00", //Progress bar cursor time
  qualityLevels: [], //resolution array
  currentLevel: 0, //Preferred resolution
});
const compose =
  (...args) =>
    (value) =>
      args.reverse().reduce((acc, fn) => fn(acc), value);
// collect video events
const videoEvents = videoEmits.reduce((events, emit) => {
  let name = `on${firstUpperCase(emit)}`;
  events[name] = (ev) => {
    state.loadStateType = emit;
    emits(emit, ev);
  };

  return events;
}, {});
// can play
videoEvents["onCanplay"] = compose(videoEvents["onCanplay"], () => {
  if (state.playBtnState != "play") {
    //If it is autoplay, display the pause button
    state.dVideo.play();
  }
  if (state.autoPlay) {
    //If it is autoplay, display the pause button
    state.dVideo.play();
    state.playBtnState = "pause";
  }
});
// end of playback // merge function
videoEvents["onEnded"] = compose(videoEvents["onEnded"], () => {
  state.playBtnState = "replay"; //The control button at this time should show replay
});

// resource length changes
videoEvents["onDurationchange"] = (ev) => {
  emits("durationchange", ev);
  if (props.currentTime != 0) {
    state.dVideo.currentTime = props.currentTime
  }

  //Update all states of the current duration
  videoEvents.onTimeupdate(ev)
};

// buffer download
videoEvents["onProgress"] = (ev) => {
  console.log("Buffering...");
  emits("progress", ev);
  let duration = ev.target.duration; // total length of media
  let length = ev.target.buffered;
  let end = ev.target.buffered.length && ev.target.buffered.end(length - 1);
  state.preloadBar = end / duration; //buffer ratio
};

// current playback progress
videoEvents["onTimeupdate"] = (ev) => {
  emits("timeupdate", ev);
  let duration = ev.duration || ev.target.duration || 0; // total media length
  let currentTime = ev.currentTime || ev.target.currentTime; // current media playback length
  state.playProgress = currentTime / duration; //Play progress ratio
  state.currentTime = timeFormat(currentTime);
  state.totalTime = timeFormat (duration);
};
// error
videoEvents["onError"] = compose(videoEvents["onError"], () => {
  state.playBtnState = "replay"; //The control button at this time should show replay
});

// Get user-defined events
let attrs = useAttrs();
for (let emit in attrs) {
  videoEvents [emit] = attrs [emit];
}

// format the color to rgb format
const hexToRgbaColor = hexToRgba(state.color);
// clear the current operation type
const clearHandleType = debounce(500, () => {
  state.handleType = "";
})
// Volume +++-
const volumeKeydown = (ev) => {
  ev.preventDefault();
  if (ev.code == "ArrowUp") {
    state.volume = state.volume + 0.1 > 1 ? 1 : state.volume + 0.1;
  } else {
    state.volume = state.volume - 0.1 < 0 ? 0 : state.volume - 0.1;
  }
  state.muted = false;
  state.handleType = "volume"; //Operation type volume
  clearHandleType(); //clear the operation type
};
const keydownLeft = (ev) => {
  if (!props.speed) return; // if fast forward and rewind is not supported
  state.dVideo.currentTime =
    state.dVideo.currentTime < 10 ? 0.1 : state.dVideo.currentTime - 10;
  videoEvents.onTimeupdate(state.dVideo);
  playHandle();
}
const keypress = (ev) => {
  ev.preventDefault();
  let pressType = ev.type;
  if (ev.key == "ArrowRight") {
    playHandle();
    if (pressType == "keyup") {
      clearTimeout(state.longPressTimeout);
      // If fast forward and rewind is not supported, if fast forward and rewind is turned off, it must be played without long pressing
      if (!props.speed && !state.longPressTimeout) return;
      if (state.isMultiplesPlay) {
        //If double speed playback is in progress
        state.dVideo.playbackRate = state.speedActive;
        state.isMultiplesPlay = false;
      } else {
        // progress plus 10s
        state.dVideo.currentTime = state.dVideo.currentTime + 10;
        videoEvents.onTimeupdate(state.dVideo);
      }
      // If long press 5x speed to play
    } else if (pressType == "keydown") {
      if (!props.speed) return; // If it does not support fast forward and rewind, it cannot support long press and double speed playback
      if (state.isMultiplesPlay) {
        clearTimeout(state.longPressTimeout);
      }
      state.longPressTimeout = setTimeout(() => {
        state.isMultiplesPlay = true;
        state.dVideo.playbackRate = 5;
        state.handleType = "playbackRate"; //Operation type double speed playback
        clearHandleType(); //clear the operation type
      }, 500);
    }
  }
};
// focus on the player
const inputFocusHandle = () => {
  if (isMobile) return;
  refInput.value.focus();
};
// play method
const playHandle = () => {
  state.loadStateType = "play";
  state.dVideo.play().catch(() => {
    setTimeout(() => {
      state.playBtnState = "replay";
      state.loadStateType = "error";
    }, 500);
  });
  state.playBtnState = "pause";
  // Clear the state after playing
  // state.loadStateType = ''
};
// pause
const pauseHandle = () => {
  // state.loadStateType = 'pause' // Pause state
  state.dVideo.pause();
  state.playBtnState = "play"; // show play button after pause
};

// play / Pause
const togglePlay = (ev) => {
  if (ev) ev.preventDefault();
  if (state.playBtnState == "play" || state.playBtnState == "replay") {
    // After clicking the play button or replay button
    playHandle();
  } else if (state.playBtnState == "pause") {
    // After clicking the pause button...
    pauseHandle ();
  }
};

// mute event
const mutedHandler = () => {
  state.muted = !state.muted;
  // If the volume was previously adjusted to 0, the volume will be set to 5 when unmute
  if (state.volume == 0) {
    state.volume = 0.05;
  }
};

// progress bar event
const progressBarChange = (ev: Event, val) => {
  let duration = state.dVideo.duration || state.dVideo.target.duration; // total length of media
  state.dVideo.currentTime = duration * val;
  if (state.playBtnState == "play") {
    state.dVideo.play();
    state.playBtnState = "pause";
  }
};
// progress bar moves
const onProgressMove = (ev, val) => {
  state.progressCursorTime = timeFormat(state.dVideo.duration * val);
};

// hide the controller
const hideControl = debounce(2500, () => {
  state.isVideoHovering = false;
});

const mouseMovewWarp = (ev) => {
  state.isVideoHovering = true;
  hideControl();
};

// Play speed
const qualityLevelsHandle = (row, index) => {
  Hls.currentLevel = index
  state.currentLevel = index
};
// Play speed
const playbackRate = (row) => {
  state.speedActive = row;
  state.dVideo.playbackRate = row;
};
//Mirror screen event
const mirrorChange = (val) => {
  // console.log(val)
  emits("mirrorChange", val, state.dVideo);
};
// Whether to loop events
const loopChange = (val) => {
  // console.log(val)
  emits("loopChange", val, state.dVideo);
};
// light off event
const lightOffChange = (val) => {
  // console.log(val)
  emits("lightOffChange", val, state.dVideo);
};

const requestPictureInPictureHandle = () => {
  requestPictureInPicture(state.dVideo);
};
// full screen button
const toggleFullScreenHandle = () => {
  state.fullScreen = toggleFullScreen(refPlayerWrap.value);
};

const init = (): void => {
  if (state.dVideo.canPlayType(props.type) || state.dVideo.canPlayType('application/vnd.apple.mpegurl')) {
    state.muted = props.autoPlay
    // state.dVideo.load();
  }
  // // decode using hls
  else if (Hls2.isSupported ()) {
    const Hls = new Hls2({ fragLoadingTimeOut: 2000 });
    Hls.detachMedia(); //Unbind
    Hls.attachMedia(state.dVideo);
    Hls.on(Hls2.Events.MEDIA_ATTACHED, () => {
      Hls.loadSource(props.src);
      // Load available quality levels
      Hls.on('hlsManifestParsed', (ev, data) => {
        console.log(data)
        state.currentLevel = data.level
        state.qualityLevels = data.levels || []
        // state.dVideo.load();
      });
    })

    Hls.on('hlsLevelSwitching', (ev, data) => {
      console.log(data)
      // state.qualityLevels = Hls.levels || []
      console.log('LEVEL_SWITCHING')
      // state.dVideo.load();
    });
    Hls.on('hlsLevelSwitched', (ev, data) => {
      state.currentLevel = data.level
      // state.qualityLevels = Hls.levels || []
      console.log('LEVEL_SWITCHED')
      // state.dVideo.load();
    });
  }
}

watch(() => props.src, () => {
  nextTick(() => {
    // initialize
    init()
  })
}, { immediate: true })
onMounted(() => {
  state.dVideo = refdVideo;
  inputFocusHandle();
});
defineExpose({
  play: playHandle, //play
  pause: pauseHandle, //pause
  togglePlay, //pause or play
});
</script>


<style lang="less" scoped>
@import "../style/reset.less";
@import "../style/transition.less";
@import "../style/animate.less";
@import "../style/base.less";
.d-player-wrap {
  --primary-color: v-bind(hexToRgbaColor);
  width: v-bind(width);
  height: v-bind(height);
}
@import "../style/vPlayer.less";
</style>
