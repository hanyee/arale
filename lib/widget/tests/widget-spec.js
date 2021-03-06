define(function(require) {

    var Widget = require('../src/widget');
    var $ = require('$');


    describe('Widget', function() {

        test('initAttrs', function() {
            var div = $('<div id="a"></div>').appendTo(document.body);

            var WidgetA = Widget.extend({
                attrs: {
                    element: '#default',
                    foo: 'foo',
                    template: '<span></span>'
                },
                model: {
                    title: 'default title',
                    content: 'default content'
                }
            });

            var a = new WidgetA({
                element: '#a',
                bar: 'bar',
                template: '<a></a>',
                model: {
                    title: 'title a'
                }
            });

            // 传入的
            expect(a.get('bar')).toBe('bar');

            // 继承的
            expect(a.get('foo')).toBe('foo');

            // 覆盖的
            expect(a.get('template')).toBe('<a></a>');

            // 混入的
            expect(a.model.title).toBe('title a');
            expect(a.model.content).toBe('default content');

            // attr 式属性
            expect(a.element[0].id).toBe('a');

            div.remove();
        });

        test('parseElement', function() {
            var div = $('<div id="a"></div>').appendTo(document.body);

            // 如果 config 里不传 element，默认用 $('<div></div>') 构建
            var widget = new Widget();
            expect(widget.element[0].tagName).toBe('DIV');

            // 如果传入 selector，会自动转为为 $ 对象
            widget = new Widget({ element: '#a' });
            expect(widget.element[0].id).toBe('a');

            // 如果传入 DOM 对象，会自动转换为 $ 对象
            widget = new Widget({ element: document.getElementById('a') });
            expect(widget.element[0].id).toBe('a');

            // 如果传入 $ 对象，保持不变
            widget = new Widget({ element: $('#a') });
            expect(widget.element[0].id).toBe('a');

            // 如果传入的 dom 对象不存在，则报错
            try {
                new Widget({ element: '#b' });
                expect('应该抛错').toBe('没有抛错');
            } catch (e) {
            }

            // 同时传入 template 和 element 时，element 优先
            widget = new Widget({ element: '#a', template: '<span></span>' });
            expect(widget.element[0].tagName).toBe('DIV');

            // 只传入 template 时，从 template 构建
            widget = new Widget({ template: '<span></span>' });
            expect(widget.element[0].tagName).toBe('SPAN');

            div.remove();
        });

        test('parseDataAttrs', function() {

            // 默认解析 data-api
            var widget = new Widget();
            expect(typeof widget.dataset).toBe('object');

            // 可通过选项关闭 data-api
            widget = new Widget({ 'data-api': false });
            expect(widget.dataset).toBe(undefined);

            // 简单测试 dataset 正确性
            widget = new Widget({
                template: '<div data-xx="zz"></div>'
            });
            expect(typeof widget.dataset.xx.zz).toBe('string');

            // 将 data-action 转换为 events
            Widget.prototype.x = function() {};
            Widget.prototype.y = function() {};
            widget = new Widget({
                template: '<div data-action="click x"><span data-action="y"></span></div>'
            });

            var eventKeys = keys(widget.events);
            expect(eventKeys.length).toBe(2);
            expect(eventKeys[0].indexOf('click .daparser-')).toBe(0);
            expect(eventKeys[1].indexOf('click .daparser-')).toBe(0);
            expect(widget.events[eventKeys[0]]).toBe('x');
            expect(widget.events[eventKeys[1]]).toBe('y');

            // data-action 支持多个事件
            widget = new Widget({
                template: '<div data-action="click x, mouseenter y"></div>'
            });

            var names = keys(widget.dataset.action);
            expect(names.length).toBe(1);
            expect(names[0]).toBe('click x, mouseenter y');

            eventKeys = keys(widget.events);
            expect(eventKeys.length).toBe(2);
            expect(eventKeys[0].indexOf('click .daparser-')).toBe(0);
            expect(eventKeys[1].indexOf('mouseenter .daparser-')).toBe(0);
            expect(widget.events[eventKeys[0]]).toBe('x');
            expect(widget.events[eventKeys[1]]).toBe('y');

            delete Widget.prototype.x;
            delete Widget.prototype.y;
        });

        test('delegateEvents / undelegateEvents', function() {
            var counter = 0;
            var event = {}, that = {};

            // 通过 events 注册事件代理
            var TestWidget = Widget.extend({
                events: {
                    'click p': 'fn1',
                    'click li': 'fn2',
                    'mouseenter span': 'fn3'
                },

                fn1: function() {
                    counter++;
                },

                fn2: function() {
                    counter++;
                },

                fn3: function(ev) {
                    event = ev;
                    that = this;
                }
            });

            var widget = new TestWidget({
                template: '<div><p></p><ul><li></li></ul><span></span></div>'
            });

            widget.$('p').trigger('click');
            expect(counter).toBe(1);

            counter = 0;
            widget.$('li').trigger('click');
            expect(counter).toBe(1);

            counter = 0;
            widget.element.trigger('click');
            expect(counter).toBe(0);

            counter = 0;
            widget.$('span').trigger('mouseenter');
            expect(event.currentTarget.tagName).toBe('SPAN');
            expect(event.delegateTarget.tagName).toBe('DIV');
            expect(that).toBe(widget);


            // 通过实例添加事件
            widget.delegateEvents({
                'click p': 'fn2',
                'click span': function() {
                    counter++;
                }
            });

            function incr() {
                counter++;
            }

            widget.delegateEvents('click li', incr);

            counter = 0;
            widget.$('li').trigger('click');
            expect(counter).toBe(2);

            counter = 0;
            widget.$('p').trigger('click');
            expect(counter).toBe(2);

            counter = 0;
            widget.$('span').trigger('click');
            expect(counter).toBe(1);


            // 注销事件
            counter = 0;
            widget.undelegateEvents('click p', 'fn2');
            widget.$('p').trigger('click');
            expect(counter).toBe(1);

            counter = 0;
            widget.undelegateEvents('click li', incr);
            widget.$('li').trigger('click');
            expect(counter).toBe(1);

            counter = 0;
            widget.undelegateEvents('click p');
            widget.$('p').trigger('click');
            expect(counter).toBe(0);

            counter = 0;
            widget.undelegateEvents();
            widget.$('li').trigger('click');
            widget.$('p').trigger('click');
            expect(counter).toBe(0);
        });

        test('events hash can be a function', function() {
            var counter = 0;

            var TestWidget = Widget.extend({

                events: function() {
                    return {
                        'click h3': 'incr',
                        'click p': 'incr'
                    }
                },

                incr: function() {
                    counter++;
                }
            });

            var widget = new TestWidget({
                template: '<div><h3></h3><p></p></div>'
            });

            widget.$('h3').trigger('click');
            expect(counter).toBe(1);

            counter = 0;
            widget.$('p').trigger('click');
            expect(counter).toBe(1);

            // 有 data-action 时，也正常
            widget = new TestWidget({
                template: '<div><h3></h3><p data-action="incr"></p></div>'
            });

            counter = 0;
            widget.$('h3').trigger('click');
            expect(counter).toBe(1);

            counter = 0;
            widget.$('p').trigger('click');
            expect(counter).toBe(2);
        });

        test('the default event target is `this.element`', function() {
            var counter = 0;

            var TestWidget = Widget.extend({

                events: function() {
                    return {
                        'click': 'incr'
                    }
                },

                incr: function() {
                    counter++;
                }
            });

            var widget = new TestWidget();
            widget.element.trigger('click');
            expect(counter).toBe(1);
        });

        test('parentNode is a document fragment', function() {
            var id = 'test' + new Date();
            var divs = $('<div id="' + id + '"></div><div></div>');

            new Widget({
                element: divs.eq(0),
                parentNode: document.body
            }).render();

            expect(document.getElementById(id).nodeType).toBe(1);
        });

        test('template in delegate-events', function() {
            var counter = 0;

            var A = Widget.extend({

                attrs: {
                    buttons: {
                        value: 'button',
                        getter: function(val) {
                            return this.$(val);
                        }
                    },

                    elements: {
                        getter: function() {
                            var ttt = this.$('#ttt');
                            return { ttt: ttt };
                        }
                    }
                },

                events: {
                    'click p': 'incr',
                    'click {{header}}': 'incr',
                    'click {{attrs.buttons}}': 'incr',
                    'click {{attrs.elements.ttt}}': 'incr'
                },

                incr: function() {
                    counter++;
                },

                initProps: function() {
                    this.header = this.$('header');
                }
            });

            var a = new A({
                template: '<div><header>x</header><button>x</button><p>x</p><div id="ttt"></div></div>'
            });

            a.$('p').trigger('click');
            expect(counter).toBe(1);

            counter = 0;
            a.header.trigger('click');
            expect(counter).toBe(1);

            counter = 0;
            a.get('buttons').trigger('click');
            expect(counter).toBe(1);

            counter = 0;
            a.get('elements').ttt.trigger('click');
            expect(counter).toBe(1);
        });

        test('delegate events inherited from ancestors', function() {
            var counter = 0;

            function incr() {
                counter++
            }

            var A = Widget.extend({
                events: {
                    'click p': incr
                }
            });

            var B = A.extend({
                events: {
                    'click div': incr
                }
            });

            var object = new B({
                template: '<div><p></p><div></div><span></span></div>',
                events: {
                    'click span': incr
                }
            }).render();

            counter = 0;
            object.$('p').trigger('click');
            expect(counter).toBe(1);

            counter = 0;
            object.$('div').trigger('click');
            expect(counter).toBe(1);

            counter = 0;
            object.$('span').trigger('click');
            expect(counter).toBe(1);
        });

        test('ignore null element during delegating events', function() {
            var counter = 0;

            function incr() {
                counter++
            }

            var A = Widget.extend({
                attrs: {
                    cancelButton: null
                },

                events: {
                    'click {{attrs.cancelButton}}': 'incr'
                }
            });

            new A();
            // no error occurs
        });

    });


    // Helpers
    // -------

    var keys = Object.keys;

    if (!keys) {
        keys = function(o) {
            var result = [];

            for (var name in o) {
                if (o.hasOwnProperty(name)) {
                    result.push(name);
                }
            }
            return result;
        }
    }

});
