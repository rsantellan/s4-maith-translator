translatorManager = function(options){
	this._initialize();

}

translatorManager.instance = null;

translatorManager.getInstance = function (){
	if(translatorManager.instance == null)
		translatorManager.instance = new translatorManager();
	return translatorManager.instance;
}

translatorManager.prototype = {
    _initialize: function(){
        this._toggle = false;
        this._selected_key = null;
    },
    
    sendGetTranslations: function(form)
    {
        var self = this;
        self.removeEditorOpenInstances();
        self._selected_key = null;
        var my_waiting_noty = callNoty("Procesando", "information");
        $.ajax({
          url: $(form).attr('action'),
          data: $(form).serialize(),
          type: $(form).attr('method'),
          dataType: 'json',
          success: function(json){
              if(json.status == "OK")
              {
                $("#bundles_container_error").html("");
                $("#bundles_texts_container").html(json.options.html);
              }
              else
              {
                $("#bundles_container_error").html(json.options.message);
                $("#bundles_texts_container").html("");
              }
          }, 
          complete: function()
          {
            my_waiting_noty.close();
          }
        });
        return false;
    },
    
    sendPutTranslations: function(form)
    {
        var my_waiting_noty = callNoty("Procesando", "information");
        $.ajax({
          url: $(form).attr('action'),
          data: $(form).serialize(),
          type: $(form).attr('method'),
          dataType: 'json',
          success: function(json){
              if(json.status == "OK")
              {
                callNoty("Cambios guardados correctamente", 'success');
              }
              else
              {
                callNoty("Errores al guardar", 'alert');
              }
          }, 
          complete: function()
          {
            my_waiting_noty.close();
          }
              
        });
        return false;
    },
    
    doChanges: function(myUrl)
    {
        var my_waiting_noty = callNoty("Procesando", "information");
        $.ajax({
          url: myUrl,
          type: 'get',
          dataType: 'json',
          success: function(json){
              if(json.status == "OK")
              {
                callNoty("Cambios aplicados correctamente", 'success');
              }
          }, 
          complete: function()
          {
            my_waiting_noty.close();
          }
              
        });
        return false;
    },
    
    removeEditorOpenInstances: function()
    {
      var self = this;
      if(self._selected_key != null)
      {
        var editorId = self._selected_key+'_translation_textarea';
        var editor = CKEDITOR.instances[editorId];
        if (editor) { editor.destroy(true); }
      }
    },
    
    doShowHideGroup: function(groupId)
    {
      this.finishCurrent();
      var isHidden = $('#group_data_'+groupId).is(':hidden');
      $(".group_data_container").each(function(index, data){
        $(data).hide();
      });
      if(isHidden){
        $('#group_data_'+groupId).show();
      }
      return;
    },

    finishCurrent: function(){
      if(this._selected_key != null)
      {
        $('#'+this._selected_key+'_translation').toggle();
      }
      
      translatorManager.getInstance().removeEditorOpenInstances();
    },

    doShowHide: function (key, groupId)
    {
      this.finishCurrent();
      var self = this;
      if(key == this._selected_key){
        // have to hide the form and show all
        $('#'+key+'_translation').hide();
        $("#group_data_" + groupId +" .translation_container_data").each(function(index, data){
          $(data).show();
        });
        self._selected_key = null;
      } else {
        // is a new key!
        self._selected_key = key;
        $("#group_data_" + groupId +" .translation_container_data").each(function(index, data){
            if(data.id != "tranlation_container_data_"+key)
            {
              if(!self._toggle)
              {
                $(data).hide();
              }
              else
              {
                $(data).show();
              }
            }
        });
        $('#'+key+'_translation').show();
        CKEDITOR.replace( key+'_translation_textarea', {
            filebrowserBrowseUrl: $('#wyswyg_media_browser').val(),
            enterMode : CKEDITOR.ENTER_BR
        } );        
      }
      self._toggle = ! self._toggle;
    }
}


function callNoty(message, status)
{
  var timeout = 1000;
  var noty_id = noty({
    text: message,
    layout: 'center',
    timeout: timeout,
    type: status
  });
  return noty_id;
}