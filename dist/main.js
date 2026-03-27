"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.methods = void 0;
exports.load = load;
exports.unload = unload;
/**
 * @en Registration method for the main process of Extension
 * @zh 为扩展的主进程的注册方法
 */
exports.methods = {
    /**
     * @en A method that can be triggered by message
     * @zh 通过 message 触发的方法
     */
    showLog() {
        console.log('Hello World');
    },
};
/**
 * @en Method Triggered on Extension Startup
 * @zh 扩展启动时触发的方法
 */
function load() { }
/**
 * @en Method triggered when uninstalling the extension
 * @zh 卸载扩展时触发的方法
 */
function unload() { }
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NvdXJjZS9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQWtCQSxvQkFBeUI7QUFNekIsd0JBQTJCO0FBeEIzQjs7O0dBR0c7QUFDVSxRQUFBLE9BQU8sR0FBNEM7SUFDNUQ7OztPQUdHO0lBQ0gsT0FBTztRQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDL0IsQ0FBQztDQUNKLENBQUM7QUFFRjs7O0dBR0c7QUFDSCxTQUFnQixJQUFJLEtBQUksQ0FBQztBQUV6Qjs7O0dBR0c7QUFDSCxTQUFnQixNQUFNLEtBQUksQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAZW4gUmVnaXN0cmF0aW9uIG1ldGhvZCBmb3IgdGhlIG1haW4gcHJvY2VzcyBvZiBFeHRlbnNpb25cclxuICogQHpoIOS4uuaJqeWxleeahOS4u+i/m+eoi+eahOazqOWGjOaWueazlVxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IG1ldGhvZHM6IHsgW2tleTogc3RyaW5nXTogKC4uLmFueTogYW55KSA9PiBhbnkgfSA9IHtcclxuICAgIC8qKlxyXG4gICAgICogQGVuIEEgbWV0aG9kIHRoYXQgY2FuIGJlIHRyaWdnZXJlZCBieSBtZXNzYWdlXHJcbiAgICAgKiBAemgg6YCa6L+HIG1lc3NhZ2Ug6Kem5Y+R55qE5pa55rOVXHJcbiAgICAgKi9cclxuICAgIHNob3dMb2coKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ0hlbGxvIFdvcmxkJyk7XHJcbiAgICB9LFxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEBlbiBNZXRob2QgVHJpZ2dlcmVkIG9uIEV4dGVuc2lvbiBTdGFydHVwXHJcbiAqIEB6aCDmianlsZXlkK/liqjml7bop6blj5HnmoTmlrnms5VcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBsb2FkKCkge31cclxuXHJcbi8qKlxyXG4gKiBAZW4gTWV0aG9kIHRyaWdnZXJlZCB3aGVuIHVuaW5zdGFsbGluZyB0aGUgZXh0ZW5zaW9uXHJcbiAqIEB6aCDljbjovb3mianlsZXml7bop6blj5HnmoTmlrnms5VcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB1bmxvYWQoKSB7fVxyXG4iXX0=