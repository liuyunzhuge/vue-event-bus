import EventBus from "breif-event-bus"

const isArray = some => Object.prototype.toString.call(some) == '[object Array]'

// todo change this function
function createNamespace(instance) {
    return '.ns' + `${Math.random()}`.replace(/\./g, '')
}

function normalizeEvents(namespace, events) {
    if (!isArray(events)) {
        events = [events]
    }

    return events.map(e => e + namespace);
}

export default {
    install(Vue, {
    } = {}) {
        let bus = new EventBus

        function createProxy(instance, _noConflict) {
            let namespace = createNamespace(instance)

            instance.$on('hook:beforeDestroy', () => {
                // clean all listeners on current instance
                proxy.$off()
            });

            let proxy = {
                $emit(...args) {
                    bus.trigger(...args)
                    return this
                },
                noConflict() {
                    return _noConflict.call(this);
                },
                namespace,
                core: bus
            }

            for (let entry of [['$on', 'on'], ['$off', 'off'], ['$once', 'once']]) {
                proxy[entry[0]] = function (events, callback) {
                    bus[entry[1]](normalizeEvents(namespace, events), callback)
                    return this
                }.bind(proxy)
            }

            return proxy
        }

        function noConflict() {
            oldDescriptor && Object.defineProperty(Vue.prototype, name, oldDescriptor)
            return this
        }

        let name = '$eventBus'
        let oldDescriptor = Object.getOwnPropertyDescriptor(Vue.prototype, name)
        let keyOnInstance = Symbol()
        Object.defineProperty(Vue.prototype, name, {
            configurable: true,
            enumerable: false,
            get: function () {
                if (!this[keyOnInstance]) {
                    this[keyOnInstance] = createProxy(this, noConflict)
                }
                return this[keyOnInstance]
            }
        })
    }
}