(function (window) {
    //-------------------------------------------------------------------------
    // user interface utilities
    //-------------------------------------------------------------------------
    // ui globals
    var uid = 1;

    // create/return (DOM:jQuery) element
    function uiElement(type, id, cls) {
        return $('<' + type + '/>').attr('id', id).addClass(cls);
    }

    // create/return label element
    function uiLabelElement(id, cls) {
        return uiElement('label', id + 'Label', cls).attr('for', id + 'Input');
    }

    // create/return range input element
    function uiInputElement(id, cls, type) {
        return uiElement('input', id + 'Input', cls).attr('type', type);
    }

    // create/return range input element
    function uiInputNumberElement(id, cls, min, max, value) {
        return uiInputElement(id, cls, 'number').attr({
            min   : min,
            max   : max,
            value : value
        });
    }

    // create/return select element
    function uiSelectElement(id, cls) {
        return uiElement('select', id + 'Input', cls);
    }

    // create/return metronome panel
    function uiMetronomePanel() {
        // unique id
        var id = 'metronome_' + uid++;

        // jQuery objects
        var ui = {};

        ui.panel        = uiElement('div', id, 'panel');
        ui.title        = uiElement('h4', id + '_title', 'title');
        ui.tempoLabel   = uiLabelElement(id + '_tempo', 'tempoLabel');
        ui.tempoInput   = uiInputNumberElement(id + '_tempo', 'tempoInput', 20, 240, 90);
        ui.tsLabel      = uiLabelElement(id + '_timeSignature', 'timeSignatureLabel');
        ui.tsSelect     = uiSelectElement(id + '_timeSignature', 'timeSignatureInput');
        ui.playButton   = uiElement('button', id + '_playButton', 'playButton');
        ui.stopButton   = uiElement('button', id + '_stopButton', 'stopButton');
        ui.resetButton  = uiElement('button', id + '_resetButton', 'resetButton');
        ui.counters     = uiElement('span', id + '_counters', 'counters');
        ui.beatsCounter = uiElement('span', id + '_beatsCounter', 'beatsCounter');
        ui.barsCounter  = uiElement('span', id + '_barsCounter', 'barsCounter');

        // title
        ui.title.html('metronome #' + (uid - 1));

        // tempo
        ui.tempoLabel.append('tempo');
        ui.tempoLabel.append(ui.tempoInput);
        
        // time signatures
        ui.tsLabel.append('time signature');

        var bars  = [1, 2, 3, 4, 5];
        var notes = [1, 2, 4, 8, 16];
        
        for (var i in bars) {
            for (var j in notes) {
                var signature = $('<option />');
                var value = bars[i] + '/' + notes[j];
                signature.attr('selected', value == '4/4' ? true : false)
                    .html(value).val(value);
                ui.tsSelect.append(signature);
            }
        }

        ui.tsLabel.append(ui.tsSelect);

        // buttons
        ui.playButton.html('play');
        ui.stopButton.html('stop');
        ui.resetButton.html('reset');

        // counters
        ui.beatsCounter.html('0');
        ui.barsCounter.html('0');
        ui.counters.append(' beats : ');
        ui.counters.append(ui.beatsCounter);
        ui.counters.append(' - bars : ');
        ui.counters.append(ui.barsCounter);

        // appends
        ui.panel.append(ui.title);
        ui.panel.append(ui.tempoLabel);
        ui.panel.append(ui.tsLabel);
        ui.panel.append(ui.playButton);
        ui.panel.append(ui.stopButton);
        ui.panel.append(ui.resetButton);
        ui.panel.append(ui.counters);

        // return panel
        return ui;
    }

    //-------------------------------------------------------------------------
    // ui events
    //-------------------------------------------------------------------------
    function addMetronomeEvents(metronome, ui) {    
        ui.tempoInput.on('input', function() {
            metronome.tempo(ui.tempoInput.val());
        });

        ui.tsSelect.on('change', function() {
            metronome.timeSignature(ui.tsSelect.val());
        });

        ui.playButton.on('click', function() {
            if (metronome.isPlaying()) {
                metronome.pause();
                ui.playButton.html('resume');
            }
            else {
                metronome.play();
                ui.playButton.html('pause');
            }
        });

        ui.stopButton.on('click', function() {
            metronome.stop();
            ui.beatsCounter.html('0');
            ui.barsCounter.html('0');
            ui.playButton.html('play');
        });

        ui.resetButton.on('click', function() {
            metronome.reset();

            if (! metronome.isPlaying()) {
                ui.playButton.html('play');
            }
        });
    }

    //-------------------------------------------------------------------------
    // requestAnimFrame fallback
    //-------------------------------------------------------------------------
    window.requestAnimFrame = (function() {
        return  window.requestAnimationFrame       ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame    ||
                function(callback, element) {
                    window.setTimeout(callback, 1000 / 60);
                };
    })();

    //-------------------------------------------------------------------------
    // basic drawing callback function
    //-------------------------------------------------------------------------
    function draw(ui, beats, bars) {
        requestAnimFrame(function() 
        {
            ui.beatsCounter.html(beats);
            ui.barsCounter.html(bars);
        });
    }

    //-------------------------------------------------------------------------
    // basic sheduler callback implementation (beat number, beat time)
    //-------------------------------------------------------------------------
    function sheduler(beats, time) { 
        var o = audioContext.createOscillator();
        o.frequency.value = beats == 1 ? 440 : 220;
        o.connect(audioContext.destination);
        o.start(time);
        o.stop(time + 0.05);
    }

    //-------------------------------------------------------------------------
    // user interface creation
    //-------------------------------------------------------------------------
    // main div to append elements
    var mainDiv = $('#main');

    // metronome panels creation
    var metronomePanel_1 = uiMetronomePanel();
    var metronomePanel_2 = uiMetronomePanel();

    // append to main div
    mainDiv.append(metronomePanel_1.panel);
    mainDiv.append(metronomePanel_2.panel);

    // global AudioContext
    var audioContext = new window.AudioContext();

    // metronome instances
    var metronome_1 = new Metronome({
        sheduler : sheduler,
        draw : function(beats, bars) {
            draw(metronomePanel_1, beats, bars)
        }
    });

    var metronome_2 = new Metronome({
        sheduler : sheduler,
        draw : function(beats, bars) {
            draw(metronomePanel_2, beats, bars)
        }
    });

    // add metronomes events
    addMetronomeEvents(metronome_1, metronomePanel_1);
    addMetronomeEvents(metronome_2, metronomePanel_2);

})(this);


