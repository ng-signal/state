var Og = Object.defineProperty,
  kg = Object.defineProperties;
var Pg = Object.getOwnPropertyDescriptors;
var wl = Object.getOwnPropertySymbols;
var Fg = Object.prototype.hasOwnProperty,
  Lg = Object.prototype.propertyIsEnumerable;
var bl = (e, t, n) => (t in e ? Og(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : (e[t] = n)),
  m = (e, t) => {
    for (var n in (t ||= {})) Fg.call(t, n) && bl(e, n, t[n]);
    if (wl) for (var n of wl(t)) Lg.call(t, n) && bl(e, n, t[n]);
    return e;
  },
  j = (e, t) => kg(e, Pg(t));
var Us;
function Co() {
  return Us;
}
function Ue(e) {
  let t = Us;
  return ((Us = e), t);
}
var Sl = Symbol('NotFound');
function un(e) {
  return e === Sl || e?.name === '\u0275NotFound';
}
var se = null,
  Io = !1,
  $s = 1,
  jg = null,
  ce = Symbol('SIGNAL');
function I(e) {
  let t = se;
  return ((se = e), t);
}
function _o() {
  return se;
}
var ln = {
  version: 0,
  lastCleanEpoch: 0,
  dirty: !1,
  producers: void 0,
  producersTail: void 0,
  consumers: void 0,
  consumersTail: void 0,
  recomputing: !1,
  consumerAllowSignalWrites: !1,
  consumerIsAlwaysLive: !1,
  kind: 'unknown',
  producerMustRecompute: () => !1,
  producerRecomputeValue: () => {},
  consumerMarkedDirty: () => {},
  consumerOnSignalRead: () => {}
};
function dn(e) {
  if (Io) throw new Error('');
  if (se === null) return;
  se.consumerOnSignalRead(e);
  let t = se.producersTail;
  if (t !== void 0 && t.producer === e) return;
  let n,
    r = se.recomputing;
  if (r && ((n = t !== void 0 ? t.nextProducer : se.producers), n !== void 0 && n.producer === e)) {
    ((se.producersTail = n), (n.lastReadVersion = e.version));
    return;
  }
  let o = e.consumersTail;
  if (o !== void 0 && o.consumer === se && (!r || Vg(o, se))) return;
  let i = pn(se),
    s = {
      producer: e,
      consumer: se,
      nextProducer: n,
      prevConsumer: o,
      lastReadVersion: e.version,
      nextConsumer: void 0
    };
  ((se.producersTail = s), t !== void 0 ? (t.nextProducer = s) : (se.producers = s), i && Nl(e, s));
}
function _l() {
  $s++;
}
function To(e) {
  if (!(pn(e) && !e.dirty) && !(!e.dirty && e.lastCleanEpoch === $s)) {
    if (!e.producerMustRecompute(e) && !ur(e)) {
      So(e);
      return;
    }
    (e.producerRecomputeValue(e), So(e));
  }
}
function zs(e) {
  if (e.consumers === void 0) return;
  let t = Io;
  Io = !0;
  try {
    for (let n = e.consumers; n !== void 0; n = n.nextConsumer) {
      let r = n.consumer;
      r.dirty || Bg(r);
    }
  } finally {
    Io = t;
  }
}
function Gs() {
  return se?.consumerAllowSignalWrites !== !1;
}
function Bg(e) {
  ((e.dirty = !0), zs(e), e.consumerMarkedDirty?.(e));
}
function So(e) {
  ((e.dirty = !1), (e.lastCleanEpoch = $s));
}
function fn(e) {
  return (e && Tl(e), I(e));
}
function Tl(e) {
  ((e.producersTail = void 0), (e.recomputing = !0));
}
function cr(e, t) {
  (I(t), e && Ml(e));
}
function Ml(e) {
  e.recomputing = !1;
  let t = e.producersTail,
    n = t !== void 0 ? t.nextProducer : e.producers;
  if (n !== void 0) {
    if (pn(e))
      do n = qs(n);
      while (n !== void 0);
    t !== void 0 ? (t.nextProducer = void 0) : (e.producers = void 0);
  }
}
function ur(e) {
  for (let t = e.producers; t !== void 0; t = t.nextProducer) {
    let n = t.producer,
      r = t.lastReadVersion;
    if (r !== n.version || (To(n), r !== n.version)) return !0;
  }
  return !1;
}
function lr(e) {
  if (pn(e)) {
    let t = e.producers;
    for (; t !== void 0; ) t = qs(t);
  }
  ((e.producers = void 0), (e.producersTail = void 0), (e.consumers = void 0), (e.consumersTail = void 0));
}
function Nl(e, t) {
  let n = e.consumersTail,
    r = pn(e);
  if (
    (n !== void 0
      ? ((t.nextConsumer = n.nextConsumer), (n.nextConsumer = t))
      : ((t.nextConsumer = void 0), (e.consumers = t)),
    (t.prevConsumer = n),
    (e.consumersTail = t),
    !r)
  )
    for (let o = e.producers; o !== void 0; o = o.nextProducer) Nl(o.producer, o);
}
function qs(e) {
  let t = e.producer,
    n = e.nextProducer,
    r = e.nextConsumer,
    o = e.prevConsumer;
  if (
    ((e.nextConsumer = void 0),
    (e.prevConsumer = void 0),
    r !== void 0 ? (r.prevConsumer = o) : (t.consumersTail = o),
    o !== void 0)
  )
    o.nextConsumer = r;
  else if (((t.consumers = r), !pn(t))) {
    let i = t.producers;
    for (; i !== void 0; ) i = qs(i);
  }
  return n;
}
function pn(e) {
  return e.consumerIsAlwaysLive || e.consumers !== void 0;
}
function Mo(e) {
  jg?.(e);
}
function Vg(e, t) {
  let n = t.producersTail;
  if (n !== void 0) {
    let r = t.producers;
    do {
      if (r === e) return !0;
      if (r === n) break;
      r = r.nextProducer;
    } while (r !== void 0);
  }
  return !1;
}
function No(e, t) {
  return Object.is(e, t);
}
function Ao(e, t) {
  let n = Object.create(Hg);
  ((n.computation = e), t !== void 0 && (n.equal = t));
  let r = () => {
    if ((To(n), dn(n), n.value === ar)) throw n.error;
    return n.value;
  };
  return ((r[ce] = n), Mo(n), r);
}
var wo = Symbol('UNSET'),
  bo = Symbol('COMPUTING'),
  ar = Symbol('ERRORED'),
  Hg = j(m({}, ln), {
    value: wo,
    dirty: !0,
    error: null,
    equal: No,
    kind: 'computed',
    producerMustRecompute(e) {
      return e.value === wo || e.value === bo;
    },
    producerRecomputeValue(e) {
      if (e.value === bo) throw new Error('');
      let t = e.value;
      e.value = bo;
      let n = fn(e),
        r,
        o = !1;
      try {
        ((r = e.computation()), I(null), (o = t !== wo && t !== ar && r !== ar && e.equal(t, r)));
      } catch (i) {
        ((r = ar), (e.error = i));
      } finally {
        cr(e, n);
      }
      if (o) {
        e.value = t;
        return;
      }
      ((e.value = r), e.version++);
    }
  });
function Ug() {
  throw new Error();
}
var Al = Ug;
function Rl(e) {
  Al(e);
}
function Ws(e) {
  Al = e;
}
var $g = null;
function Zs(e, t) {
  let n = Object.create(Ro);
  ((n.value = e), t !== void 0 && (n.equal = t));
  let r = () => xl(n);
  return ((r[ce] = n), Mo(n), [r, (s) => hn(n, s), (s) => Ys(n, s)]);
}
function xl(e) {
  return (dn(e), e.value);
}
function hn(e, t) {
  (Gs() || Rl(e), e.equal(e.value, t) || ((e.value = t), zg(e)));
}
function Ys(e, t) {
  (Gs() || Rl(e), hn(e, t(e.value)));
}
var Ro = j(m({}, ln), { equal: No, value: void 0, kind: 'signal' });
function zg(e) {
  (e.version++, _l(), zs(e), $g?.(e));
}
function w(e) {
  return typeof e == 'function';
}
function gn(e) {
  let n = e((r) => {
    (Error.call(r), (r.stack = new Error().stack));
  });
  return ((n.prototype = Object.create(Error.prototype)), (n.prototype.constructor = n), n);
}
var xo = gn(
  (e) =>
    function (n) {
      (e(this),
        (this.message = n
          ? `${n.length} errors occurred during unsubscription:
${n.map((r, o) => `${o + 1}) ${r.toString()}`).join(`
  `)}`
          : ''),
        (this.name = 'UnsubscriptionError'),
        (this.errors = n));
    }
);
function dr(e, t) {
  if (e) {
    let n = e.indexOf(t);
    0 <= n && e.splice(n, 1);
  }
}
var $ = class e {
  constructor(t) {
    ((this.initialTeardown = t), (this.closed = !1), (this._parentage = null), (this._finalizers = null));
  }
  unsubscribe() {
    let t;
    if (!this.closed) {
      this.closed = !0;
      let { _parentage: n } = this;
      if (n)
        if (((this._parentage = null), Array.isArray(n))) for (let i of n) i.remove(this);
        else n.remove(this);
      let { initialTeardown: r } = this;
      if (w(r))
        try {
          r();
        } catch (i) {
          t = i instanceof xo ? i.errors : [i];
        }
      let { _finalizers: o } = this;
      if (o) {
        this._finalizers = null;
        for (let i of o)
          try {
            Ol(i);
          } catch (s) {
            ((t = t ?? []), s instanceof xo ? (t = [...t, ...s.errors]) : t.push(s));
          }
      }
      if (t) throw new xo(t);
    }
  }
  add(t) {
    var n;
    if (t && t !== this)
      if (this.closed) Ol(t);
      else {
        if (t instanceof e) {
          if (t.closed || t._hasParent(this)) return;
          t._addParent(this);
        }
        (this._finalizers = (n = this._finalizers) !== null && n !== void 0 ? n : []).push(t);
      }
  }
  _hasParent(t) {
    let { _parentage: n } = this;
    return n === t || (Array.isArray(n) && n.includes(t));
  }
  _addParent(t) {
    let { _parentage: n } = this;
    this._parentage = Array.isArray(n) ? (n.push(t), n) : n ? [n, t] : t;
  }
  _removeParent(t) {
    let { _parentage: n } = this;
    n === t ? (this._parentage = null) : Array.isArray(n) && dr(n, t);
  }
  remove(t) {
    let { _finalizers: n } = this;
    (n && dr(n, t), t instanceof e && t._removeParent(this));
  }
};
$.EMPTY = (() => {
  let e = new $();
  return ((e.closed = !0), e);
})();
var Qs = $.EMPTY;
function Oo(e) {
  return e instanceof $ || (e && 'closed' in e && w(e.remove) && w(e.add) && w(e.unsubscribe));
}
function Ol(e) {
  w(e) ? e() : e.unsubscribe();
}
var xe = {
  onUnhandledError: null,
  onStoppedNotification: null,
  Promise: void 0,
  useDeprecatedSynchronousErrorHandling: !1,
  useDeprecatedNextContext: !1
};
var mn = {
  setTimeout(e, t, ...n) {
    let { delegate: r } = mn;
    return r?.setTimeout ? r.setTimeout(e, t, ...n) : setTimeout(e, t, ...n);
  },
  clearTimeout(e) {
    let { delegate: t } = mn;
    return (t?.clearTimeout || clearTimeout)(e);
  },
  delegate: void 0
};
function ko(e) {
  mn.setTimeout(() => {
    let { onUnhandledError: t } = xe;
    if (t) t(e);
    else throw e;
  });
}
function fr() {}
var kl = Ks('C', void 0, void 0);
function Pl(e) {
  return Ks('E', void 0, e);
}
function Fl(e) {
  return Ks('N', e, void 0);
}
function Ks(e, t, n) {
  return { kind: e, value: t, error: n };
}
var kt = null;
function vn(e) {
  if (xe.useDeprecatedSynchronousErrorHandling) {
    let t = !kt;
    if ((t && (kt = { errorThrown: !1, error: null }), e(), t)) {
      let { errorThrown: n, error: r } = kt;
      if (((kt = null), n)) throw r;
    }
  } else e();
}
function Ll(e) {
  xe.useDeprecatedSynchronousErrorHandling && kt && ((kt.errorThrown = !0), (kt.error = e));
}
var Pt = class extends $ {
    constructor(t) {
      (super(), (this.isStopped = !1), t ? ((this.destination = t), Oo(t) && t.add(this)) : (this.destination = Wg));
    }
    static create(t, n, r) {
      return new yn(t, n, r);
    }
    next(t) {
      this.isStopped ? Xs(Fl(t), this) : this._next(t);
    }
    error(t) {
      this.isStopped ? Xs(Pl(t), this) : ((this.isStopped = !0), this._error(t));
    }
    complete() {
      this.isStopped ? Xs(kl, this) : ((this.isStopped = !0), this._complete());
    }
    unsubscribe() {
      this.closed || ((this.isStopped = !0), super.unsubscribe(), (this.destination = null));
    }
    _next(t) {
      this.destination.next(t);
    }
    _error(t) {
      try {
        this.destination.error(t);
      } finally {
        this.unsubscribe();
      }
    }
    _complete() {
      try {
        this.destination.complete();
      } finally {
        this.unsubscribe();
      }
    }
  },
  Gg = Function.prototype.bind;
function Js(e, t) {
  return Gg.call(e, t);
}
var ea = class {
    constructor(t) {
      this.partialObserver = t;
    }
    next(t) {
      let { partialObserver: n } = this;
      if (n.next)
        try {
          n.next(t);
        } catch (r) {
          Po(r);
        }
    }
    error(t) {
      let { partialObserver: n } = this;
      if (n.error)
        try {
          n.error(t);
        } catch (r) {
          Po(r);
        }
      else Po(t);
    }
    complete() {
      let { partialObserver: t } = this;
      if (t.complete)
        try {
          t.complete();
        } catch (n) {
          Po(n);
        }
    }
  },
  yn = class extends Pt {
    constructor(t, n, r) {
      super();
      let o;
      if (w(t) || !t) o = { next: t ?? void 0, error: n ?? void 0, complete: r ?? void 0 };
      else {
        let i;
        this && xe.useDeprecatedNextContext
          ? ((i = Object.create(t)),
            (i.unsubscribe = () => this.unsubscribe()),
            (o = {
              next: t.next && Js(t.next, i),
              error: t.error && Js(t.error, i),
              complete: t.complete && Js(t.complete, i)
            }))
          : (o = t);
      }
      this.destination = new ea(o);
    }
  };
function Po(e) {
  xe.useDeprecatedSynchronousErrorHandling ? Ll(e) : ko(e);
}
function qg(e) {
  throw e;
}
function Xs(e, t) {
  let { onStoppedNotification: n } = xe;
  n && mn.setTimeout(() => n(e, t));
}
var Wg = { closed: !0, next: fr, error: qg, complete: fr };
var Dn = (typeof Symbol == 'function' && Symbol.observable) || '@@observable';
function De(e) {
  return e;
}
function ta(...e) {
  return na(e);
}
function na(e) {
  return e.length === 0
    ? De
    : e.length === 1
      ? e[0]
      : function (n) {
          return e.reduce((r, o) => o(r), n);
        };
}
var A = (() => {
  class e {
    constructor(n) {
      n && (this._subscribe = n);
    }
    lift(n) {
      let r = new e();
      return ((r.source = this), (r.operator = n), r);
    }
    subscribe(n, r, o) {
      let i = Yg(n) ? n : new yn(n, r, o);
      return (
        vn(() => {
          let { operator: s, source: a } = this;
          i.add(s ? s.call(i, a) : a ? this._subscribe(i) : this._trySubscribe(i));
        }),
        i
      );
    }
    _trySubscribe(n) {
      try {
        return this._subscribe(n);
      } catch (r) {
        n.error(r);
      }
    }
    forEach(n, r) {
      return (
        (r = jl(r)),
        new r((o, i) => {
          let s = new yn({
            next: (a) => {
              try {
                n(a);
              } catch (c) {
                (i(c), s.unsubscribe());
              }
            },
            error: i,
            complete: o
          });
          this.subscribe(s);
        })
      );
    }
    _subscribe(n) {
      var r;
      return (r = this.source) === null || r === void 0 ? void 0 : r.subscribe(n);
    }
    [Dn]() {
      return this;
    }
    pipe(...n) {
      return na(n)(this);
    }
    toPromise(n) {
      return (
        (n = jl(n)),
        new n((r, o) => {
          let i;
          this.subscribe(
            (s) => (i = s),
            (s) => o(s),
            () => r(i)
          );
        })
      );
    }
  }
  return ((e.create = (t) => new e(t)), e);
})();
function jl(e) {
  var t;
  return (t = e ?? xe.Promise) !== null && t !== void 0 ? t : Promise;
}
function Zg(e) {
  return e && w(e.next) && w(e.error) && w(e.complete);
}
function Yg(e) {
  return (e && e instanceof Pt) || (Zg(e) && Oo(e));
}
function ra(e) {
  return w(e?.lift);
}
function R(e) {
  return (t) => {
    if (ra(t))
      return t.lift(function (n) {
        try {
          return e(n, this);
        } catch (r) {
          this.error(r);
        }
      });
    throw new TypeError('Unable to lift unknown Observable type');
  };
}
function x(e, t, n, r, o) {
  return new oa(e, t, n, r, o);
}
var oa = class extends Pt {
  constructor(t, n, r, o, i, s) {
    (super(t),
      (this.onFinalize = i),
      (this.shouldUnsubscribe = s),
      (this._next = n
        ? function (a) {
            try {
              n(a);
            } catch (c) {
              t.error(c);
            }
          }
        : super._next),
      (this._error = o
        ? function (a) {
            try {
              o(a);
            } catch (c) {
              t.error(c);
            } finally {
              this.unsubscribe();
            }
          }
        : super._error),
      (this._complete = r
        ? function () {
            try {
              r();
            } catch (a) {
              t.error(a);
            } finally {
              this.unsubscribe();
            }
          }
        : super._complete));
  }
  unsubscribe() {
    var t;
    if (!this.shouldUnsubscribe || this.shouldUnsubscribe()) {
      let { closed: n } = this;
      (super.unsubscribe(), !n && ((t = this.onFinalize) === null || t === void 0 || t.call(this)));
    }
  }
};
function En() {
  return R((e, t) => {
    let n = null;
    e._refCount++;
    let r = x(t, void 0, void 0, void 0, () => {
      if (!e || e._refCount <= 0 || 0 < --e._refCount) {
        n = null;
        return;
      }
      let o = e._connection,
        i = n;
      ((n = null), o && (!i || o === i) && o.unsubscribe(), t.unsubscribe());
    });
    (e.subscribe(r), r.closed || (n = e.connect()));
  });
}
var Cn = class extends A {
  constructor(t, n) {
    (super(),
      (this.source = t),
      (this.subjectFactory = n),
      (this._subject = null),
      (this._refCount = 0),
      (this._connection = null),
      ra(t) && (this.lift = t.lift));
  }
  _subscribe(t) {
    return this.getSubject().subscribe(t);
  }
  getSubject() {
    let t = this._subject;
    return ((!t || t.isStopped) && (this._subject = this.subjectFactory()), this._subject);
  }
  _teardown() {
    this._refCount = 0;
    let { _connection: t } = this;
    ((this._subject = this._connection = null), t?.unsubscribe());
  }
  connect() {
    let t = this._connection;
    if (!t) {
      t = this._connection = new $();
      let n = this.getSubject();
      (t.add(
        this.source.subscribe(
          x(
            n,
            void 0,
            () => {
              (this._teardown(), n.complete());
            },
            (r) => {
              (this._teardown(), n.error(r));
            },
            () => this._teardown()
          )
        )
      ),
        t.closed && ((this._connection = null), (t = $.EMPTY)));
    }
    return t;
  }
  refCount() {
    return En()(this);
  }
};
var Bl = gn(
  (e) =>
    function () {
      (e(this), (this.name = 'ObjectUnsubscribedError'), (this.message = 'object unsubscribed'));
    }
);
var q = (() => {
    class e extends A {
      constructor() {
        (super(),
          (this.closed = !1),
          (this.currentObservers = null),
          (this.observers = []),
          (this.isStopped = !1),
          (this.hasError = !1),
          (this.thrownError = null));
      }
      lift(n) {
        let r = new Fo(this, this);
        return ((r.operator = n), r);
      }
      _throwIfClosed() {
        if (this.closed) throw new Bl();
      }
      next(n) {
        vn(() => {
          if ((this._throwIfClosed(), !this.isStopped)) {
            this.currentObservers || (this.currentObservers = Array.from(this.observers));
            for (let r of this.currentObservers) r.next(n);
          }
        });
      }
      error(n) {
        vn(() => {
          if ((this._throwIfClosed(), !this.isStopped)) {
            ((this.hasError = this.isStopped = !0), (this.thrownError = n));
            let { observers: r } = this;
            for (; r.length; ) r.shift().error(n);
          }
        });
      }
      complete() {
        vn(() => {
          if ((this._throwIfClosed(), !this.isStopped)) {
            this.isStopped = !0;
            let { observers: n } = this;
            for (; n.length; ) n.shift().complete();
          }
        });
      }
      unsubscribe() {
        ((this.isStopped = this.closed = !0), (this.observers = this.currentObservers = null));
      }
      get observed() {
        var n;
        return ((n = this.observers) === null || n === void 0 ? void 0 : n.length) > 0;
      }
      _trySubscribe(n) {
        return (this._throwIfClosed(), super._trySubscribe(n));
      }
      _subscribe(n) {
        return (this._throwIfClosed(), this._checkFinalizedStatuses(n), this._innerSubscribe(n));
      }
      _innerSubscribe(n) {
        let { hasError: r, isStopped: o, observers: i } = this;
        return r || o
          ? Qs
          : ((this.currentObservers = null),
            i.push(n),
            new $(() => {
              ((this.currentObservers = null), dr(i, n));
            }));
      }
      _checkFinalizedStatuses(n) {
        let { hasError: r, thrownError: o, isStopped: i } = this;
        r ? n.error(o) : i && n.complete();
      }
      asObservable() {
        let n = new A();
        return ((n.source = this), n);
      }
    }
    return ((e.create = (t, n) => new Fo(t, n)), e);
  })(),
  Fo = class extends q {
    constructor(t, n) {
      (super(), (this.destination = t), (this.source = n));
    }
    next(t) {
      var n, r;
      (r = (n = this.destination) === null || n === void 0 ? void 0 : n.next) === null || r === void 0 || r.call(n, t);
    }
    error(t) {
      var n, r;
      (r = (n = this.destination) === null || n === void 0 ? void 0 : n.error) === null || r === void 0 || r.call(n, t);
    }
    complete() {
      var t, n;
      (n = (t = this.destination) === null || t === void 0 ? void 0 : t.complete) === null || n === void 0 || n.call(t);
    }
    _subscribe(t) {
      var n, r;
      return (r = (n = this.source) === null || n === void 0 ? void 0 : n.subscribe(t)) !== null && r !== void 0
        ? r
        : Qs;
    }
  };
var re = class extends q {
  constructor(t) {
    (super(), (this._value = t));
  }
  get value() {
    return this.getValue();
  }
  _subscribe(t) {
    let n = super._subscribe(t);
    return (!n.closed && t.next(this._value), n);
  }
  getValue() {
    let { hasError: t, thrownError: n, _value: r } = this;
    if (t) throw n;
    return (this._throwIfClosed(), r);
  }
  next(t) {
    super.next((this._value = t));
  }
};
var fe = new A((e) => e.complete());
function Vl(e) {
  return e && w(e.schedule);
}
function Hl(e) {
  return e[e.length - 1];
}
function Ul(e) {
  return w(Hl(e)) ? e.pop() : void 0;
}
function gt(e) {
  return Vl(Hl(e)) ? e.pop() : void 0;
}
function zl(e, t, n, r) {
  function o(i) {
    return i instanceof n
      ? i
      : new n(function (s) {
          s(i);
        });
  }
  return new (n || (n = Promise))(function (i, s) {
    function a(l) {
      try {
        u(r.next(l));
      } catch (d) {
        s(d);
      }
    }
    function c(l) {
      try {
        u(r.throw(l));
      } catch (d) {
        s(d);
      }
    }
    function u(l) {
      l.done ? i(l.value) : o(l.value).then(a, c);
    }
    u((r = r.apply(e, t || [])).next());
  });
}
function $l(e) {
  var t = typeof Symbol == 'function' && Symbol.iterator,
    n = t && e[t],
    r = 0;
  if (n) return n.call(e);
  if (e && typeof e.length == 'number')
    return {
      next: function () {
        return (e && r >= e.length && (e = void 0), { value: e && e[r++], done: !e });
      }
    };
  throw new TypeError(t ? 'Object is not iterable.' : 'Symbol.iterator is not defined.');
}
function Ft(e) {
  return this instanceof Ft ? ((this.v = e), this) : new Ft(e);
}
function Gl(e, t, n) {
  if (!Symbol.asyncIterator) throw new TypeError('Symbol.asyncIterator is not defined.');
  var r = n.apply(e, t || []),
    o,
    i = [];
  return (
    (o = Object.create((typeof AsyncIterator == 'function' ? AsyncIterator : Object).prototype)),
    a('next'),
    a('throw'),
    a('return', s),
    (o[Symbol.asyncIterator] = function () {
      return this;
    }),
    o
  );
  function s(f) {
    return function (g) {
      return Promise.resolve(g).then(f, d);
    };
  }
  function a(f, g) {
    r[f] &&
      ((o[f] = function (E) {
        return new Promise(function (M, N) {
          i.push([f, E, M, N]) > 1 || c(f, E);
        });
      }),
      g && (o[f] = g(o[f])));
  }
  function c(f, g) {
    try {
      u(r[f](g));
    } catch (E) {
      p(i[0][3], E);
    }
  }
  function u(f) {
    f.value instanceof Ft ? Promise.resolve(f.value.v).then(l, d) : p(i[0][2], f);
  }
  function l(f) {
    c('next', f);
  }
  function d(f) {
    c('throw', f);
  }
  function p(f, g) {
    (f(g), i.shift(), i.length && c(i[0][0], i[0][1]));
  }
}
function ql(e) {
  if (!Symbol.asyncIterator) throw new TypeError('Symbol.asyncIterator is not defined.');
  var t = e[Symbol.asyncIterator],
    n;
  return t
    ? t.call(e)
    : ((e = typeof $l == 'function' ? $l(e) : e[Symbol.iterator]()),
      (n = {}),
      r('next'),
      r('throw'),
      r('return'),
      (n[Symbol.asyncIterator] = function () {
        return this;
      }),
      n);
  function r(i) {
    n[i] =
      e[i] &&
      function (s) {
        return new Promise(function (a, c) {
          ((s = e[i](s)), o(a, c, s.done, s.value));
        });
      };
  }
  function o(i, s, a, c) {
    Promise.resolve(c).then(function (u) {
      i({ value: u, done: a });
    }, s);
  }
}
var Lo = (e) => e && typeof e.length == 'number' && typeof e != 'function';
function jo(e) {
  return w(e?.then);
}
function Bo(e) {
  return w(e[Dn]);
}
function Vo(e) {
  return Symbol.asyncIterator && w(e?.[Symbol.asyncIterator]);
}
function Ho(e) {
  return new TypeError(
    `You provided ${e !== null && typeof e == 'object' ? 'an invalid object' : `'${e}'`} where a stream was expected. You can provide an Observable, Promise, ReadableStream, Array, AsyncIterable, or Iterable.`
  );
}
function Qg() {
  return typeof Symbol != 'function' || !Symbol.iterator ? '@@iterator' : Symbol.iterator;
}
var Uo = Qg();
function $o(e) {
  return w(e?.[Uo]);
}
function zo(e) {
  return Gl(this, arguments, function* () {
    let n = e.getReader();
    try {
      for (;;) {
        let { value: r, done: o } = yield Ft(n.read());
        if (o) return yield Ft(void 0);
        yield yield Ft(r);
      }
    } finally {
      n.releaseLock();
    }
  });
}
function Go(e) {
  return w(e?.getReader);
}
function Q(e) {
  if (e instanceof A) return e;
  if (e != null) {
    if (Bo(e)) return Kg(e);
    if (Lo(e)) return Jg(e);
    if (jo(e)) return Xg(e);
    if (Vo(e)) return Wl(e);
    if ($o(e)) return em(e);
    if (Go(e)) return tm(e);
  }
  throw Ho(e);
}
function Kg(e) {
  return new A((t) => {
    let n = e[Dn]();
    if (w(n.subscribe)) return n.subscribe(t);
    throw new TypeError('Provided object does not correctly implement Symbol.observable');
  });
}
function Jg(e) {
  return new A((t) => {
    for (let n = 0; n < e.length && !t.closed; n++) t.next(e[n]);
    t.complete();
  });
}
function Xg(e) {
  return new A((t) => {
    e.then(
      (n) => {
        t.closed || (t.next(n), t.complete());
      },
      (n) => t.error(n)
    ).then(null, ko);
  });
}
function em(e) {
  return new A((t) => {
    for (let n of e) if ((t.next(n), t.closed)) return;
    t.complete();
  });
}
function Wl(e) {
  return new A((t) => {
    nm(e, t).catch((n) => t.error(n));
  });
}
function tm(e) {
  return Wl(zo(e));
}
function nm(e, t) {
  var n, r, o, i;
  return zl(this, void 0, void 0, function* () {
    try {
      for (n = ql(e); (r = yield n.next()), !r.done; ) {
        let s = r.value;
        if ((t.next(s), t.closed)) return;
      }
    } catch (s) {
      o = { error: s };
    } finally {
      try {
        r && !r.done && (i = n.return) && (yield i.call(n));
      } finally {
        if (o) throw o.error;
      }
    }
    t.complete();
  });
}
function pe(e, t, n, r = 0, o = !1) {
  let i = t.schedule(function () {
    (n(), o ? e.add(this.schedule(null, r)) : this.unsubscribe());
  }, r);
  if ((e.add(i), !o)) return i;
}
function qo(e, t = 0) {
  return R((n, r) => {
    n.subscribe(
      x(
        r,
        (o) => pe(r, e, () => r.next(o), t),
        () => pe(r, e, () => r.complete(), t),
        (o) => pe(r, e, () => r.error(o), t)
      )
    );
  });
}
function Wo(e, t = 0) {
  return R((n, r) => {
    r.add(e.schedule(() => n.subscribe(r), t));
  });
}
function Zl(e, t) {
  return Q(e).pipe(Wo(t), qo(t));
}
function Yl(e, t) {
  return Q(e).pipe(Wo(t), qo(t));
}
function Ql(e, t) {
  return new A((n) => {
    let r = 0;
    return t.schedule(function () {
      r === e.length ? n.complete() : (n.next(e[r++]), n.closed || this.schedule());
    });
  });
}
function Kl(e, t) {
  return new A((n) => {
    let r;
    return (
      pe(n, t, () => {
        ((r = e[Uo]()),
          pe(
            n,
            t,
            () => {
              let o, i;
              try {
                ({ value: o, done: i } = r.next());
              } catch (s) {
                n.error(s);
                return;
              }
              i ? n.complete() : n.next(o);
            },
            0,
            !0
          ));
      }),
      () => w(r?.return) && r.return()
    );
  });
}
function Zo(e, t) {
  if (!e) throw new Error('Iterable cannot be null');
  return new A((n) => {
    pe(n, t, () => {
      let r = e[Symbol.asyncIterator]();
      pe(
        n,
        t,
        () => {
          r.next().then((o) => {
            o.done ? n.complete() : n.next(o.value);
          });
        },
        0,
        !0
      );
    });
  });
}
function Jl(e, t) {
  return Zo(zo(e), t);
}
function Xl(e, t) {
  if (e != null) {
    if (Bo(e)) return Zl(e, t);
    if (Lo(e)) return Ql(e, t);
    if (jo(e)) return Yl(e, t);
    if (Vo(e)) return Zo(e, t);
    if ($o(e)) return Kl(e, t);
    if (Go(e)) return Jl(e, t);
  }
  throw Ho(e);
}
function z(e, t) {
  return t ? Xl(e, t) : Q(e);
}
function C(...e) {
  let t = gt(e);
  return z(e, t);
}
function In(e, t) {
  let n = w(e) ? e : () => e,
    r = (o) => o.error(n());
  return new A(t ? (o) => t.schedule(r, 0, o) : r);
}
function ia(e) {
  return !!e && (e instanceof A || (w(e.lift) && w(e.subscribe)));
}
var Qe = gn(
  (e) =>
    function () {
      (e(this), (this.name = 'EmptyError'), (this.message = 'no elements in sequence'));
    }
);
function O(e, t) {
  return R((n, r) => {
    let o = 0;
    n.subscribe(
      x(r, (i) => {
        r.next(e.call(t, i, o++));
      })
    );
  });
}
var { isArray: rm } = Array;
function om(e, t) {
  return rm(t) ? e(...t) : e(t);
}
function ed(e) {
  return O((t) => om(e, t));
}
var { isArray: im } = Array,
  { getPrototypeOf: sm, prototype: am, keys: cm } = Object;
function td(e) {
  if (e.length === 1) {
    let t = e[0];
    if (im(t)) return { args: t, keys: null };
    if (um(t)) {
      let n = cm(t);
      return { args: n.map((r) => t[r]), keys: n };
    }
  }
  return { args: e, keys: null };
}
function um(e) {
  return e && typeof e == 'object' && sm(e) === am;
}
function nd(e, t) {
  return e.reduce((n, r, o) => ((n[r] = t[o]), n), {});
}
function Yo(...e) {
  let t = gt(e),
    n = Ul(e),
    { args: r, keys: o } = td(e);
  if (r.length === 0) return z([], t);
  let i = new A(lm(r, t, o ? (s) => nd(o, s) : De));
  return n ? i.pipe(ed(n)) : i;
}
function lm(e, t, n = De) {
  return (r) => {
    rd(
      t,
      () => {
        let { length: o } = e,
          i = new Array(o),
          s = o,
          a = o;
        for (let c = 0; c < o; c++)
          rd(
            t,
            () => {
              let u = z(e[c], t),
                l = !1;
              u.subscribe(
                x(
                  r,
                  (d) => {
                    ((i[c] = d), l || ((l = !0), a--), a || r.next(n(i.slice())));
                  },
                  () => {
                    --s || r.complete();
                  }
                )
              );
            },
            r
          );
      },
      r
    );
  };
}
function rd(e, t, n) {
  e ? pe(n, e, t) : t();
}
function od(e, t, n, r, o, i, s, a) {
  let c = [],
    u = 0,
    l = 0,
    d = !1,
    p = () => {
      d && !c.length && !u && t.complete();
    },
    f = (E) => (u < r ? g(E) : c.push(E)),
    g = (E) => {
      (i && t.next(E), u++);
      let M = !1;
      Q(n(E, l++)).subscribe(
        x(
          t,
          (N) => {
            (o?.(N), i ? f(N) : t.next(N));
          },
          () => {
            M = !0;
          },
          void 0,
          () => {
            if (M)
              try {
                for (u--; c.length && u < r; ) {
                  let N = c.shift();
                  s ? pe(t, s, () => g(N)) : g(N);
                }
                p();
              } catch (N) {
                t.error(N);
              }
          }
        )
      );
    };
  return (
    e.subscribe(
      x(t, f, () => {
        ((d = !0), p());
      })
    ),
    () => {
      a?.();
    }
  );
}
function W(e, t, n = 1 / 0) {
  return w(t)
    ? W((r, o) => O((i, s) => t(r, i, o, s))(Q(e(r, o))), n)
    : (typeof t == 'number' && (n = t), R((r, o) => od(r, o, e, n)));
}
function id(e = 1 / 0) {
  return W(De, e);
}
function sd() {
  return id(1);
}
function wn(...e) {
  return sd()(z(e, gt(e)));
}
function pr(e) {
  return new A((t) => {
    Q(e()).subscribe(t);
  });
}
function he(e, t) {
  return R((n, r) => {
    let o = 0;
    n.subscribe(x(r, (i) => e.call(t, i, o++) && r.next(i)));
  });
}
function mt(e) {
  return R((t, n) => {
    let r = null,
      o = !1,
      i;
    ((r = t.subscribe(
      x(n, void 0, void 0, (s) => {
        ((i = Q(e(s, mt(e)(t)))), r ? (r.unsubscribe(), (r = null), i.subscribe(n)) : (o = !0));
      })
    )),
      o && (r.unsubscribe(), (r = null), i.subscribe(n)));
  });
}
function ad(e, t, n, r, o) {
  return (i, s) => {
    let a = n,
      c = t,
      u = 0;
    i.subscribe(
      x(
        s,
        (l) => {
          let d = u++;
          ((c = a ? e(c, l, d) : ((a = !0), l)), r && s.next(c));
        },
        o &&
          (() => {
            (a && s.next(c), s.complete());
          })
      )
    );
  };
}
function bn(e, t) {
  return w(t) ? W(e, t, 1) : W(e, 1);
}
function vt(e) {
  return R((t, n) => {
    let r = !1;
    t.subscribe(
      x(
        n,
        (o) => {
          ((r = !0), n.next(o));
        },
        () => {
          (r || n.next(e), n.complete());
        }
      )
    );
  });
}
function Ke(e) {
  return e <= 0
    ? () => fe
    : R((t, n) => {
        let r = 0;
        t.subscribe(
          x(n, (o) => {
            ++r <= e && (n.next(o), e <= r && n.complete());
          })
        );
      });
}
function Qo(e = dm) {
  return R((t, n) => {
    let r = !1;
    t.subscribe(
      x(
        n,
        (o) => {
          ((r = !0), n.next(o));
        },
        () => (r ? n.complete() : n.error(e()))
      )
    );
  });
}
function dm() {
  return new Qe();
}
function hr(e) {
  return R((t, n) => {
    try {
      t.subscribe(n);
    } finally {
      n.add(e);
    }
  });
}
function Je(e, t) {
  let n = arguments.length >= 2;
  return (r) => r.pipe(e ? he((o, i) => e(o, i, r)) : De, Ke(1), n ? vt(t) : Qo(() => new Qe()));
}
function Sn(e) {
  return e <= 0
    ? () => fe
    : R((t, n) => {
        let r = [];
        t.subscribe(
          x(
            n,
            (o) => {
              (r.push(o), e < r.length && r.shift());
            },
            () => {
              for (let o of r) n.next(o);
              n.complete();
            },
            void 0,
            () => {
              r = null;
            }
          )
        );
      });
}
function sa(e, t) {
  let n = arguments.length >= 2;
  return (r) => r.pipe(e ? he((o, i) => e(o, i, r)) : De, Sn(1), n ? vt(t) : Qo(() => new Qe()));
}
function aa(e, t) {
  return R(ad(e, t, arguments.length >= 2, !0));
}
function ca(...e) {
  let t = gt(e);
  return R((n, r) => {
    (t ? wn(e, n, t) : wn(e, n)).subscribe(r);
  });
}
function ge(e, t) {
  return R((n, r) => {
    let o = null,
      i = 0,
      s = !1,
      a = () => s && !o && r.complete();
    n.subscribe(
      x(
        r,
        (c) => {
          o?.unsubscribe();
          let u = 0,
            l = i++;
          Q(e(c, l)).subscribe(
            (o = x(
              r,
              (d) => r.next(t ? t(c, d, l, u++) : d),
              () => {
                ((o = null), a());
              }
            ))
          );
        },
        () => {
          ((s = !0), a());
        }
      )
    );
  });
}
function _n(e) {
  return R((t, n) => {
    (Q(e).subscribe(x(n, () => n.complete(), fr)), !n.closed && t.subscribe(n));
  });
}
function K(e, t, n) {
  let r = w(e) || t || n ? { next: e, error: t, complete: n } : e;
  return r
    ? R((o, i) => {
        var s;
        (s = r.subscribe) === null || s === void 0 || s.call(r);
        let a = !0;
        o.subscribe(
          x(
            i,
            (c) => {
              var u;
              ((u = r.next) === null || u === void 0 || u.call(r, c), i.next(c));
            },
            () => {
              var c;
              ((a = !1), (c = r.complete) === null || c === void 0 || c.call(r), i.complete());
            },
            (c) => {
              var u;
              ((a = !1), (u = r.error) === null || u === void 0 || u.call(r, c), i.error(c));
            },
            () => {
              var c, u;
              (a && ((c = r.unsubscribe) === null || c === void 0 || c.call(r)),
                (u = r.finalize) === null || u === void 0 || u.call(r));
            }
          )
        );
      })
    : De;
}
function cd(e) {
  let t = I(null);
  try {
    return e();
  } finally {
    I(t);
  }
}
var Ea = 'https://angular.dev/best-practices/security#preventing-cross-site-scripting-xss',
  v = class extends Error {
    code;
    constructor(t, n) {
      (super(Mn(t, n)), (this.code = t));
    }
  };
function fm(e) {
  return `NG0${Math.abs(e)}`;
}
function Mn(e, t) {
  return `${fm(e)}${t ? ': ' + t : ''}`;
}
var Vt = globalThis;
function P(e) {
  for (let t in e) if (e[t] === P) return t;
  throw Error('');
}
function et(e) {
  if (typeof e == 'string') return e;
  if (Array.isArray(e)) return `[${e.map(et).join(', ')}]`;
  if (e == null) return '' + e;
  let t = e.overriddenName || e.name;
  if (t) return `${t}`;
  let n = e.toString();
  if (n == null) return '' + n;
  let r = n.indexOf(`
`);
  return r >= 0 ? n.slice(0, r) : n;
}
function Ca(e, t) {
  return e ? (t ? `${e} ${t}` : e) : t || '';
}
var pm = P({ __forward_ref__: P });
function ti(e) {
  return (
    (e.__forward_ref__ = ti),
    (e.toString = function () {
      return et(this());
    }),
    e
  );
}
function me(e) {
  return Ia(e) ? e() : e;
}
function Ia(e) {
  return typeof e == 'function' && e.hasOwnProperty(pm) && e.__forward_ref__ === ti;
}
function y(e) {
  return { token: e.token, providedIn: e.providedIn || null, factory: e.factory, value: void 0 };
}
function yr(e) {
  return hm(e, ni);
}
function wa(e) {
  return yr(e) !== null;
}
function hm(e, t) {
  return (e.hasOwnProperty(t) && e[t]) || null;
}
function gm(e) {
  let t = e?.[ni] ?? null;
  return t || null;
}
function la(e) {
  return e && e.hasOwnProperty(Jo) ? e[Jo] : null;
}
var ni = P({ ɵprov: P }),
  Jo = P({ ɵinj: P }),
  D = class {
    _desc;
    ngMetadataName = 'InjectionToken';
    ɵprov;
    constructor(t, n) {
      ((this._desc = t),
        (this.ɵprov = void 0),
        typeof n == 'number'
          ? (this.__NG_ELEMENT_ID__ = n)
          : n !== void 0 && (this.ɵprov = y({ token: this, providedIn: n.providedIn || 'root', factory: n.factory })));
    }
    get multi() {
      return this;
    }
    toString() {
      return `InjectionToken ${this._desc}`;
    }
  };
function ba(e) {
  return e && !!e.ɵproviders;
}
var Sa = P({ ɵcmp: P }),
  _a = P({ ɵdir: P }),
  Ta = P({ ɵpipe: P }),
  Ma = P({ ɵmod: P }),
  mr = P({ ɵfac: P }),
  Ht = P({ __NG_ELEMENT_ID__: P }),
  ud = P({ __NG_ENV_ID__: P });
function Na(e) {
  return typeof e == 'string' ? e : e == null ? '' : String(e);
}
function dd(e) {
  return typeof e == 'function'
    ? e.name || e.toString()
    : typeof e == 'object' && e != null && typeof e.type == 'function'
      ? e.type.name || e.type.toString()
      : Na(e);
}
var fd = P({ ngErrorCode: P }),
  mm = P({ ngErrorMessage: P }),
  vm = P({ ngTokenPath: P });
function Aa(e, t) {
  return pd('', -200, t);
}
function ri(e, t) {
  throw new v(-201, !1);
}
function pd(e, t, n) {
  let r = new v(t, e);
  return ((r[fd] = t), (r[mm] = e), n && (r[vm] = n), r);
}
function ym(e) {
  return e[fd];
}
var da;
function hd() {
  return da;
}
function ue(e) {
  let t = da;
  return ((da = e), t);
}
function Ra(e, t, n) {
  let r = yr(e);
  if (r && r.providedIn == 'root') return r.value === void 0 ? (r.value = r.factory()) : r.value;
  if (n & 8) return null;
  if (t !== void 0) return t;
  ri(e, 'Injector');
}
var Dm = {},
  Lt = Dm,
  Em = '__NG_DI_FLAG__',
  fa = class {
    injector;
    constructor(t) {
      this.injector = t;
    }
    retrieve(t, n) {
      let r = jt(n) || 0;
      try {
        return this.injector.get(t, r & 8 ? null : Lt, r);
      } catch (o) {
        if (un(o)) return o;
        throw o;
      }
    }
  };
function Cm(e, t = 0) {
  let n = Co();
  if (n === void 0) throw new v(-203, !1);
  if (n === null) return Ra(e, void 0, t);
  {
    let r = Im(t),
      o = n.retrieve(e, r);
    if (un(o)) {
      if (r.optional) return null;
      throw o;
    }
    return o;
  }
}
function b(e, t = 0) {
  return (hd() || Cm)(me(e), t);
}
function h(e, t) {
  return b(e, jt(t));
}
function jt(e) {
  return typeof e > 'u' || typeof e == 'number'
    ? e
    : 0 | (e.optional && 8) | (e.host && 1) | (e.self && 2) | (e.skipSelf && 4);
}
function Im(e) {
  return { optional: !!(e & 8), host: !!(e & 1), self: !!(e & 2), skipSelf: !!(e & 4) };
}
function pa(e) {
  let t = [];
  for (let n = 0; n < e.length; n++) {
    let r = me(e[n]);
    if (Array.isArray(r)) {
      if (r.length === 0) throw new v(900, !1);
      let o,
        i = 0;
      for (let s = 0; s < r.length; s++) {
        let a = r[s],
          c = wm(a);
        typeof c == 'number' ? (c === -1 ? (o = a.token) : (i |= c)) : (o = a);
      }
      t.push(b(o, i));
    } else t.push(b(r));
  }
  return t;
}
function wm(e) {
  return e[Em];
}
function yt(e, t) {
  let n = e.hasOwnProperty(mr);
  return n ? e[mr] : null;
}
function oi(e, t) {
  e.forEach((n) => (Array.isArray(n) ? oi(n, t) : t(n)));
}
function xa(e, t, n) {
  t >= e.length ? e.push(n) : e.splice(t, 0, n);
}
function Dr(e, t) {
  return t >= e.length - 1 ? e.pop() : e.splice(t, 1)[0];
}
function gd(e, t, n, r) {
  let o = e.length;
  if (o == t) e.push(n, r);
  else if (o === 1) (e.push(r, e[0]), (e[0] = n));
  else {
    for (o--, e.push(e[o - 1], e[o]); o > t; ) {
      let i = o - 2;
      ((e[o] = e[i]), o--);
    }
    ((e[t] = n), (e[t + 1] = r));
  }
}
function md(e, t, n) {
  let r = Nn(e, t);
  return (r >= 0 ? (e[r | 1] = n) : ((r = ~r), gd(e, r, t, n)), r);
}
function ii(e, t) {
  let n = Nn(e, t);
  if (n >= 0) return e[n | 1];
}
function Nn(e, t) {
  return bm(e, t, 1);
}
function bm(e, t, n) {
  let r = 0,
    o = e.length >> n;
  for (; o !== r; ) {
    let i = r + ((o - r) >> 1),
      s = e[i << n];
    if (t === s) return i << n;
    s > t ? (o = i) : (r = i + 1);
  }
  return ~(o << n);
}
var Ut = {},
  Dt = [],
  tt = new D(''),
  Oa = new D('', -1),
  ka = new D(''),
  vr = class {
    get(t, n = Lt) {
      if (n === Lt) {
        let o = pd('', -201);
        throw ((o.name = '\u0275NotFound'), o);
      }
      return n;
    }
  };
function Pa(e) {
  return e[Ma] || null;
}
function It(e) {
  return e[Sa] || null;
}
function Fa(e) {
  return e[_a] || null;
}
function vd(e) {
  return e[Ta] || null;
}
function $t(e) {
  return { ɵproviders: e };
}
function yd(e) {
  return $t([{ provide: tt, multi: !0, useValue: e }]);
}
function Dd(...e) {
  return { ɵproviders: La(!0, e), ɵfromNgModule: !0 };
}
function La(e, ...t) {
  let n = [],
    r = new Set(),
    o,
    i = (s) => {
      n.push(s);
    };
  return (
    oi(t, (s) => {
      let a = s;
      Xo(a, i, [], r) && ((o ||= []), o.push(a));
    }),
    o !== void 0 && Ed(o, i),
    n
  );
}
function Ed(e, t) {
  for (let n = 0; n < e.length; n++) {
    let { ngModule: r, providers: o } = e[n];
    ja(o, (i) => {
      t(i, r);
    });
  }
}
function Xo(e, t, n, r) {
  if (((e = me(e)), !e)) return !1;
  let o = null,
    i = la(e),
    s = !i && It(e);
  if (!i && !s) {
    let c = e.ngModule;
    if (((i = la(c)), i)) o = c;
    else return !1;
  } else {
    if (s && !s.standalone) return !1;
    o = e;
  }
  let a = r.has(o);
  if (s) {
    if (a) return !1;
    if ((r.add(o), s.dependencies)) {
      let c = typeof s.dependencies == 'function' ? s.dependencies() : s.dependencies;
      for (let u of c) Xo(u, t, n, r);
    }
  } else if (i) {
    if (i.imports != null && !a) {
      r.add(o);
      let u;
      try {
        oi(i.imports, (l) => {
          Xo(l, t, n, r) && ((u ||= []), u.push(l));
        });
      } finally {
      }
      u !== void 0 && Ed(u, t);
    }
    if (!a) {
      let u = yt(o) || (() => new o());
      (t({ provide: o, useFactory: u, deps: Dt }, o),
        t({ provide: ka, useValue: o, multi: !0 }, o),
        t({ provide: tt, useValue: () => b(o), multi: !0 }, o));
    }
    let c = i.providers;
    if (c != null && !a) {
      let u = e;
      ja(c, (l) => {
        t(l, u);
      });
    }
  } else return !1;
  return o !== e && e.providers !== void 0;
}
function ja(e, t) {
  for (let n of e) (ba(n) && (n = n.ɵproviders), Array.isArray(n) ? ja(n, t) : t(n));
}
var Sm = P({ provide: String, useValue: P });
function Cd(e) {
  return e !== null && typeof e == 'object' && Sm in e;
}
function _m(e) {
  return !!(e && e.useExisting);
}
function Tm(e) {
  return !!(e && e.useFactory);
}
function ei(e) {
  return typeof e == 'function';
}
var Er = new D(''),
  Ko = {},
  ld = {},
  ua;
function Cr() {
  return (ua === void 0 && (ua = new vr()), ua);
}
var oe = class {},
  Bt = class extends oe {
    parent;
    source;
    scopes;
    records = new Map();
    _ngOnDestroyHooks = new Set();
    _onDestroyHooks = [];
    get destroyed() {
      return this._destroyed;
    }
    _destroyed = !1;
    injectorDefTypes;
    constructor(t, n, r, o) {
      (super(),
        (this.parent = n),
        (this.source = r),
        (this.scopes = o),
        ga(t, (s) => this.processProvider(s)),
        this.records.set(Oa, Tn(void 0, this)),
        o.has('environment') && this.records.set(oe, Tn(void 0, this)));
      let i = this.records.get(Er);
      (i != null && typeof i.value == 'string' && this.scopes.add(i.value),
        (this.injectorDefTypes = new Set(this.get(ka, Dt, { self: !0 }))));
    }
    retrieve(t, n) {
      let r = jt(n) || 0;
      try {
        return this.get(t, Lt, r);
      } catch (o) {
        if (un(o)) return o;
        throw o;
      }
    }
    destroy() {
      (gr(this), (this._destroyed = !0));
      let t = I(null);
      try {
        for (let r of this._ngOnDestroyHooks) r.ngOnDestroy();
        let n = this._onDestroyHooks;
        this._onDestroyHooks = [];
        for (let r of n) r();
      } finally {
        (this.records.clear(), this._ngOnDestroyHooks.clear(), this.injectorDefTypes.clear(), I(t));
      }
    }
    onDestroy(t) {
      return (gr(this), this._onDestroyHooks.push(t), () => this.removeOnDestroy(t));
    }
    runInContext(t) {
      gr(this);
      let n = Ue(this),
        r = ue(void 0),
        o;
      try {
        return t();
      } finally {
        (Ue(n), ue(r));
      }
    }
    get(t, n = Lt, r) {
      if ((gr(this), t.hasOwnProperty(ud))) return t[ud](this);
      let o = jt(r),
        i,
        s = Ue(this),
        a = ue(void 0);
      try {
        if (!(o & 4)) {
          let u = this.records.get(t);
          if (u === void 0) {
            let l = xm(t) && yr(t);
            (l && this.injectableDefInScope(l) ? (u = Tn(ha(t), Ko)) : (u = null), this.records.set(t, u));
          }
          if (u != null) return this.hydrate(t, u, o);
        }
        let c = o & 2 ? Cr() : this.parent;
        return ((n = o & 8 && n === Lt ? null : n), c.get(t, n));
      } catch (c) {
        let u = ym(c);
        throw u === -200 || u === -201 ? new v(u, null) : c;
      } finally {
        (ue(a), Ue(s));
      }
    }
    resolveInjectorInitializers() {
      let t = I(null),
        n = Ue(this),
        r = ue(void 0),
        o;
      try {
        let i = this.get(tt, Dt, { self: !0 });
        for (let s of i) s();
      } finally {
        (Ue(n), ue(r), I(t));
      }
    }
    toString() {
      let t = [],
        n = this.records;
      for (let r of n.keys()) t.push(et(r));
      return `R3Injector[${t.join(', ')}]`;
    }
    processProvider(t) {
      t = me(t);
      let n = ei(t) ? t : me(t && t.provide),
        r = Nm(t);
      if (!ei(t) && t.multi === !0) {
        let o = this.records.get(n);
        (o || ((o = Tn(void 0, Ko, !0)), (o.factory = () => pa(o.multi)), this.records.set(n, o)),
          (n = t),
          o.multi.push(t));
      }
      this.records.set(n, r);
    }
    hydrate(t, n, r) {
      let o = I(null);
      try {
        if (n.value === ld) throw Aa(et(t));
        return (
          n.value === Ko && ((n.value = ld), (n.value = n.factory(void 0, r))),
          typeof n.value == 'object' && n.value && Rm(n.value) && this._ngOnDestroyHooks.add(n.value),
          n.value
        );
      } finally {
        I(o);
      }
    }
    injectableDefInScope(t) {
      if (!t.providedIn) return !1;
      let n = me(t.providedIn);
      return typeof n == 'string' ? n === 'any' || this.scopes.has(n) : this.injectorDefTypes.has(n);
    }
    removeOnDestroy(t) {
      let n = this._onDestroyHooks.indexOf(t);
      n !== -1 && this._onDestroyHooks.splice(n, 1);
    }
  };
function ha(e) {
  let t = yr(e),
    n = t !== null ? t.factory : yt(e);
  if (n !== null) return n;
  if (e instanceof D) throw new v(204, !1);
  if (e instanceof Function) return Mm(e);
  throw new v(204, !1);
}
function Mm(e) {
  if (e.length > 0) throw new v(204, !1);
  let n = gm(e);
  return n !== null ? () => n.factory(e) : () => new e();
}
function Nm(e) {
  if (Cd(e)) return Tn(void 0, e.useValue);
  {
    let t = Id(e);
    return Tn(t, Ko);
  }
}
function Id(e, t, n) {
  let r;
  if (ei(e)) {
    let o = me(e);
    return yt(o) || ha(o);
  } else if (Cd(e)) r = () => me(e.useValue);
  else if (Tm(e)) r = () => e.useFactory(...pa(e.deps || []));
  else if (_m(e)) r = (o, i) => b(me(e.useExisting), i !== void 0 && i & 8 ? 8 : void 0);
  else {
    let o = me(e && (e.useClass || e.provide));
    if (Am(e)) r = () => new o(...pa(e.deps));
    else return yt(o) || ha(o);
  }
  return r;
}
function gr(e) {
  if (e.destroyed) throw new v(205, !1);
}
function Tn(e, t, n = !1) {
  return { factory: e, value: t, multi: n ? [] : void 0 };
}
function Am(e) {
  return !!e.deps;
}
function Rm(e) {
  return e !== null && typeof e == 'object' && typeof e.ngOnDestroy == 'function';
}
function xm(e) {
  return typeof e == 'function' || (typeof e == 'object' && e.ngMetadataName === 'InjectionToken');
}
function ga(e, t) {
  for (let n of e) Array.isArray(n) ? ga(n, t) : n && ba(n) ? ga(n.ɵproviders, t) : t(n);
}
function le(e, t) {
  let n;
  e instanceof Bt ? (gr(e), (n = e)) : (n = new fa(e));
  let r,
    o = Ue(n),
    i = ue(void 0);
  try {
    return t();
  } finally {
    (Ue(o), ue(i));
  }
}
function wd() {
  return hd() !== void 0 || Co() != null;
}
var ke = 0,
  S = 1,
  T = 2,
  J = 3,
  Se = 4,
  _e = 5,
  An = 6,
  Rn = 7,
  X = 8,
  wt = 9,
  nt = 10,
  ee = 11,
  xn = 12,
  Ba = 13,
  On = 14,
  Ee = 15,
  zt = 16,
  Gt = 17,
  qt = 18,
  Ir = 19,
  Va = 20,
  Xe = 21,
  si = 22,
  wr = 23,
  Ce = 24,
  ai = 25,
  Wt = 26,
  te = 27,
  bd = 1,
  Ha = 6,
  bt = 7,
  br = 8,
  Sr = 9,
  Z = 10;
function rt(e) {
  return Array.isArray(e) && typeof e[bd] == 'object';
}
function Pe(e) {
  return Array.isArray(e) && e[bd] === !0;
}
function Ua(e) {
  return (e.flags & 4) !== 0;
}
function Zt(e) {
  return e.componentOffset > -1;
}
function ci(e) {
  return (e.flags & 1) === 1;
}
function Yt(e) {
  return !!e.template;
}
function kn(e) {
  return (e[T] & 512) !== 0;
}
function Qt(e) {
  return (e[T] & 256) === 256;
}
var Sd = 'svg',
  _d = 'math';
function Te(e) {
  for (; Array.isArray(e); ) e = e[ke];
  return e;
}
function $a(e, t) {
  return Te(t[e]);
}
function ot(e, t) {
  return Te(t[e.index]);
}
function ui(e, t) {
  return e.data[t];
}
function za(e, t) {
  return e[t];
}
function Ga(e, t, n, r) {
  (n >= e.data.length && ((e.data[n] = null), (e.blueprint[n] = null)), (t[n] = r));
}
function ze(e, t) {
  let n = t[e];
  return rt(n) ? n : n[ke];
}
function li(e) {
  return (e[T] & 128) === 128;
}
function Td(e) {
  return Pe(e[J]);
}
function St(e, t) {
  return t == null ? null : e[t];
}
function qa(e) {
  e[Gt] = 0;
}
function Wa(e) {
  e[T] & 1024 || ((e[T] |= 1024), li(e) && Tr(e));
}
function _r(e) {
  return !!(e[T] & 9216 || e[Ce]?.dirty);
}
function di(e) {
  (e[nt].changeDetectionScheduler?.notify(8), e[T] & 64 && (e[T] |= 1024), _r(e) && Tr(e));
}
function Tr(e) {
  e[nt].changeDetectionScheduler?.notify(0);
  let t = Et(e);
  for (; t !== null && !(t[T] & 8192 || ((t[T] |= 8192), !li(t))); ) t = Et(t);
}
function Za(e, t) {
  if (Qt(e)) throw new v(911, !1);
  (e[Xe] === null && (e[Xe] = []), e[Xe].push(t));
}
function Md(e, t) {
  if (e[Xe] === null) return;
  let n = e[Xe].indexOf(t);
  n !== -1 && e[Xe].splice(n, 1);
}
function Et(e) {
  let t = e[J];
  return Pe(t) ? t[J] : t;
}
function Nd(e) {
  return (e[Rn] ??= []);
}
function Ad(e) {
  return (e.cleanup ??= []);
}
var k = { lFrame: zd(null), bindingsEnabled: !0, skipHydrationRootTNode: null };
var ma = !1;
function Rd() {
  return k.lFrame.elementDepthCount;
}
function xd() {
  k.lFrame.elementDepthCount++;
}
function Ya() {
  k.lFrame.elementDepthCount--;
}
function Od() {
  return k.bindingsEnabled;
}
function kd() {
  return k.skipHydrationRootTNode !== null;
}
function Qa(e) {
  return k.skipHydrationRootTNode === e;
}
function Ka() {
  k.skipHydrationRootTNode = null;
}
function H() {
  return k.lFrame.lView;
}
function _t() {
  return k.lFrame.tView;
}
function Fe() {
  let e = Ja();
  for (; e !== null && e.type === 64; ) e = e.parent;
  return e;
}
function Ja() {
  return k.lFrame.currentTNode;
}
function Pd() {
  let e = k.lFrame,
    t = e.currentTNode;
  return e.isParent ? t : t.parent;
}
function Pn(e, t) {
  let n = k.lFrame;
  ((n.currentTNode = e), (n.isParent = t));
}
function Xa() {
  return k.lFrame.isParent;
}
function Fd() {
  k.lFrame.isParent = !1;
}
function ec() {
  return ma;
}
function tc(e) {
  let t = ma;
  return ((ma = e), t);
}
function nc() {
  let e = k.lFrame,
    t = e.bindingRootIndex;
  return (t === -1 && (t = e.bindingRootIndex = e.tView.bindingStartIndex), t);
}
function Ld(e) {
  return (k.lFrame.bindingIndex = e);
}
function rc() {
  return k.lFrame.bindingIndex++;
}
function jd(e) {
  let t = k.lFrame,
    n = t.bindingIndex;
  return ((t.bindingIndex = t.bindingIndex + e), n);
}
function Bd() {
  return k.lFrame.inI18n;
}
function Vd(e, t) {
  let n = k.lFrame;
  ((n.bindingIndex = n.bindingRootIndex = e), fi(t));
}
function Hd() {
  return k.lFrame.currentDirectiveIndex;
}
function fi(e) {
  k.lFrame.currentDirectiveIndex = e;
}
function Ud(e) {
  let t = k.lFrame.currentDirectiveIndex;
  return t === -1 ? null : e[t];
}
function oc(e) {
  k.lFrame.currentQueryIndex = e;
}
function Om(e) {
  let t = e[S];
  return t.type === 2 ? t.declTNode : t.type === 1 ? e[_e] : null;
}
function ic(e, t, n) {
  if (n & 4) {
    let o = t,
      i = e;
    for (; (o = o.parent), o === null && !(n & 1); ) if (((o = Om(i)), o === null || ((i = i[On]), o.type & 10))) break;
    if (o === null) return !1;
    ((t = o), (e = i));
  }
  let r = (k.lFrame = $d());
  return ((r.currentTNode = t), (r.lView = e), !0);
}
function pi(e) {
  let t = $d(),
    n = e[S];
  ((k.lFrame = t),
    (t.currentTNode = n.firstChild),
    (t.lView = e),
    (t.tView = n),
    (t.contextLView = e),
    (t.bindingIndex = n.bindingStartIndex),
    (t.inI18n = !1));
}
function $d() {
  let e = k.lFrame,
    t = e === null ? null : e.child;
  return t === null ? zd(e) : t;
}
function zd(e) {
  let t = {
    currentTNode: null,
    isParent: !0,
    lView: null,
    tView: null,
    selectedIndex: -1,
    contextLView: null,
    elementDepthCount: 0,
    currentNamespace: null,
    currentDirectiveIndex: -1,
    bindingRootIndex: -1,
    bindingIndex: -1,
    currentQueryIndex: 0,
    parent: e,
    child: null,
    inI18n: !1
  };
  return (e !== null && (e.child = t), t);
}
function Gd() {
  let e = k.lFrame;
  return ((k.lFrame = e.parent), (e.currentTNode = null), (e.lView = null), e);
}
var sc = Gd;
function hi() {
  let e = Gd();
  ((e.isParent = !0),
    (e.tView = null),
    (e.selectedIndex = -1),
    (e.contextLView = null),
    (e.elementDepthCount = 0),
    (e.currentDirectiveIndex = -1),
    (e.currentNamespace = null),
    (e.bindingRootIndex = -1),
    (e.bindingIndex = -1),
    (e.currentQueryIndex = 0));
}
function Tt() {
  return k.lFrame.selectedIndex;
}
function Mt(e) {
  k.lFrame.selectedIndex = e;
}
function qd() {
  return k.lFrame.currentNamespace;
}
var Wd = !0;
function gi() {
  return Wd;
}
function mi(e) {
  Wd = e;
}
function va(e, t = null, n = null, r) {
  let o = ac(e, t, n, r);
  return (o.resolveInjectorInitializers(), o);
}
function ac(e, t = null, n = null, r, o = new Set()) {
  let i = [n || Dt, Dd(e)];
  return ((r = r || (typeof e == 'object' ? void 0 : et(e))), new Bt(i, t || Cr(), r || null, o));
}
var Oe = class e {
    static THROW_IF_NOT_FOUND = Lt;
    static NULL = new vr();
    static create(t, n) {
      if (Array.isArray(t)) return va({ name: '' }, n, t, '');
      {
        let r = t.name ?? '';
        return va({ name: r }, t.parent, t.providers, r);
      }
    }
    static ɵprov = y({ token: e, providedIn: 'any', factory: () => b(Oa) });
    static __NG_ELEMENT_ID__ = -1;
  },
  ne = new D(''),
  Le = (() => {
    class e {
      static __NG_ELEMENT_ID__ = km;
      static __NG_ENV_ID__ = (n) => n;
    }
    return e;
  })(),
  ya = class extends Le {
    _lView;
    constructor(t) {
      (super(), (this._lView = t));
    }
    get destroyed() {
      return Qt(this._lView);
    }
    onDestroy(t) {
      let n = this._lView;
      return (Za(n, t), () => Md(n, t));
    }
  };
function km() {
  return new ya(H());
}
var $e = class {
    _console = console;
    handleError(t) {
      this._console.error('ERROR', t);
    }
  },
  Ie = new D('', {
    providedIn: 'root',
    factory: () => {
      let e = h(oe),
        t;
      return (n) => {
        e.destroyed && !t
          ? setTimeout(() => {
              throw n;
            })
          : ((t ??= e.get($e)), t.handleError(n));
      };
    }
  }),
  Zd = { provide: tt, useValue: () => void h($e), multi: !0 },
  Pm = new D('', {
    providedIn: 'root',
    factory: () => {
      let e = h(ne).defaultView;
      if (!e) return;
      let t = h(Ie),
        n = (i) => {
          (t(i.reason), i.preventDefault());
        },
        r = (i) => {
          (i.error ? t(i.error) : t(new Error(i.message, { cause: i })), i.preventDefault());
        },
        o = () => {
          (e.addEventListener('unhandledrejection', n), e.addEventListener('error', r));
        };
      (typeof Zone < 'u' ? Zone.root.run(o) : o(),
        h(Le).onDestroy(() => {
          (e.removeEventListener('error', r), e.removeEventListener('unhandledrejection', n));
        }));
    }
  });
function cc() {
  return $t([yd(() => void h(Pm))]);
}
function Ge(e, t) {
  let [n, r, o] = Zs(e, t?.equal),
    i = n,
    s = i[ce];
  return ((i.set = r), (i.update = o), (i.asReadonly = Yd.bind(i)), i);
}
function Yd() {
  let e = this[ce];
  if (e.readonlyFn === void 0) {
    let t = () => this();
    ((t[ce] = e), (e.readonlyFn = t));
  }
  return e.readonlyFn;
}
var Ct = class {},
  Mr = new D('', { providedIn: 'root', factory: () => !1 });
var uc = new D(''),
  vi = new D(''),
  it = (() => {
    class e {
      taskId = 0;
      pendingTasks = new Set();
      destroyed = !1;
      pendingTask = new re(!1);
      get hasPendingTasks() {
        return this.destroyed ? !1 : this.pendingTask.value;
      }
      get hasPendingTasksObservable() {
        return this.destroyed
          ? new A((n) => {
              (n.next(!1), n.complete());
            })
          : this.pendingTask;
      }
      add() {
        !this.hasPendingTasks && !this.destroyed && this.pendingTask.next(!0);
        let n = this.taskId++;
        return (this.pendingTasks.add(n), n);
      }
      has(n) {
        return this.pendingTasks.has(n);
      }
      remove(n) {
        (this.pendingTasks.delete(n),
          this.pendingTasks.size === 0 && this.hasPendingTasks && this.pendingTask.next(!1));
      }
      ngOnDestroy() {
        (this.pendingTasks.clear(),
          this.hasPendingTasks && this.pendingTask.next(!1),
          (this.destroyed = !0),
          this.pendingTask.unsubscribe());
      }
      static ɵprov = y({ token: e, providedIn: 'root', factory: () => new e() });
    }
    return e;
  })();
function Nr(...e) {}
var lc = (() => {
    class e {
      static ɵprov = y({ token: e, providedIn: 'root', factory: () => new Da() });
    }
    return e;
  })(),
  Da = class {
    dirtyEffectCount = 0;
    queues = new Map();
    add(t) {
      (this.enqueue(t), this.schedule(t));
    }
    schedule(t) {
      t.dirty && this.dirtyEffectCount++;
    }
    remove(t) {
      let n = t.zone,
        r = this.queues.get(n);
      r.has(t) && (r.delete(t), t.dirty && this.dirtyEffectCount--);
    }
    enqueue(t) {
      let n = t.zone;
      this.queues.has(n) || this.queues.set(n, new Set());
      let r = this.queues.get(n);
      r.has(t) || r.add(t);
    }
    flush() {
      for (; this.dirtyEffectCount > 0; ) {
        let t = !1;
        for (let [n, r] of this.queues)
          n === null ? (t ||= this.flushQueue(r)) : (t ||= n.run(() => this.flushQueue(r)));
        t || (this.dirtyEffectCount = 0);
      }
    }
    flushQueue(t) {
      let n = !1;
      for (let r of t) r.dirty && (this.dirtyEffectCount--, (n = !0), r.run());
      return n;
    }
  };
function Bi(e) {
  return { toString: e }.toString();
}
function Wm(e) {
  return typeof e == 'function';
}
var wi = class {
  previousValue;
  currentValue;
  firstChange;
  constructor(t, n, r) {
    ((this.previousValue = t), (this.currentValue = n), (this.firstChange = r));
  }
  isFirstChange() {
    return this.firstChange;
  }
};
function Af(e, t, n, r) {
  t !== null ? t.applyValueToInputSignal(t, r) : (e[n] = r);
}
var Vi = (() => {
  let e = () => Rf;
  return ((e.ngInherit = !0), e);
})();
function Rf(e) {
  return (e.type.prototype.ngOnChanges && (e.setInput = Ym), Zm);
}
function Zm() {
  let e = Of(this),
    t = e?.current;
  if (t) {
    let n = e.previous;
    if (n === Ut) e.previous = t;
    else for (let r in t) n[r] = t[r];
    ((e.current = null), this.ngOnChanges(t));
  }
}
function Ym(e, t, n, r, o) {
  let i = this.declaredInputs[r],
    s = Of(e) || Qm(e, { previous: Ut, current: null }),
    a = s.current || (s.current = {}),
    c = s.previous,
    u = c[i];
  ((a[i] = new wi(u && u.currentValue, n, c === Ut)), Af(e, t, o, n));
}
var xf = '__ngSimpleChanges__';
function Of(e) {
  return e[xf] || null;
}
function Qm(e, t) {
  return (e[xf] = t);
}
var Qd = [];
var B = function (e, t = null, n) {
  for (let r = 0; r < Qd.length; r++) {
    let o = Qd[r];
    o(e, t, n);
  }
};
function Km(e, t, n) {
  let { ngOnChanges: r, ngOnInit: o, ngDoCheck: i } = t.type.prototype;
  if (r) {
    let s = Rf(t);
    ((n.preOrderHooks ??= []).push(e, s), (n.preOrderCheckHooks ??= []).push(e, s));
  }
  (o && (n.preOrderHooks ??= []).push(0 - e, o),
    i && ((n.preOrderHooks ??= []).push(e, i), (n.preOrderCheckHooks ??= []).push(e, i)));
}
function Jm(e, t) {
  for (let n = t.directiveStart, r = t.directiveEnd; n < r; n++) {
    let i = e.data[n].type.prototype,
      {
        ngAfterContentInit: s,
        ngAfterContentChecked: a,
        ngAfterViewInit: c,
        ngAfterViewChecked: u,
        ngOnDestroy: l
      } = i;
    (s && (e.contentHooks ??= []).push(-n, s),
      a && ((e.contentHooks ??= []).push(n, a), (e.contentCheckHooks ??= []).push(n, a)),
      c && (e.viewHooks ??= []).push(-n, c),
      u && ((e.viewHooks ??= []).push(n, u), (e.viewCheckHooks ??= []).push(n, u)),
      l != null && (e.destroyHooks ??= []).push(n, l));
  }
}
function Ei(e, t, n) {
  kf(e, t, 3, n);
}
function Ci(e, t, n, r) {
  (e[T] & 3) === n && kf(e, t, n, r);
}
function dc(e, t) {
  let n = e[T];
  (n & 3) === t && ((n &= 16383), (n += 1), (e[T] = n));
}
function kf(e, t, n, r) {
  let o = r !== void 0 ? e[Gt] & 65535 : 0,
    i = r ?? -1,
    s = t.length - 1,
    a = 0;
  for (let c = o; c < s; c++)
    if (typeof t[c + 1] == 'number') {
      if (((a = t[c]), r != null && a >= r)) break;
    } else
      (t[c] < 0 && (e[Gt] += 65536),
        (a < i || i == -1) && (Xm(e, n, t, c), (e[Gt] = (e[Gt] & 4294901760) + c + 2)),
        c++);
}
function Kd(e, t) {
  B(4, e, t);
  let n = I(null);
  try {
    t.call(e);
  } finally {
    (I(n), B(5, e, t));
  }
}
function Xm(e, t, n, r) {
  let o = n[r] < 0,
    i = n[r + 1],
    s = o ? -n[r] : n[r],
    a = e[s];
  o ? e[T] >> 14 < e[Gt] >> 16 && (e[T] & 3) === t && ((e[T] += 16384), Kd(a, i)) : Kd(a, i);
}
var Ln = -1,
  xr = class {
    factory;
    name;
    injectImpl;
    resolving = !1;
    canSeeViewProviders;
    multi;
    componentProviders;
    index;
    providerFactory;
    constructor(t, n, r, o) {
      ((this.factory = t), (this.name = o), (this.canSeeViewProviders = n), (this.injectImpl = r));
    }
  };
function ev(e) {
  return (e.flags & 8) !== 0;
}
function tv(e) {
  return (e.flags & 16) !== 0;
}
function nv(e, t, n) {
  let r = 0;
  for (; r < n.length; ) {
    let o = n[r];
    if (typeof o == 'number') {
      if (o !== 0) break;
      r++;
      let i = n[r++],
        s = n[r++],
        a = n[r++];
      e.setAttribute(t, s, a, i);
    } else {
      let i = o,
        s = n[++r];
      (ov(i) ? e.setProperty(t, i, s) : e.setAttribute(t, i, s), r++);
    }
  }
  return r;
}
function rv(e) {
  return e === 3 || e === 4 || e === 6;
}
function ov(e) {
  return e.charCodeAt(0) === 64;
}
function Hi(e, t) {
  if (!(t === null || t.length === 0))
    if (e === null || e.length === 0) e = t.slice();
    else {
      let n = -1;
      for (let r = 0; r < t.length; r++) {
        let o = t[r];
        typeof o == 'number'
          ? (n = o)
          : n === 0 || (n === -1 || n === 2 ? Jd(e, n, o, null, t[++r]) : Jd(e, n, o, null, null));
      }
    }
  return e;
}
function Jd(e, t, n, r, o) {
  let i = 0,
    s = e.length;
  if (t === -1) s = -1;
  else
    for (; i < e.length; ) {
      let a = e[i++];
      if (typeof a == 'number') {
        if (a === t) {
          s = -1;
          break;
        } else if (a > t) {
          s = i - 1;
          break;
        }
      }
    }
  for (; i < e.length; ) {
    let a = e[i];
    if (typeof a == 'number') break;
    if (a === n) {
      o !== null && (e[i + 1] = o);
      return;
    }
    (i++, o !== null && i++);
  }
  (s !== -1 && (e.splice(s, 0, t), (i = s + 1)), e.splice(i++, 0, n), o !== null && e.splice(i++, 0, o));
}
function Pf(e) {
  return e !== Ln;
}
function bi(e) {
  return e & 32767;
}
function iv(e) {
  return e >> 16;
}
function Si(e, t) {
  let n = iv(e),
    r = t;
  for (; n > 0; ) ((r = r[On]), n--);
  return r;
}
var Dc = !0;
function _i(e) {
  let t = Dc;
  return ((Dc = e), t);
}
var sv = 256,
  Ff = sv - 1,
  Lf = 5,
  av = 0,
  qe = {};
function cv(e, t, n) {
  let r;
  (typeof n == 'string' ? (r = n.charCodeAt(0) || 0) : n.hasOwnProperty(Ht) && (r = n[Ht]),
    r == null && (r = n[Ht] = av++));
  let o = r & Ff,
    i = 1 << o;
  t.data[e + (o >> Lf)] |= i;
}
function jf(e, t) {
  let n = Bf(e, t);
  if (n !== -1) return n;
  let r = t[S];
  r.firstCreatePass && ((e.injectorIndex = t.length), fc(r.data, e), fc(t, null), fc(r.blueprint, null));
  let o = Uc(e, t),
    i = e.injectorIndex;
  if (Pf(o)) {
    let s = bi(o),
      a = Si(o, t),
      c = a[S].data;
    for (let u = 0; u < 8; u++) t[i + u] = a[s + u] | c[s + u];
  }
  return ((t[i + 8] = o), i);
}
function fc(e, t) {
  e.push(0, 0, 0, 0, 0, 0, 0, 0, t);
}
function Bf(e, t) {
  return e.injectorIndex === -1 ||
    (e.parent && e.parent.injectorIndex === e.injectorIndex) ||
    t[e.injectorIndex + 8] === null
    ? -1
    : e.injectorIndex;
}
function Uc(e, t) {
  if (e.parent && e.parent.injectorIndex !== -1) return e.parent.injectorIndex;
  let n = 0,
    r = null,
    o = t;
  for (; o !== null; ) {
    if (((r = zf(o)), r === null)) return Ln;
    if ((n++, (o = o[On]), r.injectorIndex !== -1)) return r.injectorIndex | (n << 16);
  }
  return Ln;
}
function uv(e, t, n) {
  cv(e, t, n);
}
function Vf(e, t, n) {
  if (n & 8 || e !== void 0) return e;
  ri(t, 'NodeInjector');
}
function Hf(e, t, n, r) {
  if ((n & 8 && r === void 0 && (r = null), (n & 3) === 0)) {
    let o = e[wt],
      i = ue(void 0);
    try {
      return o ? o.get(t, r, n & 8) : Ra(t, r, n & 8);
    } finally {
      ue(i);
    }
  }
  return Vf(r, t, n);
}
function Uf(e, t, n, r = 0, o) {
  if (e !== null) {
    if (t[T] & 2048 && !(r & 2)) {
      let s = hv(e, t, n, r, qe);
      if (s !== qe) return s;
    }
    let i = $f(e, t, n, r, qe);
    if (i !== qe) return i;
  }
  return Hf(t, n, r, o);
}
function $f(e, t, n, r, o) {
  let i = fv(n);
  if (typeof i == 'function') {
    if (!ic(t, e, r)) return r & 1 ? Vf(o, n, r) : Hf(t, n, r, o);
    try {
      let s;
      if (((s = i(r)), s == null && !(r & 8))) ri(n);
      else return s;
    } finally {
      sc();
    }
  } else if (typeof i == 'number') {
    let s = null,
      a = Bf(e, t),
      c = Ln,
      u = r & 1 ? t[Ee][_e] : null;
    for (
      (a === -1 || r & 4) &&
      ((c = a === -1 ? Uc(e, t) : t[a + 8]),
      c === Ln || !ef(r, !1) ? (a = -1) : ((s = t[S]), (a = bi(c)), (t = Si(c, t))));
      a !== -1;

    ) {
      let l = t[S];
      if (Xd(i, a, l.data)) {
        let d = lv(a, t, n, s, r, u);
        if (d !== qe) return d;
      }
      ((c = t[a + 8]),
        c !== Ln && ef(r, t[S].data[a + 8] === u) && Xd(i, a, t) ? ((s = l), (a = bi(c)), (t = Si(c, t))) : (a = -1));
    }
  }
  return o;
}
function lv(e, t, n, r, o, i) {
  let s = t[S],
    a = s.data[e + 8],
    c = r == null ? Zt(a) && Dc : r != s && (a.type & 3) !== 0,
    u = o & 1 && i === a,
    l = dv(a, s, n, c, u);
  return l !== null ? Ec(t, s, l, a, o) : qe;
}
function dv(e, t, n, r, o) {
  let i = e.providerIndexes,
    s = t.data,
    a = i & 1048575,
    c = e.directiveStart,
    u = e.directiveEnd,
    l = i >> 20,
    d = r ? a : a + l,
    p = o ? a + l : u;
  for (let f = d; f < p; f++) {
    let g = s[f];
    if ((f < c && n === g) || (f >= c && g.type === n)) return f;
  }
  if (o) {
    let f = s[c];
    if (f && Yt(f) && f.type === n) return c;
  }
  return null;
}
function Ec(e, t, n, r, o) {
  let i = e[n],
    s = t.data;
  if (i instanceof xr) {
    let a = i;
    if (a.resolving) {
      let f = dd(s[n]);
      throw Aa(f);
    }
    let c = _i(a.canSeeViewProviders);
    a.resolving = !0;
    let u = s[n].type || s[n],
      l,
      d = a.injectImpl ? ue(a.injectImpl) : null,
      p = ic(e, r, 0);
    try {
      ((i = e[n] = a.factory(void 0, o, s, e, r)), t.firstCreatePass && n >= r.directiveStart && Km(n, s[n], t));
    } finally {
      (d !== null && ue(d), _i(c), (a.resolving = !1), sc());
    }
  }
  return i;
}
function fv(e) {
  if (typeof e == 'string') return e.charCodeAt(0) || 0;
  let t = e.hasOwnProperty(Ht) ? e[Ht] : void 0;
  return typeof t == 'number' ? (t >= 0 ? t & Ff : pv) : t;
}
function Xd(e, t, n) {
  let r = 1 << e;
  return !!(n[t + (e >> Lf)] & r);
}
function ef(e, t) {
  return !(e & 2) && !(e & 1 && t);
}
var Kt = class {
  _tNode;
  _lView;
  constructor(t, n) {
    ((this._tNode = t), (this._lView = n));
  }
  get(t, n, r) {
    return Uf(this._tNode, this._lView, t, jt(r), n);
  }
};
function pv() {
  return new Kt(Fe(), H());
}
function Ui(e) {
  return Bi(() => {
    let t = e.prototype.constructor,
      n = t[mr] || Cc(t),
      r = Object.prototype,
      o = Object.getPrototypeOf(e.prototype).constructor;
    for (; o && o !== r; ) {
      let i = o[mr] || Cc(o);
      if (i && i !== n) return i;
      o = Object.getPrototypeOf(o);
    }
    return (i) => new i();
  });
}
function Cc(e) {
  return Ia(e)
    ? () => {
        let t = Cc(me(e));
        return t && t();
      }
    : yt(e);
}
function hv(e, t, n, r, o) {
  let i = e,
    s = t;
  for (; i !== null && s !== null && s[T] & 2048 && !kn(s); ) {
    let a = $f(i, s, n, r | 2, qe);
    if (a !== qe) return a;
    let c = i.parent;
    if (!c) {
      let u = s[Va];
      if (u) {
        let l = u.get(n, qe, r);
        if (l !== qe) return l;
      }
      ((c = zf(s)), (s = s[On]));
    }
    i = c;
  }
  return o;
}
function zf(e) {
  let t = e[S],
    n = t.type;
  return n === 2 ? t.declTNode : n === 1 ? e[_e] : null;
}
function gv() {
  return $c(Fe(), H());
}
function $c(e, t) {
  return new zc(ot(e, t));
}
var zc = (() => {
  class e {
    nativeElement;
    constructor(n) {
      this.nativeElement = n;
    }
    static __NG_ELEMENT_ID__ = gv;
  }
  return e;
})();
function Gf(e) {
  return (e.flags & 128) === 128;
}
var Gc = (function (e) {
    return ((e[(e.OnPush = 0)] = 'OnPush'), (e[(e.Default = 1)] = 'Default'), e);
  })(Gc || {}),
  qf = new Map(),
  mv = 0;
function vv() {
  return mv++;
}
function yv(e) {
  qf.set(e[Ir], e);
}
function Ic(e) {
  qf.delete(e[Ir]);
}
var tf = '__ngContext__';
function jn(e, t) {
  rt(t) ? ((e[tf] = t[Ir]), yv(t)) : (e[tf] = t);
}
function Wf(e) {
  return Yf(e[xn]);
}
function Zf(e) {
  return Yf(e[Se]);
}
function Yf(e) {
  for (; e !== null && !Pe(e); ) e = e[Se];
  return e;
}
var wc;
function qc(e) {
  wc = e;
}
function Qf() {
  if (wc !== void 0) return wc;
  if (typeof document < 'u') return document;
  throw new v(210, !1);
}
var $i = new D('', { providedIn: 'root', factory: () => Dv }),
  Dv = 'ng',
  zi = new D(''),
  $n = new D('', { providedIn: 'platform', factory: () => 'unknown' });
var Gi = new D('', {
  providedIn: 'root',
  factory: () => Qf().body?.querySelector('[ngCspNonce]')?.getAttribute('ngCspNonce') || null
});
var Ev = 'h',
  Cv = 'b';
var Kf = 'r';
var Jf = 'di';
var Xf = !1,
  ep = new D('', { providedIn: 'root', factory: () => Xf });
var Iv = (e, t, n, r) => {};
function wv(e, t, n, r) {
  Iv(e, t, n, r);
}
function Wc(e) {
  return (e.flags & 32) === 32;
}
var bv = () => null;
function tp(e, t, n = !1) {
  return bv(e, t, n);
}
function np(e, t) {
  let n = e.contentQueries;
  if (n !== null) {
    let r = I(null);
    try {
      for (let o = 0; o < n.length; o += 2) {
        let i = n[o],
          s = n[o + 1];
        if (s !== -1) {
          let a = e.data[s];
          (oc(i), a.contentQueries(2, t[s], s));
        }
      }
    } finally {
      I(r);
    }
  }
}
function bc(e, t, n) {
  oc(0);
  let r = I(null);
  try {
    t(e, n);
  } finally {
    I(r);
  }
}
function rp(e, t, n) {
  if (Ua(t)) {
    let r = I(null);
    try {
      let o = t.directiveStart,
        i = t.directiveEnd;
      for (let s = o; s < i; s++) {
        let a = e.data[s];
        if (a.contentQueries) {
          let c = n[s];
          a.contentQueries(1, c, s);
        }
      }
    } finally {
      I(r);
    }
  }
}
var st = (function (e) {
  return ((e[(e.Emulated = 0)] = 'Emulated'), (e[(e.None = 2)] = 'None'), (e[(e.ShadowDom = 3)] = 'ShadowDom'), e);
})(st || {});
var Sc = class {
  changingThisBreaksApplicationSecurity;
  constructor(t) {
    this.changingThisBreaksApplicationSecurity = t;
  }
  toString() {
    return `SafeValue must use [property]=binding: ${this.changingThisBreaksApplicationSecurity} (see ${Ea})`;
  }
};
function op(e) {
  return e instanceof Sc ? e.changingThisBreaksApplicationSecurity : e;
}
function ip(e) {
  return e instanceof Function ? e() : e;
}
function Sv(e, t, n) {
  let r = e.length;
  for (;;) {
    let o = e.indexOf(t, n);
    if (o === -1) return o;
    if (o === 0 || e.charCodeAt(o - 1) <= 32) {
      let i = t.length;
      if (o + i === r || e.charCodeAt(o + i) <= 32) return o;
    }
    n = o + 1;
  }
}
var sp = 'ng-template';
function _v(e, t, n, r) {
  let o = 0;
  if (r) {
    for (; o < t.length && typeof t[o] == 'string'; o += 2)
      if (t[o] === 'class' && Sv(t[o + 1].toLowerCase(), n, 0) !== -1) return !0;
  } else if (Zc(e)) return !1;
  if (((o = t.indexOf(1, o)), o > -1)) {
    let i;
    for (; ++o < t.length && typeof (i = t[o]) == 'string'; ) if (i.toLowerCase() === n) return !0;
  }
  return !1;
}
function Zc(e) {
  return e.type === 4 && e.value !== sp;
}
function Tv(e, t, n) {
  let r = e.type === 4 && !n ? sp : e.value;
  return t === r;
}
function Mv(e, t, n) {
  let r = 4,
    o = e.attrs,
    i = o !== null ? Rv(o) : 0,
    s = !1;
  for (let a = 0; a < t.length; a++) {
    let c = t[a];
    if (typeof c == 'number') {
      if (!s && !je(r) && !je(c)) return !1;
      if (s && je(c)) continue;
      ((s = !1), (r = c | (r & 1)));
      continue;
    }
    if (!s)
      if (r & 4) {
        if (((r = 2 | (r & 1)), (c !== '' && !Tv(e, c, n)) || (c === '' && t.length === 1))) {
          if (je(r)) return !1;
          s = !0;
        }
      } else if (r & 8) {
        if (o === null || !_v(e, o, c, n)) {
          if (je(r)) return !1;
          s = !0;
        }
      } else {
        let u = t[++a],
          l = Nv(c, o, Zc(e), n);
        if (l === -1) {
          if (je(r)) return !1;
          s = !0;
          continue;
        }
        if (u !== '') {
          let d;
          if ((l > i ? (d = '') : (d = o[l + 1].toLowerCase()), r & 2 && u !== d)) {
            if (je(r)) return !1;
            s = !0;
          }
        }
      }
  }
  return je(r) || s;
}
function je(e) {
  return (e & 1) === 0;
}
function Nv(e, t, n, r) {
  if (t === null) return -1;
  let o = 0;
  if (r || !n) {
    let i = !1;
    for (; o < t.length; ) {
      let s = t[o];
      if (s === e) return o;
      if (s === 3 || s === 6) i = !0;
      else if (s === 1 || s === 2) {
        let a = t[++o];
        for (; typeof a == 'string'; ) a = t[++o];
        continue;
      } else {
        if (s === 4) break;
        if (s === 0) {
          o += 4;
          continue;
        }
      }
      o += i ? 1 : 2;
    }
    return -1;
  } else return xv(t, e);
}
function Av(e, t, n = !1) {
  for (let r = 0; r < t.length; r++) if (Mv(e, t[r], n)) return !0;
  return !1;
}
function Rv(e) {
  for (let t = 0; t < e.length; t++) {
    let n = e[t];
    if (rv(n)) return t;
  }
  return e.length;
}
function xv(e, t) {
  let n = e.indexOf(4);
  if (n > -1)
    for (n++; n < e.length; ) {
      let r = e[n];
      if (typeof r == 'number') return -1;
      if (r === t) return n;
      n++;
    }
  return -1;
}
function nf(e, t) {
  return e ? ':not(' + t.trim() + ')' : t;
}
function Ov(e) {
  let t = e[0],
    n = 1,
    r = 2,
    o = '',
    i = !1;
  for (; n < e.length; ) {
    let s = e[n];
    if (typeof s == 'string')
      if (r & 2) {
        let a = e[++n];
        o += '[' + s + (a.length > 0 ? '="' + a + '"' : '') + ']';
      } else r & 8 ? (o += '.' + s) : r & 4 && (o += ' ' + s);
    else (o !== '' && !je(s) && ((t += nf(i, o)), (o = '')), (r = s), (i = i || !je(r)));
    n++;
  }
  return (o !== '' && (t += nf(i, o)), t);
}
function kv(e) {
  return e.map(Ov).join(',');
}
function Pv(e) {
  let t = [],
    n = [],
    r = 1,
    o = 2;
  for (; r < e.length; ) {
    let i = e[r];
    if (typeof i == 'string') o === 2 ? i !== '' && t.push(i, e[++r]) : o === 8 && n.push(i);
    else {
      if (!je(o)) break;
      o = i;
    }
    r++;
  }
  return (n.length && t.push(1, ...n), t);
}
var at = {};
function Fv(e, t) {
  return e.createText(t);
}
function Lv(e, t, n) {
  e.setValue(t, n);
}
function ap(e, t, n) {
  return e.createElement(t, n);
}
function Ti(e, t, n, r, o) {
  e.insertBefore(t, n, r, o);
}
function cp(e, t, n) {
  e.appendChild(t, n);
}
function rf(e, t, n, r, o) {
  r !== null ? Ti(e, t, n, r, o) : cp(e, t, n);
}
function up(e, t, n, r) {
  e.removeChild(null, t, n, r);
}
function jv(e, t, n) {
  e.setAttribute(t, 'style', n);
}
function Bv(e, t, n) {
  n === '' ? e.removeAttribute(t, 'class') : e.setAttribute(t, 'class', n);
}
function lp(e, t, n) {
  let { mergedAttrs: r, classes: o, styles: i } = n;
  (r !== null && nv(e, t, r), o !== null && Bv(e, t, o), i !== null && jv(e, t, i));
}
function Yc(e, t, n, r, o, i, s, a, c, u, l) {
  let d = te + r,
    p = d + o,
    f = Vv(d, p),
    g = typeof u == 'function' ? u() : u;
  return (f[S] = {
    type: e,
    blueprint: f,
    template: n,
    queries: null,
    viewQuery: a,
    declTNode: t,
    data: f.slice().fill(null, d),
    bindingStartIndex: d,
    expandoStartIndex: p,
    hostBindingOpCodes: null,
    firstCreatePass: !0,
    firstUpdatePass: !0,
    staticViewQueries: !1,
    staticContentQueries: !1,
    preOrderHooks: null,
    preOrderCheckHooks: null,
    contentHooks: null,
    contentCheckHooks: null,
    viewHooks: null,
    viewCheckHooks: null,
    destroyHooks: null,
    cleanup: null,
    contentQueries: null,
    components: null,
    directiveRegistry: typeof i == 'function' ? i() : i,
    pipeRegistry: typeof s == 'function' ? s() : s,
    firstChild: null,
    schemas: c,
    consts: g,
    incompleteFirstPass: !1,
    ssrId: l
  });
}
function Vv(e, t) {
  let n = [];
  for (let r = 0; r < t; r++) n.push(r < e ? null : at);
  return n;
}
function Hv(e) {
  let t = e.tView;
  return t === null || t.incompleteFirstPass
    ? (e.tView = Yc(
        1,
        null,
        e.template,
        e.decls,
        e.vars,
        e.directiveDefs,
        e.pipeDefs,
        e.viewQuery,
        e.schemas,
        e.consts,
        e.id
      ))
    : t;
}
function Qc(e, t, n, r, o, i, s, a, c, u, l) {
  let d = t.blueprint.slice();
  return (
    (d[ke] = o),
    (d[T] = r | 4 | 128 | 8 | 64 | 1024),
    (u !== null || (e && e[T] & 2048)) && (d[T] |= 2048),
    qa(d),
    (d[J] = d[On] = e),
    (d[X] = n),
    (d[nt] = s || (e && e[nt])),
    (d[ee] = a || (e && e[ee])),
    (d[wt] = c || (e && e[wt]) || null),
    (d[_e] = i),
    (d[Ir] = vv()),
    (d[An] = l),
    (d[Va] = u),
    (d[Ee] = t.type == 2 ? e[Ee] : d),
    d
  );
}
function Uv(e, t, n) {
  let r = ot(t, e),
    o = Hv(n),
    i = e[nt].rendererFactory,
    s = Kc(e, Qc(e, o, null, dp(n), r, t, null, i.createRenderer(r, n), null, null, null));
  return (e[t.index] = s);
}
function dp(e) {
  let t = 16;
  return (e.signals ? (t = 4096) : e.onPush && (t = 64), t);
}
function fp(e, t, n, r) {
  if (n === 0) return -1;
  let o = t.length;
  for (let i = 0; i < n; i++) (t.push(r), e.blueprint.push(r), e.data.push(null));
  return o;
}
function Kc(e, t) {
  return (e[xn] ? (e[Ba][Se] = t) : (e[xn] = t), (e[Ba] = t), t);
}
function Nt(e = 1) {
  pp(_t(), H(), Tt() + e, !1);
}
function pp(e, t, n, r) {
  if (!r)
    if ((t[T] & 3) === 3) {
      let i = e.preOrderCheckHooks;
      i !== null && Ei(t, i, n);
    } else {
      let i = e.preOrderHooks;
      i !== null && Ci(t, i, 0, n);
    }
  Mt(n);
}
var qi = (function (e) {
  return (
    (e[(e.None = 0)] = 'None'),
    (e[(e.SignalBased = 1)] = 'SignalBased'),
    (e[(e.HasDecoratorInputTransform = 2)] = 'HasDecoratorInputTransform'),
    e
  );
})(qi || {});
function _c(e, t, n, r) {
  let o = I(null);
  try {
    let [i, s, a] = e.inputs[n],
      c = null;
    ((s & qi.SignalBased) !== 0 && (c = t[i][ce]),
      c !== null && c.transformFn !== void 0 ? (r = c.transformFn(r)) : a !== null && (r = a.call(t, r)),
      e.setInput !== null ? e.setInput(t, c, r, n, i) : Af(t, c, i, r));
  } finally {
    I(o);
  }
}
var We = (function (e) {
    return ((e[(e.Important = 1)] = 'Important'), (e[(e.DashCase = 2)] = 'DashCase'), e);
  })(We || {}),
  $v;
function Jc(e, t) {
  return $v(e, t);
}
var Bn = new Set(),
  Xc = (function (e) {
    return (
      (e[(e.CHANGE_DETECTION = 0)] = 'CHANGE_DETECTION'),
      (e[(e.AFTER_NEXT_RENDER = 1)] = 'AFTER_NEXT_RENDER'),
      e
    );
  })(Xc || {}),
  jr = new D(''),
  of = new Set();
function Br(e) {
  of.has(e) || (of.add(e), performance?.mark?.('mark_feature_usage', { detail: { feature: e } }));
}
var hp = !1,
  Tc = class extends q {
    __isAsync;
    destroyRef = void 0;
    pendingTasks = void 0;
    constructor(t = !1) {
      (super(),
        (this.__isAsync = t),
        wd() &&
          ((this.destroyRef = h(Le, { optional: !0 }) ?? void 0),
          (this.pendingTasks = h(it, { optional: !0 }) ?? void 0)));
    }
    emit(t) {
      let n = I(null);
      try {
        super.next(t);
      } finally {
        I(n);
      }
    }
    subscribe(t, n, r) {
      let o = t,
        i = n || (() => null),
        s = r;
      if (t && typeof t == 'object') {
        let c = t;
        ((o = c.next?.bind(c)), (i = c.error?.bind(c)), (s = c.complete?.bind(c)));
      }
      this.__isAsync &&
        ((i = this.wrapInTimeout(i)), o && (o = this.wrapInTimeout(o)), s && (s = this.wrapInTimeout(s)));
      let a = super.subscribe({ next: o, error: i, complete: s });
      return (t instanceof $ && t.add(a), a);
    }
    wrapInTimeout(t) {
      return (n) => {
        let r = this.pendingTasks?.add();
        setTimeout(() => {
          try {
            t(n);
          } finally {
            r !== void 0 && this.pendingTasks?.remove(r);
          }
        });
      };
    }
  },
  de = Tc;
function gp(e) {
  let t, n;
  function r() {
    e = Nr;
    try {
      (n !== void 0 && typeof cancelAnimationFrame == 'function' && cancelAnimationFrame(n),
        t !== void 0 && clearTimeout(t));
    } catch {}
  }
  return (
    (t = setTimeout(() => {
      (e(), r());
    })),
    typeof requestAnimationFrame == 'function' &&
      (n = requestAnimationFrame(() => {
        (e(), r());
      })),
    () => r()
  );
}
function sf(e) {
  return (
    queueMicrotask(() => e()),
    () => {
      e = Nr;
    }
  );
}
var eu = 'isAngularZone',
  Mi = eu + '_ID',
  zv = 0,
  Y = class e {
    hasPendingMacrotasks = !1;
    hasPendingMicrotasks = !1;
    isStable = !0;
    onUnstable = new de(!1);
    onMicrotaskEmpty = new de(!1);
    onStable = new de(!1);
    onError = new de(!1);
    constructor(t) {
      let {
        enableLongStackTrace: n = !1,
        shouldCoalesceEventChangeDetection: r = !1,
        shouldCoalesceRunChangeDetection: o = !1,
        scheduleInRootZone: i = hp
      } = t;
      if (typeof Zone > 'u') throw new v(908, !1);
      Zone.assertZonePatched();
      let s = this;
      ((s._nesting = 0),
        (s._outer = s._inner = Zone.current),
        Zone.TaskTrackingZoneSpec && (s._inner = s._inner.fork(new Zone.TaskTrackingZoneSpec())),
        n && Zone.longStackTraceZoneSpec && (s._inner = s._inner.fork(Zone.longStackTraceZoneSpec)),
        (s.shouldCoalesceEventChangeDetection = !o && r),
        (s.shouldCoalesceRunChangeDetection = o),
        (s.callbackScheduled = !1),
        (s.scheduleInRootZone = i),
        Wv(s));
    }
    static isInAngularZone() {
      return typeof Zone < 'u' && Zone.current.get(eu) === !0;
    }
    static assertInAngularZone() {
      if (!e.isInAngularZone()) throw new v(909, !1);
    }
    static assertNotInAngularZone() {
      if (e.isInAngularZone()) throw new v(909, !1);
    }
    run(t, n, r) {
      return this._inner.run(t, n, r);
    }
    runTask(t, n, r, o) {
      let i = this._inner,
        s = i.scheduleEventTask('NgZoneEvent: ' + o, t, Gv, Nr, Nr);
      try {
        return i.runTask(s, n, r);
      } finally {
        i.cancelTask(s);
      }
    }
    runGuarded(t, n, r) {
      return this._inner.runGuarded(t, n, r);
    }
    runOutsideAngular(t) {
      return this._outer.run(t);
    }
  },
  Gv = {};
function tu(e) {
  if (e._nesting == 0 && !e.hasPendingMicrotasks && !e.isStable)
    try {
      (e._nesting++, e.onMicrotaskEmpty.emit(null));
    } finally {
      if ((e._nesting--, !e.hasPendingMicrotasks))
        try {
          e.runOutsideAngular(() => e.onStable.emit(null));
        } finally {
          e.isStable = !0;
        }
    }
}
function qv(e) {
  if (e.isCheckStableRunning || e.callbackScheduled) return;
  e.callbackScheduled = !0;
  function t() {
    gp(() => {
      ((e.callbackScheduled = !1), Mc(e), (e.isCheckStableRunning = !0), tu(e), (e.isCheckStableRunning = !1));
    });
  }
  (e.scheduleInRootZone
    ? Zone.root.run(() => {
        t();
      })
    : e._outer.run(() => {
        t();
      }),
    Mc(e));
}
function Wv(e) {
  let t = () => {
      qv(e);
    },
    n = zv++;
  e._inner = e._inner.fork({
    name: 'angular',
    properties: { [eu]: !0, [Mi]: n, [Mi + n]: !0 },
    onInvokeTask: (r, o, i, s, a, c) => {
      if (Zv(c)) return r.invokeTask(i, s, a, c);
      try {
        return (af(e), r.invokeTask(i, s, a, c));
      } finally {
        (((e.shouldCoalesceEventChangeDetection && s.type === 'eventTask') || e.shouldCoalesceRunChangeDetection) &&
          t(),
          cf(e));
      }
    },
    onInvoke: (r, o, i, s, a, c, u) => {
      try {
        return (af(e), r.invoke(i, s, a, c, u));
      } finally {
        (e.shouldCoalesceRunChangeDetection && !e.callbackScheduled && !Yv(c) && t(), cf(e));
      }
    },
    onHasTask: (r, o, i, s) => {
      (r.hasTask(i, s),
        o === i &&
          (s.change == 'microTask'
            ? ((e._hasPendingMicrotasks = s.microTask), Mc(e), tu(e))
            : s.change == 'macroTask' && (e.hasPendingMacrotasks = s.macroTask)));
    },
    onHandleError: (r, o, i, s) => (r.handleError(i, s), e.runOutsideAngular(() => e.onError.emit(s)), !1)
  });
}
function Mc(e) {
  e._hasPendingMicrotasks ||
  ((e.shouldCoalesceEventChangeDetection || e.shouldCoalesceRunChangeDetection) && e.callbackScheduled === !0)
    ? (e.hasPendingMicrotasks = !0)
    : (e.hasPendingMicrotasks = !1);
}
function af(e) {
  (e._nesting++, e.isStable && ((e.isStable = !1), e.onUnstable.emit(null)));
}
function cf(e) {
  (e._nesting--, tu(e));
}
var Or = class {
  hasPendingMicrotasks = !1;
  hasPendingMacrotasks = !1;
  isStable = !0;
  onUnstable = new de();
  onMicrotaskEmpty = new de();
  onStable = new de();
  onError = new de();
  run(t, n, r) {
    return t.apply(n, r);
  }
  runGuarded(t, n, r) {
    return t.apply(n, r);
  }
  runOutsideAngular(t) {
    return t();
  }
  runTask(t, n, r, o) {
    return t.apply(n, r);
  }
};
function Zv(e) {
  return mp(e, '__ignore_ng_zone__');
}
function Yv(e) {
  return mp(e, '__scheduler_tick__');
}
function mp(e, t) {
  return !Array.isArray(e) || e.length !== 1 ? !1 : e[0]?.data?.[t] === !0;
}
var vp = (() => {
  class e {
    impl = null;
    execute() {
      this.impl?.execute();
    }
    static ɵprov = y({ token: e, providedIn: 'root', factory: () => new e() });
  }
  return e;
})();
var Qv = new D('', { providedIn: 'root', factory: () => ({ queue: new Set(), isScheduled: !1, scheduler: null }) });
function yp(e, t) {
  let n = e.get(Qv);
  if (Array.isArray(t)) for (let r of t) n.queue.add(r);
  else n.queue.add(t);
  n.scheduler && n.scheduler(e);
}
function Kv(e, t) {
  for (let [n, r] of t) yp(e, r.animateFns);
}
function uf(e, t, n, r) {
  let o = e?.[Wt]?.enter;
  t !== null && o && o.has(n.index) && Kv(r, o);
}
function Fn(e, t, n, r, o, i, s, a) {
  if (o != null) {
    let c,
      u = !1;
    Pe(o) ? (c = o) : rt(o) && ((u = !0), (o = o[ke]));
    let l = Te(o);
    (e === 0 && r !== null
      ? (uf(a, r, i, n), s == null ? cp(t, r, l) : Ti(t, r, l, s || null, !0))
      : e === 1 && r !== null
        ? (uf(a, r, i, n), Ti(t, r, l, s || null, !0))
        : e === 2
          ? lf(a, i, n, (d) => {
              up(t, l, u, d);
            })
          : e === 3 &&
            lf(a, i, n, () => {
              t.destroyNode(l);
            }),
      c != null && ly(t, e, n, c, i, r, s));
  }
}
function Jv(e, t) {
  (Dp(e, t), (t[ke] = null), (t[_e] = null));
}
function Xv(e, t, n, r, o, i) {
  ((r[ke] = o), (r[_e] = t), Zi(e, r, n, 1, o, i));
}
function Dp(e, t) {
  (t[nt].changeDetectionScheduler?.notify(9), Zi(e, t, t[ee], 2, null, null));
}
function ey(e) {
  let t = e[xn];
  if (!t) return pc(e[S], e);
  for (; t; ) {
    let n = null;
    if (rt(t)) n = t[xn];
    else {
      let r = t[Z];
      r && (n = r);
    }
    if (!n) {
      for (; t && !t[Se] && t !== e; ) (rt(t) && pc(t[S], t), (t = t[J]));
      (t === null && (t = e), rt(t) && pc(t[S], t), (n = t && t[Se]));
    }
    t = n;
  }
}
function nu(e, t) {
  let n = e[Sr],
    r = n.indexOf(t);
  n.splice(r, 1);
}
function Wi(e, t) {
  if (Qt(t)) return;
  let n = t[ee];
  (n.destroyNode && Zi(e, t, n, 3, null, null), ey(t));
}
function pc(e, t) {
  if (Qt(t)) return;
  let n = I(null);
  try {
    ((t[T] &= -129), (t[T] |= 256), t[Ce] && lr(t[Ce]), ry(e, t), ny(e, t), t[S].type === 1 && t[ee].destroy());
    let r = t[zt];
    if (r !== null && Pe(t[J])) {
      r !== t[J] && nu(r, t);
      let o = t[qt];
      o !== null && o.detachView(e);
    }
    Ic(t);
  } finally {
    I(n);
  }
}
function lf(e, t, n, r) {
  let o = e?.[Wt];
  if (o == null || o.leave == null || !o.leave.has(t.index)) return r(!1);
  if (o.skipLeaveAnimations) return ((o.skipLeaveAnimations = !1), r(!1));
  (e && Bn.add(e),
    yp(n, () => {
      if (o.leave && o.leave.has(t.index)) {
        let s = o.leave.get(t.index),
          a = [];
        if (s)
          for (let c = 0; c < s.animateFns.length; c++) {
            let u = s.animateFns[c],
              { promise: l } = u();
            a.push(l);
          }
        ((o.running = Promise.allSettled(a)), ty(e, r));
      } else (e && Bn.delete(e), r(!1));
    }));
}
function ty(e, t) {
  let n = e[Wt]?.running;
  if (n) {
    n.then(() => {
      ((e[Wt].running = void 0), Bn.delete(e), t(!0));
    });
    return;
  }
  t(!1);
}
function ny(e, t) {
  let n = e.cleanup,
    r = t[Rn];
  if (n !== null)
    for (let s = 0; s < n.length - 1; s += 2)
      if (typeof n[s] == 'string') {
        let a = n[s + 3];
        (a >= 0 ? r[a]() : r[-a].unsubscribe(), (s += 2));
      } else {
        let a = r[n[s + 1]];
        n[s].call(a);
      }
  r !== null && (t[Rn] = null);
  let o = t[Xe];
  if (o !== null) {
    t[Xe] = null;
    for (let s = 0; s < o.length; s++) {
      let a = o[s];
      a();
    }
  }
  let i = t[wr];
  if (i !== null) {
    t[wr] = null;
    for (let s of i) s.destroy();
  }
}
function ry(e, t) {
  let n;
  if (e != null && (n = e.destroyHooks) != null)
    for (let r = 0; r < n.length; r += 2) {
      let o = t[n[r]];
      if (!(o instanceof xr)) {
        let i = n[r + 1];
        if (Array.isArray(i))
          for (let s = 0; s < i.length; s += 2) {
            let a = o[i[s]],
              c = i[s + 1];
            B(4, a, c);
            try {
              c.call(a);
            } finally {
              B(5, a, c);
            }
          }
        else {
          B(4, o, i);
          try {
            i.call(o);
          } finally {
            B(5, o, i);
          }
        }
      }
    }
}
function oy(e, t, n) {
  return iy(e, t.parent, n);
}
function iy(e, t, n) {
  let r = t;
  for (; r !== null && r.type & 168; ) ((t = r), (r = t.parent));
  if (r === null) return n[ke];
  if (Zt(r)) {
    let { encapsulation: o } = e.data[r.directiveStart + r.componentOffset];
    if (o === st.None || o === st.Emulated) return null;
  }
  return ot(r, n);
}
function sy(e, t, n) {
  return cy(e, t, n);
}
function ay(e, t, n) {
  return e.type & 40 ? ot(e, n) : null;
}
var cy = ay,
  df;
function ru(e, t, n, r) {
  let o = oy(e, r, t),
    i = t[ee],
    s = r.parent || t[_e],
    a = sy(s, r, t);
  if (o != null)
    if (Array.isArray(n)) for (let c = 0; c < n.length; c++) rf(i, o, n[c], a, !1);
    else rf(i, o, n, a, !1);
  df !== void 0 && df(i, r, t, n, o);
}
function Ar(e, t) {
  if (t !== null) {
    let n = t.type;
    if (n & 3) return ot(t, e);
    if (n & 4) return Nc(-1, e[t.index]);
    if (n & 8) {
      let r = t.child;
      if (r !== null) return Ar(e, r);
      {
        let o = e[t.index];
        return Pe(o) ? Nc(-1, o) : Te(o);
      }
    } else {
      if (n & 128) return Ar(e, t.next);
      if (n & 32) return Jc(t, e)() || Te(e[t.index]);
      {
        let r = Ep(e, t);
        if (r !== null) {
          if (Array.isArray(r)) return r[0];
          let o = Et(e[Ee]);
          return Ar(o, r);
        } else return Ar(e, t.next);
      }
    }
  }
  return null;
}
function Ep(e, t) {
  if (t !== null) {
    let r = e[Ee][_e],
      o = t.projection;
    return r.projection[o];
  }
  return null;
}
function Nc(e, t) {
  let n = Z + e + 1;
  if (n < t.length) {
    let r = t[n],
      o = r[S].firstChild;
    if (o !== null) return Ar(r, o);
  }
  return t[bt];
}
function ou(e, t, n, r, o, i, s) {
  for (; n != null; ) {
    let a = r[wt];
    if (n.type === 128) {
      n = n.next;
      continue;
    }
    let c = r[n.index],
      u = n.type;
    if ((s && t === 0 && (c && jn(Te(c), r), (n.flags |= 2)), !Wc(n)))
      if (u & 8) (ou(e, t, n.child, r, o, i, !1), Fn(t, e, a, o, c, n, i, r));
      else if (u & 32) {
        let l = Jc(n, r),
          d;
        for (; (d = l()); ) Fn(t, e, a, o, d, n, i, r);
        Fn(t, e, a, o, c, n, i, r);
      } else u & 16 ? uy(e, t, r, n, o, i) : Fn(t, e, a, o, c, n, i, r);
    n = s ? n.projectionNext : n.next;
  }
}
function Zi(e, t, n, r, o, i) {
  ou(n, r, e.firstChild, t, o, i, !1);
}
function uy(e, t, n, r, o, i) {
  let s = n[Ee],
    c = s[_e].projection[r.projection];
  if (Array.isArray(c))
    for (let u = 0; u < c.length; u++) {
      let l = c[u];
      Fn(t, e, n[wt], o, l, r, i, n);
    }
  else {
    let u = c,
      l = s[J];
    (Gf(r) && (u.flags |= 128), ou(e, t, u, l, o, i, !0));
  }
}
function ly(e, t, n, r, o, i, s) {
  let a = r[bt],
    c = Te(r);
  a !== c && Fn(t, e, n, i, a, o, s);
  for (let u = Z; u < r.length; u++) {
    let l = r[u];
    Zi(l[S], l, e, t, i, a);
  }
}
function dy(e, t, n, r, o) {
  if (t) o ? e.addClass(n, r) : e.removeClass(n, r);
  else {
    let i = r.indexOf('-') === -1 ? void 0 : We.DashCase;
    o == null
      ? e.removeStyle(n, r, i)
      : (typeof o == 'string' && o.endsWith('!important') && ((o = o.slice(0, -10)), (i |= We.Important)),
        e.setStyle(n, r, o, i));
  }
}
function Cp(e, t, n, r, o) {
  let i = Tt(),
    s = r & 2;
  try {
    (Mt(-1), s && t.length > te && pp(e, t, te, !1), B(s ? 2 : 0, o, n), n(r, o));
  } finally {
    (Mt(i), B(s ? 3 : 1, o, n));
  }
}
function Ip(e, t, n) {
  (gy(e, t, n), (n.flags & 64) === 64 && my(e, t, n));
}
function iu(e, t, n = ot) {
  let r = t.localNames;
  if (r !== null) {
    let o = t.index + 1;
    for (let i = 0; i < r.length; i += 2) {
      let s = r[i + 1],
        a = s === -1 ? n(t, e) : e[s];
      e[o++] = a;
    }
  }
}
function fy(e, t, n, r) {
  let i = r.get(ep, Xf) || n === st.ShadowDom,
    s = e.selectRootElement(t, i);
  return (py(s), s);
}
function py(e) {
  hy(e);
}
var hy = () => null;
function gy(e, t, n) {
  let r = n.directiveStart,
    o = n.directiveEnd;
  (Zt(n) && Uv(t, n, e.data[r + n.componentOffset]), e.firstCreatePass || jf(n, t));
  let i = n.initialInputs;
  for (let s = r; s < o; s++) {
    let a = e.data[s],
      c = Ec(t, e, s, n);
    if ((jn(c, t), i !== null && Dy(t, s - r, c, a, n, i), Yt(a))) {
      let u = ze(n.index, t);
      u[X] = Ec(t, e, s, n);
    }
  }
}
function my(e, t, n) {
  let r = n.directiveStart,
    o = n.directiveEnd,
    i = n.index,
    s = Hd();
  try {
    Mt(i);
    for (let a = r; a < o; a++) {
      let c = e.data[a],
        u = t[a];
      (fi(a), (c.hostBindings !== null || c.hostVars !== 0 || c.hostAttrs !== null) && vy(c, u));
    }
  } finally {
    (Mt(-1), fi(s));
  }
}
function vy(e, t) {
  e.hostBindings !== null && e.hostBindings(1, t);
}
function yy(e, t) {
  let n = e.directiveRegistry,
    r = null;
  if (n)
    for (let o = 0; o < n.length; o++) {
      let i = n[o];
      Av(t, i.selectors, !1) && ((r ??= []), Yt(i) ? r.unshift(i) : r.push(i));
    }
  return r;
}
function Dy(e, t, n, r, o, i) {
  let s = i[t];
  if (s !== null)
    for (let a = 0; a < s.length; a += 2) {
      let c = s[a],
        u = s[a + 1];
      _c(r, n, c, u);
    }
}
function wp(e, t, n, r, o) {
  let i = te + n,
    s = t[S],
    a = o(s, t, e, r, n);
  ((t[i] = a), Pn(e, !0));
  let c = e.type === 2;
  return (
    c ? (lp(t[ee], a, e), (Rd() === 0 || ci(e)) && jn(a, t), xd()) : jn(a, t),
    gi() && (!c || !Wc(e)) && ru(s, t, a, e),
    e
  );
}
function bp(e) {
  let t = e;
  return (Xa() ? Fd() : ((t = t.parent), Pn(t, !1)), t);
}
function Ey(e, t) {
  let n = e[wt];
  if (!n) return;
  let r;
  try {
    r = n.get(Ie, null);
  } catch {
    r = null;
  }
  r?.(t);
}
function Sp(e, t, n, r, o) {
  let i = e.inputs?.[r],
    s = e.hostDirectiveInputs?.[r],
    a = !1;
  if (s)
    for (let c = 0; c < s.length; c += 2) {
      let u = s[c],
        l = s[c + 1],
        d = t.data[u];
      (_c(d, n[u], l, o), (a = !0));
    }
  if (i)
    for (let c of i) {
      let u = n[c],
        l = t.data[c];
      (_c(l, u, r, o), (a = !0));
    }
  return a;
}
function Cy(e, t) {
  let n = ze(t, e),
    r = n[S];
  Iy(r, n);
  let o = n[ke];
  (o !== null && n[An] === null && (n[An] = tp(o, n[wt])), B(18), su(r, n, n[X]), B(19, n[X]));
}
function Iy(e, t) {
  for (let n = t.length; n < e.blueprint.length; n++) t.push(e.blueprint[n]);
}
function su(e, t, n) {
  pi(t);
  try {
    let r = e.viewQuery;
    r !== null && bc(1, r, n);
    let o = e.template;
    (o !== null && Cp(e, t, o, 1, n),
      e.firstCreatePass && (e.firstCreatePass = !1),
      t[qt]?.finishViewCreation(e),
      e.staticContentQueries && np(e, t),
      e.staticViewQueries && bc(2, e.viewQuery, n));
    let i = e.components;
    i !== null && wy(t, i);
  } catch (r) {
    throw (e.firstCreatePass && ((e.incompleteFirstPass = !0), (e.firstCreatePass = !1)), r);
  } finally {
    ((t[T] &= -5), hi());
  }
}
function wy(e, t) {
  for (let n = 0; n < t.length; n++) Cy(e, t[n]);
}
function _p(e, t, n, r) {
  let o = I(null);
  try {
    let i = t.tView,
      a = e[T] & 4096 ? 4096 : 16,
      c = Qc(
        e,
        i,
        n,
        a,
        null,
        t,
        null,
        null,
        r?.injector ?? null,
        r?.embeddedViewInjector ?? null,
        r?.dehydratedView ?? null
      ),
      u = e[t.index];
    c[zt] = u;
    let l = e[qt];
    return (l !== null && (c[qt] = l.createEmbeddedView(i)), su(i, c, n), c);
  } finally {
    I(o);
  }
}
function Ni(e, t) {
  return !t || t.firstChild === null || Gf(e);
}
function kr(e, t, n, r, o = !1) {
  for (; n !== null; ) {
    if (n.type === 128) {
      n = o ? n.projectionNext : n.next;
      continue;
    }
    let i = t[n.index];
    (i !== null && r.push(Te(i)), Pe(i) && Tp(i, r));
    let s = n.type;
    if (s & 8) kr(e, t, n.child, r);
    else if (s & 32) {
      let a = Jc(n, t),
        c;
      for (; (c = a()); ) r.push(c);
    } else if (s & 16) {
      let a = Ep(t, n);
      if (Array.isArray(a)) r.push(...a);
      else {
        let c = Et(t[Ee]);
        kr(c[S], c, a, r, !0);
      }
    }
    n = o ? n.projectionNext : n.next;
  }
  return r;
}
function Tp(e, t) {
  for (let n = Z; n < e.length; n++) {
    let r = e[n],
      o = r[S].firstChild;
    o !== null && kr(r[S], r, o, t);
  }
  e[bt] !== e[ke] && t.push(e[bt]);
}
function Mp(e) {
  if (e[ai] !== null) {
    for (let t of e[ai]) t.impl.addSequence(t);
    e[ai].length = 0;
  }
}
var Np = [];
function by(e) {
  return e[Ce] ?? Sy(e);
}
function Sy(e) {
  let t = Np.pop() ?? Object.create(Ty);
  return ((t.lView = e), t);
}
function _y(e) {
  e.lView[Ce] !== e && ((e.lView = null), Np.push(e));
}
var Ty = j(m({}, ln), {
  consumerIsAlwaysLive: !0,
  kind: 'template',
  consumerMarkedDirty: (e) => {
    Tr(e.lView);
  },
  consumerOnSignalRead() {
    this.lView[Ce] = this;
  }
});
function My(e) {
  let t = e[Ce] ?? Object.create(Ny);
  return ((t.lView = e), t);
}
var Ny = j(m({}, ln), {
  consumerIsAlwaysLive: !0,
  kind: 'template',
  consumerMarkedDirty: (e) => {
    let t = Et(e.lView);
    for (; t && !Ap(t[S]); ) t = Et(t);
    t && Wa(t);
  },
  consumerOnSignalRead() {
    this.lView[Ce] = this;
  }
});
function Ap(e) {
  return e.type !== 2;
}
function Rp(e) {
  if (e[wr] === null) return;
  let t = !0;
  for (; t; ) {
    let n = !1;
    for (let r of e[wr])
      r.dirty && ((n = !0), r.zone === null || Zone.current === r.zone ? r.run() : r.zone.run(() => r.run()));
    t = n && !!(e[T] & 8192);
  }
}
var Ay = 100;
function xp(e, t = 0) {
  let r = e[nt].rendererFactory,
    o = !1;
  o || r.begin?.();
  try {
    Ry(e, t);
  } finally {
    o || r.end?.();
  }
}
function Ry(e, t) {
  let n = ec();
  try {
    (tc(!0), Ac(e, t));
    let r = 0;
    for (; _r(e); ) {
      if (r === Ay) throw new v(103, !1);
      (r++, Ac(e, 1));
    }
  } finally {
    tc(n);
  }
}
function xy(e, t, n, r) {
  if (Qt(t)) return;
  let o = t[T],
    i = !1,
    s = !1;
  pi(t);
  let a = !0,
    c = null,
    u = null;
  i ||
    (Ap(e)
      ? ((u = by(t)), (c = fn(u)))
      : _o() === null
        ? ((a = !1), (u = My(t)), (c = fn(u)))
        : t[Ce] && (lr(t[Ce]), (t[Ce] = null)));
  try {
    (qa(t), Ld(e.bindingStartIndex), n !== null && Cp(e, t, n, 2, r));
    let l = (o & 3) === 3;
    if (!i)
      if (l) {
        let f = e.preOrderCheckHooks;
        f !== null && Ei(t, f, null);
      } else {
        let f = e.preOrderHooks;
        (f !== null && Ci(t, f, 0, null), dc(t, 0));
      }
    if ((s || Oy(t), Rp(t), Op(t, 0), e.contentQueries !== null && np(e, t), !i))
      if (l) {
        let f = e.contentCheckHooks;
        f !== null && Ei(t, f);
      } else {
        let f = e.contentHooks;
        (f !== null && Ci(t, f, 1), dc(t, 1));
      }
    Py(e, t);
    let d = e.components;
    d !== null && Pp(t, d, 0);
    let p = e.viewQuery;
    if ((p !== null && bc(2, p, r), !i))
      if (l) {
        let f = e.viewCheckHooks;
        f !== null && Ei(t, f);
      } else {
        let f = e.viewHooks;
        (f !== null && Ci(t, f, 2), dc(t, 2));
      }
    if ((e.firstUpdatePass === !0 && (e.firstUpdatePass = !1), t[si])) {
      for (let f of t[si]) f();
      t[si] = null;
    }
    i || (Mp(t), (t[T] &= -73));
  } catch (l) {
    throw (i || Tr(t), l);
  } finally {
    (u !== null && (cr(u, c), a && _y(u)), hi());
  }
}
function Op(e, t) {
  for (let n = Wf(e); n !== null; n = Zf(n))
    for (let r = Z; r < n.length; r++) {
      let o = n[r];
      kp(o, t);
    }
}
function Oy(e) {
  for (let t = Wf(e); t !== null; t = Zf(t)) {
    if (!(t[T] & 2)) continue;
    let n = t[Sr];
    for (let r = 0; r < n.length; r++) {
      let o = n[r];
      Wa(o);
    }
  }
}
function ky(e, t, n) {
  B(18);
  let r = ze(t, e);
  (kp(r, n), B(19, r[X]));
}
function kp(e, t) {
  li(e) && Ac(e, t);
}
function Ac(e, t) {
  let r = e[S],
    o = e[T],
    i = e[Ce],
    s = !!(t === 0 && o & 16);
  if (
    ((s ||= !!(o & 64 && t === 0)),
    (s ||= !!(o & 1024)),
    (s ||= !!(i?.dirty && ur(i))),
    (s ||= !1),
    i && (i.dirty = !1),
    (e[T] &= -9217),
    s)
  )
    xy(r, e, r.template, e[X]);
  else if (o & 8192) {
    let a = I(null);
    try {
      (Rp(e), Op(e, 1));
      let c = r.components;
      (c !== null && Pp(e, c, 1), Mp(e));
    } finally {
      I(a);
    }
  }
}
function Pp(e, t, n) {
  for (let r = 0; r < t.length; r++) ky(e, t[r], n);
}
function Py(e, t) {
  let n = e.hostBindingOpCodes;
  if (n !== null)
    try {
      for (let r = 0; r < n.length; r++) {
        let o = n[r];
        if (o < 0) Mt(~o);
        else {
          let i = o,
            s = n[++r],
            a = n[++r];
          Vd(s, i);
          let c = t[i];
          (B(24, c), a(2, c), B(25, c));
        }
      }
    } finally {
      Mt(-1);
    }
}
function au(e, t) {
  let n = ec() ? 64 : 1088;
  for (e[nt].changeDetectionScheduler?.notify(t); e; ) {
    e[T] |= n;
    let r = Et(e);
    if (kn(e) && !r) return e;
    e = r;
  }
  return null;
}
function Fp(e, t, n, r) {
  return [e, !0, 0, t, null, r, null, n, null, null];
}
function Fy(e, t) {
  let n = Z + t;
  if (n < e.length) return e[n];
}
function cu(e, t, n, r = !0) {
  let o = t[S];
  if ((jy(o, t, e, n), r)) {
    let s = Nc(n, e),
      a = t[ee],
      c = a.parentNode(e[bt]);
    c !== null && Xv(o, e[_e], a, t, c, s);
  }
  let i = t[An];
  i !== null && i.firstChild !== null && (i.firstChild = null);
}
function Ly(e, t) {
  let n = Pr(e, t);
  return (n !== void 0 && Wi(n[S], n), n);
}
function Pr(e, t) {
  if (e.length <= Z) return;
  let n = Z + t,
    r = e[n];
  if (r) {
    let o = r[zt];
    (o !== null && o !== e && nu(o, r), t > 0 && (e[n - 1][Se] = r[Se]));
    let i = Dr(e, Z + t);
    Jv(r[S], r);
    let s = i[qt];
    (s !== null && s.detachView(i[S]), (r[J] = null), (r[Se] = null), (r[T] &= -129));
  }
  return r;
}
function jy(e, t, n, r) {
  let o = Z + r,
    i = n.length;
  (r > 0 && (n[o - 1][Se] = t),
    r < i - Z ? ((t[Se] = n[o]), xa(n, Z + r, t)) : (n.push(t), (t[Se] = null)),
    (t[J] = n));
  let s = t[zt];
  s !== null && n !== s && Lp(s, t);
  let a = t[qt];
  (a !== null && a.insertView(e), di(t), (t[T] |= 128));
}
function Lp(e, t) {
  let n = e[Sr],
    r = t[J];
  if (rt(r)) e[T] |= 2;
  else {
    let o = r[J][Ee];
    t[Ee] !== o && (e[T] |= 2);
  }
  n === null ? (e[Sr] = [t]) : n.push(t);
}
var Jt = class {
  _lView;
  _cdRefInjectingView;
  _appRef = null;
  _attachedToViewContainer = !1;
  exhaustive;
  get rootNodes() {
    let t = this._lView,
      n = t[S];
    return kr(n, t, n.firstChild, []);
  }
  constructor(t, n) {
    ((this._lView = t), (this._cdRefInjectingView = n));
  }
  get context() {
    return this._lView[X];
  }
  set context(t) {
    this._lView[X] = t;
  }
  get destroyed() {
    return Qt(this._lView);
  }
  destroy() {
    if (this._appRef) this._appRef.detachView(this);
    else if (this._attachedToViewContainer) {
      let t = this._lView[J];
      if (Pe(t)) {
        let n = t[br],
          r = n ? n.indexOf(this) : -1;
        r > -1 && (Pr(t, r), Dr(n, r));
      }
      this._attachedToViewContainer = !1;
    }
    Wi(this._lView[S], this._lView);
  }
  onDestroy(t) {
    Za(this._lView, t);
  }
  markForCheck() {
    au(this._cdRefInjectingView || this._lView, 4);
  }
  detach() {
    this._lView[T] &= -129;
  }
  reattach() {
    (di(this._lView), (this._lView[T] |= 128));
  }
  detectChanges() {
    ((this._lView[T] |= 1024), xp(this._lView));
  }
  checkNoChanges() {}
  attachToViewContainerRef() {
    if (this._appRef) throw new v(902, !1);
    this._attachedToViewContainer = !0;
  }
  detachFromAppRef() {
    this._appRef = null;
    let t = kn(this._lView),
      n = this._lView[zt];
    (n !== null && !t && nu(n, this._lView), Dp(this._lView[S], this._lView));
  }
  attachToAppRef(t) {
    if (this._attachedToViewContainer) throw new v(902, !1);
    this._appRef = t;
    let n = kn(this._lView),
      r = this._lView[zt];
    (r !== null && !n && Lp(r, this._lView), di(this._lView));
  }
};
function Yi(e, t, n, r, o) {
  let i = e.data[t];
  if (i === null) ((i = By(e, t, n, r, o)), Bd() && (i.flags |= 32));
  else if (i.type & 64) {
    ((i.type = n), (i.value = r), (i.attrs = o));
    let s = Pd();
    i.injectorIndex = s === null ? -1 : s.injectorIndex;
  }
  return (Pn(i, !0), i);
}
function By(e, t, n, r, o) {
  let i = Ja(),
    s = Xa(),
    a = s ? i : i && i.parent,
    c = (e.data[t] = Hy(e, a, n, t, r, o));
  return (Vy(e, c, i, s), c);
}
function Vy(e, t, n, r) {
  (e.firstChild === null && (e.firstChild = t),
    n !== null &&
      (r ? n.child == null && t.parent !== null && (n.child = t) : n.next === null && ((n.next = t), (t.prev = n))));
}
function Hy(e, t, n, r, o, i) {
  let s = t ? t.injectorIndex : -1,
    a = 0;
  return (
    kd() && (a |= 128),
    {
      type: n,
      index: r,
      insertBeforeIndex: null,
      injectorIndex: s,
      directiveStart: -1,
      directiveEnd: -1,
      directiveStylingLast: -1,
      componentOffset: -1,
      propertyBindings: null,
      flags: a,
      providerIndexes: 0,
      value: o,
      attrs: i,
      mergedAttrs: null,
      localNames: null,
      initialInputs: null,
      inputs: null,
      hostDirectiveInputs: null,
      outputs: null,
      hostDirectiveOutputs: null,
      directiveToIndex: null,
      tView: null,
      next: null,
      prev: null,
      projectionNext: null,
      child: null,
      parent: t,
      projection: null,
      styles: null,
      stylesWithoutHost: null,
      residualStyles: void 0,
      classes: null,
      classesWithoutHost: null,
      residualClasses: void 0,
      classBindings: 0,
      styleBindings: 0
    }
  );
}
var k0 = new RegExp(`^(\\d+)*(${Cv}|${Ev})*(.*)`);
function Uy(e) {
  let t = e[Ha] ?? [],
    r = e[J][ee],
    o = [];
  for (let i of t) i.data[Jf] !== void 0 ? o.push(i) : $y(i, r);
  e[Ha] = o;
}
function $y(e, t) {
  let n = 0,
    r = e.firstChild;
  if (r) {
    let o = e.data[Kf];
    for (; n < o; ) {
      let i = r.nextSibling;
      (up(t, r, !1), (r = i), n++);
    }
  }
}
var zy = () => null,
  Gy = () => null;
function Rc(e, t) {
  return zy(e, t);
}
function qy(e, t, n) {
  return Gy(e, t, n);
}
var jp = class {},
  Qi = class {},
  xc = class {
    resolveComponentFactory(t) {
      throw new v(917, !1);
    }
  },
  Vr = class {
    static NULL = new xc();
  },
  Xt = class {};
var Bp = (() => {
  class e {
    static ɵprov = y({ token: e, providedIn: 'root', factory: () => null });
  }
  return e;
})();
var Ii = {},
  Oc = class {
    injector;
    parentInjector;
    constructor(t, n) {
      ((this.injector = t), (this.parentInjector = n));
    }
    get(t, n, r) {
      let o = this.injector.get(t, Ii, r);
      return o !== Ii || n === Ii ? o : this.parentInjector.get(t, n, r);
    }
  };
function Ai(e, t, n) {
  let r = n ? e.styles : null,
    o = n ? e.classes : null,
    i = 0;
  if (t !== null)
    for (let s = 0; s < t.length; s++) {
      let a = t[s];
      if (typeof a == 'number') i = a;
      else if (i == 1) o = Ca(o, a);
      else if (i == 2) {
        let c = a,
          u = t[++s];
        r = Ca(r, c + ': ' + u + ';');
      }
    }
  (n ? (e.styles = r) : (e.stylesWithoutHost = r), n ? (e.classes = o) : (e.classesWithoutHost = o));
}
function nn(e, t = 0) {
  let n = H();
  if (n === null) return b(e, t);
  let r = Fe();
  return Uf(r, n, me(e), t);
}
function Wy(e, t, n, r, o) {
  let i = r === null ? null : { '': -1 },
    s = o(e, n);
  if (s !== null) {
    let a = s,
      c = null,
      u = null;
    for (let l of s)
      if (l.resolveHostDirectives !== null) {
        [a, c, u] = l.resolveHostDirectives(s);
        break;
      }
    Qy(e, t, n, a, i, c, u);
  }
  i !== null && r !== null && Zy(n, r, i);
}
function Zy(e, t, n) {
  let r = (e.localNames = []);
  for (let o = 0; o < t.length; o += 2) {
    let i = n[t[o + 1]];
    if (i == null) throw new v(-301, !1);
    r.push(t[o], i);
  }
}
function Yy(e, t, n) {
  ((t.componentOffset = n), (e.components ??= []).push(t.index));
}
function Qy(e, t, n, r, o, i, s) {
  let a = r.length,
    c = !1;
  for (let p = 0; p < a; p++) {
    let f = r[p];
    (!c && Yt(f) && ((c = !0), Yy(e, n, p)), uv(jf(n, t), e, f.type));
  }
  nD(n, e.data.length, a);
  for (let p = 0; p < a; p++) {
    let f = r[p];
    f.providersResolver && f.providersResolver(f);
  }
  let u = !1,
    l = !1,
    d = fp(e, t, a, null);
  a > 0 && (n.directiveToIndex = new Map());
  for (let p = 0; p < a; p++) {
    let f = r[p];
    if (((n.mergedAttrs = Hi(n.mergedAttrs, f.hostAttrs)), Jy(e, n, t, d, f), tD(d, f, o), s !== null && s.has(f))) {
      let [E, M] = s.get(f);
      n.directiveToIndex.set(f.type, [d, E + n.directiveStart, M + n.directiveStart]);
    } else (i === null || !i.has(f)) && n.directiveToIndex.set(f.type, d);
    (f.contentQueries !== null && (n.flags |= 4),
      (f.hostBindings !== null || f.hostAttrs !== null || f.hostVars !== 0) && (n.flags |= 64));
    let g = f.type.prototype;
    (!u && (g.ngOnChanges || g.ngOnInit || g.ngDoCheck) && ((e.preOrderHooks ??= []).push(n.index), (u = !0)),
      !l && (g.ngOnChanges || g.ngDoCheck) && ((e.preOrderCheckHooks ??= []).push(n.index), (l = !0)),
      d++);
  }
  Ky(e, n, i);
}
function Ky(e, t, n) {
  for (let r = t.directiveStart; r < t.directiveEnd; r++) {
    let o = e.data[r];
    if (n === null || !n.has(o)) (ff(0, t, o, r), ff(1, t, o, r), hf(t, r, !1));
    else {
      let i = n.get(o);
      (pf(0, t, i, r), pf(1, t, i, r), hf(t, r, !0));
    }
  }
}
function ff(e, t, n, r) {
  let o = e === 0 ? n.inputs : n.outputs;
  for (let i in o)
    if (o.hasOwnProperty(i)) {
      let s;
      (e === 0 ? (s = t.inputs ??= {}) : (s = t.outputs ??= {}), (s[i] ??= []), s[i].push(r), Vp(t, i));
    }
}
function pf(e, t, n, r) {
  let o = e === 0 ? n.inputs : n.outputs;
  for (let i in o)
    if (o.hasOwnProperty(i)) {
      let s = o[i],
        a;
      (e === 0 ? (a = t.hostDirectiveInputs ??= {}) : (a = t.hostDirectiveOutputs ??= {}),
        (a[s] ??= []),
        a[s].push(r, i),
        Vp(t, s));
    }
}
function Vp(e, t) {
  t === 'class' ? (e.flags |= 8) : t === 'style' && (e.flags |= 16);
}
function hf(e, t, n) {
  let { attrs: r, inputs: o, hostDirectiveInputs: i } = e;
  if (r === null || (!n && o === null) || (n && i === null) || Zc(e)) {
    ((e.initialInputs ??= []), e.initialInputs.push(null));
    return;
  }
  let s = null,
    a = 0;
  for (; a < r.length; ) {
    let c = r[a];
    if (c === 0) {
      a += 4;
      continue;
    } else if (c === 5) {
      a += 2;
      continue;
    } else if (typeof c == 'number') break;
    if (!n && o.hasOwnProperty(c)) {
      let u = o[c];
      for (let l of u)
        if (l === t) {
          ((s ??= []), s.push(c, r[a + 1]));
          break;
        }
    } else if (n && i.hasOwnProperty(c)) {
      let u = i[c];
      for (let l = 0; l < u.length; l += 2)
        if (u[l] === t) {
          ((s ??= []), s.push(u[l + 1], r[a + 1]));
          break;
        }
    }
    a += 2;
  }
  ((e.initialInputs ??= []), e.initialInputs.push(s));
}
function Jy(e, t, n, r, o) {
  e.data[r] = o;
  let i = o.factory || (o.factory = yt(o.type, !0)),
    s = new xr(i, Yt(o), nn, null);
  ((e.blueprint[r] = s), (n[r] = s), Xy(e, t, r, fp(e, n, o.hostVars, at), o));
}
function Xy(e, t, n, r, o) {
  let i = o.hostBindings;
  if (i) {
    let s = e.hostBindingOpCodes;
    s === null && (s = e.hostBindingOpCodes = []);
    let a = ~t.index;
    (eD(s) != a && s.push(a), s.push(n, r, i));
  }
}
function eD(e) {
  let t = e.length;
  for (; t > 0; ) {
    let n = e[--t];
    if (typeof n == 'number' && n < 0) return n;
  }
  return 0;
}
function tD(e, t, n) {
  if (n) {
    if (t.exportAs) for (let r = 0; r < t.exportAs.length; r++) n[t.exportAs[r]] = e;
    Yt(t) && (n[''] = e);
  }
}
function nD(e, t, n) {
  ((e.flags |= 1), (e.directiveStart = t), (e.directiveEnd = t + n), (e.providerIndexes = t));
}
function Hp(e, t, n, r, o, i, s, a) {
  let c = t[S],
    u = c.consts,
    l = St(u, s),
    d = Yi(c, e, n, r, l);
  return (
    i && Wy(c, t, d, St(u, a), o),
    (d.mergedAttrs = Hi(d.mergedAttrs, d.attrs)),
    d.attrs !== null && Ai(d, d.attrs, !1),
    d.mergedAttrs !== null && Ai(d, d.mergedAttrs, !0),
    c.queries !== null && c.queries.elementStart(c, d),
    d
  );
}
function Up(e, t) {
  (Jm(e, t), Ua(t) && e.queries.elementEnd(t));
}
function rD(e, t, n, r, o, i) {
  let s = t.consts,
    a = St(s, o),
    c = Yi(t, e, n, r, a);
  if (((c.mergedAttrs = Hi(c.mergedAttrs, c.attrs)), i != null)) {
    let u = St(s, i);
    c.localNames = [];
    for (let l = 0; l < u.length; l += 2) c.localNames.push(u[l], -1);
  }
  return (
    c.attrs !== null && Ai(c, c.attrs, !1),
    c.mergedAttrs !== null && Ai(c, c.mergedAttrs, !0),
    t.queries !== null && t.queries.elementStart(t, c),
    c
  );
}
function $p(e, t, n) {
  return (e[t] = n);
}
function Vn(e, t, n) {
  if (n === at) return !1;
  let r = e[t];
  return Object.is(r, n) ? !1 : ((e[t] = n), !0);
}
function oD(e, t, n, r) {
  let o = Vn(e, t, n);
  return Vn(e, t + 1, r) || o;
}
function iD(e, t, n) {
  return function r(o) {
    let i = Zt(e) ? ze(e.index, t) : t;
    au(i, 5);
    let s = t[X],
      a = gf(t, s, n, o),
      c = r.__ngNextListenerFn__;
    for (; c; ) ((a = gf(t, s, c, o) && a), (c = c.__ngNextListenerFn__));
    return a;
  };
}
function gf(e, t, n, r) {
  let o = I(null);
  try {
    return (B(6, t, n), n(r) !== !1);
  } catch (i) {
    return (Ey(e, i), !1);
  } finally {
    (B(7, t, n), I(o));
  }
}
function sD(e, t, n, r, o, i, s, a) {
  let c = ci(e),
    u = !1,
    l = null;
  if ((!r && c && (l = cD(t, n, i, e.index)), l !== null)) {
    let d = l.__ngLastListenerFn__ || l;
    ((d.__ngNextListenerFn__ = s), (l.__ngLastListenerFn__ = s), (u = !0));
  } else {
    let d = ot(e, n),
      p = r ? r(d) : d;
    wv(n, p, i, a);
    let f = o.listen(p, i, a);
    if (!aD(i)) {
      let g = r ? (E) => r(Te(E[e.index])) : e.index;
      uD(g, t, n, i, a, f, !1);
    }
  }
  return u;
}
function aD(e) {
  return e.startsWith('animation') || e.startsWith('transition');
}
function cD(e, t, n, r) {
  let o = e.cleanup;
  if (o != null)
    for (let i = 0; i < o.length - 1; i += 2) {
      let s = o[i];
      if (s === n && o[i + 1] === r) {
        let a = t[Rn],
          c = o[i + 2];
        return a && a.length > c ? a[c] : null;
      }
      typeof s == 'string' && (i += 2);
    }
  return null;
}
function uD(e, t, n, r, o, i, s) {
  let a = t.firstCreatePass ? Ad(t) : null,
    c = Nd(n),
    u = c.length;
  (c.push(o, i), a && a.push(r, e, u, (u + 1) * (s ? -1 : 1)));
}
var kc = Symbol('BINDING');
var Ri = class extends Vr {
  ngModule;
  constructor(t) {
    (super(), (this.ngModule = t));
  }
  resolveComponentFactory(t) {
    let n = It(t);
    return new Hn(n, this.ngModule);
  }
};
function lD(e) {
  return Object.keys(e).map((t) => {
    let [n, r, o] = e[t],
      i = { propName: n, templateName: t, isSignal: (r & qi.SignalBased) !== 0 };
    return (o && (i.transform = o), i);
  });
}
function dD(e) {
  return Object.keys(e).map((t) => ({ propName: e[t], templateName: t }));
}
function fD(e, t, n) {
  let r = t instanceof oe ? t : t?.injector;
  return (r && e.getStandaloneInjector !== null && (r = e.getStandaloneInjector(r) || r), r ? new Oc(n, r) : n);
}
function pD(e) {
  let t = e.get(Xt, null);
  if (t === null) throw new v(407, !1);
  let n = e.get(Bp, null),
    r = e.get(Ct, null);
  return { rendererFactory: t, sanitizer: n, changeDetectionScheduler: r, ngReflect: !1 };
}
function hD(e, t) {
  let n = zp(e);
  return ap(t, n, n === 'svg' ? Sd : n === 'math' ? _d : null);
}
function zp(e) {
  return (e.selectors[0][0] || 'div').toLowerCase();
}
var Hn = class extends Qi {
  componentDef;
  ngModule;
  selector;
  componentType;
  ngContentSelectors;
  isBoundToModule;
  cachedInputs = null;
  cachedOutputs = null;
  get inputs() {
    return ((this.cachedInputs ??= lD(this.componentDef.inputs)), this.cachedInputs);
  }
  get outputs() {
    return ((this.cachedOutputs ??= dD(this.componentDef.outputs)), this.cachedOutputs);
  }
  constructor(t, n) {
    (super(),
      (this.componentDef = t),
      (this.ngModule = n),
      (this.componentType = t.type),
      (this.selector = kv(t.selectors)),
      (this.ngContentSelectors = t.ngContentSelectors ?? []),
      (this.isBoundToModule = !!n));
  }
  create(t, n, r, o, i, s) {
    B(22);
    let a = I(null);
    try {
      let c = this.componentDef,
        u = gD(r, c, s, i),
        l = fD(c, o || this.ngModule, t),
        d = pD(l),
        p = d.rendererFactory.createRenderer(null, c),
        f = r ? fy(p, r, c.encapsulation, l) : hD(c, p),
        g = s?.some(mf) || i?.some((N) => typeof N != 'function' && N.bindings.some(mf)),
        E = Qc(null, u, null, 512 | dp(c), null, null, d, p, l, null, tp(f, l, !0));
      ((E[te] = f), pi(E));
      let M = null;
      try {
        let N = Hp(te, E, 2, '#host', () => u.directiveRegistry, !0, 0);
        (lp(p, f, N),
          jn(f, E),
          Ip(u, E, N),
          rp(u, N, E),
          Up(u, N),
          n !== void 0 && vD(N, this.ngContentSelectors, n),
          (M = ze(N.index, E)),
          (E[X] = M[X]),
          su(u, E, null));
      } catch (N) {
        throw (M !== null && Ic(M), Ic(E), N);
      } finally {
        (B(23), hi());
      }
      return new xi(this.componentType, E, !!g);
    } finally {
      I(a);
    }
  }
};
function gD(e, t, n, r) {
  let o = e ? ['ng-version', '20.3.9'] : Pv(t.selectors[0]),
    i = null,
    s = null,
    a = 0;
  if (n)
    for (let l of n)
      ((a += l[kc].requiredVars),
        l.create && ((l.targetIdx = 0), (i ??= []).push(l)),
        l.update && ((l.targetIdx = 0), (s ??= []).push(l)));
  if (r)
    for (let l = 0; l < r.length; l++) {
      let d = r[l];
      if (typeof d != 'function')
        for (let p of d.bindings) {
          a += p[kc].requiredVars;
          let f = l + 1;
          (p.create && ((p.targetIdx = f), (i ??= []).push(p)), p.update && ((p.targetIdx = f), (s ??= []).push(p)));
        }
    }
  let c = [t];
  if (r)
    for (let l of r) {
      let d = typeof l == 'function' ? l : l.type,
        p = Fa(d);
      c.push(p);
    }
  return Yc(0, null, mD(i, s), 1, a, c, null, null, null, [o], null);
}
function mD(e, t) {
  return !e && !t
    ? null
    : (n) => {
        if (n & 1 && e) for (let r of e) r.create();
        if (n & 2 && t) for (let r of t) r.update();
      };
}
function mf(e) {
  let t = e[kc].kind;
  return t === 'input' || t === 'twoWay';
}
var xi = class extends jp {
  _rootLView;
  _hasInputBindings;
  instance;
  hostView;
  changeDetectorRef;
  componentType;
  location;
  previousInputValues = null;
  _tNode;
  constructor(t, n, r) {
    (super(),
      (this._rootLView = n),
      (this._hasInputBindings = r),
      (this._tNode = ui(n[S], te)),
      (this.location = $c(this._tNode, n)),
      (this.instance = ze(this._tNode.index, n)[X]),
      (this.hostView = this.changeDetectorRef = new Jt(n, void 0)),
      (this.componentType = t));
  }
  setInput(t, n) {
    this._hasInputBindings;
    let r = this._tNode;
    if (
      ((this.previousInputValues ??= new Map()),
      this.previousInputValues.has(t) && Object.is(this.previousInputValues.get(t), n))
    )
      return;
    let o = this._rootLView,
      i = Sp(r, o[S], o, t, n);
    this.previousInputValues.set(t, n);
    let s = ze(r.index, o);
    au(s, 1);
  }
  get injector() {
    return new Kt(this._tNode, this._rootLView);
  }
  destroy() {
    this.hostView.destroy();
  }
  onDestroy(t) {
    this.hostView.onDestroy(t);
  }
};
function vD(e, t, n) {
  let r = (e.projection = []);
  for (let o = 0; o < t.length; o++) {
    let i = n[o];
    r.push(i != null && i.length ? Array.from(i) : null);
  }
}
var Hr = (() => {
  class e {
    static __NG_ELEMENT_ID__ = yD;
  }
  return e;
})();
function yD() {
  let e = Fe();
  return ED(e, H());
}
var DD = Hr,
  Gp = class extends DD {
    _lContainer;
    _hostTNode;
    _hostLView;
    constructor(t, n, r) {
      (super(), (this._lContainer = t), (this._hostTNode = n), (this._hostLView = r));
    }
    get element() {
      return $c(this._hostTNode, this._hostLView);
    }
    get injector() {
      return new Kt(this._hostTNode, this._hostLView);
    }
    get parentInjector() {
      let t = Uc(this._hostTNode, this._hostLView);
      if (Pf(t)) {
        let n = Si(t, this._hostLView),
          r = bi(t),
          o = n[S].data[r + 8];
        return new Kt(o, n);
      } else return new Kt(null, this._hostLView);
    }
    clear() {
      for (; this.length > 0; ) this.remove(this.length - 1);
    }
    get(t) {
      let n = vf(this._lContainer);
      return (n !== null && n[t]) || null;
    }
    get length() {
      return this._lContainer.length - Z;
    }
    createEmbeddedView(t, n, r) {
      let o, i;
      typeof r == 'number' ? (o = r) : r != null && ((o = r.index), (i = r.injector));
      let s = Rc(this._lContainer, t.ssrId),
        a = t.createEmbeddedViewImpl(n || {}, i, s);
      return (this.insertImpl(a, o, Ni(this._hostTNode, s)), a);
    }
    createComponent(t, n, r, o, i, s, a) {
      let c = t && !Wm(t),
        u;
      if (c) u = n;
      else {
        let M = n || {};
        ((u = M.index),
          (r = M.injector),
          (o = M.projectableNodes),
          (i = M.environmentInjector || M.ngModuleRef),
          (s = M.directives),
          (a = M.bindings));
      }
      let l = c ? t : new Hn(It(t)),
        d = r || this.parentInjector;
      if (!i && l.ngModule == null) {
        let N = (c ? d : this.parentInjector).get(oe, null);
        N && (i = N);
      }
      let p = It(l.componentType ?? {}),
        f = Rc(this._lContainer, p?.id ?? null),
        g = f?.firstChild ?? null,
        E = l.create(d, o, g, i, s, a);
      return (this.insertImpl(E.hostView, u, Ni(this._hostTNode, f)), E);
    }
    insert(t, n) {
      return this.insertImpl(t, n, !0);
    }
    insertImpl(t, n, r) {
      let o = t._lView;
      if (Td(o)) {
        let a = this.indexOf(t);
        if (a !== -1) this.detach(a);
        else {
          let c = o[J],
            u = new Gp(c, c[_e], c[J]);
          u.detach(u.indexOf(t));
        }
      }
      let i = this._adjustIndex(n),
        s = this._lContainer;
      return (cu(s, o, i, r), t.attachToViewContainerRef(), xa(hc(s), i, t), t);
    }
    move(t, n) {
      return this.insert(t, n);
    }
    indexOf(t) {
      let n = vf(this._lContainer);
      return n !== null ? n.indexOf(t) : -1;
    }
    remove(t) {
      let n = this._adjustIndex(t, -1),
        r = Pr(this._lContainer, n);
      r && (Dr(hc(this._lContainer), n), Wi(r[S], r));
    }
    detach(t) {
      let n = this._adjustIndex(t, -1),
        r = Pr(this._lContainer, n);
      return r && Dr(hc(this._lContainer), n) != null ? new Jt(r) : null;
    }
    _adjustIndex(t, n = 0) {
      return t ?? this.length + n;
    }
  };
function vf(e) {
  return e[br];
}
function hc(e) {
  return e[br] || (e[br] = []);
}
function ED(e, t) {
  let n,
    r = t[e.index];
  return (Pe(r) ? (n = r) : ((n = Fp(r, t, null, e)), (t[e.index] = n), Kc(t, n)), ID(n, t, e, r), new Gp(n, e, t));
}
function CD(e, t) {
  let n = e[ee],
    r = n.createComment(''),
    o = ot(t, e),
    i = n.parentNode(o);
  return (Ti(n, i, r, n.nextSibling(o), !1), r);
}
var ID = SD,
  wD = () => !1;
function bD(e, t, n) {
  return wD(e, t, n);
}
function SD(e, t, n, r) {
  if (e[bt]) return;
  let o;
  (n.type & 8 ? (o = Te(r)) : (o = CD(t, n)), (e[bt] = o));
}
var en = class {},
  Ki = class {};
var Oi = class extends en {
    ngModuleType;
    _parent;
    _bootstrapComponents = [];
    _r3Injector;
    instance;
    destroyCbs = [];
    componentFactoryResolver = new Ri(this);
    constructor(t, n, r, o = !0) {
      (super(), (this.ngModuleType = t), (this._parent = n));
      let i = Pa(t);
      ((this._bootstrapComponents = ip(i.bootstrap)),
        (this._r3Injector = ac(
          t,
          n,
          [{ provide: en, useValue: this }, { provide: Vr, useValue: this.componentFactoryResolver }, ...r],
          et(t),
          new Set(['environment'])
        )),
        o && this.resolveInjectorInitializers());
    }
    resolveInjectorInitializers() {
      (this._r3Injector.resolveInjectorInitializers(), (this.instance = this._r3Injector.get(this.ngModuleType)));
    }
    get injector() {
      return this._r3Injector;
    }
    destroy() {
      let t = this._r3Injector;
      (!t.destroyed && t.destroy(), this.destroyCbs.forEach((n) => n()), (this.destroyCbs = null));
    }
    onDestroy(t) {
      this.destroyCbs.push(t);
    }
  },
  ki = class extends Ki {
    moduleType;
    constructor(t) {
      (super(), (this.moduleType = t));
    }
    create(t) {
      return new Oi(this.moduleType, t, []);
    }
  };
var Fr = class extends en {
  injector;
  componentFactoryResolver = new Ri(this);
  instance = null;
  constructor(t) {
    super();
    let n = new Bt(
      [...t.providers, { provide: en, useValue: this }, { provide: Vr, useValue: this.componentFactoryResolver }],
      t.parent || Cr(),
      t.debugName,
      new Set(['environment'])
    );
    ((this.injector = n), t.runEnvironmentInitializers && n.resolveInjectorInitializers());
  }
  destroy() {
    this.injector.destroy();
  }
  onDestroy(t) {
    this.injector.onDestroy(t);
  }
};
function Ur(e, t, n = null) {
  return new Fr({ providers: e, parent: t, debugName: n, runEnvironmentInitializers: !0 }).injector;
}
var _D = (() => {
  class e {
    _injector;
    cachedInjectors = new Map();
    constructor(n) {
      this._injector = n;
    }
    getOrCreateStandaloneInjector(n) {
      if (!n.standalone) return null;
      if (!this.cachedInjectors.has(n)) {
        let r = La(!1, n.type),
          o = r.length > 0 ? Ur([r], this._injector, `Standalone[${n.type.name}]`) : null;
        this.cachedInjectors.set(n, o);
      }
      return this.cachedInjectors.get(n);
    }
    ngOnDestroy() {
      try {
        for (let n of this.cachedInjectors.values()) n !== null && n.destroy();
      } finally {
        this.cachedInjectors.clear();
      }
    }
    static ɵprov = y({ token: e, providedIn: 'environment', factory: () => new e(b(oe)) });
  }
  return e;
})();
function rn(e) {
  return Bi(() => {
    let t = qp(e),
      n = j(m({}, t), {
        decls: e.decls,
        vars: e.vars,
        template: e.template,
        consts: e.consts || null,
        ngContentSelectors: e.ngContentSelectors,
        onPush: e.changeDetection === Gc.OnPush,
        directiveDefs: null,
        pipeDefs: null,
        dependencies: (t.standalone && e.dependencies) || null,
        getStandaloneInjector: t.standalone ? (o) => o.get(_D).getOrCreateStandaloneInjector(n) : null,
        getExternalStyles: null,
        signals: e.signals ?? !1,
        data: e.data || {},
        encapsulation: e.encapsulation || st.Emulated,
        styles: e.styles || Dt,
        _: null,
        schemas: e.schemas || null,
        tView: null,
        id: ''
      });
    (t.standalone && Br('NgStandalone'), Wp(n));
    let r = e.dependencies;
    return ((n.directiveDefs = yf(r, TD)), (n.pipeDefs = yf(r, vd)), (n.id = AD(n)), n);
  });
}
function TD(e) {
  return It(e) || Fa(e);
}
function MD(e, t) {
  if (e == null) return Ut;
  let n = {};
  for (let r in e)
    if (e.hasOwnProperty(r)) {
      let o = e[r],
        i,
        s,
        a,
        c;
      (Array.isArray(o)
        ? ((a = o[0]), (i = o[1]), (s = o[2] ?? i), (c = o[3] || null))
        : ((i = o), (s = o), (a = qi.None), (c = null)),
        (n[i] = [r, a, c]),
        (t[i] = s));
    }
  return n;
}
function ND(e) {
  if (e == null) return Ut;
  let t = {};
  for (let n in e) e.hasOwnProperty(n) && (t[e[n]] = n);
  return t;
}
function Ji(e) {
  return Bi(() => {
    let t = qp(e);
    return (Wp(t), t);
  });
}
function Xi(e) {
  return {
    type: e.type,
    name: e.name,
    factory: null,
    pure: e.pure !== !1,
    standalone: e.standalone ?? !0,
    onDestroy: e.type.prototype.ngOnDestroy || null
  };
}
function qp(e) {
  let t = {};
  return {
    type: e.type,
    providersResolver: null,
    factory: null,
    hostBindings: e.hostBindings || null,
    hostVars: e.hostVars || 0,
    hostAttrs: e.hostAttrs || null,
    contentQueries: e.contentQueries || null,
    declaredInputs: t,
    inputConfig: e.inputs || Ut,
    exportAs: e.exportAs || null,
    standalone: e.standalone ?? !0,
    signals: e.signals === !0,
    selectors: e.selectors || Dt,
    viewQuery: e.viewQuery || null,
    features: e.features || null,
    setInput: null,
    resolveHostDirectives: null,
    hostDirectives: null,
    inputs: MD(e.inputs, t),
    outputs: ND(e.outputs),
    debugInfo: null
  };
}
function Wp(e) {
  e.features?.forEach((t) => t(e));
}
function yf(e, t) {
  return e
    ? () => {
        let n = typeof e == 'function' ? e() : e,
          r = [];
        for (let o of n) {
          let i = t(o);
          i !== null && r.push(i);
        }
        return r;
      }
    : null;
}
function AD(e) {
  let t = 0,
    n = typeof e.consts == 'function' ? '' : e.consts,
    r = [
      e.selectors,
      e.ngContentSelectors,
      e.hostVars,
      e.hostAttrs,
      n,
      e.vars,
      e.decls,
      e.encapsulation,
      e.standalone,
      e.signals,
      e.exportAs,
      JSON.stringify(e.inputs),
      JSON.stringify(e.outputs),
      Object.getOwnPropertyNames(e.type.prototype),
      !!e.contentQueries,
      !!e.viewQuery
    ];
  for (let i of r.join('|')) t = (Math.imul(31, t) + i.charCodeAt(0)) << 0;
  return ((t += 2147483648), 'c' + t);
}
function RD(e, t, n, r, o, i, s, a) {
  if (n.firstCreatePass) {
    e.mergedAttrs = Hi(e.mergedAttrs, e.attrs);
    let l = (e.tView = Yc(2, e, o, i, s, n.directiveRegistry, n.pipeRegistry, null, n.schemas, n.consts, null));
    n.queries !== null && (n.queries.template(n, e), (l.queries = n.queries.embeddedTView(e)));
  }
  (a && (e.flags |= a), Pn(e, !1));
  let c = xD(n, t, e, r);
  (gi() && ru(n, t, c, e), jn(c, t));
  let u = Fp(c, t, c, e);
  ((t[r + te] = u), Kc(t, u), bD(u, e, t));
}
function Df(e, t, n, r, o, i, s, a, c, u, l) {
  let d = n + te,
    p;
  if (t.firstCreatePass) {
    if (((p = Yi(t, d, 4, s || null, a || null)), u != null)) {
      let f = St(t.consts, u);
      p.localNames = [];
      for (let g = 0; g < f.length; g += 2) p.localNames.push(f[g], -1);
    }
  } else p = t.data[d];
  return (RD(p, e, t, n, r, o, i, c), u != null && iu(e, p, l), p);
}
var xD = OD;
function OD(e, t, n, r) {
  return (mi(!0), t[ee].createComment(''));
}
var uu = (() => {
  class e {
    log(n) {
      console.log(n);
    }
    warn(n) {
      console.warn(n);
    }
    static ɵfac = function (r) {
      return new (r || e)();
    };
    static ɵprov = y({ token: e, factory: e.ɵfac, providedIn: 'platform' });
  }
  return e;
})();
var lu = new D('');
function zn(e) {
  return !!e && typeof e.then == 'function';
}
function du(e) {
  return !!e && typeof e.subscribe == 'function';
}
var Zp = new D('');
var fu = (() => {
    class e {
      resolve;
      reject;
      initialized = !1;
      done = !1;
      donePromise = new Promise((n, r) => {
        ((this.resolve = n), (this.reject = r));
      });
      appInits = h(Zp, { optional: !0 }) ?? [];
      injector = h(Oe);
      constructor() {}
      runInitializers() {
        if (this.initialized) return;
        let n = [];
        for (let o of this.appInits) {
          let i = le(this.injector, o);
          if (zn(i)) n.push(i);
          else if (du(i)) {
            let s = new Promise((a, c) => {
              i.subscribe({ complete: a, error: c });
            });
            n.push(s);
          }
        }
        let r = () => {
          ((this.done = !0), this.resolve());
        };
        (Promise.all(n)
          .then(() => {
            r();
          })
          .catch((o) => {
            this.reject(o);
          }),
          n.length === 0 && r(),
          (this.initialized = !0));
      }
      static ɵfac = function (r) {
        return new (r || e)();
      };
      static ɵprov = y({ token: e, factory: e.ɵfac, providedIn: 'root' });
    }
    return e;
  })(),
  es = new D('');
function Yp() {
  Ws(() => {
    let e = '';
    throw new v(600, e);
  });
}
function Qp(e) {
  return e.isBoundToModule;
}
var kD = 10;
var on = (() => {
  class e {
    _runningTick = !1;
    _destroyed = !1;
    _destroyListeners = [];
    _views = [];
    internalErrorHandler = h(Ie);
    afterRenderManager = h(vp);
    zonelessEnabled = h(Mr);
    rootEffectScheduler = h(lc);
    dirtyFlags = 0;
    tracingSnapshot = null;
    allTestViews = new Set();
    autoDetectTestViews = new Set();
    includeAllTestViews = !1;
    afterTick = new q();
    get allViews() {
      return [...(this.includeAllTestViews ? this.allTestViews : this.autoDetectTestViews).keys(), ...this._views];
    }
    get destroyed() {
      return this._destroyed;
    }
    componentTypes = [];
    components = [];
    internalPendingTask = h(it);
    get isStable() {
      return this.internalPendingTask.hasPendingTasksObservable.pipe(O((n) => !n));
    }
    constructor() {
      h(jr, { optional: !0 });
    }
    whenStable() {
      let n;
      return new Promise((r) => {
        n = this.isStable.subscribe({
          next: (o) => {
            o && r();
          }
        });
      }).finally(() => {
        n.unsubscribe();
      });
    }
    _injector = h(oe);
    _rendererFactory = null;
    get injector() {
      return this._injector;
    }
    bootstrap(n, r) {
      return this.bootstrapImpl(n, r);
    }
    bootstrapImpl(n, r, o = Oe.NULL) {
      return this._injector.get(Y).run(() => {
        B(10);
        let s = n instanceof Qi;
        if (!this._injector.get(fu).done) {
          let g = '';
          throw new v(405, g);
        }
        let c;
        (s ? (c = n) : (c = this._injector.get(Vr).resolveComponentFactory(n)),
          this.componentTypes.push(c.componentType));
        let u = Qp(c) ? void 0 : this._injector.get(en),
          l = r || c.selector,
          d = c.create(o, [], l, u),
          p = d.location.nativeElement,
          f = d.injector.get(lu, null);
        return (
          f?.registerApplication(p),
          d.onDestroy(() => {
            (this.detachView(d.hostView), Rr(this.components, d), f?.unregisterApplication(p));
          }),
          this._loadComponent(d),
          B(11, d),
          d
        );
      });
    }
    tick() {
      (this.zonelessEnabled || (this.dirtyFlags |= 1), this._tick());
    }
    _tick() {
      (B(12),
        this.tracingSnapshot !== null ? this.tracingSnapshot.run(Xc.CHANGE_DETECTION, this.tickImpl) : this.tickImpl());
    }
    tickImpl = () => {
      if (this._runningTick) throw new v(101, !1);
      let n = I(null);
      try {
        ((this._runningTick = !0), this.synchronize());
      } finally {
        ((this._runningTick = !1),
          this.tracingSnapshot?.dispose(),
          (this.tracingSnapshot = null),
          I(n),
          this.afterTick.next(),
          B(13));
      }
    };
    synchronize() {
      this._rendererFactory === null &&
        !this._injector.destroyed &&
        (this._rendererFactory = this._injector.get(Xt, null, { optional: !0 }));
      let n = 0;
      for (; this.dirtyFlags !== 0 && n++ < kD; ) (B(14), this.synchronizeOnce(), B(15));
    }
    synchronizeOnce() {
      this.dirtyFlags & 16 && ((this.dirtyFlags &= -17), this.rootEffectScheduler.flush());
      let n = !1;
      if (this.dirtyFlags & 7) {
        let r = !!(this.dirtyFlags & 1);
        ((this.dirtyFlags &= -8), (this.dirtyFlags |= 8));
        for (let { _lView: o } of this.allViews) {
          if (!r && !_r(o)) continue;
          let i = r && !this.zonelessEnabled ? 0 : 1;
          (xp(o, i), (n = !0));
        }
        if (((this.dirtyFlags &= -5), this.syncDirtyFlagsWithViews(), this.dirtyFlags & 23)) return;
      }
      (n || (this._rendererFactory?.begin?.(), this._rendererFactory?.end?.()),
        this.dirtyFlags & 8 && ((this.dirtyFlags &= -9), this.afterRenderManager.execute()),
        this.syncDirtyFlagsWithViews());
    }
    syncDirtyFlagsWithViews() {
      if (this.allViews.some(({ _lView: n }) => _r(n))) {
        this.dirtyFlags |= 2;
        return;
      } else this.dirtyFlags &= -8;
    }
    attachView(n) {
      let r = n;
      (this._views.push(r), r.attachToAppRef(this));
    }
    detachView(n) {
      let r = n;
      (Rr(this._views, r), r.detachFromAppRef());
    }
    _loadComponent(n) {
      this.attachView(n.hostView);
      try {
        this.tick();
      } catch (o) {
        this.internalErrorHandler(o);
      }
      (this.components.push(n), this._injector.get(es, []).forEach((o) => o(n)));
    }
    ngOnDestroy() {
      if (!this._destroyed)
        try {
          (this._destroyListeners.forEach((n) => n()), this._views.slice().forEach((n) => n.destroy()));
        } finally {
          ((this._destroyed = !0), (this._views = []), (this._destroyListeners = []));
        }
    }
    onDestroy(n) {
      return (this._destroyListeners.push(n), () => Rr(this._destroyListeners, n));
    }
    destroy() {
      if (this._destroyed) throw new v(406, !1);
      let n = this._injector;
      n.destroy && !n.destroyed && n.destroy();
    }
    get viewCount() {
      return this._views.length;
    }
    static ɵfac = function (r) {
      return new (r || e)();
    };
    static ɵprov = y({ token: e, factory: e.ɵfac, providedIn: 'root' });
  }
  return e;
})();
function Rr(e, t) {
  let n = e.indexOf(t);
  n > -1 && e.splice(n, 1);
}
var H0 = typeof document < 'u' && typeof document?.documentElement?.getAnimations == 'function';
var Pc = class {
  destroy(t) {}
  updateValue(t, n) {}
  swap(t, n) {
    let r = Math.min(t, n),
      o = Math.max(t, n),
      i = this.detach(o);
    if (o - r > 1) {
      let s = this.detach(r);
      (this.attach(r, i), this.attach(o, s));
    } else this.attach(r, i);
  }
  move(t, n) {
    this.attach(n, this.detach(t, !0));
  }
};
function gc(e, t, n, r, o) {
  return e === n && Object.is(t, r) ? 1 : Object.is(o(e, t), o(n, r)) ? -1 : 0;
}
function PD(e, t, n) {
  let r,
    o,
    i = 0,
    s = e.length - 1,
    a = void 0;
  if (Array.isArray(t)) {
    let c = t.length - 1;
    for (; i <= s && i <= c; ) {
      let u = e.at(i),
        l = t[i],
        d = gc(i, u, i, l, n);
      if (d !== 0) {
        (d < 0 && e.updateValue(i, l), i++);
        continue;
      }
      let p = e.at(s),
        f = t[c],
        g = gc(s, p, c, f, n);
      if (g !== 0) {
        (g < 0 && e.updateValue(s, f), s--, c--);
        continue;
      }
      let E = n(i, u),
        M = n(s, p),
        N = n(i, l);
      if (Object.is(N, M)) {
        let Ot = n(c, f);
        (Object.is(Ot, E) ? (e.swap(i, s), e.updateValue(s, f), c--, s--) : e.move(s, i), e.updateValue(i, l), i++);
        continue;
      }
      if (((r ??= new Pi()), (o ??= Cf(e, i, s, n)), Fc(e, r, i, N))) (e.updateValue(i, l), i++, s++);
      else if (o.has(N)) (r.set(E, e.detach(i)), s--);
      else {
        let Ot = e.create(i, t[i]);
        (e.attach(i, Ot), i++, s++);
      }
    }
    for (; i <= c; ) (Ef(e, r, n, i, t[i]), i++);
  } else if (t != null) {
    let c = t[Symbol.iterator](),
      u = c.next();
    for (; !u.done && i <= s; ) {
      let l = e.at(i),
        d = u.value,
        p = gc(i, l, i, d, n);
      if (p !== 0) (p < 0 && e.updateValue(i, d), i++, (u = c.next()));
      else {
        ((r ??= new Pi()), (o ??= Cf(e, i, s, n)));
        let f = n(i, d);
        if (Fc(e, r, i, f)) (e.updateValue(i, d), i++, s++, (u = c.next()));
        else if (!o.has(f)) (e.attach(i, e.create(i, d)), i++, s++, (u = c.next()));
        else {
          let g = n(i, l);
          (r.set(g, e.detach(i)), s--);
        }
      }
    }
    for (; !u.done; ) (Ef(e, r, n, e.length, u.value), (u = c.next()));
  }
  for (; i <= s; ) e.destroy(e.detach(s--));
  r?.forEach((c) => {
    e.destroy(c);
  });
}
function Fc(e, t, n, r) {
  return t !== void 0 && t.has(r) ? (e.attach(n, t.get(r)), t.delete(r), !0) : !1;
}
function Ef(e, t, n, r, o) {
  if (Fc(e, t, r, n(r, o))) e.updateValue(r, o);
  else {
    let i = e.create(r, o);
    e.attach(r, i);
  }
}
function Cf(e, t, n, r) {
  let o = new Set();
  for (let i = t; i <= n; i++) o.add(r(i, e.at(i)));
  return o;
}
var Pi = class {
  kvMap = new Map();
  _vMap = void 0;
  has(t) {
    return this.kvMap.has(t);
  }
  delete(t) {
    if (!this.has(t)) return !1;
    let n = this.kvMap.get(t);
    return (
      this._vMap !== void 0 && this._vMap.has(n)
        ? (this.kvMap.set(t, this._vMap.get(n)), this._vMap.delete(n))
        : this.kvMap.delete(t),
      !0
    );
  }
  get(t) {
    return this.kvMap.get(t);
  }
  set(t, n) {
    if (this.kvMap.has(t)) {
      let r = this.kvMap.get(t);
      this._vMap === void 0 && (this._vMap = new Map());
      let o = this._vMap;
      for (; o.has(r); ) r = o.get(r);
      o.set(r, n);
    } else this.kvMap.set(t, n);
  }
  forEach(t) {
    for (let [n, r] of this.kvMap)
      if ((t(r, n), this._vMap !== void 0)) {
        let o = this._vMap;
        for (; o.has(r); ) ((r = o.get(r)), t(r, n));
      }
  }
};
var Lc = class {
  lContainer;
  $implicit;
  $index;
  constructor(t, n, r) {
    ((this.lContainer = t), (this.$implicit = n), (this.$index = r));
  }
  get $count() {
    return this.lContainer.length - Z;
  }
};
var jc = class {
  hasEmptyBlock;
  trackByFn;
  liveCollection;
  constructor(t, n, r) {
    ((this.hasEmptyBlock = t), (this.trackByFn = n), (this.liveCollection = r));
  }
};
function pu(e, t, n, r, o, i, s, a, c, u, l, d, p) {
  Br('NgControlFlow');
  let f = H(),
    g = _t(),
    E = c !== void 0,
    M = H(),
    N = a ? s.bind(M[Ee][X]) : s,
    Ot = new jc(E, N);
  ((M[te + e] = Ot),
    Df(f, g, e + 1, t, n, r, o, St(g.consts, i), 256),
    E && Df(f, g, e + 2, c, u, l, d, St(g.consts, p), 512));
}
var Bc = class extends Pc {
  lContainer;
  hostLView;
  templateTNode;
  operationsCounter = void 0;
  needsIndexUpdate = !1;
  constructor(t, n, r) {
    (super(), (this.lContainer = t), (this.hostLView = n), (this.templateTNode = r));
  }
  get length() {
    return this.lContainer.length - Z;
  }
  at(t) {
    return this.getLView(t)[X].$implicit;
  }
  attach(t, n) {
    let r = n[An];
    ((this.needsIndexUpdate ||= t !== this.length), cu(this.lContainer, n, t, Ni(this.templateTNode, r)));
  }
  detach(t, n) {
    return ((this.needsIndexUpdate ||= t !== this.length - 1), n && FD(this.lContainer, t), LD(this.lContainer, t));
  }
  create(t, n) {
    let r = Rc(this.lContainer, this.templateTNode.tView.ssrId),
      o = _p(this.hostLView, this.templateTNode, new Lc(this.lContainer, n, t), { dehydratedView: r });
    return (this.operationsCounter?.recordCreate(), o);
  }
  destroy(t) {
    (Wi(t[S], t), this.operationsCounter?.recordDestroy());
  }
  updateValue(t, n) {
    this.getLView(t)[X].$implicit = n;
  }
  reset() {
    ((this.needsIndexUpdate = !1), this.operationsCounter?.reset());
  }
  updateIndexes() {
    if (this.needsIndexUpdate) for (let t = 0; t < this.length; t++) this.getLView(t)[X].$index = t;
  }
  getLView(t) {
    return jD(this.lContainer, t);
  }
};
function hu(e) {
  let t = I(null),
    n = Tt();
  try {
    let r = H(),
      o = r[S],
      i = r[n],
      s = n + 1,
      a = If(r, s);
    if (i.liveCollection === void 0) {
      let u = wf(o, s);
      i.liveCollection = new Bc(a, r, u);
    } else i.liveCollection.reset();
    let c = i.liveCollection;
    if ((PD(c, e, i.trackByFn), c.updateIndexes(), i.hasEmptyBlock)) {
      let u = rc(),
        l = c.length === 0;
      if (Vn(r, u, l)) {
        let d = n + 2,
          p = If(r, d);
        if (l) {
          let f = wf(o, d),
            g = qy(p, f, r),
            E = _p(r, f, void 0, { dehydratedView: g });
          cu(p, E, 0, Ni(f, g));
        } else (o.firstUpdatePass && Uy(p), Ly(p, 0));
      }
    }
  } finally {
    I(t);
  }
}
function If(e, t) {
  return e[t];
}
function FD(e, t) {
  if (e.length <= Z) return;
  let n = Z + t,
    r = e[n];
  r && r[Wt] && (r[Wt].skipLeaveAnimations = !0);
}
function LD(e, t) {
  return Pr(e, t);
}
function jD(e, t) {
  return Fy(e, t);
}
function wf(e, t) {
  return ui(e, t);
}
function bf(e, t, n, r, o) {
  Sp(t, e, n, o ? 'class' : 'style', r);
}
function gu(e, t, n, r) {
  let o = H(),
    i = o[S],
    s = e + te,
    a = i.firstCreatePass ? Hp(s, o, 2, t, yy, Od(), n, r) : i.data[s];
  if ((wp(a, o, e, t, Kp), ci(a))) {
    let c = o[S];
    (Ip(c, o, a), rp(c, a, o));
  }
  return (r != null && iu(o, a), gu);
}
function mu() {
  let e = _t(),
    t = Fe(),
    n = bp(t);
  return (
    e.firstCreatePass && Up(e, n),
    Qa(n) && Ka(),
    Ya(),
    n.classesWithoutHost != null && ev(n) && bf(e, n, H(), n.classesWithoutHost, !0),
    n.stylesWithoutHost != null && tv(n) && bf(e, n, H(), n.stylesWithoutHost, !1),
    mu
  );
}
function Gn(e, t, n, r) {
  return (gu(e, t, n, r), mu(), Gn);
}
function Me(e, t, n, r) {
  let o = H(),
    i = o[S],
    s = e + te,
    a = i.firstCreatePass ? rD(s, i, 2, t, n, r) : i.data[s];
  return (wp(a, o, e, t, Kp), r != null && iu(o, a), Me);
}
function Be() {
  let e = Fe(),
    t = bp(e);
  return (Qa(t) && Ka(), Ya(), Be);
}
var Kp = (e, t, n, r, o) => (mi(!0), ap(t[ee], r, qd()));
var yi = void 0;
function BD(e) {
  let t = Math.floor(Math.abs(e)),
    n = e.toString().replace(/^[^.]*\.?/, '').length;
  return t === 1 && n === 0 ? 1 : 5;
}
var VD = [
    'en',
    [
      ['a', 'p'],
      ['AM', 'PM']
    ],
    [['AM', 'PM']],
    [
      ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
      ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
    ],
    yi,
    [
      ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
      ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ]
    ],
    yi,
    [
      ['B', 'A'],
      ['BC', 'AD'],
      ['Before Christ', 'Anno Domini']
    ],
    0,
    [6, 0],
    ['M/d/yy', 'MMM d, y', 'MMMM d, y', 'EEEE, MMMM d, y'],
    ['h:mm a', 'h:mm:ss a', 'h:mm:ss a z', 'h:mm:ss a zzzz'],
    ['{1}, {0}', yi, "{1} 'at' {0}", yi],
    ['.', ',', ';', '%', '+', '-', 'E', '\xD7', '\u2030', '\u221E', 'NaN', ':'],
    ['#,##0.###', '#,##0%', '\xA4#,##0.00', '#E0'],
    'USD',
    '$',
    'US Dollar',
    {},
    'ltr',
    BD
  ],
  mc = {};
function we(e) {
  let t = HD(e),
    n = Sf(t);
  if (n) return n;
  let r = t.split('-')[0];
  if (((n = Sf(r)), n)) return n;
  if (r === 'en') return VD;
  throw new v(701, !1);
}
function Sf(e) {
  return (e in mc || (mc[e] = Vt.ng && Vt.ng.common && Vt.ng.common.locales && Vt.ng.common.locales[e]), mc[e]);
}
var U = (function (e) {
  return (
    (e[(e.LocaleId = 0)] = 'LocaleId'),
    (e[(e.DayPeriodsFormat = 1)] = 'DayPeriodsFormat'),
    (e[(e.DayPeriodsStandalone = 2)] = 'DayPeriodsStandalone'),
    (e[(e.DaysFormat = 3)] = 'DaysFormat'),
    (e[(e.DaysStandalone = 4)] = 'DaysStandalone'),
    (e[(e.MonthsFormat = 5)] = 'MonthsFormat'),
    (e[(e.MonthsStandalone = 6)] = 'MonthsStandalone'),
    (e[(e.Eras = 7)] = 'Eras'),
    (e[(e.FirstDayOfWeek = 8)] = 'FirstDayOfWeek'),
    (e[(e.WeekendRange = 9)] = 'WeekendRange'),
    (e[(e.DateFormat = 10)] = 'DateFormat'),
    (e[(e.TimeFormat = 11)] = 'TimeFormat'),
    (e[(e.DateTimeFormat = 12)] = 'DateTimeFormat'),
    (e[(e.NumberSymbols = 13)] = 'NumberSymbols'),
    (e[(e.NumberFormats = 14)] = 'NumberFormats'),
    (e[(e.CurrencyCode = 15)] = 'CurrencyCode'),
    (e[(e.CurrencySymbol = 16)] = 'CurrencySymbol'),
    (e[(e.CurrencyName = 17)] = 'CurrencyName'),
    (e[(e.Currencies = 18)] = 'Currencies'),
    (e[(e.Directionality = 19)] = 'Directionality'),
    (e[(e.PluralCase = 20)] = 'PluralCase'),
    (e[(e.ExtraData = 21)] = 'ExtraData'),
    e
  );
})(U || {});
function HD(e) {
  return e.toLowerCase().replace(/_/g, '-');
}
var $r = 'en-US';
var UD = $r;
function Jp(e) {
  typeof e == 'string' && (UD = e.toLowerCase().replace(/_/g, '-'));
}
function ts(e, t, n) {
  let r = H(),
    o = _t(),
    i = Fe();
  return ((i.type & 3 || n) && sD(i, o, r, n, r[ee], e, t, iD(i, r, t)), ts);
}
function Di(e, t) {
  return (e << 17) | (t << 2);
}
function tn(e) {
  return (e >> 17) & 32767;
}
function $D(e) {
  return (e & 2) == 2;
}
function zD(e, t) {
  return (e & 131071) | (t << 17);
}
function Vc(e) {
  return e | 2;
}
function Un(e) {
  return (e & 131068) >> 2;
}
function vc(e, t) {
  return (e & -131069) | (t << 2);
}
function GD(e) {
  return (e & 1) === 1;
}
function Hc(e) {
  return e | 1;
}
function qD(e, t, n, r, o, i) {
  let s = i ? t.classBindings : t.styleBindings,
    a = tn(s),
    c = Un(s);
  e[r] = n;
  let u = !1,
    l;
  if (Array.isArray(n)) {
    let d = n;
    ((l = d[1]), (l === null || Nn(d, l) > 0) && (u = !0));
  } else l = n;
  if (o)
    if (c !== 0) {
      let p = tn(e[a + 1]);
      ((e[r + 1] = Di(p, a)), p !== 0 && (e[p + 1] = vc(e[p + 1], r)), (e[a + 1] = zD(e[a + 1], r)));
    } else ((e[r + 1] = Di(a, 0)), a !== 0 && (e[a + 1] = vc(e[a + 1], r)), (a = r));
  else ((e[r + 1] = Di(c, 0)), a === 0 ? (a = r) : (e[c + 1] = vc(e[c + 1], r)), (c = r));
  (u && (e[r + 1] = Vc(e[r + 1])),
    _f(e, l, r, !0),
    _f(e, l, r, !1),
    WD(t, l, e, r, i),
    (s = Di(a, c)),
    i ? (t.classBindings = s) : (t.styleBindings = s));
}
function WD(e, t, n, r, o) {
  let i = o ? e.residualClasses : e.residualStyles;
  i != null && typeof t == 'string' && Nn(i, t) >= 0 && (n[r + 1] = Hc(n[r + 1]));
}
function _f(e, t, n, r) {
  let o = e[n + 1],
    i = t === null,
    s = r ? tn(o) : Un(o),
    a = !1;
  for (; s !== 0 && (a === !1 || i); ) {
    let c = e[s],
      u = e[s + 1];
    (ZD(c, t) && ((a = !0), (e[s + 1] = r ? Hc(u) : Vc(u))), (s = r ? tn(u) : Un(u)));
  }
  a && (e[n + 1] = r ? Vc(o) : Hc(o));
}
function ZD(e, t) {
  return e === null || t == null || (Array.isArray(e) ? e[1] : e) === t
    ? !0
    : Array.isArray(e) && typeof t == 'string'
      ? Nn(e, t) >= 0
      : !1;
}
function ns(e, t) {
  return (YD(e, t, null, !0), ns);
}
function YD(e, t, n, r) {
  let o = H(),
    i = _t(),
    s = jd(2);
  if ((i.firstUpdatePass && KD(i, e, s, r), t !== at && Vn(o, s, t))) {
    let a = i.data[Tt()];
    nE(i, a, o, o[ee], e, (o[s + 1] = rE(t, n)), r, s);
  }
}
function QD(e, t) {
  return t >= e.expandoStartIndex;
}
function KD(e, t, n, r) {
  let o = e.data;
  if (o[n + 1] === null) {
    let i = o[Tt()],
      s = QD(e, n);
    (oE(i, r) && t === null && !s && (t = !1), (t = JD(o, i, t, r)), qD(o, i, t, n, s, r));
  }
}
function JD(e, t, n, r) {
  let o = Ud(e),
    i = r ? t.residualClasses : t.residualStyles;
  if (o === null)
    (r ? t.classBindings : t.styleBindings) === 0 && ((n = yc(null, e, t, n, r)), (n = Lr(n, t.attrs, r)), (i = null));
  else {
    let s = t.directiveStylingLast;
    if (s === -1 || e[s] !== o)
      if (((n = yc(o, e, t, n, r)), i === null)) {
        let c = XD(e, t, r);
        c !== void 0 && Array.isArray(c) && ((c = yc(null, e, t, c[1], r)), (c = Lr(c, t.attrs, r)), eE(e, t, r, c));
      } else i = tE(e, t, r);
  }
  return (i !== void 0 && (r ? (t.residualClasses = i) : (t.residualStyles = i)), n);
}
function XD(e, t, n) {
  let r = n ? t.classBindings : t.styleBindings;
  if (Un(r) !== 0) return e[tn(r)];
}
function eE(e, t, n, r) {
  let o = n ? t.classBindings : t.styleBindings;
  e[tn(o)] = r;
}
function tE(e, t, n) {
  let r,
    o = t.directiveEnd;
  for (let i = 1 + t.directiveStylingLast; i < o; i++) {
    let s = e[i].hostAttrs;
    r = Lr(r, s, n);
  }
  return Lr(r, t.attrs, n);
}
function yc(e, t, n, r, o) {
  let i = null,
    s = n.directiveEnd,
    a = n.directiveStylingLast;
  for (a === -1 ? (a = n.directiveStart) : a++; a < s && ((i = t[a]), (r = Lr(r, i.hostAttrs, o)), i !== e); ) a++;
  return (e !== null && (n.directiveStylingLast = a), r);
}
function Lr(e, t, n) {
  let r = n ? 1 : 2,
    o = -1;
  if (t !== null)
    for (let i = 0; i < t.length; i++) {
      let s = t[i];
      typeof s == 'number'
        ? (o = s)
        : o === r && (Array.isArray(e) || (e = e === void 0 ? [] : ['', e]), md(e, s, n ? !0 : t[++i]));
    }
  return e === void 0 ? null : e;
}
function nE(e, t, n, r, o, i, s, a) {
  if (!(t.type & 3)) return;
  let c = e.data,
    u = c[a + 1],
    l = GD(u) ? Tf(c, t, n, o, Un(u), s) : void 0;
  if (!Fi(l)) {
    Fi(i) || ($D(u) && (i = Tf(c, null, n, o, a, s)));
    let d = $a(Tt(), n);
    dy(r, s, d, o, i);
  }
}
function Tf(e, t, n, r, o, i) {
  let s = t === null,
    a;
  for (; o > 0; ) {
    let c = e[o],
      u = Array.isArray(c),
      l = u ? c[1] : c,
      d = l === null,
      p = n[o + 1];
    p === at && (p = d ? Dt : void 0);
    let f = d ? ii(p, r) : l === r ? p : void 0;
    if ((u && !Fi(f) && (f = ii(c, r)), Fi(f) && ((a = f), s))) return a;
    let g = e[o + 1];
    o = s ? tn(g) : Un(g);
  }
  if (t !== null) {
    let c = i ? t.residualClasses : t.residualStyles;
    c != null && (a = ii(c, r));
  }
  return a;
}
function Fi(e) {
  return e !== void 0;
}
function rE(e, t) {
  return (e == null || e === '' || (typeof t == 'string' ? (e = e + t) : typeof e == 'object' && (e = et(op(e)))), e);
}
function oE(e, t) {
  return (e.flags & (t ? 8 : 16)) !== 0;
}
function Ze(e, t = '') {
  let n = H(),
    r = _t(),
    o = e + te,
    i = r.firstCreatePass ? Yi(r, o, 1, t, null) : r.data[o],
    s = iE(r, n, i, t, e);
  ((n[o] = s), gi() && ru(r, n, s, i), Pn(i, !1));
}
var iE = (e, t, n, r, o) => (mi(!0), Fv(t[ee], r));
function sE(e, t, n, r = '') {
  return Vn(e, rc(), n) ? t + Na(n) + r : at;
}
function zr(e) {
  return (qn('', e), zr);
}
function qn(e, t, n) {
  let r = H(),
    o = sE(r, e, t, n);
  return (o !== at && aE(r, Tt(), o), qn);
}
function aE(e, t, n) {
  let r = $a(t, e);
  Lv(e[ee], r, n);
}
function Xp(e, t) {
  let n = e[t];
  return n === at ? void 0 : n;
}
function cE(e, t, n, r, o, i) {
  let s = t + n;
  return Vn(e, s, o) ? $p(e, s + 1, i ? r.call(i, o) : r(o)) : Xp(e, s + 1);
}
function uE(e, t, n, r, o, i, s) {
  let a = t + n;
  return oD(e, a, o, i) ? $p(e, a + 2, s ? r.call(s, o, i) : r(o, i)) : Xp(e, a + 2);
}
function rs(e, t) {
  let n = _t(),
    r,
    o = e + te;
  n.firstCreatePass
    ? ((r = lE(t, n.pipeRegistry)), (n.data[o] = r), r.onDestroy && (n.destroyHooks ??= []).push(o, r.onDestroy))
    : (r = n.data[o]);
  let i = r.factory || (r.factory = yt(r.type, !0)),
    s,
    a = ue(nn);
  try {
    let c = _i(!1),
      u = i();
    return (_i(c), Ga(n, H(), o, u), u);
  } finally {
    ue(a);
  }
}
function lE(e, t) {
  if (t)
    for (let n = t.length - 1; n >= 0; n--) {
      let r = t[n];
      if (e === r.name) return r;
    }
}
function vu(e, t, n) {
  let r = e + te,
    o = H(),
    i = za(o, r);
  return eh(o, r) ? cE(o, nc(), t, i.transform, n, i) : i.transform(n);
}
function yu(e, t, n, r) {
  let o = e + te,
    i = H(),
    s = za(i, o);
  return eh(i, o) ? uE(i, nc(), t, s.transform, n, r, s) : s.transform(n, r);
}
function eh(e, t) {
  return e[S].data[t].pure;
}
var Li = class {
    ngModuleFactory;
    componentFactories;
    constructor(t, n) {
      ((this.ngModuleFactory = t), (this.componentFactories = n));
    }
  },
  Du = (() => {
    class e {
      compileModuleSync(n) {
        return new ki(n);
      }
      compileModuleAsync(n) {
        return Promise.resolve(this.compileModuleSync(n));
      }
      compileModuleAndAllComponentsSync(n) {
        let r = this.compileModuleSync(n),
          o = Pa(n),
          i = ip(o.declarations).reduce((s, a) => {
            let c = It(a);
            return (c && s.push(new Hn(c)), s);
          }, []);
        return new Li(r, i);
      }
      compileModuleAndAllComponentsAsync(n) {
        return Promise.resolve(this.compileModuleAndAllComponentsSync(n));
      }
      clearCache() {}
      clearCacheFor(n) {}
      getModuleId(n) {}
      static ɵfac = function (r) {
        return new (r || e)();
      };
      static ɵprov = y({ token: e, factory: e.ɵfac, providedIn: 'root' });
    }
    return e;
  })();
var dE = (() => {
  class e {
    zone = h(Y);
    changeDetectionScheduler = h(Ct);
    applicationRef = h(on);
    applicationErrorHandler = h(Ie);
    _onMicrotaskEmptySubscription;
    initialize() {
      this._onMicrotaskEmptySubscription ||
        (this._onMicrotaskEmptySubscription = this.zone.onMicrotaskEmpty.subscribe({
          next: () => {
            this.changeDetectionScheduler.runningTick ||
              this.zone.run(() => {
                try {
                  ((this.applicationRef.dirtyFlags |= 1), this.applicationRef._tick());
                } catch (n) {
                  this.applicationErrorHandler(n);
                }
              });
          }
        }));
    }
    ngOnDestroy() {
      this._onMicrotaskEmptySubscription?.unsubscribe();
    }
    static ɵfac = function (r) {
      return new (r || e)();
    };
    static ɵprov = y({ token: e, factory: e.ɵfac, providedIn: 'root' });
  }
  return e;
})();
function th({ ngZoneFactory: e, ignoreChangesOutsideZone: t, scheduleInRootZone: n }) {
  return (
    (e ??= () => new Y(j(m({}, nh()), { scheduleInRootZone: n }))),
    [
      { provide: Y, useFactory: e },
      {
        provide: tt,
        multi: !0,
        useFactory: () => {
          let r = h(dE, { optional: !0 });
          return () => r.initialize();
        }
      },
      {
        provide: tt,
        multi: !0,
        useFactory: () => {
          let r = h(fE);
          return () => {
            r.initialize();
          };
        }
      },
      t === !0 ? { provide: uc, useValue: !0 } : [],
      { provide: vi, useValue: n ?? hp },
      {
        provide: Ie,
        useFactory: () => {
          let r = h(Y),
            o = h(oe),
            i;
          return (s) => {
            r.runOutsideAngular(() => {
              o.destroyed && !i
                ? setTimeout(() => {
                    throw s;
                  })
                : ((i ??= o.get($e)), i.handleError(s));
            });
          };
        }
      }
    ]
  );
}
function nh(e) {
  return {
    enableLongStackTrace: !1,
    shouldCoalesceEventChangeDetection: e?.eventCoalescing ?? !1,
    shouldCoalesceRunChangeDetection: e?.runCoalescing ?? !1
  };
}
var fE = (() => {
  class e {
    subscription = new $();
    initialized = !1;
    zone = h(Y);
    pendingTasks = h(it);
    initialize() {
      if (this.initialized) return;
      this.initialized = !0;
      let n = null;
      (!this.zone.isStable &&
        !this.zone.hasPendingMacrotasks &&
        !this.zone.hasPendingMicrotasks &&
        (n = this.pendingTasks.add()),
        this.zone.runOutsideAngular(() => {
          this.subscription.add(
            this.zone.onStable.subscribe(() => {
              (Y.assertNotInAngularZone(),
                queueMicrotask(() => {
                  n !== null &&
                    !this.zone.hasPendingMacrotasks &&
                    !this.zone.hasPendingMicrotasks &&
                    (this.pendingTasks.remove(n), (n = null));
                }));
            })
          );
        }),
        this.subscription.add(
          this.zone.onUnstable.subscribe(() => {
            (Y.assertInAngularZone(), (n ??= this.pendingTasks.add()));
          })
        ));
    }
    ngOnDestroy() {
      this.subscription.unsubscribe();
    }
    static ɵfac = function (r) {
      return new (r || e)();
    };
    static ɵprov = y({ token: e, factory: e.ɵfac, providedIn: 'root' });
  }
  return e;
})();
var Eu = (() => {
  class e {
    applicationErrorHandler = h(Ie);
    appRef = h(on);
    taskService = h(it);
    ngZone = h(Y);
    zonelessEnabled = h(Mr);
    tracing = h(jr, { optional: !0 });
    disableScheduling = h(uc, { optional: !0 }) ?? !1;
    zoneIsDefined = typeof Zone < 'u' && !!Zone.root.run;
    schedulerTickApplyArgs = [{ data: { __scheduler_tick__: !0 } }];
    subscriptions = new $();
    angularZoneId = this.zoneIsDefined ? this.ngZone._inner?.get(Mi) : null;
    scheduleInRootZone = !this.zonelessEnabled && this.zoneIsDefined && (h(vi, { optional: !0 }) ?? !1);
    cancelScheduledCallback = null;
    useMicrotaskScheduler = !1;
    runningTick = !1;
    pendingRenderTaskId = null;
    constructor() {
      (this.subscriptions.add(
        this.appRef.afterTick.subscribe(() => {
          this.runningTick || this.cleanup();
        })
      ),
        this.subscriptions.add(
          this.ngZone.onUnstable.subscribe(() => {
            this.runningTick || this.cleanup();
          })
        ),
        (this.disableScheduling ||= !this.zonelessEnabled && (this.ngZone instanceof Or || !this.zoneIsDefined)));
    }
    notify(n) {
      if (!this.zonelessEnabled && n === 5) return;
      let r = !1;
      switch (n) {
        case 0: {
          this.appRef.dirtyFlags |= 2;
          break;
        }
        case 3:
        case 2:
        case 4:
        case 5:
        case 1: {
          this.appRef.dirtyFlags |= 4;
          break;
        }
        case 6: {
          ((this.appRef.dirtyFlags |= 2), (r = !0));
          break;
        }
        case 12: {
          ((this.appRef.dirtyFlags |= 16), (r = !0));
          break;
        }
        case 13: {
          ((this.appRef.dirtyFlags |= 2), (r = !0));
          break;
        }
        case 11: {
          r = !0;
          break;
        }
        case 9:
        case 8:
        case 7:
        case 10:
        default:
          this.appRef.dirtyFlags |= 8;
      }
      if (
        ((this.appRef.tracingSnapshot = this.tracing?.snapshot(this.appRef.tracingSnapshot) ?? null),
        !this.shouldScheduleTick(r))
      )
        return;
      let o = this.useMicrotaskScheduler ? sf : gp;
      ((this.pendingRenderTaskId = this.taskService.add()),
        this.scheduleInRootZone
          ? (this.cancelScheduledCallback = Zone.root.run(() => o(() => this.tick())))
          : (this.cancelScheduledCallback = this.ngZone.runOutsideAngular(() => o(() => this.tick()))));
    }
    shouldScheduleTick(n) {
      return !(
        (this.disableScheduling && !n) ||
        this.appRef.destroyed ||
        this.pendingRenderTaskId !== null ||
        this.runningTick ||
        this.appRef._runningTick ||
        (!this.zonelessEnabled && this.zoneIsDefined && Zone.current.get(Mi + this.angularZoneId))
      );
    }
    tick() {
      if (this.runningTick || this.appRef.destroyed) return;
      if (this.appRef.dirtyFlags === 0) {
        this.cleanup();
        return;
      }
      !this.zonelessEnabled && this.appRef.dirtyFlags & 7 && (this.appRef.dirtyFlags |= 1);
      let n = this.taskService.add();
      try {
        this.ngZone.run(
          () => {
            ((this.runningTick = !0), this.appRef._tick());
          },
          void 0,
          this.schedulerTickApplyArgs
        );
      } catch (r) {
        (this.taskService.remove(n), this.applicationErrorHandler(r));
      } finally {
        this.cleanup();
      }
      ((this.useMicrotaskScheduler = !0),
        sf(() => {
          ((this.useMicrotaskScheduler = !1), this.taskService.remove(n));
        }));
    }
    ngOnDestroy() {
      (this.subscriptions.unsubscribe(), this.cleanup());
    }
    cleanup() {
      if (
        ((this.runningTick = !1),
        this.cancelScheduledCallback?.(),
        (this.cancelScheduledCallback = null),
        this.pendingRenderTaskId !== null)
      ) {
        let n = this.pendingRenderTaskId;
        ((this.pendingRenderTaskId = null), this.taskService.remove(n));
      }
    }
    static ɵfac = function (r) {
      return new (r || e)();
    };
    static ɵprov = y({ token: e, factory: e.ɵfac, providedIn: 'root' });
  }
  return e;
})();
function Cu() {
  return (
    Br('NgZoneless'),
    $t([
      { provide: Ct, useExisting: Eu },
      { provide: Y, useClass: Or },
      { provide: Mr, useValue: !0 },
      { provide: vi, useValue: !1 },
      []
    ])
  );
}
function pE() {
  return (typeof $localize < 'u' && $localize.locale) || $r;
}
var Gr = new D('', { providedIn: 'root', factory: () => h(Gr, { optional: !0, skipSelf: !0 }) || pE() });
function ct(e) {
  return cd(e);
}
function qr(e, t) {
  return Ao(e, t?.equal);
}
var rh = class {
  [ce];
  constructor(t) {
    this[ce] = t;
  }
  destroy() {
    this[ce].destroy();
  }
};
var sh = Symbol('InputSignalNode#UNSET'),
  AE = j(m({}, Ro), {
    transformFn: void 0,
    applyValueToInputSignal(e, t) {
      hn(e, t);
    }
  });
function ah(e, t) {
  let n = Object.create(AE);
  ((n.value = e), (n.transformFn = t?.transform));
  function r() {
    if ((dn(n), n.value === sh)) {
      let o = null;
      throw new v(-950, o);
    }
    return n.value;
  }
  return ((r[ce] = n), r);
}
var RE = new D('');
RE.__NG_ELEMENT_ID__ = (e) => {
  let t = Fe();
  if (t === null) throw new v(204, !1);
  if (t.type & 2) return t.value;
  if (e & 8) return null;
  throw new v(204, !1);
};
function oh(e, t) {
  return ah(e, t);
}
function xE(e) {
  return ah(sh, e);
}
var ch = ((oh.required = xE), oh);
var Iu = new D(''),
  OE = new D('');
function Wr(e) {
  return !e.moduleRef;
}
function kE(e) {
  let t = Wr(e) ? e.r3Injector : e.moduleRef.injector,
    n = t.get(Y);
  return n.run(() => {
    Wr(e) ? e.r3Injector.resolveInjectorInitializers() : e.moduleRef.resolveInjectorInitializers();
    let r = t.get(Ie),
      o;
    if (
      (n.runOutsideAngular(() => {
        o = n.onError.subscribe({ next: r });
      }),
      Wr(e))
    ) {
      let i = () => t.destroy(),
        s = e.platformInjector.get(Iu);
      (s.add(i),
        t.onDestroy(() => {
          (o.unsubscribe(), s.delete(i));
        }));
    } else {
      let i = () => e.moduleRef.destroy(),
        s = e.platformInjector.get(Iu);
      (s.add(i),
        e.moduleRef.onDestroy(() => {
          (Rr(e.allPlatformModules, e.moduleRef), o.unsubscribe(), s.delete(i));
        }));
    }
    return FE(r, n, () => {
      let i = t.get(it),
        s = i.add(),
        a = t.get(fu);
      return (
        a.runInitializers(),
        a.donePromise
          .then(() => {
            let c = t.get(Gr, $r);
            if ((Jp(c || $r), !t.get(OE, !0)))
              return Wr(e) ? t.get(on) : (e.allPlatformModules.push(e.moduleRef), e.moduleRef);
            if (Wr(e)) {
              let l = t.get(on);
              return (e.rootComponent !== void 0 && l.bootstrap(e.rootComponent), l);
            } else return (PE?.(e.moduleRef, e.allPlatformModules), e.moduleRef);
          })
          .finally(() => void i.remove(s))
      );
    });
  });
}
var PE;
function FE(e, t, n) {
  try {
    let r = n();
    return zn(r)
      ? r.catch((o) => {
          throw (t.runOutsideAngular(() => e(o)), o);
        })
      : r;
  } catch (r) {
    throw (t.runOutsideAngular(() => e(r)), r);
  }
}
var os = null;
function LE(e = [], t) {
  return Oe.create({
    name: t,
    providers: [{ provide: Er, useValue: 'platform' }, { provide: Iu, useValue: new Set([() => (os = null)]) }, ...e]
  });
}
function jE(e = []) {
  if (os) return os;
  let t = LE(e);
  return ((os = t), Yp(), BE(t), t);
}
function BE(e) {
  let t = e.get(zi, null);
  le(e, () => {
    t?.forEach((n) => n());
  });
}
function uh() {
  return !1;
}
var bu = (() => {
  class e {
    static __NG_ELEMENT_ID__ = VE;
  }
  return e;
})();
function VE(e) {
  return HE(Fe(), H(), (e & 16) === 16);
}
function HE(e, t, n) {
  if (Zt(e) && !n) {
    let r = ze(e.index, t);
    return new Jt(r, r);
  } else if (e.type & 175) {
    let r = t[Ee];
    return new Jt(r, t);
  }
  return null;
}
function lh(e) {
  let { rootComponent: t, appProviders: n, platformProviders: r, platformRef: o } = e;
  B(8);
  try {
    let i = o?.injector ?? jE(r),
      s = [th({}), { provide: Ct, useExisting: Eu }, Zd, ...(n || [])],
      a = new Fr({ providers: s, parent: i, debugName: '', runEnvironmentInitializers: !1 });
    return kE({ r3Injector: a.injector, platformInjector: i, rootComponent: t });
  } catch (i) {
    return Promise.reject(i);
  } finally {
    B(9);
  }
}
var ph = null;
function ut() {
  return ph;
}
function Su(e) {
  ph ??= e;
}
var Zr = class {},
  _u = (() => {
    class e {
      historyGo(n) {
        throw new Error('');
      }
      static ɵfac = function (r) {
        return new (r || e)();
      };
      static ɵprov = y({ token: e, factory: () => h(hh), providedIn: 'platform' });
    }
    return e;
  })();
var hh = (() => {
  class e extends _u {
    _location;
    _history;
    _doc = h(ne);
    constructor() {
      (super(), (this._location = window.location), (this._history = window.history));
    }
    getBaseHrefFromDOM() {
      return ut().getBaseHref(this._doc);
    }
    onPopState(n) {
      let r = ut().getGlobalEventTarget(this._doc, 'window');
      return (r.addEventListener('popstate', n, !1), () => r.removeEventListener('popstate', n));
    }
    onHashChange(n) {
      let r = ut().getGlobalEventTarget(this._doc, 'window');
      return (r.addEventListener('hashchange', n, !1), () => r.removeEventListener('hashchange', n));
    }
    get href() {
      return this._location.href;
    }
    get protocol() {
      return this._location.protocol;
    }
    get hostname() {
      return this._location.hostname;
    }
    get port() {
      return this._location.port;
    }
    get pathname() {
      return this._location.pathname;
    }
    get search() {
      return this._location.search;
    }
    get hash() {
      return this._location.hash;
    }
    set pathname(n) {
      this._location.pathname = n;
    }
    pushState(n, r, o) {
      this._history.pushState(n, r, o);
    }
    replaceState(n, r, o) {
      this._history.replaceState(n, r, o);
    }
    forward() {
      this._history.forward();
    }
    back() {
      this._history.back();
    }
    historyGo(n = 0) {
      this._history.go(n);
    }
    getState() {
      return this._history.state;
    }
    static ɵfac = function (r) {
      return new (r || e)();
    };
    static ɵprov = y({ token: e, factory: () => new e(), providedIn: 'platform' });
  }
  return e;
})();
function gh(e, t) {
  return e
    ? t
      ? e.endsWith('/')
        ? t.startsWith('/')
          ? e + t.slice(1)
          : e + t
        : t.startsWith('/')
          ? e + t
          : `${e}/${t}`
      : e
    : t;
}
function dh(e) {
  let t = e.search(/#|\?|$/);
  return e[t - 1] === '/' ? e.slice(0, t - 1) + e.slice(t) : e;
}
function At(e) {
  return e && e[0] !== '?' ? `?${e}` : e;
}
var is = (() => {
    class e {
      historyGo(n) {
        throw new Error('');
      }
      static ɵfac = function (r) {
        return new (r || e)();
      };
      static ɵprov = y({ token: e, factory: () => h(vh), providedIn: 'root' });
    }
    return e;
  })(),
  mh = new D(''),
  vh = (() => {
    class e extends is {
      _platformLocation;
      _baseHref;
      _removeListenerFns = [];
      constructor(n, r) {
        (super(),
          (this._platformLocation = n),
          (this._baseHref = r ?? this._platformLocation.getBaseHrefFromDOM() ?? h(ne).location?.origin ?? ''));
      }
      ngOnDestroy() {
        for (; this._removeListenerFns.length; ) this._removeListenerFns.pop()();
      }
      onPopState(n) {
        this._removeListenerFns.push(this._platformLocation.onPopState(n), this._platformLocation.onHashChange(n));
      }
      getBaseHref() {
        return this._baseHref;
      }
      prepareExternalUrl(n) {
        return gh(this._baseHref, n);
      }
      path(n = !1) {
        let r = this._platformLocation.pathname + At(this._platformLocation.search),
          o = this._platformLocation.hash;
        return o && n ? `${r}${o}` : r;
      }
      pushState(n, r, o, i) {
        let s = this.prepareExternalUrl(o + At(i));
        this._platformLocation.pushState(n, r, s);
      }
      replaceState(n, r, o, i) {
        let s = this.prepareExternalUrl(o + At(i));
        this._platformLocation.replaceState(n, r, s);
      }
      forward() {
        this._platformLocation.forward();
      }
      back() {
        this._platformLocation.back();
      }
      getState() {
        return this._platformLocation.getState();
      }
      historyGo(n = 0) {
        this._platformLocation.historyGo?.(n);
      }
      static ɵfac = function (r) {
        return new (r || e)(b(_u), b(mh, 8));
      };
      static ɵprov = y({ token: e, factory: e.ɵfac, providedIn: 'root' });
    }
    return e;
  })(),
  Wn = (() => {
    class e {
      _subject = new q();
      _basePath;
      _locationStrategy;
      _urlChangeListeners = [];
      _urlChangeSubscription = null;
      constructor(n) {
        this._locationStrategy = n;
        let r = this._locationStrategy.getBaseHref();
        ((this._basePath = zE(dh(fh(r)))),
          this._locationStrategy.onPopState((o) => {
            this._subject.next({ url: this.path(!0), pop: !0, state: o.state, type: o.type });
          }));
      }
      ngOnDestroy() {
        (this._urlChangeSubscription?.unsubscribe(), (this._urlChangeListeners = []));
      }
      path(n = !1) {
        return this.normalize(this._locationStrategy.path(n));
      }
      getState() {
        return this._locationStrategy.getState();
      }
      isCurrentPathEqualTo(n, r = '') {
        return this.path() == this.normalize(n + At(r));
      }
      normalize(n) {
        return e.stripTrailingSlash($E(this._basePath, fh(n)));
      }
      prepareExternalUrl(n) {
        return (n && n[0] !== '/' && (n = '/' + n), this._locationStrategy.prepareExternalUrl(n));
      }
      go(n, r = '', o = null) {
        (this._locationStrategy.pushState(o, '', n, r),
          this._notifyUrlChangeListeners(this.prepareExternalUrl(n + At(r)), o));
      }
      replaceState(n, r = '', o = null) {
        (this._locationStrategy.replaceState(o, '', n, r),
          this._notifyUrlChangeListeners(this.prepareExternalUrl(n + At(r)), o));
      }
      forward() {
        this._locationStrategy.forward();
      }
      back() {
        this._locationStrategy.back();
      }
      historyGo(n = 0) {
        this._locationStrategy.historyGo?.(n);
      }
      onUrlChange(n) {
        return (
          this._urlChangeListeners.push(n),
          (this._urlChangeSubscription ??= this.subscribe((r) => {
            this._notifyUrlChangeListeners(r.url, r.state);
          })),
          () => {
            let r = this._urlChangeListeners.indexOf(n);
            (this._urlChangeListeners.splice(r, 1),
              this._urlChangeListeners.length === 0 &&
                (this._urlChangeSubscription?.unsubscribe(), (this._urlChangeSubscription = null)));
          }
        );
      }
      _notifyUrlChangeListeners(n = '', r) {
        this._urlChangeListeners.forEach((o) => o(n, r));
      }
      subscribe(n, r, o) {
        return this._subject.subscribe({ next: n, error: r ?? void 0, complete: o ?? void 0 });
      }
      static normalizeQueryParams = At;
      static joinWithSlash = gh;
      static stripTrailingSlash = dh;
      static ɵfac = function (r) {
        return new (r || e)(b(is));
      };
      static ɵprov = y({ token: e, factory: () => UE(), providedIn: 'root' });
    }
    return e;
  })();
function UE() {
  return new Wn(b(is));
}
function $E(e, t) {
  if (!e || !t.startsWith(e)) return t;
  let n = t.substring(e.length);
  return n === '' || ['/', ';', '?', '#'].includes(n[0]) ? n : t;
}
function fh(e) {
  return e.replace(/\/index.html$/, '');
}
function zE(e) {
  if (new RegExp('^(https?:)?//').test(e)) {
    let [, n] = e.split(/\/\/[^\/]+/);
    return n;
  }
  return e;
}
var ae = (function (e) {
    return ((e[(e.Format = 0)] = 'Format'), (e[(e.Standalone = 1)] = 'Standalone'), e);
  })(ae || {}),
  L = (function (e) {
    return (
      (e[(e.Narrow = 0)] = 'Narrow'),
      (e[(e.Abbreviated = 1)] = 'Abbreviated'),
      (e[(e.Wide = 2)] = 'Wide'),
      (e[(e.Short = 3)] = 'Short'),
      e
    );
  })(L || {}),
  ve = (function (e) {
    return (
      (e[(e.Short = 0)] = 'Short'),
      (e[(e.Medium = 1)] = 'Medium'),
      (e[(e.Long = 2)] = 'Long'),
      (e[(e.Full = 3)] = 'Full'),
      e
    );
  })(ve || {}),
  dt = {
    Decimal: 0,
    Group: 1,
    List: 2,
    PercentSign: 3,
    PlusSign: 4,
    MinusSign: 5,
    Exponential: 6,
    SuperscriptingExponent: 7,
    PerMille: 8,
    Infinity: 9,
    NaN: 10,
    TimeSeparator: 11,
    CurrencyDecimal: 12,
    CurrencyGroup: 13
  };
function Dh(e) {
  return we(e)[U.LocaleId];
}
function Eh(e, t, n) {
  let r = we(e),
    o = [r[U.DayPeriodsFormat], r[U.DayPeriodsStandalone]],
    i = Ae(o, t);
  return Ae(i, n);
}
function Ch(e, t, n) {
  let r = we(e),
    o = [r[U.DaysFormat], r[U.DaysStandalone]],
    i = Ae(o, t);
  return Ae(i, n);
}
function Ih(e, t, n) {
  let r = we(e),
    o = [r[U.MonthsFormat], r[U.MonthsStandalone]],
    i = Ae(o, t);
  return Ae(i, n);
}
function wh(e, t) {
  let r = we(e)[U.Eras];
  return Ae(r, t);
}
function Yr(e, t) {
  let n = we(e);
  return Ae(n[U.DateFormat], t);
}
function Qr(e, t) {
  let n = we(e);
  return Ae(n[U.TimeFormat], t);
}
function Kr(e, t) {
  let r = we(e)[U.DateTimeFormat];
  return Ae(r, t);
}
function Jr(e, t) {
  let n = we(e),
    r = n[U.NumberSymbols][t];
  if (typeof r > 'u') {
    if (t === dt.CurrencyDecimal) return n[U.NumberSymbols][dt.Decimal];
    if (t === dt.CurrencyGroup) return n[U.NumberSymbols][dt.Group];
  }
  return r;
}
function bh(e) {
  if (!e[U.ExtraData]) throw new v(2303, !1);
}
function Sh(e) {
  let t = we(e);
  return (bh(t), (t[U.ExtraData][2] || []).map((r) => (typeof r == 'string' ? Tu(r) : [Tu(r[0]), Tu(r[1])])));
}
function _h(e, t, n) {
  let r = we(e);
  bh(r);
  let o = [r[U.ExtraData][0], r[U.ExtraData][1]],
    i = Ae(o, t) || [];
  return Ae(i, n) || [];
}
function Ae(e, t) {
  for (let n = t; n > -1; n--) if (typeof e[n] < 'u') return e[n];
  throw new v(2304, !1);
}
function Tu(e) {
  let [t, n] = e.split(':');
  return { hours: +t, minutes: +n };
}
var GE = /^(\d{4,})-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|([+-])(\d\d):?(\d\d))?)?$/,
  ss = {},
  qE =
    /((?:[^BEGHLMOSWYZabcdhmswyz']+)|(?:'(?:[^']|'')*')|(?:G{1,5}|y{1,4}|Y{1,4}|M{1,5}|L{1,5}|w{1,2}|W{1}|d{1,2}|E{1,6}|c{1,6}|a{1,5}|b{1,5}|B{1,5}|h{1,2}|H{1,2}|m{1,2}|s{1,2}|S{1,3}|z{1,4}|Z{1,5}|O{1,4}))([\s\S]*)/;
function Th(e, t, n, r) {
  let o = tC(e);
  t = lt(n, t) || t;
  let s = [],
    a;
  for (; t; )
    if (((a = qE.exec(t)), a)) {
      s = s.concat(a.slice(1));
      let l = s.pop();
      if (!l) break;
      t = l;
    } else {
      s.push(t);
      break;
    }
  let c = o.getTimezoneOffset();
  r && ((c = Nh(r, c)), (o = eC(o, r)));
  let u = '';
  return (
    s.forEach((l) => {
      let d = JE(l);
      u += d ? d(o, n, c) : l === "''" ? "'" : l.replace(/(^'|'$)/g, '').replace(/''/g, "'");
    }),
    u
  );
}
function ds(e, t, n) {
  let r = new Date(0);
  return (r.setFullYear(e, t, n), r.setHours(0, 0, 0), r);
}
function lt(e, t) {
  let n = Dh(e);
  if (((ss[n] ??= {}), ss[n][t])) return ss[n][t];
  let r = '';
  switch (t) {
    case 'shortDate':
      r = Yr(e, ve.Short);
      break;
    case 'mediumDate':
      r = Yr(e, ve.Medium);
      break;
    case 'longDate':
      r = Yr(e, ve.Long);
      break;
    case 'fullDate':
      r = Yr(e, ve.Full);
      break;
    case 'shortTime':
      r = Qr(e, ve.Short);
      break;
    case 'mediumTime':
      r = Qr(e, ve.Medium);
      break;
    case 'longTime':
      r = Qr(e, ve.Long);
      break;
    case 'fullTime':
      r = Qr(e, ve.Full);
      break;
    case 'short':
      let o = lt(e, 'shortTime'),
        i = lt(e, 'shortDate');
      r = as(Kr(e, ve.Short), [o, i]);
      break;
    case 'medium':
      let s = lt(e, 'mediumTime'),
        a = lt(e, 'mediumDate');
      r = as(Kr(e, ve.Medium), [s, a]);
      break;
    case 'long':
      let c = lt(e, 'longTime'),
        u = lt(e, 'longDate');
      r = as(Kr(e, ve.Long), [c, u]);
      break;
    case 'full':
      let l = lt(e, 'fullTime'),
        d = lt(e, 'fullDate');
      r = as(Kr(e, ve.Full), [l, d]);
      break;
  }
  return (r && (ss[n][t] = r), r);
}
function as(e, t) {
  return (
    t &&
      (e = e.replace(/\{([^}]+)}/g, function (n, r) {
        return t != null && r in t ? t[r] : n;
      })),
    e
  );
}
function Ve(e, t, n = '-', r, o) {
  let i = '';
  (e < 0 || (o && e <= 0)) && (o ? (e = -e + 1) : ((e = -e), (i = n)));
  let s = String(e);
  for (; s.length < t; ) s = '0' + s;
  return (r && (s = s.slice(s.length - t)), i + s);
}
function WE(e, t) {
  return Ve(e, 3).substring(0, t);
}
function G(e, t, n = 0, r = !1, o = !1) {
  return function (i, s) {
    let a = ZE(e, i);
    if (((n > 0 || a > -n) && (a += n), e === 3)) a === 0 && n === -12 && (a = 12);
    else if (e === 6) return WE(a, t);
    let c = Jr(s, dt.MinusSign);
    return Ve(a, t, c, r, o);
  };
}
function ZE(e, t) {
  switch (e) {
    case 0:
      return t.getFullYear();
    case 1:
      return t.getMonth();
    case 2:
      return t.getDate();
    case 3:
      return t.getHours();
    case 4:
      return t.getMinutes();
    case 5:
      return t.getSeconds();
    case 6:
      return t.getMilliseconds();
    case 7:
      return t.getDay();
    default:
      throw new v(2301, !1);
  }
}
function V(e, t, n = ae.Format, r = !1) {
  return function (o, i) {
    return YE(o, i, e, t, n, r);
  };
}
function YE(e, t, n, r, o, i) {
  switch (n) {
    case 2:
      return Ih(t, o, r)[e.getMonth()];
    case 1:
      return Ch(t, o, r)[e.getDay()];
    case 0:
      let s = e.getHours(),
        a = e.getMinutes();
      if (i) {
        let u = Sh(t),
          l = _h(t, o, r),
          d = u.findIndex((p) => {
            if (Array.isArray(p)) {
              let [f, g] = p,
                E = s >= f.hours && a >= f.minutes,
                M = s < g.hours || (s === g.hours && a < g.minutes);
              if (f.hours < g.hours) {
                if (E && M) return !0;
              } else if (E || M) return !0;
            } else if (p.hours === s && p.minutes === a) return !0;
            return !1;
          });
        if (d !== -1) return l[d];
      }
      return Eh(t, o, r)[s < 12 ? 0 : 1];
    case 3:
      return wh(t, r)[e.getFullYear() <= 0 ? 0 : 1];
    default:
      let c = n;
      throw new v(2302, !1);
  }
}
function cs(e) {
  return function (t, n, r) {
    let o = -1 * r,
      i = Jr(n, dt.MinusSign),
      s = o > 0 ? Math.floor(o / 60) : Math.ceil(o / 60);
    switch (e) {
      case 0:
        return (o >= 0 ? '+' : '') + Ve(s, 2, i) + Ve(Math.abs(o % 60), 2, i);
      case 1:
        return 'GMT' + (o >= 0 ? '+' : '') + Ve(s, 1, i);
      case 2:
        return 'GMT' + (o >= 0 ? '+' : '') + Ve(s, 2, i) + ':' + Ve(Math.abs(o % 60), 2, i);
      case 3:
        return r === 0 ? 'Z' : (o >= 0 ? '+' : '') + Ve(s, 2, i) + ':' + Ve(Math.abs(o % 60), 2, i);
      default:
        throw new v(2310, !1);
    }
  };
}
var QE = 0,
  ls = 4;
function KE(e) {
  let t = ds(e, QE, 1).getDay();
  return ds(e, 0, 1 + (t <= ls ? ls : ls + 7) - t);
}
function Mh(e) {
  let t = e.getDay(),
    n = t === 0 ? -3 : ls - t;
  return ds(e.getFullYear(), e.getMonth(), e.getDate() + n);
}
function Mu(e, t = !1) {
  return function (n, r) {
    let o;
    if (t) {
      let i = new Date(n.getFullYear(), n.getMonth(), 1).getDay() - 1,
        s = n.getDate();
      o = 1 + Math.floor((s + i) / 7);
    } else {
      let i = Mh(n),
        s = KE(i.getFullYear()),
        a = i.getTime() - s.getTime();
      o = 1 + Math.round(a / 6048e5);
    }
    return Ve(o, e, Jr(r, dt.MinusSign));
  };
}
function us(e, t = !1) {
  return function (n, r) {
    let i = Mh(n).getFullYear();
    return Ve(i, e, Jr(r, dt.MinusSign), t);
  };
}
var Nu = {};
function JE(e) {
  if (Nu[e]) return Nu[e];
  let t;
  switch (e) {
    case 'G':
    case 'GG':
    case 'GGG':
      t = V(3, L.Abbreviated);
      break;
    case 'GGGG':
      t = V(3, L.Wide);
      break;
    case 'GGGGG':
      t = V(3, L.Narrow);
      break;
    case 'y':
      t = G(0, 1, 0, !1, !0);
      break;
    case 'yy':
      t = G(0, 2, 0, !0, !0);
      break;
    case 'yyy':
      t = G(0, 3, 0, !1, !0);
      break;
    case 'yyyy':
      t = G(0, 4, 0, !1, !0);
      break;
    case 'Y':
      t = us(1);
      break;
    case 'YY':
      t = us(2, !0);
      break;
    case 'YYY':
      t = us(3);
      break;
    case 'YYYY':
      t = us(4);
      break;
    case 'M':
    case 'L':
      t = G(1, 1, 1);
      break;
    case 'MM':
    case 'LL':
      t = G(1, 2, 1);
      break;
    case 'MMM':
      t = V(2, L.Abbreviated);
      break;
    case 'MMMM':
      t = V(2, L.Wide);
      break;
    case 'MMMMM':
      t = V(2, L.Narrow);
      break;
    case 'LLL':
      t = V(2, L.Abbreviated, ae.Standalone);
      break;
    case 'LLLL':
      t = V(2, L.Wide, ae.Standalone);
      break;
    case 'LLLLL':
      t = V(2, L.Narrow, ae.Standalone);
      break;
    case 'w':
      t = Mu(1);
      break;
    case 'ww':
      t = Mu(2);
      break;
    case 'W':
      t = Mu(1, !0);
      break;
    case 'd':
      t = G(2, 1);
      break;
    case 'dd':
      t = G(2, 2);
      break;
    case 'c':
    case 'cc':
      t = G(7, 1);
      break;
    case 'ccc':
      t = V(1, L.Abbreviated, ae.Standalone);
      break;
    case 'cccc':
      t = V(1, L.Wide, ae.Standalone);
      break;
    case 'ccccc':
      t = V(1, L.Narrow, ae.Standalone);
      break;
    case 'cccccc':
      t = V(1, L.Short, ae.Standalone);
      break;
    case 'E':
    case 'EE':
    case 'EEE':
      t = V(1, L.Abbreviated);
      break;
    case 'EEEE':
      t = V(1, L.Wide);
      break;
    case 'EEEEE':
      t = V(1, L.Narrow);
      break;
    case 'EEEEEE':
      t = V(1, L.Short);
      break;
    case 'a':
    case 'aa':
    case 'aaa':
      t = V(0, L.Abbreviated);
      break;
    case 'aaaa':
      t = V(0, L.Wide);
      break;
    case 'aaaaa':
      t = V(0, L.Narrow);
      break;
    case 'b':
    case 'bb':
    case 'bbb':
      t = V(0, L.Abbreviated, ae.Standalone, !0);
      break;
    case 'bbbb':
      t = V(0, L.Wide, ae.Standalone, !0);
      break;
    case 'bbbbb':
      t = V(0, L.Narrow, ae.Standalone, !0);
      break;
    case 'B':
    case 'BB':
    case 'BBB':
      t = V(0, L.Abbreviated, ae.Format, !0);
      break;
    case 'BBBB':
      t = V(0, L.Wide, ae.Format, !0);
      break;
    case 'BBBBB':
      t = V(0, L.Narrow, ae.Format, !0);
      break;
    case 'h':
      t = G(3, 1, -12);
      break;
    case 'hh':
      t = G(3, 2, -12);
      break;
    case 'H':
      t = G(3, 1);
      break;
    case 'HH':
      t = G(3, 2);
      break;
    case 'm':
      t = G(4, 1);
      break;
    case 'mm':
      t = G(4, 2);
      break;
    case 's':
      t = G(5, 1);
      break;
    case 'ss':
      t = G(5, 2);
      break;
    case 'S':
      t = G(6, 1);
      break;
    case 'SS':
      t = G(6, 2);
      break;
    case 'SSS':
      t = G(6, 3);
      break;
    case 'Z':
    case 'ZZ':
    case 'ZZZ':
      t = cs(0);
      break;
    case 'ZZZZZ':
      t = cs(3);
      break;
    case 'O':
    case 'OO':
    case 'OOO':
    case 'z':
    case 'zz':
    case 'zzz':
      t = cs(1);
      break;
    case 'OOOO':
    case 'ZZZZ':
    case 'zzzz':
      t = cs(2);
      break;
    default:
      return null;
  }
  return ((Nu[e] = t), t);
}
function Nh(e, t) {
  e = e.replace(/:/g, '');
  let n = Date.parse('Jan 01, 1970 00:00:00 ' + e) / 6e4;
  return isNaN(n) ? t : n;
}
function XE(e, t) {
  return ((e = new Date(e.getTime())), e.setMinutes(e.getMinutes() + t), e);
}
function eC(e, t, n) {
  let o = e.getTimezoneOffset(),
    i = Nh(t, o);
  return XE(e, -1 * (i - o));
}
function tC(e) {
  if (yh(e)) return e;
  if (typeof e == 'number' && !isNaN(e)) return new Date(e);
  if (typeof e == 'string') {
    if (((e = e.trim()), /^(\d{4}(-\d{1,2}(-\d{1,2})?)?)$/.test(e))) {
      let [o, i = 1, s = 1] = e.split('-').map((a) => +a);
      return ds(o, i - 1, s);
    }
    let n = parseFloat(e);
    if (!isNaN(e - n)) return new Date(n);
    let r;
    if ((r = e.match(GE))) return nC(r);
  }
  let t = new Date(e);
  if (!yh(t)) throw new v(2311, !1);
  return t;
}
function nC(e) {
  let t = new Date(0),
    n = 0,
    r = 0,
    o = e[8] ? t.setUTCFullYear : t.setFullYear,
    i = e[8] ? t.setUTCHours : t.setHours;
  (e[9] && ((n = Number(e[9] + e[10])), (r = Number(e[9] + e[11]))),
    o.call(t, Number(e[1]), Number(e[2]) - 1, Number(e[3])));
  let s = Number(e[4] || 0) - n,
    a = Number(e[5] || 0) - r,
    c = Number(e[6] || 0),
    u = Math.floor(parseFloat('0.' + (e[7] || 0)) * 1e3);
  return (i.call(t, s, a, c, u), t);
}
function yh(e) {
  return e instanceof Date && !isNaN(e.valueOf());
}
function rC(e, t) {
  return new v(2100, !1);
}
var oC = 'mediumDate',
  Ah = new D(''),
  Rh = new D(''),
  Au = (() => {
    class e {
      locale;
      defaultTimezone;
      defaultOptions;
      constructor(n, r, o) {
        ((this.locale = n), (this.defaultTimezone = r), (this.defaultOptions = o));
      }
      transform(n, r, o, i) {
        if (n == null || n === '' || n !== n) return null;
        try {
          let s = r ?? this.defaultOptions?.dateFormat ?? oC,
            a = o ?? this.defaultOptions?.timezone ?? this.defaultTimezone ?? void 0;
          return Th(n, s, i || this.locale, a);
        } catch (s) {
          throw rC(e, s.message);
        }
      }
      static ɵfac = function (r) {
        return new (r || e)(nn(Gr, 16), nn(Ah, 24), nn(Rh, 24));
      };
      static ɵpipe = Xi({ name: 'date', type: e, pure: !0 });
    }
    return e;
  })();
var Ru = (() => {
  class e {
    transform(n) {
      return JSON.stringify(n, null, 2);
    }
    static ɵfac = function (r) {
      return new (r || e)();
    };
    static ɵpipe = Xi({ name: 'json', type: e, pure: !1 });
  }
  return e;
})();
function xu(e, t) {
  t = encodeURIComponent(t);
  for (let n of e.split(';')) {
    let r = n.indexOf('='),
      [o, i] = r == -1 ? [n, ''] : [n.slice(0, r), n.slice(r + 1)];
    if (o.trim() === t) return decodeURIComponent(i);
  }
  return null;
}
var Xr = class {};
var xh = 'browser';
var eo = class {
    _doc;
    constructor(t) {
      this._doc = t;
    }
    manager;
  },
  fs = (() => {
    class e extends eo {
      constructor(n) {
        super(n);
      }
      supports(n) {
        return !0;
      }
      addEventListener(n, r, o, i) {
        return (n.addEventListener(r, o, i), () => this.removeEventListener(n, r, o, i));
      }
      removeEventListener(n, r, o, i) {
        return n.removeEventListener(r, o, i);
      }
      static ɵfac = function (r) {
        return new (r || e)(b(ne));
      };
      static ɵprov = y({ token: e, factory: e.ɵfac });
    }
    return e;
  })(),
  hs = new D(''),
  Lu = (() => {
    class e {
      _zone;
      _plugins;
      _eventNameToPlugin = new Map();
      constructor(n, r) {
        ((this._zone = r),
          n.forEach((s) => {
            s.manager = this;
          }));
        let o = n.filter((s) => !(s instanceof fs));
        this._plugins = o.slice().reverse();
        let i = n.find((s) => s instanceof fs);
        i && this._plugins.push(i);
      }
      addEventListener(n, r, o, i) {
        return this._findPluginFor(r).addEventListener(n, r, o, i);
      }
      getZone() {
        return this._zone;
      }
      _findPluginFor(n) {
        let r = this._eventNameToPlugin.get(n);
        if (r) return r;
        if (((r = this._plugins.find((i) => i.supports(n))), !r)) throw new v(5101, !1);
        return (this._eventNameToPlugin.set(n, r), r);
      }
      static ɵfac = function (r) {
        return new (r || e)(b(hs), b(Y));
      };
      static ɵprov = y({ token: e, factory: e.ɵfac });
    }
    return e;
  })(),
  Ou = 'ng-app-id';
function Oh(e) {
  for (let t of e) t.remove();
}
function kh(e, t) {
  let n = t.createElement('style');
  return ((n.textContent = e), n);
}
function aC(e, t, n, r) {
  let o = e.head?.querySelectorAll(`style[${Ou}="${t}"],link[${Ou}="${t}"]`);
  if (o)
    for (let i of o)
      (i.removeAttribute(Ou),
        i instanceof HTMLLinkElement
          ? r.set(i.href.slice(i.href.lastIndexOf('/') + 1), { usage: 0, elements: [i] })
          : i.textContent && n.set(i.textContent, { usage: 0, elements: [i] }));
}
function Pu(e, t) {
  let n = t.createElement('link');
  return (n.setAttribute('rel', 'stylesheet'), n.setAttribute('href', e), n);
}
var ju = (() => {
    class e {
      doc;
      appId;
      nonce;
      inline = new Map();
      external = new Map();
      hosts = new Set();
      constructor(n, r, o, i = {}) {
        ((this.doc = n),
          (this.appId = r),
          (this.nonce = o),
          aC(n, r, this.inline, this.external),
          this.hosts.add(n.head));
      }
      addStyles(n, r) {
        for (let o of n) this.addUsage(o, this.inline, kh);
        r?.forEach((o) => this.addUsage(o, this.external, Pu));
      }
      removeStyles(n, r) {
        for (let o of n) this.removeUsage(o, this.inline);
        r?.forEach((o) => this.removeUsage(o, this.external));
      }
      addUsage(n, r, o) {
        let i = r.get(n);
        i
          ? i.usage++
          : r.set(n, { usage: 1, elements: [...this.hosts].map((s) => this.addElement(s, o(n, this.doc))) });
      }
      removeUsage(n, r) {
        let o = r.get(n);
        o && (o.usage--, o.usage <= 0 && (Oh(o.elements), r.delete(n)));
      }
      ngOnDestroy() {
        for (let [, { elements: n }] of [...this.inline, ...this.external]) Oh(n);
        this.hosts.clear();
      }
      addHost(n) {
        this.hosts.add(n);
        for (let [r, { elements: o }] of this.inline) o.push(this.addElement(n, kh(r, this.doc)));
        for (let [r, { elements: o }] of this.external) o.push(this.addElement(n, Pu(r, this.doc)));
      }
      removeHost(n) {
        this.hosts.delete(n);
      }
      addElement(n, r) {
        return (this.nonce && r.setAttribute('nonce', this.nonce), n.appendChild(r));
      }
      static ɵfac = function (r) {
        return new (r || e)(b(ne), b($i), b(Gi, 8), b($n));
      };
      static ɵprov = y({ token: e, factory: e.ɵfac });
    }
    return e;
  })(),
  ku = {
    svg: 'http://www.w3.org/2000/svg',
    xhtml: 'http://www.w3.org/1999/xhtml',
    xlink: 'http://www.w3.org/1999/xlink',
    xml: 'http://www.w3.org/XML/1998/namespace',
    xmlns: 'http://www.w3.org/2000/xmlns/',
    math: 'http://www.w3.org/1998/Math/MathML'
  },
  Bu = /%COMP%/g;
var Fh = '%COMP%',
  cC = `_nghost-${Fh}`,
  uC = `_ngcontent-${Fh}`,
  lC = !0,
  dC = new D('', { providedIn: 'root', factory: () => lC });
function fC(e) {
  return uC.replace(Bu, e);
}
function pC(e) {
  return cC.replace(Bu, e);
}
function Lh(e, t) {
  return t.map((n) => n.replace(Bu, e));
}
var Vu = (() => {
    class e {
      eventManager;
      sharedStylesHost;
      appId;
      removeStylesOnCompDestroy;
      doc;
      platformId;
      ngZone;
      nonce;
      tracingService;
      rendererByCompId = new Map();
      defaultRenderer;
      platformIsServer;
      constructor(n, r, o, i, s, a, c, u = null, l = null) {
        ((this.eventManager = n),
          (this.sharedStylesHost = r),
          (this.appId = o),
          (this.removeStylesOnCompDestroy = i),
          (this.doc = s),
          (this.platformId = a),
          (this.ngZone = c),
          (this.nonce = u),
          (this.tracingService = l),
          (this.platformIsServer = !1),
          (this.defaultRenderer = new to(n, s, c, this.platformIsServer, this.tracingService)));
      }
      createRenderer(n, r) {
        if (!n || !r) return this.defaultRenderer;
        let o = this.getOrCreateRenderer(n, r);
        return (o instanceof ps ? o.applyToHost(n) : o instanceof no && o.applyStyles(), o);
      }
      getOrCreateRenderer(n, r) {
        let o = this.rendererByCompId,
          i = o.get(r.id);
        if (!i) {
          let s = this.doc,
            a = this.ngZone,
            c = this.eventManager,
            u = this.sharedStylesHost,
            l = this.removeStylesOnCompDestroy,
            d = this.platformIsServer,
            p = this.tracingService;
          switch (r.encapsulation) {
            case st.Emulated:
              i = new ps(c, u, r, this.appId, l, s, a, d, p);
              break;
            case st.ShadowDom:
              return new Fu(c, u, n, r, s, a, this.nonce, d, p);
            default:
              i = new no(c, u, r, l, s, a, d, p);
              break;
          }
          o.set(r.id, i);
        }
        return i;
      }
      ngOnDestroy() {
        this.rendererByCompId.clear();
      }
      componentReplaced(n) {
        this.rendererByCompId.delete(n);
      }
      static ɵfac = function (r) {
        return new (r || e)(b(Lu), b(ju), b($i), b(dC), b(ne), b($n), b(Y), b(Gi), b(jr, 8));
      };
      static ɵprov = y({ token: e, factory: e.ɵfac });
    }
    return e;
  })(),
  to = class {
    eventManager;
    doc;
    ngZone;
    platformIsServer;
    tracingService;
    data = Object.create(null);
    throwOnSyntheticProps = !0;
    constructor(t, n, r, o, i) {
      ((this.eventManager = t),
        (this.doc = n),
        (this.ngZone = r),
        (this.platformIsServer = o),
        (this.tracingService = i));
    }
    destroy() {}
    destroyNode = null;
    createElement(t, n) {
      return n ? this.doc.createElementNS(ku[n] || n, t) : this.doc.createElement(t);
    }
    createComment(t) {
      return this.doc.createComment(t);
    }
    createText(t) {
      return this.doc.createTextNode(t);
    }
    appendChild(t, n) {
      (Ph(t) ? t.content : t).appendChild(n);
    }
    insertBefore(t, n, r) {
      t && (Ph(t) ? t.content : t).insertBefore(n, r);
    }
    removeChild(t, n) {
      n.remove();
    }
    selectRootElement(t, n) {
      let r = typeof t == 'string' ? this.doc.querySelector(t) : t;
      if (!r) throw new v(-5104, !1);
      return (n || (r.textContent = ''), r);
    }
    parentNode(t) {
      return t.parentNode;
    }
    nextSibling(t) {
      return t.nextSibling;
    }
    setAttribute(t, n, r, o) {
      if (o) {
        n = o + ':' + n;
        let i = ku[o];
        i ? t.setAttributeNS(i, n, r) : t.setAttribute(n, r);
      } else t.setAttribute(n, r);
    }
    removeAttribute(t, n, r) {
      if (r) {
        let o = ku[r];
        o ? t.removeAttributeNS(o, n) : t.removeAttribute(`${r}:${n}`);
      } else t.removeAttribute(n);
    }
    addClass(t, n) {
      t.classList.add(n);
    }
    removeClass(t, n) {
      t.classList.remove(n);
    }
    setStyle(t, n, r, o) {
      o & (We.DashCase | We.Important)
        ? t.style.setProperty(n, r, o & We.Important ? 'important' : '')
        : (t.style[n] = r);
    }
    removeStyle(t, n, r) {
      r & We.DashCase ? t.style.removeProperty(n) : (t.style[n] = '');
    }
    setProperty(t, n, r) {
      t != null && (t[n] = r);
    }
    setValue(t, n) {
      t.nodeValue = n;
    }
    listen(t, n, r, o) {
      if (typeof t == 'string' && ((t = ut().getGlobalEventTarget(this.doc, t)), !t)) throw new v(5102, !1);
      let i = this.decoratePreventDefault(r);
      return (
        this.tracingService?.wrapEventListener && (i = this.tracingService.wrapEventListener(t, n, i)),
        this.eventManager.addEventListener(t, n, i, o)
      );
    }
    decoratePreventDefault(t) {
      return (n) => {
        if (n === '__ngUnwrap__') return t;
        t(n) === !1 && n.preventDefault();
      };
    }
  };
function Ph(e) {
  return e.tagName === 'TEMPLATE' && e.content !== void 0;
}
var Fu = class extends to {
    sharedStylesHost;
    hostEl;
    shadowRoot;
    constructor(t, n, r, o, i, s, a, c, u) {
      (super(t, i, s, c, u),
        (this.sharedStylesHost = n),
        (this.hostEl = r),
        (this.shadowRoot = r.attachShadow({ mode: 'open' })),
        this.sharedStylesHost.addHost(this.shadowRoot));
      let l = o.styles;
      l = Lh(o.id, l);
      for (let p of l) {
        let f = document.createElement('style');
        (a && f.setAttribute('nonce', a), (f.textContent = p), this.shadowRoot.appendChild(f));
      }
      let d = o.getExternalStyles?.();
      if (d)
        for (let p of d) {
          let f = Pu(p, i);
          (a && f.setAttribute('nonce', a), this.shadowRoot.appendChild(f));
        }
    }
    nodeOrShadowRoot(t) {
      return t === this.hostEl ? this.shadowRoot : t;
    }
    appendChild(t, n) {
      return super.appendChild(this.nodeOrShadowRoot(t), n);
    }
    insertBefore(t, n, r) {
      return super.insertBefore(this.nodeOrShadowRoot(t), n, r);
    }
    removeChild(t, n) {
      return super.removeChild(null, n);
    }
    parentNode(t) {
      return this.nodeOrShadowRoot(super.parentNode(this.nodeOrShadowRoot(t)));
    }
    destroy() {
      this.sharedStylesHost.removeHost(this.shadowRoot);
    }
  },
  no = class extends to {
    sharedStylesHost;
    removeStylesOnCompDestroy;
    styles;
    styleUrls;
    constructor(t, n, r, o, i, s, a, c, u) {
      (super(t, i, s, a, c), (this.sharedStylesHost = n), (this.removeStylesOnCompDestroy = o));
      let l = r.styles;
      ((this.styles = u ? Lh(u, l) : l), (this.styleUrls = r.getExternalStyles?.(u)));
    }
    applyStyles() {
      this.sharedStylesHost.addStyles(this.styles, this.styleUrls);
    }
    destroy() {
      this.removeStylesOnCompDestroy &&
        Bn.size === 0 &&
        this.sharedStylesHost.removeStyles(this.styles, this.styleUrls);
    }
  },
  ps = class extends no {
    contentAttr;
    hostAttr;
    constructor(t, n, r, o, i, s, a, c, u) {
      let l = o + '-' + r.id;
      (super(t, n, r, i, s, a, c, u, l), (this.contentAttr = fC(l)), (this.hostAttr = pC(l)));
    }
    applyToHost(t) {
      (this.applyStyles(), this.setAttribute(t, this.hostAttr, ''));
    }
    createElement(t, n) {
      let r = super.createElement(t, n);
      return (super.setAttribute(r, this.contentAttr, ''), r);
    }
  };
var gs = class e extends Zr {
    supportsDOMEvents = !0;
    static makeCurrent() {
      Su(new e());
    }
    onAndCancel(t, n, r, o) {
      return (
        t.addEventListener(n, r, o),
        () => {
          t.removeEventListener(n, r, o);
        }
      );
    }
    dispatchEvent(t, n) {
      t.dispatchEvent(n);
    }
    remove(t) {
      t.remove();
    }
    createElement(t, n) {
      return ((n = n || this.getDefaultDocument()), n.createElement(t));
    }
    createHtmlDocument() {
      return document.implementation.createHTMLDocument('fakeTitle');
    }
    getDefaultDocument() {
      return document;
    }
    isElementNode(t) {
      return t.nodeType === Node.ELEMENT_NODE;
    }
    isShadowRoot(t) {
      return t instanceof DocumentFragment;
    }
    getGlobalEventTarget(t, n) {
      return n === 'window' ? window : n === 'document' ? t : n === 'body' ? t.body : null;
    }
    getBaseHref(t) {
      let n = hC();
      return n == null ? null : gC(n);
    }
    resetBaseElement() {
      ro = null;
    }
    getUserAgent() {
      return window.navigator.userAgent;
    }
    getCookie(t) {
      return xu(document.cookie, t);
    }
  },
  ro = null;
function hC() {
  return ((ro = ro || document.head.querySelector('base')), ro ? ro.getAttribute('href') : null);
}
function gC(e) {
  return new URL(e, document.baseURI).pathname;
}
var mC = (() => {
    class e {
      build() {
        return new XMLHttpRequest();
      }
      static ɵfac = function (r) {
        return new (r || e)();
      };
      static ɵprov = y({ token: e, factory: e.ɵfac });
    }
    return e;
  })(),
  jh = ['alt', 'control', 'meta', 'shift'],
  vC = {
    '\b': 'Backspace',
    '	': 'Tab',
    '\x7F': 'Delete',
    '\x1B': 'Escape',
    Del: 'Delete',
    Esc: 'Escape',
    Left: 'ArrowLeft',
    Right: 'ArrowRight',
    Up: 'ArrowUp',
    Down: 'ArrowDown',
    Menu: 'ContextMenu',
    Scroll: 'ScrollLock',
    Win: 'OS'
  },
  yC = { alt: (e) => e.altKey, control: (e) => e.ctrlKey, meta: (e) => e.metaKey, shift: (e) => e.shiftKey },
  Bh = (() => {
    class e extends eo {
      constructor(n) {
        super(n);
      }
      supports(n) {
        return e.parseEventName(n) != null;
      }
      addEventListener(n, r, o, i) {
        let s = e.parseEventName(r),
          a = e.eventCallback(s.fullKey, o, this.manager.getZone());
        return this.manager.getZone().runOutsideAngular(() => ut().onAndCancel(n, s.domEventName, a, i));
      }
      static parseEventName(n) {
        let r = n.toLowerCase().split('.'),
          o = r.shift();
        if (r.length === 0 || !(o === 'keydown' || o === 'keyup')) return null;
        let i = e._normalizeKey(r.pop()),
          s = '',
          a = r.indexOf('code');
        if (
          (a > -1 && (r.splice(a, 1), (s = 'code.')),
          jh.forEach((u) => {
            let l = r.indexOf(u);
            l > -1 && (r.splice(l, 1), (s += u + '.'));
          }),
          (s += i),
          r.length != 0 || i.length === 0)
        )
          return null;
        let c = {};
        return ((c.domEventName = o), (c.fullKey = s), c);
      }
      static matchEventFullKeyCode(n, r) {
        let o = vC[n.key] || n.key,
          i = '';
        return (
          r.indexOf('code.') > -1 && ((o = n.code), (i = 'code.')),
          o == null || !o
            ? !1
            : ((o = o.toLowerCase()),
              o === ' ' ? (o = 'space') : o === '.' && (o = 'dot'),
              jh.forEach((s) => {
                if (s !== o) {
                  let a = yC[s];
                  a(n) && (i += s + '.');
                }
              }),
              (i += o),
              i === r)
        );
      }
      static eventCallback(n, r, o) {
        return (i) => {
          e.matchEventFullKeyCode(i, n) && o.runGuarded(() => r(i));
        };
      }
      static _normalizeKey(n) {
        return n === 'esc' ? 'escape' : n;
      }
      static ɵfac = function (r) {
        return new (r || e)(b(ne));
      };
      static ɵprov = y({ token: e, factory: e.ɵfac });
    }
    return e;
  })();
function Hu(e, t, n) {
  let r = m({ rootComponent: e, platformRef: n?.platformRef }, DC(t));
  return lh(r);
}
function DC(e) {
  return { appProviders: [...bC, ...(e?.providers ?? [])], platformProviders: wC };
}
function EC() {
  gs.makeCurrent();
}
function CC() {
  return new $e();
}
function IC() {
  return (qc(document), document);
}
var wC = [
  { provide: $n, useValue: xh },
  { provide: zi, useValue: EC, multi: !0 },
  { provide: ne, useFactory: IC }
];
var bC = [
  { provide: Er, useValue: 'root' },
  { provide: $e, useFactory: CC },
  { provide: hs, useClass: fs, multi: !0, deps: [ne] },
  { provide: hs, useClass: Bh, multi: !0, deps: [ne] },
  Vu,
  ju,
  Lu,
  { provide: Xt, useExisting: Vu },
  { provide: Xr, useClass: mC },
  []
];
var Vh = (() => {
  class e {
    _doc;
    constructor(n) {
      this._doc = n;
    }
    getTitle() {
      return this._doc.title;
    }
    setTitle(n) {
      this._doc.title = n || '';
    }
    static ɵfac = function (r) {
      return new (r || e)(b(ne));
    };
    static ɵprov = y({ token: e, factory: e.ɵfac, providedIn: 'root' });
  }
  return e;
})();
var _ = 'primary',
  vo = Symbol('RouteTitle'),
  qu = class {
    params;
    constructor(t) {
      this.params = t || {};
    }
    has(t) {
      return Object.prototype.hasOwnProperty.call(this.params, t);
    }
    get(t) {
      if (this.has(t)) {
        let n = this.params[t];
        return Array.isArray(n) ? n[0] : n;
      }
      return null;
    }
    getAll(t) {
      if (this.has(t)) {
        let n = this.params[t];
        return Array.isArray(n) ? n : [n];
      }
      return [];
    }
    get keys() {
      return Object.keys(this.params);
    }
  };
function Xn(e) {
  return new qu(e);
}
function _C(e, t, n) {
  let r = n.path.split('/');
  if (r.length > e.length || (n.pathMatch === 'full' && (t.hasChildren() || r.length < e.length))) return null;
  let o = {};
  for (let i = 0; i < r.length; i++) {
    let s = r[i],
      a = e[i];
    if (s[0] === ':') o[s.substring(1)] = a;
    else if (s !== a.path) return null;
  }
  return { consumed: e.slice(0, r.length), posParams: o };
}
function TC(e, t) {
  if (e.length !== t.length) return !1;
  for (let n = 0; n < e.length; ++n) if (!Ye(e[n], t[n])) return !1;
  return !0;
}
function Ye(e, t) {
  let n = e ? Wu(e) : void 0,
    r = t ? Wu(t) : void 0;
  if (!n || !r || n.length != r.length) return !1;
  let o;
  for (let i = 0; i < n.length; i++) if (((o = n[i]), !Zh(e[o], t[o]))) return !1;
  return !0;
}
function Wu(e) {
  return [...Object.keys(e), ...Object.getOwnPropertySymbols(e)];
}
function Zh(e, t) {
  if (Array.isArray(e) && Array.isArray(t)) {
    if (e.length !== t.length) return !1;
    let n = [...e].sort(),
      r = [...t].sort();
    return n.every((o, i) => r[i] === o);
  } else return e === t;
}
function Yh(e) {
  return e.length > 0 ? e[e.length - 1] : null;
}
function ht(e) {
  return ia(e) ? e : zn(e) ? z(Promise.resolve(e)) : C(e);
}
var MC = { exact: Kh, subset: Jh },
  Qh = { exact: NC, subset: AC, ignored: () => !0 };
function Hh(e, t, n) {
  return (
    MC[n.paths](e.root, t.root, n.matrixParams) &&
    Qh[n.queryParams](e.queryParams, t.queryParams) &&
    !(n.fragment === 'exact' && e.fragment !== t.fragment)
  );
}
function NC(e, t) {
  return Ye(e, t);
}
function Kh(e, t, n) {
  if (!an(e.segments, t.segments) || !ys(e.segments, t.segments, n) || e.numberOfChildren !== t.numberOfChildren)
    return !1;
  for (let r in t.children) if (!e.children[r] || !Kh(e.children[r], t.children[r], n)) return !1;
  return !0;
}
function AC(e, t) {
  return Object.keys(t).length <= Object.keys(e).length && Object.keys(t).every((n) => Zh(e[n], t[n]));
}
function Jh(e, t, n) {
  return Xh(e, t, t.segments, n);
}
function Xh(e, t, n, r) {
  if (e.segments.length > n.length) {
    let o = e.segments.slice(0, n.length);
    return !(!an(o, n) || t.hasChildren() || !ys(o, n, r));
  } else if (e.segments.length === n.length) {
    if (!an(e.segments, n) || !ys(e.segments, n, r)) return !1;
    for (let o in t.children) if (!e.children[o] || !Jh(e.children[o], t.children[o], r)) return !1;
    return !0;
  } else {
    let o = n.slice(0, e.segments.length),
      i = n.slice(e.segments.length);
    return !an(e.segments, o) || !ys(e.segments, o, r) || !e.children[_] ? !1 : Xh(e.children[_], t, i, r);
  }
}
function ys(e, t, n) {
  return t.every((r, o) => Qh[n](e[o].parameters, r.parameters));
}
var pt = class {
    root;
    queryParams;
    fragment;
    _queryParamMap;
    constructor(t = new F([], {}), n = {}, r = null) {
      ((this.root = t), (this.queryParams = n), (this.fragment = r));
    }
    get queryParamMap() {
      return ((this._queryParamMap ??= Xn(this.queryParams)), this._queryParamMap);
    }
    toString() {
      return OC.serialize(this);
    }
  },
  F = class {
    segments;
    children;
    parent = null;
    constructor(t, n) {
      ((this.segments = t), (this.children = n), Object.values(n).forEach((r) => (r.parent = this)));
    }
    hasChildren() {
      return this.numberOfChildren > 0;
    }
    get numberOfChildren() {
      return Object.keys(this.children).length;
    }
    toString() {
      return Ds(this);
    }
  },
  sn = class {
    path;
    parameters;
    _parameterMap;
    constructor(t, n) {
      ((this.path = t), (this.parameters = n));
    }
    get parameterMap() {
      return ((this._parameterMap ??= Xn(this.parameters)), this._parameterMap);
    }
    toString() {
      return tg(this);
    }
  };
function RC(e, t) {
  return an(e, t) && e.every((n, r) => Ye(n.parameters, t[r].parameters));
}
function an(e, t) {
  return e.length !== t.length ? !1 : e.every((n, r) => n.path === t[r].path);
}
function xC(e, t) {
  let n = [];
  return (
    Object.entries(e.children).forEach(([r, o]) => {
      r === _ && (n = n.concat(t(o, r)));
    }),
    Object.entries(e.children).forEach(([r, o]) => {
      r !== _ && (n = n.concat(t(o, r)));
    }),
    n
  );
}
var Rs = (() => {
    class e {
      static ɵfac = function (r) {
        return new (r || e)();
      };
      static ɵprov = y({ token: e, factory: () => new er(), providedIn: 'root' });
    }
    return e;
  })(),
  er = class {
    parse(t) {
      let n = new Yu(t);
      return new pt(n.parseRootSegment(), n.parseQueryParams(), n.parseFragment());
    }
    serialize(t) {
      let n = `/${oo(t.root, !0)}`,
        r = FC(t.queryParams),
        o = typeof t.fragment == 'string' ? `#${kC(t.fragment)}` : '';
      return `${n}${r}${o}`;
    }
  },
  OC = new er();
function Ds(e) {
  return e.segments.map((t) => tg(t)).join('/');
}
function oo(e, t) {
  if (!e.hasChildren()) return Ds(e);
  if (t) {
    let n = e.children[_] ? oo(e.children[_], !1) : '',
      r = [];
    return (
      Object.entries(e.children).forEach(([o, i]) => {
        o !== _ && r.push(`${o}:${oo(i, !1)}`);
      }),
      r.length > 0 ? `${n}(${r.join('//')})` : n
    );
  } else {
    let n = xC(e, (r, o) => (o === _ ? [oo(e.children[_], !1)] : [`${o}:${oo(r, !1)}`]));
    return Object.keys(e.children).length === 1 && e.children[_] != null
      ? `${Ds(e)}/${n[0]}`
      : `${Ds(e)}/(${n.join('//')})`;
  }
}
function eg(e) {
  return encodeURIComponent(e).replace(/%40/g, '@').replace(/%3A/gi, ':').replace(/%24/g, '$').replace(/%2C/gi, ',');
}
function ms(e) {
  return eg(e).replace(/%3B/gi, ';');
}
function kC(e) {
  return encodeURI(e);
}
function Zu(e) {
  return eg(e).replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/%26/gi, '&');
}
function Es(e) {
  return decodeURIComponent(e);
}
function Uh(e) {
  return Es(e.replace(/\+/g, '%20'));
}
function tg(e) {
  return `${Zu(e.path)}${PC(e.parameters)}`;
}
function PC(e) {
  return Object.entries(e)
    .map(([t, n]) => `;${Zu(t)}=${Zu(n)}`)
    .join('');
}
function FC(e) {
  let t = Object.entries(e)
    .map(([n, r]) => (Array.isArray(r) ? r.map((o) => `${ms(n)}=${ms(o)}`).join('&') : `${ms(n)}=${ms(r)}`))
    .filter((n) => n);
  return t.length ? `?${t.join('&')}` : '';
}
var LC = /^[^\/()?;#]+/;
function Uu(e) {
  let t = e.match(LC);
  return t ? t[0] : '';
}
var jC = /^[^\/()?;=#]+/;
function BC(e) {
  let t = e.match(jC);
  return t ? t[0] : '';
}
var VC = /^[^=?&#]+/;
function HC(e) {
  let t = e.match(VC);
  return t ? t[0] : '';
}
var UC = /^[^&#]+/;
function $C(e) {
  let t = e.match(UC);
  return t ? t[0] : '';
}
var Yu = class {
  url;
  remaining;
  constructor(t) {
    ((this.url = t), (this.remaining = t));
  }
  parseRootSegment() {
    return (
      this.consumeOptional('/'),
      this.remaining === '' || this.peekStartsWith('?') || this.peekStartsWith('#')
        ? new F([], {})
        : new F([], this.parseChildren())
    );
  }
  parseQueryParams() {
    let t = {};
    if (this.consumeOptional('?'))
      do this.parseQueryParam(t);
      while (this.consumeOptional('&'));
    return t;
  }
  parseFragment() {
    return this.consumeOptional('#') ? decodeURIComponent(this.remaining) : null;
  }
  parseChildren() {
    if (this.remaining === '') return {};
    this.consumeOptional('/');
    let t = [];
    for (
      this.peekStartsWith('(') || t.push(this.parseSegment());
      this.peekStartsWith('/') && !this.peekStartsWith('//') && !this.peekStartsWith('/(');

    )
      (this.capture('/'), t.push(this.parseSegment()));
    let n = {};
    this.peekStartsWith('/(') && (this.capture('/'), (n = this.parseParens(!0)));
    let r = {};
    return (
      this.peekStartsWith('(') && (r = this.parseParens(!1)),
      (t.length > 0 || Object.keys(n).length > 0) && (r[_] = new F(t, n)),
      r
    );
  }
  parseSegment() {
    let t = Uu(this.remaining);
    if (t === '' && this.peekStartsWith(';')) throw new v(4009, !1);
    return (this.capture(t), new sn(Es(t), this.parseMatrixParams()));
  }
  parseMatrixParams() {
    let t = {};
    for (; this.consumeOptional(';'); ) this.parseParam(t);
    return t;
  }
  parseParam(t) {
    let n = BC(this.remaining);
    if (!n) return;
    this.capture(n);
    let r = '';
    if (this.consumeOptional('=')) {
      let o = Uu(this.remaining);
      o && ((r = o), this.capture(r));
    }
    t[Es(n)] = Es(r);
  }
  parseQueryParam(t) {
    let n = HC(this.remaining);
    if (!n) return;
    this.capture(n);
    let r = '';
    if (this.consumeOptional('=')) {
      let s = $C(this.remaining);
      s && ((r = s), this.capture(r));
    }
    let o = Uh(n),
      i = Uh(r);
    if (t.hasOwnProperty(o)) {
      let s = t[o];
      (Array.isArray(s) || ((s = [s]), (t[o] = s)), s.push(i));
    } else t[o] = i;
  }
  parseParens(t) {
    let n = {};
    for (this.capture('('); !this.consumeOptional(')') && this.remaining.length > 0; ) {
      let r = Uu(this.remaining),
        o = this.remaining[r.length];
      if (o !== '/' && o !== ')' && o !== ';') throw new v(4010, !1);
      let i;
      r.indexOf(':') > -1 ? ((i = r.slice(0, r.indexOf(':'))), this.capture(i), this.capture(':')) : t && (i = _);
      let s = this.parseChildren();
      ((n[i ?? _] = Object.keys(s).length === 1 && s[_] ? s[_] : new F([], s)), this.consumeOptional('//'));
    }
    return n;
  }
  peekStartsWith(t) {
    return this.remaining.startsWith(t);
  }
  consumeOptional(t) {
    return this.peekStartsWith(t) ? ((this.remaining = this.remaining.substring(t.length)), !0) : !1;
  }
  capture(t) {
    if (!this.consumeOptional(t)) throw new v(4011, !1);
  }
};
function ng(e) {
  return e.segments.length > 0 ? new F([], { [_]: e }) : e;
}
function rg(e) {
  let t = {};
  for (let [r, o] of Object.entries(e.children)) {
    let i = rg(o);
    if (r === _ && i.segments.length === 0 && i.hasChildren()) for (let [s, a] of Object.entries(i.children)) t[s] = a;
    else (i.segments.length > 0 || i.hasChildren()) && (t[r] = i);
  }
  let n = new F(e.segments, t);
  return zC(n);
}
function zC(e) {
  if (e.numberOfChildren === 1 && e.children[_]) {
    let t = e.children[_];
    return new F(e.segments.concat(t.segments), t.children);
  }
  return e;
}
function tr(e) {
  return e instanceof pt;
}
function GC(e, t, n = null, r = null) {
  let o = og(e);
  return ig(o, t, n, r);
}
function og(e) {
  let t;
  function n(i) {
    let s = {};
    for (let c of i.children) {
      let u = n(c);
      s[c.outlet] = u;
    }
    let a = new F(i.url, s);
    return (i === e && (t = a), a);
  }
  let r = n(e.root),
    o = ng(r);
  return t ?? o;
}
function ig(e, t, n, r) {
  let o = e;
  for (; o.parent; ) o = o.parent;
  if (t.length === 0) return $u(o, o, o, n, r);
  let i = qC(t);
  if (i.toRoot()) return $u(o, o, new F([], {}), n, r);
  let s = WC(i, o, e),
    a = s.processChildren ? so(s.segmentGroup, s.index, i.commands) : ag(s.segmentGroup, s.index, i.commands);
  return $u(o, s.segmentGroup, a, n, r);
}
function Cs(e) {
  return typeof e == 'object' && e != null && !e.outlets && !e.segmentPath;
}
function uo(e) {
  return typeof e == 'object' && e != null && e.outlets;
}
function $u(e, t, n, r, o) {
  let i = {};
  r &&
    Object.entries(r).forEach(([c, u]) => {
      i[c] = Array.isArray(u) ? u.map((l) => `${l}`) : `${u}`;
    });
  let s;
  e === t ? (s = n) : (s = sg(e, t, n));
  let a = ng(rg(s));
  return new pt(a, i, o);
}
function sg(e, t, n) {
  let r = {};
  return (
    Object.entries(e.children).forEach(([o, i]) => {
      i === t ? (r[o] = n) : (r[o] = sg(i, t, n));
    }),
    new F(e.segments, r)
  );
}
var Is = class {
  isAbsolute;
  numberOfDoubleDots;
  commands;
  constructor(t, n, r) {
    if (((this.isAbsolute = t), (this.numberOfDoubleDots = n), (this.commands = r), t && r.length > 0 && Cs(r[0])))
      throw new v(4003, !1);
    let o = r.find(uo);
    if (o && o !== Yh(r)) throw new v(4004, !1);
  }
  toRoot() {
    return this.isAbsolute && this.commands.length === 1 && this.commands[0] == '/';
  }
};
function qC(e) {
  if (typeof e[0] == 'string' && e.length === 1 && e[0] === '/') return new Is(!0, 0, e);
  let t = 0,
    n = !1,
    r = e.reduce((o, i, s) => {
      if (typeof i == 'object' && i != null) {
        if (i.outlets) {
          let a = {};
          return (
            Object.entries(i.outlets).forEach(([c, u]) => {
              a[c] = typeof u == 'string' ? u.split('/') : u;
            }),
            [...o, { outlets: a }]
          );
        }
        if (i.segmentPath) return [...o, i.segmentPath];
      }
      return typeof i != 'string'
        ? [...o, i]
        : s === 0
          ? (i.split('/').forEach((a, c) => {
              (c == 0 && a === '.') || (c == 0 && a === '' ? (n = !0) : a === '..' ? t++ : a != '' && o.push(a));
            }),
            o)
          : [...o, i];
    }, []);
  return new Is(n, t, r);
}
var Qn = class {
  segmentGroup;
  processChildren;
  index;
  constructor(t, n, r) {
    ((this.segmentGroup = t), (this.processChildren = n), (this.index = r));
  }
};
function WC(e, t, n) {
  if (e.isAbsolute) return new Qn(t, !0, 0);
  if (!n) return new Qn(t, !1, NaN);
  if (n.parent === null) return new Qn(n, !0, 0);
  let r = Cs(e.commands[0]) ? 0 : 1,
    o = n.segments.length - 1 + r;
  return ZC(n, o, e.numberOfDoubleDots);
}
function ZC(e, t, n) {
  let r = e,
    o = t,
    i = n;
  for (; i > o; ) {
    if (((i -= o), (r = r.parent), !r)) throw new v(4005, !1);
    o = r.segments.length;
  }
  return new Qn(r, !1, o - i);
}
function YC(e) {
  return uo(e[0]) ? e[0].outlets : { [_]: e };
}
function ag(e, t, n) {
  if (((e ??= new F([], {})), e.segments.length === 0 && e.hasChildren())) return so(e, t, n);
  let r = QC(e, t, n),
    o = n.slice(r.commandIndex);
  if (r.match && r.pathIndex < e.segments.length) {
    let i = new F(e.segments.slice(0, r.pathIndex), {});
    return ((i.children[_] = new F(e.segments.slice(r.pathIndex), e.children)), so(i, 0, o));
  } else
    return r.match && o.length === 0
      ? new F(e.segments, {})
      : r.match && !e.hasChildren()
        ? Qu(e, t, n)
        : r.match
          ? so(e, 0, o)
          : Qu(e, t, n);
}
function so(e, t, n) {
  if (n.length === 0) return new F(e.segments, {});
  {
    let r = YC(n),
      o = {};
    if (
      Object.keys(r).some((i) => i !== _) &&
      e.children[_] &&
      e.numberOfChildren === 1 &&
      e.children[_].segments.length === 0
    ) {
      let i = so(e.children[_], t, n);
      return new F(e.segments, i.children);
    }
    return (
      Object.entries(r).forEach(([i, s]) => {
        (typeof s == 'string' && (s = [s]), s !== null && (o[i] = ag(e.children[i], t, s)));
      }),
      Object.entries(e.children).forEach(([i, s]) => {
        r[i] === void 0 && (o[i] = s);
      }),
      new F(e.segments, o)
    );
  }
}
function QC(e, t, n) {
  let r = 0,
    o = t,
    i = { match: !1, pathIndex: 0, commandIndex: 0 };
  for (; o < e.segments.length; ) {
    if (r >= n.length) return i;
    let s = e.segments[o],
      a = n[r];
    if (uo(a)) break;
    let c = `${a}`,
      u = r < n.length - 1 ? n[r + 1] : null;
    if (o > 0 && c === void 0) break;
    if (c && u && typeof u == 'object' && u.outlets === void 0) {
      if (!zh(c, u, s)) return i;
      r += 2;
    } else {
      if (!zh(c, {}, s)) return i;
      r++;
    }
    o++;
  }
  return { match: !0, pathIndex: o, commandIndex: r };
}
function Qu(e, t, n) {
  let r = e.segments.slice(0, t),
    o = 0;
  for (; o < n.length; ) {
    let i = n[o];
    if (uo(i)) {
      let c = KC(i.outlets);
      return new F(r, c);
    }
    if (o === 0 && Cs(n[0])) {
      let c = e.segments[t];
      (r.push(new sn(c.path, $h(n[0]))), o++);
      continue;
    }
    let s = uo(i) ? i.outlets[_] : `${i}`,
      a = o < n.length - 1 ? n[o + 1] : null;
    s && a && Cs(a) ? (r.push(new sn(s, $h(a))), (o += 2)) : (r.push(new sn(s, {})), o++);
  }
  return new F(r, {});
}
function KC(e) {
  let t = {};
  return (
    Object.entries(e).forEach(([n, r]) => {
      (typeof r == 'string' && (r = [r]), r !== null && (t[n] = Qu(new F([], {}), 0, r)));
    }),
    t
  );
}
function $h(e) {
  let t = {};
  return (Object.entries(e).forEach(([n, r]) => (t[n] = `${r}`)), t);
}
function zh(e, t, n) {
  return e == n.path && Ye(t, n.parameters);
}
var ao = 'imperative',
  ie = (function (e) {
    return (
      (e[(e.NavigationStart = 0)] = 'NavigationStart'),
      (e[(e.NavigationEnd = 1)] = 'NavigationEnd'),
      (e[(e.NavigationCancel = 2)] = 'NavigationCancel'),
      (e[(e.NavigationError = 3)] = 'NavigationError'),
      (e[(e.RoutesRecognized = 4)] = 'RoutesRecognized'),
      (e[(e.ResolveStart = 5)] = 'ResolveStart'),
      (e[(e.ResolveEnd = 6)] = 'ResolveEnd'),
      (e[(e.GuardsCheckStart = 7)] = 'GuardsCheckStart'),
      (e[(e.GuardsCheckEnd = 8)] = 'GuardsCheckEnd'),
      (e[(e.RouteConfigLoadStart = 9)] = 'RouteConfigLoadStart'),
      (e[(e.RouteConfigLoadEnd = 10)] = 'RouteConfigLoadEnd'),
      (e[(e.ChildActivationStart = 11)] = 'ChildActivationStart'),
      (e[(e.ChildActivationEnd = 12)] = 'ChildActivationEnd'),
      (e[(e.ActivationStart = 13)] = 'ActivationStart'),
      (e[(e.ActivationEnd = 14)] = 'ActivationEnd'),
      (e[(e.Scroll = 15)] = 'Scroll'),
      (e[(e.NavigationSkipped = 16)] = 'NavigationSkipped'),
      e
    );
  })(ie || {}),
  Re = class {
    id;
    url;
    constructor(t, n) {
      ((this.id = t), (this.url = n));
    }
  },
  nr = class extends Re {
    type = ie.NavigationStart;
    navigationTrigger;
    restoredState;
    constructor(t, n, r = 'imperative', o = null) {
      (super(t, n), (this.navigationTrigger = r), (this.restoredState = o));
    }
    toString() {
      return `NavigationStart(id: ${this.id}, url: '${this.url}')`;
    }
  },
  Rt = class extends Re {
    urlAfterRedirects;
    type = ie.NavigationEnd;
    constructor(t, n, r) {
      (super(t, n), (this.urlAfterRedirects = r));
    }
    toString() {
      return `NavigationEnd(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}')`;
    }
  },
  ye = (function (e) {
    return (
      (e[(e.Redirect = 0)] = 'Redirect'),
      (e[(e.SupersededByNewNavigation = 1)] = 'SupersededByNewNavigation'),
      (e[(e.NoDataFromResolver = 2)] = 'NoDataFromResolver'),
      (e[(e.GuardRejected = 3)] = 'GuardRejected'),
      (e[(e.Aborted = 4)] = 'Aborted'),
      e
    );
  })(ye || {}),
  ws = (function (e) {
    return (
      (e[(e.IgnoredSameUrlNavigation = 0)] = 'IgnoredSameUrlNavigation'),
      (e[(e.IgnoredByUrlHandlingStrategy = 1)] = 'IgnoredByUrlHandlingStrategy'),
      e
    );
  })(ws || {}),
  ft = class extends Re {
    reason;
    code;
    type = ie.NavigationCancel;
    constructor(t, n, r, o) {
      (super(t, n), (this.reason = r), (this.code = o));
    }
    toString() {
      return `NavigationCancel(id: ${this.id}, url: '${this.url}')`;
    }
  },
  xt = class extends Re {
    reason;
    code;
    type = ie.NavigationSkipped;
    constructor(t, n, r, o) {
      (super(t, n), (this.reason = r), (this.code = o));
    }
  },
  lo = class extends Re {
    error;
    target;
    type = ie.NavigationError;
    constructor(t, n, r, o) {
      (super(t, n), (this.error = r), (this.target = o));
    }
    toString() {
      return `NavigationError(id: ${this.id}, url: '${this.url}', error: ${this.error})`;
    }
  },
  bs = class extends Re {
    urlAfterRedirects;
    state;
    type = ie.RoutesRecognized;
    constructor(t, n, r, o) {
      (super(t, n), (this.urlAfterRedirects = r), (this.state = o));
    }
    toString() {
      return `RoutesRecognized(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state})`;
    }
  },
  Ku = class extends Re {
    urlAfterRedirects;
    state;
    type = ie.GuardsCheckStart;
    constructor(t, n, r, o) {
      (super(t, n), (this.urlAfterRedirects = r), (this.state = o));
    }
    toString() {
      return `GuardsCheckStart(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state})`;
    }
  },
  Ju = class extends Re {
    urlAfterRedirects;
    state;
    shouldActivate;
    type = ie.GuardsCheckEnd;
    constructor(t, n, r, o, i) {
      (super(t, n), (this.urlAfterRedirects = r), (this.state = o), (this.shouldActivate = i));
    }
    toString() {
      return `GuardsCheckEnd(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state}, shouldActivate: ${this.shouldActivate})`;
    }
  },
  Xu = class extends Re {
    urlAfterRedirects;
    state;
    type = ie.ResolveStart;
    constructor(t, n, r, o) {
      (super(t, n), (this.urlAfterRedirects = r), (this.state = o));
    }
    toString() {
      return `ResolveStart(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state})`;
    }
  },
  el = class extends Re {
    urlAfterRedirects;
    state;
    type = ie.ResolveEnd;
    constructor(t, n, r, o) {
      (super(t, n), (this.urlAfterRedirects = r), (this.state = o));
    }
    toString() {
      return `ResolveEnd(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state})`;
    }
  },
  tl = class {
    route;
    type = ie.RouteConfigLoadStart;
    constructor(t) {
      this.route = t;
    }
    toString() {
      return `RouteConfigLoadStart(path: ${this.route.path})`;
    }
  },
  nl = class {
    route;
    type = ie.RouteConfigLoadEnd;
    constructor(t) {
      this.route = t;
    }
    toString() {
      return `RouteConfigLoadEnd(path: ${this.route.path})`;
    }
  },
  rl = class {
    snapshot;
    type = ie.ChildActivationStart;
    constructor(t) {
      this.snapshot = t;
    }
    toString() {
      return `ChildActivationStart(path: '${(this.snapshot.routeConfig && this.snapshot.routeConfig.path) || ''}')`;
    }
  },
  ol = class {
    snapshot;
    type = ie.ChildActivationEnd;
    constructor(t) {
      this.snapshot = t;
    }
    toString() {
      return `ChildActivationEnd(path: '${(this.snapshot.routeConfig && this.snapshot.routeConfig.path) || ''}')`;
    }
  },
  il = class {
    snapshot;
    type = ie.ActivationStart;
    constructor(t) {
      this.snapshot = t;
    }
    toString() {
      return `ActivationStart(path: '${(this.snapshot.routeConfig && this.snapshot.routeConfig.path) || ''}')`;
    }
  },
  sl = class {
    snapshot;
    type = ie.ActivationEnd;
    constructor(t) {
      this.snapshot = t;
    }
    toString() {
      return `ActivationEnd(path: '${(this.snapshot.routeConfig && this.snapshot.routeConfig.path) || ''}')`;
    }
  };
var fo = class {},
  rr = class {
    url;
    navigationBehaviorOptions;
    constructor(t, n) {
      ((this.url = t), (this.navigationBehaviorOptions = n));
    }
  };
function JC(e) {
  return !(e instanceof fo) && !(e instanceof rr);
}
function XC(e, t) {
  return (e.providers && !e._injector && (e._injector = Ur(e.providers, t, `Route: ${e.path}`)), e._injector ?? t);
}
function He(e) {
  return e.outlet || _;
}
function eI(e, t) {
  let n = e.filter((r) => He(r) === t);
  return (n.push(...e.filter((r) => He(r) !== t)), n);
}
function ir(e) {
  if (!e) return null;
  if (e.routeConfig?._injector) return e.routeConfig._injector;
  for (let t = e.parent; t; t = t.parent) {
    let n = t.routeConfig;
    if (n?._loadedInjector) return n._loadedInjector;
    if (n?._injector) return n._injector;
  }
  return null;
}
var al = class {
    rootInjector;
    outlet = null;
    route = null;
    children;
    attachRef = null;
    get injector() {
      return ir(this.route?.snapshot) ?? this.rootInjector;
    }
    constructor(t) {
      ((this.rootInjector = t), (this.children = new yo(this.rootInjector)));
    }
  },
  yo = (() => {
    class e {
      rootInjector;
      contexts = new Map();
      constructor(n) {
        this.rootInjector = n;
      }
      onChildOutletCreated(n, r) {
        let o = this.getOrCreateContext(n);
        ((o.outlet = r), this.contexts.set(n, o));
      }
      onChildOutletDestroyed(n) {
        let r = this.getContext(n);
        r && ((r.outlet = null), (r.attachRef = null));
      }
      onOutletDeactivated() {
        let n = this.contexts;
        return ((this.contexts = new Map()), n);
      }
      onOutletReAttached(n) {
        this.contexts = n;
      }
      getOrCreateContext(n) {
        let r = this.getContext(n);
        return (r || ((r = new al(this.rootInjector)), this.contexts.set(n, r)), r);
      }
      getContext(n) {
        return this.contexts.get(n) || null;
      }
      static ɵfac = function (r) {
        return new (r || e)(b(oe));
      };
      static ɵprov = y({ token: e, factory: e.ɵfac, providedIn: 'root' });
    }
    return e;
  })(),
  Ss = class {
    _root;
    constructor(t) {
      this._root = t;
    }
    get root() {
      return this._root.value;
    }
    parent(t) {
      let n = this.pathFromRoot(t);
      return n.length > 1 ? n[n.length - 2] : null;
    }
    children(t) {
      let n = cl(t, this._root);
      return n ? n.children.map((r) => r.value) : [];
    }
    firstChild(t) {
      let n = cl(t, this._root);
      return n && n.children.length > 0 ? n.children[0].value : null;
    }
    siblings(t) {
      let n = ul(t, this._root);
      return n.length < 2 ? [] : n[n.length - 2].children.map((o) => o.value).filter((o) => o !== t);
    }
    pathFromRoot(t) {
      return ul(t, this._root).map((n) => n.value);
    }
  };
function cl(e, t) {
  if (e === t.value) return t;
  for (let n of t.children) {
    let r = cl(e, n);
    if (r) return r;
  }
  return null;
}
function ul(e, t) {
  if (e === t.value) return [t];
  for (let n of t.children) {
    let r = ul(e, n);
    if (r.length) return (r.unshift(t), r);
  }
  return [];
}
var be = class {
  value;
  children;
  constructor(t, n) {
    ((this.value = t), (this.children = n));
  }
  toString() {
    return `TreeNode(${this.value})`;
  }
};
function Yn(e) {
  let t = {};
  return (e && e.children.forEach((n) => (t[n.value.outlet] = n)), t);
}
var _s = class extends Ss {
  snapshot;
  constructor(t, n) {
    (super(t), (this.snapshot = n), yl(this, t));
  }
  toString() {
    return this.snapshot.toString();
  }
};
function cg(e) {
  let t = tI(e),
    n = new re([new sn('', {})]),
    r = new re({}),
    o = new re({}),
    i = new re({}),
    s = new re(''),
    a = new cn(n, r, i, s, o, _, e, t.root);
  return ((a.snapshot = t.root), new _s(new be(a, []), t));
}
function tI(e) {
  let t = {},
    n = {},
    r = {},
    i = new Kn([], t, r, '', n, _, e, null, {});
  return new Ms('', new be(i, []));
}
var cn = class {
  urlSubject;
  paramsSubject;
  queryParamsSubject;
  fragmentSubject;
  dataSubject;
  outlet;
  component;
  snapshot;
  _futureSnapshot;
  _routerState;
  _paramMap;
  _queryParamMap;
  title;
  url;
  params;
  queryParams;
  fragment;
  data;
  constructor(t, n, r, o, i, s, a, c) {
    ((this.urlSubject = t),
      (this.paramsSubject = n),
      (this.queryParamsSubject = r),
      (this.fragmentSubject = o),
      (this.dataSubject = i),
      (this.outlet = s),
      (this.component = a),
      (this._futureSnapshot = c),
      (this.title = this.dataSubject?.pipe(O((u) => u[vo])) ?? C(void 0)),
      (this.url = t),
      (this.params = n),
      (this.queryParams = r),
      (this.fragment = o),
      (this.data = i));
  }
  get routeConfig() {
    return this._futureSnapshot.routeConfig;
  }
  get root() {
    return this._routerState.root;
  }
  get parent() {
    return this._routerState.parent(this);
  }
  get firstChild() {
    return this._routerState.firstChild(this);
  }
  get children() {
    return this._routerState.children(this);
  }
  get pathFromRoot() {
    return this._routerState.pathFromRoot(this);
  }
  get paramMap() {
    return ((this._paramMap ??= this.params.pipe(O((t) => Xn(t)))), this._paramMap);
  }
  get queryParamMap() {
    return ((this._queryParamMap ??= this.queryParams.pipe(O((t) => Xn(t)))), this._queryParamMap);
  }
  toString() {
    return this.snapshot ? this.snapshot.toString() : `Future(${this._futureSnapshot})`;
  }
};
function Ts(e, t, n = 'emptyOnly') {
  let r,
    { routeConfig: o } = e;
  return (
    t !== null && (n === 'always' || o?.path === '' || (!t.component && !t.routeConfig?.loadComponent))
      ? (r = {
          params: m(m({}, t.params), e.params),
          data: m(m({}, t.data), e.data),
          resolve: m(m(m(m({}, e.data), t.data), o?.data), e._resolvedData)
        })
      : (r = { params: m({}, e.params), data: m({}, e.data), resolve: m(m({}, e.data), e._resolvedData ?? {}) }),
    o && lg(o) && (r.resolve[vo] = o.title),
    r
  );
}
var Kn = class {
    url;
    params;
    queryParams;
    fragment;
    data;
    outlet;
    component;
    routeConfig;
    _resolve;
    _resolvedData;
    _routerState;
    _paramMap;
    _queryParamMap;
    get title() {
      return this.data?.[vo];
    }
    constructor(t, n, r, o, i, s, a, c, u) {
      ((this.url = t),
        (this.params = n),
        (this.queryParams = r),
        (this.fragment = o),
        (this.data = i),
        (this.outlet = s),
        (this.component = a),
        (this.routeConfig = c),
        (this._resolve = u));
    }
    get root() {
      return this._routerState.root;
    }
    get parent() {
      return this._routerState.parent(this);
    }
    get firstChild() {
      return this._routerState.firstChild(this);
    }
    get children() {
      return this._routerState.children(this);
    }
    get pathFromRoot() {
      return this._routerState.pathFromRoot(this);
    }
    get paramMap() {
      return ((this._paramMap ??= Xn(this.params)), this._paramMap);
    }
    get queryParamMap() {
      return ((this._queryParamMap ??= Xn(this.queryParams)), this._queryParamMap);
    }
    toString() {
      let t = this.url.map((r) => r.toString()).join('/'),
        n = this.routeConfig ? this.routeConfig.path : '';
      return `Route(url:'${t}', path:'${n}')`;
    }
  },
  Ms = class extends Ss {
    url;
    constructor(t, n) {
      (super(n), (this.url = t), yl(this, n));
    }
    toString() {
      return ug(this._root);
    }
  };
function yl(e, t) {
  ((t.value._routerState = e), t.children.forEach((n) => yl(e, n)));
}
function ug(e) {
  let t = e.children.length > 0 ? ` { ${e.children.map(ug).join(', ')} } ` : '';
  return `${e.value}${t}`;
}
function zu(e) {
  if (e.snapshot) {
    let t = e.snapshot,
      n = e._futureSnapshot;
    ((e.snapshot = n),
      Ye(t.queryParams, n.queryParams) || e.queryParamsSubject.next(n.queryParams),
      t.fragment !== n.fragment && e.fragmentSubject.next(n.fragment),
      Ye(t.params, n.params) || e.paramsSubject.next(n.params),
      TC(t.url, n.url) || e.urlSubject.next(n.url),
      Ye(t.data, n.data) || e.dataSubject.next(n.data));
  } else ((e.snapshot = e._futureSnapshot), e.dataSubject.next(e._futureSnapshot.data));
}
function ll(e, t) {
  let n = Ye(e.params, t.params) && RC(e.url, t.url),
    r = !e.parent != !t.parent;
  return n && !r && (!e.parent || ll(e.parent, t.parent));
}
function lg(e) {
  return typeof e.title == 'string' || e.title === null;
}
var nI = new D(''),
  dg = (() => {
    class e {
      activated = null;
      get activatedComponentRef() {
        return this.activated;
      }
      _activatedRoute = null;
      name = _;
      activateEvents = new de();
      deactivateEvents = new de();
      attachEvents = new de();
      detachEvents = new de();
      routerOutletData = ch();
      parentContexts = h(yo);
      location = h(Hr);
      changeDetector = h(bu);
      inputBinder = h(xs, { optional: !0 });
      supportsBindingToComponentInputs = !0;
      ngOnChanges(n) {
        if (n.name) {
          let { firstChange: r, previousValue: o } = n.name;
          if (r) return;
          (this.isTrackedInParentContexts(o) && (this.deactivate(), this.parentContexts.onChildOutletDestroyed(o)),
            this.initializeOutletWithName());
        }
      }
      ngOnDestroy() {
        (this.isTrackedInParentContexts(this.name) && this.parentContexts.onChildOutletDestroyed(this.name),
          this.inputBinder?.unsubscribeFromRouteData(this));
      }
      isTrackedInParentContexts(n) {
        return this.parentContexts.getContext(n)?.outlet === this;
      }
      ngOnInit() {
        this.initializeOutletWithName();
      }
      initializeOutletWithName() {
        if ((this.parentContexts.onChildOutletCreated(this.name, this), this.activated)) return;
        let n = this.parentContexts.getContext(this.name);
        n?.route && (n.attachRef ? this.attach(n.attachRef, n.route) : this.activateWith(n.route, n.injector));
      }
      get isActivated() {
        return !!this.activated;
      }
      get component() {
        if (!this.activated) throw new v(4012, !1);
        return this.activated.instance;
      }
      get activatedRoute() {
        if (!this.activated) throw new v(4012, !1);
        return this._activatedRoute;
      }
      get activatedRouteData() {
        return this._activatedRoute ? this._activatedRoute.snapshot.data : {};
      }
      detach() {
        if (!this.activated) throw new v(4012, !1);
        this.location.detach();
        let n = this.activated;
        return ((this.activated = null), (this._activatedRoute = null), this.detachEvents.emit(n.instance), n);
      }
      attach(n, r) {
        ((this.activated = n),
          (this._activatedRoute = r),
          this.location.insert(n.hostView),
          this.inputBinder?.bindActivatedRouteToOutletComponent(this),
          this.attachEvents.emit(n.instance));
      }
      deactivate() {
        if (this.activated) {
          let n = this.component;
          (this.activated.destroy(),
            (this.activated = null),
            (this._activatedRoute = null),
            this.deactivateEvents.emit(n));
        }
      }
      activateWith(n, r) {
        if (this.isActivated) throw new v(4013, !1);
        this._activatedRoute = n;
        let o = this.location,
          s = n.snapshot.component,
          a = this.parentContexts.getOrCreateContext(this.name).children,
          c = new dl(n, a, o.injector, this.routerOutletData);
        ((this.activated = o.createComponent(s, { index: o.length, injector: c, environmentInjector: r })),
          this.changeDetector.markForCheck(),
          this.inputBinder?.bindActivatedRouteToOutletComponent(this),
          this.activateEvents.emit(this.activated.instance));
      }
      static ɵfac = function (r) {
        return new (r || e)();
      };
      static ɵdir = Ji({
        type: e,
        selectors: [['router-outlet']],
        inputs: { name: 'name', routerOutletData: [1, 'routerOutletData'] },
        outputs: {
          activateEvents: 'activate',
          deactivateEvents: 'deactivate',
          attachEvents: 'attach',
          detachEvents: 'detach'
        },
        exportAs: ['outlet'],
        features: [Vi]
      });
    }
    return e;
  })(),
  dl = class {
    route;
    childContexts;
    parent;
    outletData;
    constructor(t, n, r, o) {
      ((this.route = t), (this.childContexts = n), (this.parent = r), (this.outletData = o));
    }
    get(t, n) {
      return t === cn ? this.route : t === yo ? this.childContexts : t === nI ? this.outletData : this.parent.get(t, n);
    }
  },
  xs = new D('');
var fg = (() => {
  class e {
    static ɵfac = function (r) {
      return new (r || e)();
    };
    static ɵcmp = rn({
      type: e,
      selectors: [['ng-component']],
      exportAs: ['emptyRouterOutlet'],
      decls: 1,
      vars: 0,
      template: function (r, o) {
        r & 1 && Gn(0, 'router-outlet');
      },
      dependencies: [dg],
      encapsulation: 2
    });
  }
  return e;
})();
function Dl(e) {
  let t = e.children && e.children.map(Dl),
    n = t ? j(m({}, e), { children: t }) : m({}, e);
  return (
    !n.component && !n.loadComponent && (t || n.loadChildren) && n.outlet && n.outlet !== _ && (n.component = fg),
    n
  );
}
function rI(e, t, n) {
  let r = po(e, t._root, n ? n._root : void 0);
  return new _s(r, t);
}
function po(e, t, n) {
  if (n && e.shouldReuseRoute(t.value, n.value.snapshot)) {
    let r = n.value;
    r._futureSnapshot = t.value;
    let o = oI(e, t, n);
    return new be(r, o);
  } else {
    if (e.shouldAttach(t.value)) {
      let i = e.retrieve(t.value);
      if (i !== null) {
        let s = i.route;
        return ((s.value._futureSnapshot = t.value), (s.children = t.children.map((a) => po(e, a))), s);
      }
    }
    let r = iI(t.value),
      o = t.children.map((i) => po(e, i));
    return new be(r, o);
  }
}
function oI(e, t, n) {
  return t.children.map((r) => {
    for (let o of n.children) if (e.shouldReuseRoute(r.value, o.value.snapshot)) return po(e, r, o);
    return po(e, r);
  });
}
function iI(e) {
  return new cn(
    new re(e.url),
    new re(e.params),
    new re(e.queryParams),
    new re(e.fragment),
    new re(e.data),
    e.outlet,
    e.component,
    e
  );
}
var ho = class {
    redirectTo;
    navigationBehaviorOptions;
    constructor(t, n) {
      ((this.redirectTo = t), (this.navigationBehaviorOptions = n));
    }
  },
  pg = 'ngNavigationCancelingError';
function Ns(e, t) {
  let { redirectTo: n, navigationBehaviorOptions: r } = tr(t)
      ? { redirectTo: t, navigationBehaviorOptions: void 0 }
      : t,
    o = hg(!1, ye.Redirect);
  return ((o.url = n), (o.navigationBehaviorOptions = r), o);
}
function hg(e, t) {
  let n = new Error(`NavigationCancelingError: ${e || ''}`);
  return ((n[pg] = !0), (n.cancellationCode = t), n);
}
function sI(e) {
  return gg(e) && tr(e.url);
}
function gg(e) {
  return !!e && e[pg];
}
var aI = (e, t, n, r) => O((o) => (new fl(t, o.targetRouterState, o.currentRouterState, n, r).activate(e), o)),
  fl = class {
    routeReuseStrategy;
    futureState;
    currState;
    forwardEvent;
    inputBindingEnabled;
    constructor(t, n, r, o, i) {
      ((this.routeReuseStrategy = t),
        (this.futureState = n),
        (this.currState = r),
        (this.forwardEvent = o),
        (this.inputBindingEnabled = i));
    }
    activate(t) {
      let n = this.futureState._root,
        r = this.currState ? this.currState._root : null;
      (this.deactivateChildRoutes(n, r, t), zu(this.futureState.root), this.activateChildRoutes(n, r, t));
    }
    deactivateChildRoutes(t, n, r) {
      let o = Yn(n);
      (t.children.forEach((i) => {
        let s = i.value.outlet;
        (this.deactivateRoutes(i, o[s], r), delete o[s]);
      }),
        Object.values(o).forEach((i) => {
          this.deactivateRouteAndItsChildren(i, r);
        }));
    }
    deactivateRoutes(t, n, r) {
      let o = t.value,
        i = n ? n.value : null;
      if (o === i)
        if (o.component) {
          let s = r.getContext(o.outlet);
          s && this.deactivateChildRoutes(t, n, s.children);
        } else this.deactivateChildRoutes(t, n, r);
      else i && this.deactivateRouteAndItsChildren(n, r);
    }
    deactivateRouteAndItsChildren(t, n) {
      t.value.component && this.routeReuseStrategy.shouldDetach(t.value.snapshot)
        ? this.detachAndStoreRouteSubtree(t, n)
        : this.deactivateRouteAndOutlet(t, n);
    }
    detachAndStoreRouteSubtree(t, n) {
      let r = n.getContext(t.value.outlet),
        o = r && t.value.component ? r.children : n,
        i = Yn(t);
      for (let s of Object.values(i)) this.deactivateRouteAndItsChildren(s, o);
      if (r && r.outlet) {
        let s = r.outlet.detach(),
          a = r.children.onOutletDeactivated();
        this.routeReuseStrategy.store(t.value.snapshot, { componentRef: s, route: t, contexts: a });
      }
    }
    deactivateRouteAndOutlet(t, n) {
      let r = n.getContext(t.value.outlet),
        o = r && t.value.component ? r.children : n,
        i = Yn(t);
      for (let s of Object.values(i)) this.deactivateRouteAndItsChildren(s, o);
      r &&
        (r.outlet && (r.outlet.deactivate(), r.children.onOutletDeactivated()), (r.attachRef = null), (r.route = null));
    }
    activateChildRoutes(t, n, r) {
      let o = Yn(n);
      (t.children.forEach((i) => {
        (this.activateRoutes(i, o[i.value.outlet], r), this.forwardEvent(new sl(i.value.snapshot)));
      }),
        t.children.length && this.forwardEvent(new ol(t.value.snapshot)));
    }
    activateRoutes(t, n, r) {
      let o = t.value,
        i = n ? n.value : null;
      if ((zu(o), o === i))
        if (o.component) {
          let s = r.getOrCreateContext(o.outlet);
          this.activateChildRoutes(t, n, s.children);
        } else this.activateChildRoutes(t, n, r);
      else if (o.component) {
        let s = r.getOrCreateContext(o.outlet);
        if (this.routeReuseStrategy.shouldAttach(o.snapshot)) {
          let a = this.routeReuseStrategy.retrieve(o.snapshot);
          (this.routeReuseStrategy.store(o.snapshot, null),
            s.children.onOutletReAttached(a.contexts),
            (s.attachRef = a.componentRef),
            (s.route = a.route.value),
            s.outlet && s.outlet.attach(a.componentRef, a.route.value),
            zu(a.route.value),
            this.activateChildRoutes(t, null, s.children));
        } else
          ((s.attachRef = null),
            (s.route = o),
            s.outlet && s.outlet.activateWith(o, s.injector),
            this.activateChildRoutes(t, null, s.children));
      } else this.activateChildRoutes(t, null, r);
    }
  },
  As = class {
    path;
    route;
    constructor(t) {
      ((this.path = t), (this.route = this.path[this.path.length - 1]));
    }
  },
  Jn = class {
    component;
    route;
    constructor(t, n) {
      ((this.component = t), (this.route = n));
    }
  };
function cI(e, t, n) {
  let r = e._root,
    o = t ? t._root : null;
  return io(r, o, n, [r.value]);
}
function uI(e) {
  let t = e.routeConfig ? e.routeConfig.canActivateChild : null;
  return !t || t.length === 0 ? null : { node: e, guards: t };
}
function sr(e, t) {
  let n = Symbol(),
    r = t.get(e, n);
  return r === n ? (typeof e == 'function' && !wa(e) ? e : t.get(e)) : r;
}
function io(e, t, n, r, o = { canDeactivateChecks: [], canActivateChecks: [] }) {
  let i = Yn(t);
  return (
    e.children.forEach((s) => {
      (lI(s, i[s.value.outlet], n, r.concat([s.value]), o), delete i[s.value.outlet]);
    }),
    Object.entries(i).forEach(([s, a]) => co(a, n.getContext(s), o)),
    o
  );
}
function lI(e, t, n, r, o = { canDeactivateChecks: [], canActivateChecks: [] }) {
  let i = e.value,
    s = t ? t.value : null,
    a = n ? n.getContext(e.value.outlet) : null;
  if (s && i.routeConfig === s.routeConfig) {
    let c = dI(s, i, i.routeConfig.runGuardsAndResolvers);
    (c ? o.canActivateChecks.push(new As(r)) : ((i.data = s.data), (i._resolvedData = s._resolvedData)),
      i.component ? io(e, t, a ? a.children : null, r, o) : io(e, t, n, r, o),
      c && a && a.outlet && a.outlet.isActivated && o.canDeactivateChecks.push(new Jn(a.outlet.component, s)));
  } else
    (s && co(t, a, o),
      o.canActivateChecks.push(new As(r)),
      i.component ? io(e, null, a ? a.children : null, r, o) : io(e, null, n, r, o));
  return o;
}
function dI(e, t, n) {
  if (typeof n == 'function') return n(e, t);
  switch (n) {
    case 'pathParamsChange':
      return !an(e.url, t.url);
    case 'pathParamsOrQueryParamsChange':
      return !an(e.url, t.url) || !Ye(e.queryParams, t.queryParams);
    case 'always':
      return !0;
    case 'paramsOrQueryParamsChange':
      return !ll(e, t) || !Ye(e.queryParams, t.queryParams);
    case 'paramsChange':
    default:
      return !ll(e, t);
  }
}
function co(e, t, n) {
  let r = Yn(e),
    o = e.value;
  (Object.entries(r).forEach(([i, s]) => {
    o.component ? (t ? co(s, t.children.getContext(i), n) : co(s, null, n)) : co(s, t, n);
  }),
    o.component
      ? t && t.outlet && t.outlet.isActivated
        ? n.canDeactivateChecks.push(new Jn(t.outlet.component, o))
        : n.canDeactivateChecks.push(new Jn(null, o))
      : n.canDeactivateChecks.push(new Jn(null, o)));
}
function Do(e) {
  return typeof e == 'function';
}
function fI(e) {
  return typeof e == 'boolean';
}
function pI(e) {
  return e && Do(e.canLoad);
}
function hI(e) {
  return e && Do(e.canActivate);
}
function gI(e) {
  return e && Do(e.canActivateChild);
}
function mI(e) {
  return e && Do(e.canDeactivate);
}
function vI(e) {
  return e && Do(e.canMatch);
}
function mg(e) {
  return e instanceof Qe || e?.name === 'EmptyError';
}
var vs = Symbol('INITIAL_VALUE');
function or() {
  return ge((e) =>
    Yo(e.map((t) => t.pipe(Ke(1), ca(vs)))).pipe(
      O((t) => {
        for (let n of t)
          if (n !== !0) {
            if (n === vs) return vs;
            if (n === !1 || yI(n)) return n;
          }
        return !0;
      }),
      he((t) => t !== vs),
      Ke(1)
    )
  );
}
function yI(e) {
  return tr(e) || e instanceof ho;
}
function DI(e, t) {
  return W((n) => {
    let {
      targetSnapshot: r,
      currentSnapshot: o,
      guards: { canActivateChecks: i, canDeactivateChecks: s }
    } = n;
    return s.length === 0 && i.length === 0
      ? C(j(m({}, n), { guardsResult: !0 }))
      : EI(s, r, o, e).pipe(
          W((a) => (a && fI(a) ? CI(r, i, e, t) : C(a))),
          O((a) => j(m({}, n), { guardsResult: a }))
        );
  });
}
function EI(e, t, n, r) {
  return z(e).pipe(
    W((o) => _I(o.component, o.route, n, t, r)),
    Je((o) => o !== !0, !0)
  );
}
function CI(e, t, n, r) {
  return z(t).pipe(
    bn((o) => wn(wI(o.route.parent, r), II(o.route, r), SI(e, o.path, n), bI(e, o.route, n))),
    Je((o) => o !== !0, !0)
  );
}
function II(e, t) {
  return (e !== null && t && t(new il(e)), C(!0));
}
function wI(e, t) {
  return (e !== null && t && t(new rl(e)), C(!0));
}
function bI(e, t, n) {
  let r = t.routeConfig ? t.routeConfig.canActivate : null;
  if (!r || r.length === 0) return C(!0);
  let o = r.map((i) =>
    pr(() => {
      let s = ir(t) ?? n,
        a = sr(i, s),
        c = hI(a) ? a.canActivate(t, e) : le(s, () => a(t, e));
      return ht(c).pipe(Je());
    })
  );
  return C(o).pipe(or());
}
function SI(e, t, n) {
  let r = t[t.length - 1],
    i = t
      .slice(0, t.length - 1)
      .reverse()
      .map((s) => uI(s))
      .filter((s) => s !== null)
      .map((s) =>
        pr(() => {
          let a = s.guards.map((c) => {
            let u = ir(s.node) ?? n,
              l = sr(c, u),
              d = gI(l) ? l.canActivateChild(r, e) : le(u, () => l(r, e));
            return ht(d).pipe(Je());
          });
          return C(a).pipe(or());
        })
      );
  return C(i).pipe(or());
}
function _I(e, t, n, r, o) {
  let i = t && t.routeConfig ? t.routeConfig.canDeactivate : null;
  if (!i || i.length === 0) return C(!0);
  let s = i.map((a) => {
    let c = ir(t) ?? o,
      u = sr(a, c),
      l = mI(u) ? u.canDeactivate(e, t, n, r) : le(c, () => u(e, t, n, r));
    return ht(l).pipe(Je());
  });
  return C(s).pipe(or());
}
function TI(e, t, n, r) {
  let o = t.canLoad;
  if (o === void 0 || o.length === 0) return C(!0);
  let i = o.map((s) => {
    let a = sr(s, e),
      c = pI(a) ? a.canLoad(t, n) : le(e, () => a(t, n));
    return ht(c);
  });
  return C(i).pipe(or(), vg(r));
}
function vg(e) {
  return ta(
    K((t) => {
      if (typeof t != 'boolean') throw Ns(e, t);
    }),
    O((t) => t === !0)
  );
}
function MI(e, t, n, r) {
  let o = t.canMatch;
  if (!o || o.length === 0) return C(!0);
  let i = o.map((s) => {
    let a = sr(s, e),
      c = vI(a) ? a.canMatch(t, n) : le(e, () => a(t, n));
    return ht(c);
  });
  return C(i).pipe(or(), vg(r));
}
var go = class {
    segmentGroup;
    constructor(t) {
      this.segmentGroup = t || null;
    }
  },
  mo = class extends Error {
    urlTree;
    constructor(t) {
      (super(), (this.urlTree = t));
    }
  };
function Zn(e) {
  return In(new go(e));
}
function NI(e) {
  return In(new v(4e3, !1));
}
function AI(e) {
  return In(hg(!1, ye.GuardRejected));
}
var pl = class {
  urlSerializer;
  urlTree;
  constructor(t, n) {
    ((this.urlSerializer = t), (this.urlTree = n));
  }
  lineralizeSegments(t, n) {
    let r = [],
      o = n.root;
    for (;;) {
      if (((r = r.concat(o.segments)), o.numberOfChildren === 0)) return C(r);
      if (o.numberOfChildren > 1 || !o.children[_]) return NI(`${t.redirectTo}`);
      o = o.children[_];
    }
  }
  applyRedirectCommands(t, n, r, o, i) {
    return RI(n, o, i).pipe(
      O((s) => {
        if (s instanceof pt) throw new mo(s);
        let a = this.applyRedirectCreateUrlTree(s, this.urlSerializer.parse(s), t, r);
        if (s[0] === '/') throw new mo(a);
        return a;
      })
    );
  }
  applyRedirectCreateUrlTree(t, n, r, o) {
    let i = this.createSegmentGroup(t, n.root, r, o);
    return new pt(i, this.createQueryParams(n.queryParams, this.urlTree.queryParams), n.fragment);
  }
  createQueryParams(t, n) {
    let r = {};
    return (
      Object.entries(t).forEach(([o, i]) => {
        if (typeof i == 'string' && i[0] === ':') {
          let a = i.substring(1);
          r[o] = n[a];
        } else r[o] = i;
      }),
      r
    );
  }
  createSegmentGroup(t, n, r, o) {
    let i = this.createSegments(t, n.segments, r, o),
      s = {};
    return (
      Object.entries(n.children).forEach(([a, c]) => {
        s[a] = this.createSegmentGroup(t, c, r, o);
      }),
      new F(i, s)
    );
  }
  createSegments(t, n, r, o) {
    return n.map((i) => (i.path[0] === ':' ? this.findPosParam(t, i, o) : this.findOrReturn(i, r)));
  }
  findPosParam(t, n, r) {
    let o = r[n.path.substring(1)];
    if (!o) throw new v(4001, !1);
    return o;
  }
  findOrReturn(t, n) {
    let r = 0;
    for (let o of n) {
      if (o.path === t.path) return (n.splice(r), o);
      r++;
    }
    return t;
  }
};
function RI(e, t, n) {
  if (typeof e == 'string') return C(e);
  let r = e,
    { queryParams: o, fragment: i, routeConfig: s, url: a, outlet: c, params: u, data: l, title: d } = t;
  return ht(
    le(n, () => r({ params: u, data: l, queryParams: o, fragment: i, routeConfig: s, url: a, outlet: c, title: d }))
  );
}
var hl = { matched: !1, consumedSegments: [], remainingSegments: [], parameters: {}, positionalParamSegments: {} };
function xI(e, t, n, r, o) {
  let i = yg(e, t, n);
  return i.matched ? ((r = XC(t, r)), MI(r, t, n, o).pipe(O((s) => (s === !0 ? i : m({}, hl))))) : C(i);
}
function yg(e, t, n) {
  if (t.path === '**') return OI(n);
  if (t.path === '')
    return t.pathMatch === 'full' && (e.hasChildren() || n.length > 0)
      ? m({}, hl)
      : { matched: !0, consumedSegments: [], remainingSegments: n, parameters: {}, positionalParamSegments: {} };
  let o = (t.matcher || _C)(n, e, t);
  if (!o) return m({}, hl);
  let i = {};
  Object.entries(o.posParams ?? {}).forEach(([a, c]) => {
    i[a] = c.path;
  });
  let s = o.consumed.length > 0 ? m(m({}, i), o.consumed[o.consumed.length - 1].parameters) : i;
  return {
    matched: !0,
    consumedSegments: o.consumed,
    remainingSegments: n.slice(o.consumed.length),
    parameters: s,
    positionalParamSegments: o.posParams ?? {}
  };
}
function OI(e) {
  return {
    matched: !0,
    parameters: e.length > 0 ? Yh(e).parameters : {},
    consumedSegments: e,
    remainingSegments: [],
    positionalParamSegments: {}
  };
}
function Gh(e, t, n, r) {
  return n.length > 0 && FI(e, n, r)
    ? { segmentGroup: new F(t, PI(r, new F(n, e.children))), slicedSegments: [] }
    : n.length === 0 && LI(e, n, r)
      ? { segmentGroup: new F(e.segments, kI(e, n, r, e.children)), slicedSegments: n }
      : { segmentGroup: new F(e.segments, e.children), slicedSegments: n };
}
function kI(e, t, n, r) {
  let o = {};
  for (let i of n)
    if (Os(e, t, i) && !r[He(i)]) {
      let s = new F([], {});
      o[He(i)] = s;
    }
  return m(m({}, r), o);
}
function PI(e, t) {
  let n = {};
  n[_] = t;
  for (let r of e)
    if (r.path === '' && He(r) !== _) {
      let o = new F([], {});
      n[He(r)] = o;
    }
  return n;
}
function FI(e, t, n) {
  return n.some((r) => Os(e, t, r) && He(r) !== _);
}
function LI(e, t, n) {
  return n.some((r) => Os(e, t, r));
}
function Os(e, t, n) {
  return (e.hasChildren() || t.length > 0) && n.pathMatch === 'full' ? !1 : n.path === '';
}
function jI(e, t, n) {
  return t.length === 0 && !e.children[n];
}
var gl = class {};
function BI(e, t, n, r, o, i, s = 'emptyOnly') {
  return new ml(e, t, n, r, o, s, i).recognize();
}
var VI = 31,
  ml = class {
    injector;
    configLoader;
    rootComponentType;
    config;
    urlTree;
    paramsInheritanceStrategy;
    urlSerializer;
    applyRedirects;
    absoluteRedirectCount = 0;
    allowRedirects = !0;
    constructor(t, n, r, o, i, s, a) {
      ((this.injector = t),
        (this.configLoader = n),
        (this.rootComponentType = r),
        (this.config = o),
        (this.urlTree = i),
        (this.paramsInheritanceStrategy = s),
        (this.urlSerializer = a),
        (this.applyRedirects = new pl(this.urlSerializer, this.urlTree)));
    }
    noMatchError(t) {
      return new v(4002, `'${t.segmentGroup}'`);
    }
    recognize() {
      let t = Gh(this.urlTree.root, [], [], this.config).segmentGroup;
      return this.match(t).pipe(
        O(({ children: n, rootSnapshot: r }) => {
          let o = new be(r, n),
            i = new Ms('', o),
            s = GC(r, [], this.urlTree.queryParams, this.urlTree.fragment);
          return (
            (s.queryParams = this.urlTree.queryParams),
            (i.url = this.urlSerializer.serialize(s)),
            { state: i, tree: s }
          );
        })
      );
    }
    match(t) {
      let n = new Kn(
        [],
        Object.freeze({}),
        Object.freeze(m({}, this.urlTree.queryParams)),
        this.urlTree.fragment,
        Object.freeze({}),
        _,
        this.rootComponentType,
        null,
        {}
      );
      return this.processSegmentGroup(this.injector, this.config, t, _, n).pipe(
        O((r) => ({ children: r, rootSnapshot: n })),
        mt((r) => {
          if (r instanceof mo) return ((this.urlTree = r.urlTree), this.match(r.urlTree.root));
          throw r instanceof go ? this.noMatchError(r) : r;
        })
      );
    }
    processSegmentGroup(t, n, r, o, i) {
      return r.segments.length === 0 && r.hasChildren()
        ? this.processChildren(t, n, r, i)
        : this.processSegment(t, n, r, r.segments, o, !0, i).pipe(O((s) => (s instanceof be ? [s] : [])));
    }
    processChildren(t, n, r, o) {
      let i = [];
      for (let s of Object.keys(r.children)) s === 'primary' ? i.unshift(s) : i.push(s);
      return z(i).pipe(
        bn((s) => {
          let a = r.children[s],
            c = eI(n, s);
          return this.processSegmentGroup(t, c, a, s, o);
        }),
        aa((s, a) => (s.push(...a), s)),
        vt(null),
        sa(),
        W((s) => {
          if (s === null) return Zn(r);
          let a = Dg(s);
          return (HI(a), C(a));
        })
      );
    }
    processSegment(t, n, r, o, i, s, a) {
      return z(n).pipe(
        bn((c) =>
          this.processSegmentAgainstRoute(c._injector ?? t, n, c, r, o, i, s, a).pipe(
            mt((u) => {
              if (u instanceof go) return C(null);
              throw u;
            })
          )
        ),
        Je((c) => !!c),
        mt((c) => {
          if (mg(c)) return jI(r, o, i) ? C(new gl()) : Zn(r);
          throw c;
        })
      );
    }
    processSegmentAgainstRoute(t, n, r, o, i, s, a, c) {
      return He(r) !== s && (s === _ || !Os(o, i, r))
        ? Zn(o)
        : r.redirectTo === void 0
          ? this.matchSegmentAgainstRoute(t, o, r, i, s, c)
          : this.allowRedirects && a
            ? this.expandSegmentAgainstRouteUsingRedirect(t, o, n, r, i, s, c)
            : Zn(o);
    }
    expandSegmentAgainstRouteUsingRedirect(t, n, r, o, i, s, a) {
      let {
        matched: c,
        parameters: u,
        consumedSegments: l,
        positionalParamSegments: d,
        remainingSegments: p
      } = yg(n, o, i);
      if (!c) return Zn(n);
      typeof o.redirectTo == 'string' &&
        o.redirectTo[0] === '/' &&
        (this.absoluteRedirectCount++, this.absoluteRedirectCount > VI && (this.allowRedirects = !1));
      let f = new Kn(
          i,
          u,
          Object.freeze(m({}, this.urlTree.queryParams)),
          this.urlTree.fragment,
          qh(o),
          He(o),
          o.component ?? o._loadedComponent ?? null,
          o,
          Wh(o)
        ),
        g = Ts(f, a, this.paramsInheritanceStrategy);
      return (
        (f.params = Object.freeze(g.params)),
        (f.data = Object.freeze(g.data)),
        this.applyRedirects.applyRedirectCommands(l, o.redirectTo, d, f, t).pipe(
          ge((M) => this.applyRedirects.lineralizeSegments(o, M)),
          W((M) => this.processSegment(t, r, n, M.concat(p), s, !1, a))
        )
      );
    }
    matchSegmentAgainstRoute(t, n, r, o, i, s) {
      let a = xI(n, r, o, t, this.urlSerializer);
      return (
        r.path === '**' && (n.children = {}),
        a.pipe(
          ge((c) =>
            c.matched
              ? ((t = r._injector ?? t),
                this.getChildConfig(t, r, o).pipe(
                  ge(({ routes: u }) => {
                    let l = r._loadedInjector ?? t,
                      { parameters: d, consumedSegments: p, remainingSegments: f } = c,
                      g = new Kn(
                        p,
                        d,
                        Object.freeze(m({}, this.urlTree.queryParams)),
                        this.urlTree.fragment,
                        qh(r),
                        He(r),
                        r.component ?? r._loadedComponent ?? null,
                        r,
                        Wh(r)
                      ),
                      E = Ts(g, s, this.paramsInheritanceStrategy);
                    ((g.params = Object.freeze(E.params)), (g.data = Object.freeze(E.data)));
                    let { segmentGroup: M, slicedSegments: N } = Gh(n, p, f, u);
                    if (N.length === 0 && M.hasChildren())
                      return this.processChildren(l, u, M, g).pipe(O((Eo) => new be(g, Eo)));
                    if (u.length === 0 && N.length === 0) return C(new be(g, []));
                    let Ot = He(r) === i;
                    return this.processSegment(l, u, M, N, Ot ? _ : i, !0, g).pipe(
                      O((Eo) => new be(g, Eo instanceof be ? [Eo] : []))
                    );
                  })
                ))
              : Zn(n)
          )
        )
      );
    }
    getChildConfig(t, n, r) {
      return n.children
        ? C({ routes: n.children, injector: t })
        : n.loadChildren
          ? n._loadedRoutes !== void 0
            ? C({ routes: n._loadedRoutes, injector: n._loadedInjector })
            : TI(t, n, r, this.urlSerializer).pipe(
                W((o) =>
                  o
                    ? this.configLoader.loadChildren(t, n).pipe(
                        K((i) => {
                          ((n._loadedRoutes = i.routes), (n._loadedInjector = i.injector));
                        })
                      )
                    : AI(n)
                )
              )
          : C({ routes: [], injector: t });
    }
  };
function HI(e) {
  e.sort((t, n) =>
    t.value.outlet === _ ? -1 : n.value.outlet === _ ? 1 : t.value.outlet.localeCompare(n.value.outlet)
  );
}
function UI(e) {
  let t = e.value.routeConfig;
  return t && t.path === '';
}
function Dg(e) {
  let t = [],
    n = new Set();
  for (let r of e) {
    if (!UI(r)) {
      t.push(r);
      continue;
    }
    let o = t.find((i) => r.value.routeConfig === i.value.routeConfig);
    o !== void 0 ? (o.children.push(...r.children), n.add(o)) : t.push(r);
  }
  for (let r of n) {
    let o = Dg(r.children);
    t.push(new be(r.value, o));
  }
  return t.filter((r) => !n.has(r));
}
function qh(e) {
  return e.data || {};
}
function Wh(e) {
  return e.resolve || {};
}
function $I(e, t, n, r, o, i) {
  return W((s) =>
    BI(e, t, n, r, s.extractedUrl, o, i).pipe(
      O(({ state: a, tree: c }) => j(m({}, s), { targetSnapshot: a, urlAfterRedirects: c }))
    )
  );
}
function zI(e, t) {
  return W((n) => {
    let {
      targetSnapshot: r,
      guards: { canActivateChecks: o }
    } = n;
    if (!o.length) return C(n);
    let i = new Set(o.map((c) => c.route)),
      s = new Set();
    for (let c of i) if (!s.has(c)) for (let u of Eg(c)) s.add(u);
    let a = 0;
    return z(s).pipe(
      bn((c) => (i.has(c) ? GI(c, r, e, t) : ((c.data = Ts(c, c.parent, e).resolve), C(void 0)))),
      K(() => a++),
      Sn(1),
      W((c) => (a === s.size ? C(n) : fe))
    );
  });
}
function Eg(e) {
  let t = e.children.map((n) => Eg(n)).flat();
  return [e, ...t];
}
function GI(e, t, n, r) {
  let o = e.routeConfig,
    i = e._resolve;
  return (
    o?.title !== void 0 && !lg(o) && (i[vo] = o.title),
    pr(
      () => (
        (e.data = Ts(e, e.parent, n).resolve),
        qI(i, e, t, r).pipe(O((s) => ((e._resolvedData = s), (e.data = m(m({}, e.data), s)), null)))
      )
    )
  );
}
function qI(e, t, n, r) {
  let o = Wu(e);
  if (o.length === 0) return C({});
  let i = {};
  return z(o).pipe(
    W((s) =>
      WI(e[s], t, n, r).pipe(
        Je(),
        K((a) => {
          if (a instanceof ho) throw Ns(new er(), a);
          i[s] = a;
        })
      )
    ),
    Sn(1),
    O(() => i),
    mt((s) => (mg(s) ? fe : In(s)))
  );
}
function WI(e, t, n, r) {
  let o = ir(t) ?? r,
    i = sr(e, o),
    s = i.resolve ? i.resolve(t, n) : le(o, () => i(t, n));
  return ht(s);
}
function Gu(e) {
  return ge((t) => {
    let n = e(t);
    return n ? z(n).pipe(O(() => t)) : C(t);
  });
}
var Cg = (() => {
    class e {
      buildTitle(n) {
        let r,
          o = n.root;
        for (; o !== void 0; )
          ((r = this.getResolvedTitleForRoute(o) ?? r), (o = o.children.find((i) => i.outlet === _)));
        return r;
      }
      getResolvedTitleForRoute(n) {
        return n.data[vo];
      }
      static ɵfac = function (r) {
        return new (r || e)();
      };
      static ɵprov = y({ token: e, factory: () => h(ZI), providedIn: 'root' });
    }
    return e;
  })(),
  ZI = (() => {
    class e extends Cg {
      title;
      constructor(n) {
        (super(), (this.title = n));
      }
      updateTitle(n) {
        let r = this.buildTitle(n);
        r !== void 0 && this.title.setTitle(r);
      }
      static ɵfac = function (r) {
        return new (r || e)(b(Vh));
      };
      static ɵprov = y({ token: e, factory: e.ɵfac, providedIn: 'root' });
    }
    return e;
  })(),
  ks = new D('', { providedIn: 'root', factory: () => ({}) }),
  Ps = new D(''),
  Ig = (() => {
    class e {
      componentLoaders = new WeakMap();
      childrenLoaders = new WeakMap();
      onLoadStartListener;
      onLoadEndListener;
      compiler = h(Du);
      loadComponent(n, r) {
        if (this.componentLoaders.get(r)) return this.componentLoaders.get(r);
        if (r._loadedComponent) return C(r._loadedComponent);
        this.onLoadStartListener && this.onLoadStartListener(r);
        let o = ht(le(n, () => r.loadComponent())).pipe(
            O(wg),
            ge(bg),
            K((s) => {
              (this.onLoadEndListener && this.onLoadEndListener(r), (r._loadedComponent = s));
            }),
            hr(() => {
              this.componentLoaders.delete(r);
            })
          ),
          i = new Cn(o, () => new q()).pipe(En());
        return (this.componentLoaders.set(r, i), i);
      }
      loadChildren(n, r) {
        if (this.childrenLoaders.get(r)) return this.childrenLoaders.get(r);
        if (r._loadedRoutes) return C({ routes: r._loadedRoutes, injector: r._loadedInjector });
        this.onLoadStartListener && this.onLoadStartListener(r);
        let i = YI(r, this.compiler, n, this.onLoadEndListener).pipe(
            hr(() => {
              this.childrenLoaders.delete(r);
            })
          ),
          s = new Cn(i, () => new q()).pipe(En());
        return (this.childrenLoaders.set(r, s), s);
      }
      static ɵfac = function (r) {
        return new (r || e)();
      };
      static ɵprov = y({ token: e, factory: e.ɵfac, providedIn: 'root' });
    }
    return e;
  })();
function YI(e, t, n, r) {
  return ht(le(n, () => e.loadChildren())).pipe(
    O(wg),
    ge(bg),
    W((o) => (o instanceof Ki || Array.isArray(o) ? C(o) : z(t.compileModuleAsync(o)))),
    O((o) => {
      r && r(e);
      let i,
        s,
        a = !1;
      return (
        Array.isArray(o)
          ? ((s = o), (a = !0))
          : ((i = o.create(n).injector), (s = i.get(Ps, [], { optional: !0, self: !0 }).flat())),
        { routes: s.map(Dl), injector: i }
      );
    })
  );
}
function QI(e) {
  return e && typeof e == 'object' && 'default' in e;
}
function wg(e) {
  return QI(e) ? e.default : e;
}
function bg(e) {
  return C(e);
}
var El = (() => {
    class e {
      static ɵfac = function (r) {
        return new (r || e)();
      };
      static ɵprov = y({ token: e, factory: () => h(KI), providedIn: 'root' });
    }
    return e;
  })(),
  KI = (() => {
    class e {
      shouldProcessUrl(n) {
        return !0;
      }
      extract(n) {
        return n;
      }
      merge(n, r) {
        return n;
      }
      static ɵfac = function (r) {
        return new (r || e)();
      };
      static ɵprov = y({ token: e, factory: e.ɵfac, providedIn: 'root' });
    }
    return e;
  })(),
  Sg = new D('');
var _g = new D(''),
  Tg = (() => {
    class e {
      currentNavigation = Ge(null, { equal: () => !1 });
      currentTransition = null;
      lastSuccessfulNavigation = null;
      events = new q();
      transitionAbortWithErrorSubject = new q();
      configLoader = h(Ig);
      environmentInjector = h(oe);
      destroyRef = h(Le);
      urlSerializer = h(Rs);
      rootContexts = h(yo);
      location = h(Wn);
      inputBindingEnabled = h(xs, { optional: !0 }) !== null;
      titleStrategy = h(Cg);
      options = h(ks, { optional: !0 }) || {};
      paramsInheritanceStrategy = this.options.paramsInheritanceStrategy || 'emptyOnly';
      urlHandlingStrategy = h(El);
      createViewTransition = h(Sg, { optional: !0 });
      navigationErrorHandler = h(_g, { optional: !0 });
      navigationId = 0;
      get hasRequestedNavigation() {
        return this.navigationId !== 0;
      }
      transitions;
      afterPreactivation = () => C(void 0);
      rootComponentType = null;
      destroyed = !1;
      constructor() {
        let n = (o) => this.events.next(new tl(o)),
          r = (o) => this.events.next(new nl(o));
        ((this.configLoader.onLoadEndListener = r),
          (this.configLoader.onLoadStartListener = n),
          this.destroyRef.onDestroy(() => {
            this.destroyed = !0;
          }));
      }
      complete() {
        this.transitions?.complete();
      }
      handleNavigationRequest(n) {
        let r = ++this.navigationId;
        ct(() => {
          this.transitions?.next(
            j(m({}, n), {
              extractedUrl: this.urlHandlingStrategy.extract(n.rawUrl),
              targetSnapshot: null,
              targetRouterState: null,
              guards: { canActivateChecks: [], canDeactivateChecks: [] },
              guardsResult: null,
              abortController: new AbortController(),
              id: r
            })
          );
        });
      }
      setupNavigations(n) {
        return (
          (this.transitions = new re(null)),
          this.transitions.pipe(
            he((r) => r !== null),
            ge((r) => {
              let o = !1;
              return C(r).pipe(
                ge((i) => {
                  if (this.navigationId > r.id)
                    return (this.cancelNavigationTransition(r, '', ye.SupersededByNewNavigation), fe);
                  ((this.currentTransition = r),
                    this.currentNavigation.set({
                      id: i.id,
                      initialUrl: i.rawUrl,
                      extractedUrl: i.extractedUrl,
                      targetBrowserUrl:
                        typeof i.extras.browserUrl == 'string'
                          ? this.urlSerializer.parse(i.extras.browserUrl)
                          : i.extras.browserUrl,
                      trigger: i.source,
                      extras: i.extras,
                      previousNavigation: this.lastSuccessfulNavigation
                        ? j(m({}, this.lastSuccessfulNavigation), { previousNavigation: null })
                        : null,
                      abort: () => i.abortController.abort()
                    }));
                  let s = !n.navigated || this.isUpdatingInternalState() || this.isUpdatedBrowserUrl(),
                    a = i.extras.onSameUrlNavigation ?? n.onSameUrlNavigation;
                  if (!s && a !== 'reload')
                    return (
                      this.events.next(
                        new xt(i.id, this.urlSerializer.serialize(i.rawUrl), '', ws.IgnoredSameUrlNavigation)
                      ),
                      i.resolve(!1),
                      fe
                    );
                  if (this.urlHandlingStrategy.shouldProcessUrl(i.rawUrl))
                    return C(i).pipe(
                      ge(
                        (c) => (
                          this.events.next(
                            new nr(c.id, this.urlSerializer.serialize(c.extractedUrl), c.source, c.restoredState)
                          ),
                          c.id !== this.navigationId ? fe : Promise.resolve(c)
                        )
                      ),
                      $I(
                        this.environmentInjector,
                        this.configLoader,
                        this.rootComponentType,
                        n.config,
                        this.urlSerializer,
                        this.paramsInheritanceStrategy
                      ),
                      K((c) => {
                        ((r.targetSnapshot = c.targetSnapshot),
                          (r.urlAfterRedirects = c.urlAfterRedirects),
                          this.currentNavigation.update((l) => ((l.finalUrl = c.urlAfterRedirects), l)));
                        let u = new bs(
                          c.id,
                          this.urlSerializer.serialize(c.extractedUrl),
                          this.urlSerializer.serialize(c.urlAfterRedirects),
                          c.targetSnapshot
                        );
                        this.events.next(u);
                      })
                    );
                  if (s && this.urlHandlingStrategy.shouldProcessUrl(i.currentRawUrl)) {
                    let { id: c, extractedUrl: u, source: l, restoredState: d, extras: p } = i,
                      f = new nr(c, this.urlSerializer.serialize(u), l, d);
                    this.events.next(f);
                    let g = cg(this.rootComponentType).snapshot;
                    return (
                      (this.currentTransition = r =
                        j(m({}, i), {
                          targetSnapshot: g,
                          urlAfterRedirects: u,
                          extras: j(m({}, p), { skipLocationChange: !1, replaceUrl: !1 })
                        })),
                      this.currentNavigation.update((E) => ((E.finalUrl = u), E)),
                      C(r)
                    );
                  } else
                    return (
                      this.events.next(
                        new xt(i.id, this.urlSerializer.serialize(i.extractedUrl), '', ws.IgnoredByUrlHandlingStrategy)
                      ),
                      i.resolve(!1),
                      fe
                    );
                }),
                K((i) => {
                  let s = new Ku(
                    i.id,
                    this.urlSerializer.serialize(i.extractedUrl),
                    this.urlSerializer.serialize(i.urlAfterRedirects),
                    i.targetSnapshot
                  );
                  this.events.next(s);
                }),
                O(
                  (i) => (
                    (this.currentTransition = r =
                      j(m({}, i), { guards: cI(i.targetSnapshot, i.currentSnapshot, this.rootContexts) })),
                    r
                  )
                ),
                DI(this.environmentInjector, (i) => this.events.next(i)),
                K((i) => {
                  if (((r.guardsResult = i.guardsResult), i.guardsResult && typeof i.guardsResult != 'boolean'))
                    throw Ns(this.urlSerializer, i.guardsResult);
                  let s = new Ju(
                    i.id,
                    this.urlSerializer.serialize(i.extractedUrl),
                    this.urlSerializer.serialize(i.urlAfterRedirects),
                    i.targetSnapshot,
                    !!i.guardsResult
                  );
                  this.events.next(s);
                }),
                he((i) => (i.guardsResult ? !0 : (this.cancelNavigationTransition(i, '', ye.GuardRejected), !1))),
                Gu((i) => {
                  if (i.guards.canActivateChecks.length !== 0)
                    return C(i).pipe(
                      K((s) => {
                        let a = new Xu(
                          s.id,
                          this.urlSerializer.serialize(s.extractedUrl),
                          this.urlSerializer.serialize(s.urlAfterRedirects),
                          s.targetSnapshot
                        );
                        this.events.next(a);
                      }),
                      ge((s) => {
                        let a = !1;
                        return C(s).pipe(
                          zI(this.paramsInheritanceStrategy, this.environmentInjector),
                          K({
                            next: () => (a = !0),
                            complete: () => {
                              a || this.cancelNavigationTransition(s, '', ye.NoDataFromResolver);
                            }
                          })
                        );
                      }),
                      K((s) => {
                        let a = new el(
                          s.id,
                          this.urlSerializer.serialize(s.extractedUrl),
                          this.urlSerializer.serialize(s.urlAfterRedirects),
                          s.targetSnapshot
                        );
                        this.events.next(a);
                      })
                    );
                }),
                Gu((i) => {
                  let s = (a) => {
                    let c = [];
                    if (a.routeConfig?.loadComponent) {
                      let u = ir(a) ?? this.environmentInjector;
                      c.push(
                        this.configLoader.loadComponent(u, a.routeConfig).pipe(
                          K((l) => {
                            a.component = l;
                          }),
                          O(() => {})
                        )
                      );
                    }
                    for (let u of a.children) c.push(...s(u));
                    return c;
                  };
                  return Yo(s(i.targetSnapshot.root)).pipe(vt(null), Ke(1));
                }),
                Gu(() => this.afterPreactivation()),
                ge(() => {
                  let { currentSnapshot: i, targetSnapshot: s } = r,
                    a = this.createViewTransition?.(this.environmentInjector, i.root, s.root);
                  return a ? z(a).pipe(O(() => r)) : C(r);
                }),
                O((i) => {
                  let s = rI(n.routeReuseStrategy, i.targetSnapshot, i.currentRouterState);
                  return (
                    (this.currentTransition = r = j(m({}, i), { targetRouterState: s })),
                    this.currentNavigation.update((a) => ((a.targetRouterState = s), a)),
                    r
                  );
                }),
                K(() => {
                  this.events.next(new fo());
                }),
                aI(this.rootContexts, n.routeReuseStrategy, (i) => this.events.next(i), this.inputBindingEnabled),
                Ke(1),
                _n(
                  new A((i) => {
                    let s = r.abortController.signal,
                      a = () => i.next();
                    return (s.addEventListener('abort', a), () => s.removeEventListener('abort', a));
                  }).pipe(
                    he(() => !o && !r.targetRouterState),
                    K(() => {
                      this.cancelNavigationTransition(r, r.abortController.signal.reason + '', ye.Aborted);
                    })
                  )
                ),
                K({
                  next: (i) => {
                    ((o = !0),
                      (this.lastSuccessfulNavigation = ct(this.currentNavigation)),
                      this.events.next(
                        new Rt(
                          i.id,
                          this.urlSerializer.serialize(i.extractedUrl),
                          this.urlSerializer.serialize(i.urlAfterRedirects)
                        )
                      ),
                      this.titleStrategy?.updateTitle(i.targetRouterState.snapshot),
                      i.resolve(!0));
                  },
                  complete: () => {
                    o = !0;
                  }
                }),
                _n(
                  this.transitionAbortWithErrorSubject.pipe(
                    K((i) => {
                      throw i;
                    })
                  )
                ),
                hr(() => {
                  (o || this.cancelNavigationTransition(r, '', ye.SupersededByNewNavigation),
                    this.currentTransition?.id === r.id &&
                      (this.currentNavigation.set(null), (this.currentTransition = null)));
                }),
                mt((i) => {
                  if (this.destroyed) return (r.resolve(!1), fe);
                  if (((o = !0), gg(i)))
                    (this.events.next(
                      new ft(r.id, this.urlSerializer.serialize(r.extractedUrl), i.message, i.cancellationCode)
                    ),
                      sI(i) ? this.events.next(new rr(i.url, i.navigationBehaviorOptions)) : r.resolve(!1));
                  else {
                    let s = new lo(r.id, this.urlSerializer.serialize(r.extractedUrl), i, r.targetSnapshot ?? void 0);
                    try {
                      let a = le(this.environmentInjector, () => this.navigationErrorHandler?.(s));
                      if (a instanceof ho) {
                        let { message: c, cancellationCode: u } = Ns(this.urlSerializer, a);
                        (this.events.next(new ft(r.id, this.urlSerializer.serialize(r.extractedUrl), c, u)),
                          this.events.next(new rr(a.redirectTo, a.navigationBehaviorOptions)));
                      } else throw (this.events.next(s), i);
                    } catch (a) {
                      this.options.resolveNavigationPromiseOnError ? r.resolve(!1) : r.reject(a);
                    }
                  }
                  return fe;
                })
              );
            })
          )
        );
      }
      cancelNavigationTransition(n, r, o) {
        let i = new ft(n.id, this.urlSerializer.serialize(n.extractedUrl), r, o);
        (this.events.next(i), n.resolve(!1));
      }
      isUpdatingInternalState() {
        return this.currentTransition?.extractedUrl.toString() !== this.currentTransition?.currentUrlTree.toString();
      }
      isUpdatedBrowserUrl() {
        let n = this.urlHandlingStrategy.extract(this.urlSerializer.parse(this.location.path(!0))),
          r = ct(this.currentNavigation),
          o = r?.targetBrowserUrl ?? r?.extractedUrl;
        return n.toString() !== o?.toString() && !r?.extras.skipLocationChange;
      }
      static ɵfac = function (r) {
        return new (r || e)();
      };
      static ɵprov = y({ token: e, factory: e.ɵfac, providedIn: 'root' });
    }
    return e;
  })();
function JI(e) {
  return e !== ao;
}
var XI = (() => {
    class e {
      static ɵfac = function (r) {
        return new (r || e)();
      };
      static ɵprov = y({ token: e, factory: () => h(ew), providedIn: 'root' });
    }
    return e;
  })(),
  vl = class {
    shouldDetach(t) {
      return !1;
    }
    store(t, n) {}
    shouldAttach(t) {
      return !1;
    }
    retrieve(t) {
      return null;
    }
    shouldReuseRoute(t, n) {
      return t.routeConfig === n.routeConfig;
    }
  },
  ew = (() => {
    class e extends vl {
      static ɵfac = (() => {
        let n;
        return function (o) {
          return (n || (n = Ui(e)))(o || e);
        };
      })();
      static ɵprov = y({ token: e, factory: e.ɵfac, providedIn: 'root' });
    }
    return e;
  })(),
  Mg = (() => {
    class e {
      urlSerializer = h(Rs);
      options = h(ks, { optional: !0 }) || {};
      canceledNavigationResolution = this.options.canceledNavigationResolution || 'replace';
      location = h(Wn);
      urlHandlingStrategy = h(El);
      urlUpdateStrategy = this.options.urlUpdateStrategy || 'deferred';
      currentUrlTree = new pt();
      getCurrentUrlTree() {
        return this.currentUrlTree;
      }
      rawUrlTree = this.currentUrlTree;
      getRawUrlTree() {
        return this.rawUrlTree;
      }
      createBrowserPath({ finalUrl: n, initialUrl: r, targetBrowserUrl: o }) {
        let i = n !== void 0 ? this.urlHandlingStrategy.merge(n, r) : r,
          s = o ?? i;
        return s instanceof pt ? this.urlSerializer.serialize(s) : s;
      }
      commitTransition({ targetRouterState: n, finalUrl: r, initialUrl: o }) {
        r && n
          ? ((this.currentUrlTree = r),
            (this.rawUrlTree = this.urlHandlingStrategy.merge(r, o)),
            (this.routerState = n))
          : (this.rawUrlTree = o);
      }
      routerState = cg(null);
      getRouterState() {
        return this.routerState;
      }
      stateMemento = this.createStateMemento();
      updateStateMemento() {
        this.stateMemento = this.createStateMemento();
      }
      createStateMemento() {
        return { rawUrlTree: this.rawUrlTree, currentUrlTree: this.currentUrlTree, routerState: this.routerState };
      }
      resetInternalState({ finalUrl: n }) {
        ((this.routerState = this.stateMemento.routerState),
          (this.currentUrlTree = this.stateMemento.currentUrlTree),
          (this.rawUrlTree = this.urlHandlingStrategy.merge(this.currentUrlTree, n ?? this.rawUrlTree)));
      }
      static ɵfac = function (r) {
        return new (r || e)();
      };
      static ɵprov = y({ token: e, factory: () => h(tw), providedIn: 'root' });
    }
    return e;
  })(),
  tw = (() => {
    class e extends Mg {
      currentPageId = 0;
      lastSuccessfulId = -1;
      restoredState() {
        return this.location.getState();
      }
      get browserPageId() {
        return this.canceledNavigationResolution !== 'computed'
          ? this.currentPageId
          : (this.restoredState()?.ɵrouterPageId ?? this.currentPageId);
      }
      registerNonRouterCurrentEntryChangeListener(n) {
        return this.location.subscribe((r) => {
          r.type === 'popstate' &&
            setTimeout(() => {
              n(r.url, r.state, 'popstate');
            });
        });
      }
      handleRouterEvent(n, r) {
        n instanceof nr
          ? this.updateStateMemento()
          : n instanceof xt
            ? this.commitTransition(r)
            : n instanceof bs
              ? this.urlUpdateStrategy === 'eager' &&
                (r.extras.skipLocationChange || this.setBrowserUrl(this.createBrowserPath(r), r))
              : n instanceof fo
                ? (this.commitTransition(r),
                  this.urlUpdateStrategy === 'deferred' &&
                    !r.extras.skipLocationChange &&
                    this.setBrowserUrl(this.createBrowserPath(r), r))
                : n instanceof ft && n.code !== ye.SupersededByNewNavigation && n.code !== ye.Redirect
                  ? this.restoreHistory(r)
                  : n instanceof lo
                    ? this.restoreHistory(r, !0)
                    : n instanceof Rt && ((this.lastSuccessfulId = n.id), (this.currentPageId = this.browserPageId));
      }
      setBrowserUrl(n, { extras: r, id: o }) {
        let { replaceUrl: i, state: s } = r;
        if (this.location.isCurrentPathEqualTo(n) || i) {
          let a = this.browserPageId,
            c = m(m({}, s), this.generateNgRouterState(o, a));
          this.location.replaceState(n, '', c);
        } else {
          let a = m(m({}, s), this.generateNgRouterState(o, this.browserPageId + 1));
          this.location.go(n, '', a);
        }
      }
      restoreHistory(n, r = !1) {
        if (this.canceledNavigationResolution === 'computed') {
          let o = this.browserPageId,
            i = this.currentPageId - o;
          i !== 0
            ? this.location.historyGo(i)
            : this.getCurrentUrlTree() === n.finalUrl &&
              i === 0 &&
              (this.resetInternalState(n), this.resetUrlToCurrentUrlTree());
        } else
          this.canceledNavigationResolution === 'replace' &&
            (r && this.resetInternalState(n), this.resetUrlToCurrentUrlTree());
      }
      resetUrlToCurrentUrlTree() {
        this.location.replaceState(
          this.urlSerializer.serialize(this.getRawUrlTree()),
          '',
          this.generateNgRouterState(this.lastSuccessfulId, this.currentPageId)
        );
      }
      generateNgRouterState(n, r) {
        return this.canceledNavigationResolution === 'computed'
          ? { navigationId: n, ɵrouterPageId: r }
          : { navigationId: n };
      }
      static ɵfac = (() => {
        let n;
        return function (o) {
          return (n || (n = Ui(e)))(o || e);
        };
      })();
      static ɵprov = y({ token: e, factory: e.ɵfac, providedIn: 'root' });
    }
    return e;
  })();
function Ng(e, t) {
  e.events
    .pipe(
      he((n) => n instanceof Rt || n instanceof ft || n instanceof lo || n instanceof xt),
      O((n) =>
        n instanceof Rt || n instanceof xt
          ? 0
          : (n instanceof ft ? n.code === ye.Redirect || n.code === ye.SupersededByNewNavigation : !1)
            ? 2
            : 1
      ),
      he((n) => n !== 2),
      Ke(1)
    )
    .subscribe(() => {
      t();
    });
}
var nw = { paths: 'exact', fragment: 'ignored', matrixParams: 'ignored', queryParams: 'exact' },
  rw = { paths: 'subset', fragment: 'ignored', matrixParams: 'ignored', queryParams: 'subset' },
  Cl = (() => {
    class e {
      get currentUrlTree() {
        return this.stateManager.getCurrentUrlTree();
      }
      get rawUrlTree() {
        return this.stateManager.getRawUrlTree();
      }
      disposed = !1;
      nonRouterCurrentEntryChangeSubscription;
      console = h(uu);
      stateManager = h(Mg);
      options = h(ks, { optional: !0 }) || {};
      pendingTasks = h(it);
      urlUpdateStrategy = this.options.urlUpdateStrategy || 'deferred';
      navigationTransitions = h(Tg);
      urlSerializer = h(Rs);
      location = h(Wn);
      urlHandlingStrategy = h(El);
      injector = h(oe);
      _events = new q();
      get events() {
        return this._events;
      }
      get routerState() {
        return this.stateManager.getRouterState();
      }
      navigated = !1;
      routeReuseStrategy = h(XI);
      onSameUrlNavigation = this.options.onSameUrlNavigation || 'ignore';
      config = h(Ps, { optional: !0 })?.flat() ?? [];
      componentInputBindingEnabled = !!h(xs, { optional: !0 });
      currentNavigation = this.navigationTransitions.currentNavigation.asReadonly();
      constructor() {
        (this.resetConfig(this.config),
          this.navigationTransitions.setupNavigations(this).subscribe({
            error: (n) => {
              this.console.warn(n);
            }
          }),
          this.subscribeToNavigationEvents());
      }
      eventsSubscription = new $();
      subscribeToNavigationEvents() {
        let n = this.navigationTransitions.events.subscribe((r) => {
          try {
            let o = this.navigationTransitions.currentTransition,
              i = ct(this.navigationTransitions.currentNavigation);
            if (o !== null && i !== null) {
              if (
                (this.stateManager.handleRouterEvent(r, i),
                r instanceof ft && r.code !== ye.Redirect && r.code !== ye.SupersededByNewNavigation)
              )
                this.navigated = !0;
              else if (r instanceof Rt) this.navigated = !0;
              else if (r instanceof rr) {
                let s = r.navigationBehaviorOptions,
                  a = this.urlHandlingStrategy.merge(r.url, o.currentRawUrl),
                  c = m(
                    {
                      browserUrl: o.extras.browserUrl,
                      info: o.extras.info,
                      skipLocationChange: o.extras.skipLocationChange,
                      replaceUrl: o.extras.replaceUrl || this.urlUpdateStrategy === 'eager' || JI(o.source)
                    },
                    s
                  );
                this.scheduleNavigation(a, ao, null, c, { resolve: o.resolve, reject: o.reject, promise: o.promise });
              }
            }
            JC(r) && this._events.next(r);
          } catch (o) {
            this.navigationTransitions.transitionAbortWithErrorSubject.next(o);
          }
        });
        this.eventsSubscription.add(n);
      }
      resetRootComponentType(n) {
        ((this.routerState.root.component = n), (this.navigationTransitions.rootComponentType = n));
      }
      initialNavigation() {
        (this.setUpLocationChangeListener(),
          this.navigationTransitions.hasRequestedNavigation ||
            this.navigateToSyncWithBrowser(this.location.path(!0), ao, this.stateManager.restoredState()));
      }
      setUpLocationChangeListener() {
        this.nonRouterCurrentEntryChangeSubscription ??= this.stateManager.registerNonRouterCurrentEntryChangeListener(
          (n, r, o) => {
            this.navigateToSyncWithBrowser(n, o, r);
          }
        );
      }
      navigateToSyncWithBrowser(n, r, o) {
        let i = { replaceUrl: !0 },
          s = o?.navigationId ? o : null;
        if (o) {
          let c = m({}, o);
          (delete c.navigationId, delete c.ɵrouterPageId, Object.keys(c).length !== 0 && (i.state = c));
        }
        let a = this.parseUrl(n);
        this.scheduleNavigation(a, r, s, i).catch((c) => {
          this.disposed || this.injector.get(Ie)(c);
        });
      }
      get url() {
        return this.serializeUrl(this.currentUrlTree);
      }
      getCurrentNavigation() {
        return ct(this.navigationTransitions.currentNavigation);
      }
      get lastSuccessfulNavigation() {
        return this.navigationTransitions.lastSuccessfulNavigation;
      }
      resetConfig(n) {
        ((this.config = n.map(Dl)), (this.navigated = !1));
      }
      ngOnDestroy() {
        this.dispose();
      }
      dispose() {
        (this._events.unsubscribe(),
          this.navigationTransitions.complete(),
          this.nonRouterCurrentEntryChangeSubscription &&
            (this.nonRouterCurrentEntryChangeSubscription.unsubscribe(),
            (this.nonRouterCurrentEntryChangeSubscription = void 0)),
          (this.disposed = !0),
          this.eventsSubscription.unsubscribe());
      }
      createUrlTree(n, r = {}) {
        let { relativeTo: o, queryParams: i, fragment: s, queryParamsHandling: a, preserveFragment: c } = r,
          u = c ? this.currentUrlTree.fragment : s,
          l = null;
        switch (a ?? this.options.defaultQueryParamsHandling) {
          case 'merge':
            l = m(m({}, this.currentUrlTree.queryParams), i);
            break;
          case 'preserve':
            l = this.currentUrlTree.queryParams;
            break;
          default:
            l = i || null;
        }
        l !== null && (l = this.removeEmptyProps(l));
        let d;
        try {
          let p = o ? o.snapshot : this.routerState.snapshot.root;
          d = og(p);
        } catch {
          ((typeof n[0] != 'string' || n[0][0] !== '/') && (n = []), (d = this.currentUrlTree.root));
        }
        return ig(d, n, l, u ?? null);
      }
      navigateByUrl(n, r = { skipLocationChange: !1 }) {
        let o = tr(n) ? n : this.parseUrl(n),
          i = this.urlHandlingStrategy.merge(o, this.rawUrlTree);
        return this.scheduleNavigation(i, ao, null, r);
      }
      navigate(n, r = { skipLocationChange: !1 }) {
        return (ow(n), this.navigateByUrl(this.createUrlTree(n, r), r));
      }
      serializeUrl(n) {
        return this.urlSerializer.serialize(n);
      }
      parseUrl(n) {
        try {
          return this.urlSerializer.parse(n);
        } catch {
          return (this.console.warn(Mn(4018, !1)), this.urlSerializer.parse('/'));
        }
      }
      isActive(n, r) {
        let o;
        if ((r === !0 ? (o = m({}, nw)) : r === !1 ? (o = m({}, rw)) : (o = r), tr(n)))
          return Hh(this.currentUrlTree, n, o);
        let i = this.parseUrl(n);
        return Hh(this.currentUrlTree, i, o);
      }
      removeEmptyProps(n) {
        return Object.entries(n).reduce((r, [o, i]) => (i != null && (r[o] = i), r), {});
      }
      scheduleNavigation(n, r, o, i, s) {
        if (this.disposed) return Promise.resolve(!1);
        let a, c, u;
        s
          ? ((a = s.resolve), (c = s.reject), (u = s.promise))
          : (u = new Promise((d, p) => {
              ((a = d), (c = p));
            }));
        let l = this.pendingTasks.add();
        return (
          Ng(this, () => {
            queueMicrotask(() => this.pendingTasks.remove(l));
          }),
          this.navigationTransitions.handleNavigationRequest({
            source: r,
            restoredState: o,
            currentUrlTree: this.currentUrlTree,
            currentRawUrl: this.currentUrlTree,
            rawUrl: n,
            extras: i,
            resolve: a,
            reject: c,
            promise: u,
            currentSnapshot: this.routerState.snapshot,
            currentRouterState: this.routerState
          }),
          u.catch((d) => Promise.reject(d))
        );
      }
      static ɵfac = function (r) {
        return new (r || e)();
      };
      static ɵprov = y({ token: e, factory: e.ɵfac, providedIn: 'root' });
    }
    return e;
  })();
function ow(e) {
  for (let t = 0; t < e.length; t++) if (e[t] == null) throw new v(4008, !1);
}
var iw = new D('');
function Il(e, ...t) {
  return $t([
    { provide: Ps, multi: !0, useValue: e },
    [],
    { provide: cn, useFactory: sw, deps: [Cl] },
    { provide: es, multi: !0, useFactory: aw },
    t.map((n) => n.ɵproviders)
  ]);
}
function sw(e) {
  return e.routerState.root;
}
function aw() {
  let e = h(Oe);
  return (t) => {
    let n = e.get(on);
    if (t !== n.components[0]) return;
    let r = e.get(Cl),
      o = e.get(cw);
    (e.get(uw) === 1 && r.initialNavigation(),
      e.get(lw, null, { optional: !0 })?.setUpPreloading(),
      e.get(iw, null, { optional: !0 })?.init(),
      r.resetRootComponentType(n.componentTypes[0]),
      o.closed || (o.next(), o.complete(), o.unsubscribe()));
  };
}
var cw = new D('', { factory: () => new q() }),
  uw = new D('', { providedIn: 'root', factory: () => 1 });
var lw = new D('');
var Ag = [];
var Rg = { providers: [cc(), Cu(), Il(Ag)] };
function xg(e) {
  e || (e = h(Le));
  let t = new A((n) => {
    if (e.destroyed) {
      n.next();
      return;
    }
    return e.onDestroy(n.next.bind(n));
  });
  return (n) => n.pipe(_n(t));
}
var Fs = class e {
  get isDevMode() {
    return uh();
  }
  static ɵfac = function (n) {
    return new (n || e)();
  };
  static ɵprov = y({ token: e, factory: e.ɵfac, providedIn: 'root' });
};
var Ls = class e {
  #e = new q();
  #t = h(Fs);
  constructor() {
    window.ngVaultEventBus = this;
  }
  next(t) {
    !this.#t.isDevMode || !t || this.#e.next(t);
  }
  asObservable() {
    return this.#e.asObservable();
  }
  static ɵfac = function (n) {
    return new (n || e)();
  };
  static ɵprov = y({ token: e, factory: e.ɵfac, providedIn: 'root' });
};
var js = class e {
  constructor(t) {
    this.eventBus = t;
  }
  listen$() {
    return this.eventBus.asObservable();
  }
  listen(t) {
    let n = this.eventBus.asObservable().subscribe(t);
    return () => n.unsubscribe();
  }
  static ɵfac = function (n) {
    return new (n || e)(b(Ls));
  };
  static ɵprov = y({ token: e, factory: e.ɵfac, providedIn: 'root' });
};
var Bs = class e {
  destroyRef = h(Le);
  bus = h(js);
  events = Ge([]);
  totalEvents = qr(() => this.events().length);
  constructor() {
    this.bus
      .listen$()
      .pipe(
        he((t) => !!t),
        xg(this.destroyRef)
      )
      .subscribe((t) => {
        this.events.update((n) => [t, ...n].slice(0, 200));
      });
  }
  clearEvents() {
    this.events.set([]);
  }
  static ɵfac = function (n) {
    return new (n || e)();
  };
  static ɵprov = y({ token: e, factory: e.ɵfac, providedIn: 'root' });
};
var pw = (e, t) => t.id;
function hw(e, t) {
  if (
    (e & 1 &&
      (Me(0, 'div')(1, 'strong'),
      Ze(2),
      Be(),
      Me(3, 'span', 9),
      Ze(4),
      Be(),
      Me(5, 'span', 10),
      Ze(6),
      rs(7, 'date'),
      Be(),
      Me(8, 'pre', 11),
      Ze(9),
      rs(10, 'json'),
      Be()()),
    e & 2)
  ) {
    let n = t.$implicit;
    (Nt(),
      ns('text-green-400', n.type === 'init')('text-yellow-400', n.type === 'patch')(
        'text-red-400',
        n.type === 'error'
      ),
      Nt(),
      qn(' ', n.type.toUpperCase(), ' '),
      Nt(2),
      zr(n.cell),
      Nt(2),
      qn(' ', yu(7, 10, n.timestamp, 'mediumTime'), ' '),
      Nt(3),
      zr(vu(10, 13, n.state)));
  }
}
var Vs = class e {
  events = qr(() => this.devtools.events());
  devtools = h(Bs);
  clearEvents() {
    this.devtools.clearEvents();
  }
  static ɵfac = function (n) {
    return new (n || e)();
  };
  static ɵcmp = rn({
    type: e,
    selectors: [['ngvault-devtools-panel']],
    decls: 16,
    vars: 0,
    consts: [
      [1, 'dev-tools-container'],
      [1, 'title'],
      [1, 'warn'],
      [1, 'dev-tool-actions'],
      [1, 'action-container'],
      [3, 'click'],
      [1, 'full-output-container'],
      [1, 'output-container'],
      [1, 'output'],
      [1, 'text-slate-400', 'ml-2'],
      [1, 'text-slate-500', 'ml-2', 'text-xs'],
      [1, 'text-xs', 'text-slate-300', 'mt-1']
    ],
    template: function (n, r) {
      (n & 1 &&
        (Me(0, 'div', 0)(1, 'div', 1),
        Ze(2, ' Dev Tools '),
        Me(3, 'span', 2),
        Ze(4, 'No events will show up until after loading this page and then activating more events'),
        Be()(),
        Me(5, 'div', 3)(6, 'div', 4)(7, 'button', 5),
        ts('click', function () {
          return r.clearEvents();
        }),
        Ze(8, 'Clear Events'),
        Be()()(),
        Me(9, 'div', 6)(10, 'div', 7)(11, 'div', 1),
        Ze(12, 'Event'),
        Be(),
        Me(13, 'div', 8),
        pu(14, hw, 11, 15, 'div', null, pw),
        Be()()()()),
        n & 2 && (Nt(14), hu(r.events())));
    },
    dependencies: [Ru, Au],
    styles: [
      '@charset "UTF-8";.pointer[_ngcontent-%COMP%]{cursor:pointer}[_nghost-%COMP%]{display:block;height:calc(100vh - var(--app-toolbar-height) - var(--app-footer-height));overflow:hidden}.dev-tools-container[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:1rem;background-color:var(--surface-bg);color:var(--surface-text);padding:1rem;border-radius:var(--ngvault-border-radius);font-family:Inter,system-ui,sans-serif;height:100%;overflow-y:hidden;box-sizing:border-box;scrollbar-width:thin;scrollbar-color:var(--ngvault-surface-outline) var(--surface-bg)}.dev-tools-container[_ngcontent-%COMP%]::-webkit-scrollbar{width:8px}.dev-tools-container[_ngcontent-%COMP%]::-webkit-scrollbar-thumb{background-color:var(--ngvault-surface-outline);border-radius:var(--ngvault-border-radius)}.dev-tools-container[_ngcontent-%COMP%]::-webkit-scrollbar-track{background:var(--surface-bg)}.dev-tools-container[_ngcontent-%COMP%]   .title[_ngcontent-%COMP%]{font-size:1.25rem;font-weight:600;color:var(--surface-color);margin-bottom:.5rem}.dev-tools-container[_ngcontent-%COMP%]   .title[_ngcontent-%COMP%]   .warn[_ngcontent-%COMP%]{color:#fbc02d;font-size:1rem}.dev-tools-container[_ngcontent-%COMP%]   .dev-tool-actions[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;gap:1rem;justify-content:flex-start}.dev-tools-container[_ngcontent-%COMP%]   .dev-tool-actions[_ngcontent-%COMP%]   .action-container[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:center;background:var(--sidenav-bg);border-radius:var(--ngvault-border-radius);padding:.5rem 1rem;transition:background .2s ease-in-out}.dev-tools-container[_ngcontent-%COMP%]   .dev-tool-actions[_ngcontent-%COMP%]   .action-container[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]{background:none;border:none;color:var(--sidenav-text);font-size:.875rem;cursor:pointer;font-weight:500}.dev-tools-container[_ngcontent-%COMP%]   .dev-tool-actions[_ngcontent-%COMP%]   .action-container[_ngcontent-%COMP%]:hover{background:var(--toolbar-bg);color:var(--toolbar-text)}.dev-tools-container[_ngcontent-%COMP%]   .full-output-container[_ngcontent-%COMP%]{gap:1.5rem;height:calc(100% - 110px)}.dev-tools-container[_ngcontent-%COMP%]   .full-output-container[_ngcontent-%COMP%]   .output-container[_ngcontent-%COMP%]{display:flex;flex-direction:column;background:var(--sidenav-bg);border-radius:var(--ngvault-border-radius);padding:1rem;overflow:hidden;height:calc(100% - 20px)}.dev-tools-container[_ngcontent-%COMP%]   .full-output-container[_ngcontent-%COMP%]   .output-container[_ngcontent-%COMP%]   .title[_ngcontent-%COMP%]{font-size:1rem;font-weight:600;color:var(--surface-color);margin-bottom:.5rem;text-transform:uppercase;letter-spacing:.05em}.dev-tools-container[_ngcontent-%COMP%]   .full-output-container[_ngcontent-%COMP%]   .output-container[_ngcontent-%COMP%]   .output[_ngcontent-%COMP%]{overflow-y:auto;height:calc(100% - 50px);background:var(--surface-bg);border-radius:var(--ngvault-border-radius);padding:.5rem}.dev-tools-container[_ngcontent-%COMP%]   .full-output-container[_ngcontent-%COMP%]   .output-container[_ngcontent-%COMP%]   .output[_ngcontent-%COMP%]   div[_ngcontent-%COMP%]{margin-bottom:.5rem;border-bottom:1px solid var(--ngvault-surface-outline);padding-bottom:.5rem}.dev-tools-container[_ngcontent-%COMP%]   .full-output-container[_ngcontent-%COMP%]   .output-container[_ngcontent-%COMP%]   .output[_ngcontent-%COMP%]   pre[_ngcontent-%COMP%]{background:#63a4ff;color:var(--surface-text);border-radius:var(--ngvault-border-radius);padding:.5rem;overflow-x:auto}'
    ]
  });
};
var Hs = class e {
  title = Ge('dev-tools-ui');
  static ɵfac = function (n) {
    return new (n || e)();
  };
  static ɵcmp = rn({
    type: e,
    selectors: [['app-root']],
    decls: 1,
    vars: 0,
    template: function (n, r) {
      n & 1 && Gn(0, 'ngvault-devtools-panel');
    },
    dependencies: [Vs],
    encapsulation: 2
  });
};
Hu(Hs, Rg).catch((e) => console.error(e));
