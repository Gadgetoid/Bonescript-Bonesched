var b = require('bonescript'),
    s = require('./bonesched.js')
    ledPin = ["USR3","USR2","USR1","USR0"]; 

s.Setup(
    function() {
        
        // Set each LED pin to OUTPUT
        s.forEach(ledPin,function(idx,pin){b.pinMode(pin,b.OUTPUT)});
        // Set each LED state to LOW
        s.forEach(ledPin,function(idx,pin){b.digitalWrite(pin,b.LOW)});
        
        // Define an action once
        var toggleLed = function(t,d,l,state){
            state.state = (state.state == b.LOW) ? b.HIGH : b.LOW;
            b.digitalWrite(state.pin,state.state);
        };
        var switchPin = function(t,d,l,state){
            b.digitalWrite(state.pin,state.state);
        };
        
        // And schedule it up multiple times with different state information!
        s.scheduleIn(toggleLed,{state:b.HIGH,pin:ledPin[0]},1000,s.REPEAT);
        s.scheduleIn(toggleLed,{state:b.HIGH,pin:ledPin[1]},2000,s.REPEAT);
        s.scheduleIn(toggleLed,{state:b.HIGH,pin:ledPin[2]},4000,s.REPEAT);
        s.scheduleIn(toggleLed,{state:b.HIGH,pin:ledPin[3]},8000,s.REPEAT);
        
        // If you want to blink LEDs in order you need to get cleverer
        var marchLed = function(t,d,l,state){
            var c = state.current_led;
            
            state.states[c] = (state.states[c] == b.LOW) ? b.HIGH : b.LOW;
            
            b.digitalWrite(state.leds[c],state.states[c]);
            
            state.current_led++;
            if(state.current_led>=state.leds.length){
                state.current_led=0;
            }
        }
        
        //s.schedule(marchLed,{current_led:0,leds:ledPin,states:[b.LOW,b.LOW,b.LOW,b.LOW]},500,s.REPEAT);
        
        // Or, just use a queue!
        /*new s.Queue(100)
            .add(s.pinSet,{state:b.HIGH,pin:ledPin[0]})
            .add(s.pinSet,{state:b.LOW ,pin:ledPin[0]})
            .add(s.pinSet,{state:b.HIGH,pin:ledPin[1]})
            .add(s.pinSet,{state:b.LOW ,pin:ledPin[1]})
            .add(s.pinSet,{state:b.HIGH,pin:ledPin[2]})
            .add(s.pinSet,{state:b.LOW ,pin:ledPin[2]})
            .add(s.pinSet,{state:b.HIGH,pin:ledPin[3]})
            .add(s.pinSet,{state:b.LOW ,pin:ledPin[3]})
            .run();
        */
    }
);

s.Loop(
    function(t,d,l) {
        // Put looped, unscheduled code here
    }
);

s.run(b);