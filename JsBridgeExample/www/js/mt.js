// most of this library is borrowed from Titanium, Copyright 2008-2012 Appcelerator, Inc. under the Apache License Version 2 http://www.apache.org/licenses/LICENSE-2.0
//I haven't implemented all the features they have.
Mt = {};
Mt.appId = 'jsbridge';
Mt.pageToken = 'index';
Mt.App = {};
Mt.API = {};
Mt.App._listeners = {};
Mt.App._listener_id = 1;
Mt.App.id = Mt.appId;
Mt.App._xhr = XMLHttpRequest;
Mt._broker = function (module, method, data) {
    try {
        var url = 'app://' + Mt.appId + '/_MtA0_' + Mt.pageToken + '/' + module + '/' + method + '?' + Mt.App._JSON(data, 1);
        var xhr = new Mt.App._xhr();
        xhr.open('GET', url, false);
        xhr.send(); 
    } catch (ex) {
        console.log('error');
        console.log(JSON.stringify(ex));
    }
};
Mt._hexish = function (a) {
    var r = '';
    var e = a.length;
    var c = 0;
    var h;
    while (c < e) {
        h = a.charCodeAt(c++).toString(16);
        r += '\\\\u';
        var l = 4 - h.length;
        while (l-- > 0) {
            r += '0'
        }
        ;
        r += h
    }
    return r
};
Mt._bridgeEnc = function (o) {
    return'<' + Mt._hexish(o) + '>'
};
Mt.App._JSON = function (object, bridge) {
    var type = typeof object;
    switch (type) {
        case'undefined':
        case'function':
        case'unknown':
            return undefined;
        case'number':
        case'boolean':
            return object;
        case'string':
            if (bridge === 1)return Mt._bridgeEnc(object);
            return'""' + object.replace(/""/g, '\\\\""').replace(/\\n/g, '\\\\n').replace(/\\r/g, '\\\\r') + '""'
    }
    if ((object === null) || (object.nodeType == 1))return'null';
    if (object.constructor.toString().indexOf('Date') != -1) {
        return'new Date(' + object.getTime() + ')'
    }
    if (object.constructor.toString().indexOf('Array') != -1) {
        var res = '[';
        var pre = '';
        var len = object.length;
        for (var i = 0; i < len; i++) {
            var value = object[i];
            if (value !== undefined)value = Mt.App._JSON(value, bridge);
            if (value !== undefined) {
                res += pre + value;
                pre = ', '
            }
        }
        return res + ']'
    }
    var objects = [];
    for (var prop in object) {
        var value = object[prop];
        if (value !== undefined) {
            value = Mt.App._JSON(value, bridge)
        }
        if (value !== undefined) {
            objects.push(Mt.App._JSON(prop, bridge) + ': ' + value)
        }
    }
    return'{' + objects.join(',') + '}'
};
//CDeutsch: removing evtid param
//Mt.App._dispatchEvent = function (type, evtid, evt) {
Mt.App._dispatchEvent = function (type, evt) {
    var listeners = Mt.App._listeners[type];
    if (listeners) {
        for (var c = 0; c < listeners.length; c++) {
            var entry = listeners[c];
            //CDeutsch: changing to look for type so we only have to call once.
            //if (entry.id == evtid) {
                entry.callback.call(entry.callback, evt)
            //}
        }
    }
};
Mt.App.fireEvent = function (name, evt) {
    Mt._broker('App', 'fireEvent', {name:name, event:evt})
};
Mt.API.log = function (a, b) {
    Mt._broker('API', 'log', {level:a, message:b})
};
Mt.API.debug = function (e) {
    Mt._broker('API', 'log', {level:'debug', message:e})
};
Mt.API.error = function (e) {
    Mt._broker('API', 'log', {level:'error', message:e})
};
Mt.API.info = function (e) {
    Mt._broker('API', 'log', {level:'info', message:e})
};
Mt.API.fatal = function (e) {
    Mt._broker('API', 'log', {level:'fatal', message:e})
};
Mt.API.warn = function (e) {
    Mt._broker('API', 'log', {level:'warn', message:e})
};
Mt.App.addEventListener = function (name, fn) {
    var listeners = Mt.App._listeners[name];
    if (typeof(listeners) == 'undefined') {
        listeners = [];
        Mt.App._listeners[name] = listeners
    }
    var newid = Mt.pageToken + Mt.App._listener_id++;
    listeners.push({callback:fn, id:newid});
    //CDeutsch: not going to do this (don't see the advatange right now
    //Mt._broker('App', 'addEventListener', {name:name, id:newid})
};
Mt.App.removeEventListener = function (name, fn) {
    var listeners = Mt.App._listeners[name];
    if (listeners) {
        for (var c = 0; c < listeners.length; c++) {
            var entry = listeners[c];
            if (entry.callback == fn) {
                listeners.splice(c, 1);
                //CDeutsch: not going to do this (don't see the advatange right now
                //Mt._broker('App', 'removeEventListener', {name:name, id:entry.id});
                break
            }
        }
    }
};