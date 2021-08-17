
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function claim_element(nodes, name, attributes, svg) {
        for (let i = 0; i < nodes.length; i += 1) {
            const node = nodes[i];
            if (node.nodeName === name) {
                let j = 0;
                const remove = [];
                while (j < node.attributes.length) {
                    const attribute = node.attributes[j++];
                    if (!attributes[attribute.name]) {
                        remove.push(attribute.name);
                    }
                }
                for (let k = 0; k < remove.length; k++) {
                    node.removeAttribute(remove[k]);
                }
                return nodes.splice(i, 1)[0];
            }
        }
        return svg ? svg_element(name) : element(name);
    }
    function claim_text(nodes, data) {
        for (let i = 0; i < nodes.length; i += 1) {
            const node = nodes[i];
            if (node.nodeType === 3) {
                node.data = '' + data;
                return nodes.splice(i, 1)[0];
            }
        }
        return text(data);
    }
    function claim_space(nodes) {
        return claim_text(nodes, ' ');
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function claim_component(block, parent_nodes) {
        block && block.l(parent_nodes);
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.31.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const LOCATION = {};
    const ROUTER = {};

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    function getLocation(source) {
      return {
        ...source.location,
        state: source.history.state,
        key: (source.history.state && source.history.state.key) || "initial"
      };
    }

    function createHistory(source, options) {
      const listeners = [];
      let location = getLocation(source);

      return {
        get location() {
          return location;
        },

        listen(listener) {
          listeners.push(listener);

          const popstateListener = () => {
            location = getLocation(source);
            listener({ location, action: "POP" });
          };

          source.addEventListener("popstate", popstateListener);

          return () => {
            source.removeEventListener("popstate", popstateListener);

            const index = listeners.indexOf(listener);
            listeners.splice(index, 1);
          };
        },

        navigate(to, { state, replace = false } = {}) {
          state = { ...state, key: Date.now() + "" };
          // try...catch iOS Safari limits to 100 pushState calls
          try {
            if (replace) {
              source.history.replaceState(state, null, to);
            } else {
              source.history.pushState(state, null, to);
            }
          } catch (e) {
            source.location[replace ? "replace" : "assign"](to);
          }

          location = getLocation(source);
          listeners.forEach(listener => listener({ location, action: "PUSH" }));
        }
      };
    }

    // Stores history entries in memory for testing or other platforms like Native
    function createMemorySource(initialPathname = "/") {
      let index = 0;
      const stack = [{ pathname: initialPathname, search: "" }];
      const states = [];

      return {
        get location() {
          return stack[index];
        },
        addEventListener(name, fn) {},
        removeEventListener(name, fn) {},
        history: {
          get entries() {
            return stack;
          },
          get index() {
            return index;
          },
          get state() {
            return states[index];
          },
          pushState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            index++;
            stack.push({ pathname, search });
            states.push(state);
          },
          replaceState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            stack[index] = { pathname, search };
            states[index] = state;
          }
        }
      };
    }

    // Global history uses window.history as the source if available,
    // otherwise a memory history
    const canUseDOM = Boolean(
      typeof window !== "undefined" &&
        window.document &&
        window.document.createElement
    );
    const globalHistory = createHistory(canUseDOM ? window : createMemorySource());
    const { navigate } = globalHistory;

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    const paramRe = /^:(.+)/;

    const SEGMENT_POINTS = 4;
    const STATIC_POINTS = 3;
    const DYNAMIC_POINTS = 2;
    const SPLAT_PENALTY = 1;
    const ROOT_POINTS = 1;

    /**
     * Check if `string` starts with `search`
     * @param {string} string
     * @param {string} search
     * @return {boolean}
     */
    function startsWith(string, search) {
      return string.substr(0, search.length) === search;
    }

    /**
     * Check if `segment` is a root segment
     * @param {string} segment
     * @return {boolean}
     */
    function isRootSegment(segment) {
      return segment === "";
    }

    /**
     * Check if `segment` is a dynamic segment
     * @param {string} segment
     * @return {boolean}
     */
    function isDynamic(segment) {
      return paramRe.test(segment);
    }

    /**
     * Check if `segment` is a splat
     * @param {string} segment
     * @return {boolean}
     */
    function isSplat(segment) {
      return segment[0] === "*";
    }

    /**
     * Split up the URI into segments delimited by `/`
     * @param {string} uri
     * @return {string[]}
     */
    function segmentize(uri) {
      return (
        uri
          // Strip starting/ending `/`
          .replace(/(^\/+|\/+$)/g, "")
          .split("/")
      );
    }

    /**
     * Strip `str` of potential start and end `/`
     * @param {string} str
     * @return {string}
     */
    function stripSlashes(str) {
      return str.replace(/(^\/+|\/+$)/g, "");
    }

    /**
     * Score a route depending on how its individual segments look
     * @param {object} route
     * @param {number} index
     * @return {object}
     */
    function rankRoute(route, index) {
      const score = route.default
        ? 0
        : segmentize(route.path).reduce((score, segment) => {
            score += SEGMENT_POINTS;

            if (isRootSegment(segment)) {
              score += ROOT_POINTS;
            } else if (isDynamic(segment)) {
              score += DYNAMIC_POINTS;
            } else if (isSplat(segment)) {
              score -= SEGMENT_POINTS + SPLAT_PENALTY;
            } else {
              score += STATIC_POINTS;
            }

            return score;
          }, 0);

      return { route, score, index };
    }

    /**
     * Give a score to all routes and sort them on that
     * @param {object[]} routes
     * @return {object[]}
     */
    function rankRoutes(routes) {
      return (
        routes
          .map(rankRoute)
          // If two routes have the exact same score, we go by index instead
          .sort((a, b) =>
            a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
          )
      );
    }

    /**
     * Ranks and picks the best route to match. Each segment gets the highest
     * amount of points, then the type of segment gets an additional amount of
     * points where
     *
     *  static > dynamic > splat > root
     *
     * This way we don't have to worry about the order of our routes, let the
     * computers do it.
     *
     * A route looks like this
     *
     *  { path, default, value }
     *
     * And a returned match looks like:
     *
     *  { route, params, uri }
     *
     * @param {object[]} routes
     * @param {string} uri
     * @return {?object}
     */
    function pick(routes, uri) {
      let match;
      let default_;

      const [uriPathname] = uri.split("?");
      const uriSegments = segmentize(uriPathname);
      const isRootUri = uriSegments[0] === "";
      const ranked = rankRoutes(routes);

      for (let i = 0, l = ranked.length; i < l; i++) {
        const route = ranked[i].route;
        let missed = false;

        if (route.default) {
          default_ = {
            route,
            params: {},
            uri
          };
          continue;
        }

        const routeSegments = segmentize(route.path);
        const params = {};
        const max = Math.max(uriSegments.length, routeSegments.length);
        let index = 0;

        for (; index < max; index++) {
          const routeSegment = routeSegments[index];
          const uriSegment = uriSegments[index];

          if (routeSegment !== undefined && isSplat(routeSegment)) {
            // Hit a splat, just grab the rest, and return a match
            // uri:   /files/documents/work
            // route: /files/* or /files/*splatname
            const splatName = routeSegment === "*" ? "*" : routeSegment.slice(1);

            params[splatName] = uriSegments
              .slice(index)
              .map(decodeURIComponent)
              .join("/");
            break;
          }

          if (uriSegment === undefined) {
            // URI is shorter than the route, no match
            // uri:   /users
            // route: /users/:userId
            missed = true;
            break;
          }

          let dynamicMatch = paramRe.exec(routeSegment);

          if (dynamicMatch && !isRootUri) {
            const value = decodeURIComponent(uriSegment);
            params[dynamicMatch[1]] = value;
          } else if (routeSegment !== uriSegment) {
            // Current segments don't match, not dynamic, not splat, so no match
            // uri:   /users/123/settings
            // route: /users/:id/profile
            missed = true;
            break;
          }
        }

        if (!missed) {
          match = {
            route,
            params,
            uri: "/" + uriSegments.slice(0, index).join("/")
          };
          break;
        }
      }

      return match || default_ || null;
    }

    /**
     * Check if the `path` matches the `uri`.
     * @param {string} path
     * @param {string} uri
     * @return {?object}
     */
    function match(route, uri) {
      return pick([route], uri);
    }

    /**
     * Add the query to the pathname if a query is given
     * @param {string} pathname
     * @param {string} [query]
     * @return {string}
     */
    function addQuery(pathname, query) {
      return pathname + (query ? `?${query}` : "");
    }

    /**
     * Resolve URIs as though every path is a directory, no files. Relative URIs
     * in the browser can feel awkward because not only can you be "in a directory",
     * you can be "at a file", too. For example:
     *
     *  browserSpecResolve('foo', '/bar/') => /bar/foo
     *  browserSpecResolve('foo', '/bar') => /foo
     *
     * But on the command line of a file system, it's not as complicated. You can't
     * `cd` from a file, only directories. This way, links have to know less about
     * their current path. To go deeper you can do this:
     *
     *  <Link to="deeper"/>
     *  // instead of
     *  <Link to=`{${props.uri}/deeper}`/>
     *
     * Just like `cd`, if you want to go deeper from the command line, you do this:
     *
     *  cd deeper
     *  # not
     *  cd $(pwd)/deeper
     *
     * By treating every path as a directory, linking to relative paths should
     * require less contextual information and (fingers crossed) be more intuitive.
     * @param {string} to
     * @param {string} base
     * @return {string}
     */
    function resolve(to, base) {
      // /foo/bar, /baz/qux => /foo/bar
      if (startsWith(to, "/")) {
        return to;
      }

      const [toPathname, toQuery] = to.split("?");
      const [basePathname] = base.split("?");
      const toSegments = segmentize(toPathname);
      const baseSegments = segmentize(basePathname);

      // ?a=b, /users?b=c => /users?a=b
      if (toSegments[0] === "") {
        return addQuery(basePathname, toQuery);
      }

      // profile, /users/789 => /users/789/profile
      if (!startsWith(toSegments[0], ".")) {
        const pathname = baseSegments.concat(toSegments).join("/");

        return addQuery((basePathname === "/" ? "" : "/") + pathname, toQuery);
      }

      // ./       , /users/123 => /users/123
      // ../      , /users/123 => /users
      // ../..    , /users/123 => /
      // ../../one, /a/b/c/d   => /a/b/one
      // .././one , /a/b/c/d   => /a/b/c/one
      const allSegments = baseSegments.concat(toSegments);
      const segments = [];

      allSegments.forEach(segment => {
        if (segment === "..") {
          segments.pop();
        } else if (segment !== ".") {
          segments.push(segment);
        }
      });

      return addQuery("/" + segments.join("/"), toQuery);
    }

    /**
     * Combines the `basepath` and the `path` into one path.
     * @param {string} basepath
     * @param {string} path
     */
    function combinePaths(basepath, path) {
      return `${stripSlashes(
    path === "/" ? basepath : `${stripSlashes(basepath)}/${stripSlashes(path)}`
  )}/`;
    }

    /**
     * Decides whether a given `event` should result in a navigation or not.
     * @param {object} event
     */
    function shouldNavigate(event) {
      return (
        !event.defaultPrevented &&
        event.button === 0 &&
        !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
      );
    }

    /* node_modules\svelte-routing\src\Router.svelte generated by Svelte v3.31.0 */

    function create_fragment(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(nodes);
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $base;
    	let $location;
    	let $routes;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Router", slots, ['default']);
    	let { basepath = "/" } = $$props;
    	let { url = null } = $$props;
    	const locationContext = getContext(LOCATION);
    	const routerContext = getContext(ROUTER);
    	const routes = writable([]);
    	validate_store(routes, "routes");
    	component_subscribe($$self, routes, value => $$invalidate(7, $routes = value));
    	const activeRoute = writable(null);
    	let hasActiveRoute = false; // Used in SSR to synchronously set that a Route is active.

    	// If locationContext is not set, this is the topmost Router in the tree.
    	// If the `url` prop is given we force the location to it.
    	const location = locationContext || writable(url ? { pathname: url } : globalHistory.location);

    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(6, $location = value));

    	// If routerContext is set, the routerBase of the parent Router
    	// will be the base for this Router's descendants.
    	// If routerContext is not set, the path and resolved uri will both
    	// have the value of the basepath prop.
    	const base = routerContext
    	? routerContext.routerBase
    	: writable({ path: basepath, uri: basepath });

    	validate_store(base, "base");
    	component_subscribe($$self, base, value => $$invalidate(5, $base = value));

    	const routerBase = derived([base, activeRoute], ([base, activeRoute]) => {
    		// If there is no activeRoute, the routerBase will be identical to the base.
    		if (activeRoute === null) {
    			return base;
    		}

    		const { path: basepath } = base;
    		const { route, uri } = activeRoute;

    		// Remove the potential /* or /*splatname from
    		// the end of the child Routes relative paths.
    		const path = route.default
    		? basepath
    		: route.path.replace(/\*.*$/, "");

    		return { path, uri };
    	});

    	function registerRoute(route) {
    		const { path: basepath } = $base;
    		let { path } = route;

    		// We store the original path in the _path property so we can reuse
    		// it when the basepath changes. The only thing that matters is that
    		// the route reference is intact, so mutation is fine.
    		route._path = path;

    		route.path = combinePaths(basepath, path);

    		if (typeof window === "undefined") {
    			// In SSR we should set the activeRoute immediately if it is a match.
    			// If there are more Routes being registered after a match is found,
    			// we just skip them.
    			if (hasActiveRoute) {
    				return;
    			}

    			const matchingRoute = match(route, $location.pathname);

    			if (matchingRoute) {
    				activeRoute.set(matchingRoute);
    				hasActiveRoute = true;
    			}
    		} else {
    			routes.update(rs => {
    				rs.push(route);
    				return rs;
    			});
    		}
    	}

    	function unregisterRoute(route) {
    		routes.update(rs => {
    			const index = rs.indexOf(route);
    			rs.splice(index, 1);
    			return rs;
    		});
    	}

    	if (!locationContext) {
    		// The topmost Router in the tree is responsible for updating
    		// the location store and supplying it through context.
    		onMount(() => {
    			const unlisten = globalHistory.listen(history => {
    				location.set(history.location);
    			});

    			return unlisten;
    		});

    		setContext(LOCATION, location);
    	}

    	setContext(ROUTER, {
    		activeRoute,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute
    	});

    	const writable_props = ["basepath", "url"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("basepath" in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ("url" in $$props) $$invalidate(4, url = $$props.url);
    		if ("$$scope" in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		setContext,
    		onMount,
    		writable,
    		derived,
    		LOCATION,
    		ROUTER,
    		globalHistory,
    		pick,
    		match,
    		stripSlashes,
    		combinePaths,
    		basepath,
    		url,
    		locationContext,
    		routerContext,
    		routes,
    		activeRoute,
    		hasActiveRoute,
    		location,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute,
    		$base,
    		$location,
    		$routes
    	});

    	$$self.$inject_state = $$props => {
    		if ("basepath" in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ("url" in $$props) $$invalidate(4, url = $$props.url);
    		if ("hasActiveRoute" in $$props) hasActiveRoute = $$props.hasActiveRoute;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$base*/ 32) {
    			// This reactive statement will update all the Routes' path when
    			// the basepath changes.
    			 {
    				const { path: basepath } = $base;

    				routes.update(rs => {
    					rs.forEach(r => r.path = combinePaths(basepath, r._path));
    					return rs;
    				});
    			}
    		}

    		if ($$self.$$.dirty & /*$routes, $location*/ 192) {
    			// This reactive statement will be run when the Router is created
    			// when there are no Routes and then again the following tick, so it
    			// will not find an active Route in SSR and in the browser it will only
    			// pick an active Route after all Routes have been registered.
    			 {
    				const bestMatch = pick($routes, $location.pathname);
    				activeRoute.set(bestMatch);
    			}
    		}
    	};

    	return [
    		routes,
    		location,
    		base,
    		basepath,
    		url,
    		$base,
    		$location,
    		$routes,
    		$$scope,
    		slots
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { basepath: 3, url: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get basepath() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set basepath(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-routing\src\Route.svelte generated by Svelte v3.31.0 */

    const get_default_slot_changes = dirty => ({
    	params: dirty & /*routeParams*/ 4,
    	location: dirty & /*$location*/ 16
    });

    const get_default_slot_context = ctx => ({
    	params: /*routeParams*/ ctx[2],
    	location: /*$location*/ ctx[4]
    });

    // (40:0) {#if $activeRoute !== null && $activeRoute.route === route}
    function create_if_block(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*component*/ ctx[0] !== null) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			if_block.l(nodes);
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(40:0) {#if $activeRoute !== null && $activeRoute.route === route}",
    		ctx
    	});

    	return block;
    }

    // (43:2) {:else}
    function create_else_block(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(nodes);
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope, routeParams, $location*/ 532) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[9], dirty, get_default_slot_changes, get_default_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(43:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (41:2) {#if component !== null}
    function create_if_block_1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{ location: /*$location*/ ctx[4] },
    		/*routeParams*/ ctx[2],
    		/*routeProps*/ ctx[3]
    	];

    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		l: function claim(nodes) {
    			if (switch_instance) claim_component(switch_instance.$$.fragment, nodes);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*$location, routeParams, routeProps*/ 28)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*$location*/ 16 && { location: /*$location*/ ctx[4] },
    					dirty & /*routeParams*/ 4 && get_spread_object(/*routeParams*/ ctx[2]),
    					dirty & /*routeProps*/ 8 && get_spread_object(/*routeProps*/ ctx[3])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(41:2) {#if component !== null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$activeRoute*/ ctx[1] !== null && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[7] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			if (if_block) if_block.l(nodes);
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$activeRoute*/ ctx[1] !== null && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[7]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$activeRoute*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $activeRoute;
    	let $location;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Route", slots, ['default']);
    	let { path = "" } = $$props;
    	let { component = null } = $$props;
    	const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER);
    	validate_store(activeRoute, "activeRoute");
    	component_subscribe($$self, activeRoute, value => $$invalidate(1, $activeRoute = value));
    	const location = getContext(LOCATION);
    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(4, $location = value));

    	const route = {
    		path,
    		// If no path prop is given, this Route will act as the default Route
    		// that is rendered if no other Route in the Router is a match.
    		default: path === ""
    	};

    	let routeParams = {};
    	let routeProps = {};
    	registerRoute(route);

    	// There is no need to unregister Routes in SSR since it will all be
    	// thrown away anyway.
    	if (typeof window !== "undefined") {
    		onDestroy(() => {
    			unregisterRoute(route);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("path" in $$new_props) $$invalidate(8, path = $$new_props.path);
    		if ("component" in $$new_props) $$invalidate(0, component = $$new_props.component);
    		if ("$$scope" in $$new_props) $$invalidate(9, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onDestroy,
    		ROUTER,
    		LOCATION,
    		path,
    		component,
    		registerRoute,
    		unregisterRoute,
    		activeRoute,
    		location,
    		route,
    		routeParams,
    		routeProps,
    		$activeRoute,
    		$location
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), $$new_props));
    		if ("path" in $$props) $$invalidate(8, path = $$new_props.path);
    		if ("component" in $$props) $$invalidate(0, component = $$new_props.component);
    		if ("routeParams" in $$props) $$invalidate(2, routeParams = $$new_props.routeParams);
    		if ("routeProps" in $$props) $$invalidate(3, routeProps = $$new_props.routeProps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$activeRoute*/ 2) {
    			 if ($activeRoute && $activeRoute.route === route) {
    				$$invalidate(2, routeParams = $activeRoute.params);
    			}
    		}

    		 {
    			const { path, component, ...rest } = $$props;
    			$$invalidate(3, routeProps = rest);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		component,
    		$activeRoute,
    		routeParams,
    		routeProps,
    		$location,
    		activeRoute,
    		location,
    		route,
    		path,
    		$$scope,
    		slots
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { path: 8, component: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-routing\src\Link.svelte generated by Svelte v3.31.0 */
    const file = "node_modules\\svelte-routing\\src\\Link.svelte";

    function create_fragment$2(ctx) {
    	let a;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[15].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[14], null);

    	let a_levels = [
    		{ href: /*href*/ ctx[0] },
    		{ "aria-current": /*ariaCurrent*/ ctx[2] },
    		/*props*/ ctx[1]
    	];

    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			a = claim_element(nodes, "A", { href: true, "aria-current": true });
    			var a_nodes = children(a);
    			if (default_slot) default_slot.l(a_nodes);
    			a_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			set_attributes(a, a_data);
    			add_location(a, file, 40, 0, 1249);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*onClick*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 16384) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[14], dirty, null, null);
    				}
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				(!current || dirty & /*href*/ 1) && { href: /*href*/ ctx[0] },
    				(!current || dirty & /*ariaCurrent*/ 4) && { "aria-current": /*ariaCurrent*/ ctx[2] },
    				dirty & /*props*/ 2 && /*props*/ ctx[1]
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $base;
    	let $location;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Link", slots, ['default']);
    	let { to = "#" } = $$props;
    	let { replace = false } = $$props;
    	let { state = {} } = $$props;
    	let { getProps = () => ({}) } = $$props;
    	const { base } = getContext(ROUTER);
    	validate_store(base, "base");
    	component_subscribe($$self, base, value => $$invalidate(12, $base = value));
    	const location = getContext(LOCATION);
    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(13, $location = value));
    	const dispatch = createEventDispatcher();
    	let href, isPartiallyCurrent, isCurrent, props;

    	function onClick(event) {
    		dispatch("click", event);

    		if (shouldNavigate(event)) {
    			event.preventDefault();

    			// Don't push another entry to the history stack when the user
    			// clicks on a Link to the page they are currently on.
    			const shouldReplace = $location.pathname === href || replace;

    			navigate(href, { state, replace: shouldReplace });
    		}
    	}

    	const writable_props = ["to", "replace", "state", "getProps"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Link> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("to" in $$props) $$invalidate(6, to = $$props.to);
    		if ("replace" in $$props) $$invalidate(7, replace = $$props.replace);
    		if ("state" in $$props) $$invalidate(8, state = $$props.state);
    		if ("getProps" in $$props) $$invalidate(9, getProps = $$props.getProps);
    		if ("$$scope" in $$props) $$invalidate(14, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		createEventDispatcher,
    		ROUTER,
    		LOCATION,
    		navigate,
    		startsWith,
    		resolve,
    		shouldNavigate,
    		to,
    		replace,
    		state,
    		getProps,
    		base,
    		location,
    		dispatch,
    		href,
    		isPartiallyCurrent,
    		isCurrent,
    		props,
    		onClick,
    		$base,
    		$location,
    		ariaCurrent
    	});

    	$$self.$inject_state = $$props => {
    		if ("to" in $$props) $$invalidate(6, to = $$props.to);
    		if ("replace" in $$props) $$invalidate(7, replace = $$props.replace);
    		if ("state" in $$props) $$invalidate(8, state = $$props.state);
    		if ("getProps" in $$props) $$invalidate(9, getProps = $$props.getProps);
    		if ("href" in $$props) $$invalidate(0, href = $$props.href);
    		if ("isPartiallyCurrent" in $$props) $$invalidate(10, isPartiallyCurrent = $$props.isPartiallyCurrent);
    		if ("isCurrent" in $$props) $$invalidate(11, isCurrent = $$props.isCurrent);
    		if ("props" in $$props) $$invalidate(1, props = $$props.props);
    		if ("ariaCurrent" in $$props) $$invalidate(2, ariaCurrent = $$props.ariaCurrent);
    	};

    	let ariaCurrent;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*to, $base*/ 4160) {
    			 $$invalidate(0, href = to === "/" ? $base.uri : resolve(to, $base.uri));
    		}

    		if ($$self.$$.dirty & /*$location, href*/ 8193) {
    			 $$invalidate(10, isPartiallyCurrent = startsWith($location.pathname, href));
    		}

    		if ($$self.$$.dirty & /*href, $location*/ 8193) {
    			 $$invalidate(11, isCurrent = href === $location.pathname);
    		}

    		if ($$self.$$.dirty & /*isCurrent*/ 2048) {
    			 $$invalidate(2, ariaCurrent = isCurrent ? "page" : undefined);
    		}

    		if ($$self.$$.dirty & /*getProps, $location, href, isPartiallyCurrent, isCurrent*/ 11777) {
    			 $$invalidate(1, props = getProps({
    				location: $location,
    				href,
    				isPartiallyCurrent,
    				isCurrent
    			}));
    		}
    	};

    	return [
    		href,
    		props,
    		ariaCurrent,
    		base,
    		location,
    		onClick,
    		to,
    		replace,
    		state,
    		getProps,
    		isPartiallyCurrent,
    		isCurrent,
    		$base,
    		$location,
    		$$scope,
    		slots
    	];
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { to: 6, replace: 7, state: 8, getProps: 9 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Link",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get to() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set to(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get state() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set state(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getProps() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getProps(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const chosenTheme = writable(localStorage.getItem("storedTheme"));

    const tags = writable([
        {
            id: 1,
            name: "React",
            selected: false
        },
        {
            id: 2,
            name: "Svelte",
            selected: false
        },
        {
            id: 3,
            name: "JavaScript",
            selected: false
        },
        {
            id: 4,
            name: "HTML",
            selected: false
        },
        {
            id: 5,
            name: "WordPress",
            selected: false
        },
        {
            id: 6,
            name: "CSS",
            selected: false
        },
        {
            id: 7,
            name: "Sass",
            selected: false
        },
        {
            id: 8,
            name: "BEM",
            selected: false
        },
        {
            id: 9,
            name: "APIs",
            selected: false
        },
        {
            id: 10,
            name: "PHP",
            selected: false
        },
        {
            id: 11,
            name: "Jekyll",
            selected: false
        },
    ]);

    const selectedTags = writable([]);

    const projects = writable([
        {  
            id: 1,
            name: "Catan Pisco",
            type: "Professional",
            image: "../images/catan.jpg",
            description: "Working as a two person team with Kom Creative, this is a complete redesign and implementation of Catan Pisco's official website. The static site generator Jekyll was used to structure the HTML and CSS for this project.",
            link: "https://catanpisco.com/",
            github: "https://github.com/KomCreative/catanpisco.com",
            tags: ["Jekyll", "JavaScript", "HTML", "CSS", "Sass"],
            selected: true,
        },
        {  
            id: 1,
            name: "Dogs List",
            type: "Personal",
            image: "../images/dogslist.jpg",
            description: "A React and API project. The finished product is a list of dog breeds and details, all searchable by name.",
            link: "https://sad-clarke-953af3.netlify.app",
            github: "https://github.com/DaveyDevs/doglistreactapp",
            tags: ["React", "JavaScript", "HTML", "CSS", "BEM", "APIs"],
            selected: true,
        },
        {  
            id: 2,
            name: "Cannabis Equity Illinois",
            type: "Volunteer",
            image: "../images/ceic.jpg",
            description: "Part of a volunteer initiative with Code For Chicago, this WordPress project involves working directly with clients and a team of designers and developers using Slack, Docker, Figma and other tools. My main contribution has been implementing custom page templates from a Figma design and implementing the Advanced Custom Fields plugin for easier user editing.",
            link: "https://cannabisequityil.org/",
            github: "https://github.com/Code-For-Chicago/ceic_wordpress",
            tags: ["WordPress", "PHP", "HTML", "CSS", "Sass"],
            selected: true,
        },
        {
            id: 3,
            name: "Bookmarks",
            type: "Personal",
            image: "images/bookmarks.jpg",
            description: "Are your browser bookmark lists already too full? Using vanilla JavaScript and local storage, this is a simple and handy tool to save links you want to go back to a later time.",
            link: "https://daveydevs.github.io/bookmarks/",
            github: "https://github.com/DaveyDevs/bookmarks",
            tags: ["JavaScript", "HTML", "CSS"],
            selected: true,
        },
        {
            id: 4,
            name: "The Riverbank",
            type: "Personal",
            image: "../images/riverbank.jpg",
            description: "Trying to meet the need for organizing livestreaming shows in 2020, this WordPress site was used by a number of artists to promote their upcoming online concerts. It uses third party themes and plugins that were customized with CSS and PHP.",
            link: "https://diylivestreams.com/",
            github: "https://github.com/DaveyDevs/theriverbank",
            tags: ["WordPress", "PHP", "HTML", "CSS"],
            selected: true
        },
        {
            id: 5,
            name: "This site!",
            type: "Personal",
            image: "../images/daveydevs.jpg",
            description: "Meta! This site was built with Svelte, an exciting new JavaScript framework.",
            link: "https://daveydevs.com/",
            github: "https://github.com/DaveyDevs/svelte-portfolio-site",
            tags: ["Svelte", "JavaScript", "HTML", "CSS", "Sass", "BEM"],
            selected: true,
        },
    ]);

    /* src\Header.svelte generated by Svelte v3.31.0 */
    const file$1 = "src\\Header.svelte";

    // (23:12) <Link to="/">
    function create_default_slot_4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("DaveyDevs");
    		},
    		l: function claim(nodes) {
    			t = claim_text(nodes, "DaveyDevs");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(23:12) <Link to=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (27:12) <Link to="/">
    function create_default_slot_3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Home");
    		},
    		l: function claim(nodes) {
    			t = claim_text(nodes, "Home");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(27:12) <Link to=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (28:12) <Link to="about">
    function create_default_slot_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("About");
    		},
    		l: function claim(nodes) {
    			t = claim_text(nodes, "About");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(28:12) <Link to=\\\"about\\\">",
    		ctx
    	});

    	return block;
    }

    // (29:12) <Link to="projects">
    function create_default_slot_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Projects");
    		},
    		l: function claim(nodes) {
    			t = claim_text(nodes, "Projects");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(29:12) <Link to=\\\"projects\\\">",
    		ctx
    	});

    	return block;
    }

    // (30:12) <Link to="contact">
    function create_default_slot(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Contact");
    		},
    		l: function claim(nodes) {
    			t = claim_text(nodes, "Contact");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(30:12) <Link to=\\\"contact\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let header;
    	let a;
    	let t0;
    	let t1;
    	let div1;
    	let div0;
    	let link0;
    	let t2;
    	let nav;
    	let link1;
    	let t3;
    	let link2;
    	let t4;
    	let link3;
    	let t5;
    	let link4;
    	let current;

    	link0 = new Link({
    			props: {
    				to: "/",
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link1 = new Link({
    			props: {
    				to: "/",
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link2 = new Link({
    			props: {
    				to: "about",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link3 = new Link({
    			props: {
    				to: "projects",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link4 = new Link({
    			props: {
    				to: "contact",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			header = element("header");
    			a = element("a");
    			t0 = text("Skip to content");
    			t1 = space();
    			div1 = element("div");
    			div0 = element("div");
    			create_component(link0.$$.fragment);
    			t2 = space();
    			nav = element("nav");
    			create_component(link1.$$.fragment);
    			t3 = space();
    			create_component(link2.$$.fragment);
    			t4 = space();
    			create_component(link3.$$.fragment);
    			t5 = space();
    			create_component(link4.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			header = claim_element(nodes, "HEADER", {});
    			var header_nodes = children(header);
    			a = claim_element(header_nodes, "A", { class: true, href: true });
    			var a_nodes = children(a);
    			t0 = claim_text(a_nodes, "Skip to content");
    			a_nodes.forEach(detach_dev);
    			t1 = claim_space(header_nodes);
    			div1 = claim_element(header_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			div0 = claim_element(div1_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			claim_component(link0.$$.fragment, div0_nodes);
    			div0_nodes.forEach(detach_dev);
    			t2 = claim_space(div1_nodes);
    			nav = claim_element(div1_nodes, "NAV", {});
    			var nav_nodes = children(nav);
    			claim_component(link1.$$.fragment, nav_nodes);
    			t3 = claim_space(nav_nodes);
    			claim_component(link2.$$.fragment, nav_nodes);
    			t4 = claim_space(nav_nodes);
    			claim_component(link3.$$.fragment, nav_nodes);
    			t5 = claim_space(nav_nodes);
    			claim_component(link4.$$.fragment, nav_nodes);
    			nav_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			header_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(a, "class", "skip-to-content-link svelte-1qtg7el");
    			attr_dev(a, "href", "#main");
    			add_location(a, file$1, 18, 4, 370);
    			attr_dev(div0, "class", "logo");
    			add_location(div0, file$1, 21, 8, 498);
    			add_location(nav, file$1, 25, 8, 591);
    			attr_dev(div1, "class", "header-nav");
    			add_location(div1, file$1, 20, 4, 464);
    			add_location(header, file$1, 17, 0, 356);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, a);
    			append_dev(a, t0);
    			append_dev(header, t1);
    			append_dev(header, div1);
    			append_dev(div1, div0);
    			mount_component(link0, div0, null);
    			append_dev(div1, t2);
    			append_dev(div1, nav);
    			mount_component(link1, nav, null);
    			append_dev(nav, t3);
    			mount_component(link2, nav, null);
    			append_dev(nav, t4);
    			mount_component(link3, nav, null);
    			append_dev(nav, t5);
    			mount_component(link4, nav, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const link0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link0_changes.$$scope = { dirty, ctx };
    			}

    			link0.$set(link0_changes);
    			const link1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link1_changes.$$scope = { dirty, ctx };
    			}

    			link1.$set(link1_changes);
    			const link2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link2_changes.$$scope = { dirty, ctx };
    			}

    			link2.$set(link2_changes);
    			const link3_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link3_changes.$$scope = { dirty, ctx };
    			}

    			link3.$set(link3_changes);
    			const link4_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link4_changes.$$scope = { dirty, ctx };
    			}

    			link4.$set(link4_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link0.$$.fragment, local);
    			transition_in(link1.$$.fragment, local);
    			transition_in(link2.$$.fragment, local);
    			transition_in(link3.$$.fragment, local);
    			transition_in(link4.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link0.$$.fragment, local);
    			transition_out(link1.$$.fragment, local);
    			transition_out(link2.$$.fragment, local);
    			transition_out(link3.$$.fragment, local);
    			transition_out(link4.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			destroy_component(link0);
    			destroy_component(link1);
    			destroy_component(link2);
    			destroy_component(link3);
    			destroy_component(link4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Header", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Link });
    	return [];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    /* src\Themes.svelte generated by Svelte v3.31.0 */
    const file$2 = "src\\Themes.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (81:4) {#if show}
    function create_if_block$1(ctx) {
    	let div;
    	let div_transition;
    	let current;
    	let each_value = /*themes*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", {});
    			var div_nodes = children(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(div_nodes);
    			}

    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			add_location(div, file$2, 81, 8, 1923);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*themes, changeTheme*/ 40) {
    				each_value = /*themes*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(81:4) {#if show}",
    		ctx
    	});

    	return block;
    }

    // (83:12) {#each themes as theme}
    function create_each_block(ctx) {
    	let button;
    	let t_value = /*theme*/ ctx[6].name + "";
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(t_value);
    			this.h();
    		},
    		l: function claim(nodes) {
    			button = claim_element(nodes, "BUTTON", { class: true, style: true });
    			var button_nodes = children(button);
    			t = claim_text(button_nodes, t_value);
    			button_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(button, "class", "theme-button");
    			set_style(button, "background", /*theme*/ ctx[6].background);
    			set_style(button, "color", /*theme*/ ctx[6].text);
    			set_style(button, "border", ".2rem dashed " + /*theme*/ ctx[6].primary);
    			add_location(button, file$2, 83, 16, 1999);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*changeTheme*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(83:12) {#each themes as theme}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let p0;
    	let t0;
    	let t1;
    	let p1;
    	let t2;
    	let span;

    	let t3_value = (/*$chosenTheme*/ ctx[2]
    	? /*$chosenTheme*/ ctx[2]
    	: "default") + "";

    	let t3;
    	let t4;
    	let div;
    	let button;
    	let t5;
    	let t6;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*show*/ ctx[0] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			p0 = element("p");
    			t0 = text("This site has a variety of themes.");
    			t1 = space();
    			p1 = element("p");
    			t2 = text("Current theme:\r\n    ");
    			span = element("span");
    			t3 = text(t3_value);
    			t4 = space();
    			div = element("div");
    			button = element("button");
    			t5 = text(/*showThemesText*/ ctx[1]);
    			t6 = space();
    			if (if_block) if_block.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			p0 = claim_element(nodes, "P", {});
    			var p0_nodes = children(p0);
    			t0 = claim_text(p0_nodes, "This site has a variety of themes.");
    			p0_nodes.forEach(detach_dev);
    			t1 = claim_space(nodes);
    			p1 = claim_element(nodes, "P", {});
    			var p1_nodes = children(p1);
    			t2 = claim_text(p1_nodes, "Current theme:\r\n    ");
    			span = claim_element(p1_nodes, "SPAN", { class: true });
    			var span_nodes = children(span);
    			t3 = claim_text(span_nodes, t3_value);
    			span_nodes.forEach(detach_dev);
    			p1_nodes.forEach(detach_dev);
    			t4 = claim_space(nodes);
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			button = claim_element(div_nodes, "BUTTON", {});
    			var button_nodes = children(button);
    			t5 = claim_text(button_nodes, /*showThemesText*/ ctx[1]);
    			button_nodes.forEach(detach_dev);
    			t6 = claim_space(div_nodes);
    			if (if_block) if_block.l(div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			add_location(p0, file$2, 72, 0, 1645);
    			attr_dev(span, "class", "showCurrentTheme");
    			add_location(span, file$2, 75, 4, 1717);
    			add_location(p1, file$2, 73, 0, 1688);
    			add_location(button, file$2, 79, 4, 1842);
    			attr_dev(div, "class", "container");
    			add_location(div, file$2, 78, 0, 1813);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p0, anchor);
    			append_dev(p0, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p1, anchor);
    			append_dev(p1, t2);
    			append_dev(p1, span);
    			append_dev(span, t3);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			append_dev(button, t5);
    			append_dev(div, t6);
    			if (if_block) if_block.m(div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*showThemes*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*$chosenTheme*/ 4) && t3_value !== (t3_value = (/*$chosenTheme*/ ctx[2]
    			? /*$chosenTheme*/ ctx[2]
    			: "default") + "")) set_data_dev(t3, t3_value);

    			if (!current || dirty & /*showThemesText*/ 2) set_data_dev(t5, /*showThemesText*/ ctx[1]);

    			if (/*show*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*show*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $chosenTheme;
    	validate_store(chosenTheme, "chosenTheme");
    	component_subscribe($$self, chosenTheme, $$value => $$invalidate(2, $chosenTheme = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Themes", slots, []);
    	let show = false;
    	let showThemesText = "Press here to change theme";

    	let themes = [
    		{
    			id: 1,
    			name: "default",
    			text: "#1b2d45",
    			background: "#fffffe",
    			primary: "#00dbc1"
    		},
    		{
    			id: 2,
    			name: "dark",
    			text: "#fffffe",
    			background: "#1b2d45",
    			primary: "#00dbc1"
    		},
    		{
    			id: 3,
    			name: "oled",
    			text: "#fffffe",
    			background: "#000",
    			primary: "#00dbc1"
    		},
    		{
    			id: 4,
    			name: "purple",
    			text: "#010101",
    			background: " #7f5af0",
    			primary: "#00dbc1"
    		},
    		{
    			id: 5,
    			name: "burnt",
    			text: "#fffffe",
    			background: "#000",
    			primary: "#ff8906"
    		},
    		{
    			id: 6,
    			name: "greyed",
    			text: "#020826",
    			background: "#f9f4ef",
    			primary: "#c2c2c2"
    		}
    	];

    	const showThemes = () => {
    		$$invalidate(0, show = !show);
    		$$invalidate(1, showThemesText = "Press here to change theme");

    		if (show) {
    			$$invalidate(1, showThemesText = "Hide themes");
    		}
    	};

    	const changeTheme = theme => {
    		set_store_value(chosenTheme, $chosenTheme = theme.target.innerText, $chosenTheme);
    		localStorage.setItem("storedTheme", $chosenTheme);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Themes> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		fade,
    		chosenTheme,
    		show,
    		showThemesText,
    		themes,
    		showThemes,
    		changeTheme,
    		$chosenTheme
    	});

    	$$self.$inject_state = $$props => {
    		if ("show" in $$props) $$invalidate(0, show = $$props.show);
    		if ("showThemesText" in $$props) $$invalidate(1, showThemesText = $$props.showThemesText);
    		if ("themes" in $$props) $$invalidate(3, themes = $$props.themes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [show, showThemesText, $chosenTheme, themes, showThemes, changeTheme];
    }

    class Themes extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Themes",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\Footer.svelte generated by Svelte v3.31.0 */
    const file$3 = "src\\Footer.svelte";

    // (15:8) <Link to="/">
    function create_default_slot_3$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Home");
    		},
    		l: function claim(nodes) {
    			t = claim_text(nodes, "Home");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$1.name,
    		type: "slot",
    		source: "(15:8) <Link to=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (16:8) <Link to="about">
    function create_default_slot_2$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("About");
    		},
    		l: function claim(nodes) {
    			t = claim_text(nodes, "About");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(16:8) <Link to=\\\"about\\\">",
    		ctx
    	});

    	return block;
    }

    // (17:8) <Link to="projects">
    function create_default_slot_1$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Projects");
    		},
    		l: function claim(nodes) {
    			t = claim_text(nodes, "Projects");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(17:8) <Link to=\\\"projects\\\">",
    		ctx
    	});

    	return block;
    }

    // (18:8) <Link to="contact">
    function create_default_slot$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Contact");
    		},
    		l: function claim(nodes) {
    			t = claim_text(nodes, "Contact");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(18:8) <Link to=\\\"contact\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let footer;
    	let hr;
    	let t0;
    	let themes;
    	let t1;
    	let nav;
    	let link0;
    	let t2;
    	let link1;
    	let t3;
    	let link2;
    	let t4;
    	let link3;
    	let t5;
    	let div;
    	let p;
    	let t6;
    	let t7;
    	let a;
    	let t8;
    	let current;
    	themes = new Themes({ $$inline: true });

    	link0 = new Link({
    			props: {
    				to: "/",
    				$$slots: { default: [create_default_slot_3$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link1 = new Link({
    			props: {
    				to: "about",
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link2 = new Link({
    			props: {
    				to: "projects",
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link3 = new Link({
    			props: {
    				to: "contact",
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			hr = element("hr");
    			t0 = space();
    			create_component(themes.$$.fragment);
    			t1 = space();
    			nav = element("nav");
    			create_component(link0.$$.fragment);
    			t2 = space();
    			create_component(link1.$$.fragment);
    			t3 = space();
    			create_component(link2.$$.fragment);
    			t4 = space();
    			create_component(link3.$$.fragment);
    			t5 = space();
    			div = element("div");
    			p = element("p");
    			t6 = text("Copyright (c) 2021 DaveyDevs");
    			t7 = space();
    			a = element("a");
    			t8 = text("MIT License");
    			this.h();
    		},
    		l: function claim(nodes) {
    			footer = claim_element(nodes, "FOOTER", {});
    			var footer_nodes = children(footer);
    			hr = claim_element(footer_nodes, "HR", {});
    			t0 = claim_space(footer_nodes);
    			claim_component(themes.$$.fragment, footer_nodes);
    			t1 = claim_space(footer_nodes);
    			nav = claim_element(footer_nodes, "NAV", {});
    			var nav_nodes = children(nav);
    			claim_component(link0.$$.fragment, nav_nodes);
    			t2 = claim_space(nav_nodes);
    			claim_component(link1.$$.fragment, nav_nodes);
    			t3 = claim_space(nav_nodes);
    			claim_component(link2.$$.fragment, nav_nodes);
    			t4 = claim_space(nav_nodes);
    			claim_component(link3.$$.fragment, nav_nodes);
    			t5 = claim_space(nav_nodes);
    			div = claim_element(nav_nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			p = claim_element(div_nodes, "P", {});
    			var p_nodes = children(p);
    			t6 = claim_text(p_nodes, "Copyright (c) 2021 DaveyDevs");
    			p_nodes.forEach(detach_dev);
    			t7 = claim_space(div_nodes);
    			a = claim_element(div_nodes, "A", { href: true });
    			var a_nodes = children(a);
    			t8 = claim_text(a_nodes, "MIT License");
    			a_nodes.forEach(detach_dev);
    			div_nodes.forEach(detach_dev);
    			nav_nodes.forEach(detach_dev);
    			footer_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			add_location(hr, file$3, 11, 4, 192);
    			add_location(p, file$3, 21, 8, 484);
    			attr_dev(a, "href", "https://opensource.org/licenses/MIT");
    			add_location(a, file$3, 22, 8, 529);
    			attr_dev(div, "class", "creds svelte-o6gkko");
    			add_location(div, file$3, 20, 8, 455);
    			add_location(nav, file$3, 13, 4, 220);
    			add_location(footer, file$3, 10, 0, 178);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, hr);
    			append_dev(footer, t0);
    			mount_component(themes, footer, null);
    			append_dev(footer, t1);
    			append_dev(footer, nav);
    			mount_component(link0, nav, null);
    			append_dev(nav, t2);
    			mount_component(link1, nav, null);
    			append_dev(nav, t3);
    			mount_component(link2, nav, null);
    			append_dev(nav, t4);
    			mount_component(link3, nav, null);
    			append_dev(nav, t5);
    			append_dev(nav, div);
    			append_dev(div, p);
    			append_dev(p, t6);
    			append_dev(div, t7);
    			append_dev(div, a);
    			append_dev(a, t8);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const link0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link0_changes.$$scope = { dirty, ctx };
    			}

    			link0.$set(link0_changes);
    			const link1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link1_changes.$$scope = { dirty, ctx };
    			}

    			link1.$set(link1_changes);
    			const link2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link2_changes.$$scope = { dirty, ctx };
    			}

    			link2.$set(link2_changes);
    			const link3_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link3_changes.$$scope = { dirty, ctx };
    			}

    			link3.$set(link3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(themes.$$.fragment, local);
    			transition_in(link0.$$.fragment, local);
    			transition_in(link1.$$.fragment, local);
    			transition_in(link2.$$.fragment, local);
    			transition_in(link3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(themes.$$.fragment, local);
    			transition_out(link0.$$.fragment, local);
    			transition_out(link1.$$.fragment, local);
    			transition_out(link2.$$.fragment, local);
    			transition_out(link3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    			destroy_component(themes);
    			destroy_component(link0);
    			destroy_component(link1);
    			destroy_component(link2);
    			destroy_component(link3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Footer", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Link, Themes });
    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\pages\Home.svelte generated by Svelte v3.31.0 */

    const file$4 = "src\\pages\\Home.svelte";

    function create_fragment$6(ctx) {
    	let div1;
    	let h2;
    	let t0;
    	let span0;
    	let t1;
    	let t2;
    	let span1;
    	let t3;
    	let t4;
    	let t5;
    	let div0;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h2 = element("h2");
    			t0 = text("Front-end web development with an emphasis on\r\n        ");
    			span0 = element("span");
    			t1 = text("accessibility");
    			t2 = text("\r\n        and ");
    			span1 = element("span");
    			t3 = text("user-conscious design");
    			t4 = text(".");
    			t5 = space();
    			div0 = element("div");
    			img = element("img");
    			this.h();
    		},
    		l: function claim(nodes) {
    			div1 = claim_element(nodes, "DIV", { class: true, id: true });
    			var div1_nodes = children(div1);
    			h2 = claim_element(div1_nodes, "H2", { class: true });
    			var h2_nodes = children(h2);
    			t0 = claim_text(h2_nodes, "Front-end web development with an emphasis on\r\n        ");
    			span0 = claim_element(h2_nodes, "SPAN", { class: true });
    			var span0_nodes = children(span0);
    			t1 = claim_text(span0_nodes, "accessibility");
    			span0_nodes.forEach(detach_dev);
    			t2 = claim_text(h2_nodes, "\r\n        and ");
    			span1 = claim_element(h2_nodes, "SPAN", { class: true });
    			var span1_nodes = children(span1);
    			t3 = claim_text(span1_nodes, "user-conscious design");
    			span1_nodes.forEach(detach_dev);
    			t4 = claim_text(h2_nodes, ".");
    			h2_nodes.forEach(detach_dev);
    			t5 = claim_space(div1_nodes);
    			div0 = claim_element(div1_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			img = claim_element(div0_nodes, "IMG", { class: true, src: true, alt: true });
    			div0_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(span0, "class", "highlight");
    			add_location(span0, file$4, 18, 8, 436);
    			attr_dev(span1, "class", "highlight");
    			add_location(span1, file$4, 19, 12, 494);
    			attr_dev(h2, "class", "intro__header svelte-1i196mj");
    			add_location(h2, file$4, 16, 4, 345);
    			attr_dev(img, "class", "intro__image");
    			if (img.src !== (img_src_value = "/images/me.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Davey facing the camera and standing on an above-ground train platform at night.");
    			add_location(img, file$4, 22, 8, 626);
    			attr_dev(div0, "class", "image-container intro__image-container svelte-1i196mj");
    			add_location(div0, file$4, 21, 4, 564);
    			attr_dev(div1, "class", "container flex intro svelte-1i196mj");
    			attr_dev(div1, "id", "main");
    			add_location(div1, file$4, 15, 0, 295);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h2);
    			append_dev(h2, t0);
    			append_dev(h2, span0);
    			append_dev(span0, t1);
    			append_dev(h2, t2);
    			append_dev(h2, span1);
    			append_dev(span1, t3);
    			append_dev(h2, t4);
    			append_dev(div1, t5);
    			append_dev(div1, div0);
    			append_dev(div0, img);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Home", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\pages\About.svelte generated by Svelte v3.31.0 */
    const file$5 = "src\\pages\\About.svelte";

    // (11:37) <Link to="projects">
    function create_default_slot_1$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("here");
    		},
    		l: function claim(nodes) {
    			t = claim_text(nodes, "here");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(11:37) <Link to=\\\"projects\\\">",
    		ctx
    	});

    	return block;
    }

    // (11:93) <Link to="contact">
    function create_default_slot$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("reach out");
    		},
    		l: function claim(nodes) {
    			t = claim_text(nodes, "reach out");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(11:93) <Link to=\\\"contact\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div;
    	let h2;
    	let t0;
    	let t1;
    	let h30;
    	let t2;
    	let t3;
    	let p0;
    	let t4;
    	let a0;
    	let t5;
    	let t6;
    	let a1;
    	let t7;
    	let t8;
    	let a2;
    	let t9;
    	let t10;
    	let a3;
    	let t11;
    	let t12;
    	let t13;
    	let p1;
    	let t14;
    	let span0;
    	let t15;
    	let t16;
    	let span1;
    	let t17;
    	let t18;
    	let span2;
    	let t19;
    	let t20;
    	let t21;
    	let p2;
    	let t22;
    	let link0;
    	let t23;
    	let link1;
    	let t24;
    	let t25;
    	let h31;
    	let t26;
    	let t27;
    	let p3;
    	let t28;
    	let span3;
    	let t29;
    	let t30;
    	let span4;
    	let t31;
    	let t32;
    	let span5;
    	let t33;
    	let t34;
    	let t35;
    	let p4;
    	let t36;
    	let a4;
    	let t37;
    	let t38;
    	let current;

    	link0 = new Link({
    			props: {
    				to: "projects",
    				$$slots: { default: [create_default_slot_1$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link1 = new Link({
    			props: {
    				to: "contact",
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			t0 = text(/*pageName*/ ctx[0]);
    			t1 = space();
    			h30 = element("h3");
    			t2 = text("My name is Davey Anians and I am an association professional currently transitioning into web development.");
    			t3 = space();
    			p0 = element("p");
    			t4 = text("I'm a member of ");
    			a0 = element("a");
    			t5 = text("Kom Creative");
    			t6 = text(" and volunteer with ");
    			a1 = element("a");
    			t7 = text("Code for Chicago");
    			t8 = text(", ");
    			a2 = element("a");
    			t9 = text("Chi Hack Night");
    			t10 = text(", and the ");
    			a3 = element("a");
    			t11 = text("Chi Commons Cooperative");
    			t12 = text(". Born and raised in the Chicago area, I spend my free time immersed in the local music scene and performing and organizing shows both at home and throughout the US.");
    			t13 = space();
    			p1 = element("p");
    			t14 = text("I truly enjoy coding and problem solving, especially using JavaScript and frameworks like ");
    			span0 = element("span");
    			t15 = text("React");
    			t16 = text(" and ");
    			span1 = element("span");
    			t17 = text("Svelte");
    			t18 = text(". I also have experience building and developing sites with ");
    			span2 = element("span");
    			t19 = text("WordPress");
    			t20 = text(".");
    			t21 = space();
    			p2 = element("p");
    			t22 = text("Check out some of my projects ");
    			create_component(link0.$$.fragment);
    			t23 = text(" and please feel free to ");
    			create_component(link1.$$.fragment);
    			t24 = text(" and learn more about what I've been up to!");
    			t25 = space();
    			h31 = element("h3");
    			t26 = text("What do I mean by accessibility and user-conscious design?");
    			t27 = space();
    			p3 = element("p");
    			t28 = text("I do my best to continue learning ways to help create an ");
    			span3 = element("span");
    			t29 = text("inclusive");
    			t30 = text(", ");
    			span4 = element("span");
    			t31 = text("accessible");
    			t32 = text(", and ");
    			span5 = element("span");
    			t33 = text("secure web");
    			t34 = text(". To me, being user-conscious means paying attention to how different users may experience my sites differently and that device and internet limitations means thinking about resiliency and responsiveness when making decisions on what tools and techniques to use.");
    			t35 = space();
    			p4 = element("p");
    			t36 = text("While accessibility should never be just a list to check off, I try to make sure that all sites I work on pay attention to the basic ");
    			a4 = element("a");
    			t37 = text("WCAG guidelines");
    			t38 = text(" and incorporate semantic HTML, color contrast, keyboard use, tab order, focus styles, image descriptions, and more.");
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true, id: true });
    			var div_nodes = children(div);
    			h2 = claim_element(div_nodes, "H2", {});
    			var h2_nodes = children(h2);
    			t0 = claim_text(h2_nodes, /*pageName*/ ctx[0]);
    			h2_nodes.forEach(detach_dev);
    			t1 = claim_space(div_nodes);
    			h30 = claim_element(div_nodes, "H3", {});
    			var h30_nodes = children(h30);
    			t2 = claim_text(h30_nodes, "My name is Davey Anians and I am an association professional currently transitioning into web development.");
    			h30_nodes.forEach(detach_dev);
    			t3 = claim_space(div_nodes);
    			p0 = claim_element(div_nodes, "P", {});
    			var p0_nodes = children(p0);
    			t4 = claim_text(p0_nodes, "I'm a member of ");
    			a0 = claim_element(p0_nodes, "A", { href: true });
    			var a0_nodes = children(a0);
    			t5 = claim_text(a0_nodes, "Kom Creative");
    			a0_nodes.forEach(detach_dev);
    			t6 = claim_text(p0_nodes, " and volunteer with ");
    			a1 = claim_element(p0_nodes, "A", { href: true });
    			var a1_nodes = children(a1);
    			t7 = claim_text(a1_nodes, "Code for Chicago");
    			a1_nodes.forEach(detach_dev);
    			t8 = claim_text(p0_nodes, ", ");
    			a2 = claim_element(p0_nodes, "A", { href: true });
    			var a2_nodes = children(a2);
    			t9 = claim_text(a2_nodes, "Chi Hack Night");
    			a2_nodes.forEach(detach_dev);
    			t10 = claim_text(p0_nodes, ", and the ");
    			a3 = claim_element(p0_nodes, "A", { href: true });
    			var a3_nodes = children(a3);
    			t11 = claim_text(a3_nodes, "Chi Commons Cooperative");
    			a3_nodes.forEach(detach_dev);
    			t12 = claim_text(p0_nodes, ". Born and raised in the Chicago area, I spend my free time immersed in the local music scene and performing and organizing shows both at home and throughout the US.");
    			p0_nodes.forEach(detach_dev);
    			t13 = claim_space(div_nodes);
    			p1 = claim_element(div_nodes, "P", {});
    			var p1_nodes = children(p1);
    			t14 = claim_text(p1_nodes, "I truly enjoy coding and problem solving, especially using JavaScript and frameworks like ");
    			span0 = claim_element(p1_nodes, "SPAN", { class: true });
    			var span0_nodes = children(span0);
    			t15 = claim_text(span0_nodes, "React");
    			span0_nodes.forEach(detach_dev);
    			t16 = claim_text(p1_nodes, " and ");
    			span1 = claim_element(p1_nodes, "SPAN", { class: true });
    			var span1_nodes = children(span1);
    			t17 = claim_text(span1_nodes, "Svelte");
    			span1_nodes.forEach(detach_dev);
    			t18 = claim_text(p1_nodes, ". I also have experience building and developing sites with ");
    			span2 = claim_element(p1_nodes, "SPAN", { class: true });
    			var span2_nodes = children(span2);
    			t19 = claim_text(span2_nodes, "WordPress");
    			span2_nodes.forEach(detach_dev);
    			t20 = claim_text(p1_nodes, ".");
    			p1_nodes.forEach(detach_dev);
    			t21 = claim_space(div_nodes);
    			p2 = claim_element(div_nodes, "P", {});
    			var p2_nodes = children(p2);
    			t22 = claim_text(p2_nodes, "Check out some of my projects ");
    			claim_component(link0.$$.fragment, p2_nodes);
    			t23 = claim_text(p2_nodes, " and please feel free to ");
    			claim_component(link1.$$.fragment, p2_nodes);
    			t24 = claim_text(p2_nodes, " and learn more about what I've been up to!");
    			p2_nodes.forEach(detach_dev);
    			t25 = claim_space(div_nodes);
    			h31 = claim_element(div_nodes, "H3", {});
    			var h31_nodes = children(h31);
    			t26 = claim_text(h31_nodes, "What do I mean by accessibility and user-conscious design?");
    			h31_nodes.forEach(detach_dev);
    			t27 = claim_space(div_nodes);
    			p3 = claim_element(div_nodes, "P", {});
    			var p3_nodes = children(p3);
    			t28 = claim_text(p3_nodes, "I do my best to continue learning ways to help create an ");
    			span3 = claim_element(p3_nodes, "SPAN", { class: true });
    			var span3_nodes = children(span3);
    			t29 = claim_text(span3_nodes, "inclusive");
    			span3_nodes.forEach(detach_dev);
    			t30 = claim_text(p3_nodes, ", ");
    			span4 = claim_element(p3_nodes, "SPAN", { class: true });
    			var span4_nodes = children(span4);
    			t31 = claim_text(span4_nodes, "accessible");
    			span4_nodes.forEach(detach_dev);
    			t32 = claim_text(p3_nodes, ", and ");
    			span5 = claim_element(p3_nodes, "SPAN", { class: true });
    			var span5_nodes = children(span5);
    			t33 = claim_text(span5_nodes, "secure web");
    			span5_nodes.forEach(detach_dev);
    			t34 = claim_text(p3_nodes, ". To me, being user-conscious means paying attention to how different users may experience my sites differently and that device and internet limitations means thinking about resiliency and responsiveness when making decisions on what tools and techniques to use.");
    			p3_nodes.forEach(detach_dev);
    			t35 = claim_space(div_nodes);
    			p4 = claim_element(div_nodes, "P", {});
    			var p4_nodes = children(p4);
    			t36 = claim_text(p4_nodes, "While accessibility should never be just a list to check off, I try to make sure that all sites I work on pay attention to the basic ");
    			a4 = claim_element(p4_nodes, "A", { href: true });
    			var a4_nodes = children(a4);
    			t37 = claim_text(a4_nodes, "WCAG guidelines");
    			a4_nodes.forEach(detach_dev);
    			t38 = claim_text(p4_nodes, " and incorporate semantic HTML, color contrast, keyboard use, tab order, focus styles, image descriptions, and more.");
    			p4_nodes.forEach(detach_dev);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			add_location(h2, file$5, 6, 4, 142);
    			add_location(h30, file$5, 7, 4, 167);
    			attr_dev(a0, "href", "https://komcreative.com/");
    			add_location(a0, file$5, 8, 23, 307);
    			attr_dev(a1, "href", "https://codeforchicago.org/");
    			add_location(a1, file$5, 8, 94, 378);
    			attr_dev(a2, "href", "https://chihacknight.org/");
    			add_location(a2, file$5, 8, 154, 438);
    			attr_dev(a3, "href", "https://www.chicommons.coop/");
    			add_location(a3, file$5, 8, 218, 502);
    			add_location(p0, file$5, 8, 4, 288);
    			attr_dev(span0, "class", "highlight");
    			add_location(span0, file$5, 9, 97, 836);
    			attr_dev(span1, "class", "highlight");
    			add_location(span1, file$5, 9, 138, 877);
    			attr_dev(span2, "class", "highlight");
    			add_location(span2, file$5, 9, 235, 974);
    			add_location(p1, file$5, 9, 4, 743);
    			add_location(p2, file$5, 10, 4, 1025);
    			add_location(h31, file$5, 11, 4, 1202);
    			attr_dev(span3, "class", "highlight");
    			add_location(span3, file$5, 12, 64, 1335);
    			attr_dev(span4, "class", "highlight");
    			add_location(span4, file$5, 12, 106, 1377);
    			attr_dev(span5, "class", "highlight");
    			add_location(span5, file$5, 12, 153, 1424);
    			add_location(p3, file$5, 12, 4, 1275);
    			attr_dev(a4, "href", "https://www.w3.org/WAI/standards-guidelines/wcag/");
    			add_location(a4, file$5, 13, 140, 1873);
    			add_location(p4, file$5, 13, 4, 1737);
    			attr_dev(div, "class", "container");
    			attr_dev(div, "id", "main");
    			add_location(div, file$5, 5, 0, 103);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(h2, t0);
    			append_dev(div, t1);
    			append_dev(div, h30);
    			append_dev(h30, t2);
    			append_dev(div, t3);
    			append_dev(div, p0);
    			append_dev(p0, t4);
    			append_dev(p0, a0);
    			append_dev(a0, t5);
    			append_dev(p0, t6);
    			append_dev(p0, a1);
    			append_dev(a1, t7);
    			append_dev(p0, t8);
    			append_dev(p0, a2);
    			append_dev(a2, t9);
    			append_dev(p0, t10);
    			append_dev(p0, a3);
    			append_dev(a3, t11);
    			append_dev(p0, t12);
    			append_dev(div, t13);
    			append_dev(div, p1);
    			append_dev(p1, t14);
    			append_dev(p1, span0);
    			append_dev(span0, t15);
    			append_dev(p1, t16);
    			append_dev(p1, span1);
    			append_dev(span1, t17);
    			append_dev(p1, t18);
    			append_dev(p1, span2);
    			append_dev(span2, t19);
    			append_dev(p1, t20);
    			append_dev(div, t21);
    			append_dev(div, p2);
    			append_dev(p2, t22);
    			mount_component(link0, p2, null);
    			append_dev(p2, t23);
    			mount_component(link1, p2, null);
    			append_dev(p2, t24);
    			append_dev(div, t25);
    			append_dev(div, h31);
    			append_dev(h31, t26);
    			append_dev(div, t27);
    			append_dev(div, p3);
    			append_dev(p3, t28);
    			append_dev(p3, span3);
    			append_dev(span3, t29);
    			append_dev(p3, t30);
    			append_dev(p3, span4);
    			append_dev(span4, t31);
    			append_dev(p3, t32);
    			append_dev(p3, span5);
    			append_dev(span5, t33);
    			append_dev(p3, t34);
    			append_dev(div, t35);
    			append_dev(div, p4);
    			append_dev(p4, t36);
    			append_dev(p4, a4);
    			append_dev(a4, t37);
    			append_dev(p4, t38);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const link0_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				link0_changes.$$scope = { dirty, ctx };
    			}

    			link0.$set(link0_changes);
    			const link1_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				link1_changes.$$scope = { dirty, ctx };
    			}

    			link1.$set(link1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link0.$$.fragment, local);
    			transition_in(link1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link0.$$.fragment, local);
    			transition_out(link1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(link0);
    			destroy_component(link1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("About", slots, []);
    	let pageName = "About Me";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Link, pageName });

    	$$self.$inject_state = $$props => {
    		if ("pageName" in $$props) $$invalidate(0, pageName = $$props.pageName);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [pageName];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\pages\Projects.svelte generated by Svelte v3.31.0 */
    const file$6 = "src\\pages\\Projects.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	child_ctx[12] = list;
    	child_ctx[13] = i;
    	return child_ctx;
    }

    // (125:20) {#each $tags as tag}
    function create_each_block_2(ctx) {
    	let div;
    	let input;
    	let input_id_value;
    	let t0;
    	let label;
    	let t1_value = /*tag*/ ctx[9].name + "";
    	let t1;
    	let label_for_value;
    	let t2;
    	let mounted;
    	let dispose;

    	function input_change_handler() {
    		/*input_change_handler*/ ctx[4].call(input, /*each_value_2*/ ctx[12], /*tag_index_1*/ ctx[13]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t0 = space();
    			label = element("label");
    			t1 = text(t1_value);
    			t2 = space();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			input = claim_element(div_nodes, "INPUT", { id: true, type: true, class: true });
    			t0 = claim_space(div_nodes);
    			label = claim_element(div_nodes, "LABEL", { for: true, class: true });
    			var label_nodes = children(label);
    			t1 = claim_text(label_nodes, t1_value);
    			label_nodes.forEach(detach_dev);
    			t2 = claim_space(div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(input, "id", input_id_value = /*tag*/ ctx[9].name);
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "class", "svelte-z5u56n");
    			add_location(input, file$6, 126, 28, 3700);
    			attr_dev(label, "for", label_for_value = /*tag*/ ctx[9].name);
    			attr_dev(label, "class", "svelte-z5u56n");
    			add_location(label, file$6, 127, 28, 3813);
    			attr_dev(div, "class", "tags-group__checkbox svelte-z5u56n");
    			add_location(div, file$6, 125, 24, 3636);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			input.checked = /*tag*/ ctx[9].selected;
    			append_dev(div, t0);
    			append_dev(div, label);
    			append_dev(label, t1);
    			append_dev(div, t2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "click", /*select*/ ctx[3], false, false, false),
    					listen_dev(input, "change", input_change_handler)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*$tags*/ 2 && input_id_value !== (input_id_value = /*tag*/ ctx[9].name)) {
    				attr_dev(input, "id", input_id_value);
    			}

    			if (dirty & /*$tags*/ 2) {
    				input.checked = /*tag*/ ctx[9].selected;
    			}

    			if (dirty & /*$tags*/ 2 && t1_value !== (t1_value = /*tag*/ ctx[9].name + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*$tags*/ 2 && label_for_value !== (label_for_value = /*tag*/ ctx[9].name)) {
    				attr_dev(label, "for", label_for_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(125:20) {#each $tags as tag}",
    		ctx
    	});

    	return block;
    }

    // (138:20) {#if project.selected}
    function create_if_block$2(ctx) {
    	let li;
    	let h3;
    	let a0;
    	let t0_value = /*project*/ ctx[6].name + "";
    	let t0;
    	let t1;
    	let t2_value = /*project*/ ctx[6].type + "";
    	let t2;
    	let t3;
    	let a0_href_value;
    	let t4;
    	let div1;
    	let p0;
    	let t5_value = /*project*/ ctx[6].description + "";
    	let t5;
    	let t6;
    	let div0;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t7;
    	let p1;
    	let a1;
    	let t8_value = /*project*/ ctx[6].name + "";
    	let t8;
    	let t9;
    	let a1_href_value;
    	let t10;
    	let div3;
    	let p2;
    	let t11;
    	let t12;
    	let div2;
    	let t13;
    	let each_value_1 = /*project*/ ctx[6].tags;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			h3 = element("h3");
    			a0 = element("a");
    			t0 = text(t0_value);
    			t1 = text(" (");
    			t2 = text(t2_value);
    			t3 = text(")");
    			t4 = space();
    			div1 = element("div");
    			p0 = element("p");
    			t5 = text(t5_value);
    			t6 = space();
    			div0 = element("div");
    			img = element("img");
    			t7 = space();
    			p1 = element("p");
    			a1 = element("a");
    			t8 = text(t8_value);
    			t9 = text(" on GitHub");
    			t10 = space();
    			div3 = element("div");
    			p2 = element("p");
    			t11 = text("This project uses:");
    			t12 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t13 = space();
    			this.h();
    		},
    		l: function claim(nodes) {
    			li = claim_element(nodes, "LI", { class: true });
    			var li_nodes = children(li);
    			h3 = claim_element(li_nodes, "H3", {});
    			var h3_nodes = children(h3);
    			a0 = claim_element(h3_nodes, "A", { href: true });
    			var a0_nodes = children(a0);
    			t0 = claim_text(a0_nodes, t0_value);
    			t1 = claim_text(a0_nodes, " (");
    			t2 = claim_text(a0_nodes, t2_value);
    			t3 = claim_text(a0_nodes, ")");
    			a0_nodes.forEach(detach_dev);
    			h3_nodes.forEach(detach_dev);
    			t4 = claim_space(li_nodes);
    			div1 = claim_element(li_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			p0 = claim_element(div1_nodes, "P", { class: true });
    			var p0_nodes = children(p0);
    			t5 = claim_text(p0_nodes, t5_value);
    			p0_nodes.forEach(detach_dev);
    			t6 = claim_space(div1_nodes);
    			div0 = claim_element(div1_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			img = claim_element(div0_nodes, "IMG", { class: true, src: true, alt: true });
    			div0_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			t7 = claim_space(li_nodes);
    			p1 = claim_element(li_nodes, "P", {});
    			var p1_nodes = children(p1);
    			a1 = claim_element(p1_nodes, "A", { href: true });
    			var a1_nodes = children(a1);
    			t8 = claim_text(a1_nodes, t8_value);
    			t9 = claim_text(a1_nodes, " on GitHub");
    			a1_nodes.forEach(detach_dev);
    			p1_nodes.forEach(detach_dev);
    			t10 = claim_space(li_nodes);
    			div3 = claim_element(li_nodes, "DIV", { class: true });
    			var div3_nodes = children(div3);
    			p2 = claim_element(div3_nodes, "P", {});
    			var p2_nodes = children(p2);
    			t11 = claim_text(p2_nodes, "This project uses:");
    			p2_nodes.forEach(detach_dev);
    			t12 = claim_space(div3_nodes);
    			div2 = claim_element(div3_nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(div2_nodes);
    			}

    			div2_nodes.forEach(detach_dev);
    			div3_nodes.forEach(detach_dev);
    			t13 = claim_space(li_nodes);
    			li_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(a0, "href", a0_href_value = /*project*/ ctx[6].link);
    			add_location(a0, file$6, 139, 32, 4265);
    			add_location(h3, file$6, 139, 28, 4261);
    			attr_dev(p0, "class", "svelte-z5u56n");
    			add_location(p0, file$6, 141, 32, 4440);
    			attr_dev(img, "class", "intro__image");
    			if (img.src !== (img_src_value = /*project*/ ctx[6].image)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = `Screenshot from ${/*project*/ ctx[6].name} app front page`);
    			add_location(img, file$6, 143, 36, 4569);
    			attr_dev(div0, "class", "image-container svelte-z5u56n");
    			add_location(div0, file$6, 142, 32, 4502);
    			attr_dev(div1, "class", " projects__image-and-description svelte-z5u56n");
    			add_location(div1, file$6, 140, 28, 4360);
    			attr_dev(a1, "href", a1_href_value = /*project*/ ctx[6].github);
    			add_location(a1, file$6, 152, 31, 5002);
    			add_location(p1, file$6, 152, 28, 4999);
    			add_location(p2, file$6, 154, 32, 5161);
    			attr_dev(div2, "class", "tags-container__tags svelte-z5u56n");
    			add_location(div2, file$6, 155, 32, 5220);
    			attr_dev(div3, "class", "projects__tags-container");
    			add_location(div3, file$6, 153, 28, 5089);
    			attr_dev(li, "class", "projects__project card svelte-z5u56n");
    			add_location(li, file$6, 138, 24, 4196);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, h3);
    			append_dev(h3, a0);
    			append_dev(a0, t0);
    			append_dev(a0, t1);
    			append_dev(a0, t2);
    			append_dev(a0, t3);
    			append_dev(li, t4);
    			append_dev(li, div1);
    			append_dev(div1, p0);
    			append_dev(p0, t5);
    			append_dev(div1, t6);
    			append_dev(div1, div0);
    			append_dev(div0, img);
    			append_dev(li, t7);
    			append_dev(li, p1);
    			append_dev(p1, a1);
    			append_dev(a1, t8);
    			append_dev(a1, t9);
    			append_dev(li, t10);
    			append_dev(li, div3);
    			append_dev(div3, p2);
    			append_dev(p2, t11);
    			append_dev(div3, t12);
    			append_dev(div3, div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			append_dev(li, t13);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$projects*/ 4 && t0_value !== (t0_value = /*project*/ ctx[6].name + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*$projects*/ 4 && t2_value !== (t2_value = /*project*/ ctx[6].type + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*$projects*/ 4 && a0_href_value !== (a0_href_value = /*project*/ ctx[6].link)) {
    				attr_dev(a0, "href", a0_href_value);
    			}

    			if (dirty & /*$projects*/ 4 && t5_value !== (t5_value = /*project*/ ctx[6].description + "")) set_data_dev(t5, t5_value);

    			if (dirty & /*$projects*/ 4 && img.src !== (img_src_value = /*project*/ ctx[6].image)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*$projects*/ 4 && img_alt_value !== (img_alt_value = `Screenshot from ${/*project*/ ctx[6].name} app front page`)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*$projects*/ 4 && t8_value !== (t8_value = /*project*/ ctx[6].name + "")) set_data_dev(t8, t8_value);

    			if (dirty & /*$projects*/ 4 && a1_href_value !== (a1_href_value = /*project*/ ctx[6].github)) {
    				attr_dev(a1, "href", a1_href_value);
    			}

    			if (dirty & /*$projects*/ 4) {
    				each_value_1 = /*project*/ ctx[6].tags;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(138:20) {#if project.selected}",
    		ctx
    	});

    	return block;
    }

    // (157:36) {#each project.tags as tag}
    function create_each_block_1(ctx) {
    	let span;
    	let t_value = /*tag*/ ctx[9] + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			this.h();
    		},
    		l: function claim(nodes) {
    			span = claim_element(nodes, "SPAN", { class: true });
    			var span_nodes = children(span);
    			t = claim_text(span_nodes, t_value);
    			span_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(span, "class", "svelte-z5u56n");
    			add_location(span, file$6, 157, 40, 5361);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$projects*/ 4 && t_value !== (t_value = /*tag*/ ctx[9] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(157:36) {#each project.tags as tag}",
    		ctx
    	});

    	return block;
    }

    // (137:16) {#each $projects as project}
    function create_each_block$1(ctx) {
    	let if_block_anchor;
    	let if_block = /*project*/ ctx[6].selected && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			if (if_block) if_block.l(nodes);
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*project*/ ctx[6].selected) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(137:16) {#each $projects as project}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div2;
    	let h2;
    	let t0;
    	let t1;
    	let h3;
    	let t2;
    	let t3;
    	let div1;
    	let fieldset;
    	let legend;
    	let t4;
    	let t5;
    	let hr0;
    	let t6;
    	let div0;
    	let t7;
    	let hr1;
    	let t8;
    	let p;
    	let t9;
    	let t10;
    	let ul;
    	let each_value_2 = /*$tags*/ ctx[1];
    	validate_each_argument(each_value_2);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_1[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value = /*$projects*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			h2 = element("h2");
    			t0 = text("Projects");
    			t1 = space();
    			h3 = element("h3");
    			t2 = text("Professional, Personal, and Volunteer");
    			t3 = space();
    			div1 = element("div");
    			fieldset = element("fieldset");
    			legend = element("legend");
    			t4 = text("Select one or more tags below to filter the projects by the tech and tools used:");
    			t5 = space();
    			hr0 = element("hr");
    			t6 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t7 = space();
    			hr1 = element("hr");
    			t8 = space();
    			p = element("p");
    			t9 = text(/*displayedTags*/ ctx[0]);
    			t10 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			this.h();
    		},
    		l: function claim(nodes) {
    			div2 = claim_element(nodes, "DIV", { class: true, id: true });
    			var div2_nodes = children(div2);
    			h2 = claim_element(div2_nodes, "H2", {});
    			var h2_nodes = children(h2);
    			t0 = claim_text(h2_nodes, "Projects");
    			h2_nodes.forEach(detach_dev);
    			t1 = claim_space(div2_nodes);
    			h3 = claim_element(div2_nodes, "H3", {});
    			var h3_nodes = children(h3);
    			t2 = claim_text(h3_nodes, "Professional, Personal, and Volunteer");
    			h3_nodes.forEach(detach_dev);
    			t3 = claim_space(div2_nodes);
    			div1 = claim_element(div2_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			fieldset = claim_element(div1_nodes, "FIELDSET", { class: true });
    			var fieldset_nodes = children(fieldset);
    			legend = claim_element(fieldset_nodes, "LEGEND", { class: true });
    			var legend_nodes = children(legend);
    			t4 = claim_text(legend_nodes, "Select one or more tags below to filter the projects by the tech and tools used:");
    			legend_nodes.forEach(detach_dev);
    			t5 = claim_space(fieldset_nodes);
    			hr0 = claim_element(fieldset_nodes, "HR", {});
    			t6 = claim_space(fieldset_nodes);
    			div0 = claim_element(fieldset_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].l(div0_nodes);
    			}

    			div0_nodes.forEach(detach_dev);
    			t7 = claim_space(fieldset_nodes);
    			hr1 = claim_element(fieldset_nodes, "HR", {});
    			fieldset_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			t8 = claim_space(div2_nodes);
    			p = claim_element(div2_nodes, "P", { class: true });
    			var p_nodes = children(p);
    			t9 = claim_text(p_nodes, /*displayedTags*/ ctx[0]);
    			p_nodes.forEach(detach_dev);
    			t10 = claim_space(div2_nodes);
    			ul = claim_element(div2_nodes, "UL", { class: true });
    			var ul_nodes = children(ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(ul_nodes);
    			}

    			ul_nodes.forEach(detach_dev);
    			div2_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			add_location(h2, file$6, 117, 8, 3210);
    			add_location(h3, file$6, 118, 8, 3237);
    			attr_dev(legend, "class", "svelte-z5u56n");
    			add_location(legend, file$6, 121, 16, 3393);
    			add_location(hr0, file$6, 122, 16, 3508);
    			attr_dev(div0, "class", "tags-group__checkboxes svelte-z5u56n");
    			add_location(div0, file$6, 123, 16, 3532);
    			add_location(hr1, file$6, 131, 16, 3956);
    			attr_dev(fieldset, "class", "tags-group");
    			add_location(fieldset, file$6, 120, 12, 3346);
    			attr_dev(div1, "class", " container projects__tags");
    			add_location(div1, file$6, 119, 8, 3293);
    			attr_dev(p, "class", "displayed-tags svelte-z5u56n");
    			add_location(p, file$6, 134, 12, 4017);
    			attr_dev(ul, "class", "svelte-z5u56n");
    			add_location(ul, file$6, 135, 12, 4076);
    			attr_dev(div2, "class", "container projects");
    			attr_dev(div2, "id", "main");
    			add_location(div2, file$6, 116, 4, 3158);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, h2);
    			append_dev(h2, t0);
    			append_dev(div2, t1);
    			append_dev(div2, h3);
    			append_dev(h3, t2);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			append_dev(div1, fieldset);
    			append_dev(fieldset, legend);
    			append_dev(legend, t4);
    			append_dev(fieldset, t5);
    			append_dev(fieldset, hr0);
    			append_dev(fieldset, t6);
    			append_dev(fieldset, div0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div0, null);
    			}

    			append_dev(fieldset, t7);
    			append_dev(fieldset, hr1);
    			append_dev(div2, t8);
    			append_dev(div2, p);
    			append_dev(p, t9);
    			append_dev(div2, t10);
    			append_dev(div2, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$tags, select*/ 10) {
    				each_value_2 = /*$tags*/ ctx[1];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_2(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_2.length;
    			}

    			if (dirty & /*displayedTags*/ 1) set_data_dev(t9, /*displayedTags*/ ctx[0]);

    			if (dirty & /*$projects*/ 4) {
    				each_value = /*$projects*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let $tags;
    	let $selectedTags;
    	let $projects;
    	validate_store(tags, "tags");
    	component_subscribe($$self, tags, $$value => $$invalidate(1, $tags = $$value));
    	validate_store(selectedTags, "selectedTags");
    	component_subscribe($$self, selectedTags, $$value => $$invalidate(5, $selectedTags = $$value));
    	validate_store(projects, "projects");
    	component_subscribe($$self, projects, $$value => $$invalidate(2, $projects = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Projects", slots, []);
    	let displayedTags = "";

    	const select = e => {
    		// Look through tags and set selected if it's checked 
    		if (e.target.checked) {
    			for (let tag of $tags) {
    				if (e.target.id === tag.name) {
    					tag.selected = true;
    				}
    			}
    		} else {
    			for (let tag of $tags) {
    				if (e.target.id === tag.name) {
    					tag.selected = false;
    				}
    			}
    		}

    		tags.set($tags);

    		// Filter to a selected tags object
    		set_store_value(selectedTags, $selectedTags = $tags.filter(tag => tag.selected).map(tag => tag.name), $selectedTags);

    		// Show or hide project based on the above results.
    		for (let project of $projects) {
    			if ($selectedTags.every(tag => project.tags.join(" ").includes(tag))) {
    				project.selected = true;
    			} else {
    				project.selected = false;
    			}
    		}

    		projects.set($projects);
    		$$invalidate(0, displayedTags = `Listing projects that use: ${$selectedTags.join(", ")}`);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Projects> was created with unknown prop '${key}'`);
    	});

    	function input_change_handler(each_value_2, tag_index_1) {
    		each_value_2[tag_index_1].selected = this.checked;
    		tags.set($tags);
    	}

    	$$self.$capture_state = () => ({
    		tags,
    		projects,
    		selectedTags,
    		displayedTags,
    		select,
    		$tags,
    		$selectedTags,
    		$projects
    	});

    	$$self.$inject_state = $$props => {
    		if ("displayedTags" in $$props) $$invalidate(0, displayedTags = $$props.displayedTags);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [displayedTags, $tags, $projects, select, input_change_handler];
    }

    class Projects extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Projects",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src\pages\Contact.svelte generated by Svelte v3.31.0 */

    const file$7 = "src\\pages\\Contact.svelte";

    function create_fragment$9(ctx) {
    	let div1;
    	let h2;
    	let t0;
    	let t1;
    	let div0;
    	let h30;
    	let a0;
    	let t2;
    	let t3;
    	let h31;
    	let a1;
    	let t4;
    	let t5;
    	let h32;
    	let a2;
    	let t6;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h2 = element("h2");
    			t0 = text(/*pageName*/ ctx[0]);
    			t1 = space();
    			div0 = element("div");
    			h30 = element("h3");
    			a0 = element("a");
    			t2 = text("Email");
    			t3 = space();
    			h31 = element("h3");
    			a1 = element("a");
    			t4 = text("GitHub");
    			t5 = space();
    			h32 = element("h3");
    			a2 = element("a");
    			t6 = text("Twitter");
    			this.h();
    		},
    		l: function claim(nodes) {
    			div1 = claim_element(nodes, "DIV", { class: true, id: true });
    			var div1_nodes = children(div1);
    			h2 = claim_element(div1_nodes, "H2", {});
    			var h2_nodes = children(h2);
    			t0 = claim_text(h2_nodes, /*pageName*/ ctx[0]);
    			h2_nodes.forEach(detach_dev);
    			t1 = claim_space(div1_nodes);
    			div0 = claim_element(div1_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			h30 = claim_element(div0_nodes, "H3", {});
    			var h30_nodes = children(h30);
    			a0 = claim_element(h30_nodes, "A", { href: true });
    			var a0_nodes = children(a0);
    			t2 = claim_text(a0_nodes, "Email");
    			a0_nodes.forEach(detach_dev);
    			h30_nodes.forEach(detach_dev);
    			t3 = claim_space(div0_nodes);
    			h31 = claim_element(div0_nodes, "H3", {});
    			var h31_nodes = children(h31);
    			a1 = claim_element(h31_nodes, "A", { href: true });
    			var a1_nodes = children(a1);
    			t4 = claim_text(a1_nodes, "GitHub");
    			a1_nodes.forEach(detach_dev);
    			h31_nodes.forEach(detach_dev);
    			t5 = claim_space(div0_nodes);
    			h32 = claim_element(div0_nodes, "H3", {});
    			var h32_nodes = children(h32);
    			a2 = claim_element(h32_nodes, "A", { href: true });
    			var a2_nodes = children(a2);
    			t6 = claim_text(a2_nodes, "Twitter");
    			a2_nodes.forEach(detach_dev);
    			h32_nodes.forEach(detach_dev);
    			div0_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			add_location(h2, file$7, 5, 4, 93);
    			attr_dev(a0, "href", "mailto:daveydevs@gmail.com");
    			add_location(a0, file$7, 7, 12, 155);
    			add_location(h30, file$7, 7, 8, 151);
    			attr_dev(a1, "href", "https://github.com/DaveyDevs");
    			add_location(a1, file$7, 8, 12, 220);
    			add_location(h31, file$7, 8, 8, 216);
    			attr_dev(a2, "href", "https://twitter.com/daveydevs");
    			add_location(a2, file$7, 9, 12, 288);
    			add_location(h32, file$7, 9, 8, 284);
    			attr_dev(div0, "class", "container");
    			add_location(div0, file$7, 6, 4, 118);
    			attr_dev(div1, "class", "container");
    			attr_dev(div1, "id", "main");
    			add_location(div1, file$7, 4, 0, 54);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h2);
    			append_dev(h2, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, h30);
    			append_dev(h30, a0);
    			append_dev(a0, t2);
    			append_dev(div0, t3);
    			append_dev(div0, h31);
    			append_dev(h31, a1);
    			append_dev(a1, t4);
    			append_dev(div0, t5);
    			append_dev(div0, h32);
    			append_dev(h32, a2);
    			append_dev(a2, t6);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Contact", slots, []);
    	let pageName = "Contact";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Contact> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ pageName });

    	$$self.$inject_state = $$props => {
    		if ("pageName" in $$props) $$invalidate(0, pageName = $$props.pageName);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [pageName];
    }

    class Contact extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Contact",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src\pages\Kitchen.svelte generated by Svelte v3.31.0 */

    const file$8 = "src\\pages\\Kitchen.svelte";

    function create_fragment$a(ctx) {
    	let div9;
    	let h20;
    	let t0;
    	let t1;
    	let p0;
    	let t2;
    	let a0;
    	let t3;
    	let t4;
    	let t5;
    	let h21;
    	let t6;
    	let t7;
    	let blockquote;
    	let t8;
    	let strong;
    	let t9;
    	let t10;
    	let a1;
    	let t11;
    	let t12;
    	let t13;
    	let h30;
    	let t14;
    	let t15;
    	let h4;
    	let t16;
    	let t17;
    	let h5;
    	let t18;
    	let t19;
    	let h6;
    	let t20;
    	let t21;
    	let hr0;
    	let t22;
    	let p1;
    	let t23;
    	let t24;
    	let hr1;
    	let t25;
    	let div0;
    	let p2;
    	let t26;
    	let t27;
    	let ul;
    	let li0;
    	let t28;
    	let t29;
    	let li1;
    	let t30;
    	let t31;
    	let li2;
    	let t32;
    	let t33;
    	let div1;
    	let h31;
    	let t34;
    	let t35;
    	let p3;
    	let t36;
    	let t37;
    	let button0;
    	let t38;
    	let t39;
    	let p4;
    	let t40;
    	let t41;
    	let div2;
    	let aside;
    	let p5;
    	let t42;
    	let t43;
    	let p6;
    	let t44;
    	let t45;
    	let form;
    	let div6;
    	let div3;
    	let label0;
    	let t46;
    	let t47;
    	let input0;
    	let t48;
    	let div4;
    	let label1;
    	let t49;
    	let input1;
    	let t50;
    	let div5;
    	let label2;
    	let t51;
    	let input2;
    	let t52;
    	let div7;
    	let label3;
    	let t53;
    	let t54;
    	let textarea;
    	let t55;
    	let div8;
    	let label4;
    	let t56;
    	let t57;
    	let select;
    	let option0;
    	let t58;
    	let option1;
    	let t59;
    	let t60;
    	let button1;
    	let t61;
    	let t62;
    	let button2;
    	let t63;
    	let t64;
    	let button3;
    	let t65;
    	let t66;
    	let button4;
    	let t67;
    	let t68;
    	let button5;
    	let t69;
    	let t70;
    	let br;
    	let t71;
    	let button6;
    	let t72;

    	const block = {
    		c: function create() {
    			div9 = element("div");
    			h20 = element("h2");
    			t0 = text("Hello World");
    			t1 = space();
    			p0 = element("p");
    			t2 = text("Lorem ipsum dolor sit amet,\r\n        ");
    			a0 = element("a");
    			t3 = text("consectetur");
    			t4 = text("\r\n        adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore\r\n        magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco\r\n        laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor\r\n        in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla\r\n        pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa\r\n        qui officia deserunt mollit anim id est laborum.");
    			t5 = space();
    			h21 = element("h2");
    			t6 = text("Hello World");
    			t7 = space();
    			blockquote = element("blockquote");
    			t8 = text("Lorem ipsum dolor sit amet,\r\n        ");
    			strong = element("strong");
    			t9 = text("consectetur");
    			t10 = text("\r\n        adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore\r\n        magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco\r\n        laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor\r\n        in reprehenderit in voluptate velit esse\r\n        ");
    			a1 = element("a");
    			t11 = text("consectetur");
    			t12 = text("\r\n        cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat\r\n        cupidatat non proident, sunt in culpa qui officia deserunt mollit anim\r\n        id est laborum.");
    			t13 = space();
    			h30 = element("h3");
    			t14 = text("Hello World");
    			t15 = space();
    			h4 = element("h4");
    			t16 = text("Hello World");
    			t17 = space();
    			h5 = element("h5");
    			t18 = text("Hello World");
    			t19 = space();
    			h6 = element("h6");
    			t20 = text("Hello World");
    			t21 = space();
    			hr0 = element("hr");
    			t22 = space();
    			p1 = element("p");
    			t23 = text("Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod\r\n        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim\r\n        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea\r\n        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate\r\n        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint\r\n        occaecat cupidatat non proident, sunt in culpa qui officia deserunt\r\n        mollit anim id est laborum.");
    			t24 = space();
    			hr1 = element("hr");
    			t25 = space();
    			div0 = element("div");
    			p2 = element("p");
    			t26 = text("Lorem ipsum dolor sit amet consectetur adipisicing elit. Labore odit\r\n            deleniti autem. Vel quas eligendi repudiandae ratione maiores, unde\r\n            iusto quae ullam tenetur consequuntur temporibus itaque voluptatibus\r\n            nobis nam. Velit!");
    			t27 = space();
    			ul = element("ul");
    			li0 = element("li");
    			t28 = text("Hi");
    			t29 = space();
    			li1 = element("li");
    			t30 = text("Hello");
    			t31 = space();
    			li2 = element("li");
    			t32 = text("It's me");
    			t33 = space();
    			div1 = element("div");
    			h31 = element("h3");
    			t34 = text("Card Heading");
    			t35 = space();
    			p3 = element("p");
    			t36 = text("Lorem ipsum, dolor sit amet consectetur adipisicing elit. Inventore,\r\n            maiores.");
    			t37 = space();
    			button0 = element("button");
    			t38 = text("Accept");
    			t39 = space();
    			p4 = element("p");
    			t40 = text("Lorem ipsum, dolor sit amet consectetur adipisicing elit. Inventore,\r\n            maiores.");
    			t41 = space();
    			div2 = element("div");
    			aside = element("aside");
    			p5 = element("p");
    			t42 = text("Lorem ipsum, dolor sit amet consectetur adipisicing elit.\r\n                Inventore, maiores.");
    			t43 = space();
    			p6 = element("p");
    			t44 = text("Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nulla sit\r\n            sapiente expedita neque rem sequi possimus voluptates quisquam\r\n            maiores eveniet, similique obcaecati dolor quia delectus\r\n            reprehenderit voluptas ducimus ratione est.");
    			t45 = space();
    			form = element("form");
    			div6 = element("div");
    			div3 = element("div");
    			label0 = element("label");
    			t46 = text("Text");
    			t47 = space();
    			input0 = element("input");
    			t48 = space();
    			div4 = element("div");
    			label1 = element("label");
    			t49 = text("Number");
    			input1 = element("input");
    			t50 = space();
    			div5 = element("div");
    			label2 = element("label");
    			t51 = text("Email");
    			input2 = element("input");
    			t52 = space();
    			div7 = element("div");
    			label3 = element("label");
    			t53 = text("Textarea");
    			t54 = space();
    			textarea = element("textarea");
    			t55 = space();
    			div8 = element("div");
    			label4 = element("label");
    			t56 = text("Select");
    			t57 = space();
    			select = element("select");
    			option0 = element("option");
    			t58 = text("One");
    			option1 = element("option");
    			t59 = text("Two");
    			t60 = space();
    			button1 = element("button");
    			t61 = text("Submit");
    			t62 = space();
    			button2 = element("button");
    			t63 = text("Cancel");
    			t64 = space();
    			button3 = element("button");
    			t65 = text("Disabled");
    			t66 = space();
    			button4 = element("button");
    			t67 = text("Button with long text");
    			t68 = space();
    			button5 = element("button");
    			t69 = text("Button ⟶");
    			t70 = space();
    			br = element("br");
    			t71 = space();
    			button6 = element("button");
    			t72 = text("Submit");
    			this.h();
    		},
    		l: function claim(nodes) {
    			div9 = claim_element(nodes, "DIV", { class: true, id: true });
    			var div9_nodes = children(div9);
    			h20 = claim_element(div9_nodes, "H2", {});
    			var h20_nodes = children(h20);
    			t0 = claim_text(h20_nodes, "Hello World");
    			h20_nodes.forEach(detach_dev);
    			t1 = claim_space(div9_nodes);
    			p0 = claim_element(div9_nodes, "P", {});
    			var p0_nodes = children(p0);
    			t2 = claim_text(p0_nodes, "Lorem ipsum dolor sit amet,\r\n        ");
    			a0 = claim_element(p0_nodes, "A", { href: true });
    			var a0_nodes = children(a0);
    			t3 = claim_text(a0_nodes, "consectetur");
    			a0_nodes.forEach(detach_dev);
    			t4 = claim_text(p0_nodes, "\r\n        adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore\r\n        magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco\r\n        laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor\r\n        in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla\r\n        pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa\r\n        qui officia deserunt mollit anim id est laborum.");
    			p0_nodes.forEach(detach_dev);
    			t5 = claim_space(div9_nodes);
    			h21 = claim_element(div9_nodes, "H2", {});
    			var h21_nodes = children(h21);
    			t6 = claim_text(h21_nodes, "Hello World");
    			h21_nodes.forEach(detach_dev);
    			t7 = claim_space(div9_nodes);
    			blockquote = claim_element(div9_nodes, "BLOCKQUOTE", {});
    			var blockquote_nodes = children(blockquote);
    			t8 = claim_text(blockquote_nodes, "Lorem ipsum dolor sit amet,\r\n        ");
    			strong = claim_element(blockquote_nodes, "STRONG", {});
    			var strong_nodes = children(strong);
    			t9 = claim_text(strong_nodes, "consectetur");
    			strong_nodes.forEach(detach_dev);
    			t10 = claim_text(blockquote_nodes, "\r\n        adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore\r\n        magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco\r\n        laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor\r\n        in reprehenderit in voluptate velit esse\r\n        ");
    			a1 = claim_element(blockquote_nodes, "A", { href: true });
    			var a1_nodes = children(a1);
    			t11 = claim_text(a1_nodes, "consectetur");
    			a1_nodes.forEach(detach_dev);
    			t12 = claim_text(blockquote_nodes, "\r\n        cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat\r\n        cupidatat non proident, sunt in culpa qui officia deserunt mollit anim\r\n        id est laborum.");
    			blockquote_nodes.forEach(detach_dev);
    			t13 = claim_space(div9_nodes);
    			h30 = claim_element(div9_nodes, "H3", {});
    			var h30_nodes = children(h30);
    			t14 = claim_text(h30_nodes, "Hello World");
    			h30_nodes.forEach(detach_dev);
    			t15 = claim_space(div9_nodes);
    			h4 = claim_element(div9_nodes, "H4", {});
    			var h4_nodes = children(h4);
    			t16 = claim_text(h4_nodes, "Hello World");
    			h4_nodes.forEach(detach_dev);
    			t17 = claim_space(div9_nodes);
    			h5 = claim_element(div9_nodes, "H5", {});
    			var h5_nodes = children(h5);
    			t18 = claim_text(h5_nodes, "Hello World");
    			h5_nodes.forEach(detach_dev);
    			t19 = claim_space(div9_nodes);
    			h6 = claim_element(div9_nodes, "H6", {});
    			var h6_nodes = children(h6);
    			t20 = claim_text(h6_nodes, "Hello World");
    			h6_nodes.forEach(detach_dev);
    			t21 = claim_space(div9_nodes);
    			hr0 = claim_element(div9_nodes, "HR", {});
    			t22 = claim_space(div9_nodes);
    			p1 = claim_element(div9_nodes, "P", {});
    			var p1_nodes = children(p1);
    			t23 = claim_text(p1_nodes, "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod\r\n        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim\r\n        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea\r\n        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate\r\n        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint\r\n        occaecat cupidatat non proident, sunt in culpa qui officia deserunt\r\n        mollit anim id est laborum.");
    			p1_nodes.forEach(detach_dev);
    			t24 = claim_space(div9_nodes);
    			hr1 = claim_element(div9_nodes, "HR", {});
    			t25 = claim_space(div9_nodes);
    			div0 = claim_element(div9_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			p2 = claim_element(div0_nodes, "P", {});
    			var p2_nodes = children(p2);
    			t26 = claim_text(p2_nodes, "Lorem ipsum dolor sit amet consectetur adipisicing elit. Labore odit\r\n            deleniti autem. Vel quas eligendi repudiandae ratione maiores, unde\r\n            iusto quae ullam tenetur consequuntur temporibus itaque voluptatibus\r\n            nobis nam. Velit!");
    			p2_nodes.forEach(detach_dev);
    			t27 = claim_space(div0_nodes);
    			ul = claim_element(div0_nodes, "UL", {});
    			var ul_nodes = children(ul);
    			li0 = claim_element(ul_nodes, "LI", {});
    			var li0_nodes = children(li0);
    			t28 = claim_text(li0_nodes, "Hi");
    			li0_nodes.forEach(detach_dev);
    			t29 = claim_space(ul_nodes);
    			li1 = claim_element(ul_nodes, "LI", {});
    			var li1_nodes = children(li1);
    			t30 = claim_text(li1_nodes, "Hello");
    			li1_nodes.forEach(detach_dev);
    			t31 = claim_space(ul_nodes);
    			li2 = claim_element(ul_nodes, "LI", {});
    			var li2_nodes = children(li2);
    			t32 = claim_text(li2_nodes, "It's me");
    			li2_nodes.forEach(detach_dev);
    			ul_nodes.forEach(detach_dev);
    			div0_nodes.forEach(detach_dev);
    			t33 = claim_space(div9_nodes);
    			div1 = claim_element(div9_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			h31 = claim_element(div1_nodes, "H3", {});
    			var h31_nodes = children(h31);
    			t34 = claim_text(h31_nodes, "Card Heading");
    			h31_nodes.forEach(detach_dev);
    			t35 = claim_space(div1_nodes);
    			p3 = claim_element(div1_nodes, "P", {});
    			var p3_nodes = children(p3);
    			t36 = claim_text(p3_nodes, "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Inventore,\r\n            maiores.");
    			p3_nodes.forEach(detach_dev);
    			t37 = claim_space(div1_nodes);
    			button0 = claim_element(div1_nodes, "BUTTON", {});
    			var button0_nodes = children(button0);
    			t38 = claim_text(button0_nodes, "Accept");
    			button0_nodes.forEach(detach_dev);
    			t39 = claim_space(div1_nodes);
    			p4 = claim_element(div1_nodes, "P", {});
    			var p4_nodes = children(p4);
    			t40 = claim_text(p4_nodes, "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Inventore,\r\n            maiores.");
    			p4_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			t41 = claim_space(div9_nodes);
    			div2 = claim_element(div9_nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);
    			aside = claim_element(div2_nodes, "ASIDE", {});
    			var aside_nodes = children(aside);
    			p5 = claim_element(aside_nodes, "P", {});
    			var p5_nodes = children(p5);
    			t42 = claim_text(p5_nodes, "Lorem ipsum, dolor sit amet consectetur adipisicing elit.\r\n                Inventore, maiores.");
    			p5_nodes.forEach(detach_dev);
    			aside_nodes.forEach(detach_dev);
    			t43 = claim_space(div2_nodes);
    			p6 = claim_element(div2_nodes, "P", {});
    			var p6_nodes = children(p6);
    			t44 = claim_text(p6_nodes, "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nulla sit\r\n            sapiente expedita neque rem sequi possimus voluptates quisquam\r\n            maiores eveniet, similique obcaecati dolor quia delectus\r\n            reprehenderit voluptas ducimus ratione est.");
    			p6_nodes.forEach(detach_dev);
    			div2_nodes.forEach(detach_dev);
    			t45 = claim_space(div9_nodes);
    			form = claim_element(div9_nodes, "FORM", {});
    			var form_nodes = children(form);
    			div6 = claim_element(form_nodes, "DIV", { class: true });
    			var div6_nodes = children(div6);
    			div3 = claim_element(div6_nodes, "DIV", {});
    			var div3_nodes = children(div3);
    			label0 = claim_element(div3_nodes, "LABEL", { for: true });
    			var label0_nodes = children(label0);
    			t46 = claim_text(label0_nodes, "Text");
    			label0_nodes.forEach(detach_dev);
    			t47 = claim_space(div3_nodes);
    			input0 = claim_element(div3_nodes, "INPUT", { placeholder: true, id: true, type: true });
    			div3_nodes.forEach(detach_dev);
    			t48 = claim_space(div6_nodes);
    			div4 = claim_element(div6_nodes, "DIV", {});
    			var div4_nodes = children(div4);
    			label1 = claim_element(div4_nodes, "LABEL", { for: true });
    			var label1_nodes = children(label1);
    			t49 = claim_text(label1_nodes, "Number");
    			label1_nodes.forEach(detach_dev);
    			input1 = claim_element(div4_nodes, "INPUT", { id: true, type: true });
    			div4_nodes.forEach(detach_dev);
    			t50 = claim_space(div6_nodes);
    			div5 = claim_element(div6_nodes, "DIV", {});
    			var div5_nodes = children(div5);
    			label2 = claim_element(div5_nodes, "LABEL", { for: true });
    			var label2_nodes = children(label2);
    			t51 = claim_text(label2_nodes, "Email");
    			label2_nodes.forEach(detach_dev);
    			input2 = claim_element(div5_nodes, "INPUT", { id: true, type: true });
    			div5_nodes.forEach(detach_dev);
    			div6_nodes.forEach(detach_dev);
    			t52 = claim_space(form_nodes);
    			div7 = claim_element(form_nodes, "DIV", {});
    			var div7_nodes = children(div7);
    			label3 = claim_element(div7_nodes, "LABEL", { for: true });
    			var label3_nodes = children(label3);
    			t53 = claim_text(label3_nodes, "Textarea");
    			label3_nodes.forEach(detach_dev);
    			t54 = claim_space(div7_nodes);
    			textarea = claim_element(div7_nodes, "TEXTAREA", { id: true, value: true });
    			children(textarea).forEach(detach_dev);
    			div7_nodes.forEach(detach_dev);
    			t55 = claim_space(form_nodes);
    			div8 = claim_element(form_nodes, "DIV", {});
    			var div8_nodes = children(div8);
    			label4 = claim_element(div8_nodes, "LABEL", { for: true });
    			var label4_nodes = children(label4);
    			t56 = claim_text(label4_nodes, "Select");
    			label4_nodes.forEach(detach_dev);
    			t57 = claim_space(div8_nodes);
    			select = claim_element(div8_nodes, "SELECT", { id: true, type: true });
    			var select_nodes = children(select);
    			option0 = claim_element(select_nodes, "OPTION", { value: true });
    			var option0_nodes = children(option0);
    			t58 = claim_text(option0_nodes, "One");
    			option0_nodes.forEach(detach_dev);
    			option1 = claim_element(select_nodes, "OPTION", { value: true });
    			var option1_nodes = children(option1);
    			t59 = claim_text(option1_nodes, "Two");
    			option1_nodes.forEach(detach_dev);
    			select_nodes.forEach(detach_dev);
    			div8_nodes.forEach(detach_dev);
    			t60 = claim_space(form_nodes);
    			button1 = claim_element(form_nodes, "BUTTON", {});
    			var button1_nodes = children(button1);
    			t61 = claim_text(button1_nodes, "Submit");
    			button1_nodes.forEach(detach_dev);
    			t62 = claim_space(form_nodes);
    			button2 = claim_element(form_nodes, "BUTTON", { class: true });
    			var button2_nodes = children(button2);
    			t63 = claim_text(button2_nodes, "Cancel");
    			button2_nodes.forEach(detach_dev);
    			t64 = claim_space(form_nodes);
    			button3 = claim_element(form_nodes, "BUTTON", { disabled: true });
    			var button3_nodes = children(button3);
    			t65 = claim_text(button3_nodes, "Disabled");
    			button3_nodes.forEach(detach_dev);
    			t66 = claim_space(form_nodes);
    			button4 = claim_element(form_nodes, "BUTTON", {});
    			var button4_nodes = children(button4);
    			t67 = claim_text(button4_nodes, "Button with long text");
    			button4_nodes.forEach(detach_dev);
    			t68 = claim_space(form_nodes);
    			button5 = claim_element(form_nodes, "BUTTON", {});
    			var button5_nodes = children(button5);
    			t69 = claim_text(button5_nodes, "Button ⟶");
    			button5_nodes.forEach(detach_dev);
    			t70 = claim_space(form_nodes);
    			br = claim_element(form_nodes, "BR", {});
    			t71 = claim_space(form_nodes);
    			button6 = claim_element(form_nodes, "BUTTON", { class: true });
    			var button6_nodes = children(button6);
    			t72 = claim_text(button6_nodes, "Submit");
    			button6_nodes.forEach(detach_dev);
    			form_nodes.forEach(detach_dev);
    			div9_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			add_location(h20, file$8, 24, 4, 620);
    			attr_dev(a0, "href", "#");
    			add_location(a0, file$8, 28, 8, 698);
    			add_location(p0, file$8, 26, 4, 648);
    			add_location(h21, file$8, 37, 4, 1203);
    			add_location(strong, file$8, 41, 8, 1290);
    			attr_dev(a1, "href", "#");
    			add_location(a1, file$8, 46, 8, 1619);
    			add_location(blockquote, file$8, 39, 4, 1231);
    			add_location(h30, file$8, 52, 4, 1851);
    			add_location(h4, file$8, 53, 4, 1877);
    			add_location(h5, file$8, 54, 4, 1903);
    			add_location(h6, file$8, 55, 4, 1929);
    			add_location(hr0, file$8, 56, 4, 1955);
    			add_location(p1, file$8, 57, 4, 1967);
    			add_location(hr1, file$8, 66, 4, 2495);
    			add_location(p2, file$8, 69, 8, 2537);
    			add_location(li0, file$8, 76, 12, 2858);
    			add_location(li1, file$8, 77, 12, 2883);
    			add_location(li2, file$8, 78, 12, 2911);
    			add_location(ul, file$8, 75, 8, 2840);
    			attr_dev(div0, "class", "grid");
    			add_location(div0, file$8, 68, 4, 2509);
    			add_location(h31, file$8, 83, 8, 2990);
    			add_location(p3, file$8, 84, 8, 3021);
    			add_location(button0, file$8, 88, 8, 3152);
    			add_location(p4, file$8, 89, 8, 3185);
    			attr_dev(div1, "class", "card");
    			add_location(div1, file$8, 82, 4, 2962);
    			add_location(p5, file$8, 97, 12, 3376);
    			add_location(aside, file$8, 96, 8, 3355);
    			add_location(p6, file$8, 102, 8, 3537);
    			attr_dev(div2, "class", "split");
    			add_location(div2, file$8, 95, 4, 3326);
    			attr_dev(label0, "for", "text");
    			add_location(label0, file$8, 113, 16, 3929);
    			attr_dev(input0, "placeholder", "Davey");
    			attr_dev(input0, "id", "text");
    			attr_dev(input0, "type", "text");
    			add_location(input0, file$8, 114, 16, 3977);
    			add_location(div3, file$8, 112, 12, 3906);
    			attr_dev(label1, "for", "number");
    			add_location(label1, file$8, 117, 16, 4085);
    			attr_dev(input1, "id", "number");
    			attr_dev(input1, "type", "number");
    			add_location(input1, file$8, 117, 50, 4119);
    			add_location(div4, file$8, 116, 12, 4062);
    			attr_dev(label2, "for", "email");
    			add_location(label2, file$8, 122, 16, 4253);
    			attr_dev(input2, "id", "email");
    			attr_dev(input2, "type", "email");
    			add_location(input2, file$8, 122, 48, 4285);
    			add_location(div5, file$8, 121, 12, 4230);
    			attr_dev(div6, "class", "flex");
    			add_location(div6, file$8, 111, 8, 3874);
    			attr_dev(label3, "for", "textarea");
    			add_location(label3, file$8, 128, 12, 4425);
    			attr_dev(textarea, "id", "textarea");
    			textarea.value = "Default value";
    			add_location(textarea, file$8, 129, 12, 4477);
    			add_location(div7, file$8, 127, 8, 4406);
    			attr_dev(label4, "for", "select");
    			add_location(label4, file$8, 132, 12, 4570);
    			option0.__value = "one";
    			option0.value = option0.__value;
    			add_location(option0, file$8, 134, 16, 4668);
    			option1.__value = "two";
    			option1.value = option1.__value;
    			add_location(option1, file$8, 135, 16, 4718);
    			attr_dev(select, "id", "select");
    			attr_dev(select, "type", "text");
    			add_location(select, file$8, 133, 12, 4618);
    			add_location(div8, file$8, 131, 8, 4551);
    			add_location(button1, file$8, 139, 8, 4801);
    			attr_dev(button2, "class", "cancel");
    			add_location(button2, file$8, 140, 8, 4834);
    			button3.disabled = true;
    			add_location(button3, file$8, 141, 8, 4882);
    			add_location(button4, file$8, 142, 8, 4926);
    			add_location(button5, file$8, 143, 8, 4974);
    			add_location(br, file$8, 144, 8, 5015);
    			attr_dev(button6, "class", "small");
    			add_location(button6, file$8, 145, 8, 5031);
    			add_location(form, file$8, 110, 4, 3858);
    			attr_dev(div9, "class", "container");
    			attr_dev(div9, "id", "main");
    			add_location(div9, file$8, 23, 0, 581);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div9, anchor);
    			append_dev(div9, h20);
    			append_dev(h20, t0);
    			append_dev(div9, t1);
    			append_dev(div9, p0);
    			append_dev(p0, t2);
    			append_dev(p0, a0);
    			append_dev(a0, t3);
    			append_dev(p0, t4);
    			append_dev(div9, t5);
    			append_dev(div9, h21);
    			append_dev(h21, t6);
    			append_dev(div9, t7);
    			append_dev(div9, blockquote);
    			append_dev(blockquote, t8);
    			append_dev(blockquote, strong);
    			append_dev(strong, t9);
    			append_dev(blockquote, t10);
    			append_dev(blockquote, a1);
    			append_dev(a1, t11);
    			append_dev(blockquote, t12);
    			append_dev(div9, t13);
    			append_dev(div9, h30);
    			append_dev(h30, t14);
    			append_dev(div9, t15);
    			append_dev(div9, h4);
    			append_dev(h4, t16);
    			append_dev(div9, t17);
    			append_dev(div9, h5);
    			append_dev(h5, t18);
    			append_dev(div9, t19);
    			append_dev(div9, h6);
    			append_dev(h6, t20);
    			append_dev(div9, t21);
    			append_dev(div9, hr0);
    			append_dev(div9, t22);
    			append_dev(div9, p1);
    			append_dev(p1, t23);
    			append_dev(div9, t24);
    			append_dev(div9, hr1);
    			append_dev(div9, t25);
    			append_dev(div9, div0);
    			append_dev(div0, p2);
    			append_dev(p2, t26);
    			append_dev(div0, t27);
    			append_dev(div0, ul);
    			append_dev(ul, li0);
    			append_dev(li0, t28);
    			append_dev(ul, t29);
    			append_dev(ul, li1);
    			append_dev(li1, t30);
    			append_dev(ul, t31);
    			append_dev(ul, li2);
    			append_dev(li2, t32);
    			append_dev(div9, t33);
    			append_dev(div9, div1);
    			append_dev(div1, h31);
    			append_dev(h31, t34);
    			append_dev(div1, t35);
    			append_dev(div1, p3);
    			append_dev(p3, t36);
    			append_dev(div1, t37);
    			append_dev(div1, button0);
    			append_dev(button0, t38);
    			append_dev(div1, t39);
    			append_dev(div1, p4);
    			append_dev(p4, t40);
    			append_dev(div9, t41);
    			append_dev(div9, div2);
    			append_dev(div2, aside);
    			append_dev(aside, p5);
    			append_dev(p5, t42);
    			append_dev(div2, t43);
    			append_dev(div2, p6);
    			append_dev(p6, t44);
    			append_dev(div9, t45);
    			append_dev(div9, form);
    			append_dev(form, div6);
    			append_dev(div6, div3);
    			append_dev(div3, label0);
    			append_dev(label0, t46);
    			append_dev(div3, t47);
    			append_dev(div3, input0);
    			append_dev(div6, t48);
    			append_dev(div6, div4);
    			append_dev(div4, label1);
    			append_dev(label1, t49);
    			append_dev(div4, input1);
    			append_dev(div6, t50);
    			append_dev(div6, div5);
    			append_dev(div5, label2);
    			append_dev(label2, t51);
    			append_dev(div5, input2);
    			append_dev(form, t52);
    			append_dev(form, div7);
    			append_dev(div7, label3);
    			append_dev(label3, t53);
    			append_dev(div7, t54);
    			append_dev(div7, textarea);
    			append_dev(form, t55);
    			append_dev(form, div8);
    			append_dev(div8, label4);
    			append_dev(label4, t56);
    			append_dev(div8, t57);
    			append_dev(div8, select);
    			append_dev(select, option0);
    			append_dev(option0, t58);
    			append_dev(select, option1);
    			append_dev(option1, t59);
    			append_dev(form, t60);
    			append_dev(form, button1);
    			append_dev(button1, t61);
    			append_dev(form, t62);
    			append_dev(form, button2);
    			append_dev(button2, t63);
    			append_dev(form, t64);
    			append_dev(form, button3);
    			append_dev(button3, t65);
    			append_dev(form, t66);
    			append_dev(form, button4);
    			append_dev(button4, t67);
    			append_dev(form, t68);
    			append_dev(form, button5);
    			append_dev(button5, t69);
    			append_dev(form, t70);
    			append_dev(form, br);
    			append_dev(form, t71);
    			append_dev(form, button6);
    			append_dev(button6, t72);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div9);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Kitchen", slots, []);
    	let pageName = "Kitchen Sink";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Kitchen> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ pageName });

    	$$self.$inject_state = $$props => {
    		if ("pageName" in $$props) pageName = $$props.pageName;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [];
    }

    class Kitchen extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Kitchen",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.31.0 */
    const file$9 = "src\\App.svelte";

    // (34:3) <Route path="/">
    function create_default_slot_1$3(ctx) {
    	let home;
    	let current;
    	home = new Home({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(home.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(home.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(home, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(home.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(home.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(home, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$3.name,
    		type: "slot",
    		source: "(34:3) <Route path=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (20:1) <Router {url}>
    function create_default_slot$3(ctx) {
    	let header;
    	let t0;
    	let main;
    	let route0;
    	let t1;
    	let route1;
    	let t2;
    	let route2;
    	let t3;
    	let route3;
    	let t4;
    	let route4;
    	let t5;
    	let footer;
    	let current;
    	header = new Header({ $$inline: true });

    	route0 = new Route({
    			props: { path: "about", component: About },
    			$$inline: true
    		});

    	route1 = new Route({
    			props: { path: "projects", component: Projects },
    			$$inline: true
    		});

    	route2 = new Route({
    			props: { path: "contact", component: Contact },
    			$$inline: true
    		});

    	route3 = new Route({
    			props: { path: "kitchen", component: Kitchen },
    			$$inline: true
    		});

    	route4 = new Route({
    			props: {
    				path: "/",
    				$$slots: { default: [create_default_slot_1$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t0 = space();
    			main = element("main");
    			create_component(route0.$$.fragment);
    			t1 = space();
    			create_component(route1.$$.fragment);
    			t2 = space();
    			create_component(route2.$$.fragment);
    			t3 = space();
    			create_component(route3.$$.fragment);
    			t4 = space();
    			create_component(route4.$$.fragment);
    			t5 = space();
    			create_component(footer.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			claim_component(header.$$.fragment, nodes);
    			t0 = claim_space(nodes);
    			main = claim_element(nodes, "MAIN", { class: true });
    			var main_nodes = children(main);
    			claim_component(route0.$$.fragment, main_nodes);
    			t1 = claim_space(main_nodes);
    			claim_component(route1.$$.fragment, main_nodes);
    			t2 = claim_space(main_nodes);
    			claim_component(route2.$$.fragment, main_nodes);
    			t3 = claim_space(main_nodes);
    			claim_component(route3.$$.fragment, main_nodes);
    			t4 = claim_space(main_nodes);
    			claim_component(route4.$$.fragment, main_nodes);
    			main_nodes.forEach(detach_dev);
    			t5 = claim_space(nodes);
    			claim_component(footer.$$.fragment, nodes);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(main, "class", "layout");
    			add_location(main, file$9, 22, 2, 713);
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			mount_component(route0, main, null);
    			append_dev(main, t1);
    			mount_component(route1, main, null);
    			append_dev(main, t2);
    			mount_component(route2, main, null);
    			append_dev(main, t3);
    			mount_component(route3, main, null);
    			append_dev(main, t4);
    			mount_component(route4, main, null);
    			insert_dev(target, t5, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const route4_changes = {};

    			if (dirty & /*$$scope*/ 8) {
    				route4_changes.$$scope = { dirty, ctx };
    			}

    			route4.$set(route4_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			transition_in(route2.$$.fragment, local);
    			transition_in(route3.$$.fragment, local);
    			transition_in(route4.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			transition_out(route2.$$.fragment, local);
    			transition_out(route3.$$.fragment, local);
    			transition_out(route4.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(route0);
    			destroy_component(route1);
    			destroy_component(route2);
    			destroy_component(route3);
    			destroy_component(route4);
    			if (detaching) detach_dev(t5);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(20:1) <Router {url}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let body;
    	let router;
    	let current;

    	router = new Router({
    			props: {
    				url: /*url*/ ctx[0],
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			body = element("body");
    			create_component(router.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			body = claim_element(nodes, "BODY", { class: true });
    			var body_nodes = children(body);
    			claim_component(router.$$.fragment, body_nodes);
    			body_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(body, "class", /*$chosenTheme*/ ctx[1]);
    			add_location(body, file$9, 18, 0, 614);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			mount_component(router, body, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const router_changes = {};
    			if (dirty & /*url*/ 1) router_changes.url = /*url*/ ctx[0];

    			if (dirty & /*$$scope*/ 8) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);

    			if (!current || dirty & /*$chosenTheme*/ 2) {
    				attr_dev(body, "class", /*$chosenTheme*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			destroy_component(router);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let $chosenTheme;
    	validate_store(chosenTheme, "chosenTheme");
    	component_subscribe($$self, chosenTheme, $$value => $$invalidate(1, $chosenTheme = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let { url = "" } = $$props; //This property is necessary declare to avoid ignore the Router
    	const storedTheme = localStorage.getItem("storedTheme");
    	const writable_props = ["url"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("url" in $$props) $$invalidate(0, url = $$props.url);
    	};

    	$$self.$capture_state = () => ({
    		Router,
    		Route,
    		chosenTheme,
    		Header,
    		Footer,
    		Home,
    		About,
    		Projects,
    		Contact,
    		Kitchen,
    		url,
    		storedTheme,
    		$chosenTheme
    	});

    	$$self.$inject_state = $$props => {
    		if ("url" in $$props) $$invalidate(0, url = $$props.url);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [url, $chosenTheme];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { url: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get url() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    	hydrate: true
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
