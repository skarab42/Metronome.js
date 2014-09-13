// global AudioContext, automatically created if not provided
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

    /* @see line 95
    // basic drawing callback implementation
    draw : function(beats, bars) {
        console.log('beat:', beats, '/', bars);
    }
    */
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