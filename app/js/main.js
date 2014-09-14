(function (window) {
    //-------------------------------------------------------------------------
    // user interface utilities
    //-------------------------------------------------------------------------
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

    // ui events
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
            ui.beats.html('0');
            ui.bars.html('0');
            ui.playButton.html('play');
            ui.panel.removeClass('highlight firstBeat');
        });

        ui.resetButton.on('click', function() {
            metronome.reset();

            if (! metronome.isPlaying()) {
                ui.playButton.html('play');
            }
        });
    }

    // panels cache
    var panels = {};

    // create/return metronome panel
    function uiMetronomePanel(metronome) {
        // unique id
        var id = 'metronome_' + metronome.id();

        // jQuery objects
        var ui = {};

        ui.panel        = uiElement('div', id, 'panel');
        ui.title        = uiElement('h4', id + '_title', 'title');
        ui.tempoLabel   = uiLabelElement(id + '_tempo', 'tempoLabel');
        ui.tempoInput   = uiInputNumberElement(id + '_tempo', 'tempoInput', 20, 240, 90);
        ui.tsLabel      = uiLabelElement(id + '_timeSignature', 'timeSignatureLabel');
        ui.tsSelect     = uiSelectElement(id + '_timeSignature', 'timeSignatureInput');
        ui.controls     = uiElement('span', id + '_controls', 'controls');
        ui.playButton   = uiElement('button', id + '_playButton', 'playButton');
        ui.stopButton   = uiElement('button', id + '_stopButton', 'stopButton');
        ui.resetButton  = uiElement('button', id + '_resetButton', 'resetButton');
        ui.counters     = uiElement('span', id + '_counters', 'counters');
        ui.beatsCounter = uiElement('span', id + '_beatsCounter', 'beatsCounter');
        ui.beats        = uiElement('span', id + '_beats', 'beats');
        ui.barsCounter  = uiElement('span', id + '_barsCounter', 'barsCounter');
        ui.bars         = uiElement('span', id + '_bars', 'bars');
        ui.light        = uiElement('span', id + '_light', 'light');

        // title
        ui.title.html('metronome #' + metronome.id());

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

        // add metronomes events
        addMetronomeEvents(metronome, ui);

        // controls
        ui.playButton.html('play');
        ui.stopButton.html('stop');
        ui.resetButton.html('reset');
        ui.controls.append(ui.playButton);
        ui.controls.append(ui.stopButton);
        ui.controls.append(ui.resetButton);

        // counters
        ui.beats.html('0');
        ui.bars.html('0');
        ui.counters.append(ui.light);
        ui.beatsCounter.append('beats : ', ui.beats);
        ui.counters.append(ui.beatsCounter);
        ui.barsCounter.append('bars : ', ui.bars);
        ui.counters.append(ui.barsCounter);

        // appends
        ui.panel.append(ui.title);
        ui.panel.append(ui.tempoLabel);
        ui.panel.append(ui.tsLabel);
        ui.panel.append(ui.controls);
        ui.panel.append(ui.counters);

        // push panel in cache
        panels[id] = ui;
        
        // return panel
        return ui;
    }

    // get metronome panel
    function uiGetMetronomePanel(metronome) {
        return panels['metronome_' + metronome.id()];
    }

    // create/return metronome panel
    function uiSyncPanel() {
        // jQuery objects
        var ui = {};

        ui.panel        = uiElement('div', 'sync', 'panel');
        ui.title        = uiElement('h4', 'syncTitle', 'title');
        ui.syncButton_1 = uiElement('button', 'syncButton_1', 'syncButton');
        ui.syncButton_2 = uiElement('button', 'syncButton_1', 'syncButton');
        ui.syncButton_3 = uiElement('button', 'syncButton_3', 'syncButton');
        ui.syncButton_4 = uiElement('button', 'syncButton_4', 'syncButton');

        // title
        ui.title.html('metronome syncronization');
        
        // sync button text
        ui.syncButton_1.html('Sync [metronome #1] with [metronome #2]<br />Next beat');
        ui.syncButton_2.html('Sync [metronome #2] with [metronome #1]<br />Next beat');
        ui.syncButton_3.html('Sync [metronome #1] with [metronome #2]<br />Next beat + tempo + time signature');
        ui.syncButton_4.html('Sync [metronome #2] with [metronome #1]<br />Next beat + tempo + time signature');

        // buttons event
        ui.syncButton_1.on('click', function() {
            metronome_1.sync(metronome_2, true);
        });

        ui.syncButton_2.on('click', function() {
            metronome_2.sync(metronome_1, true);
        });

        ui.syncButton_3.on('click', function() {
            metronome_1.sync(metronome_2, false); // default
        });

        ui.syncButton_4.on('click', function() {
            metronome_2.sync(metronome_1, false); // default
        });

        // appends
        ui.panel.append(ui.title);
        ui.panel.append(ui.syncButton_1);
        ui.panel.append(ui.syncButton_2);
        ui.panel.append('<br />');
        ui.panel.append(ui.syncButton_3);
        ui.panel.append(ui.syncButton_4);

        // return panel
        return ui;
    }

    // create/return metronome panel
    function uiClonePanel() {
        // jQuery objects
        var ui = {};

        ui.panel         = uiElement('div', 'clone', 'panel');
        ui.title         = uiElement('h4', 'cloneTitle', 'title');
        ui.cloneButton_1 = uiElement('button', 'cloneButton_1', 'cloneButton');
        ui.cloneButton_2 = uiElement('button', 'cloneButton_2', 'cloneButton');

        // title
        ui.title.html('metronome cloning');
        
        // clone button text
        ui.cloneButton_1.html('Clone [metronome #1] into [metronome #2]<br />All parameters');
        ui.cloneButton_2.html('Clone [metronome #2] into [metronome #1]<br />All parameters');

        // buttons event
        ui.cloneButton_1.on('click', function() {
            metronome_1.clone(metronome_2);
        });

        ui.cloneButton_2.on('click', function() {
            metronome_2.clone(metronome_1);
        });

        // appends
        ui.panel.append(ui.title);
        ui.panel.append(ui.cloneButton_1);
        ui.panel.append(ui.cloneButton_2);

        // return panel
        return ui;
    }

    // create/return metronome panel
    function uiUnsyncPanel() {
        // jQuery objects
        var ui = {};

        ui.panel          = uiElement('div', 'unsync', 'panel');
        ui.title          = uiElement('h4', 'unsyncTitle', 'title');
        ui.unsyncButton_1 = uiElement('button', 'unsyncButton_1', 'unsyncButton');
        ui.unsyncButton_2 = uiElement('button', 'unsyncButton_2', 'unsyncButton');
        ui.unsyncButton_3 = uiElement('button', 'unsyncButton_3', 'unsyncButton');

        // title
        ui.title.html('metronome unsync');
        
        // unsync button text
        ui.unsyncButton_1.html('Unsync [metronome #1] from [metronome #2]');
        ui.unsyncButton_2.html('Unsync [metronome #2] from [metronome #1]');
        ui.unsyncButton_3.html('Unlink all metronome syncronization');

        // buttons event
        ui.unsyncButton_1.on('click', function() {
            metronome_1.sync(null);
        });

        ui.unsyncButton_2.on('click', function() {
            metronome_2.sync(null);
        });

        ui.unsyncButton_3.on('click', function() {
            metronome_1.sync(null);
            metronome_2.sync(null);
        });

        // appends
        ui.panel.append(ui.title);
        ui.panel.append(ui.unsyncButton_1);
        ui.panel.append(ui.unsyncButton_2);
        ui.panel.append('<br />');
        ui.panel.append(ui.unsyncButton_3);

        // return panel
        return ui;
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
            // update beats and bars counters
            ui.beats.html(beats);
            ui.bars.html(bars);
            
            // highlight
            ui.panel.addClass('highlight');
            
            // first beat ?
            if (beats == 1) {
                ui.panel.addClass('firstBeat');
            }
            else {
                ui.panel.removeClass('firstBeat');
            }

            // remove class after 100ms
            setTimeout(function() {
                ui.panel.removeClass('highlight firstBeat');
            }, 100);
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
    // external sounds managment
    //-------------------------------------------------------------------------
    // load sound file
    function loadSound(uri, callback) {
        var request = new XMLHttpRequest();
        request.responseType = 'arraybuffer';
        request.open('GET', uri, true); 
        request.onload = function() {
            audioContext.decodeAudioData(request.response, function(buffer) {
                callback(buffer);
            });
        };
        request.send();
    }

    // shedule/play AudioBuffer at time
    function playBuffer(buffer, time) {
        source = audioContext.createBufferSource();
        source.buffer = buffer; 
        source.connect(audioContext.destination);
        source.start(time);
    }

    //-------------------------------------------------------------------------
    // user interface creation
    //-------------------------------------------------------------------------
    // global AudioContext
    var audioContext = new window.AudioContext();

    // metronome 1
    var metronome_1 = new Metronome({
        sheduler : sheduler,
        draw : function(beats, bars) {
            draw(metronomePanel_1, beats, bars)
        }
    });

    // metronome 2 tick/tack sounds
    var tick = null;
    var tack = null;
    
    // load tick/tack sounds
    loadSound('wav/tick.wav', function(data){ tick = data; });
    loadSound('wav/tack.wav', function(data){ tack = data; });

    // metronome 2
    var metronome_2 = new Metronome({
        sheduler : function(beats, time) {
            playBuffer(beats == 1 ? tack : tick, time);
        },
        draw : function(beats, bars) {
            draw(metronomePanel_2, beats, bars)
        }
    });

    // main div to append elements
    var mainDiv = $('#main');

    // metronome panels creation
    var metronomePanel_1 = uiMetronomePanel(metronome_1);
    var metronomePanel_2 = uiMetronomePanel(metronome_2);

    // sync and clone panel creation
    var syncPanel   = uiSyncPanel();
    var clonePanel  = uiClonePanel();
    var unsyncPanel = uiUnsyncPanel();

    // append panel to main div
    mainDiv.append(metronomePanel_1.panel);
    mainDiv.append(metronomePanel_2.panel);
    mainDiv.append(syncPanel.panel);
    mainDiv.append(clonePanel.panel);
    mainDiv.append(unsyncPanel.panel);

    // global events
    window.addEventListener('metronome:tempoChange', function(e) {
        var metronome = e.detail.metronome;
        var panel     = uiGetMetronomePanel(metronome);

        panel.tempoInput.val(e.detail.newValue);
    }, false);

    window.addEventListener('metronome:timeSignatureChange', function(e) {
        var metronome = e.detail.metronome;
        var panel     = uiGetMetronomePanel(metronome);

        // selected or not
        panel.tsSelect.find('option').each(function(i, option) {
            var selected = option.value == e.detail.newValue;
            $(option).attr('selected', selected ? true : false);
        })

    }, false);

})(this);