;(function (define, undefined) {
'use strict';
define([
    'gettext', 'underscore', 'backbone'
], function (gettext, _, Backbone) {
    var NoteSectionView, NoteGroupView;

    NoteSectionView = Backbone.View.extend({
        tagName: 'section',
        className: 'note-section',
        id: function () {
            return 'note-section-' + _.uniqueId();
        },
        template: _.template('<h4 class="course-subtitle"><%- sectionName %></h4>'),

        render: function () {
            this.$el.prepend(this.template({
                sectionName: this.options.section.display_name
            }));

            return this;
        },

        addChild: function (child) {
            this.$el.append(child);
        }
    });

    NoteGroupView = Backbone.View.extend({
        tagName: 'section',
        className: 'note-group',
        id: function () {
            return 'note-group-' + _.uniqueId();
        },
        template: _.template('<h3 class="course-title"><%- chapterName %></h3>'),

        initialize: function () {
            this.children = [];
        },

        render: function () {
            var container = document.createDocumentFragment();
            this.$el.html(this.template({
                chapterName: this.options.chapter.display_name || ''
            }));
            _.each(this.children, function (section) {
                container.appendChild(section.render().el);
            });
            this.$el.append(container);

            return this;
        },

        addChild: function (sectionInfo) {
            var section = new NoteSectionView({section: sectionInfo});
            this.children.push(section);
            return section;
        },

        remove: function () {
            _.invoke(this.children, 'remove');
            this.children = null;
            Backbone.View.prototype.remove.call(this);
            return this;
        }
    });

    return NoteGroupView;
});
}).call(this, define || RequireJS.define);