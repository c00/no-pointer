//Temporary Bindings
let bindings = [];
let links = null;
let inputs = null;

init();

function init() {
    //Root html element to put stuff in
    $('body').append(`<div id="no-pointer-container"></div>`)
    
    // Binding for clicking links
    Mousetrap.bind(['command+shift+a', 'ctrl+shift+a'], function(e) {
        resetBindings();
        
        //bind escape to cancel
        Mousetrap.bind('esc', resetBindings);
        $(window).one('scroll', resetBindings);
        $(window).one('click', resetBindings);

        
        prioritizeLinksAndButtons();
        bindLinksAndButtons();
        
        return false;
    });
        
    // Binding for ctrl clicking links
    Mousetrap.bind(['command+alt+a', 'ctrl+alt+a'], function(e) {
        resetBindings();
        
        //bind escape to cancel
        Mousetrap.bind('esc', function(){
            resetBindings();
        });
        
        //find all links
        $('a:visible, button:visible:enabled').each(function() {
            addBinding(this, true);
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
}

function bindLinksAndButtons(inNewTab) {
    //check visible and enabled
    for (let i = 0; i < links.length; i++) {
        link = links[i];
        $el = $(link.el);

        if ($el.is(':visible') && isElementInViewport(link.el)){
            addBinding(link.el, inNewTab);
        } 
    }

}

function prioritizeLinksAndButtons() {
    let unsorted = [];
    $('a, button').each(function() {        
        var fontSize = parseFloat( window.getComputedStyle(this, null).getPropertyValue('font-size'));

        let score = fontSize;

        unsorted.push({el: this, score: score});
    });

    //sort
    links = unsorted.sort(function(a, b) {
        if (a.score > b.score) return -1;
        if (a.score < b.score) return 1;
        return 0;
    });
}

function addBinding(el, inNewTab) {
    let $el = $(el);
    let key = getFreeBinding()
    
    bindKey(key, el, inNewTab);
    
    //Add the element
    let $linkEl = $(`<span class="npc-link">${key}</span>`);
    $('#no-pointer-container').append($linkEl);
    //position
    let position = $el.offset();
    let top = position.top + $el.outerHeight() - ($linkEl.height() / 1.5) - window.scrollY;
    $linkEl.css({top: top, left: position.left});
    
    //Add to bindings
    bindings.push({key: key, el: $linkEl});
}

function bindKey(key, el, inNewTab) {
    Mousetrap.bind(key, function(){
        $el = $(el);
        
        if ($el.is('button')){
            //button
            el.click();
        } else if ($el.is('a')){
            if (!inNewTab) {
                el.click();
            }else {
                //Link (new window)
                let link = $el.attr('href');
                window.open(link);            
            }
            
        } else if ($el.is('input')){
            //input
            el.focus();
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

// https://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport
function isElementInViewport (el) {
    //special bonus for those using jQuery
    if (typeof jQuery === "function" && el instanceof jQuery) {
        el = el[0];
    }
    
    var rect = el.getBoundingClientRect();
    
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}