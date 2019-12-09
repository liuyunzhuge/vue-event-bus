import EventBus from "breif-event-bus"

const isArray = some => Object.prototype.toString.call(some) == '[object Array]'

function _createNamespace(instance) {
    const t = 'xxxxyyyyxy'
    return '.' + t.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
    })
}

function normalizeEvents(namespace, events) {
    if (!events) return events
    if (!isArray(events)) {
        events = [events]
    }

    return events.map(e => e + namespace)
}

let LOG_ENABLED = false

function print(level, ...args) {
    if (!LOG_ENABLED) return
    console[level](...args)
}

export default {
    install(Vue, {
        log = false,
        createNamespace = _createNamespace
    } = {}) {
        LOG_ENABLED = log

        let bus = new EventBus

        function createProxy(instance) {
            let namespace = !instance ? undefined : createNamespace(instance)

            let proxy = {
                $emit(...args) {
                    bus.trigger(...args)
                    return this
                },
                namespace,
                core: bus
            }

            for (let entry of [['$on', 'on'], ['$off', 'off'], ['$once', 'once']]) {
                proxy[entry[0]] = function (events, callback) {
                    bus[entry[1]](namespace ? normalizeEvents(namespace, events) : events, callback)
                    return this
                }.bind(proxy)
            }

            instance && instance.$on('hook:beforeDestroy', () => {
                print('log', "hook:beforeDestroy:clean all listeners on current instance")
                proxy.$off('')
            })

            return proxy
        }

        function bindBusProxyToInstance(instance) {
            if (!instance[busProxySymbol]) {
                instance[busProxySymbol] = createProxy(instance)
            }
            return instance[busProxySymbol]
        }

        let name = '$eventBus'
        let prevEventBusPropDef = Object.getOwnPropertyDescriptor(Vue.prototype, name)
        let busProxySymbol = Symbol('eventBus')
        let protoBusProxy = createProxy(null)
        let eventBusPropDef = {
            configurable: true,
            enumerable: false,
            get: function () {
                if (this === Vue.prototype) {
                    return protoBusProxy
                }
                return bindBusProxyToInstance(this)
            }
        }

        protoBusProxy.noConflict = function () {
            delete protoBusProxy.noConflict

            if (prevEventBusPropDef) {
                Object.defineProperty(Vue.prototype, name, prevEventBusPropDef)
            } else {
                delete Vue.prototype[name]
            }
            return bindBusProxyToInstance
        }

        Object.defineProperty(Vue.prototype, name, eventBusPropDef)
    }
}