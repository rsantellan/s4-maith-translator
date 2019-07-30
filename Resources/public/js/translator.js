/**
 * MaithTranslatorTranslationManager
 *
 * JS object that drives AJAX functionality on MaithTranslator Translation Bundle UI
 *
 *  Constructor arguments:
 *  @string updateMessagePath: uri to which translation data is sent
 *  @boolean isWritable: Whether the source translation files are actually writable
 *
 *  Configuration:
 *  @object domain
 *      @string selector: jquery selector for domain changer fields
 *      @function handlers: event handlers to be attached to domain fields
 *
 *  @object truncator
 *      @string selector: jquery selector for fields to be truncated (requires Trunk8 JQuery plugin)
 *      @string side: left|right side to truncate
 *      @string fill: html element to use to untruncate text
 *      @string untruncateSelector: jquery selector for fill field, used by handlers in default truncate function
 *      @function truncate: function that actually defines the truncation behaviour
 *
 *  @object translation
 *      @string selector: jquery selector for field that will contain the translation text
 *      @object ajax
 *          @string type: http request type for ajax request
 *          @object headers: http headers to be sent with request
 *          @string dataMethod: ajax _dataMethod
 *          @function beforeSend|error|success|complete: ajax request event handlers
 *          @string errorMessageContent|savedMessageContent|unsavedMessageContent: message text used by the default ajax request handlers
 *      @function blur: translation field onBlur handler
 *      @function focus: translation field onFocus handler
 *
 *  @function ready: inits the MaithTranslatorTranslationManager
 *
 *  @function writable: attaches translation field handlers if isWritable is true
 */
function MaithTranslationManager(updateMessagePath, isWritable, fileBrowser) {
    if (!window.jQuery) {
        console.error('MaithTranslatorManager requires JQuery.');
        return;
    }

    this.updateMessagePath = updateMessagePath;
    this.isWritable = isWritable ? isWritable : false;
    this.fileBrowser= fileBrowser;

    this.domain  = {
        selector: '#config select',
        handlers: function(MaithTranslator)
        {
            $(MaithTranslator.domain.selector).change(function() {
                if(this.name === 'locale'){
                    var filter = $(MaithTranslator.messageFilter.selector).val();
                    $(this).parent().attr('action', $(this).parent().attr('action') + "#" + filter);
                }
                $(this).parent().submit();
            });
        }
    };

    this.truncator = {
        selector: '.truncate-left',
        side:     'left',
        fill:     '<a href="#" class="untruncate">&hellip;</a>',
        untruncateSelector: '.untruncate',
        truncate: function(MaithTranslator)
        {
            if(jQuery().trunk8)
            {
                $(MaithTranslator.truncator.selector).trunk8({
                    side: MaithTranslator.truncator.side,
                    fill: MaithTranslator.truncator.fill
                });

                $(document).on('click', MaithTranslator.truncator.untruncateSelector, function (event) {
                    var $elem = $(this);
                    $elem.parent().trunk8('revert');
                    event.preventDefault();
                });
            }
            else
            {
                console.error('Truncator requires jQuery Trunk8 plugin.');
            }
        }
    };

    this.ready = function()
    {
        var MaithTranslator = this;
        $(document).ready(function(event) {
            MaithTranslator.domain.handlers(MaithTranslator);
            MaithTranslator.truncator.truncate(MaithTranslator);
            $(MaithTranslator.messageFilter.selector).keyup(function(){
                MaithTranslator.messageFilter.filter();
            });
            MaithTranslator.messageFilter.init();
            MaithTranslator.messageFilter.filter();
            if(MaithTranslator.isWritable)
            {
                MaithTranslator.writable(MaithTranslator);
            }
        });
    };

    this.writable = function(MaithTranslator)
    {
        /*
        $(MaithTranslator.translation.selector)
            .blur(function(event)
            {
                MaithTranslator.translation.blur(event, MaithTranslator);
            })
            .focus(function ()
            {
                MaithTranslator.translation.focus(event, MaithTranslator);
            })
        ;
        */
    };

    this.messageFilter = {
        selector: "#filter",
        init: function(){
            $(MaithTranslator.messageFilter.selector).val(window.location.hash.substr(1));
        },
        filter: function () {
            var filter = $(MaithTranslator.messageFilter.selector);
            var messageRow = $(".messageRow");
            if (filter.length === 0) {
                messageRow.each(function () {
                    $(this).show();
                });

                return;
            }

            var filterString = filter.val().trim().replace(/[-[\]{}()+?,\\^$|#\s]/g, "\\$&");
            var regExp = new RegExp(".*" + filterString + ".*", "i");
            window.location.hash = filterString;
            if (filterString !== "") {
                messageRow.each(function () {
                    var id = this.id.substr(4);
                    if (id.match(regExp)) {
                        $(this).show();
                    } else {
                        $(this).hide();
                    }
                });
                return ;
            }

            messageRow.each(function () {
                $(this).show();
            });
        }
    };

    this.initializeTextArea = function(identifier)
    {
        CKEDITOR.replace( 'textarea.'+identifier, {
            filebrowserBrowseUrl: this.fileBrowser,
            enterMode : CKEDITOR.ENTER_DIV,
            allowedContent: true,
        } );
        return true;
    };

    this.clearCache = function(url)
    {
        $.ajax({
            url: url,
            dataType: 'json',
            success: function(json){
                if(json.result || json.result == 'true')
                {
                    toastr.success(json.message);
                }
                else
                {
                    toastr.error(json.message);
                }
            },
            complete: function()
            {
            }
        });
        return false;
    };

    this.saveTextArea = function(object, identifier)
    {
        var $textarea = $('textarea[name="'+identifier + '"]');
        for(name in CKEDITOR.instances)
        {
            if (name === 'textarea.' + identifier) {
                $textarea.val(CKEDITOR.instances[$textarea.prop('id')].getData());
                CKEDITOR.instances[$textarea.prop('id')].destroy(true);
            }
        }
        $.ajax(this.updateMessagePath + '?id=' + encodeURIComponent($textarea.data('id')), {
            type: 'POST',
            headers: {'X-HTTP-METHOD-OVERRIDE': 'PUT'},
            data: {'_method': 'PUT', 'message': $textarea.val()},
            beforeSend: function (data)
            {
                
            },
            error: function (data)
            {
                toastr.error('No se pudo guardar.')
            },
            success: function (data)
            {
                if (data == 'Translation was saved')
                {
                    toastr.success('Texto guardado.')
                } else
                {
                    toastr.error('No se pudo guardar.')
                }
            },
            complete: function (data)
            {

            }
        });

    };
}