/* globals DiscussionSpecHelper, DiscussionCourseSettings, NewPostView, DiscussionUtil */
(function() {
    'use strict';
    describe('DiscussionUtil', function() {
        beforeEach(function() {
            DiscussionSpecHelper.setUpGlobals();
        });

        describe('updateWithUndo', function() {
            it('calls through to safeAjax with correct params, and reverts the model in case of failure', function() {
                var deferred, model, res, updates;
                deferred = $.Deferred();
                spyOn($, 'ajax').and.returnValue(deferred);
                spyOn(DiscussionUtil, 'safeAjax').and.callThrough();
                model = new Backbone.Model({
                    hello: false,
                    number: 42
                });
                updates = {
                    hello: 'world'
                };
                res = DiscussionUtil.updateWithUndo(model, updates, {
                    foo: 'bar'
                }, 'error message');
                expect(DiscussionUtil.safeAjax).toHaveBeenCalled();
                expect(model.attributes).toEqual({
                    hello: 'world',
                    number: 42
                });
                spyOn(DiscussionUtil, 'discussionAlert');
                DiscussionUtil.safeAjax.calls.mostRecent().args[0].error();
                expect(DiscussionUtil.discussionAlert).toHaveBeenCalledWith('Error', 'error message');
                deferred.reject();
                return expect(model.attributes).toEqual({
                    hello: false,
                    number: 42
                });
            });
            return it('rolls back the changes if the associated element is disabled', function() {
                var $elem, failed, model, res, updates;
                spyOn(DiscussionUtil, 'safeAjax').and.callThrough();
                model = new Backbone.Model({
                    hello: false,
                    number: 42
                });
                updates = {
                    hello: 'world'
                };
                $elem = jasmine.createSpyObj('$elem', ['prop']);
                $elem.prop.and.returnValue(true);
                res = DiscussionUtil.updateWithUndo(model, updates, {
                    foo: 'bar',
                    $elem: $elem
                }, 'error message');
                expect($elem.prop).toHaveBeenCalledWith('disabled');
                expect(DiscussionUtil.safeAjax).toHaveBeenCalled();
                expect(model.attributes).toEqual({
                    hello: false,
                    number: 42
                });
                failed = false;
                res.fail(function() {
                    failed = true;
                });
                return expect(failed).toBe(true);
            });
        });

        describe('safeAjax', function() {
            function dismissAlert() {
                $('.modal#discussion-alert').remove();
            }

            it('respects global beforeSend', function() {
                var beforeSendSpy = jasmine.createSpy();
                $.ajaxSetup({beforeSend: beforeSendSpy});

                var $elem = jasmine.createSpyObj('$elem', ['prop']);

                DiscussionUtil.safeAjax({
                    $elem: $elem,
                    url: '/',
                    type: 'GET',
                    dataType: 'json'
                }).always(function() {
                    dismissAlert();
                });
                expect($elem.prop).toHaveBeenCalledWith('disabled', true);
                expect(beforeSendSpy).toHaveBeenCalled();
            });
        });

        describe('handleKeypressInToolbar', function() {
            function focused(element) {
                return $(element)[0] === $(element)[0].ownerDocument.activeElement;
            }

            beforeEach(function() {
                this.course_settings = new DiscussionCourseSettings({
                    category_map: {
                        children: [['Topic', 'entry'], ['General', 'entry'], ['Not Cohorted', 'entry']],
                        entries: {
                            Topic: {
                                is_divided: true,
                                id: 'topic'
                            },
                            General: {
                                is_divided: true,
                                id: 'general'
                            },
                            'Not Cohorted': {
                                is_divided: false,
                                id: 'not-cohorted'
                            }
                        }
                    }
                });
                this.view = new NewPostView({
                    el: $('#fixture-element'),
                    collection: this.discussion,
                    course_settings: this.course_settings,
                    mode: 'tab'
                });

                this.firstButton = this.view.$('.wmd-button-row:first-child');
                this.subsequentButtons = this.view.$('.wmd-button-first-row > button');
            });

            it('can only focus on first button in toolbar', function() {
                this.firstButton.focus();

                expect(this.firstButton).toHaveAttr({
                    'tabindex': '0'
                });

                this.subsequentButtons.each(function (button) {
                    expect(button).toHaveAttr({
                        'tabindex': '-1'
                    });
                });
            });

            it('navigates the toolbar by pressing left/right arrow keys', function() {
                var nextButton;

                this.firstButton.focus();
                this.firstButton.simulate('keydown', {keyCode: $.simulate.keyCode.RIGHT});

                nextButton = this.firstButton.nextSibling();

                expect(this.nextButton).toHaveAttr({
                    'tabindex': '0'
                });
                expect(focused(this.nextButton), true);
            });

            it('moves focus to next element when pressing tab', function() {
                var nextFocusableElement = this.firstButton.parent().nextSibling();
                this.firstButton.focus();
                this.firstButton.simulate('tab', {keyCode: $.simulate.keyCode.TAB});

                expect(focused(nextFocusableElement), true);
            });
        });
    });
}).call(this);
