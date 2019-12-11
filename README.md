[![npm](https://img.shields.io/npm/dm/vue-breif-event-bus.svg)](https://www.npmjs.com/package/vue-breif-event-bus)
[![npm](https://img.shields.io/npm/v/vue-breif-event-bus.svg)](https://www.npmjs.com/package/vue-breif-event-bus)
[![npm](https://img.shields.io/npm/l/vue-breif-event-bus.svg)](https://www.npmjs.com/package/vue-breif-event-bus)

# vue-event-bus
vue的一个小插件，用于单页应用下页面之间的消息传递。利用事件的命名空间，每个组件只需关心在event-bus上要订阅哪些消息，组件销毁时自身添加在event-bus的消息handler会自动清理掉，同时不影响其它组件。

这是基于[event-bus](https://github.com/liuyunzhuge/event-bus)开发出来的，`event-bus`提供了带命名空间的事件派发管理，所以如果要把`event-bus`用于Vue中的话，仅需要考虑给每个组件实例都生成一个独一无二的事件命名空间，然后在使用`on off trigger once`这些api的时候，自动加上Vue实例的命名空间即可；另外借助`hook:beforeDestroy`这个生命周期钩子，还能在Vue组件实例销毁前，自动移除掉自己在`event-bus`上用自己的命名空间注册的事件监听，保证不影响其它实例。

## 用法
### 安装：
```bash
npm install vue-breif-event-bus
```
### 引用：
* webpack等构建环境：
    ```js
    import Vue from 'vue'
    import EventBus from 'vue-breif-event-bus'

    Vue.use(EventBus)
    
    // start your code
    ```
* 浏览器环境

    通过`npm install vue-breif-event-bus`安装最新版，到本地`node_modules/vue-breif-event-bus`，直接引用`dist/index.umd.min.js`文件即可。eg:
    ```html
    <script src="../node_modules/vue/dist/vue.js"></script>
    <script src="../node_modules/vue-breif-event-bus/dist/index.umd.js"></script>

    <script>
        Vue.use(EventBus)

        // start your code
    </script>
    ```
### 使用
* 基于Vue.prototype使用
    ```js
    import Vue from 'vue'
    import EventBus from 'vue-breif-event-bus'

    Vue.use(EventBus)

    let some = new Vue({
        template: `<div>template</div>`,
        created(){
            this.$eventBus.$on('event-name', ()=> {
                // handler
            })
            this.$eventBus.$once('event-name', ()=> {
                // once handler 
            })
            this.$eventBus.$off('event-name', ()=> {
                // remove handler
            })
            this.$eventBus.$emit('event-name', {
                desc: 'any data'
            })
        }
    })
    ```
    `vue-breif-event-bus`作为插件，在Vue的`prototype`上注册了一个`$eventBus`的属性，所以任何Vue实例都可以直接通过`this.$eventBus`访问到一个基于[event-bus](https://github.com/liuyunzhuge/event-bus)构造的具备命名空间事件管理的对象（不是`event-bus`的实例），在`vue-breif-event-bus`内部，为了让使用者更加习惯地使用Vue api一致的事件管理方式，重新给`$eventBus`设计了四个api，分别是`$on $once $off $emit`，用法与Vue官方api一致。
* noConflict
    
    如果不想污染`Vue.prototype`，那么可以利用下面的方式来处理：
    ```js
    import Vue from 'vue'
    import EventBus from 'vue-breif-event-bus'

    Vue.use(EventBus)

    let EventBusManager = Vue.prototype.$eventBus.noConflict()

    // Vue.prototype.$eventBus will be set to previous value

    Vue.mixin({
        computed: {
            $eventBus() {
                return EventBusManager(this)
            }
        }
    })

    let some = new Vue({
        template: `<div>template</div>`,
        created(){
            this.$eventBus.$on('event-name', ()=> {
                // handler
            })
            this.$eventBus.$once('event-name', ()=> {
                // once handler 
            })
            this.$eventBus.$off('event-name', ()=> {
                // remove handler
            })
            this.$eventBus.$emit('event-name', {
                desc: 'any data'
            })
        }
    })
    ```
## 其它
给Vue实例创建独一无二的命名空间，使用的算法是：
```js
function _createNamespace(instance) {
    const t = 'xxxxyyyyxy'
    return '.' + t.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
    })
}
```
可以通过下面的方式来定义新的创建方式：
```js
Vue.use(EventBus, {
    createNamespace(instance) {
        // new implementation
    }
})
```

补充：这个库适合与类似[vue-navigation](https://github.com/zack24q/vue-navigation)这种基于路由模拟APP页面栈的工具库一起使用。