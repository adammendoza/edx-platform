define([
    'jquery', 'underscore', 'annotator', 'logger', 'js/edxnotes/views/notes_factory'
], function($, _, Annotator, Logger, NotesFactory) {
    'use strict';
    describe('EdxNotes CaretNavigation Plugin', function() {

        beforeEach(function() {
            loadFixtures('js/fixtures/edxnotes/edxnotes_wrapper.html');
            this.annotator =  NotesFactory.factory(
                $('div#edx-notes-wrapper-123').get(0), {
                    endpoint: 'http://example.com/'
                }
            );
            this.plugin = this.annotator.plugins.CaretNavigation;
            spyOn(Logger, 'log');
        });

        afterEach(function () {
            _.invoke(Annotator._instances, 'destroy');
        });

        describe('destroy', function () {
            it('should unbind all events', function () {
                spyOn($.fn, 'off');
                this.plugin.destroy();
                expect($.fn.off).toHaveBeenCalledWith('keyup', this.plugin.onKeyUp);
            });
        });

        describe('isShortcut', function () {
            it('should return `true` if it is a shortcut', function () {
                expect(this.plugin.isShortcut($.Event('keyup', {
                    ctrlKey: true,
                    which: $.ui.keyCode.SPACE
                }))).toBeTruthy();

                expect(this.plugin.isShortcut($.Event('keyup', {
                    ctrlKey: true,
                    which: $.ui.keyCode.ENTER
                }))).toBeTruthy();
            });

            it('should return `false` if it is not a shortcut', function () {
                expect(this.plugin.isShortcut($.Event('keyup', {
                    ctrlKey: false,
                    which: $.ui.keyCode.ENTER
                }))).toBeFalsy();

                expect(this.plugin.isShortcut($.Event('keyup', {
                    ctrlKey: true,
                    which: $.ui.keyCode.TAB
                }))).toBeFalsy();
            });
        });

        describe('hasSelection', function () {
            it('should return `true` if has selection', function () {
                expect(this.plugin.hasSelection([{}, {}])).toBeTruthy();
            });

            it('should return `false` if does not have selection', function () {
                expect(this.plugin.hasSelection([])).toBeFalsy();
                expect(this.plugin.hasSelection()).toBeFalsy();
            });
        });

        describe('onKeyUp', function () {
            var triggerEvent = function (element, props) {
                var eventProps = $.extend({
                    ctrlKey: true,
                    which: $.ui.keyCode.SPACE
                }, props);
                element.trigger($.Event('keyup', eventProps));
            };

            beforeEach(function() {
                this.element = $('<span />', {'class': 'annotator-hl'}).appendTo(this.annotator.element);

                this.annotation = {
                    text: "test",
                    highlights: [this.element.get(0)]
                };

                this.mockOffset = {top: 0, left:0};

                this.mockSubscriber = jasmine.createSpy();
                this.annotator.subscribe('annotationCreated', this.mockSubscriber);

                spyOn($.fn, 'position').andReturn(this.mockOffset);
                spyOn(this.annotator, 'createAnnotation').andReturn(this.annotation);
                spyOn(this.annotator, 'setupAnnotation').andReturn(this.annotation)
                spyOn(this.annotator, 'deleteAnnotation');
                spyOn(this.annotator, 'getSelectedRanges').andReturn([{}])
                spyOn(this.annotator, 'showEditor');
            });

            it('should create a new annotation', function () {
                triggerEvent(this.element);
                expect(this.annotator.createAnnotation.callCount).toBe(1);
            });

            it('should set up the annotation', function () {
                triggerEvent(this.element);
                expect(this.annotator.setupAnnotation).toHaveBeenCalledWith(
                    this.annotation
                );
            });

            it('should display the Annotation#editor correctly if the Annotation#adder is hidden', function () {
                spyOn($.fn, 'is').andReturn(false);
                triggerEvent(this.element);
                expect($('annotator-hl-temporary').position.callCount).toBe(1);
                expect(this.annotator.showEditor).toHaveBeenCalledWith(
                    this.annotation, this.mockOffset
                );
            });

            it('should display the Annotation#editor in the same place as the Annotation#adder', function () {
                spyOn($.fn, 'is').andReturn(true);
                triggerEvent(this.element);
                expect(this.annotator.adder.position.callCount).toBe(1);
                expect(this.annotator.showEditor).toHaveBeenCalledWith(
                    this.annotation, this.mockOffset
                );
            });

            it('should hide the Annotation#adder', function () {
                spyOn($.fn, 'is').andReturn(true);
                spyOn($.fn, 'hide');
                triggerEvent(this.element);
                expect(this.annotator.adder.hide).toHaveBeenCalled();
            });

            it('should add temporary highlights to the document to show the user what they selected', function () {
                triggerEvent(this.element);
                expect(this.element).toHaveClass('annotator-hl');
                expect(this.element).toHaveClass('annotator-hl-temporary');
            });

            it('should persist the temporary highlights if the annotation is saved', function () {
                triggerEvent(this.element);
                this.annotator.publish('annotationEditorSubmit');
                expect(this.element).toHaveClass('annotator-hl');
                expect(this.element).not.toHaveClass('annotator-hl-temporary');
            });

            it('should trigger the `annotationCreated` event if the edit\'s saved', function () {
                triggerEvent(this.element);
                this.annotator.onEditorSubmit(this.annotation);
                expect(this.mockSubscriber).toHaveBeenCalledWith(this.annotation);
            });

            it('should call Annotator#deleteAnnotation if editing is cancelled', function () {
                triggerEvent(this.element);
                this.annotator.onEditorHide();
                this.annotator.onEditorSubmit();
                expect(this.mockSubscriber).not.toHaveBeenCalledWith('annotationCreated');
                expect(this.annotator.deleteAnnotation).toHaveBeenCalledWith(
                    this.annotation
                );
            });

            it('should do nothing if it is not a shortcut', function () {
                triggerEvent(this.element, {ctrlKey: false});
                expect(this.annotator.showEditor).not.toHaveBeenCalled();
            });

            it('should do nothing if empty selection', function () {
                this.annotator.getSelectedRanges.andReturn([]);
                triggerEvent(this.element);
                expect(this.annotator.showEditor).not.toHaveBeenCalled();
            });

            it('should do nothing if selection is in Annotator', function () {
                spyOn(this.annotator, 'isAnnotator').andReturn(true);
                triggerEvent(this.element);
                expect(this.annotator.showEditor).not.toHaveBeenCalled();
            });
        });
    });
});
