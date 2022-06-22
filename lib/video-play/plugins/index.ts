/*
* @Author : web. Wang Xiaodong
 * @Date: 2021-08-25 11:19:35
* @LastEditors : web. Wang Xiaodong
 * @LastEditTime: 2021-09-02 16:03:36
 * @Description: file content
 */
import type { PropType } from 'vue'
export const videoEmits = [
    'loadstart',
    'play',
    'pause',
    'playing',
    'seeking',
    'seeked',
    'waiting',
    'durationchange',
    'progress',
    'canplay',
    'timeupdate',
    'ended',
    'error',
    'stalled',

]
export const defineProps = {
    width: { type: String, default: '800px' },
    height: { type: String, default: '450px' },
    color: { type: String, default: '#409eff' },
    src : {  required : true ,  type : String ,  default : ''  } ,  // video source
    title : {  type : String ,  default : ''  } ,  // video name
    type : {  type : String ,  default : 'video/mp4'  } ,  // video type
    poster : {  type : String ,  default : ''  } , //cover
    webFullScreen : {  type : Boolean ,  default : false  } , //Webpage full screen
    speed : {  type : Boolean ,  default : true  } , //Whether fast forward and fast backward are supported//The mobile terminal does not support
    currentTime : {  type : Number ,  default : 0  } ,  //current playback time
    playsinline : {  type : Boolean ,  default : false  } , //whether click to play on the ios side is full screen
    muted : {  type : Boolean ,  default : false  } ,  // Quiet
    speedRate: { type: Array, default: () => ["2.0", "1.5", "1.25", "1.0", "0.75", "0.5",] }, //Play double speed
    autoPlay : {  type : Boolean ,  default : false  } ,  //autoplay
    loop : {  type : Boolean ,  default : false  } ,  // loop playback
    mirror : {  type : Boolean ,  default : false  } ,  //Mirror screen
    ligthOff : {  type : Boolean ,  default : false  } ,   //light off mode
    volume : {  type : [ String ,  Number ] ,  default : 0.3  } ,  //default volume size
    control : {  type : Boolean ,  default : true  } ,  //whether to display the controller
    controlBtns: {
        type: Array as PropType<Array<string>>,
        default: ['audioTrack', 'quality', 'speedRate', 'volume', 'setting', 'pip', 'pageFullScreen', 'fullScreen']
    } ,  //whether to display the controller
    preload : {  type : String ,  default : 'auto'  } ,  //preload
}
