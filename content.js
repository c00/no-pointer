//Temporary Bindings
let bindings = [];

//Root html element to put stuff in
$('body').append(`<div id="no-pointer-container"></div>`)


// Binding for clicking links
Mousetrap.bind(['command+shift+a', 'ctrl+shift+a'], function(e) {
    resetBindings();
    
    //bind escape to cancel
    Mousetrap.bind('esc', function(){
        resetBindings();
    });
    
    //find all links
    $('a:visible, button:visible:enabled').each(function() {
        addBinding(this);
    });
    
    return false;
});

//Binding for selecting Inputs
Mousetrap.bind(['command+shift+s', 'ctrl+shift+s'], function(e) {
    resetBindings();
    
    //bind escape to cancel
    Mousetrap.bind('esc', function(){
        resetBindings();
    });
    
    //find all links
    $('input:visible').each(function() {
        addBinding(this);
    });
    
    return false;
});

function addBinding(el) {
    let $el = $(el);
    let key = getFreeBinding()
    
    bindKey(key, el);
    bindCtrlKey(key, el);
    
    //Add the element
    let $linkEl = $(`<span class="npc-link">${key}</span>`);
    $('#no-pointer-container').append($linkEl);
    //position
    let position = $el.offset();
    let top = position.top + $el.outerHeight() - ($linkEl.height() / 1.5);
    $linkEl.css({top: top, left: position.left});
    
    //Add to bindings
    bindings.push({key: key, el: $linkEl});
}

function bindKey(key, el) {
    Mousetrap.bind(key, function(){
        $el = $(el);
        
        if ($el.is('button') || $el.is('a')){
            //link
            el.click();
        } else if ($el.is('input')){
            //input
            el.focus();
        }        
        
        resetBindings();
        
        return false;
    });
}

function bindCtrlKey(key, el) {
    Mousetrap.bind('ctrl+' + key, function(){
        $el = $(el);

        if ($el.is('button') || $el.is('a')){
            //link
            //todo get this to work...
            var e = $.Event("click");
            //e.ctrlKey = true;
            $el.trigger(e);
        }
        
        resetBindings();
        
        return false;
    });
}

function getFreeBinding() {
    let options = '1234567890qwertyuiopasdfghjklzxcvbnm';
    
    //todo build in scrolling abilities for the next/prev 36
    if (bindings.length === options.length) throw new Error('No more bindings available');
    
    return options[bindings.length];
}

function resetBindings() {
    for (let i = 0; i < bindings.length; i++) {
        let binding = bindings[i];
        binding.el.remove();
        Mousetrap.unbind(binding.key);
    }
    Mousetrap.unbind('esc');
    bindings = [];
}