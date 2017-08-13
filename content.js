//Temporary Bindings
let possibleBindings = '1234567890qwertyuiopasdfghjklzxcvbnm';
let bindings = [];
let links = null;
let inputs = null;
let page = 0;

let inputSelector = 'input:visible, select:visible, textarea, [contenteditable]';

init();

function init() {
    //Root html element to put stuff in
    $('body').append(`<div id="no-pointer-container"></div>`)
    
    // Binding for clicking links
    Mousetrap.bind(['command+shift+a', 'ctrl+shift+a'], function(e) {
        resetBindings(true);
        
        //bind escape to cancel
        Mousetrap.bind('esc', resetBindings);
        $(window).one('scroll click resize', resetBindings);
        
        prioritizeLinksAndButtons();
        bindLinksAndButtons();
        
        return false;
    });
        
    // Binding for ctrl clicking links
    Mousetrap.bind(['command+alt+a', 'ctrl+alt+a'], function(e) {
        resetBindings(true);
        
        //bind escape to cancel
        Mousetrap.bind('esc', function(){
            resetBindings();
        });
        
        prioritizeLinksAndButtons();
        bindLinksAndButtons(true);
        
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
        $(inputSelector).each(function() {
            if (isElementInViewport(this)) addBinding(this);
        });
        
        return false;
    });

    //Also do things in forms
     Mousetrap.prototype.stopCallback = function () {
        return false;
    } 
}

function bindLinksAndButtons(inNewTab) {
    //Determine start and end
    let start = page * possibleBindings.length;
    if (links.length < start) {
        start = 0;
        page = 0;
    }
    let end = start + possibleBindings.length;
    if (links.length <= end) end = links.length -1;
    
    let bindingCounter = 0;
    for (let i = start; i < links.length; i++) {
        link = links[i];
        $el = $(link.el);

        //check visible
        if ($el.is(':visible') && isElementInViewport(link.el)){
            addBinding(link.el, inNewTab);
            bindingCounter++;
        } 

        if (bindingCounter >= possibleBindings.length) break;        
    }

    page++;
}

function prioritizeLinksAndButtons() {
    let unsorted = [];
    $('a, button').each(function() {        
        let style = window.getComputedStyle(this, null);

        let fontSize = parseFloat(style.getPropertyValue('font-size'));
        let bold = style.getPropertyValue('font-weight');

        let score = fontSize;
        if (bold == 'bold') score += 3;

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
            
        } else if ($el.is(inputSelector) ) {
            //input / select / text area
            console.log('input');
            el.focus();
        }
        
        resetBindings();
        
        return false;
    });
}

function getFreeBinding() {

    if (bindings.length === possibleBindings.length) throw new Error('No more bindings available');
    
    return possibleBindings[bindings.length];
}

function resetBindings(keepPage) {
    for (let i = 0; i < bindings.length; i++) {
        let binding = bindings[i];
        binding.el.remove();
        Mousetrap.unbind(binding.key);
    }
    Mousetrap.unbind('esc');
    bindings = [];
    if (keepPage !== true) page = 0;
}

// https://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport
function isElementInViewport (el) {
    //special bonus for those using jQuery
    if (typeof jQuery === "function" && el instanceof jQuery) {
        el = el[0];
    }

    //check display (needed for textarea)
    let style = window.getComputedStyle(el, null);
    let display = style.getPropertyValue('display');
    if (display === 'none') return false;
    
    var rect = el.getBoundingClientRect();
    
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}