/*// global AudioContext, automatically created if not provided
var audioContext = new window.AudioContext();

// metronome instance
var metronome = new Metronome({
    timeSignature : '4/4',                    // time signature, default: 4/4
    tempo         : 90,                       // min:20, max:240, default: 90
    timeout       : 25,                       // How frequently to call scheduler (ms), default: 25
    lookahead     : 0.1,                      // How far ahead to schedule audio (sec), default: 0.1
    context       : audioContext,             // for internal time managment
    workerURI     : 'js/metronome/worker.js', // timer worker URI
    
    // basic sheduler callback implementation (beat number, beat time)
    sheduler : function(beats, time) { 
        var o = audioContext.createOscillator();
        o.frequency.value = beats == 1 ? 440 : 220;
        o.connect(audioContext.destination);
        o.start(time);
        o.stop(time + 0.05);
    }
});

// user interface
var tempoInput    = $('#tempo');
var timeSignature = $('#timeSignature');
var playButton    = $('#playButton');
var stopButton    = $('#stopButton');
var resetButton   = $('#resetButton');
var beatsCounter  = $('#beatsCounter');
var barsCounter   = $('#barsCounter');

var bars  = [1, 2, 3, 4, 5];
var notes = [1, 2, 4, 8, 16];

for (var i in bars) {
    for (var j in notes) {
        var signature = $('<option />');
        var value = bars[i] + '/' + notes[j];
        signature.attr('selected', value == '4/4' ? true : false)
            .html(value).val(value);
        timeSignature.append(signature);
    }
}

tempoInput.on('input', function() {
    metronome.tempo(tempoInput.val());
});

timeSignature.on('change', function() {
    metronome.timeSignature(timeSignature.val());
});

playButton.on('click', function() {
    if (metronome.isPlaying()) {
        metronome.pause();
        playButton.html('resume');
    }
    else {
        metronome.play();
        playButton.html('pause');
    }
});

stopButton.on('click', function() {
    metronome.stop();
    beatsCounter.html('0');
    barsCounter.html('0');
    playButton.html('play');
});

resetButton.on('click', function() {
    metronome.reset();

    if (! metronome.isPlaying()) {
        playButton.html('play');
    }
});

window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            function(callback, element){
                window.setTimeout(callback, 1000 / 60);
            };
})();

metronome.draw = function(beats, bars) {
    requestAnimFrame(function() 
    {
        beatsCounter.html(beats);
        barsCounter.html(bars);
    });
}

console.log(metronome);
*/