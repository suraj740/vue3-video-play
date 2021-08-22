/*
 * @Author: web.王晓冬
 * @Date: 2021-08-21 15:12:41
 * @LastEditors: web.王晓冬
 * @LastEditTime: 2021-08-22 09:55:03
 * @Description: file content
 */
import Demo from 'vitepress-theme-demoblock/components/Demo.vue'
import DemoBlock from 'vitepress-theme-demoblock/components/DemoBlock.vue'
// import {
//   videoPlay
// } from 'vue3-video-play'
import 'vue3-video-play/dist/style.css'
export function registerComponents(app) {
  // app.component(videoPlay.name, videoPlay)
  app.mixin({
    async mounted() {
      await import('vue3-video-play').then((m) => {
        app.use(m.default)
      })
    }
  })
  app.component('Demo', Demo)
  app.component('DemoBlock', DemoBlock)
}