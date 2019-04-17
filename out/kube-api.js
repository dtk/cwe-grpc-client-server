"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var k8s = __importStar(require("@kubernetes/client-node"));
var kc = new k8s.KubeConfig();
kc.loadFromDefault();
var watch = new k8s.Watch(kc);
var req = watch.watch('/api/v1/namespaces', 
// optional query parameters can go here.
{}, 
// callback is called for each received object.
function (type, obj) {
    if (type === 'ADDED') {
        // tslint:disable-next-line:no-console
        console.log('new object:');
    }
    else if (type === 'MODIFIED') {
        // tslint:disable-next-line:no-console
        console.log('changed object:');
    }
    else if (type === 'DELETED') {
        // tslint:disable-next-line:no-console
        console.log('deleted object:');
    }
    else {
        // tslint:disable-next-line:no-console
        console.log('unknown type: ' + type);
    }
    // tslint:disable-next-line:no-console
    console.log(obj);
}, 
// done callback is called if the watch terminates normally
function (err) {
    // tslint:disable-next-line:no-console
    console.log(err);
});
// watch returns a request object which you can use to abort the watch.
//setTimeout(() => { req.abort(); }, 10 * 1000);
//# sourceMappingURL=kube-api.js.map